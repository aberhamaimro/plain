import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  Calendar,
  ArrowRight,
  Search,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { HistoryItem, UrgencyLevel } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.document_type.toLowerCase().includes(q) ||
      item.one_sentence_summary.toLowerCase().includes(q) ||
      (item.fileName && item.fileName.toLowerCase().includes(q))
    );
  });

  const getUrgencyClass = (urgency: UrgencyLevel) => {
    switch (urgency?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-100 text-rose-800';
      case 'high':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-800" />
            <h3 className="font-bold text-base text-stone-900">Document History</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            aria-label="Close history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        {history.length > 0 && (
          <div className="p-3 border-b border-stone-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search past analyses..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-teal-700 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-700">No documents saved yet</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Any document you analyze will be automatically saved locally in your browser for easy reference.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-stone-500 text-center py-8">
              No documents matching &ldquo;{searchTerm}&rdquo;
            </p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-stone-200 hover:border-teal-600 bg-white hover:bg-teal-50/20 transition-all shadow-2xs group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 group-hover:text-teal-900">
                        {item.document_type}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full ${getUrgencyClass(
                          item.urgency_level
                        )}`}
                      >
                        {item.urgency_level}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="p-1 rounded-md text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete document from history"
                    aria-label="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {item.one_sentence_summary}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400">
                    Language: {item.language || 'English'}
                  </span>
                  <button
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="text-xs font-bold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
            {confirmClear ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-xs text-rose-700 font-semibold">Delete all items?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                  >
                    Yes, clear
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-[11px] text-stone-400">
                  Stored securely in browser
                </span>
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-xs text-stone-500 hover:text-rose-600 font-medium transition-colors"
                >
                  Clear all history
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
