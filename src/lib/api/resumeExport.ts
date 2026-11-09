import { API_BASE_URL } from './config';
import { ApiException } from './client';

/**
 * 이력서 hwpx(한글) 내려받기 API.
 *
 * <p>일반 API 와 달리 응답이 JSON 이 아니라 바이너리다. 그래서 {@link clientApiClient} 를
 * 쓰지 않는다 — 그 함수는 본문을 {@code JSON.parse} 하므로 hwpx 바이트가 들어오면 깨진다.</p>
 *
 * <p>PDF 는 브라우저에서 만들지만(generateResumePdf) hwpx 는 서버가 만든다.
 * 브라우저가 hwpx 를 렌더링하지 못하므로 미리보기는 제공하지 않고 내려받기만 한다.</p>
 */

/** 서버가 내려주는 hwpx 의 MIME 타입. */
export const HWPX_MIME_TYPE = 'application/vnd.hancom.hwpx';

/**
 * 내려받은 hwpx 파일.
 *
 * @property blob     파일 내용
 * @property fileName 응답 헤더에서 읽어낸 파일명. 읽지 못하면 null (아래 주의 참고)
 */
export interface HwpxDownload {
  blob: Blob;
  fileName: string | null;
}

/**
 * {@code Content-Disposition} 헤더에서 파일명을 읽는다.
 *
 * <p>백엔드({@code ContentDispositionUtil})는 파일명에 한글이 들어가므로
 * RFC 5987 의 {@code filename*=UTF-8''<percent-encoded>} 형식으로 내려준다.
 * 구형 형식({@code filename="..."})도 함께 받아들인다.</p>
 *
 * @returns 파일명. 헤더가 없거나 해석할 수 없으면 null
 */
export function parseContentDispositionFileName(header: string | null): string | null {
  if (!header) {
    return null;
  }

  // RFC 5987: filename*=UTF-8''%EC%9D%B4%EB%A0%A5%EC%84%9C.hwpx
  const extended = /filename\*\s*=\s*([^']*)'([^']*)'([^;]+)/i.exec(header);
  if (extended) {
    try {
      return decodeURIComponent(extended[3].trim());
    } catch {
      // 잘못된 퍼센트 인코딩이면 구형 형식으로 넘어간다.
    }
  }

  // 구형: filename="이력서.hwpx" 또는 filename=이력서.hwpx
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  if (plain) {
    const value = plain[1].trim();
    return value.length > 0 ? value : null;
  }

  return null;
}

/**
 * hwpx 엔드포인트를 호출해 파일을 받는다.
 *
 * <p>⚠️ <b>파일명이 null 로 올 수 있다.</b> 프론트와 API 는 출처(origin)가 다르고,
 * 백엔드 CORS 설정({@code CorsConfig})에 {@code exposedHeaders} 가 없다.
 * CORS 규칙상 {@code Content-Disposition} 은 기본 노출 헤더가 아니므로,
 * 브라우저가 JS 에게 이 헤더를 넘겨주지 않아 {@code headers.get()} 이 null 을 돌려준다.
 * 파일 자체는 정상이고 헤더만 못 읽는 것이라, 호출측이 파일명을 대체해야 한다.
 * (백엔드에 {@code setExposedHeaders(List.of("Content-Disposition"))} 한 줄을 넣으면
 * 서버가 준 파일명을 그대로 쓸 수 있다.)</p>
 */
async function fetchHwpx(endpoint: string, accessToken?: string | null): Promise<HwpxDownload> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    throw new ApiException(0, '서버에 연결할 수 없습니다.');
  }

  if (!response.ok) {
    // 본문이 JSON 에러일 수도, 비어 있을 수도 있다. 어느 쪽이든 메시지로 바꾼다.
    let message: string;
    if (response.status === 401) {
      message = '로그인이 필요합니다.';
    } else if (response.status === 404) {
      message = '이력서를 찾을 수 없거나 공개되지 않았습니다.';
    } else {
      message = '한글 파일을 받지 못했습니다.';
    }
    throw new ApiException(response.status, message);
  }

  const blob = await response.blob();
  const fileName = parseContentDispositionFileName(response.headers.get('Content-Disposition'));

  return { blob, fileName };
}

/**
 * 내 이력서를 hwpx 로 내려받는다.
 *
 * @param resumeId    이력서 식별자
 * @param accessToken 인증 토큰 (필수 — 본인 이력서만 허용된다)
 */
export async function downloadMyResumeHwpx(
  resumeId: number,
  accessToken: string,
): Promise<HwpxDownload> {
  return fetchHwpx(`/v1/users/me/resumes/${resumeId}/hwpx`, accessToken);
}

/**
 * 타인의 공개 이력서를 hwpx 로 내려받는다. 인증이 필요 없다.
 *
 * @param userId   이력서 소유자 식별자
 * @param resumeId 이력서 식별자
 */
export async function downloadPublicResumeHwpx(
  userId: number,
  resumeId: number,
): Promise<HwpxDownload> {
  return fetchHwpx(`/v1/users/${userId}/resumes/${resumeId}/hwpx`);
}
