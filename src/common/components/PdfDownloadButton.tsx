'use client';

import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';

interface PdfDownloadButtonProps {
  /** 캡처 대상 요소의 id */
  targetId?: string;
  /** 다운로드될 파일명 (.pdf 제외) */
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * html2canvas + jsPDF를 사용해 특정 DOM 영역만 PDF로 저장하는 버튼.
 *
 * - `targetId` 요소만 캡처 → 헤더/버튼/사이드바 제외
 * - 비동기 처리이므로 클릭 후 다른 창으로 이동해도 캡처 대상이 바뀌지 않음
 * - A4 기준 페이지 자동 분할
 */
export default function PdfDownloadButton({
  targetId = 'resume-print-area',
  fileName = '이력서',
  className,
  children,
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;

    const target = document.getElementById(targetId);
    if (!target) {
      alert('이력서 영역을 찾을 수 없습니다.');
      return;
    }

    setIsGenerating(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ]);

      const captureWidth = target.offsetWidth || 794;
      const captureHeight = target.scrollHeight || target.offsetHeight;

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        x: 0,
        y: 0,
        width: captureWidth,
        height: captureHeight,
        // 클론 문서의 가상 viewport를 이력서 전체 크기로 설정
        // 미지정 시 window.innerHeight로 고정되어 이력서가 잘림
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (_clonedDoc: Document, clonedElement: HTMLElement) => {
          const body = _clonedDoc.body;
          // clonedElement를 body 최상위로 이동 (position:fixed 컨테이너에서 분리)
          body.appendChild(clonedElement);
          // 모달, 오버레이, Toaster 포털 등 나머지 body 직접 자식 완전 차단
          Array.from(body.children).forEach((child) => {
            if (child !== clonedElement) {
              const el = child as HTMLElement;
              el.style.setProperty('display', 'none', 'important');
              el.style.setProperty('visibility', 'hidden', 'important');
            }
          });
          // 이력서 영역 좌표 초기화 + 상위 clip 해제
          clonedElement.style.cssText =
            `position:static!important;left:0!important;top:0!important;` +
            `width:${captureWidth}px!important;margin:0!important;padding:0!important;` +
            `overflow:visible!important;height:auto!important;max-height:none!important;`;
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 여러 페이지로 분할
      let heightLeft = imgHeight;
      let position = 0;
      let isFirstPage = true;

      while (heightLeft > 0) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
        isFirstPage = false;
      }

      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      alert('PDF 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className={
        className ??
        'flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60'
      }
    >
      {isGenerating ? (
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
