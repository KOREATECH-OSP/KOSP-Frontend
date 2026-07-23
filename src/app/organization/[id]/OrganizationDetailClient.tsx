'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Users,
  GitFork,
  UserCheck,
  Clock,
  EyeOff,
  Shield,
  Crown,
  Lock,
  Globe,
  Search,
  Settings,
} from 'lucide-react';
import type {
  OrganizationDetailResponse,
  OrganizationMemberResponse,
  OrganizationRepoResponse,
} from '@/lib/api/organization';
import {
  appointOrganizationAdmin,
  dismissOrganizationAdmin,
  activateOrganizationRepo,
  deactivateOrganizationRepo,
} from '@/lib/api/organization';
import OrganizationStatusBadge from '@/common/components/organization/OrganizationStatusBadge';

interface OrganizationDetailClientProps {
  detail: OrganizationDetailResponse;
  members: OrganizationMemberResponse[];
  repos: OrganizationRepoResponse[];
  currentUserId: number;
  accessToken: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function MemberRoleBadge({ role }: { role: OrganizationMemberResponse['role'] }) {
  if (role === 'OWNER') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-200">
        <Crown className="h-2.5 w-2.5" />
        OWNER
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 border border-purple-200">
        <Shield className="h-2.5 w-2.5" />
        관리자
      </span>
    );
  }
  return null;
}

function MemberStatusBadge({ status }: { status: OrganizationMemberResponse['status'] }) {
  if (status === 'LINKED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
        K-OSP 연동
      </span>
    );
  }
  if (status === 'EMAIL_PENDING') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 border border-gray-200">
        <Clock className="h-2.5 w-2.5" />
        초대 대기
      </span>
    );
  }
  if (status === 'EMAIL_PRIVATE') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 border border-gray-200">
        <EyeOff className="h-2.5 w-2.5" />
        비공개
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 border border-gray-200">
      미가입
    </span>
  );
}

function MemberStatusDesc({ status }: { status: OrganizationMemberResponse['status'] }) {
  if (status === 'LINKED') return <span className="text-xs text-blue-500">K-OSP에 가입되어 있습니다</span>;
  if (status === 'EMAIL_PENDING') return <span className="text-xs text-gray-400">초대 메일을 발송했습니다</span>;
  if (status === 'EMAIL_PRIVATE') return <span className="text-xs text-gray-400">이메일이 비공개 상태입니다</span>;
  return <span className="text-xs text-gray-400">K-OSP에 가입되지 않았습니다</span>;
}

export default function OrganizationDetailClient({
  detail,
  members: initialMembers,
  repos: initialRepos,
  currentUserId,
  accessToken,
}: OrganizationDetailClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [repos, setRepos] = useState(initialRepos);
  const [loadingMemberId, setLoadingMemberId] = useState<number | null>(null);
  const [loadingRepoId, setLoadingRepoId] = useState<number | null>(null);
  const [repoSearch, setRepoSearch] = useState('');

  const currentMember = members.find((m) => m.userId === currentUserId);
  const currentRole = currentMember?.role ?? 'MEMBER';
  const canAppoint = currentRole === 'OWNER' || currentRole === 'ADMIN';
  const canDismiss = currentRole === 'OWNER';

  const linkedPercent =
    detail.totalMemberCount > 0
      ? Math.round((detail.linkedMemberCount / detail.totalMemberCount) * 100)
      : 0;

  const filteredRepos = repos.filter((r) =>
    r.repositoryName.toLowerCase().includes(repoSearch.toLowerCase())
  );

  async function handleAppoint(memberId: number) {
    setLoadingMemberId(memberId);
    try {
      await appointOrganizationAdmin(detail.id, memberId, accessToken);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: 'ADMIN' as const } : m))
      );
    } catch {
      alert('관리자 임명에 실패했습니다.');
    } finally {
      setLoadingMemberId(null);
    }
  }

  async function handleDismiss(memberId: number) {
    setLoadingMemberId(memberId);
    try {
      await dismissOrganizationAdmin(detail.id, memberId, accessToken);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: 'MEMBER' as const } : m))
      );
    } catch {
      alert('관리자 해임에 실패했습니다.');
    } finally {
      setLoadingMemberId(null);
    }
  }

  async function handleRepoToggle(repoId: number, currentActive: boolean) {
    setLoadingRepoId(repoId);
    try {
      if (currentActive) {
        await deactivateOrganizationRepo(detail.id, repoId, accessToken);
      } else {
        await activateOrganizationRepo(detail.id, repoId, accessToken);
      }
      setRepos((prev) =>
        prev.map((r) => (r.id === repoId ? { ...r, isActive: !currentActive } : r))
      );
    } catch {
      alert('저장소 상태 변경에 실패했습니다.');
    } finally {
      setLoadingRepoId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      {/* 뒤로가기 */}
      <div className="mb-6">
        <Link
          href="/organization"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          내 조직
        </Link>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="flex gap-6 items-start">
        {/* ── 왼쪽 사이드바 ── */}
        <div className="w-60 flex-shrink-0 space-y-4">
          {/* 조직 현황 제목 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">조직 현황</p>

            {/* 연동률 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                  K-OSP 멤버 연동률
                </div>
                <span className="text-xs font-bold text-blue-600">{linkedPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${linkedPercent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                연동 멤버 {detail.linkedMemberCount} / {detail.totalMemberCount}명
              </p>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-100 my-3" />

            {/* 연동 레포지토리 */}
            <div className="flex items-center gap-2">
              <GitFork className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">연동 레포지토리</span>
              <span className="ml-auto text-xs font-bold text-gray-800">
                {detail.repositoryCount}개
              </span>
            </div>
          </div>
        </div>

        {/* ── 오른쪽 메인 콘텐츠 ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* 조직 기본 정보 카드 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start gap-4">
              {/* 아바타 */}
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
                {detail.avatarUrl ? (
                  <Image
                    src={detail.avatarUrl}
                    alt={detail.displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Building2 className="h-7 w-7" />
                  </div>
                )}
              </div>

              {/* 조직명 + 상태 + GitHub 링크 */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">{detail.displayName}</h1>
                  <OrganizationStatusBadge status={detail.status} />
                </div>
                <p className="mt-0.5 text-xs text-gray-400">@{detail.githubOrgName}</p>
                <a
                  href={`https://github.com/${detail.githubOrgName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  바로가기 링크
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* 설정 버튼 (Owner/Admin만) */}
              {canAppoint && (
                <button
                  className="flex-shrink-0 rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                  title="조직 설정"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* 멤버 수 + 등록일 */}
            <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                멤버 {detail.totalMemberCount}명
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(detail.createdAt)} 등록
              </span>
            </div>
          </div>

          {/* 조직 멤버 목록 */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">조직 멤버 목록</p>
              <span className="text-xs text-gray-400">{members.length}명</span>
            </div>

            {members.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {members.map((member) => {
                  const isLoading = loadingMemberId === member.id;
                  const isMe = member.userId === currentUserId;
                  return (
                    <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                      {/* GitHub 아바타 */}
                      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                        <Image
                          src={`https://github.com/${member.githubUsername}.png`}
                          alt={member.githubUsername}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* 이름 + 역할 + 상태 */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">
                            {member.githubUsername}
                          </span>
                          {isMe && (
                            <span className="text-[10px] text-gray-400 font-medium">나</span>
                          )}
                          <MemberRoleBadge role={member.role} />
                          <MemberStatusBadge status={member.status} />
                        </div>
                        <MemberStatusDesc status={member.status} />
                      </div>

                      {/* 관리자 임명/해임 버튼 */}
                      {!isMe && member.role !== 'OWNER' && (
                        <div className="flex-shrink-0">
                          {member.role === 'MEMBER' && canAppoint && (
                            <button
                              onClick={() => handleAppoint(member.id)}
                              disabled={isLoading}
                              className="text-xs px-2 py-1 rounded-md border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50 transition-colors"
                            >
                              {isLoading ? '처리 중...' : '관리자 임명'}
                            </button>
                          )}
                          {member.role === 'ADMIN' && canDismiss && (
                            <button
                              onClick={() => handleDismiss(member.id)}
                              disabled={isLoading}
                              className="text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                              {isLoading ? '처리 중...' : '관리자 해임'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                멤버 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>

          {/* 연동 레포지토리 목록 */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <GitFork className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">연동 레포지토리</p>
              </div>
            </div>

            {/* 검색 */}
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="레포지토리를 검색해보세요."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  className="w-full rounded-md border border-gray-200 py-2 pl-8 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* 목록 또는 빈 상태 */}
            {filteredRepos.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredRepos.map((repo) => {
                  const isLoading = loadingRepoId === repo.id;
                  return (
                    <div key={repo.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-shrink-0">
                        {repo.visibility === 'public' ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={repo.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-gray-900 hover:text-blue-600 hover:underline"
                          >
                            {repo.repositoryName}
                          </a>
                          <span
                            className={[
                              'rounded-full px-2 py-0.5 text-[10px] font-bold border',
                              repo.visibility === 'public'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : 'bg-gray-100 text-gray-500 border-gray-200',
                            ].join(' ')}
                          >
                            {repo.visibility === 'public' ? '공개' : '비공개'}
                          </span>
                          {!repo.isActive && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold border bg-orange-50 text-orange-500 border-orange-100">
                              비활성
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400">{repo.repositoryFullName}</p>
                      </div>

                      {canAppoint && (
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleRepoToggle(repo.id, repo.isActive)}
                            disabled={isLoading}
                            className={[
                              'text-xs px-2.5 py-1 rounded-md border transition-colors disabled:opacity-50',
                              repo.isActive
                                ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                : 'border-blue-200 text-blue-600 hover:bg-blue-50',
                            ].join(' ')}
                          >
                            {isLoading ? '처리 중...' : repo.isActive ? '비활성화' : '활성화'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : repos.length === 0 ? (
              /* 연동된 레포지토리가 아예 없는 경우 */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GitFork className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">연동된 레포지토리가 없습니다.</p>
                <p className="mt-1 text-xs text-gray-400">
                  조직에서 연동한 레포지토리가 생기면 이곳에 표시됩니다.
                </p>
              </div>
            ) : (
              /* 검색 결과 없음 */
              <div className="py-8 text-center text-sm text-gray-400">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
