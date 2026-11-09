'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, ExternalLink, FileText, Loader2, X } from 'lucide-react';
import { downloadBlob } from '@/common/utils/generateResumePdf';
import {
  downloadMyResumeHwpx,
  downloadPublicResumeHwpx,
  type HwpxDownload,
} from '@/lib/api/resumeExport';

/**
 * hwpx 를 어느 엔드포인트에서 받아올지 나타내는 서술자.
 *
 * <p>본인 이력서와 공개 이력서는 URL 도 인증 방식도 다르다. 모달이 두 경우를
 * 분기 없이 다루도록 판별 유니온으로 받는다.</p>
 */
export type HwpxSource =
  | { kind: 'mine'; resumeId: number; accessToken: string }
  | { kind: 'public'; userId: number; resumeId: number };

interface PdfPreviewModalProps {
  /** 미리보기에 표시할 PDF. 다운로드도 반드시 이 Blob 을 그대로 쓴다. */
  blob: Blob;
  /** 다운로드될 파일명 (.pdf 포함) */
  fileName: string;
  /**
   * hwpx 내려받기 정보. 주지 않으면 한글 다운로드 버튼을 표시하지 않는다
   * (이력서 id 를 모르는 화면에서도 미리보기는 쓸 수 있어야 하므로 선택 항목이다).
   */
  hwpxSource?: HwpxSource;
  onClose: () => void;
}

/**
 * iOS(WebKit) 여부.
 *
 * <p>iOS 는 `<iframe>` 안의 PDF 를 인라인으로 렌더하지 않고 첫 페이지만 보여주거나
 * 빈 화면을 띄운다. iOS 의 모든 브라우저는 WebKit 을 쓰도록 강제되므로 Safari 뿐 아니라
 * Chrome·Firefox(iOS 판)도 같은 제약을 받는다. 따라서 브라우저가 아니라 iOS 자체를 판별한다.</p>
 *
 * <p>iPadOS 13+ 는 데스크톱 Safari 로 위장하므로 `MacIntel` + 터치포인트로 추가 판별한다.</p>
 */
function isIosLike(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

/**
 * 생성된 PDF 를 다운로드 전에 확인하는 모달.
 *
 * <p>미리보기와 PDF 다운로드가 <b>동일한 Blob</b> 을 쓴다. 이 컴포넌트는 PDF 를 만들지 않고
 * 이미 만들어진 Blob 만 받는다 — 여기서 다시 생성하면 미리보기와 다운로드 결과가
 * 달라질 수 있기 때문이다.</p>
 *
 * <p>한글(hwpx)은 성격이 다르다. 브라우저가 렌더링하지 못해 미리보기를 만들 수 없으므로
 * 서버가 생성한 파일을 그대로 받아 저장하기만 한다. 즉 <b>미리보기 화면은 PDF 기준</b>이고
 * 한글 파일은 서식이 단순해진다 — 이 차이를 모달 안에 문장으로 밝혀 둔다.</p>
 */
export default function PdfPreviewModal({
  blob,
  fileName,
  hwpxSource,
  onClose,
}: PdfPreviewModalProps) {
  // 이 모달은 사용자가 미리보기를 누른 뒤에만 마운트되므로 SSR 을 타지 않는다.
  // 따라서 navigator 를 렌더 중에 읽어도 hydration 불일치가 생기지 않는다.
  const useIframe = useMemo(() => !isIosLike(), []);

  // Blob → object URL. 같은 Blob 이면 같은 URL 을 유지한다.
  const objectUrl = useMemo(() => URL.createObjectURL(blob), [blob]);

  // 한글 다운로드 상태. 실패는 alert 가 아니라 모달 안에 띄운다
  // (모달이 열려 있는 동안 alert 를 쓰면 맥락이 끊기고 스크린리더 흐름도 깨진다).
  const [isDownloadingHwpx, setIsDownloadingHwpx] = useState(false);
  const [hwpxError, setHwpxError] = useState<string | null>(null);

  // 언마운트(또는 Blob 교체) 시 반드시 해제한다.
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  // ESC 로 닫기
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  /**
   * 한글 파일을 받아 저장한다.
   *
   * <p>파일명은 서버가 {@code Content-Disposition} 으로 준 값을 우선한다. 다만 CORS 상
   * 그 헤더를 읽지 못하는 환경이 있어(자세한 사정은 {@code resumeExport.ts} 주석 참고)
   * null 이면 PDF 와 같은 이름에 확장자만 바꿔 쓴다.</p>
   */
  const handleDownloadHwpx = async () => {
    if (!hwpxSource || isDownloadingHwpx) return;

    setIsDownloadingHwpx(true);
    setHwpxError(null);
    try {
      const result: HwpxDownload =
        hwpxSource.kind === 'mine'
          ? await downloadMyResumeHwpx(hwpxSource.resumeId, hwpxSource.accessToken)
          : await downloadPublicResumeHwpx(hwpxSource.userId, hwpxSource.resumeId);

      downloadBlob(result.blob, result.fileName ?? fallbackHwpxName(fileName));
    } catch (err) {
      console.error('hwpx 다운로드 실패:', err);
      setHwpxError(
        err instanceof Error && err.message
          ? err.message
          : '한글 파일을 받지 못했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsDownloadingHwpx(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="이력서 PDF 미리보기"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5 py-3">
          <h2 className="truncate text-sm font-semibold text-gray-900">
            미리보기 · {fileName}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => downloadBlob(blob, fileName)}
              className="flex items-center gap-1.5 rounded-lg bg-orange-400 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-500"
            >
              <Download className="h-3.5 w-3.5" />
              PDF 다운로드
            </button>

            {hwpxSource && (
              <button
                type="button"
                onClick={handleDownloadHwpx}
                disabled={isDownloadingHwpx}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                {isDownloadingHwpx ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    준비 중…
                  </>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5" />
                    한글 다운로드
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 포맷 차이 안내 — 사용자가 결과물의 차이를 미리 예상할 수 있어야 한다 */}
        {hwpxSource && (
          <p className="shrink-0 border-b border-gray-100 bg-gray-50 px-5 py-2 text-xs text-gray-500">
            미리보기는 PDF 기준이며, 한글(.hwpx) 파일은 서식이 단순화됩니다.
          </p>
        )}

        {/* 한글 다운로드 실패 메시지 */}
        {hwpxError && (
          <div
            role="alert"
            className="flex shrink-0 items-start gap-2 border-b border-red-100 bg-red-50 px-5 py-2.5 text-xs text-red-600"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">{hwpxError}</span>
            <button
              type="button"
              onClick={() => setHwpxError(null)}
              aria-label="오류 메시지 닫기"
              className="shrink-0 rounded p-0.5 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 본문 */}
        <div className="min-h-0 flex-1 bg-gray-100">
          {useIframe ? (
            <iframe
              src={objectUrl}
              title="이력서 PDF 미리보기"
              className="h-full w-full border-0"
            />
          ) : (
            // iOS 폴백: iframe 인라인 렌더가 동작하지 않으므로 새 탭으로 연다.
            // 여는 대상도 같은 Blob 의 object URL 이라 다운로드 결과와 동일하다.
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-gray-500">
                이 브라우저는 PDF를 화면 안에서 바로 보여주지 못합니다.
                <br />
                새 탭에서 열어 확인해주세요.
              </p>
              <a
                href={objectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                새 탭에서 열기
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 서버가 준 파일명을 쓰지 못할 때 대신 만들 hwpx 파일명.
 *
 * <p>PDF 파일명({@code 이력서.pdf})의 확장자만 바꾼다.</p>
 */
function fallbackHwpxName(pdfFileName: string): string {
  const base = pdfFileName.replace(/\.pdf$/i, '');
  return `${base}.hwpx`;
}
