'use client';

import { useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { uploadFile } from '@/lib/api/upload';

export function useImageUpload() {
  const { data: session } = useSession();

  const upload = useCallback(async (file: File): Promise<string> => {
    if (!session?.accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const result = await uploadFile(file, { accessToken: session.accessToken });
      return result.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }, [session]);

  return { upload };
}
