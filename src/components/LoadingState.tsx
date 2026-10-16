import React, { useEffect, useState } from 'react';
import { Loader2, FileSearch, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  language: string;
}

const STAGES = [
  { message: 'Reading your document...', icon: FileSearch },
  { message: 'Checking for red flags & hidden traps...', icon: ShieldAlert },
  { message: 'Calculating figures, deadlines & fees...', icon: Sparkles },
  { message: 'Translating legal jargon into plain language...', icon: CheckCircle2 },
  { message: 'Finalizing your 30-second breakdown...', icon: Sparkles },
];

export const LoadingState: React.FC<LoadingStateProps> = ({ language }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  const stage = STAGES[currentStageIndex];
  const IconComponent = stage.icon;

  return (
    <div className="w-full max-w-lg mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/30 p-8 text-center space-y-6">
        {/* Animated Icon Ring */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-teal-100 animate-ping opacity-25" />
          <div className="relative w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-teal-800 shadow-inner">
            <IconComponent className="w-9 h-9 animate-pulse text-teal-800" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-teal-800 text-white rounded-full p-1.5 shadow-md">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        </div>

        {/* Dynamic Stage Message */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight transition-all">
            {stage.message}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Generating plain summary in <span className="text-teal-800 font-semibold">{language}</span>
          </p>
        </div>

        {/* Visual Progress Steps */}
        <div className="space-y-2.5 pt-2">
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-700 h-2 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${((currentStageIndex + 1) / STAGES.length) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-stone-400">
            <span>Scanning</span>
            <span>Auditing Clauses</span>
            <span>Simplifying</span>
          </div>
        </div>

        {/* Calming reassurance box */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-stone-500 text-xs leading-relaxed text-left">
          <p className="font-semibold text-stone-700 mb-0.5">While you wait:</p>
          Plain masks account numbers and private identifiers to protect your confidentiality. No one else sees your document.
        </div>
      </div>
    </div>
  );
};
