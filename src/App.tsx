/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingUpload } from './components/LandingUpload';
import { LoadingState } from './components/LoadingState';
import { ResultsView } from './components/ResultsView';
import { DraftReplyModal } from './components/DraftReplyModal';
import { FollowUpChat } from './components/FollowUpChat';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PaywallModal } from './components/PaywallModal';
import { TrustFooter } from './components/TrustFooter';
import { DocumentAnalysis, HistoryItem } from './types';
import { analyzeDocumentApi, AnalyzePayload } from './services/api';
import {
  getHistory,
  saveAnalysisToHistory,
  deleteHistoryItem,
  clearAllHistory,
  getRemainingCredits,
  useCredit,
  addCredits,
  hasUnlimitedPass,
  setUnlimitedPass,
  resetCreditsForTesting,
} from './utils/storage';
import { DEFAULT_LANGUAGE } from './config/languages';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [activeAnalysis, setActiveAnalysis] = useState<DocumentAnalysis | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Storage & Monetization State
  const [credits, setCredits] = useState<number>(1);
  const [hasUnlimited, setHasUnlimited] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState<boolean>(false);

  // Initialize storage
  useEffect(() => {
    setCredits(getRemainingCredits());
    setHasUnlimited(hasUnlimitedPass());
    setHistory(getHistory());
  }, []);

  const handleAnalyze = async (payload: AnalyzePayload) => {
    setErrorMessage(null);

    // Check credits before executing
    const currentCredits = getRemainingCredits();
    const unlimited = hasUnlimitedPass();

    if (currentCredits <= 0 && !unlimited) {
      setIsPaywallOpen(true);
      return;
    }

    setIsLoading(true);
    setActiveFileName(payload.fileName);

    try {
      const analysis = await analyzeDocumentApi({
        ...payload,
        language: currentLanguage,
      });

      // Deduct credit
      useCredit();
      setCredits(getRemainingCredits());

      // Save to localStorage history if document was readable
      if (!analysis.is_unreadable) {
        saveAnalysisToHistory(analysis, {
          fileName: payload.fileName,
          language: currentLanguage,
        });
        setHistory(getHistory());
      }

      setActiveAnalysis(analysis);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Document analysis failed:', err);
      setErrorMessage(
        err?.message ||
          'Could not analyze this document. Please make sure the photo or text is clear and legible, then try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveAnalysis(item.analysis);
    setActiveFileName(item.fileName);
    if (item.language) {
      setCurrentLanguage(item.language);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  const handleAddCredits = (count: number) => {
    const next = addCredits(count);
    setCredits(next);
  };

  const handleSetUnlimited = (val: boolean) => {
    setUnlimitedPass(val);
    setHasUnlimited(val);
    setCredits(getRemainingCredits());
  };

  const handleResetCredits = () => {
    resetCreditsForTesting();
    setCredits(getRemainingCredits());
    setHasUnlimited(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-stone-900 selection:bg-teal-200 selection:text-teal-950">
      {/* Top Navigation */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        credits={credits}
        hasUnlimited={hasUnlimited}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onResetToHome={() => {
          setActiveAnalysis(null);
          setErrorMessage(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {errorMessage && (
          <div className="max-w-3xl mx-auto w-full px-4 pt-6">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Notice during document processing</p>
                <p className="text-rose-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingState language={currentLanguage} />
        ) : activeAnalysis ? (
          <>
            <ResultsView
              analysis={activeAnalysis}
              onOpenDraftModal={() => setIsDraftModalOpen(true)}
              onReset={() => {
                setActiveAnalysis(null);
                setErrorMessage(null);
              }}
              language={currentLanguage}
            />

            {/* Follow-Up Chat Box below the results if document is readable */}
            {!activeAnalysis.is_unreadable && (
              <FollowUpChat
                analysis={activeAnalysis}
                language={currentLanguage}
              />
            )}
          </>
        ) : (
          <LandingUpload
            onAnalyze={handleAnalyze}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Disclaimers & Trust Footer */}
      <TrustFooter />

      {/* Modals & Slide-over Drawers */}
      {activeAnalysis && (
        <DraftReplyModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          analysis={activeAnalysis}
          language={currentLanguage}
        />
      )}

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistory}
        onClearAll={handleClearHistory}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        credits={credits}
        hasUnlimited={hasUnlimited}
        onAddCredits={handleAddCredits}
        onSetUnlimited={handleSetUnlimited}
        onResetCredits={handleResetCredits}
      />
    </div>
  );
}
