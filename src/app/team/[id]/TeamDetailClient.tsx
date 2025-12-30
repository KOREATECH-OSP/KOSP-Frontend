'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Crown,
  UserMinus,
  Plus,
  Settings,
  FileText,
} from 'lucide-react';
import TeamSettingsModal from '@/common/components/team/TeamSettingsModal';
import type { TeamDetailResponse } from '@/lib/api/types';

type TabType = '모집' | '팀원';
type UserRole = 'leader' | 'member' | 'guest';

interface TeamSettingsFormValues {
  name: string;
  description: string;
  imageUrl?: string;
  positions: string[];
}

interface TeamDetailClientProps {
  team: TeamDetailResponse;
}

export default function TeamDetailClient({ team: initialTeam }: TeamDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('팀원');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [team, setTeam] = useState(initialTeam);

  // 현재 사용자의 역할 확인 (실제로는 세션에서 가져와야 함)
  const currentUserRole: UserRole = team.members.some(
    (m) => m.role === 'LEADER'
  )
    ? 'leader'
    : team.members.length > 0
      ? 'member'
      : 'guest';

  const tabs: TabType[] = currentUserRole === 'guest' ? ['모집'] : ['모집', '팀원'];

  const canCreatePost = () => currentUserRole === 'leader';
  const canEditTeam = () => currentUserRole === 'leader';
  const canInviteMember = () =>
    currentUserRole === 'leader' || currentUserRole === 'member';
  const canRemoveMember = () => currentUserRole === 'leader';

  const handleInvite = () => {
    if (!inviteStudentId.trim()) {
      alert('학번을 입력해주세요');
      return;
    }
    alert(`${inviteStudentId}님께 초대장을 보냈습니다!`);
    setInviteStudentId('');
    setIsInviteModalOpen(false);
  };

  const handleRemoveMember = (memberName: string) => {
    if (confirm(`${memberName}님을 팀에서 내보내시겠습니까?`)) {
      alert(`${memberName}님이 팀에서 제거되었습니다.`);
    }
  };

  const handleSaveSettings = (values: TeamSettingsFormValues) => {
    setTeam((prev) => ({
      ...prev,
      name: values.name,
      description: values.description,
    }));
    setIsSettingsModalOpen(false);
  };

  const leader = team.members.find((m) => m.role === 'LEADER');

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/team"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        목록으로
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2">
          {/* 팀 헤더 */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
                  {team.imageUrl ? (
                    <img
                      src={team.imageUrl}
                      alt={team.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
                  <p className="text-xs text-gray-400">
                    팀장: {leader?.name ?? '없음'}
                  </p>
                </div>
              </div>
              {canEditTeam() && (
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              {team.description}
            </p>
          </div>

          {/* 탭 필터 */}
          <div className="mb-6 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {tab === '모집' ? '팀원 모집' : '팀원 관리'}
              </button>
            ))}
          </div>

          {/* 모집 탭 */}
          {activeTab === '모집' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">팀원 모집</h2>
                {canCreatePost() && (
                  <Link
                    href={`/team/${team.id}/create`}
                    className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    새 공고
                  </Link>
                )}
              </div>

              <div className="flex flex-col items-center justify-center py-16">
                <FileText className="mb-3 h-12 w-12 text-gray-200" />
                <p className="text-gray-500">모집 중인 공고가 없습니다.</p>
              </div>
            </div>
          )}

          {/* 팀원 탭 */}
          {activeTab === '팀원' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  팀원 목록 ({team.members.length})
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

              <div className="divide-y divide-gray-100">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                          member.role === 'LEADER'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {member.role === 'LEADER' ? (
                          <Crown className="h-4 w-4" />
                        ) : member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={member.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
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
                        onClick={() => handleRemoveMember(member.name)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-4">
            {/* 팀 정보 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">팀 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">팀장</span>
                  <span className="font-medium text-gray-900">
                    {leader?.name ?? '없음'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">팀원</span>
                  <span className="font-medium text-gray-900">
                    {team.members.length}명
                  </span>
                </div>
              </div>
            </div>

            {/* 팀원 미리보기 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">팀원</h3>
                <button
                  onClick={() => setActiveTab('팀원')}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  전체보기
                </button>
              </div>
              <div className="flex -space-x-2">
                {team.members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-medium ${
                      member.role === 'LEADER'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    title={member.name}
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
                {team.members.length > 5 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600">
                    +{team.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 팀원 초대 모달 */}
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
