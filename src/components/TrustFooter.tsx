import React from 'react';
import { Shield, Lock, HeartHandshake, Info } from 'lucide-react';

export const TrustFooter: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-white/70 py-8 px-4 text-xs text-stone-500">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Core Disclaimer Box */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-3">
          <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="text-stone-600 leading-relaxed">
            <strong className="text-stone-800">Important Disclaimer: </strong>
            Plain explains documents but is not a lawyer, doctor, or financial advisor. This tool is designed to translate complex paperwork into accessible, plain language to help you ask better questions. For critical legal summonses or acute medical decisions, always consult qualified legal aid or licensed counsel.
          </p>
        </div>

        {/* Badges & Privacy Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 pt-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            <span>Your document is processed to generate your analysis and not shown to other users.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Plain Document Explainer</span>
            <span>•</span>
            <span>Zero Data Reselling</span>
            <span>•</span>
            <span>Multimodal AI Auditing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
