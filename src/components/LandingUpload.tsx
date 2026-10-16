import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  FileText,
  FileCheck,
  Clipboard,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
  Globe,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import { SAMPLE_DOCUMENTS, SampleDocument } from '../data/sampleDocuments';

interface LandingUploadProps {
  onAnalyze: (payload: {
    text?: string;
    fileData?: string;
    mimeType?: string;
    fileName?: string;
    language: string;
  }) => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  isLoading: boolean;
}

export const LandingUpload: React.FC<LandingUploadProps> = ({
  onAnalyze,
  currentLanguage,
  onLanguageChange,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'sample'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<{
    name: string;
    size: string;
    mimeType: string;
    dataUrl: string;
  } | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (selectedFile: File) => {
    setErrorMsg(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf')) {
      setErrorMsg('Please upload an image (JPG, PNG, WEBP) or a PDF document.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMsg('File size must be under 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const sizeFormatted =
        selectedFile.size < 1024 * 1024
          ? `${(selectedFile.size / 1024).toFixed(1)} KB`
          : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;

      setFile({
        name: selectedFile.name,
        size: sizeFormatted,
        mimeType: selectedFile.type || 'application/pdf',
        dataUrl: result,
      });
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === 'upload') {
      if (!file) {
        setErrorMsg('Please upload a document photo or PDF first, or paste text.');
        return;
      }
      onAnalyze({
        fileData: file.dataUrl,
        mimeType: file.mimeType,
        fileName: file.name,
        language: currentLanguage,
      });
    } else if (activeTab === 'paste') {
      if (!pastedText.trim() || pastedText.trim().length < 20) {
        setErrorMsg('Please paste at least a paragraph of document text to analyze.');
        return;
      }
      onAnalyze({
        text: pastedText,
        language: currentLanguage,
      });
    }
  };

  const handleSelectSample = (sample: SampleDocument) => {
    setPastedText(sample.sampleText);
    setActiveTab('paste');
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Headline */}
      <div className="text-center space-y-3.5 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bills • Leases • Contracts • Notices • Medical</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
          Understand any document in <span className="text-teal-800 underline decoration-teal-300 decoration-wavy underline-offset-4">30 seconds</span>
        </h1>

        <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Upload a photo, PDF, or paste text. Plain translates confusing legal jargon, hidden fees, and deadlines into simple, empowering language.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/40 p-5 sm:p-7 transition-all">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-stone-100/80 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-teal-700" />
            <span>Upload Photo or PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'paste'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clipboard className="w-4 h-4 text-teal-700" />
            <span>Paste Text</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('sample');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sample'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-700" />
            <span>Try Sample</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TAB 1: File Upload & Camera */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    dragActive
                      ? 'border-teal-700 bg-teal-50/50 scale-[0.99]'
                      : 'border-stone-300 bg-stone-50/50 hover:bg-stone-50 hover:border-teal-600'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-100/70 text-teal-800 flex items-center justify-center">
                    <UploadCloud className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-base font-bold text-stone-800">
                      Drag & drop your document here, or <span className="text-teal-700 underline underline-offset-2">browse files</span>
                    </p>
                    <p className="text-xs text-stone-500">
                      Supports phone photos (JPG, PNG), camera snapshots, and PDF documents (up to 20MB)
                    </p>
                  </div>

                  {/* Mobile Camera quick action */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-teal-700" />
                      Take Photo with Camera
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              ) : (
                /* File Selected Preview Card */
                <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-teal-800 font-medium">
                        {file.size} • Ready for 30s analysis
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
                    aria-label="Remove uploaded file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Paste Text */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label htmlFor="pasted-doc" className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Paste Document Text or Letter
              </label>
              <textarea
                id="pasted-doc"
                rows={7}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the full text of your bill, lease clause, contract paragraph, collection notice, or employment offer here..."
                className="w-full rounded-2xl border border-stone-200 p-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 font-mono-code transition-all"
              />
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{pastedText.length} characters</span>
                {pastedText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPastedText('')}
                    className="text-stone-400 hover:text-stone-700 underline text-xs"
                  >
                    Clear text
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Sample Documents */}
          {activeTab === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                Select an example document to test how Plain identifies red flags, deadlines, and hidden charges instantly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_DOCUMENTS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="text-left p-3.5 rounded-2xl border border-stone-200 hover:border-teal-600 hover:bg-teal-50/40 transition-all group flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-teal-900">
                          {sample.title}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {sample.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>
                    <div className="text-[11px] font-bold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Load this sample</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Language Selector in Upload Area */}
          <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-stone-500" />
              <label htmlFor="lang-select" className="text-xs font-semibold text-stone-700">
                Explain in:
              </label>
              <select
                id="lang-select"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-teal-700 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.flag} {lang.name} ({lang.localName})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-stone-400">
              8th-grade plain language guaranteed
            </p>
          </div>

          {/* Submit Button */}
          {activeTab !== 'sample' && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-800 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-teal-900/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Analyze Document in Plain Language</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Privacy and Trust Guarantees */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-stone-500 text-center">
        <div className="inline-flex items-center gap-1.5 text-stone-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Your document is processed to generate your analysis and not shown to other users.</span>
        </div>
      </div>

      {/* Popular Supported Documents Bar */}
      <div className="mt-10 pt-8 border-t border-stone-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-stone-100/60">
          <p className="text-xs font-bold text-stone-800">Medical Bills</p>
          <p className="text-[11px] text-stone-500">Out-of-network fees, coding errors</p>
        </div>
        <div className="p-3 rounded-2xl bg-stone-100/60">
          <p className="text-xs font-bold text-stone-800">Apartment Leases</p>
          <p className="text-[11px] text-stone-500">Auto-renewals, deposit forfeitures</p>
        </div>
        <div className="p-3 rounded-2xl bg-stone-100/60">
          <p className="text-xs font-bold text-stone-800">Debt & Court Notices</p>
          <p className="text-[11px] text-stone-500">30-day dispute windows, rights</p>
        </div>
        <div className="p-3 rounded-2xl bg-stone-100/60">
          <p className="text-xs font-bold text-stone-800">Job Offers & Contracts</p>
          <p className="text-[11px] text-stone-500">Clawbacks, non-competes, NDAs</p>
        </div>
      </div>
    </div>
  );
};
