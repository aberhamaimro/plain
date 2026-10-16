import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables securely from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);

// Validate GEMINI_API_KEY presence without logging its value
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn('[SECURITY] Warning: GEMINI_API_KEY environment variable is not set. Gemini API requests will fail.');
}

// Initialize server-side Gemini SDK securely
const ai = new GoogleGenAI({
  apiKey: geminiApiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();

// Disable x-powered-by header for security hardening
app.disable('x-powered-by');

// Enforce max request payload size of 10 MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// RATE LIMITING PROTECTION: 10 requests per minute per IP
// ============================================================================
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 3 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 60000);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(ip);
    }
  }
}, 180000);

function rateLimiter(limit = 10, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract client IP safely (supports proxies / Cloud Run X-Forwarded-For)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown-client';

    const now = Date.now();
    let record = rateLimitMap.get(ip);
    if (!record) {
      record = { timestamps: [] };
      rateLimitMap.set(ip, record);
    }

    // Filter to current window
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    if (record.timestamps.length >= limit) {
      return res.status(429).json({
        error: 'Too many requests. Plain is limited to 10 document requests per minute per user. Please wait a moment before trying again.',
      });
    }

    record.timestamps.push(now);
    next();
  };
}

// ============================================================================
// REQUEST TIMEOUT PROTECTION: 45 seconds maximum per request
// ============================================================================
function requestTimeout(seconds = 45) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          error: 'Document analysis request timed out. Please try again with a clearer or smaller document.',
        });
      }
    }, seconds * 1000);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };
}

// Apply rate limiting and timeout to all /api routes
app.use('/api', rateLimiter(10, 60000));
app.use('/api', requestTimeout(45));

// ============================================================================
// DOCUMENT ANALYSIS JSON SCHEMA
// ============================================================================
const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    document_type: {
      type: Type.STRING,
      description: 'Specific category, e.g. Hospital Bill, Apartment Lease, IRS Notice, Insurance Explanation of Benefits, Debt Collection Notice, Employment Offer.',
    },
    is_emergency: {
      type: Type.BOOLEAN,
      description: 'True if there is an imminent eviction, court summons, immediate utility shutoff, or critical emergency legal/medical deadline within days.',
    },
    emergency_advice: {
      type: Type.STRING,
      description: 'Clear, direct instructions if is_emergency is true (e.g. contact tenant union, legal aid, or emergency dispute line). Null or empty if not emergency.',
    },
    urgency_level: {
      type: Type.STRING,
      description: 'One of: critical, high, medium, low, informational. Based on nearest deadline and severity of red flags.',
    },
    one_sentence_summary: {
      type: Type.STRING,
      description: 'Plain language, 8th-grade reading level summary under 28 words explaining what this document is and what is requested of the reader.',
    },
    key_facts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
        },
        required: ['label', 'value'],
      },
      description: 'Important factual details: amounts, dates, issuing party, recipient, account numbers (masked except last 4 digits).',
    },
    deadlines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: 'Explicit date or timeframe, e.g. "November 24, 2026" or "Within 30 days of receipt"' },
          action_required: { type: Type.STRING, description: 'What must be done by this date' },
          consequence_if_missed: { type: Type.STRING, description: 'Specific penalty, fee, referral to collections, or default judgment if ignored' },
        },
        required: ['date', 'action_required', 'consequence_if_missed'],
      },
      description: 'All upcoming dates, payment due dates, response deadlines, and dispute windows.',
    },
    money: {
      type: Type.OBJECT,
      properties: {
        total_owed: { type: Type.STRING, description: 'Total amount owed or net figure, formatted with currency (e.g. "$1,842.50" or "$0.00")' },
        breakdown: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key itemized charges, fees, deposits, or credits in clear language.',
        },
        possible_errors_or_unusual_charges: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Fishy items, duplicate billings, unexpected facility fees, penalties, or unitemized charges that should be questioned.',
        },
      },
      required: ['total_owed', 'breakdown', 'possible_errors_or_unusual_charges'],
    },
    red_flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clause_or_item: { type: Type.STRING, description: 'The problematic clause, fine print, or rule.' },
          why_it_matters: { type: Type.STRING, description: 'Plain language explanation of how this hurts or binds the user.' },
          severity: { type: Type.STRING, description: 'low, medium, or high' },
        },
        required: ['clause_or_item', 'why_it_matters', 'severity'],
      },
      description: 'Risks, automatic renewal traps, arbitration waivers, unreasonable fees, or one-sided obligations.',
    },
    questions_to_ask: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Concrete, exact questions the user can copy and ask the sender or customer service.',
    },
    recommended_next_steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Ordered list of clear, practical steps to take next (e.g. Step 1: Request itemized bill, Step 2: Compare with insurance EOB).',
    },
    confidence_notes: {
      type: Type.STRING,
      description: 'Anything illegible, ambiguous, missing pages, or assumptions made.',
    },
    is_unreadable: {
      type: Type.BOOLEAN,
      description: 'Set to true ONLY if image is too blurry, too dark, heavily cut off, or completely incomprehensible to read.',
    },
    unreadable_reason: {
      type: Type.STRING,
      description: 'Explanation and helpful tip on retaking photo if is_unreadable is true, otherwise empty.',
    },
  },
  required: [
    'document_type',
    'is_emergency',
    'urgency_level',
    'one_sentence_summary',
    'key_facts',
    'deadlines',
    'money',
    'red_flags',
    'questions_to_ask',
    'recommended_next_steps',
    'confidence_notes',
    'is_unreadable',
  ],
};

// ============================================================================
// 1. POST /api/analyze (Primary Endpoint)
// Privacy by design: In-memory processing only. Never written to disk or logs.
// ============================================================================
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
  'text/plain',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

async function handleAnalyzeDocument(req: Request, res: Response) {
  try {
    // Accepts document as raw text, document object, or fileData
    const text = req.body.text || (typeof req.body.document === 'string' ? req.body.document : '');
    const fileData = req.body.fileData || req.body.document?.fileData;
    const rawMimeType = (req.body.mimeType || req.body.document?.mimeType || (text ? 'text/plain' : 'image/jpeg')).toLowerCase();
    const language = req.body.language || 'English';

    // Validate that either text or fileData is provided
    if (!text && !fileData) {
      return res.status(400).json({
        error: 'Please provide either a document file (photo/PDF) or text to analyze.',
      });
    }

    // Validate allowed types
    if (fileData) {
      if (!ALLOWED_MIME_TYPES.has(rawMimeType)) {
        return res.status(400).json({
          error: `Unsupported file type "${rawMimeType}". Plain accepts JPG, PNG, PDF, and plain text.`,
        });
      }

      // Check file size in memory
      const cleanedBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
      const byteLength = Buffer.byteLength(cleanedBase64, 'base64');
      if (byteLength > MAX_FILE_SIZE_BYTES) {
        return res.status(413).json({
          error: 'Document exceeds maximum size of 10 MB. Please upload a smaller file.',
        });
      }
    } else if (text) {
      const textBytes = Buffer.byteLength(text, 'utf8');
      if (textBytes > MAX_FILE_SIZE_BYTES) {
        return res.status(413).json({
          error: 'Document text exceeds maximum size of 10 MB.',
        });
      }
    }

    const systemInstruction = `You are "Plain", an expert, empathetic document analyst who specializes in breaking down confusing legal, financial, medical, and bureaucratic documents into simple, empowering plain language.
Your mission:
1. Translate all dense jargon into clear words an 8th grader can easily understand without losing legal accuracy.
2. Carefully detect fine print, hidden fees, automatic renewals, harsh dispute deadlines, and unreasonable clauses.
3. Mask any sensitive numbers (SSN, credit cards, full account numbers), showing only the last 4 digits (e.g. "Acct: ••••-4912").
4. If this is a legal or medical emergency (such as an eviction notice with a court date, a formal court summons/subpoena, a 48-hour utility shutoff, or immediate wage garnishment), set is_emergency to true and provide clear urgent guidance.
5. If the document is totally illegible, pitch dark, or too blurry to read, mark is_unreadable: true and describe how to get a clean photo.
6. CRITICAL LANGUAGE REQUIREMENT: You MUST provide all explanations, summaries, key facts, deadlines, red flags, questions, and next steps in the requested target language: "${language}". Keep names of parties or technical codes intact where useful, but explain everything else in "${language}".
7. Return strictly valid JSON adhering to the schema.`;

    const parts: any[] = [];

    // Multimodal in-memory processing only
    if (fileData) {
      const cleanedBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: rawMimeType === 'image/jpg' ? 'image/jpeg' : rawMimeType,
          data: cleanedBase64,
        },
      });
      parts.push({
        text: `Please analyze this document carefully. Target output language: ${language}.${text ? `\n\nAdditional text context provided:\n${text}` : ''}`,
      });
    } else {
      parts.push({
        text: `Please analyze the following document text carefully. Target output language: ${language}.\n\n--- DOCUMENT START ---\n${text}\n--- DOCUMENT END ---`,
      });
    }

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let responseText = '';

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: ANALYSIS_SCHEMA,
            temperature: 0.2,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!responseText) {
      const cleanErrMsg = lastError?.message || 'Document analysis service is temporarily busy. Please try again.';
      return res.status(503).json({ error: cleanErrMsg });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    // Return the clean JSON result (never includes API key or sensitive backend details)
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    return res.status(500).json({
      error: 'An unexpected error occurred while analyzing the document. Please try again.',
    });
  }
}

// Register primary and alias route
app.post('/api/analyze', handleAnalyzeDocument);
app.post('/api/analyze-document', handleAnalyzeDocument);

// ============================================================================
// 2. POST /api/followup
// Chat feature that accepts the analysis JSON plus user question (no file re-upload)
// ============================================================================
async function handleFollowUp(req: Request, res: Response) {
  try {
    const {
      analysis,
      question = req.body.message || '',
      history = [],
      language = 'English',
    } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Please provide a question to ask.' });
    }

    if (!analysis) {
      return res.status(400).json({ error: 'Document analysis context is required.' });
    }

    const systemInstruction = `You are Plain Assistant, a compassionate, hyper-clear guide helping someone understand a stressful or confusing document.
You have the document's structured analysis context:
Document Type: ${analysis?.document_type || 'Unknown'}
Summary: ${analysis?.one_sentence_summary || 'N/A'}
Key Facts: ${JSON.stringify(analysis?.key_facts || [])}
Deadlines: ${JSON.stringify(analysis?.deadlines || [])}
Money & Breakdown: ${JSON.stringify(analysis?.money || {})}
Red Flags: ${JSON.stringify(analysis?.red_flags || [])}
Questions: ${JSON.stringify(analysis?.questions_to_ask || [])}
Next Steps: ${JSON.stringify(analysis?.recommended_next_steps || [])}

Rules:
1. Answer the user's question directly in plain language (8th-grade level).
2. Answer in "${language}".
3. Always clarify you provide document explanation, not formal legal, medical, or licensed financial advice.
4. If they ask about rights or next steps, provide practical steps (e.g. requesting itemized bills, disputing via certified mail, contacting tenant unions).
5. Keep answers concise, warm, bulleted when helpful, and easy to read on mobile.`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: question.trim() }],
    });

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let answerText = '';
    let chatError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });
        if (response.text) {
          answerText = response.text;
          break;
        }
      } catch (err: any) {
        chatError = err;
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!answerText) {
      return res.status(503).json({
        error: chatError?.message || 'Chat assistant is temporarily unavailable. Please try again.',
      });
    }

    return res.json({ success: true, answer: answerText });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to process follow-up question. Please try again.',
    });
  }
}

// Register primary and alias route
app.post('/api/followup', handleFollowUp);
app.post('/api/chat', handleFollowUp);

// ============================================================================
// 3. POST /api/draft-reply
// Draft a polite/firm/formal response based on analysis
// ============================================================================
app.post('/api/draft-reply', async (req: Request, res: Response) => {
  try {
    const {
      analysis,
      intent = 'dispute',
      tone = 'polite',
      language = 'English',
      senderName = 'Account Holder',
      recipientName = 'Customer Support / Billing Department',
      userInstructions = '',
    } = req.body;

    if (!analysis) {
      return res.status(400).json({ error: 'Analysis data is required to draft a reply.' });
    }

    const systemInstruction = `You are a professional consumer advocate and correspondence writer for Plain.
Your job is to draft an effective, customized letter or email regarding a document analysis.
- Tone: ${tone} (Options: polite, firm, formal). Keep it professional, respectful, but assertive of consumer rights.
- Intent: ${intent} (e.g. dispute an incorrect charge, request an itemized breakdown/explanation, request a deadline extension or payment plan, or negotiate better terms).
- Output language: ${language}.
- Include relevant placeholders like [Date], [Account Number (Last 4)], [Signature], [Phone], [Email].
- Reference specific details from the document (like amounts, dates, or problematic clauses) to make it impactful.
- Return strictly JSON with:
  {
    "subject": "Clear email/letter subject line",
    "letter": "Full text of the letter or email with formatted paragraphs",
    "tips": ["Tip 1 on sending", "Tip 2 on proof of delivery"]
  }`;

    const prompt = `Document Details:
Document Type: ${analysis.document_type || 'Unknown'}
Summary: ${analysis.one_sentence_summary || ''}
Total Amount: ${analysis.money?.total_owed || 'N/A'}
Deadlines: ${JSON.stringify(analysis.deadlines || [])}
Red Flags / Issues: ${JSON.stringify(analysis.red_flags || [])}
Sender Name: ${senderName}
Recipient Name: ${recipientName}
User Extra Notes: ${userInstructions || 'None'}
Requested Intent: ${intent}
Requested Tone: ${tone}
Requested Language: ${language}

Draft the letter or email now.`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let parsed: any = null;
    let draftError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                letter: { type: Type.STRING },
                tips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['subject', 'letter', 'tips'],
            },
            temperature: 0.4,
          },
        });

        if (response.text) {
          try {
            parsed = JSON.parse(response.text);
            break;
          } catch {
            const clean = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(clean);
            break;
          }
        }
      } catch (err: any) {
        draftError = err;
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!parsed) {
      return res.status(503).json({
        error: draftError?.message || 'Failed to draft reply letter. Please try again.',
      });
    }

    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to draft reply letter. Please try again.',
    });
  }
});

// Health check endpoint for Cloud Run monitoring
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'plain-backend', hasKey: Boolean(process.env.GEMINI_API_KEY) });
});

// ============================================================================
// VITE DEV MIDDLEWARE / STATIC ASSETS SERVING
// ============================================================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Plain backend running securely on port ${port} (production: ${isProduction})`);
  });
}

startServer();
