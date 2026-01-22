'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ArrowLeft, Trophy, Lightbulb, Save, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { getAdminChallenge, updateAdminChallenge, getSpelVariables, type SpelVariable, type SpelExample } from '@/lib/api/admin';
import type { AdminChallengeUpdateRequest } from '@/types/admin';
import { toast } from '@/lib/toast';
import SpelEditor from '@/common/components/SpelEditor';

export default function EditChallengePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pythonCode, setPythonCode] = useState('');
  const [spelVariables, setSpelVariables] = useState<SpelVariable[]>([]);
  const [spelExamples, setSpelExamples] = useState<SpelExample[]>([]);
  const [showVariables, setShowVariables] = useState(true);
  const [formData, setFormData] = useState<AdminChallengeUpdateRequest>({
    name: '',
    description: '',
    condition: '',
    tier: 0,
    imageUrl: '',
    point: 0,
    maxProgress: 0,
    progressField: '',
  });

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

  // SpEL을 Python으로 역변환 (소수를 백분율로)
  const spelToPython = (spel: string): string => {
    if (!spel.trim()) return '';
    let python = spel;

    // #progressField 와 소수 값을 백분율로 변환
    // #progressField >= 0.5 -> progressField >= 50
    python = python.replace(/#(progressField)\s*(>=|<=|>|<|==|!=)\s*(0?\.\d+|\d+(?:\.\d+)?)/g, (match, variable, operator, value) => {
      const floatValue = parseFloat(value);
      // 1 이하의 소수는 백분율로 변환
      const percentValue = floatValue <= 1 ? Math.round(floatValue * 100) : floatValue;
      return `${variable} ${operator} ${percentValue}`;
    });

    // 나머지 # 제거
    python = python.replace(/#(activity|user|commits|posts|comments|attendance)/g, '$1');
    python = python.replace(/&&/g, 'and');
    python = python.replace(/\|\|/g, 'or');
    python = python.replace(/!/g, 'not ');
    python = python.replace(/\btrue\b/g, 'True');
    python = python.replace(/\bfalse\b/g, 'False');
    return python;
  };

  const fetchChallenge = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const data = await getAdminChallenge(Number(id), { accessToken: session.accessToken });
      setFormData({
        name: data.name,
        description: data.description,
        condition: data.condition,
        tier: data.tier,
        imageUrl: data.imageUrl,
        point: data.point,
        maxProgress: data.maxProgress,
        progressField: data.progressField,
      });
      // SpEL을 Python으로 역변환하여 에디터에 표시
      setPythonCode(spelToPython(data.condition));
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
      toast.error('챌린지 정보를 불러오는데 실패했습니다.');
      router.push('/admin/challenges/list');
    } finally {
      setLoading(false);
    }
  }, [id, session?.accessToken, router, spelToPython]);

  useEffect(() => {
    if (id && session?.accessToken) {
      fetchChallenge();
    }
  }, [id, session?.accessToken, fetchChallenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) return;

    if (!formData.name || !formData.description || !formData.condition || !formData.progressField) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await updateAdminChallenge(Number(id), formData, { accessToken: session.accessToken });
      toast.success('챌린지가 수정되었습니다.');
      router.push('/admin/challenges/list');
    } catch (error: unknown) {
      console.error('Failed to update challenge:', error);
      const errorMessage = error instanceof Error ? error.message : '챌린지 수정에 실패했습니다.';
      toast.error(errorMessage);
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

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로 가기</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">챌린지 수정</h1>
          <p className="mt-0.5 text-sm text-gray-500">챌린지 정보를 수정합니다</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              기본 정보
            </h2>
            <div className="space-y-4">
              {/* 챌린지 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  챌린지 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 커밋수 100개"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="챌린지에 대한 설명을 입력하세요"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none resize-none"
                  disabled={submitting}
                />
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                {formData.imageUrl && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">미리보기:</p>
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover rounded-lg"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SpEL 조건식 섹션 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              달성 조건 (SpEL)
            </h2>
            <div className="space-y-4">
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

              {/* 조건식 (Python) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Python 예시 버튼 */}
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
                        disabled={submitting}
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
                        disabled={submitting}
                      >
                        progressField &gt;= 50
                      </button>
                      <button
                        type="button"
                        onClick={() => insertPythonExample('progressField == 100')}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                        disabled={submitting}
                      >
                        progressField == 100
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Field <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.progressField}
                  onChange={(e) => setFormData({ ...formData, progressField: e.target.value })}
                  placeholder="예: totalCommits"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none font-mono"
                  disabled={submitting}
                />
                <p className="mt-2 text-xs text-gray-500">
                  진행도를 추적할 필드명을 입력하세요
                </p>
              </div>

              {/* Max Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 진행도 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxProgress}
                  onChange={(e) => setFormData({ ...formData, maxProgress: Number(e.target.value) })}
                  placeholder="100"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* 보상 설정 섹션 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">보상 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도 (Tier) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보상 포인트 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.point}
                  onChange={(e) => setFormData({ ...formData, point: Math.max(0, Number(e.target.value)) })}
                  placeholder="100"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  수정 중...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  수정 완료
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
