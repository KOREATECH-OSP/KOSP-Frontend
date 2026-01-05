import { API_BASE_URL } from './config';
import type { FileResponse } from './types';
import { ApiException } from './client';

/**
 * 파일 업로드
 * Note: clientApiClient uses JSON body, so we use fetch directly for FormData
 */
export async function uploadFile(file: File): Promise<FileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/v1/files`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiException(response.status, errorText || 'File upload failed');
  }

  const text = await response.text();
  return JSON.parse(text) as FileResponse;
}
