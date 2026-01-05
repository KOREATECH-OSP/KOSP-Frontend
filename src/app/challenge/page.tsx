'use client';

import { useState } from 'react';
import {
  Trophy,
  Target,
  Flame,
  Star,
  Zap,
  TrendingUp,
  Users,
  GitPullRequest,
  CheckCircle2,
  GitCommit,
  Calendar,
  Bug,
  Eye,
  GitMerge,
  MessageSquare,
  Code,
  Crown,
  GitFork,
  Award,
} from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  condition: string;
  current: number;
  total: number;
  category: 'beginner' | 'intermediate' | 'advanced' | 'special';
  icon: React.ElementType;
  reward: number;
}

type CategoryFilter = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'special';



export default function ChallengePage() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');

  const challenges: Challenge[] = [
    {
      id: 1,
      title: '첫 걸음',
      description: '오픈소스의 세계에 첫 발을 내딛어보세요!',
      condition: '커밋 1회 이상',
      current: 1,
      total: 1,
      category: 'beginner',
      icon: GitCommit,
      reward: 50,
    },
    {
      id: 2,
      title: '꾸준함의 시작',
      description: '7일 동안 매일 커밋하여 개발 습관을 만들어보세요.',
      condition: '7일 연속 커밋',
      current: 5,
      total: 7,
      category: 'beginner',
      icon: Flame,
      reward: 200,
    },
    {
      id: 3,
      title: '백 번의 헌신',
      description: '100개의 커밋을 통해 프로젝트에 기여해보세요.',
      condition: '누적 커밋 100회 이상',
      current: 42,
      total: 100,
      category: 'beginner',
      icon: GitCommit,
      reward: 300,
    },
    {
      id: 4,
      title: '이슈 헌터',
      description: '버그 제보나 기능 제안으로 프로젝트 개선에 참여하세요.',
      condition: '이슈 생성 10회 이상',
      current: 3,
      total: 10,
      category: 'beginner',
      icon: Bug,
      reward: 150,
    },
    {
      id: 5,
      title: '출석왕',
      description: '한 달 동안 플랫폼을 꾸준히 방문해보세요.',
      condition: '사이트 출석체크 30회',
      current: 30,
      total: 30,
      category: 'beginner',
      icon: Calendar,
      reward: 250,
    },
    {
      id: 6,
      title: 'PR 마스터',
      description: '다양한 프로젝트에 코드 기여를 시작하세요.',
      condition: 'PR 생성 20회 이상',
      current: 8,
      total: 20,
      category: 'intermediate',
      icon: GitPullRequest,
      reward: 400,
    },
    {
      id: 7,
      title: '머지의 달인',
      description: '여러분의 코드가 실제 프로젝트에 반영되는 기쁨을 느껴보세요.',
      condition: '머지된 PR 10개 이상',
      current: 10,
      total: 10,
      category: 'intermediate',
      icon: GitMerge,
      reward: 500,
    },
    {
      id: 8,
      title: '코드 리뷰어',
      description: '다른 개발자의 코드를 리뷰하며 함께 성장하세요.',
      condition: 'PR 리뷰 또는 코멘트 50회 이상',
      current: 23,
      total: 50,
      category: 'intermediate',
      icon: Eye,
      reward: 350,
    },
    {
      id: 9,
      title: '이슈 해결사',
      description: '버그를 수정하고 기능을 구현하여 이슈를 닫아보세요.',
      condition: '이슈 클로즈 15회 이상',
      current: 0,
      total: 15,
      category: 'intermediate',
      icon: CheckCircle2,
      reward: 450,
    },
    {
      id: 10,
      title: '한 달의 기록',
      description: '30일 동안 매일 코드를 작성하는 습관을 만들어보세요.',
      condition: '30일 연속 커밋',
      current: 12,
      total: 30,
      category: 'intermediate',
      icon: Flame,
      reward: 600,
    },
    {
      id: 11,
      title: '스타 수집가',
      description: '매력적인 프로젝트를 만들어 커뮤니티의 관심을 받아보세요.',
      condition: '본인 레포지토리 누적 스타 100개 이상',
      current: 0,
      total: 100,
      category: 'intermediate',
      icon: Star,
      reward: 700,
    },
    {
      id: 12,
      title: '다재다능',
      description: '다양한 프로젝트에 참여하며 경험을 넓혀보세요.',
      condition: '5개 이상의 다른 레포지토리에 기여',
      current: 5,
      total: 5,
      category: 'intermediate',
      icon: Target,
      reward: 400,
    },
    {
      id: 13,
      title: '코드의 거장',
      description: '오픈소스 활동의 베테랑이 되어보세요.',
      condition: '누적 커밋 1000회 이상',
      current: 156,
      total: 1000,
      category: 'advanced',
      icon: Crown,
      reward: 1500,
    },
    {
      id: 14,
      title: '100일의 헌신',
      description: '100일 동안 매일 코딩하는 진정한 개발자가 되어보세요.',
      condition: '100일 연속 커밋',
      current: 0,
      total: 100,
      category: 'advanced',
      icon: Flame,
      reward: 2000,
    },
    {
      id: 15,
      title: '메인테이너',
      description: '본인의 레포지토리에서 다른 사람의 PR을 머지해보세요.',
      condition: '다른 사용자의 PR 머지 10회 이상',
      current: 2,
      total: 10,
      category: 'advanced',
      icon: Users,
      reward: 800,
    },
    {
      id: 16,
      title: '컨트리뷰터 챔피언',
      description: '다양한 오픈소스 생태계에 발자취를 남겨보세요.',
      condition: '10개 이상의 레포지토리에 머지된 PR 보유',
      current: 0,
      total: 10,
      category: 'advanced',
      icon: Trophy,
      reward: 1200,
    },
    {
      id: 17,
      title: '대규모 기여자',
      description: '방대한 양의 코드로 프로젝트를 발전시켜보세요.',
      condition: '누적 코드 추가 10,000줄 이상',
      current: 2340,
      total: 10000,
      category: 'advanced',
      icon: Code,
      reward: 1000,
    },
    {
      id: 18,
      title: '인기 프로젝트 메이커',
      description: '많은 개발자들이 참여하고 싶어하는 프로젝트를 만들어보세요.',
      condition: '본인 레포지토리 누적 포크 50개 이상',
      current: 0,
      total: 50,
      category: 'special',
      icon: GitFork,
      reward: 600,
    },
    {
      id: 19,
      title: '슈퍼 리뷰어',
      description: '커뮤니티에 적극적으로 피드백을 제공하세요.',
      condition: 'PR 리뷰 또는 코멘트 100회 이상',
      current: 45,
      total: 100,
      category: 'special',
      icon: MessageSquare,
      reward: 500,
    },
    {
      id: 20,
      title: '연중무휴 개발자',
      description: '일 년 동안 플랫폼과 함께한 진정한 열정을 보여주세요.',
      condition: '사이트 출석체크 365회',
      current: 89,
      total: 365,
      category: 'special',
      icon: Award,
      reward: 3000,
    },
  ];

  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter((c) => c.current >= c.total).length;
  const totalPoints = challenges
    .filter((c) => c.current >= c.total)
    .reduce((sum, c) => sum + c.reward, 0);

  const filteredChallenges =
    activeFilter === 'all'
      ? challenges
      : challenges.filter((c) => c.category === activeFilter);

  const getCategoryStyle = (category: Challenge['category']) => {
    const styles = {
      beginner: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]', label: '초급' },
      intermediate: { bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]', label: '중급' },
      advanced: { bg: 'bg-[#f3e5f5]', text: 'text-[#7b1fa2]', label: '고급' },
      special: { bg: 'bg-[#fff3e0]', text: 'text-[#e65100]', label: '특별' },
    };
    return styles[category];
  };

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'beginner', label: '초급' },
    { key: 'intermediate', label: '중급' },
    { key: 'advanced', label: '고급' },
    { key: 'special', label: '특별' },
  ];

  const renderCardContent = (challenge: Challenge, isCompleted: boolean) => {
    const style = getCategoryStyle(challenge.category);
    const Icon = challenge.icon;
    const progress = Math.round((challenge.current / challenge.total) * 100);

    return (
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${
            isCompleted ? 'bg-[#e0f2f1]' : 'bg-[#f2f4f6]'
          }`}
        >
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isCompleted ? 'text-[#00897b]' : 'text-[#6b7684]'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#191f28]">{challenge.title}</h3>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium bg-[#e0f2f1] text-[#00897b]">
                <CheckCircle2 className="w-3 h-3" />
                완료
              </span>
            )}
          </div>

          <p className="text-[13px] sm:text-[14px] text-[#6b7684] mb-3 line-clamp-2">{challenge.description}</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[12px] sm:text-[13px] mb-1.5">
                <span className="text-[#8b95a1] truncate mr-2">{challenge.condition}</span>
                <span className="font-medium text-[#191f28] whitespace-nowrap">
                  {challenge.current.toLocaleString()} / {challenge.total.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-[#26a69a]' : 'bg-[#3182f6]'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#fff8e1] rounded-xl self-start sm:self-auto">
              <Zap className="w-4 h-4 text-[#f9a825]" />
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#f57f17]">
                +{challenge.reward.toLocaleString()}P
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-[1080px] px-4 sm:px-5 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-[#191f28] leading-snug tracking-tight">
            챌린지
          </h1>
          <p className="mt-1.5 sm:mt-2 text-[14px] sm:text-[15px] text-[#8b95a1]">
            다양한 도전 과제를 완료하고 포인트를 획득하세요
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="bg-[#f2f4f6] rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] text-[#8b95a1] mb-1 sm:mb-2">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>완료</span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-[20px] sm:text-[28px] font-bold text-[#191f28]">{completedChallenges}</span>
              <span className="text-[12px] sm:text-[15px] text-[#8b95a1]">/{totalChallenges}</span>
            </div>
          </div>

          <div className="bg-[#f2f4f6] rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] text-[#8b95a1] mb-1 sm:mb-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>달성률</span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-[20px] sm:text-[28px] font-bold text-[#191f28]">
                {Math.round((completedChallenges / totalChallenges) * 100)}
              </span>
              <span className="text-[12px] sm:text-[15px] text-[#8b95a1]">%</span>
            </div>
          </div>

          <div className="bg-[#f2f4f6] rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] text-[#8b95a1] mb-1 sm:mb-2">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>포인트</span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-[20px] sm:text-[28px] font-bold text-[#191f28]">{totalPoints.toLocaleString()}</span>
              <span className="text-[12px] sm:text-[15px] text-[#8b95a1]">P</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[13px] sm:text-[14px] font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-[#191f28] text-white'
                  : 'bg-[#f2f4f6] text-[#6b7684] hover:bg-[#e5e8eb]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 sm:space-y-3">
          {filteredChallenges.map((challenge) => {
            const isCompleted = challenge.current >= challenge.total;

            return (
              <div
                key={challenge.id}
                className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border bg-white transition-colors ${
                  isCompleted
                    ? 'border-[#b2dfdb] hover:border-[#80cbc4]'
                    : 'border-[#e5e8eb] hover:border-[#d1d6db]'
                }`}
              >
                {renderCardContent(challenge, isCompleted)}
              </div>
            );
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-[#e5e8eb] mb-3 sm:mb-4" />
            <p className="text-[14px] sm:text-base text-[#8b95a1]">해당 카테고리의 챌린지가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
