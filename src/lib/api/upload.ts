import { API_BASE_URL } from './config';
import type { FileResponse } from './types';
import { ApiException } from './client';

interface AuthOptions {
  accessToken: string;
}

export async function uploadFile(file: File, auth: AuthOptions): Promise<FileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/v1/files`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${auth.accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiException(401, '로그인이 필요합니다.');
    }
    if (response.status === 403) {
      throw new ApiException(403, '권한이 없습니다.');
    }
    const errorText = await response.text();
    throw new ApiException(response.status, errorText || 'File upload failed');
  }

  const text = await response.text();
  return JSON.parse(text) as FileResponse;
}
