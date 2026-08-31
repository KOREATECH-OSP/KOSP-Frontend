'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen, Loader2 } from 'lucide-react';
import {
  getAdminCurrentSeason,
  getAdminProjects,
  createAdminProject,
} from '@/lib/api/admin';
import type {
  AdminCurrentSeasonResponse,
  AdminSeasonProjectResponse,
} from '@/types/admin';
import { toast } from '@/lib/toast';

const LEVEL_SCORE: Record<number, number> = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 };
const LEVEL_COLOR: Record<number, string> = {
  1: 'bg-green-50 text-green-700',
  2: 'bg-blue-50 text-blue-700',
  3: 'bg-purple-50 text-purple-700',
  4: 'bg-orange-50 text-orange-700',
  5: 'bg-amber-50 text-amber-700',
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [season, setSeason] = useState<AdminCurrentSeasonResponse | null>(null);
  const [projects, setProjects] = useState<AdminSeasonProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', projectLevel: 0, note: '' });

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const currentSeason = await getAdminCurrentSeason({ accessToken: session.accessToken });
      setSeason(currentSeason);
      const data = await getAdminProjects(currentSeason.id, 0, { accessToken: session.accessToken });
      setProjects(data.projects);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === 'authenticated') fetchData();
    else if (status === 'unauthenticated') router.push('/login');
  }, [status, fetchData, router]);

  const handleCreate = async () => {
    if (!season || !session?.accessToken) return;
    if (!createForm.name.trim()) { toast.error('프로젝트 이름을 입력하세요.'); return; }
    if (!createForm.projectLevel) { toast.error('레벨을 선택하세요.'); return; }
    try {
      setCreating(true);
      await createAdminProject(
        season.id,
        { name: createForm.name, projectLevel: createForm.projectLevel, note: createForm.note || undefined },
        { accessToken: session.accessToken }
      );
      toast.success('프로젝트가 생성되었습니다.');
      setShowCreateModal(false);
      setCreateForm({ name: '', projectLevel: 0, note: '' });
      await fetchData();
    } catch {
      toast.error('프로젝트 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const openCount = projects.filter(p => p.status === 'OPEN').length;
  const closedCount = projects.filter(p => p.status === 'CLOSED').length;

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button onClick={fetchData} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">프로젝트 관리</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {season ? `${season.name} · ${season.startDate} ~ ${season.endDate}` : '시즌 정보 없음'}
          </p>
        </div>

        {/* 통계 */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: '전체', value: projects.length, icon: '📁' },
            { label: '진행 중', value: openCount, icon: '🟢' },
            { label: '종료', value: closedCount, icon: '✅' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 생성 버튼 */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            프로젝트 생성
          </button>
        </div>

        {/* 목록 */}
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-4 text-gray-500">등록된 프로젝트가 없습니다</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              첫 프로젝트 만들기
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-100">
              {projects.map(project => (
                <li
                  key={project.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                  style={{ opacity: project.status === 'CLOSED' ? 0.65 : 1 }}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${LEVEL_COLOR[project.projectLevel]}`}>
                    L{project.projectLevel}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        project.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {project.status === 'OPEN' ? '● OPEN' : 'CLOSED'}
                      </span>
                      <span className="truncate font-medium text-gray-900">{project.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <span>Level {project.projectLevel} · 기본점수 {project.baseScore}점</span>
                      {project.note && <span>· {project.note}</span>}
                      {project.closedAt && <span>· 종료: {project.closedAt.slice(0, 10)}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/projects/${project.id}`)}
                    className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {project.status === 'OPEN' ? '멤버 관리' : '멤버 조회'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 생성 모달 */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-lg font-bold text-gray-900">프로젝트 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">프로젝트 이름 *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="예: 오픈소스 기여 프로젝트"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">레벨 (1~5) *</label>
                <select
                  value={createForm.projectLevel}
                  onChange={e => setCreateForm(f => ({ ...f, projectLevel: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                >
                  <option value={0}>레벨을 선택하세요</option>
                  {[1, 2, 3, 4, 5].map(l => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
                {createForm.projectLevel > 0 && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                    <span>기본 점수</span>
                    <span className="font-bold text-gray-900">{LEVEL_SCORE[createForm.projectLevel]}점</span>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">비고 (선택)</label>
                <textarea
                  value={createForm.note}
                  onChange={e => setCreateForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="예: 산학협력 과제 연계"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {creating ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
