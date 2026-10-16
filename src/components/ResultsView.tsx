import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Flag,
  HelpCircle,
  ListOrdered,
  FileText,
  Mail,
  Copy,
  Check,
  Share2,
  Printer,
  RotateCcw,
  ShieldCheck,
  AlertOctagon,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DocumentAnalysis, UrgencyLevel, RedFlagSeverity } from '../types';

interface ResultsViewProps {
  analysis: DocumentAnalysis;
  onOpenDraftModal: () => void;
  onReset: () => void;
  language: string;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  analysis,
  onOpenDraftModal,
  onReset,
  language,
}) => {
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return {
          label: 'Critical Urgency',
          colorClass: 'bg-rose-50 text-rose-800 border-rose-300',
          dotClass: 'bg-rose-500 animate-pulse',
        };
      case 'high':
        return {
          label: 'High Urgency',
          colorClass: 'bg-amber-50 text-amber-800 border-amber-300',
          dotClass: 'bg-amber-500 animate-pulse',
        };
      case 'medium':
        return {
          label: 'Medium Urgency',
          colorClass: 'bg-yellow-50 text-yellow-800 border-yellow-300',
          dotClass: 'bg-yellow-500',
        };
      case 'low':
        return {
          label: 'Low Urgency',
          colorClass: 'bg-teal-50 text-teal-800 border-teal-300',
          dotClass: 'bg-teal-500',
        };
      case 'informational':
      default:
        return {
          label: 'Informational',
          colorClass: 'bg-stone-100 text-stone-800 border-stone-300',
          dotClass: 'bg-stone-500',
        };
    }
  };

  const getRedFlagSeverityBadge = (severity: RedFlagSeverity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return {
          label: 'High Risk',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
          borderClass: 'border-l-4 border-rose-500',
        };
      case 'medium':
        return {
          label: 'Moderate Risk',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
          borderClass: 'border-l-4 border-amber-500',
        };
      case 'low':
      default:
        return {
          label: 'Notice / Low Risk',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          borderClass: 'border-l-4 border-blue-500',
        };
    }
  };

  const handleCopyQuestion = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  const handleCopySummary = () => {
    const textToCopy = `Document: ${analysis.document_type}\nSummary: ${analysis.one_sentence_summary}\nTotal Owed: ${analysis.money?.total_owed || 'N/A'}`;
    navigator.clipboard.writeText(textToCopy);
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  const urgency = getUrgencyBadge(analysis.urgency_level);

  // If document is illegible
  if (analysis.is_unreadable) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border border-amber-200 p-8 text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-stone-900">Unreadable Document Photo</h2>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              {analysis.unreadable_reason ||
                'The document photo is too blurry, too dark, or partially cut off. Plain requires clear text to ensure complete accuracy.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 max-w-md mx-auto text-left space-y-1">
            <p className="font-semibold text-stone-800">Tips for a good scan:</p>
            <ul className="list-disc list-inside space-y-0.5 text-stone-500">
              <li>Place the paper on a flat, well-lit surface</li>
              <li>Hold your camera steady and avoid glare or shadows</li>
              <li>Or upload a digital PDF / paste the document text</li>
            </ul>
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-800 text-white font-bold text-sm hover:bg-teal-700 transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again with Clearer Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Analyze Another Document</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            {summaryCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors hidden sm:inline-flex"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={onOpenDraftModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-700 transition-all shadow-xs shadow-teal-900/10"
          >
            <Mail className="w-3.5 h-3.5 text-teal-200" />
            <span>Draft a Reply</span>
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner (Legal / Medical) */}
      {analysis.is_emergency && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-extrabold text-rose-950">
                Urgent Legal or Housing Notice Detected
              </h2>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                {analysis.emergency_advice ||
                  'This document involves an imminent legal deadline, court summons, or eviction procedure. Plain strongly recommends contacting a licensed legal aid professional or tenant union immediately.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-rose-950">
                <a
                  href="https://www.lawhelp.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline hover:text-rose-700"
                >
                  <span>Find Free Legal Aid (LawHelp.org)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-rose-400">•</span>
                <span>Call 211 for emergency local assistance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Summary Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md shadow-stone-200/50 p-6 sm:p-8 space-y-4">
        {/* Document Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-900 font-bold text-xs uppercase tracking-wider border border-teal-200/60">
              {analysis.document_type || 'Document Breakdown'}
            </span>
            <span className="text-xs text-stone-400">
              Explained in {language}
            </span>
          </div>

          {/* Urgency Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${urgency.colorClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${urgency.dotClass}`} />
            <span>{urgency.label}</span>
          </div>
        </div>

        {/* Big 8th-Grade Summary */}
        <div className="space-y-2">
          <p className="text-xs uppercase font-extrabold tracking-wider text-stone-400">
            Bottom Line in Plain Language
          </p>
          <p className="font-serif-doc text-xl sm:text-2xl text-stone-900 leading-snug font-normal">
            “{analysis.one_sentence_summary}”
          </p>
        </div>

        {/* Confidence Notes */}
        {analysis.confidence_notes && (
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-500 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-stone-400 mt-0.5" />
            <span>
              <strong className="text-stone-700">Analyst note: </strong>
              {analysis.confidence_notes}
            </span>
          </div>
        )}
      </div>

      {/* Grid: Deadlines & Money Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DEADLINES CARD */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-stone-900">Deadlines & Timelines</h3>
              </div>
              <span className="text-xs font-semibold text-stone-400">
                {analysis.deadlines?.length || 0} date{analysis.deadlines?.length === 1 ? '' : 's'}
              </span>
            </div>

            {analysis.deadlines && analysis.deadlines.length > 0 ? (
              <div className="space-y-3">
                {analysis.deadlines.map((dl, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        {dl.date}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-800">
                      {dl.action_required}
                    </p>
                    <p className="text-[11px] text-amber-900 bg-amber-100/60 p-1.5 rounded-lg">
                      <strong className="font-bold">If missed:</strong> {dl.consequence_if_missed}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic py-4 text-center">
                No immediate deadlines or action dates found in this document.
              </p>
            )}
          </div>
        </div>

        {/* MONEY & COSTS CARD */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-stone-900">Money & Charges</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block font-medium">Total Stated</span>
                <span className="text-base font-extrabold text-stone-900 font-mono-code">
                  {analysis.money?.total_owed || 'N/A'}
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            {analysis.money?.breakdown && analysis.money.breakdown.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Breakdown
                </p>
                <div className="space-y-1">
                  {analysis.money.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-stone-700 bg-stone-50 px-3 py-2 rounded-xl flex items-start gap-2"
                    >
                      <span className="text-stone-400 font-mono">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Possible Errors / Unusual Charges */}
            {analysis.money?.possible_errors_or_unusual_charges &&
              analysis.money.possible_errors_or_unusual_charges.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Unusual Charges to Question</span>
                  </p>
                  <div className="space-y-1">
                    {analysis.money.possible_errors_or_unusual_charges.map((err, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-rose-900 bg-rose-50 border border-rose-200/80 px-3 py-2 rounded-xl"
                      >
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* RED FLAGS SECTION */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900">
                Red Flags & Fine Print Traps
              </h3>
              <p className="text-xs text-stone-500">
                Clauses, penalties, and obligations that could put you at a disadvantage
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
            {analysis.red_flags?.length || 0} flagged
          </span>
        </div>

        {analysis.red_flags && analysis.red_flags.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5">
            {analysis.red_flags.map((flag, idx) => {
              const badge = getRedFlagSeverityBadge(flag.severity);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 ${badge.borderClass} space-y-2`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      Clause / Item: “{flag.clause_or_item}”
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.badgeClass}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-xs text-stone-700 leading-relaxed bg-white p-2.5 rounded-xl border border-stone-100">
                    <strong className="text-stone-900 block font-semibold mb-0.5">
                      Why this matters to you:
                    </strong>
                    {flag.why_it_matters}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>No severe red flags or unfair fine-print traps detected in this text.</span>
          </div>
        )}
      </div>

      {/* KEY FACTS SECTION */}
      {analysis.key_facts && analysis.key_facts.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <FileText className="w-4 h-4 text-stone-500" />
            <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
              Key Document Facts (Identifiers Masked)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {analysis.key_facts.map((fact, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] font-semibold text-stone-500 block truncate">
                  {fact.label}
                </span>
                <span className="text-xs font-extrabold text-stone-900 block truncate mt-0.5">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDED NEXT STEPS & QUESTIONS TO ASK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RECOMMENDED NEXT STEPS */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <ListOrdered className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Recommended Next Steps</h3>
          </div>

          <div className="space-y-2">
            {analysis.recommended_next_steps?.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-800"
              >
                <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QUESTIONS TO ASK THE SENDER */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Questions to Ask the Sender</h3>
          </div>

          <div className="space-y-2">
            {analysis.questions_to_ask?.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-blue-50/40 border border-blue-100 flex items-start justify-between gap-2 group hover:bg-blue-50 transition-colors"
              >
                <p className="text-xs text-stone-800 font-medium leading-relaxed">
                  “{q}”
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyQuestion(q, idx)}
                  className="p-1 rounded-lg text-stone-400 group-hover:text-blue-800 hover:bg-blue-100/60 shrink-0 transition-colors"
                  title="Copy question to clipboard"
                  aria-label="Copy question"
                >
                  {copiedQuestionIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Big Draft Reply Callout Bar */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-teal-950/20">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Need to respond to this?</span>
          </div>
          <h4 className="text-lg sm:text-xl font-bold">Draft an official dispute or inquiry</h4>
          <p className="text-teal-200 text-xs sm:text-sm max-w-lg">
            Let Plain write a polite, firm letter or email citing these exact numbers, deadlines, and questions.
          </p>
        </div>

        <button
          onClick={onOpenDraftModal}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-teal-950 hover:bg-stone-100 active:scale-95 font-bold text-sm transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4 text-teal-800" />
          <span>Draft Reply Now</span>
        </button>
      </div>
    </div>
  );
};
