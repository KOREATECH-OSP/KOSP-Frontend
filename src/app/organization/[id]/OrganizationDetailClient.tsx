'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Users,
  GitFork,
  Clock,
  EyeOff,
  Shield,
  Crown,
  Lock,
  Globe,
  Search,
  Settings,
  Plus,
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
  fromTab: 'all' | 'mine';
}

type ActiveTab = 'all' | 'members' | 'repositories' | 'settings';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function MemberRoleBadge({ role }: { role: OrganizationMemberResponse['role'] }) {
  if (role === 'OWNER') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">
        <Crown className="h-2.5 w-2.5" />
        OWNER
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 border border-purple-200">
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
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-100">
        K-OSP 연동
      </span>
    );
  }
  if (status === 'EMAIL_PENDING') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200">
        <Clock className="h-2.5 w-2.5" />
        초대 대기
      </span>
    );
  }
  if (status === 'EMAIL_PRIVATE') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 border border-gray-200">
        <EyeOff className="h-2.5 w-2.5" />
        비공개
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 border border-gray-200">
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
  fromTab,
}: OrganizationDetailClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [repos, setRepos] = useState(initialRepos);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [loadingMemberId, setLoadingMemberId] = useState<number | null>(null);
  const [loadingRepoId, setLoadingRepoId] = useState<number | null>(null);
  const [repoSearch, setRepoSearch] = useState('');

  const currentMember = members.find((m) => m.userId === currentUserId);
  const currentRole = currentMember?.role ?? 'MEMBER';
  const canAppoint = currentRole === 'OWNER' || currentRole === 'ADMIN';
  const canDismiss = currentRole === 'OWNER';

  const tags = detail.tags
    ? detail.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

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

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'members', label: '멤버 목록' },
    { key: 'repositories', label: '레포지토리' },
    { key: 'settings', label: '설정하기' },
  ];

  const showMembers = activeTab === 'all' || activeTab === 'members';
  const showRepos = activeTab === 'all' || activeTab === 'repositories';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        {/* 좌측 사이드바 */}
        <aside className="w-56 flex-shrink-0">
          <h2 className="mb-4 text-xl font-bold text-gray-900">조직</h2>
          <nav className="space-y-1">
            <Link
              href="/organization?tab=all"
              className={[
                'block w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                fromTab === 'all'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              전체
            </Link>
            <Link
              href="/organization?tab=mine"
              className={[
                'block w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                fromTab === 'mine'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              내 조직
            </Link>
          </nav>
          <div className="mt-4">
            <Link
              href="/organization/register"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              새로운 조직 만들기
            </Link>
          </div>
        </aside>

        {/* 우측 메인 */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* 뒤로가기 */}
          <Link
            href={`/organization?tab=${fromTab}`}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {fromTab === 'mine' ? '내 조직' : '전체'}
          </Link>

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

              {/* 조직명 + 날짜 */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">{detail.displayName}</h1>
                  <OrganizationStatusBadge status={detail.status} />
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{formatDate(detail.createdAt)}</p>
              </div>

              {/* 톱니바퀴 (Owner/Admin만) */}
              {canAppoint && (
                <Link
                  href={`/organization/${detail.id}/settings`}
                  className="flex-shrink-0 rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                  title="조직 설정"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* 설명 */}
            {detail.description && (
              <p className="mt-3 text-sm text-gray-600">{detail.description}</p>
            )}

            {/* 태그 */}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* GitHub 링크 + 멤버/등록일 */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <a
                href={`https://github.com/${detail.githubOrgName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                GitHub 바로가기
                <ExternalLink className="h-3 w-3" />
              </a>
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

          {/* 탭 */}
          <div className="flex gap-1 border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'settings') {
                    router.push(`/organization/${detail.id}/settings`);
                  } else {
                    setActiveTab(tab.key);
                  }
                }}
                className={[
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.key && tab.key !== 'settings'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 조직 멤버 목록 */}
          {showMembers && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">조직 멤버 목록</p>
                {canAppoint && (
                  <Link
                    href={`/organization/${detail.id}/settings?section=members`}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                    title="멤버 설정"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {members.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {members.map((member) => {
                    const isLoading = loadingMemberId === member.id;
                    const isMe = member.userId === currentUserId;
                    return (
                      <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                          <Image
                            src={`https://github.com/${member.githubUsername}.png`}
                            alt={member.githubUsername}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
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
          )}

          {/* 연동 레포지토리 */}
          {showRepos && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <GitFork className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">연동 레포지토리</p>
                </div>
              </div>

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
                              {repo.visibility === 'public' ? '공개여부' : '비공개'}
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
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GitFork className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">연동된 레포지토리가 없습니다.</p>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
