'use client';

import { signOut } from 'next-auth/react';
import { toast } from '@/lib/toast';

const SIGN_OUT_DEDUPE_MS = 3000;
let lastSignOutAt = 0;

type SignOutOnceOptions = {
  callbackUrl?: string;
  toastMessage?: string;
};

export async function signOutOnce(options: SignOutOnceOptions = {}): Promise<void> {
  const { callbackUrl = '/login', toastMessage } = options;
  const now = Date.now();
  if (now - lastSignOutAt < SIGN_OUT_DEDUPE_MS) return;

  lastSignOutAt = now;

  if (toastMessage) {
    toast.error(toastMessage);
  }

  // 백엔드 로그아웃 API 호출 (refreshToken 삭제)
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // 실패해도 클라이언트 로그아웃은 진행
  }

  signOut({ callbackUrl });
}
