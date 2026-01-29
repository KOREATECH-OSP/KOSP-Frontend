'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/lib/auth/AuthContext';
import {
  Users,
  UserPlus,
  Crown,
  UserMinus,
  Settings,
  Megaphone,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { updateRecruitStatus, deleteRecruit } from '@/lib/api/recruit';
import { inviteTeamMember } from '@/lib/api/team';
import type { TeamDetailResponse, RecruitResponse, RecruitStatus } from '@/lib/api/types';

type UserRole = 'leader' | 'member' | 'guest';

interface TeamDetailClientProps {
  team: TeamDetailResponse;
  recruits: RecruitResponse[];
}

export default function TeamDetailClient({ team: initialTeam, recruits: initialRecruits }: TeamDetailClientProps) {
  const { data: session } = useSession();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmailId, setInviteEmailId] = useState('');

  const [team] = useState(initialTeam);
  const [recruits, setRecruits] = useState(initialRecruits);
  const [activeRecruitMenu, setActiveRecruitMenu] = useState<number | null>(null);
  const [statusChangeModal, setStatusChangeModal] = useState<{ recruitId: number; currentStatus: RecruitStatus } | null>(null);

  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  const currentUserRole: UserRole = !session
    ? 'guest'
    : team.members?.some((m) => m.role === 'LEADER' && m.id === currentUserId)
      ? 'leader'
      : team.members?.some((m) => m.id === currentUserId)
        ? 'member'
        : 'guest';

  const canEditTeam = () => currentUserRole === 'leader';
  const canInviteMember = () => currentUserRole === 'leader' || currentUserRole === 'member';
  const canRemoveMember = () => currentUserRole === 'leader';

  const handleInvite = async () => {
    if (!inviteEmailId.trim()) {
      toast.error('이메일 아이디를 입력해주세요');
      return;
    }

    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      await inviteTeamMember(team.id, inviteEmailId.trim(), session.accessToken);
      toast.success('초대가 전송되었습니다.');
      setInviteEmailId('');
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error('팀원 초대 실패:', error);
      const message = error instanceof Error ? error.message : '팀원 초대에 실패했습니다.';
      toast.error(message);
    }
  };

  const handleRemoveMember = () => {
    toast.info('아직 준비 중인 기능입니다.');
  };

  const openStatusChangeModal = (recruitId: number, currentStatus: RecruitStatus) => {
    setStatusChangeModal({ recruitId, currentStatus });
    setActiveRecruitMenu(null);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeModal || !session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    const { recruitId, currentStatus } = statusChangeModal;
    const newStatus: RecruitStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';

    try {
      await updateRecruitStatus(recruitId, { status: newStatus }, { accessToken: session.accessToken });
      setRecruits((prev) =>
        prev.map((r) => (r.id === recruitId ? { ...r, status: newStatus } : r))
      );
      toast.success(newStatus === 'OPEN' ? '모집을 재개했습니다.' : '모집을 마감했습니다.');
    } catch (error) {
      console.error('모집 상태 변경 실패:', error);
      toast.error('모집 상태 변경에 실패했습니다.');
    }
    setStatusChangeModal(null);
  };

  const handleDeleteRecruit = async (recruitId: number) => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!confirm('정말 이 모집공고를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteRecruit(recruitId, { accessToken: session.accessToken });
      setRecruits((prev) => prev.filter((r) => r.id !== recruitId));
      toast.success('모집공고가 삭제되었습니다.');
    } catch (error) {
      console.error('모집공고 삭제 실패:', error);
      toast.error('모집공고 삭제에 실패했습니다.');
    }
    setActiveRecruitMenu(null);
  };

  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDday = (endDate: string | null) => {
    const daysLeft = getDaysLeft(endDate);
    if (daysLeft === null) return '상시모집';
    if (daysLeft < 0) return '마감됨';
    if (daysLeft === 0) return 'D-Day';
    return `D-${daysLeft}`;
  };

  const leader = team.members?.find((m) => m.role === 'LEADER');
  const members = team.members ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Left Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Navigation */}
              <div className="hidden"></div>

              {/* Team Info Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-bold text-gray-900">팀 현황</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-gray-900">
                    {members.length}
                  </span>
                  <span className="text-xs font-medium text-gray-500">명의 멤버</span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">팀장</span>
                    <div className="flex items-center gap-1.5">
                      {leader?.profileImage && (
                        <Image src={leader.profileImage} alt="" width={18} height={18} className="rounded-full" />
                      )}
                      <span className="font-medium text-gray-900">{leader?.name ?? '미지정'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">모집 공고</span>
                    <span className="font-medium text-gray-900">{recruits.length}개</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">진행중 모집</span>
                    <span className="font-medium text-emerald-600">
                      {recruits.filter(r => {
                        const daysLeft = getDaysLeft(r.endDate);
                        const isExpired = daysLeft !== null && daysLeft < 0;
                        return r.status === 'OPEN' && !isExpired;
                      }).length}개
                    </span>
                  </div>
                </div>

                {canInviteMember() && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="mt-5 w-full rounded-lg bg-gray-900 py-2.5 text-xs font-bold text-white transition-all hover:bg-black active:scale-[0.98]"
                  >
                    팀원 초대하기
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              {canEditTeam() && (
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 px-1">빠른 작업</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/team/${team.id}/create`}
                      className="group block rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                          <Megaphone className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 group-hover:underline">새 모집공고 작성</h4>
                        </div>
                      </div>
                    </Link>
                    <Link
                      href={`/team/${team.id}/settings`}
                      className="group block rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                          <Settings className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 group-hover:underline">팀 정보 수정</h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 space-y-6">
            {/* Team Header Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-300 overflow-hidden">
                    {team.imageUrl ? (
                      <Image
                        src={team.imageUrl}
                        alt={team.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Users className="h-10 w-10" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {team.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-gray-700">{leader?.name ?? '미지정'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>멤버 {members.length}명</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date().toLocaleDateString('ko-KR')}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {canEditTeam() && (
                  <Link
                    href={`/team/${team.id}/settings`}
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    title="팀 정보 수정"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
              </div>

              {/* Team Description */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="mb-3 text-sm font-bold text-gray-900">팀 소개</h3>
                <p className="text-[15px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {team.description || '작성된 팀 소개가 없습니다.'}
                </p>
              </div>
            </div>

            {/* Members Section */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  팀원 목록
                </h2>
                {canInviteMember() && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    팀원 초대
                  </button>
                )}
              </div>

              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">등록된 팀원이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        {member.profileImage ? (
                          <Image
                            src={member.profileImage}
                            alt={member.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${member.role === 'LEADER'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-100 text-gray-500'
                              }`}
                          >
                            {member.role === 'LEADER' ? (
                              <Crown className="h-5 w-5" />
                            ) : (
                              member.name.charAt(0)
                            )}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {member.name}
                            </span>
                            {member.role === 'LEADER' && (
                              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100">
                                TEAM LEADER
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {member.role === 'LEADER' ? '팀장' : '팀원'}
                          </div>
                        </div>
                      </div>
                      {canRemoveMember() && member.role !== 'LEADER' && (
                        <button
                          onClick={handleRemoveMember}
                          className="rounded-lg p-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600"
                          title="퇴출"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recruits Section */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Megaphone className="h-4 w-4" />
                  모집 공고
                </h2>
                {canEditTeam() && (
                  <Link
                    href={`/team/${team.id}/create`}
                    className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    새 공고 작성
                  </Link>
                )}
              </div>

              {recruits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Megaphone className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">등록된 모집 공고가 없습니다.</p>
                  {canEditTeam() && (
                    <Link
                      href={`/team/${team.id}/create`}
                      className="mt-3 text-sm font-medium text-gray-900 hover:underline"
                    >
                      첫 공고를 작성해보세요
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recruits.map((recruit) => (
                    <div
                      key={recruit.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          {(() => {
                            const daysLeft = getDaysLeft(recruit.endDate);
                            const isExpired = daysLeft !== null && daysLeft < 0;
                            const isOpen = recruit.status === 'OPEN' && !isExpired;
                            return (
                              <span
                                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold border ${isOpen
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-gray-100 text-gray-500 border-gray-200'
                                  }`}
                              >
                                {isOpen ? '모집중' : '마감'}
                              </span>
                            );
                          })()}
                          <Link
                            href={`/recruit/${recruit.id}`}
                            className="truncate text-sm font-semibold text-gray-900 hover:underline transition-colors"
                          >
                            {recruit.title}
                          </Link>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400">조회수</span>
                            {recruit.views}
                          </span>
                          <span className="h-2.5 w-px bg-gray-200"></span>
                          <span>
                            {formatDday(recruit.endDate)}
                          </span>
                        </div>
                      </div>

                      {canEditTeam() && (
                        <div className="relative ml-4">
                          <button
                            onClick={() =>
                              setActiveRecruitMenu(
                                activeRecruitMenu === recruit.id ? null : recruit.id
                              )
                            }
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {activeRecruitMenu === recruit.id && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              <Link
                                href={`/team/${team.id}/recruits/${recruit.id}/applications`}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ClipboardList className="h-3.5 w-3.5" />
                                지원 내역
                              </Link>
                              <div className="my-1 h-px bg-gray-100"></div>
                              <Link
                                href={`/team/${team.id}/create?edit=${recruit.id}`}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                수정
                              </Link>
                              <button
                                onClick={() =>
                                  openStatusChangeModal(recruit.id, recruit.status)
                                }
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {recruit.status === 'OPEN' ? (
                                  <>
                                    <XCircle className="h-3.5 w-3.5" />
                                    마감하기
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    다시 모집하기
                                  </>
                                )}
                              </button>
                              <div className="my-1 h-px bg-gray-100"></div>
                              <button
                                onClick={() => handleDeleteRecruit(recruit.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">팀원 초대</h3>
              </div>
              <div className="p-6">
                <p className="mb-6 text-sm text-gray-500">
                  초대할 팀원의 아우누리 이메일 아이디를 입력하면 초대가 전송됩니다.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">이메일 아이디</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                      <input
                        type="text"
                        placeholder="example"
                        value={inviteEmailId}
                        onChange={(e) => setInviteEmailId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg sm:rounded-r-none px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                      <span className="shrink-0 border border-gray-300 sm:border-l-0 bg-gray-50 rounded-lg sm:rounded-l-none px-3 py-2.5 text-sm text-gray-500 text-center sm:text-left">
                        @koreatech.ac.kr
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setInviteEmailId('');
                  }}
                  className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleInvite}
                  className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800"
                >
                  초대하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Confirmation Modal */}
        {statusChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {statusChangeModal.currentStatus === 'OPEN' ? '모집 마감' : '모집 재개'}
                </h3>
                <p className="mt-3 text-sm text-gray-600">
                  {statusChangeModal.currentStatus === 'OPEN'
                    ? '정말 마감처리 하시겠습니까?'
                    : '정말 다시 모집하시겠습니까?'}
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  onClick={() => setStatusChangeModal(null)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={confirmStatusChange}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white transition ${statusChangeModal.currentStatus === 'OPEN'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                  {statusChangeModal.currentStatus === 'OPEN' ? '마감하기' : '다시 모집하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
