'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Trophy, Loader2, Image as ImageIcon, Code, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { createAdminChallenge, getSpelVariables, type SpelVariable, type SpelExample } from '@/lib/api/admin';
import type { AdminChallengeCreateRequest } from '@/types/admin';
import { toast } from '@/lib/toast';
import SpelEditor from '@/common/components/SpelEditor';

export default function CreateChallengePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<AdminChallengeCreateRequest>({
    name: '',
    description: '',
    condition: '',
    tier: 1,
    imageUrl: '',
    point: 0,
  });
  const [pythonCode, setPythonCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [spelVariables, setSpelVariables] = useState<SpelVariable[]>([]);
  const [spelExamples, setSpelExamples] = useState<SpelExample[]>([]);
  const [showVariables, setShowVariables] = useState(true);

  // SpEL 변수 목록 가져오기
  const fetchSpelVariables = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const data = await getSpelVariables({ accessToken: session.accessToken });
      setSpelVariables(data.variables || []);
      setSpelExamples(data.examples || []);
    } catch (error) {
      console.error('Failed to fetch SpEL variables:', error);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchSpelVariables();
    }
  }, [session?.accessToken, fetchSpelVariables]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!formData.name || !formData.description || !formData.condition) {
      toast.error('모든 필수 필드를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await createAdminChallenge(formData, { accessToken: session.accessToken });
      toast.success('챌린지가 생성되었습니다.');
      router.push('/admin/challenges/list');
    } catch (err) {
      console.error('Failed to create challenge:', err);
      toast.error('챌린지 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const insertPythonExample = (example: string) => {
    setPythonCode(example);
  };

  const getTierStyle = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-amber-100 text-amber-800'; // 브론즈
      case 2:
        return 'bg-gray-200 text-gray-700'; // 실버
      case 3:
        return 'bg-yellow-100 text-yellow-700'; // 골드
      case 4:
        return 'bg-emerald-100 text-emerald-700'; // 플래티넘
      case 5:
        return 'bg-sky-100 text-sky-700'; // 다이아몬드
      case 6:
        return 'bg-rose-100 text-rose-700'; // 루비
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return '브론즈';
      case 2:
        return '실버';
      case 3:
        return '골드';
      case 4:
        return '플래티넘';
      case 5:
        return '다이아몬드';
      case 6:
        return '루비';
      default:
        return `Tier ${tier}`;
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </button>
          <h1 className="text-xl font-bold text-gray-900">챌린지 생성</h1>
          <p className="mt-0.5 text-sm text-gray-500">새로운 챌린지를 생성합니다</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">기본 정보</h2>

            <div className="space-y-5">
              {/* 챌린지 이름 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  챌린지 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 10일 연속 출석"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="사용자에게 보여질 챌린지 설명을 입력하세요"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">이미지 URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                {formData.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                    <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                      <span className="text-xs font-medium text-gray-500">미리보기</span>
                    </div>
                    <div className="relative h-40 w-full bg-gray-100">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 달성 조건 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">달성 조건 (SpEL)</h2>

            <div className="space-y-5">
              {/* SpEL 변수 목록 */}
              {spelVariables.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <button
                    type="button"
                    onClick={() => setShowVariables(!showVariables)}
                    className="flex w-full items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">사용 가능한 변수</span>
                      <span className="rounded-full bg-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {spelVariables.length}개
                      </span>
                    </div>
                    {showVariables ? (
                      <ChevronUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                  {showVariables && (
                    <div className="mt-3 space-y-2">
                      {spelVariables.map((variable, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-lg bg-white p-2.5 text-sm"
                        >
                          <code className="shrink-0 rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-800">
                            {variable.path.replace('#', '')}
                          </code>
                          <span className="text-gray-600">{variable.description}</span>
                          <span className="ml-auto shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                            {variable.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 조건식 안내 */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
                <p className="flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>한 가지 조건은 <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">activity[&apos;value&apos;] &gt;= 1</code> 처럼 부등호로 작성 시 백분율로 환산되어 진행도가 표기됩니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>두 가지 조건은 <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">activity[&apos;value1&apos;] &gt; 10 and activity[&apos;value2&apos;] &gt; 100</code> 처럼 <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">and</code>로 작성하나 <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">or</code>도 가능합니다. 둘 중 가장 가까운 것으로 백분율이 계산됩니다.</span>
                </p>
              </div>

              {/* SpEL 표현식 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  조건식 (Python 스타일, 0~100% 백분율) <span className="text-red-500">*</span>
                </label>
                <SpelEditor
                  value={pythonCode}
                  onChange={setPythonCode}
                  onSpelChange={(spel) => setFormData({ ...formData, condition: spel })}
                  disabled={submitting}
                  variables={spelVariables.map(v => v.path.replace('#', ''))}
                />
              </div>

              {/* Python 예시 */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-3 text-xs font-medium text-gray-500">예시 (클릭하여 입력)</p>
                <div className="flex flex-wrap gap-2">
                  {spelExamples.length > 0 ? (
                    spelExamples.map((example, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertPythonExample(example.condition.replace(/#/g, '').replace(/&&/g, 'and').replace(/\|\|/g, 'or'))}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                        title={example.description}
                      >
                        {example.description}
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => insertPythonExample('progressField >= 50')}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                      >
                        progressField &gt;= 50
                      </button>
                      <button
                        type="button"
                        onClick={() => insertPythonExample('progressField == 100')}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                      >
                        progressField == 100
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 보상 설정 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">보상 설정</h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Tier */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  난이도 (Tier) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    disabled={submitting}
                  >
                    {[1, 2, 3, 4, 5, 6].map((tier) => (
                      <option key={tier} value={tier}>
                        {getTierLabel(tier)}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">선택됨:</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTierStyle(formData.tier)}`}>
                      {getTierLabel(formData.tier)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Point */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  보상 포인트 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.point}
                  onChange={(e) => setFormData({ ...formData, point: Math.max(0, Number(e.target.value)) })}
                  placeholder="100"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                <p className="mt-1.5 text-xs text-gray-500">달성 시 지급될 포인트</p>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
                  챌린지 생성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
