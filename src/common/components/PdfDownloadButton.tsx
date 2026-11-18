'use client';

import { Loader2, Download } from 'lucide-react';
import { downloadBlob, RESUME_PRINT_TARGET_ID } from '@/common/utils/generateResumePdf';
import { useResumePdfGeneration } from '@/common/hooks/useResumePdfGeneration';

interface PdfDownloadButtonProps {
  /** 캡처 대상 요소의 id */
  targetId?: string;
  /** 다운로드될 파일명 (.pdf 제외) */
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 이력서 영역을 PDF 로 저장하는 버튼.
 *
 * <p>실제 생성 로직은 {@link generateResumePdf} 에 있다.
 * 미리보기(`PdfPreviewButton`)도 같은 함수를 쓰므로 두 결과물이 일치한다.</p>
 *
 * <p>생성 중 여부는 {@link useResumePdfGeneration} 으로 페이지의 모든 PDF 버튼이 공유한다.
 * 어느 버튼이 생성 중이든 이 버튼도 비활성화된다.</p>
 */
export default function PdfDownloadButton({
  targetId = RESUME_PRINT_TARGET_ID,
  fileName = '이력서',
  className,
  children,
}: PdfDownloadButtonProps) {
  const { isBusy, isOwner, generate } = useResumePdfGeneration();

  const handleDownload = async () => {
    const blob = await generate(targetId);
    if (blob) downloadBlob(blob, `${fileName}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isBusy}
      className={
        className ??
        'flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60'
      }
    >
      {isOwner ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          PDF 생성 중…
        </>
      ) : (
        children ?? (
          <>
            <Download className="h-3.5 w-3.5" />
            PDF 다운로드
          </>
        )
      )}
    </button>
  );
}
