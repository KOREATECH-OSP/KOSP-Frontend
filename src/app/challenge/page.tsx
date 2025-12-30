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
  BookOpen,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  current: number;
  total: number;
  category: 'contribution' | 'learning' | 'community';
  icon: React.ElementType;
  reward: number;
}

type CategoryFilter = 'all' | 'contribution' | 'learning' | 'community';

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
    {
      id: 1,
      title: 'First Contribution',
      description: '첫 번째 오픈소스 기여를 완료하세요',
      current: 1,
      total: 1,
      category: 'contribution',
      icon: GitPullRequest,
      reward: 100,
    },
    {
      id: 2,
      title: 'Pull Request Master',
      description: '10개의 Pull Request를 생성하세요',
      current: 7,
      total: 10,
      category: 'contribution',
      icon: GitPullRequest,
      reward: 500,
    },
    {
      id: 3,
      title: 'Issue Hunter',
      description: '20개의 이슈를 해결하세요',
      current: 12,
      total: 20,
      category: 'contribution',
      icon: Target,
      reward: 800,
    },
    {
      id: 4,
      title: 'Code Reviewer',
      description: '30개의 코드 리뷰를 작성하세요',
      current: 5,
      total: 30,
      category: 'contribution',
      icon: CheckCircle2,
      reward: 1000,
    },
    {
      id: 5,
      title: 'Documentation Writer',
      description: '5개의 문서를 작성하거나 개선하세요',
      current: 2,
      total: 5,
      category: 'learning',
      icon: BookOpen,
      reward: 300,
    },
    {
      id: 6,
      title: 'Star Collector',
      description: '프로젝트에 50개의 스타를 받으세요',
      current: 23,
      total: 50,
      category: 'community',
      icon: Star,
      reward: 1500,
    },
    {
      id: 7,
      title: 'Fork Master',
      description: '10개의 프로젝트를 Fork하세요',
      current: 10,
      total: 10,
      category: 'learning',
      icon: Zap,
      reward: 400,
    },
    {
      id: 8,
      title: 'Commit Streak',
      description: '30일 연속으로 커밋하세요',
      current: 15,
      total: 30,
      category: 'contribution',
      icon: Flame,
      reward: 1200,
    },
    {
      id: 9,
      title: 'Community Helper',
      description: '50개의 댓글로 커뮤니티를 도와주세요',
      current: 32,
      total: 50,
      category: 'community',
      icon: Users,
      reward: 600,
    },
    {
      id: 10,
      title: 'Language Explorer',
      description: '5가지 다른 프로그래밍 언어로 기여하세요',
      current: 3,
      total: 5,
      category: 'learning',
      icon: Star,
      reward: 700,
    },
    {
      id: 11,
      title: 'Open Source Advocate',
      description: '3명의 새로운 기여자를 초대하세요',
      current: 1,
      total: 3,
      category: 'community',
      icon: Trophy,
      reward: 500,
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
      case 'contribution':
        return {
          bg: 'from-blue-500 to-indigo-600',
          light: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-200',
          glow: 'shadow-blue-500/20',
        };
      case 'learning':
        return {
          bg: 'from-emerald-500 to-teal-600',
          light: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          glow: 'shadow-emerald-500/20',
        };
      case 'community':
        return {
          bg: 'from-purple-500 to-pink-600',
          light: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-200',
          glow: 'shadow-purple-500/20',
        };
    }
  };

  const getCategoryName = (category: Challenge['category']) => {
    switch (category) {
      case 'contribution':
        return '기여';
      case 'learning':
        return '학습';
      case 'community':
        return '커뮤니티';
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
    { key: 'contribution', label: '기여', icon: GitPullRequest },
    { key: 'learning', label: '학습', icon: BookOpen },
    { key: 'community', label: '커뮤니티', icon: Users },
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
                  <p className="mb-4 text-sm text-gray-500">
                    {challenge.description}
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
