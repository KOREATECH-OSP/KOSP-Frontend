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
 * - `data-pdf-only` 요소는 캡처 시에만 표시하고, `data-pdf-hidden` 요소는 캡처에서 제외한다.
 *   (캐러셀·모달처럼 화면에서는 일부만 보이는 UI를 PDF에서는 전체 펼친 형태로 대체하기 위함)
 * - 가로 스크롤 컨테이너의 clip 을 해제해 화면 밖 내용이 잘리지 않게 한다.
 * - A4 페이지 분할 시 섹션 경계에서 끊어, 섹션 제목이 페이지 경계에서 잘리지 않게 한다.
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

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: captureWidth,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
          const body = clonedDoc.body;
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

          // PDF 전용 블록을 노출하고, 화면 전용 블록(캐러셀 등)을 숨긴다.
          clonedElement.querySelectorAll<HTMLElement>('[data-pdf-only]').forEach((el) => {
            el.style.setProperty('display', 'block', 'important');
          });
          clonedElement.querySelectorAll<HTMLElement>('[data-pdf-hidden]').forEach((el) => {
            el.style.setProperty('display', 'none', 'important');
          });

          // 스크롤 컨테이너의 clip 해제 — 화면 밖 카드가 잘려나가는 것을 막는다.
          clonedElement.querySelectorAll<HTMLElement>('*').forEach((el) => {
            const style = clonedDoc.defaultView?.getComputedStyle(el);
            if (!style) return;
            if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
              el.style.setProperty('overflow', 'visible', 'important');
            }
            if (style.maxHeight !== 'none') {
              el.style.setProperty('max-height', 'none', 'important');
            }
          });

          // 이력서 영역 좌표 초기화 + 상위 clip 해제
          clonedElement.style.cssText =
            `position:static!important;left:0!important;top:0!important;` +
            `width:${captureWidth}px!important;margin:0!important;padding:0!important;` +
            `overflow:visible!important;height:auto!important;max-height:none!important;`;
        },
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidthMm = pdf.internal.pageSize.getWidth();   // 210mm
      const pageHeightMm = pdf.internal.pageSize.getHeight(); // 297mm

      // 캔버스 픽셀 ↔ mm 환산. 가로를 페이지 폭에 맞추므로 세로도 같은 비율.
      const pxPerMm = canvas.width / pageWidthMm;
      const pageHeightPx = Math.floor(pageHeightMm * pxPerMm);

      // 섹션 경계(캔버스 픽셀 기준)를 모아 "잘라도 안전한 지점" 목록을 만든다.
      const cutPoints = collectSectionCutPoints(target, canvas.height);

      let offset = 0;
      let isFirstPage = true;

      while (offset < canvas.height) {
        const remaining = canvas.height - offset;
        let sliceHeight = Math.min(pageHeightPx, remaining);

        if (remaining > pageHeightPx) {
          // 이 페이지 안에 들어오는 가장 마지막 섹션 경계를 찾아 거기서 자른다.
          const limit = offset + pageHeightPx;
          const safeCut = cutPoints.filter((y) => y > offset && y <= limit).pop();
          // 섹션 하나가 한 페이지보다 큰 경우에만 어쩔 수 없이 강제로 자른다.
          if (safeCut !== undefined) {
            sliceHeight = safeCut - offset;
          }
        }

        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceHeight;
        const ctx = slice.getContext('2d');
        if (!ctx) break;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        if (!isFirstPage) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/png'),
          'PNG',
          0,
          0,
          pageWidthMm,
          sliceHeight / pxPerMm,
        );

        offset += sliceHeight;
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

/**
 * 캡처 대상의 최상위 섹션들이 끝나는 y 좌표를 캔버스 픽셀 단위로 모은다.
 *
 * <p>페이지를 이 지점에서만 자르면 섹션 제목과 본문이 서로 다른 페이지로
 * 분리되거나 제목이 중간에서 잘리는 일을 막을 수 있다.</p>
 *
 * @param target       캡처 대상 요소
 * @param canvasHeight 렌더된 캔버스 높이 (px)
 */
function collectSectionCutPoints(target: HTMLElement, canvasHeight: number): number[] {
  const targetTop = target.getBoundingClientRect().top;
  const cssHeight = target.scrollHeight || 1;
  // 캔버스는 scale 배율이 적용되어 있으므로 CSS px → 캔버스 px 로 환산한다.
  const ratio = canvasHeight / cssHeight;

  const points = Array.from(target.children)
    .map((child) => {
      const rect = (child as HTMLElement).getBoundingClientRect();
      return Math.round((rect.bottom - targetTop) * ratio);
    })
    .filter((y) => y > 0 && y < canvasHeight);

  return Array.from(new Set(points)).sort((a, b) => a - b);
}
