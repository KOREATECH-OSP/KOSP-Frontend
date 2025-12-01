'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Users,
  User,
  UserPlus,
  Crown,
  UserMinus,
  Plus,
  Settings,
  FileText,
  Eye,
  MessageCircle,
  Clock,
} from 'lucide-react';
import TabNavigation, { Tab } from '@/common/components/TabNavigation';
import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';
import TeamSettingsModal from '@/common/components/team/TeamSettingsModal';

interface TeamMember {
  id: number;
  name: string;
  role: 'leader' | 'member';
  joinedAt: string;
  profileImage?: string;
}

interface TeamPost {
  id: number;
  title: string;
  description: string;
  positions: string[];
  createdAt: string;
  views: number;
  comments: number;
  status: '모집중' | '마감';
  deadline?: string;
}

// 팀 기본 정보 + 설정 모달에서 수정 가능한 필드들
interface TeamInfo {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  imageUrl?: string;
  positions: string[]; // 모달에서 수정 가능한 포지션들
}

type UserRole = 'leader' | 'member' | 'guest';

// TeamSettingsModal에서 넘겨줄 설정 타입 (모달 props에 맞춰서 사용)
interface TeamSettingsFormValues {
  name: string;
  description: string;
  imageUrl?: string;
  positions: string[];
}

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('모집');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 현재 사용자의 역할 (실제로는 API에서 가져와야 함)
  const userRole: UserRole = 'leader'; // 'leader', 'member', 'guest' 중 하나

  // 🔹 팀 정보 state로 관리 (모달에서 수정 가능하도록)
  const [team, setTeam] = useState<TeamInfo>({
    id: Number(params.id) || 1,
    name: 'React 스터디 그룹',
    description:
      'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.',
    createdBy: '김개발',
    createdAt: '2024-10-15',
    imageUrl: '',
    positions: ['프론트엔드', '백엔드'], // 팀에서 주로 모집하는 포지션 등
  });

  const members: TeamMember[] = [
    {
      id: 1,
      name: '김개발',
      role: 'leader',
      joinedAt: '2024-10-15',
    },
    {
      id: 2,
      name: '이코드',
      role: 'member',
      joinedAt: '2024-10-20',
    },
    {
      id: 3,
      name: '박프론트',
      role: 'member',
      joinedAt: '2024-10-25',
    },
    {
      id: 4,
      name: '최백엔드',
      role: 'member',
      joinedAt: '2024-11-01',
    },
  ];

  const teamPosts: TeamPost[] = [
    {
      id: 1,
      title: 'React 18 심화 스터디 멤버를 모집합니다!',
      description:
        '매주 목요일 저녁 8시에 온라인으로 진행되는 React 스터디입니다. 함께 성장하실 분들을 기다립니다!',
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
      description:
        'TypeScript와 Node.js를 활용한 실전 프로젝트를 함께 진행하실 분을 찾습니다.',
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
      description:
        'Next.js 14를 활용한 풀스택 프로젝트를 진행했습니다.',
      positions: ['프론트엔드'],
      createdAt: '2024-11-20',
      views: 234,
      comments: 15,
      status: '마감',
    },
  ];

  // 권한별 탭 구성
  const getTabsForRole = () => {
    const baseTabs = [{ id: '모집', label: '팀원 모집' }];

    if (userRole === 'leader' || userRole === 'member') {
      return [
        ...baseTabs,
        { id: '팀원', label: '팀원 관리' },
        { id: '게시글', label: '전체 게시글' },
      ];
    }

    return baseTabs;
  };

  const tabs: Tab[] = getTabsForRole();

  const activeRecruitments = teamPosts.filter(
    (post) => post.status === '모집중',
  );

  // 권한 체크 함수들
  const canCreatePost = () => userRole === 'leader'; // 팀장만 모집글 작성
  const canEditTeam = () => userRole === 'leader'; // 팀장만 팀 설정 수정
  const canInviteMember = () => userRole === 'leader' || userRole === 'member'; // 팀장, 일반 회원만 초대
  const canRemoveMember = () => userRole === 'leader'; // 팀장만 팀원 내보내기
  const canViewMembers = () =>
    userRole === 'leader' || userRole === 'member'; // 팀장, 일반 회원만 팀원 보기
  const canEditPost = () => userRole === 'leader'; // 팀장만 게시글 수정

  const handleInvite = () => {
    if (!inviteStudentId.trim()) {
      alert('학번을 입력해주세요');
      return;
    }
    alert(`${inviteStudentId}님께 초대장을 보냈습니다!`);
    setInviteStudentId('');
    setIsInviteModalOpen(false);
  };

  const handleRemoveMember = (memberId: number, memberName: string) => {
    if (confirm(`${memberName}님을 팀에서 내보내시겠습니까?`)) {
      alert(`${memberName}님이 팀에서 제거되었습니다.`);
    }
  };

  const handleJoinTeam = () => {
    if (confirm('이 팀에 가입하시겠습니까?')) {
      alert('팀 가입 신청이 완료되었습니다!');
      // TODO: API 호출하여 가입 신청
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysLeft = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  // 🔹 팀 설정 저장 핸들러 (모달에서 호출)
  const handleSaveSettings = (values: TeamSettingsFormValues) => {
    // 실제로는 여기서 API 호출 → 성공 시 state 업데이트
    setTeam((prev) => ({
      ...prev,
      name: values.name,
      description: values.description,
      imageUrl: values.imageUrl,
      positions: values.positions,
    }));

    setIsSettingsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          목록으로
        </Link>

        {/* 팀 헤더 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
              {team.imageUrl ? (
                <Image
                  src={team.imageUrl}
                  alt={team.name}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                  <Image
                    src={KoriSupport}
                    alt="team icon"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {team.name}
                </h1>

                {/* 역할별 액션 버튼 */}
                <div className="flex flex-wrap gap-2">
                  {userRole === 'leader' && (
                    <>
                      {canEditTeam() && (
                        <button
                          onClick={() => setIsSettingsModalOpen(true)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                        >
                          <Settings className="w-4 h-4" />
                          팀 설정
                        </button>
                      )}
                    </>
                  )}

                  {userRole === 'member' && canInviteMember() && (
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      팀원 초대
                    </button>
                  )}

                  {userRole === 'guest' && (
                    <button
                      onClick={handleJoinTeam}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                    >
                      팀 가입 신청
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {team.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>팀장: {team.createdBy}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>팀원 {members.length}명</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>생성일: {formatDate(team.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 비회원 안내 메시지 */}
        {userRole === 'guest' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  팀 가입 후 더 많은 기능을 이용하실 수 있습니다
                </p>
                <p className="text-xs text-blue-700">
                  팀원이 되면 팀원 초대, 팀 활동 참여 등 다양한 기능을 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* 팀원 모집 탭 */}
        {activeTab === '모집' && (
          <div className="space-y-6">
            {activeRecruitments.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      현재 모집 중 ({activeRecruitments.length})
                    </h2>
                    {canCreatePost() && (
                      <Link
                        href={`${params.id}/create`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        새 공고 작성
                      </Link>
                    )}
                  </div>

                  <div className="space-y-4">
                    {activeRecruitments.map((post) => {
                      const daysLeft = post.deadline
                        ? getDaysLeft(post.deadline)
                        : null;
                      return (
                        <div
                          key={post.id}
                          className="border-2 border-green-200 rounded-lg bg-green-50/50 p-6 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                  모집중
                                </span>
                                {daysLeft !== null && daysLeft <= 7 && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">
                                    <Clock className="w-3 h-3" />
                                    D-{daysLeft}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                                {post.title}
                              </h3>

                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.positions.map((position, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md border border-blue-200"
                                  >
                                    {position}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{formatDate(post.createdAt)}</span>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{post.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>{post.comments}</span>
                                </div>
                                {post.deadline && (
                                  <>
                                    <span>•</span>
                                    <span>마감: {formatDate(post.deadline)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-green-200">
                            <Link
                              href={`/recruit/${post.id}`}
                              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center text-sm"
                            >
                              자세히 보기
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    현재 모집 중인 공고가 없습니다
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {canCreatePost()
                      ? '새로운 팀원을 모집하는 공고를 작성해보세요'
                      : '팀장이 새로운 모집 공고를 올릴 때까지 기다려주세요'}
                  </p>
                  {canCreatePost() && (
                    <Link
                      href="/recruit/write"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus className="w-5 h-5" />
                      첫 공고 작성하기
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 팀원 관리 탭 */}
        {activeTab === '팀원' && canViewMembers() && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  팀원 목록 ({members.length})
                </h2>
                {canInviteMember() && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    팀원 초대
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        {member.profileImage ? (
                          <Image
                            src={member.profileImage}
                            alt={member.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {member.name}
                          </span>
                          {member.role === 'leader' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">
                              <Crown className="w-3 h-3" />
                              팀장
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          가입일: {formatDate(member.joinedAt)}
                        </p>
                      </div>
                    </div>

                    {canRemoveMember() && member.role !== 'leader' && (
                      <button
                        onClick={() =>
                          handleRemoveMember(member.id, member.name)
                        }
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-1.5 text-sm"
                      >
                        <UserMinus className="w-4 h-4" />
                        내보내기
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 전체 게시글 탭 */}
        {activeTab === '게시글' && canViewMembers() && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  전체 게시글 ({teamPosts.length})
                </h2>
              </div>

              {teamPosts.length > 0 ? (
                <div className="space-y-3">
                  {teamPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/recruit/${post.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="flex-1 font-semibold text-gray-900 hover:text-blue-600">
                          {post.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                            post.status === '모집중'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatDate(post.createdAt)}</span>
                        <span>조회 {post.views}</span>
                        <span>댓글 {post.comments}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">
                    아직 작성된 게시글이 없습니다
                  </p>
                  {canCreatePost() && (
                    <Link
                      href="/recruit/write"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      첫 게시글 작성하기
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 팀원 초대 모달 */}
        {isInviteModalOpen && canInviteMember() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  팀원 초대
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  초대할 팀원의 학번을 입력해주세요
                </p>

                <input
                  type="text"
                  placeholder="학번 입력"
                  value={inviteStudentId}
                  onChange={(e) => setInviteStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setInviteStudentId('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleInvite}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    초대하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <TeamSettingsModal
        isOpen={isSettingsModalOpen}
        initialSettings={{
          name: team.name,
          description: team.description,
          imageUrl: team.imageUrl,
          positions: team.positions,
        }}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
