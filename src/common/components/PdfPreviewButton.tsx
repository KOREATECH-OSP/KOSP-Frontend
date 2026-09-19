'use client';

import { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { generateResumePdf, ResumePdfError } from '@/common/utils/generateResumePdf';
import PdfPreviewModal, { type HwpxSource } from './PdfPreviewModal';

interface PdfPreviewButtonProps {
  /** 캡처 대상 요소의 id */
  targetId?: string;
  /** 다운로드될 파일명 (.pdf 제외) */
  fileName?: string;
  /**
   * 한글(hwpx) 내려받기 정보. 넘기면 미리보기 모달에 "한글 다운로드" 버튼이 함께 뜬다.
   * 이력서 id 를 아직 모르는 상태(신규 작성 중 등)에서는 생략한다.
   */
  hwpxSource?: HwpxSource;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 실제 생성될 PDF 를 다운로드 전에 확인하는 버튼.
 *
 * <p>클릭 시 {@link generateResumePdf} 로 PDF 를 <b>한 번만</b> 만들어 모달에 넘긴다.
 * 모달의 다운로드 버튼도 같은 Blob 을 저장하므로, 미리보기에서 본 것과 저장되는 파일이
 * 항상 동일하다.</p>
 */
export default function PdfPreviewButton({
  targetId = 'resume-print-area',
  fileName = '이력서',
  hwpxSource,
  className,
  children,
}: PdfPreviewButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const handlePreview = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const blob = await generateResumePdf(targetId);
      setPreviewBlob(blob);
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      alert(
        err instanceof ResumePdfError
          ? err.message
          : 'PDF 생성에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePreview}
        disabled={isGenerating}
        className={
          className ??
          'flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60'
        }
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            미리보기 준비 중…
          </>
        ) : (
          children ?? (
            <>
              <Eye className="h-3.5 w-3.5" />
              미리보기
            </>
          )
        )}
      </button>

      {previewBlob && (
        <PdfPreviewModal
          blob={previewBlob}
          fileName={`${fileName}.pdf`}
          hwpxSource={hwpxSource}
          onClose={() => setPreviewBlob(null)}
        />
      )}
    </>
  );
}
