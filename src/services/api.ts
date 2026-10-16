import { DocumentAnalysis } from '../types';

export interface AnalyzePayload {
  text?: string;
  fileData?: string;
  mimeType?: string;
  fileName?: string;
  language?: string;
}

export interface DraftReplyPayload {
  analysis: DocumentAnalysis;
  intent: 'dispute' | 'clarification' | 'extension' | 'negotiation' | 'custom';
  tone: 'polite' | 'firm' | 'formal';
  language?: string;
  senderName?: string;
  recipientName?: string;
  userInstructions?: string;
}

export interface DraftReplyResult {
  subject: string;
  letter: string;
  tips: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FollowUpPayload {
  message: string;
  history: ChatMessage[];
  analysis: DocumentAnalysis;
  language?: string;
}

/**
 * Primary document analysis endpoint.
 * Sends document to Express backend /api/analyze (never interacts with Gemini directly).
 */
export async function analyzeDocumentApi(payload: AnalyzePayload): Promise<DocumentAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to analyze document. Please check the clarity and try again.');
  }

  return json.data as DocumentAnalysis;
}

/**
 * Follow-up document chat endpoint.
 * Passes only analysis JSON and user question to /api/followup (document is NOT re-uploaded).
 */
export async function askFollowUpApi(payload: FollowUpPayload): Promise<string> {
  const response = await fetch('/api/followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysis: payload.analysis,
      question: payload.message,
      history: payload.history,
      language: payload.language,
    }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to get answer.');
  }

  return json.answer as string;
}

/**
 * Drafts formal response correspondence via Express backend.
 */
export async function draftReplyApi(payload: DraftReplyPayload): Promise<DraftReplyResult> {
  const response = await fetch('/api/draft-reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate drafted letter.');
  }

  return json.data as DraftReplyResult;
}
