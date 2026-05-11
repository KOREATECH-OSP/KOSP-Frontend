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
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      // 캡처 시점에 target element를 ref로 고정 (active window 무관)
      const canvas = await html2canvas(target, {
        scale: 2,          // 고해상도
        useCORS: true,     // 외부 이미지 허용
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
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
