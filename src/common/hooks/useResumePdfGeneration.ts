'use client';

import { useState, useSyncExternalStore } from 'react';
import { generateResumePdf, ResumePdfError } from '@/common/utils/generateResumePdf';

/**
 * 이력서 PDF 생성을 페이지 전체에서 한 번에 하나만 허용하는 훅.
 *
 * <p>이력서 화면에는 PDF 버튼이 여러 벌 있다 (편집 화면 상단 툴바, 하단 고정 바,
 * 미리보기/다운로드). 예전에는 버튼마다 자기 `isGenerating` 상태를 따로 가져서,
 * 상단 버튼이 생성하는 동안 하단 버튼을 누르면 PDF 가 두 번 만들어졌다.
 * 생성 중 여부를 모듈 단위 저장소에 두어 <b>모든 버튼이 같은 값을 보고</b> 함께 비활성화되게 한다.</p>
 *
 * <p>생성 로직 자체는 {@link generateResumePdf} 한 곳에만 있다. 이 훅은 잠금·오류 안내만 담당한다.</p>
 */

let busy = false;
const listeners = new Set<() => void>();

function setBusy(next: boolean) {
  busy = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => busy;
const getServerSnapshot = () => false;

export function useResumePdfGeneration() {
  /** 어느 버튼이든 생성 중이면 true. 모든 버튼의 disabled 에 쓴다. */
  const isBusy = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  /** 이 버튼이 시작한 생성인지. 스피너는 누른 버튼에만 표시한다. */
  const [isOwner, setIsOwner] = useState(false);

  /**
   * PDF 를 생성한다. 이미 다른 버튼이 생성 중이면 아무것도 하지 않고 null 을 돌려준다.
   * 실패하면 사용자에게 알리고 null 을 돌려준다.
   */
  const generate = async (targetId: string): Promise<Blob | null> => {
    if (busy) return null;

    setBusy(true);
    setIsOwner(true);
    try {
      return await generateResumePdf(targetId);
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      alert(
        err instanceof ResumePdfError
          ? err.message
          : 'PDF 생성에 실패했습니다. 다시 시도해주세요.'
      );
      return null;
    } finally {
      setIsOwner(false);
      setBusy(false);
    }
  };

  return { isBusy, isOwner, generate };
}
