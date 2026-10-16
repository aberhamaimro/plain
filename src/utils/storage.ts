import { DocumentAnalysis, HistoryItem } from '../types';
import { PRICING_CONFIG } from '../config/pricing';

const HISTORY_KEY = 'plain_document_history_v1';
const CREDITS_KEY = 'plain_user_credits_v1';
const UNLIMITED_PASS_KEY = 'plain_unlimited_pass_v1';

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading document history from localStorage:', err);
    return [];
  }
}

export function saveAnalysisToHistory(
  analysis: DocumentAnalysis,
  meta: { fileName?: string; language: string }
): HistoryItem {
  const history = getHistory();
  const newItem: HistoryItem = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    document_type: analysis.document_type || 'General Document',
    one_sentence_summary: analysis.one_sentence_summary || 'Analysis summary',
    urgency_level: analysis.urgency_level || 'medium',
    fileName: meta.fileName,
    language: meta.language,
    analysis,
  };

  // Keep newest first, max 30 items
  const updated = [newItem, ...history.filter((h) => h.id !== newItem.id)].slice(0, 30);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving document to localStorage:', err);
  }

  return newItem;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting document from localStorage:', err);
  }
  return updated;
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Error clearing history:', err);
  }
}

export function hasUnlimitedPass(): boolean {
  try {
    return localStorage.getItem(UNLIMITED_PASS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setUnlimitedPass(active: boolean): void {
  try {
    if (active) {
      localStorage.setItem(UNLIMITED_PASS_KEY, 'true');
    } else {
      localStorage.removeItem(UNLIMITED_PASS_KEY);
    }
  } catch (err) {
    console.error('Error updating unlimited pass:', err);
  }
}

export function getRemainingCredits(): number {
  if (hasUnlimitedPass()) return 999;
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    if (raw === null) {
      // First time user: initialize with default free credit
      localStorage.setItem(CREDITS_KEY, String(PRICING_CONFIG.freeCredits));
      return PRICING_CONFIG.freeCredits;
    }
    const val = parseInt(raw, 10);
    return isNaN(val) ? 0 : val;
  } catch {
    return 0;
  }
}

export function useCredit(): boolean {
  if (hasUnlimitedPass()) return true;
  const current = getRemainingCredits();
  if (current <= 0) return false;
  try {
    localStorage.setItem(CREDITS_KEY, String(current - 1));
  } catch (err) {
    console.error('Error updating credits:', err);
  }
  return true;
}

export function addCredits(amount: number): number {
  const current = getRemainingCredits();
  const next = (hasUnlimitedPass() ? 0 : current) + amount;
  try {
    localStorage.setItem(CREDITS_KEY, String(next));
  } catch (err) {
    console.error('Error adding credits:', err);
  }
  return next;
}

export function resetCreditsForTesting(): void {
  try {
    localStorage.setItem(CREDITS_KEY, String(PRICING_CONFIG.freeCredits));
    localStorage.removeItem(UNLIMITED_PASS_KEY);
  } catch (err) {
    console.error('Error resetting credits:', err);
  }
}
