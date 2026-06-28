'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import {
  getAvailableOrganizations,
  registerOrganization,
  type AvailableOrganizationResponse,
} from '@/lib/api/organization';
import { ApiException } from '@/lib/api/client';
import { toast } from '@/lib/toast';

export default function OrganizationRegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [orgs, setOrgs] = useState<AvailableOrganizationResponse[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/organization/register');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;

    const fetchOrgs = async () => {
      setIsFetching(true);
      try {
        const data = await getAvailableOrganizations(session.accessToken);
        setOrgs(data);
      } catch (error) {
        if (error instanceof ApiException && error.status === 403) {
          toast.error(
            'GitHub read:org 권한이 필요합니다. GitHub 계정으로 재로그인해주세요.',
            { duration: 6000 }
          );
        } else {
          toast.error('조직 목록을 불러오지 못했습니다.');
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrgs();
  }, [status, session?.accessToken]);

  const handleRegister = async () => {
    if (selectedOrgId === null || !session?.accessToken) return;

    setIsSubmitting(true);
    try {
      await registerOrganization({ githubOrgId: selectedOrgId }, session.accessToken);
      toast.success('조직이 등록되었습니다.');
      router.push('/organization');
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.status === 403) {
          toast.error(
            'GitHub read:org 권한이 필요합니다. GitHub 계정으로 재로그인해주세요.',
            { duration: 6000 }
          );
        } else if (error.message.includes('ORGANIZATION_ALREADY_REGISTERED')) {
          toast.error('이미 등록된 조직입니다.');
        } else if (error.message.includes('ORGANIZATION_OWNER_REQUIRED')) {
          toast.error('조직 Owner만 등록할 수 있습니다.');
        } else {
          toast.error(error.message || '조직 등록에 실패했습니다.');
        }
      } else {
        toast.error('조직 등록에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      {/* 상단 네비게이션 */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/organization"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          내 조직
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">조직 등록</h1>
        <p className="mt-1 text-sm text-gray-500">
          GitHub에서 Owner 권한을 가진 Organization을 K-OSP에 등록할 수 있습니다.
        </p>
      </div>

      {/* 조직 목록 */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="mb-3 h-8 w-8 animate-spin" />
          <p className="text-sm">GitHub에서 조직 목록을 불러오는 중...</p>
        </div>
      ) : orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <Building2 className="mb-4 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">등록 가능한 조직이 없습니다.</p>
          <p className="mt-1 text-xs text-gray-400">
            GitHub에서 Owner 권한을 가진 조직만 등록할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            등록할 조직을 선택하세요 ({orgs.length}개)
          </p>
          {orgs.map((org) => {
            const isSelected = selectedOrgId === org.githubOrgId;
            const isDisabled = org.alreadyRegistered;

            return (
              <button
                key={org.githubOrgId}
                type="button"
                disabled={isDisabled}
                onClick={() => setSelectedOrgId(org.githubOrgId)}
                className={[
                  'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all',
                  isDisabled
                    ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                    : isSelected
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                ].join(' ')}
              >
                {/* 아바타 */}
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {org.avatarUrl ? (
                    <Image src={org.avatarUrl} alt={org.githubOrgName} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* 조직명 */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{org.githubOrgName}</p>
                  <p className="truncate text-xs text-gray-400">github.com/{org.githubOrgName}</p>
                </div>

                {/* 상태 표시 */}
                {isDisabled ? (
                  <span className="flex-shrink-0 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500">
                    이미 등록됨
                  </span>
                ) : isSelected ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-500" />
                ) : (
                  <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 안내 문구 */}
      <p className="mt-4 text-xs text-gray-400">
        비공개 조직의 경우 멤버 목록이 누락될 수 있습니다.
      </p>

      {/* 등록 버튼 */}
      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/organization"
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
        >
          취소
        </Link>
        <button
          type="button"
          disabled={selectedOrgId === null || isSubmitting}
          onClick={handleRegister}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              등록 중...
            </>
          ) : (
            '등록하기'
          )}
        </button>
      </div>
    </div>
  );
}
