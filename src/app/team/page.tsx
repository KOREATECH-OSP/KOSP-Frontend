'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Edit } from 'lucide-react';
import TeamEditModal from '@/common/components/team/TeamEditModal';
import TeamInviteModal from '@/common/components/team/TeamInviteModal';
import InfoBox from '@/common/components/InfoBox';
import Image from 'next/image';
import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';

interface Team {
  id: number;
  title: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  createdBy: string;
  category: 'study' | 'project' | 'competition' | 'networking';
  inviteMessage: string;
  isLeader: boolean;
  imageUrl?: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 1,
      title: 'React 스터디 그룹',
      description: 'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행됩니다.',
      memberCount: 5,
      maxMembers: 8,
      createdBy: '김개발',
      category: 'study',
      inviteMessage: '함께 성장하실 분들을 기다립니다!',
      isLeader: true,
      // imageUrl: '/team-images/react-study.jpg'
    },
    {
      id: 2,
      title: '오픈소스 컨트리뷰션 팀',
      description: 'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.',
      memberCount: 3,
      maxMembers: 6,
      createdBy: '이코드',
      category: 'project',
      inviteMessage: '오픈소스에 관심있는 분들 환영합니다!',
      isLeader: false,
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inviteMessage: '',
    imageUrl: ''
  });

  // 초대 모달 상태
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitingTeam, setInvitingTeam] = useState<Team | null>(null);

  const getCategoryColor = (category: Team['category']) => {
    switch (category) {
      case 'study':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'project':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'competition':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'networking':
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      title: team.title,
      description: team.description,
      inviteMessage: team.inviteMessage,
      imageUrl: team.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({
      title: '',
      description: '',
      inviteMessage: '',
      imageUrl: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!editingTeam) return;

    if (!formData.title.trim()) {
      alert('팀 이름을 입력해주세요');
      return;
    }
    if (!formData.description.trim()) {
      alert('팀 설명을 입력해주세요');
      return;
    }
    if (!formData.inviteMessage.trim()) {
      alert('초대 메시지를 입력해주세요');
      return;
    }

    setTeams(prev => prev.map(team => 
      team.id === editingTeam.id 
        ? { ...team, ...formData }
        : team
    ));

    alert('팀 정보가 수정되었습니다!');
    handleCloseModal();
  };

  // 멤버 초대 핸들러
  const handleInvite = (team: Team) => {
    setInvitingTeam(team);
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
    setInvitingTeam(null);
  };

  const handleSendInvite = (studentId: string) => {
    // API 호출
    // await fetch('/api/teams/invite', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     teamId: invitingTeam?.id,
    //     memberIds: selectedMembers,
    //     message
    //   })
    // });
    alert(`학번 ${studentId}님께 초대장을 보냈습니다!`);

    handleCloseInviteModal();
  };

  useEffect(() => {
    if (isModalOpen || isInviteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isInviteModalOpen]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">내 팀</h1>
          <p className="text-sm sm:text-base text-gray-600">
            함께 성장하는 팀에 참여하거나 새로운 팀을 만들어보세요
          </p>
        </div>
        <Link
          href="/team/create"
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          팀 만들기
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 sm:p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              아직 참여한 팀이 없습니다
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              새로운 팀을 만들거나 다른 팀에 참여해보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/team/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                팀 만들기
              </Link> 
              <Link
                href="/recruit"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                팀 둘러보기
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="p-4 sm:p-6">
                  {/* 팀 이미지 & 제목 섹션 */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    {/* 팀 이미지 */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                      {team.imageUrl ? (
                        <Image
                          src={team.imageUrl}
                          alt={team.title}
                          fill
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg flex items-center justify-center bg-gray-100">
                          <Image
                            src={KoriSupport}
                            alt="팀 기본 아이콘"
                            width={48}
                            height={48}
                            className="w-10 h-10 sm:w-12 sm:h-12"
                          />
                        </div>
                      )}
                    </div>

                    {/* 제목 & 뱃지 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-3">
                        <h3 className="flex-1 min-w-0 text-lg sm:text-xl font-semibold text-gray-900 break-words">
                          {team.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {team.isLeader && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200 whitespace-nowrap">
                              리더
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 팀 정보 */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{team.memberCount} / {team.maxMembers}명</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate">{team.createdBy}</span>
                        </div>
                      </div>

                      {/* 팀 설명 */}
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {team.description}
                      </p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleInvite(team)}
                      className="flex-1 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      멤버 초대
                    </button>
                    {team.isLeader && (
                      <button
                        onClick={() => handleEdit(team)}
                        className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        수정하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <InfoBox
        title="팀 활동 안내"
        items={[
          "팀을 만들면 자동으로 리더가 되어 팀을 관리할 수 있습니다",
          "각 팀은 스터디, 프로젝트, 대회, 네트워킹 등의 카테고리로 분류됩니다",
          "팀원과 함께 목표를 달성하고 성과를 공유해보세요",
          "더 많은 팀을 찾고 싶다면 팀 둘러보기를 이용해주세요",
        ]}
      />

      {editingTeam && (
        <TeamEditModal
          isOpen={isModalOpen}
          formData={formData}
          onChange={handleInputChange}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
      {invitingTeam && (
        <TeamInviteModal
          isOpen={isInviteModalOpen}
          teamName={invitingTeam.title}
          onClose={handleCloseInviteModal}
          onSendInvite={handleSendInvite}
        />
      )}
    </div>
  );
}