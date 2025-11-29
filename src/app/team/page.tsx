'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Mail, Calendar, UserPlus, Edit } from 'lucide-react';
import TeamEditModal from '@/common/components/team/TeamEditModal';

interface Team {
  id: number;
  title: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  createdBy: string;
  createdAt: string;
  category: 'study' | 'project' | 'competition' | 'networking';
  inviteMessage: string;
  isLeader: boolean;
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
      createdAt: '2024-11-20',
      category: 'study',
      inviteMessage: '함께 성장하실 분들을 기다립니다!',
      isLeader: true
    },
    {
      id: 2,
      title: '오픈소스 컨트리뷰션 팀',
      description: 'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.',
      memberCount: 3,
      maxMembers: 6,
      createdBy: '이코드',
      createdAt: '2024-11-15',
      category: 'project',
      inviteMessage: '오픈소스에 관심있는 분들 환영합니다!',
      isLeader: false
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inviteMessage: ''
  });

  const getCategoryLabel = (category: Team['category']) => {
    switch (category) {
      case 'study':
        return '스터디';
      case 'project':
        return '프로젝트';
      case 'competition':
        return '대회';
      case 'networking':
        return '네트워킹';
    }
  };

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

  // 수정 모달 열기
  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      title: team.title,
      description: team.description,
      inviteMessage: team.inviteMessage
    });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({
      title: '',
      description: '',
      inviteMessage: ''
    });
  };

  // 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 저장 핸들러
  const handleSave = () => {
    if (!editingTeam) return;

    // 유효성 검사
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

    // 팀 정보 업데이트
    setTeams(prev => prev.map(team => 
      team.id === editingTeam.id 
        ? { ...team, ...formData }
        : team
    ));

    // API 호출 예시
    // await fetch(`/api/teams/${editingTeam.id}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify(formData)
    // });

    alert('팀 정보가 수정되었습니다!');
    handleCloseModal();
  };


  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow  = '';
    };
  }, [isModalOpen]);

  return (
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">내 팀</h1>
            <p className="text-gray-600">
              함께 성장하는 팀에 참여하거나 새로운 팀을 만들어보세요
            </p>
          </div>
          <Link
            href="/teams/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            팀 만들기
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                아직 참여한 팀이 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                새로운 팀을 만들거나 다른 팀에 참여해보세요
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/teams/create"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  팀 만들기
                </Link>
                <Link
                  href="/team-recruit"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  팀 둘러보기
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">참여 중인 팀</p>
                    <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">리더로 활동</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teams.filter(t => t.isLeader).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">총 팀원 수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teams.reduce((sum, team) => sum + team.memberCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 팀 목록 */}
            <div className="space-y-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-6">
                    {/* 상단: 제목 & 카테고리 & 리더 뱃지 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {team.title}
                          </h3>
                          <span className={`inline-block text-xs px-2 py-1 rounded-full border ${getCategoryColor(team.category)}`}>
                            {getCategoryLabel(team.category)}
                          </span>
                          {team.isLeader && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">
                              리더
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{team.description}</p>
                      </div>
                    </div>

                    {/* 초대 메시지 */}
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">초대 메시지</p>
                          <p className="text-sm text-blue-700">{team.inviteMessage}</p>
                        </div>
                      </div>
                    </div>

                    {/* 하단: 팀 정보 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{team.memberCount} / {team.maxMembers}명</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{team.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{team.createdBy}</span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          멤버 초대
                        </button>
                        {team.isLeader && (
                          <button
                            onClick={() => handleEdit(team)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            수정하기
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">팀 활동 안내</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 팀을 만들면 자동으로 리더가 되어 팀을 관리할 수 있습니다</li>
                <li>• 각 팀은 스터디, 프로젝트, 대회, 네트워킹 등의 카테고리로 분류됩니다</li>
                <li>• 팀원과 함께 목표를 달성하고 성과를 공유해보세요</li>
                <li>• 더 많은 팀을 찾고 싶다면 팀 둘러보기를 이용해주세요</li>
              </ul>
            </div>
          </div>
      </div>
      {editingTeam && (
        <TeamEditModal
          isOpen={isModalOpen}
          formData={formData}
          onChange={handleInputChange}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
      </div>
  );
}