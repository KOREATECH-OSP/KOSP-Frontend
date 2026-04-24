'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { getActiveTerms } from '@/lib/api/terms';
import { TERMS_AGREE_LABEL, TERMS_LOADING_TEXT, TERMS_ERROR_TEXT } from '@/constants/terms';
import type { TermsResponse } from '@/lib/api/types';

function TermsAgreementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [terms, setTerms] = useState<TermsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getActiveTerms()
      .then(setTerms)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAgree = async () => {
    if (!terms || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/terms/agree-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ version: terms.version }),
      });

      if (!res.ok) {
        toast.error('약관 동의에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      toast.success('약관 동의가 완료되었습니다');
      router.replace(callbackUrl);
    } catch {
      toast.error('약관 동의에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-[20px] font-bold text-[#191f28]">이용약관 동의</h1>
          <p className="text-[14px] text-[#8b95a1] mt-2">서비스 이용을 위해 약관 동의가 필요합니다</p>
        </div>

        <div className="rounded-2xl border border-[#e5e8eb] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-[14px] text-[#8b95a1]">
              {TERMS_LOADING_TEXT}
            </div>
          ) : error || !terms ? (
            <div className="flex items-center justify-center h-48 text-[14px] text-[#ef4444]">
              {TERMS_ERROR_TEXT}
            </div>
          ) : (
            <>
              <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e5e8eb] flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#4e5968]">서비스 이용약관</span>
                <span className="text-[12px] text-[#8b95a1]">v{terms.version}</span>
              </div>
              <div className="h-48 overflow-y-auto p-4">
                <pre className="text-[13px] text-[#4e5968] whitespace-pre-wrap leading-relaxed font-sans">
                  {terms.content}
                </pre>
              </div>
            </>
          )}
        </div>

        <label className="flex items-center gap-3 p-4 rounded-2xl bg-[#f8f9fa] border border-[#e5e8eb] cursor-pointer group">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="sr-only"
            disabled={isLoading || error || !terms}
          />
          <div
            className={`w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              isChecked
                ? 'bg-[#3182f6]'
                : 'bg-white border-2 border-[#d1d6db] group-hover:border-[#3182f6]'
            }`}
          >
            {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </div>
          <span className="text-[15px] font-medium text-[#191f28]">{TERMS_AGREE_LABEL}</span>
        </label>

        <button
          type="button"
          onClick={handleAgree}
          disabled={!isChecked || isLoading || error || !terms || isSubmitting}
          className={`w-full h-[54px] text-[16px] font-semibold rounded-2xl transition-colors ${
            isChecked && !isLoading && !error && terms && !isSubmitting
              ? 'bg-[#3182f6] text-white hover:bg-[#1b64da] active:bg-[#1957c2]'
              : 'bg-[#e5e8eb] text-[#8b95a1] cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '처리 중...' : '동의하고 계속하기'}
        </button>
      </div>
    </div>
  );
}

export default function TermsAgreementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      }
    >
      <TermsAgreementContent />
    </Suspense>
  );
}
