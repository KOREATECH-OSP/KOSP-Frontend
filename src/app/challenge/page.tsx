'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
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
  const [animatedStats, setAnimatedStats] = useState({
    completed: 0,
    progress: 0,
    points: 0,
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const challenges: Challenge[] = [
    // 초급 도전과제
    {
      id: 1,
      title: '첫 걸음',
      description: '오픈소스의 세계에 첫 발을 내딛어보세요!',
      condition: '커밋 1회 이상',
      current: 0,
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
      current: 0,
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
      current: 0,
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
      current: 0,
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
      current: 0,
      total: 30,
      category: 'beginner',
      icon: Calendar,
      reward: 250,
    },
    // 중급 도전과제
    {
      id: 6,
      title: 'PR 마스터',
      description: '다양한 프로젝트에 코드 기여를 시작하세요.',
      condition: 'PR 생성 20회 이상',
      current: 0,
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
      current: 0,
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
      current: 0,
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
      current: 0,
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
      current: 0,
      total: 5,
      category: 'intermediate',
      icon: Target,
      reward: 400,
    },
    // 고급 도전과제
    {
      id: 13,
      title: '코드의 거장',
      description: '오픈소스 활동의 베테랑이 되어보세요.',
      condition: '누적 커밋 1000회 이상',
      current: 0,
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
      current: 0,
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
      current: 0,
      total: 10000,
      category: 'advanced',
      icon: Code,
      reward: 1000,
    },
    // 특별 도전과제
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
      current: 0,
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
      current: 0,
      total: 365,
      category: 'special',
      icon: Award,
      reward: 3000,
    },
  ];

  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter(
    (c) => c.current >= c.total
  ).length;
  const overallProgress = Math.round(
    (challenges.reduce((sum, c) => sum + c.current / c.total, 0) /
      totalChallenges) *
      100
  );
  const totalPoints = challenges
    .filter((c) => c.current >= c.total)
    .reduce((sum, c) => sum + c.reward, 0);

  const filteredChallenges =
    activeFilter === 'all'
      ? challenges
      : challenges.filter((c) => c.category === activeFilter);

  // Hero animation
  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline();
    tl.fromTo(
      '.hero-badge',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    )
      .fromTo(
        '.hero-title',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo(
        '.hero-subtitle',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(
        '.hero-icon',
        { scale: 0, rotation: -15, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
        '-=0.4'
      )
      .fromTo(
        '.hero-stats',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
        '-=0.2'
      );
  }, []);

  // Counter animation
  useEffect(() => {
    const duration = 2;
    const ease = 'power2.out';

    gsap.to(animatedStats, {
      completed: completedChallenges,
      progress: overallProgress,
      points: totalPoints,
      duration,
      ease,
      onUpdate: () => {
        setAnimatedStats({
          completed: Math.round(animatedStats.completed),
          progress: Math.round(animatedStats.progress),
          points: Math.round(animatedStats.points),
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedChallenges, overallProgress, totalPoints]);

  // Card animations
  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.challenge-card');

    // 초기 상태 설정 후 애니메이션
    gsap.set(cards, { opacity: 1, y: 0 });

    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.2,
      }
    );
  }, [filteredChallenges]);

  // Progress bar animation
  useEffect(() => {
    gsap.from('.main-progress-bar', {
      scaleX: 0,
      transformOrigin: 'left',
      duration: 1.5,
      delay: 0.5,
      ease: 'power3.out',
    });
  }, []);

  const getCategoryStyle = (category: Challenge['category']) => {
    switch (category) {
      case 'beginner':
        return {
          bg: 'from-emerald-500 to-teal-600',
          light: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          glow: 'shadow-emerald-500/20',
        };
      case 'intermediate':
        return {
          bg: 'from-blue-500 to-indigo-600',
          light: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-200',
          glow: 'shadow-blue-500/20',
        };
      case 'advanced':
        return {
          bg: 'from-purple-500 to-pink-600',
          light: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-200',
          glow: 'shadow-purple-500/20',
        };
      case 'special':
        return {
          bg: 'from-amber-500 to-orange-600',
          light: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-200',
          glow: 'shadow-amber-500/20',
        };
    }
  };

  const getCategoryName = (category: Challenge['category']) => {
    switch (category) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      case 'special':
        return '특별';
    }
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>, enter: boolean) => {
    const card = e.currentTarget;
    if (enter) {
      gsap.to(card, {
        scale: 1.02,
        y: -8,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(card.querySelector('.card-glow'), {
        opacity: 0.1,
        duration: 0.3,
      });
    } else {
      gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(card.querySelector('.card-glow'), {
        opacity: 0,
        duration: 0.3,
      });
    }
  };

  const CircularProgress = ({
    progress,
    size = 64,
    isCompleted,
    style,
  }: {
    progress: number;
    size?: number;
    isCompleted: boolean;
    style: ReturnType<typeof getCategoryStyle>;
  }) => {
    const circleRef = useRef<SVGCircleElement>(null);
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
      if (!circleRef.current) return;
      const offset = circumference - (progress / 100) * circumference;
      gsap.to(circleRef.current, {
        strokeDashoffset: offset,
        duration: 1.5,
        delay: 0.3,
        ease: 'power3.out',
      });
    }, [progress, circumference]);

    return (
      <div
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg className="rotate-[-90deg]" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-100"
          />
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor={isCompleted ? '#10b981' : '#3b82f6'}
              />
              <stop
                offset="100%"
                stopColor={isCompleted ? '#059669' : '#6366f1'}
              />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            <span className={`text-sm font-bold ${style.text}`}>
              {progress}%
            </span>
          )}
        </div>
      </div>
    );
  };

  const filters: { key: CategoryFilter; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: '전체', icon: Trophy },
    { key: 'beginner', label: '초급', icon: Target },
    { key: 'intermediate', label: '중급', icon: TrendingUp },
    { key: 'advanced', label: '고급', icon: Crown },
    { key: 'special', label: '특별', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero Section */}
        <div
          ref={heroRef}
          className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-8 py-10"
        >
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-10 top-6 h-20 w-20 rounded-full border-4 border-white" />
            <div className="absolute right-20 top-10 h-12 w-12 rounded-full border-2 border-white" />
            <div className="absolute bottom-6 left-1/4 h-8 w-8 rounded-full bg-white" />
            <div className="absolute bottom-10 right-1/3 h-6 w-6 rounded-full border-2 border-white" />
          </div>

          <div className="relative flex items-center justify-between">
            <div>
              <div className="hero-badge mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">
                  도전하고 성장하세요
                </span>
              </div>
              <h1 className="hero-title mb-2 text-3xl font-bold text-white">
                챌린지
              </h1>
              <p className="hero-subtitle text-sm text-gray-400">
                오픈소스 활동을 통해 다양한 도전 과제를 완료하고 뱃지를 획득하세요
              </p>
            </div>

            <div className="hero-icon hidden md:block">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900 shadow-lg">
                  {completedChallenges}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          ref={statsRef}
          className="mb-6 grid grid-cols-3 gap-4"
        >
          <div className="hero-stats rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
              <Target className="h-4 w-4" />
              완료한 챌린지
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {animatedStats.completed}
              </span>
              <span className="text-sm text-gray-400">/ {totalChallenges}</span>
            </div>
          </div>

          <div className="hero-stats rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              평균 진행률
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {animatedStats.progress}
              </span>
              <span className="text-sm text-gray-400">%</span>
            </div>
          </div>

          <div className="hero-stats rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
              <Zap className="h-4 w-4" />
              획득 포인트
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {animatedStats.points.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">P</span>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              전체 진행도
            </span>
            <span className="text-sm font-bold text-gray-900">
              {overallProgress}%
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="main-progress-bar absolute inset-y-0 left-0 rounded-full bg-gray-900"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}
                />
                {filter.label}
                {filter.key !== 'all' && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {
                      challenges.filter(
                        (c) =>
                          filter.key === 'all' || c.category === filter.key
                      ).length
                    }
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Challenge Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredChallenges.map((challenge) => {
            const progress = Math.round(
              (challenge.current / challenge.total) * 100
            );
            const isCompleted = challenge.current >= challenge.total;
            const style = getCategoryStyle(challenge.category);
            const Icon = challenge.icon;

            return (
              <div
                key={challenge.id}
                className={`challenge-card group relative cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all ${
                  isCompleted
                    ? 'border-emerald-200 ring-2 ring-emerald-100'
                    : 'border-gray-200'
                }`}
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >
                {/* Glow Effect - 카드 바깥으로 */}
                <div
                  className={`card-glow pointer-events-none absolute -inset-2 -z-10 bg-gradient-to-br ${style.bg} opacity-0 blur-2xl`}
                />

                {/* Card Content */}
                <div className="relative z-10 p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`relative rounded-xl bg-gradient-to-br ${style.bg} p-3 shadow-lg ${style.glow}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                        {isCompleted && (
                          <div className="absolute -right-1 -top-1 rounded-full bg-white p-0.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {challenge.title}
                        </h3>
                        <span
                          className={`text-xs font-medium ${style.text}`}
                        >
                          {getCategoryName(challenge.category)}
                        </span>
                      </div>
                    </div>
                    <CircularProgress
                      progress={progress}
                      isCompleted={isCompleted}
                      style={style}
                    />
                  </div>

                  {/* Description */}
                  <p className="mb-2 text-sm text-gray-500">
                    {challenge.description}
                  </p>
                  <p className="mb-4 text-xs text-gray-400">
                    <span className="font-medium">조건:</span> {challenge.condition}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-gray-400">진행률</span>
                      <span className="font-semibold text-gray-700">
                        {challenge.current} / {challenge.total}
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ${
                          isCompleted
                            ? 'from-emerald-400 to-emerald-600'
                            : style.bg
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Zap className="h-3.5 w-3.5" />
                      <span>보상</span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : `${style.light} ${style.text}`
                      }`}
                    >
                      +{challenge.reward}P
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredChallenges.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Trophy className="mb-4 h-16 w-16 text-gray-200" />
            <p className="text-gray-500">해당 카테고리의 챌린지가 없습니다</p>
          </div>
        )}

      </div>
    </div>
  );
}
