import type { Post } from '@/types/community';

export const posts: Post[] = [
    {
      id: 1,
      category: '홍보',
      title: '2024 해커톤 참가자 모집합니다!',
      content: '다음 달 개최되는 해커톤에 함께할 팀원을 찾습니다...',
      author: '해커톤매니저',
      views: 342,
      likes: 23,
      comments: 12,
      createdAt: '2시간 전',
      tags: ['해커톤', '팀빌딩', '개발']
    },
    {
      id: 2,
      category: 'Q&A',
      title: 'React 상태관리 라이브러리 추천 부탁드립니다',
      content: '프로젝트에서 상태관리를 어떻게 해야할지 고민입니다...',
      author: '프론트개발자',
      views: 156,
      likes: 8,
      comments: 15,
      createdAt: '5시간 전',
      tags: ['React', '상태관리']
    },
    {
      id: 3,
      category: '자유',
      title: '개발자 커리어 고민 상담받습니다',
      content: '5년차 개발자입니다. 이직 관련 조언 나눠요!',
      author: '시니어개발자',
      views: 489,
      likes: 45,
      comments: 28,
      createdAt: '1일 전',
      tags: ['커리어', '이직']
    },
    {
      id: 4,
      category: 'Q&A',
      title: 'Docker 배포 관련 질문입니다',
      content: 'Docker로 배포할 때 환경변수 설정은 어떻게 하나요?',
      author: '주니어백엔드',
      views: 234,
      likes: 12,
      comments: 9,
      createdAt: '1일 전',
      tags: ['Docker', '배포']
    },
    {
      id: 5,
      category: '홍보',
      title: '오픈소스 프로젝트 기여자 모집',
      content: 'Next.js 기반 블로그 플랫폼 개발 중입니다',
      author: '오픈소스러버',
      views: 567,
      likes: 34,
      comments: 18,
      createdAt: '2일 전',
      tags: ['오픈소스', 'Next.js']
    },
    {
      id: 6,
      category: '자유',
      title: '코딩테스트 준비 스터디원 구합니다',
      content: '주 3회 온라인으로 모여서 문제 풀이 공유해요',
      author: '알고리즘마스터',
      views: 398,
      likes: 29,
      comments: 21,
      createdAt: '3일 전',
      tags: ['코딩테스트', '스터디']
    },
    {
      id: 7,
      category: 'Q&A',
      title: 'TypeScript 제네릭 사용법 질문',
      content: '제네릭을 활용한 타입 가드 패턴이 궁금합니다',
      author: 'TS초보',
      views: 178,
      likes: 15,
      comments: 11,
      createdAt: '3일 전',
      tags: ['TypeScript', '제네릭']
    },
    {
      id: 8,
      category: '자유',
      title: '개발자 북클럽 멤버 모집!',
      content: '클린 코드, 리팩토링 등의 책을 함께 읽어요',
      author: '책읽는개발자',
      views: 445,
      likes: 38,
      comments: 16,
      createdAt: '4일 전',
      tags: ['북클럽', '스터디']
    }
  ];
