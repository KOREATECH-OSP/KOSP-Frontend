'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2, Save, Shield, UserRound, Mail, IdCard } from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import { getAdminUserById, updateAdminUser } from '@/lib/api/admin';
import { ApiException } from '@/lib/api/client';
import type { AdminUserResponse, AdminUserUpdateRequest } from '@/types/admin';
import { toast } from '@/lib/toast';
import { ensureEncodedUrl } from '@/lib/utils';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const userId = Number(params.id);
  const isValidUserId = Number.isInteger(userId) && userId > 0;

  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [formData, setFormData] = useState<AdminUserUpdateRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!session?.accessToken) return;
    if (!isValidUserId) {
      setLoadError('잘못된 사용자 경로입니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getAdminUserById(userId, { accessToken: session.accessToken });
      setUser(data);
      setFormData({
        name: data.name,
        kutId: data.kutId,
        kutEmail: data.kutEmail,
        introduction: data.introduction || '',
        profileImageUrl: data.profileImageUrl || '',
      });
    } catch (error) {
      console.error('Failed to fetch admin user:', error);

      if (error instanceof ApiException && error.status === 404) {
        setLoadError('사용자를 찾을 수 없습니다.');
        return;
      }

      setLoadError('사용자 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [isValidUserId, session?.accessToken, userId]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      void fetchUser();
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchUser, router]);

  const handleChange = <K extends keyof AdminUserUpdateRequest>(key: K, value: AdminUserUpdateRequest[K]) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken || !formData || !user) return;

    if (!formData.name.trim() || !formData.kutId.trim() || !formData.kutEmail.trim()) {
      toast.error('이름, 학번/사번, 이메일은 필수입니다.');
      return;
    }

    setIsSaving(true);

    try {
      await updateAdminUser(
        user.id,
        {
          name: formData.name.trim(),
          kutId: formData.kutId.trim(),
          kutEmail: formData.kutEmail.trim(),
          introduction: formData.introduction?.trim() || '',
          profileImageUrl: formData.profileImageUrl?.trim() || '',
        },
        { accessToken: session.accessToken }
      );

      toast.success('사용자 정보가 수정되었습니다.');
      await fetchUser();
    } catch (error) {
      console.error('Failed to update admin user:', error);
      toast.error(error instanceof Error ? error.message : '사용자 정보 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/users/list')}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            사용자 목록으로
          </button>
          <h1 className="text-xl font-bold text-gray-900">사용자 정보 수정</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            관리자 권한으로 사용자 기본 정보를 수정합니다.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : loadError || !user || !formData ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-gray-600">{loadError || '사용자 정보를 불러올 수 없습니다.'}</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex flex-col items-center text-center">
                {user.profileImageUrl ? (
                  <Image
                    src={ensureEncodedUrl(user.profileImageUrl)}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-900 text-2xl font-semibold text-white">
                    {user.name[0]}
                  </div>
                )}
                <h2 className="mt-4 text-lg font-semibold text-gray-900">{user.name}</h2>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                    >
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
                <div className="mt-4 rounded-full px-3 py-1 text-xs font-medium text-white">
                  <span className={user.isDeleted ? 'rounded-full bg-gray-400 px-3 py-1' : 'rounded-full bg-emerald-500 px-3 py-1'}>
                    {user.isDeleted ? '탈퇴' : '활성'}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-gray-400" />
                  <span>ID {user.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="break-all">{user.kutEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-gray-400" />
                  <span>{user.kutId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>가입일 {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </aside>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                      이름
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="kutId" className="mb-2 block text-sm font-medium text-gray-700">
                      학번/사번
                    </label>
                    <input
                      id="kutId"
                      type="text"
                      value={formData.kutId}
                      onChange={(e) => handleChange('kutId', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="kutEmail" className="mb-2 block text-sm font-medium text-gray-700">
                    KUT 이메일
                  </label>
                  <input
                    id="kutEmail"
                    type="email"
                    value={formData.kutEmail}
                    onChange={(e) => handleChange('kutEmail', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="profileImageUrl" className="mb-2 block text-sm font-medium text-gray-700">
                    프로필 이미지 URL
                  </label>
                  <input
                    id="profileImageUrl"
                    type="url"
                    value={formData.profileImageUrl || ''}
                    onChange={(e) => handleChange('profileImageUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="introduction" className="mb-2 block text-sm font-medium text-gray-700">
                    자기소개
                  </label>
                  <textarea
                    id="introduction"
                    value={formData.introduction || ''}
                    onChange={(e) => handleChange('introduction', e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    placeholder="자기소개를 입력하세요"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/users/list')}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    저장
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
