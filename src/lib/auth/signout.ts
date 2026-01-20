'use client';

import { signOut } from 'next-auth/react';
import { toast } from '@/lib/toast';

const SIGN_OUT_DEDUPE_MS = 3000;
let lastSignOutAt = 0;

type SignOutOnceOptions = {
  callbackUrl?: string;
  toastMessage?: string;
};

export function signOutOnce(options: SignOutOnceOptions = {}): void {
  const { callbackUrl = '/login', toastMessage } = options;
  const now = Date.now();
  if (now - lastSignOutAt < SIGN_OUT_DEDUPE_MS) return;

  lastSignOutAt = now;

  if (toastMessage) {
    toast.error(toastMessage);
  }

  signOut({ callbackUrl });
}
