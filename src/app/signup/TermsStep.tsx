'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { getActiveTerms } from '@/lib/api/terms';
import { TERMS_AGREE_LABEL, TERMS_LOADING_TEXT, TERMS_ERROR_TEXT } from '@/constants/terms';
import type { TermsResponse } from '@/lib/api/types';

interface TermsStepProps {
  onAgree: (version: string) => void;
  onBack?: () => void;
}

export default function TermsStep({ onAgree, onBack }: TermsStepProps) {
  const [terms, setTerms] = useState<TermsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    getActiveTerms()
      .then(setTerms)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const handleNext = () => {
    if (terms) {
      onAgree(terms.version);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-[15px] text-[#191f28] font-medium">이용약관 동의</p>
        <p className="text-[14px] text-[#8b95a1] mt-1">가입 전 약관을 확인해주세요</p>
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

      <p className="text-[13px] text-[#8b95a1] text-center">
        동의 전{' '}
        <Link
          href="https://www.koreatech.ac.kr/menu.es?mid=a10903000000"
          className="text-[#3182f6] hover:underline"
          target="_blank"
        >
          개인정보처리방침
        </Link>
        도 확인해주세요.
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isChecked || isLoading || error || !terms}
          className={`w-full h-[54px] text-[16px] font-semibold rounded-2xl transition-colors ${
            isChecked && !isLoading && !error && terms
              ? 'bg-[#3182f6] text-white hover:bg-[#1b64da] active:bg-[#1957c2]'
              : 'bg-[#e5e8eb] text-[#8b95a1] cursor-not-allowed'
          }`}
        >
          다음
        </button>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full h-[54px] bg-[#f2f4f6] text-[#4e5968] text-[16px] font-semibold rounded-2xl hover:bg-[#e5e8eb] transition-colors"
          >
            이전으로
          </button>
        )}
      </div>
    </div>
  );
}
