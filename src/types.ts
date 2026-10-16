export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type RedFlagSeverity = 'low' | 'medium' | 'high';

export interface KeyFact {
  label: string;
  value: string;
}

export interface DeadlineItem {
  date: string;
  action_required: string;
  consequence_if_missed: string;
}

export interface MoneyBreakdown {
  total_owed: string;
  breakdown: string[];
  possible_errors_or_unusual_charges: string[];
}

export interface RedFlag {
  clause_or_item: string;
  why_it_matters: string;
  severity: RedFlagSeverity;
}

export interface DocumentAnalysis {
  document_type: string;
  is_emergency: boolean;
  emergency_advice?: string | null;
  urgency_level: UrgencyLevel;
  one_sentence_summary: string;
  key_facts: KeyFact[];
  deadlines: DeadlineItem[];
  money: MoneyBreakdown;
  red_flags: RedFlag[];
  questions_to_ask: string[];
  recommended_next_steps: string[];
  confidence_notes: string;
  is_unreadable?: boolean;
  unreadable_reason?: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  document_type: string;
  one_sentence_summary: string;
  urgency_level: UrgencyLevel;
  fileName?: string;
  language: string;
  analysis: DocumentAnalysis;
}

export interface LanguageOption {
  code: string;
  name: string;
  localName: string;
  flag: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  popular?: boolean;
  badge?: string;
  description: string;
  features: string[];
}
