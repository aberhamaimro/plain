import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  CreditCard,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { PRICING_CONFIG, createCheckoutSession } from '../config/pricing';
import { PricingPlan } from '../types';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  hasUnlimited: boolean;
  onAddCredits: (count: number) => void;
  onSetUnlimited: (val: boolean) => void;
  onResetCredits: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  credits,
  hasUnlimited,
  onAddCredits,
  onSetUnlimited,
  onResetCredits,
}) => {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan: PricingPlan) => {
    setLoadingPlanId(plan.id);
    setCheckoutMessage(null);
    try {
      const result = await createCheckoutSession(plan.id);
      setCheckoutMessage(
        `${result.message} In sandbox mode: Credits have been added to your session!`
      );
      // Auto apply in demo/preview so user is never blocked while testing
      if (plan.id === 'unlimited') {
        onSetUnlimited(true);
      } else {
        onAddCredits(5);
      }
    } catch {
      setCheckoutMessage('Could not initiate checkout session.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Close paywall modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plain Premium Access</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {credits === 0 && !hasUnlimited
              ? 'You’ve used your free analysis'
              : 'Upgrade Plain for Instant Clarity'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            Never sign an unfair lease or overpay a confusing medical bill again. Choose the plan that fits your needs:
          </p>
        </div>

        {/* Checkout Message Banner if simulated */}
        {checkoutMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{checkoutMessage}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRICING_CONFIG.plans.map((plan: PricingPlan) => {
            const isProcessing = loadingPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all ${
                  plan.popular
                    ? 'border-2 border-teal-800 bg-teal-50/20 shadow-md'
                    : 'border border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-teal-800 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                    {plan.badge || 'Most Popular'}
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="font-extrabold text-base text-stone-900">{plan.name}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-stone-900 font-mono-code tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">/{plan.cadence}</span>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                        <Check className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isProcessing}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    plan.popular
                      ? 'bg-teal-800 hover:bg-teal-700 text-white shadow-xs'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting Stripe...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Get {plan.name}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Sandbox Dev Test Controls */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-1.5 text-stone-500">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Ready for Stripe checkout webhook.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAddCredits(5);
                setCheckoutMessage('Added 5 test document credits!');
              }}
              className="text-[11px] font-semibold text-teal-800 hover:underline"
            >
              + Add 5 Demo Credits
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => {
                onResetCredits();
                setCheckoutMessage('Reset to initial 1 free credit.');
              }}
              className="text-[11px] font-semibold text-stone-500 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Credits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
