'use client';

import { useCallback, useState } from 'react';

interface UseImageUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<string> => {
      setError(null);

      if (!allowedTypes.includes(file.type)) {
        const errorMsg =
          '지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP만 가능)';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        const errorMsg = `이미지 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      setIsUploading(true);

      try {
        // Base64로 변환 (기본 동작)
        // 실제 서버 업로드가 필요한 경우 이 부분을 수정하세요
        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('파일 읽기 실패'));
          reader.readAsDataURL(file);
        });
        return url;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
        setError(errorMsg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeMB, allowedTypes]
  );

  return { upload, isUploading, error };
}
