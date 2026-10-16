import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  Download,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DocumentAnalysis } from '../types';
import { draftReplyApi, DraftReplyResult } from '../services/api';

interface DraftReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DocumentAnalysis;
  language: string;
}

export const DraftReplyModal: React.FC<DraftReplyModalProps> = ({
  isOpen,
  onClose,
  analysis,
  language,
}) => {
  const [intent, setIntent] = useState<'dispute' | 'clarification' | 'extension' | 'negotiation'>('dispute');
  const [tone, setTone] = useState<'polite' | 'firm' | 'formal'>('firm');
  const [senderName, setSenderName] = useState('Account Holder');
  const [recipientName, setRecipientName] = useState('');
  const [userInstructions, setUserInstructions] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draftResult, setDraftResult] = useState<DraftReplyResult | null>(null);
  const [editableLetter, setEditableLetter] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-generate on open if not generated yet
  useEffect(() => {
    if (isOpen && !draftResult && !isLoading) {
      handleGenerate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await draftReplyApi({
        analysis,
        intent,
        tone,
        language,
        senderName: senderName || 'Account Holder',
        recipientName: recipientName || 'Billing & Accounts Department',
        userInstructions,
      });
      setDraftResult(result);
      setEditableLetter(result.letter);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to generate drafted letter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = draftResult?.subject
      ? `Subject: ${draftResult.subject}\n\n${editableLetter}`
      : editableLetter;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullText = `Subject: ${draftResult?.subject || 'Document Response'}\n\n${editableLetter}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Plain_Reply_${analysis.document_type.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent(draftResult?.subject || `Response regarding ${analysis.document_type}`);
    const body = encodeURIComponent(editableLetter);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">Draft an Official Response</h3>
              <p className="text-xs text-stone-500">
                Customized for {analysis.document_type} in {language}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Controls: Intent and Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Intent Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Letter Goal / Intent
              </label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-teal-700 cursor-pointer"
              >
                <option value="dispute">Dispute Incorrect Charges or Terms</option>
                <option value="clarification">Request Itemized Breakdown & Proof</option>
                <option value="extension">Request Deadline Extension / Payment Plan</option>
                <option value="negotiation">Negotiate Settlement / Rent Reduction</option>
              </select>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Tone of Voice
              </label>
              <div className="flex rounded-xl bg-stone-100 p-1">
                {(['polite', 'firm', 'formal'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                      tone === t
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                Your Name / Signature
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full text-xs rounded-xl border border-stone-200 px-3 py-2 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                Recipient / Entity Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Mercy Hospital Billing Office"
                className="w-full text-xs rounded-xl border border-stone-200 px-3 py-2 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
              />
            </div>
          </div>

          {/* Re-generate trigger button if user modified settings */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>{isLoading ? 'Drafting...' : 'Regenerate Draft with Changes'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Editable Draft Letter Area */}
          {isLoading ? (
            <div className="py-12 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
              <Loader2 className="w-7 h-7 animate-spin text-teal-800 mx-auto" />
              <p className="text-xs font-bold text-stone-700">
                Drafting custom letter with {tone} tone...
              </p>
            </div>
          ) : draftResult ? (
            <div className="space-y-3">
              {/* Subject Line */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={draftResult.subject}
                  onChange={(e) =>
                    setDraftResult({ ...draftResult, subject: e.target.value })
                  }
                  className="w-full text-xs font-bold rounded-xl border border-stone-200 px-3 py-2 text-stone-900 bg-stone-50/50"
                />
              </div>

              {/* Editable Letter Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Letter Body (Click to edit text)
                  </label>
                  <span className="text-[11px] text-stone-400">
                    Replace [placeholders] with your info
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={editableLetter}
                  onChange={(e) => setEditableLetter(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 p-3.5 text-xs sm:text-sm text-stone-800 leading-relaxed font-mono-code focus:outline-hidden focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700"
                />
              </div>

              {/* Sending Tips */}
              {draftResult.tips && draftResult.tips.length > 0 && (
                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/60 text-xs text-teal-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    Recommended Sending Strategy:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-teal-800 text-[11px]">
                    {draftResult.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/80 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-stone-400">
            Edit freely before sending
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isLoading || !draftResult}
              className="px-3 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .txt</span>
            </button>

            <button
              onClick={handleOpenEmail}
              disabled={isLoading || !draftResult}
              className="px-3 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-teal-700" />
              <span>Open in Email</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={isLoading || !draftResult}
              className="px-4 py-2 rounded-xl bg-teal-800 text-white hover:bg-teal-700 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Letter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
