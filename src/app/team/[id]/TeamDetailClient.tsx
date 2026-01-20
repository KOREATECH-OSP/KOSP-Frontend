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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Team Header */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-gray-300 overflow-hidden">
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
                  <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-gray-700">{leader?.name ?? '미지정'}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>멤버 {members.length}명</span>
                    </span>
                  </div>
                </div>
              </div>
              {canEditTeam() && (
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="rounded-md border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                  title="팀 설정"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="border-t border-gray-100 pt-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">팀 소개</h3>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                {team.description || '작성된 팀 소개가 없습니다.'}
              </p>
            </div>
          </div>

          {/* Members Section */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900">
                팀원 목록
              </h2>
              {canInviteMember() && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="inline-flex items-center rounded-md bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 shadow-sm"
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
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
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
                            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100">
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
                        className="rounded p-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600"
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
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Megaphone className="h-4 w-4" />
                모집 공고
              </h2>
              {canEditTeam() && (
                <Link
                  href={`/team/${team.id}/create`}
                  className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 shadow-sm"
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
                    className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
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
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold border ${recruit.status === 'OPEN'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}
                        >
                          {recruit.status === 'OPEN' ? '모집중' : '마감'}
                        </span>
                        <Link
                          href={`/recruit/${recruit.id}`}
                          className="truncate text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
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
                          {recruit.endDate
                            ? `~${new Date(recruit.endDate).toLocaleDateString()} 마감`
                            : '상시모집'}
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
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeRecruitMenu === recruit.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5">
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

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Team Info</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">설립일</span>
                  <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span> {/* Mock Data if not available, or omit */}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">팀장</span>
                  <div className="flex items-center gap-2">
                    {leader?.profileImage && (
                      <Image src={leader.profileImage} alt="" width={20} height={20} className="rounded-full" />
                    )}
                    <span className="font-medium text-gray-900">{leader?.name ?? '미지정'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">멤버</span>
                  <span className="font-medium text-gray-900">
                    {members.length}명
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl ring-1 ring-gray-200">
            <h2 className="mb-2 text-lg font-bold text-gray-900">팀원 초대</h2>
            <p className="mb-6 text-sm text-gray-500">
              초대할 팀원의 학번을 입력하면 초대가 전송됩니다.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">학번</label>
                <input
                  type="text"
                  placeholder="ex) 2024123456"
                  value={inviteStudentId}
                  onChange={(e) => setInviteStudentId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setInviteStudentId('');
                  }}
                  className="flex-1 rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleInvite}
                  className="flex-1 rounded-md bg-gray-900 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  초대하기
                </button>
              </div>
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
