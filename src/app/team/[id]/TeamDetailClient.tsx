'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
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
} from 'lucide-react';
import TeamSettingsModal from '@/common/components/team/TeamSettingsModal';
import { toast } from '@/lib/toast';
import { updateRecruitStatus, deleteRecruit } from '@/lib/api/recruit';
import type { TeamDetailResponse, RecruitResponse, RecruitStatus } from '@/lib/api/types';

type UserRole = 'leader' | 'member' | 'guest';

interface TeamDetailClientProps {
  team: TeamDetailResponse;
  recruits: RecruitResponse[];
}

export default function TeamDetailClient({ team: initialTeam, recruits: initialRecruits }: TeamDetailClientProps) {
  const { data: session } = useSession();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [team] = useState(initialTeam);
  const [recruits, setRecruits] = useState(initialRecruits);
  const [activeRecruitMenu, setActiveRecruitMenu] = useState<number | null>(null);

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

  const handleInvite = () => {
    if (!inviteStudentId.trim()) {
      toast.error('학번을 입력해주세요');
      return;
    }
    toast.info('아직 준비 중인 기능입니다.');
    setInviteStudentId('');
    setIsInviteModalOpen(false);
  };

  const handleRemoveMember = () => {
    toast.info('아직 준비 중인 기능입니다.');
  };

  const handleSaveSettings = () => {
    toast.info('아직 준비 중인 기능입니다.');
    setIsSettingsModalOpen(false);
  };

  const handleToggleRecruitStatus = async (recruitId: number, currentStatus: RecruitStatus) => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

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
    setActiveRecruitMenu(null);
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

  const leader = team.members?.find((m) => m.role === 'LEADER');
  const members = team.members ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href="/team"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        목록으로
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg">
                  {team.imageUrl ? (
                    <Image
                      src={team.imageUrl}
                      alt={team.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <Users className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>팀장: {leader?.name ?? '미지정'}</span>
                    <span className="text-gray-300">•</span>
                    <span>팀원 {members.length}명</span>
                  </div>
                </div>
              </div>
              {canEditTeam() && (
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="rounded-lg border border-gray-200 p-2.5 text-gray-500 transition hover:bg-gray-50"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              {team.description || '팀 소개가 없습니다.'}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-900">
                팀원 ({members.length})
              </h2>
              {canInviteMember() && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
                >
                  <UserPlus className="mr-1 h-3.5 w-3.5" />
                  초대
                </button>
              )}
            </div>

            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="mb-3 h-12 w-12 text-gray-200" />
                <p className="text-gray-500">등록된 팀원이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {member.profileImage ? (
                        <Image
                          src={member.profileImage}
                          alt={member.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                            member.role === 'LEADER'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
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
                          <span className="text-sm font-medium text-gray-900">
                            {member.name}
                          </span>
                          {member.role === 'LEADER' && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              팀장
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {canRemoveMember() && member.role !== 'LEADER' && (
                      <button
                        onClick={handleRemoveMember}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 모집공고 섹션 */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Megaphone className="h-4 w-4" />
                모집공고 ({recruits.length})
              </h2>
              {canEditTeam() && (
                <Link
                  href={`/team/${team.id}/create`}
                  className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  작성
                </Link>
              )}
            </div>

            {recruits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Megaphone className="mb-3 h-12 w-12 text-gray-200" />
                <p className="text-gray-500">등록된 모집공고가 없습니다.</p>
                {canEditTeam() && (
                  <Link
                    href={`/team/${team.id}/create`}
                    className="mt-4 text-sm text-gray-900 underline underline-offset-2 hover:text-gray-700"
                  >
                    모집공고 작성하기
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recruits.map((recruit) => (
                  <div
                    key={recruit.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/community/recruits/${recruit.id}`}
                          className="truncate text-sm font-medium text-gray-900 hover:underline"
                        >
                          {recruit.title}
                        </Link>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            recruit.status === 'OPEN'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {recruit.status === 'OPEN' ? '모집중' : '마감'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                        <span>조회 {recruit.views}</span>
                        <span>·</span>
                        <span>
                          {recruit.endDate
                            ? `~${new Date(recruit.endDate).toLocaleDateString()}`
                            : '상시모집'}
                        </span>
                      </div>
                    </div>
                    {canEditTeam() && (
                      <div className="relative ml-2">
                        <button
                          onClick={() =>
                            setActiveRecruitMenu(
                              activeRecruitMenu === recruit.id ? null : recruit.id
                            )
                          }
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeRecruitMenu === recruit.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            <Link
                              href={`/team/${team.id}/create?edit=${recruit.id}`}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              수정
                            </Link>
                            <button
                              onClick={() =>
                                handleToggleRecruitStatus(recruit.id, recruit.status)
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
                                  모집 재개
                                </>
                              )}
                            </button>
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

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">팀 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">팀장</span>
                  <span className="font-medium text-gray-900">
                    {leader?.name ?? '미지정'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">팀원 수</span>
                  <span className="font-medium text-gray-900">
                    {members.length}명
                  </span>
                </div>
              </div>
            </div>

            {members.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-900">팀원 미리보기</h3>
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-medium ${
                        member.role === 'LEADER'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={member.name}
                    >
                      {member.profileImage ? (
                        <Image
                          src={member.profileImage}
                          alt={member.name}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                  ))}
                  {members.length > 5 && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">팀원 초대</h2>
            <p className="mb-4 text-sm text-gray-500">
              초대할 팀원의 학번을 입력해주세요
            </p>
            <input
              type="text"
              placeholder="학번 입력"
              value={inviteStudentId}
              onChange={(e) => setInviteStudentId(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteStudentId('');
                }}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                초대하기
              </button>
            </div>
          </div>
        </div>
      )}

      <TeamSettingsModal
        isOpen={isSettingsModalOpen}
        initialSettings={{
          name: team.name,
          description: team.description,
          imageUrl: team.imageUrl ?? '',
          positions: [],
        }}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
