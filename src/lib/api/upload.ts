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
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${auth.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiException(response.status, errorText || 'File upload failed');
  }

  const text = await response.text();
  return JSON.parse(text) as FileResponse;
}
