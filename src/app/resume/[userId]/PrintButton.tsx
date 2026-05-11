'use client';

import { Printer } from 'lucide-react';
import PdfDownloadButton from '@/common/components/PdfDownloadButton';

interface PrintButtonProps {
  resumeTitle?: string;
}

/**
 * 공개 이력서 페이지의 PDF 다운로드 + 인쇄 버튼.
 *
 * - PDF 다운로드: html2canvas+jsPDF로 #resume-print-area만 캡처
 * - 인쇄: CSS @media print로 인쇄 불필요한 UI 숨긴 뒤 window.print()
 */
export default function PrintButton({ resumeTitle = '이력서' }: PrintButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <PdfDownloadButton
        targetId="resume-print-area"
        fileName={resumeTitle}
      />
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Printer className="h-3.5 w-3.5" />
        인쇄
      </button>
    </div>
  );
}
