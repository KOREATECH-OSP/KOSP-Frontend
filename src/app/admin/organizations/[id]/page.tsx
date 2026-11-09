'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Trash2,
  Users,
  GitFork,
  UserCheck,
} from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import {
  getOrganizationDetail,
  getAdminOrganizationMembers,
  getAdminOrganizationRepositories,
  syncOrganization,
  deactivateOrganization,
  type OrganizationDetailResponse,
  type AdminOrganizationMemberResponse,
  type AdminOrganizationRepoResponse,
} from '@/lib/api/organization';
import { toast } from '@/lib/toast';
import OrganizationStatusBadge from '@/common/components/organization/OrganizationStatusBadge';

type Tab = 'members' | 'repositories';

const STATUS_LABELS: Record<string, string> = {
  LINKED: 'K-OSP 연동',
  NOT_JOINED: '미가입',
  REMOVED: '탈퇴',
};

const STATUS_STYLES: Record<string, string> = {
  LINKED: 'bg-green-50 text-green-700',
  NOT_JOINED: 'bg-gray-100 text-gray-600',
  REMOVED: 'bg-red-50 text-red-600',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function AdminOrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const orgId = Number(params.id);

  const [detail, setDetail] = useState<OrganizationDetailResponse | null>(null);
  const [members, setMembers] = useState<AdminOrganizationMemberResponse[]>([]);
  const [repos, setRepos] = useState<AdminOrganizationRepoResponse[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!session?.accessToken) return;
    setIsLoadingDetail(true);
    try {
      const data = await getOrganizationDetail(orgId, session.accessToken);
      setDetail(data);
    } catch {
      toast.error('조직 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoadingDetail(false);
    }
  }, [orgId, session?.accessToken]);

  const fetchMembers = useCallback(async () => {
    if (!session?.accessToken) return;
    setIsLoadingTab(true);
    try {
      const data = await getAdminOrganizationMembers(orgId, session.accessToken);
      setMembers(data);
    } catch {
      toast.error('멤버 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingTab(false);
    }
  }, [orgId, session?.accessToken]);

  const fetchRepos = useCallback(async () => {
    if (!session?.accessToken) return;
    setIsLoadingTab(true);
    try {
      const data = await getAdminOrganizationRepositories(orgId, session.accessToken);
      setRepos(data);
    } catch {
      toast.error('저장소 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingTab(false);
    }
  }, [orgId, session?.accessToken]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else {
      fetchRepos();
    }
  }, [activeTab, fetchMembers, fetchRepos]);

  const handleSync = async () => {
    if (!session?.accessToken) return;
    setIsSyncing(true);
    try {
      await syncOrganization(orgId, session.accessToken);
      toast.success('동기화가 완료되었습니다.');
      await fetchDetail();
      if (activeTab === 'members') await fetchMembers();
      else await fetchRepos();
    } catch {
      toast.error('동기화에 실패했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeactivate = async () => {
    if (!session?.accessToken) return;
    setIsDeactivating(true);
    try {
      await deactivateOrganization(orgId, session.accessToken);
      toast.success('조직이 비활성화되었습니다.');
      router.push('/admin/organizations');
    } catch {
      toast.error('비활성화에 실패했습니다.');
    } finally {
      setIsDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  };

  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="px-6 py-6">
      {/* 뒤로가기 */}
      <div className="mb-4">
        <Link
          href="/admin/organizations"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          조직 목록
        </Link>
      </div>

      {/* 조직 헤더 */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
              {detail.avatarUrl ? (
                <Image src={detail.avatarUrl} alt={detail.displayName} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <Building2 className="h-7 w-7" />
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">{detail.displayName}</h1>
                <OrganizationStatusBadge status={detail.status} />
              </div>
              <p className="mt-0.5 text-sm text-gray-500">@{detail.githubOrgName}</p>
              <a
                href={`https://github.com/${detail.githubOrgName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                github.com/{detail.githubOrgName}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              동기화
            </button>
            <button
              type="button"
              onClick={() => setShowDeactivateConfirm(true)}
              disabled={detail.status === 'DISCONNECTED'}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              비활성화
            </button>
          </div>
        </div>

        {/* 통계 */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
            <Users className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-lg font-bold text-gray-900">{detail.totalMemberCount}</p>
              <p className="text-xs text-gray-500">전체 멤버</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
            <UserCheck className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{detail.linkedMemberCount}</p>
              <p className="text-xs text-gray-500">K-OSP 연동</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
            <GitFork className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-lg font-bold text-gray-900">{detail.repositoryCount}</p>
              <p className="text-xs text-gray-500">저장소</p>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="mb-4 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
        {(['members', 'repositories'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900',
            ].join(' ')}
          >
            {tab === 'members' ? `멤버 (${detail.totalMemberCount})` : `저장소 (${detail.repositoryCount})`}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoadingTab ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : activeTab === 'members' ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">GitHub 사용자</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">연동일</th>
                <th className="px-4 py-3">동기화일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                    멤버가 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">@{m.githubUsername}</td>
                    <td className="px-4 py-3 text-gray-500">{m.role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[m.status] ?? m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(m.joinedAt)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(m.syncedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">저장소</th>
                <th className="px-4 py-3">공개 여부</th>
                <th className="px-4 py-3">수집 상태</th>
                <th className="px-4 py-3">동기화일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-gray-400">
                    저장소가 없습니다.
                  </td>
                </tr>
              ) : (
                repos.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a
                        href={r.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-medium text-blue-600 hover:underline"
                      >
                        {r.repositoryFullName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.visibility}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.isActive ? '수집 중' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(r.syncedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 비활성화 확인 모달 */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-gray-900">조직 비활성화</h2>
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-medium text-gray-900">{detail.displayName}</span> 조직을 비활성화하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeactivateConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeactivating && <Loader2 className="h-4 w-4 animate-spin" />}
                비활성화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
