import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * URL 경로의 한글 등 비 ASCII 문자를 인코딩
 * - 이미 인코딩된 URL은 먼저 디코딩 후 다시 인코딩 (이중 인코딩 방지)
 * - S3 등 외부 저장소 URL의 파일명에 한글이 포함된 경우 브라우저 호환성 문제 해결
 * - null/undefined/빈 문자열은 그대로 반환
 */
export function ensureEncodedUrl(url: string | null | undefined): string {
  if (!url) return url || '';

  try {
    const urlObj = new URL(url);
    const decodedPath = decodeURIComponent(urlObj.pathname);
    urlObj.pathname = decodedPath
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');
    return urlObj.toString();
  } catch {
    // URL 파싱 실패 시 원본 반환
    return url;
  }
}
