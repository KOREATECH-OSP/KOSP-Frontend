'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { Loader2, Mail, Save } from 'lucide-react';
import { getAdminContact, updateAdminContact } from '@/lib/api/admin';
import { toast } from '@/lib/toast';

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContact = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const data = await getAdminContact({ accessToken: session.accessToken });
      setEmail(data.email || '');
      setOriginalEmail(data.email || '');
    } catch (error) {
      console.error('Failed to fetch admin contact:', error);
      toast.error('연락처를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchContact();
    }
  }, [session?.accessToken, fetchContact]);

  const handleSave = async () => {
    if (!session?.accessToken) return;

    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      await updateAdminContact({ email }, { accessToken: session.accessToken });
      setOriginalEmail(email);
      toast.success('연락처가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to update admin contact:', error);
      toast.error('연락처 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = email !== originalEmail;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">사이트 설정</h1>
          <p className="mt-0.5 text-sm text-gray-500">사이트 전반의 설정을 관리합니다</p>
        </div>

        {/* 연락처 설정 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Mail className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">관리자 연락처</h2>
              <p className="text-sm text-gray-500">페이지 하단에 표시됩니다</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                이메일 주소
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                disabled={saving}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                사용자들이 문의할 수 있는 관리자 이메일 주소를 입력하세요
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  저장
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
