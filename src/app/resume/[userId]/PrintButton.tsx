'use client';

import { Printer } from 'lucide-react';
import PdfDownloadButton from '@/common/components/PdfDownloadButton';
import PdfPreviewButton from '@/common/components/PdfPreviewButton';

interface PrintButtonProps {
  resumeTitle?: string;
  /** 이력서 소유자. hwpx 공개 엔드포인트에 필요하다. */
  userId?: number;
  /** 이력서 식별자. 없으면 한글 다운로드 버튼을 띄우지 않는다. */
  resumeId?: number | null;
}

/**
 * 공개 이력서 페이지의 PDF 미리보기 + 다운로드 + 인쇄 버튼.
 *
 * - 미리보기: 실제 생성된 PDF를 모달에서 확인하고, 거기서 PDF 또는 한글로 저장
 * - PDF 다운로드: html2canvas+jsPDF로 #resume-print-area만 캡처
 * - 인쇄: CSS @media print로 인쇄 불필요한 UI 숨긴 뒤 window.print()
 *
 * <p>여기는 공개 이력서 화면이므로 한글 내려받기도 <b>공개용 엔드포인트</b>를 쓴다
 * (인증 없이 호출하며, 비공개 이력서는 서버가 404로 막는다).</p>
 */
export default function PrintButton({
  resumeTitle = '이력서',
  userId,
  resumeId,
}: PrintButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <PdfPreviewButton
        targetId="resume-print-area"
        fileName={resumeTitle}
        hwpxSource={
          userId != null && resumeId != null
            ? { kind: 'public', userId, resumeId }
            : undefined
        }
      />
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
