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
  Eye,
  MessageCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import TeamSettingsModal from '@/common/components/team/TeamSettingsModal';

interface TeamMember {
  id: number;
  name: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

interface TeamPost {
  id: number;
  title: string;
  positions: string[];
  createdAt: string;
  views: number;
  comments: number;
  status: '모집중' | '마감';
  deadline?: string;
}

interface TeamInfo {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  positions: string[];
}

type TabType = '모집' | '팀원' | '게시글';
type UserRole = 'leader' | 'member' | 'guest';

interface TeamSettingsFormValues {
  name: string;
  description: string;
  imageUrl?: string;
  positions: string[];
}

export default function TeamDetailPage() {
  const [activeTab, setActiveTab] = useState<TabType>('모집');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // TODO: 실제로는 API에서 사용자 역할을 가져와야 함
  const [userRole] = useState<UserRole>('leader');

  const [team, setTeam] = useState<TeamInfo>({
    id: 1,
    name: 'React 스터디 그룹',
    description:
      'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.',
    createdBy: '김개발',
    createdAt: '2024-10-15',
    positions: ['프론트엔드', '백엔드'],
  });

  const members: TeamMember[] = [
    { id: 1, name: '김개발', role: 'leader', joinedAt: '2024-10-15' },
    { id: 2, name: '이코드', role: 'member', joinedAt: '2024-10-20' },
    { id: 3, name: '박프론트', role: 'member', joinedAt: '2024-10-25' },
    { id: 4, name: '최백엔드', role: 'member', joinedAt: '2024-11-01' },
  ];

  const teamPosts: TeamPost[] = [
    {
      id: 1,
      title: 'React 18 심화 스터디 멤버를 모집합니다!',
      positions: ['프론트엔드', '백엔드'],
      createdAt: '2024-11-28',
      views: 156,
      comments: 8,
      status: '모집중',
      deadline: '2024-12-15',
    },
    {
      id: 2,
      title: 'TypeScript 프로젝트 팀원 모집',
      positions: ['백엔드', 'DevOps'],
      createdAt: '2024-11-25',
      views: 89,
      comments: 5,
      status: '모집중',
      deadline: '2024-12-10',
    },
    {
      id: 3,
      title: 'Next.js 프로젝트 함께 하실 분',
      positions: ['프론트엔드'],
      createdAt: '2024-11-20',
      views: 234,
      comments: 15,
      status: '마감',
    },
  ];

  const tabs: TabType[] =
    userRole === 'guest' ? ['모집'] : ['모집', '팀원', '게시글'];

  const activeRecruitments = teamPosts.filter((p) => p.status === '모집중');

  const canCreatePost = () => userRole === 'leader';
  const canEditTeam = () => userRole === 'leader';
  const canInviteMember = () => userRole === 'leader' || userRole === 'member';
  const canRemoveMember = () => userRole === 'leader';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysLeft = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSaveSettings = (values: TeamSettingsFormValues) => {
    setTeam((prev) => ({
      ...prev,
      name: values.name,
      description: values.description,
      positions: values.positions,
    }));
    setIsSettingsModalOpen(false);
  };

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
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {team.name}
                  </h1>
                  <p className="text-xs text-gray-400">
                    {formatDate(team.createdAt)} 생성
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
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
              {team.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {team.positions.map((pos) => (
                <span
                  key={pos}
                  className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600"
                >
                  {pos}
                </span>
              ))}
            </div>
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
                {tab === '모집' ? '팀원 모집' : tab === '팀원' ? '팀원 관리' : '전체 게시글'}
              </button>
            ))}
          </div>

          {/* 모집 탭 */}
          {activeTab === '모집' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  현재 모집 중 ({activeRecruitments.length})
                </h2>
                {canCreatePost() && (
                  <Link
                    href="1/create"
                    className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    새 공고
                  </Link>
                )}
              </div>

              {activeRecruitments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">모집 중인 공고가 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activeRecruitments.map((post) => {
                    const daysLeft = post.deadline
                      ? getDaysLeft(post.deadline)
                      : null;
                    return (
                      <Link
                        key={post.id}
                        href={`/recruit/${post.id}`}
                        className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              모집중
                            </span>
                            {daysLeft !== null && daysLeft <= 7 && (
                              <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-500">
                                <Clock className="h-3 w-3" />
                                D-{daysLeft}
                              </span>
                            )}
                            <h3 className="truncate text-[15px] font-medium text-gray-900 group-hover:text-blue-600">
                              {post.title}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex gap-1">
                              {post.positions.map((pos) => (
                                <span
                                  key={pos}
                                  className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600"
                                >
                                  {pos}
                                </span>
                              ))}
                            </div>
                            <span className="h-3 w-px bg-gray-200" />
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {post.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" />
                                {post.comments}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 팀원 탭 */}
          {activeTab === '팀원' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  팀원 목록 ({members.length})
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
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                          member.role === 'leader'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {member.role === 'leader' ? (
                          <Crown className="h-4 w-4" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {member.name}
                          </span>
                          {member.role === 'leader' && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              팀장
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(member.joinedAt)} 가입
                        </p>
                      </div>
                    </div>
                    {canRemoveMember() && member.role !== 'leader' && (
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

          {/* 게시글 탭 */}
          {activeTab === '게시글' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  전체 게시글 ({teamPosts.length})
                </h2>
              </div>

              {teamPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">작성된 게시글이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {teamPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/recruit/${post.id}`}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              post.status === '모집중'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {post.status}
                          </span>
                          <h3 className="truncate text-[15px] font-medium text-gray-900 group-hover:text-blue-600">
                            {post.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300" />
                    </Link>
                  ))}
                </div>
              )}
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
                    {team.createdBy}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">팀원</span>
                  <span className="font-medium text-gray-900">
                    {members.length}명
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">모집 공고</span>
                  <span className="font-medium text-gray-900">
                    {activeRecruitments.length}개
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
                {members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-medium ${
                      member.role === 'leader'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    title={member.name}
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
                {members.length > 5 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600">
                    +{members.length - 5}
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
          imageUrl: '',
          positions: team.positions,
        }}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
