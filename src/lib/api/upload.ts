import { API_BASE_URL } from './config';
import type { UploadUrlResponse } from './types';
import { ApiException } from './client';

interface AuthOptions {
  accessToken: string;
}

export interface UploadResult {
  url: string;
}

/**
 * URL 경로 부분의 한글 등 비 ASCII 문자를 인코딩
 * - 이미 인코딩된 URL은 먼저 디코딩 후 다시 인코딩 (이중 인코딩 방지)
 * - S3 URL의 파일명에 한글이 포함된 경우 브라우저 호환성 문제 해결
 */
function encodeUrlPath(url: string): string {
  try {
    const urlObj = new URL(url);
    // pathname을 디코딩 후 다시 인코딩 (이중 인코딩 방지)
    // decodeURIComponent는 개별 컴포넌트 디코딩, encodeURI는 전체 경로 인코딩
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

/**
 * Presigned URL을 이용한 파일 업로드
 * 1. 서버에서 presigned URL 획득
 * 2. presigned URL로 S3에 직접 업로드
 * 3. 최종 파일 URL 반환
 */
export async function uploadFile(file: File, auth: AuthOptions): Promise<UploadResult> {
  // 1. Presigned URL 요청
  const presignedResponse = await fetch(`${API_BASE_URL}/v1/upload/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.accessToken}`,
    },
    body: JSON.stringify({
      file_name: file.name,
      content_length: file.size,
      content_type: file.type || 'application/octet-stream',
    }),
  });

  if (!presignedResponse.ok) {
    if (presignedResponse.status === 401) {
      throw new ApiException(401, '로그인이 필요합니다.');
    }
    if (presignedResponse.status === 403) {
      throw new ApiException(403, '권한이 없습니다.');
    }
    const errorText = await presignedResponse.text();
    throw new ApiException(presignedResponse.status, errorText || 'Presigned URL 생성에 실패했습니다.');
  }

  const uploadUrlData: UploadUrlResponse = await presignedResponse.json();

  // 2. Presigned URL로 S3에 파일 업로드
  const s3Response = await fetch(uploadUrlData.pre_signed_url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!s3Response.ok) {
    throw new ApiException(s3Response.status, 'S3 파일 업로드에 실패했습니다.');
  }

  // 3. 최종 파일 URL 반환 (한글 파일명 인코딩 처리)
  return {
    url: encodeUrlPath(uploadUrlData.file_url),
  };
}
