'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { toast } from '@/lib/toast';
import {
  getAdminSeasons,
  createAdminSeason,
  updateAdminSeason,
  runSeasonRankingBatch,
} from '@/lib/api/admin';
import type { AdminSeasonItem } from '@/types/admin';
import { Plus, Play, Pencil, CheckCircle, Circle } from 'lucide-react';

export default function AdminRankingPage() {
  const { data: session } = useSession();
  const [seasons, setSeasons] = useState<AdminSeasonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', startDate: '', endDate: '' });
  const [createLoading, setCreateLoading] = useState(false);

  const [editTarget, setEditTarget] = useState<AdminSeasonItem | null>(null);
  const [editForm, setEditForm] = useState({ name: '', startDate: '', endDate: '' });
  const [editLoading, setEditLoading] = useState(false);

  const fetchSeasons = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const data = await getAdminSeasons({ accessToken: session.accessToken });
      setSeasons(data.seasons);
    } catch {
      toast.error('시즌 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const handleCreate = async () => {
    if (!session?.accessToken) return;
    if (!createForm.name || !createForm.startDate || !createForm.endDate) {
      toast.error('모든 항목을 입력해주세요.');
      return;
    }
    setCreateLoading(true);
    try {
      await createAdminSeason(createForm, { accessToken: session.accessToken });
      toast.success('시즌이 생성되었습니다.');
      setShowCreateModal(false);
      setCreateForm({ name: '', startDate: '', endDate: '' });
      fetchSeasons();
    } catch {
      toast.error('시즌 생성에 실패했습니다.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (season: AdminSeasonItem) => {
    setEditTarget(season);
    setEditForm({
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
    });
  };

  const handleEdit = async () => {
    if (!session?.accessToken || !editTarget) return;
    setEditLoading(true);
    try {
      await updateAdminSeason(
        editTarget.id,
        { name: editForm.name, startDate: editForm.startDate, endDate: editForm.endDate },
        { accessToken: session.accessToken }
      );
      toast.success('시즌 정보가 수정되었습니다.');
      setEditTarget(null);
      fetchSeasons();
    } catch {
      toast.error('시즌 수정에 실패했습니다.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleActivate = async (season: AdminSeasonItem) => {
    if (!session?.accessToken) return;
    if (season.isActive) {
      toast.error('이미 활성 시즌입니다.');
      return;
    }
    if (!confirm(`"${season.name}"을 활성 시즌으로 변경하시겠습니까?\n기존 활성 시즌은 자동으로 비활성화됩니다.`)) return;
    try {
      await updateAdminSeason(season.id, { isActive: true }, { accessToken: session.accessToken });
      toast.success(`"${season.name}"이 활성 시즌으로 설정되었습니다.`);
      fetchSeasons();
    } catch {
      toast.error('활성 시즌 변경에 실패했습니다.');
    }
  };

  const handleRunBatch = async () => {
    if (!session?.accessToken) return;
    if (!confirm('랭킹 배치를 즉시 실행하시겠습니까?\n커밋/챌린지 점수 재계산, 순위 갱신이 수행됩니다.')) return;
    setBatchRunning(true);
    try {
      await runSeasonRankingBatch({ accessToken: session.accessToken });
      toast.success('랭킹 배치가 실행되었습니다.');
    } catch {
      toast.error('배치 실행에 실패했습니다.');
    } finally {
      setBatchRunning(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">랭킹 관리</h1>
          <p className="mt-1 text-sm text-gray-500">시즌 기간 설정 및 랭킹 배치 관리</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBatch}
            disabled={batchRunning}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {batchRunning ? '실행 중...' : '랭킹 배치 실행'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            시즌 생성
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">시즌 목록</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          </div>
        ) : seasons.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">등록된 시즌이 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {seasons.map((season) => (
              <div key={season.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleActivate(season)}
                    title={season.isActive ? '활성 시즌' : '클릭하여 활성화'}
                    className="shrink-0"
                  >
                    {season.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300 hover:text-gray-500" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{season.name}</span>
                      {season.isActive && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          활성
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-gray-500">
                      {season.startDate} ~ {season.endDate}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(season)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  편집
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 시즌 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">새 시즌 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">시즌 이름</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="예: 2026-2학기"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">시작일</label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">종료일</label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">생성된 시즌은 비활성 상태입니다. 활성화는 목록에서 직접 설정하세요.</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setCreateForm({ name: '', startDate: '', endDate: '' }); }}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {createLoading ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 시즌 편집 모달 */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">시즌 편집</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">시즌 이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">시작일</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">종료일</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditTarget(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                disabled={editLoading}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {editLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
