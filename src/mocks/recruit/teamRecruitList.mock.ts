import { TeamRecruit } from "@/types/recruit";

export const teamRecruits: TeamRecruit[] = [
    {
      id: 1,
      title: '사이드 프로젝트 팀원 모집 (React, Node.js)',
      description: 'AI 기반 학습 관리 플랫폼을 함께 만들 팀원을 찾습니다. 장기 프로젝트이며 포트폴리오 제작에 좋습니다.',
      tags: ['React', 'Node.js', 'MongoDB', 'AI'],
      positions: ['프론트엔드', '백엔드', 'UI/UX'],
      currentMembers: 3,
      maxMembers: 5,
      deadline: 'D-7',
      status: '모집중',
      author: '프로젝트리더',
      createdAt: '2시간 전',
      views: 234
    },
    {
      id: 2,
      title: '스타트업 공동창업자 찾습니다',
      description: '에듀테크 스타트업 창업을 준비 중입니다. 기술 공동창업자를 찾고 있습니다.',
      tags: ['창업', 'EdTech', 'Full-Stack', 'AI'],
      positions: ['CTO', '풀스택 개발자'],
      currentMembers: 2,
      maxMembers: 4,
      deadline: 'D-14',
      status: '모집중',
      author: '스타트업대표',
      createdAt: '5시간 전',
      views: 456
    },
    {
      id: 3,
      title: '해커톤 참가 팀원 구합니다',
      description: '다음 주 해커톤에 참가할 팀원을 모집합니다. 경험자 우대합니다.',
      tags: ['Python', 'ML', 'Data', '해커톤'],
      positions: ['데이터 분석가', 'ML 엔지니어', '기획자'],
      currentMembers: 4,
      maxMembers: 5,
      deadline: 'D-3',
      status: '마감임박',
      author: '해커톤러버',
      createdAt: '1일 전',
      views: 789
    },
    {
      id: 4,
      title: '오픈소스 프로젝트 기여자 모집',
      description: 'Next.js 기반 블로그 플랫폼 오픈소스 프로젝트에 기여할 개발자를 찾습니다.',
      tags: ['Next.js', 'TypeScript', 'Tailwind'],
      positions: ['프론트엔드', '백엔드'],
      currentMembers: 5,
      maxMembers: 10,
      deadline: '상시모집',
      status: '모집중',
      author: '오픈소스메인테이너',
      createdAt: '2일 전',
      views: 567
    }
  ];
