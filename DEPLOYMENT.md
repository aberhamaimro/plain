# Deploying Plain to Google Cloud Run

This guide outlines how to deploy **Plain** to Google Cloud Run with production security safeguards, ensuring that the **Gemini API key is stored securely in Google Cloud Secret Manager and never exposed to the client or browser**.

---

## Architecture & Security Highlights

- **Server-Side Only Gemini Integration**: The Gemini SDK is executed solely on Node.js / Express (`server.ts`). The frontend bundle contains zero API keys or SDK imports.
- **Privacy by Design**: Documents (photos, PDFs, text) are processed strictly in memory and never written to disk or logged to files.
- **Request Protections**:
  - Maximum document size limit: **10 MB**.
  - Rate limiting: **10 requests per minute per IP**.
  - Request timeout: **45 seconds**.
  - Follow-up chat endpoint (`/api/followup`): Passes only structured analysis JSON and user questions, avoiding redundant document uploads.

---

## Prerequisites

1. [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and logged in:
   ```bash
   gcloud auth login
   ```
2. A Google Cloud project with billing enabled. Set your project ID:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
3. A Google Gemini API Key from Google AI Studio.

---

## Step 1: Enable Required GCP APIs

Enable the Cloud Run, Cloud Build, and Secret Manager APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

---

## Step 2: Store the Gemini API Key in Secret Manager

Store your `GEMINI_API_KEY` securely in Secret Manager so it is never hardcoded in source code or plain environment variables:

```bash
# 1. Create the secret
echo -n "YOUR_GEMINI_API_KEY_HERE" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --replication-policy="automatic"
```

Verify that the secret was created:
```bash
gcloud secrets list
```

---

## Step 3: Grant Cloud Run Access to the Secret

Cloud Run services run under a service account (by default, the Compute Engine default service account). Grant this service account the permission to read the secret:

```bash
# Find your project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')

# Grant the Secret Manager Secret Accessor role
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Step 4: Deploy Directly to Cloud Run Using Source Deploy

Google Cloud Run can automatically build and deploy the container using the provided `Dockerfile`:

```bash
gcloud run deploy plain-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### Explanation of Deployment Flags:
- `--source .`: Uses Cloud Build to build the container from our `Dockerfile`.
- `--region us-central1`: Specifies the Google Cloud region.
- `--allow-unauthenticated`: Makes the web app publicly accessible for your users.
- `--port 8080`: Standard Cloud Run listening port.
- `--memory 1Gi`: Provides ample in-memory space for processing 10 MB PDFs and images.
- `--set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest`: Injects the secret as an environment variable into the running container securely at runtime without exposing it in build logs or container manifests.

---

## Step 5: Verify Deployment & Health Check

Once deployment finishes, `gcloud` will output the live Cloud Run service URL, e.g.:
`https://plain-app-xxxxxxxxxx-uc.a.run.app`

### 1. Test the Health Check:
```bash
curl https://plain-app-xxxxxxxxxx-uc.a.run.app/api/health
```
Response:
```json
{
  "status": "ok",
  "service": "plain-backend",
  "hasKey": true
}
```

### 2. Test Document Analysis:
```bash
curl -X POST https://plain-app-xxxxxxxxxx-uc.a.run.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Notice of Balance Due: $150 owed by November 30, 2026.", "language": "English"}'
```

---

## Step 6: Updating Secrets & New Releases

### Updating the Gemini Key:
```bash
echo -n "NEW_API_KEY_HERE" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```
Cloud Run automatically picks up the latest version or you can redeploy.

### Redeploying Code Updates:
```bash
gcloud run deploy plain-app --source .
```
