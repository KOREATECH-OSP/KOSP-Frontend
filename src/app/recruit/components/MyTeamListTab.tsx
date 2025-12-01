'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, User, UserPlus, Edit, Crown } from 'lucide-react';
import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';

interface MyTeam {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  isLeader: boolean;
  imageUrl?: string;
}

export default function MyTeamListTab() {
  // Mock 데이터
  const myTeams: MyTeam[] = [
    {
      id: 1,
      name: 'React 스터디 그룹',
      description: 'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.',
      memberCount: 5,
      createdBy: '김개발',
      isLeader: true,
    },
    {
      id: 2,
      name: '오픈소스 컨트리뷰션 팀',
      description: 'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.',
      memberCount: 8,
      createdBy: '이코드',
      isLeader: false,
    },
  ];

  if (myTeams.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            참여한 팀이 없습니다
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            새로운 팀을 만들거나 다른 팀에 참여해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myTeams.map((team) => (
        <MyTeamCard team={team} key={team.id} />
      ))}
    </div>
  );
}

function MyTeamCard({ team }: { team: MyTeam }) {
  return (
    <div className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* 팀 이미지 */}
          <Link href={`/team/${team.id}`} className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
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
                  alt="default icon"
                  width={40}
                  height={40}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              </div>
            )}
          </Link>

          {/* 팀 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/team/${team.id}`}>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 hover:text-blue-600">
                  {team.name}
                </h3>
              </Link>
            </div>

            {/* 팀 설명 - 2줄 제한 */}
            <p className="text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
              {team.description}
            </p>

            {/* 하단 메타 정보 & 액션 버튼 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
              {/* 메타 정보 */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{team.createdBy}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{team.memberCount}명</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}