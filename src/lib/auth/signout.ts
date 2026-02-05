'use client';

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

  // 세션 삭제 API 호출
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch {
    // 실패해도 클라이언트 로그아웃은 진행
  }

  // 페이지 이동
  window.location.href = callbackUrl;
}
