'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Github, GitCommit, GitPullRequest, AlertCircle, FolderGit, HelpCircle, X } from 'lucide-react';

export type RankType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'challenger';

// 티어 정보 목록 (모달에서 표시용)
const tierList: { rank: RankType; range: string; description: string }[] = [
  { rank: 'challenger', range: '7.5 ~ 9', description: '최상위 기여자' },
  { rank: 'diamond', range: '6 ~ 7.5', description: '상당한 오픈소스 영향력' },
  { rank: 'platinum', range: '4.5 ~ 6', description: '활동/다양성 만점 + 영향성' },
  { rank: 'gold', range: '3 ~ 4.5', description: '높은 활동 수준 + 다양성' },
  { rank: 'silver', range: '1.5 ~ 3', description: '중간 활동 + 다양성' },
  { rank: 'bronze', range: '0 ~ 1.5', description: '기본 활동' },
];

interface GithubRankCardProps {
  name: string;
  username?: string;
  profileImage?: string | null;
  rank: RankType;
  totalScore: number;
  maxScore?: number;
  tierLabel?: string;
  stats: {
    commits: number;
    pullRequests: number;
    issues: number;
    repositories: number;
  };
}

// 점수 체계 (최대 9점)
// - 활동 수준: 최대 3점
// - 활동 다양성: 최대 1점
// - 활동 영향성: 최대 5점 (보너스)
const MAX_SCORE = 9;

const rankData: Record<RankType, {
  title: string;
  percent: string;
  gradient: string;
  barColor: string;
  minScore: number;
  maxScore: number;
}> = {
  bronze: {
    title: 'BRONZE',
    percent: 'Top 45%',
    gradient: 'from-[#d97706] to-[#fcd34d]',
    barColor: '#d97706',
    minScore: 0,
    maxScore: 1.5,
  },
  silver: {
    title: 'SILVER',
    percent: 'Top 25%',
    gradient: 'from-slate-400 to-white',
    barColor: '#cbd5e1',
    minScore: 1.5,
    maxScore: 3,
  },
  gold: {
    title: 'GOLD',
    percent: 'Top 12%',
    gradient: 'from-[#b45309] to-[#fde047]',
    barColor: '#fbbf24',
    minScore: 3,
    maxScore: 4.5,
  },
  platinum: {
    title: 'PLATINUM',
    percent: 'Top 5%',
    gradient: 'from-[#0891b2] to-[#67e8f9]',
    barColor: '#22d3ee',
    minScore: 4.5,
    maxScore: 6,
  },
  diamond: {
    title: 'DIAMOND',
    percent: 'Top 1%',
    gradient: 'from-[#4338ca] to-[#818cf8]',
    barColor: '#818cf8',
    minScore: 6,
    maxScore: 7.5,
  },
  challenger: {
    title: 'CHALLENGER',
    percent: 'Top 0.1%',
    gradient: 'from-[#be123c] to-[#f472b6]',
    barColor: '#f472b6',
    minScore: 7.5,
    maxScore: MAX_SCORE,
  },
};

export function getRankFromScore(score: number): RankType {
  if (score >= 7.5) return 'challenger';
  if (score >= 6) return 'diamond';
  if (score >= 4.5) return 'platinum';
  if (score >= 3) return 'gold';
  if (score >= 1.5) return 'silver';
  return 'bronze';
}

export default function GithubRankCard({
  name,
  username,
  profileImage,
  rank,
  totalScore,
  tierLabel,
  stats,
}: GithubRankCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glareOpacity, setGlareOpacity] = useState(0);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [bgPos, setBgPos] = useState({ x: '50%', y: '50%' });
  const [showTierInfo, setShowTierInfo] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const data = rankData[rank];

  // 모달 닫기 (애니메이션 후 제거)
  const closeTierInfo = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowTierInfo(false);
      setIsClosing(false);
    }, 300); // 애니메이션 시간과 일치
  }, []);

  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (showTierInfo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showTierInfo]);

  const progressInTier = Math.min(
    100,
    Math.max(0, ((totalScore - data.minScore) / (data.maxScore - data.minScore)) * 100)
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );

    setMousePos({ x: `${x}px`, y: `${y}px` });

    const bgX = 50 + (x / rect.width) * 50;
    const bgY = 50 + (y / rect.height) * 50;
    setBgPos({ x: `${bgX}%`, y: `${bgY}%` });

    setGlareOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareOpacity(0);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      {/* Noise texture background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        ref={cardRef}
        className="relative w-full transition-transform duration-200 ease-out"
        style={{ transform, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800/60 shadow-2xl backdrop-blur-xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
        {/* Texture Layer */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Foil Layer */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-color-dodge transition-opacity duration-300"
          style={{
            background: `linear-gradient(115deg, transparent 20%, rgba(255, 0, 150, 0.15) 40%, rgba(0, 255, 255, 0.15) 60%, transparent 80%)`,
            backgroundSize: '200% 200%',
            backgroundPosition: `${bgPos.x} ${bgPos.y}`,
            opacity: glareOpacity,
            filter: 'brightness(1.2) contrast(1.2)',
          }}
        />

        {/* Glare Layer */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePos.x} ${mousePos.y}, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 20%, transparent 50%)`,
            opacity: glareOpacity,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div
            className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            style={{ transform: 'translateZ(30px)' }}
          >
            {/* Background Glow */}
            <div
              className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-[0.05] blur-3xl"
              style={{ transform: 'translateZ(-50px)' }}
            />

            {/* Profile */}
            <div className="z-10 flex items-center gap-4">
              <div
                className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-slate-700 shadow-2xl sm:h-20 sm:w-20"
                style={{ transform: 'translateZ(50px)' }}
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    <Github className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                )}
              </div>
              <div style={{ transform: 'translateZ(30px)' }}>
                <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-2xl">
                  {name}
                </h2>
                {username && (
                  <p className="text-sm font-light tracking-wide text-slate-400">@{username}</p>
                )}
              </div>
            </div>

            {/* Rank */}
            <div className="z-10 text-left sm:text-right" style={{ transform: 'translateZ(30px)' }}>
              <div className="mb-1 flex items-center gap-1.5 sm:justify-end">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
                  Current Rank
                </span>
                <button
                  onClick={() => setShowTierInfo(true)}
                  className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
                  aria-label="티어 기준 보기"
                >
                  <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
              <div
                className={`bg-gradient-to-r ${data.gradient} bg-clip-text text-3xl font-black text-transparent drop-shadow-lg sm:text-4xl`}
                style={{
                  backgroundSize: '200% auto',
                  animation: 'textShine 5s linear infinite',
                }}
              >
                {data.title}
              </div>
              <div className="mt-1 text-xs font-light text-slate-400 sm:text-sm">
                <span className="font-medium text-white">{data.percent}</span> of developers
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div
            className="grid grid-cols-2 border-t border-white/10 bg-black/10 backdrop-blur-sm sm:grid-cols-4"
            style={{ transform: 'translateZ(10px)' }}
          >
            <div className="flex flex-col items-center justify-center border-r border-white/5 p-4 transition-colors hover:bg-white/5 sm:p-6">
              <GitCommit className="mb-1.5 h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
              <span className="text-lg font-bold text-white sm:text-xl">
                {stats.commits.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">
                Commits
              </span>
            </div>
            <div className="flex flex-col items-center justify-center border-r-0 border-white/5 p-4 transition-colors hover:bg-white/5 sm:border-r sm:p-6">
              <GitPullRequest className="mb-1.5 h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
              <span className="text-lg font-bold text-white sm:text-xl">
                {stats.pullRequests.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">
                Pull Requests
              </span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-t border-white/5 p-4 transition-colors hover:bg-white/5 sm:border-t-0 sm:p-6">
              <AlertCircle className="mb-1.5 h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
              <span className="text-lg font-bold text-white sm:text-xl">
                {stats.issues.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">
                Issues
              </span>
            </div>
            <div className="flex flex-col items-center justify-center border-t border-white/5 p-4 transition-colors hover:bg-white/5 sm:border-t-0 sm:p-6">
              <FolderGit className="mb-1.5 h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
              <span className="text-lg font-bold text-white sm:text-xl">
                {stats.repositories.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">
                Repositories
              </span>
            </div>
          </div>

          {/* Progress Section */}
          <div
            className="bg-white/[0.02] p-6 sm:p-8"
            style={{ transform: 'translateZ(20px)' }}
          >
            <div className="mb-3 flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Progress to next tier</span>
              <span className="font-mono text-white">
                {totalScore.toFixed(1)} / {data.maxScore} pts
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progressInTier}%`,
                  backgroundColor: data.barColor,
                  boxShadow: `0 0 15px ${data.barColor}80`,
                }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes textShine {
          to {
            background-position: 200% center;
          }
        }
      `}</style>

      {/* 티어 정보 모달 (데스크탑: 모달, 모바일: 바텀시트) */}
      {showTierInfo && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          onClick={closeTierInfo}
        >
          {/* 백드롭 */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${
              isClosing ? 'backdrop-fade-out' : 'backdrop-fade-in'
            }`}
          />

          {/* 모달 콘텐츠 */}
          <div
            className={`relative w-full max-w-md rounded-t-2xl bg-slate-900 p-6 shadow-2xl sm:rounded-2xl ${
              isClosing ? 'modal-closing' : 'modal-opening'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 드래그 핸들 */}
            <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-700 sm:hidden" />

            {/* 헤더 */}
            <div className="mb-6 flex items-center justify-between pt-2 sm:pt-0">
              <h3 className="text-lg font-bold text-white">티어 기준</h3>
              <button
                onClick={closeTierInfo}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 점수 체계 설명 */}
            <div className="mb-5 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-400">
              <p className="mb-1 font-medium text-slate-300">점수 체계 (최대 9점)</p>
              <ul className="space-y-0.5">
                <li>• 활동 수준: 최대 3점</li>
                <li>• 활동 다양성: 최대 1점</li>
                <li>• 활동 영향성: 최대 5점 (보너스)</li>
              </ul>
            </div>

            {/* 티어 목록 */}
            <div className="space-y-2">
              {tierList.map((tier) => {
                const tierData = rankData[tier.rank];
                const isCurrentTier = tier.rank === rank;
                return (
                  <div key={tier.rank} className="relative">
                    <div
                      className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                        isCurrentTier ? 'bg-slate-800 ring-1 ring-green-500/30' : 'bg-slate-800/30'
                      }`}
                    >
                      <div
                        className={`bg-gradient-to-r ${tierData.gradient} bg-clip-text text-sm font-black text-transparent`}
                        style={{ minWidth: '90px' }}
                      >
                        {tierData.title}
                      </div>
                      <div className="flex-1 text-xs text-slate-400">
                        {tier.description}
                      </div>
                      <div className="text-xs font-mono text-slate-500">
                        {tier.range}
                      </div>
                    </div>
                    {/* 현재 티어 툴팁 */}
                    {isCurrentTier && (
                      <div className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 translate-y-full">
                        <div className="relative rounded-md bg-green-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg">
                          {/* 말풍선 꼬리 (위쪽) */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-green-500" />
                          {tierLabel || '내 티어'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 현재 점수 */}
            <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
              <span className="text-sm text-slate-400">현재 점수</span>
              <span className="font-mono text-lg font-bold text-white">
                {totalScore.toFixed(1)} <span className="text-sm text-slate-500">/ {MAX_SCORE}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes backdrop-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes backdrop-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 1; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .backdrop-fade-in {
          animation: backdrop-fade-in 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .backdrop-fade-out {
          animation: backdrop-fade-out 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }

        /* PC: 페이드 애니메이션 */
        .modal-opening {
          animation: fade-in 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .modal-closing {
          animation: fade-out 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }

        /* 모바일: 슬라이드 애니메이션으로 오버라이드 */
        @media (max-width: 639px) {
          .modal-opening {
            animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
          }
          .modal-closing {
            animation: slide-down 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
          }
        }
      `}</style>
    </div>
  );
}
