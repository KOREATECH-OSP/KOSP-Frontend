'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Loader2, Users } from 'lucide-react';
import {
  getAdminProjectMembers,
  addAdminProjectMember,
  changeAdminProjectMemberRole,
  removeAdminProjectMember,
  closeAdminProject,
} from '@/lib/api/admin';
import type {
  AdminSeasonProjectMemberListResponse,
  AdminSeasonProjectMemberResponse,
} from '@/types/admin';
import { toast } from '@/lib/toast';

const ROLE_LABELS: Record<string, string> = { TEAM_LEAD: '팀장', PM: 'PM', MEMBER: '멤버' };
const ROLE_BONUS: Record<string, number> = { TEAM_LEAD: 2, PM: 1, MEMBER: 0 };
const ROLE_STYLE: Record<string, string> = {
  TEAM_LEAD: 'bg-yellow-100 text-yellow-800',
  PM: 'bg-violet-100 text-violet-700',
  MEMBER: 'bg-gray-100 text-gray-600',
};
const LEVEL_COLOR: Record<number, string> = {
  1: 'bg-green-50 text-green-700',
  2: 'bg-blue-50 text-blue-700',
  3: 'bg-purple-50 text-purple-700',
  4: 'bg-orange-50 text-orange-700',
  5: 'bg-amber-50 text-amber-700',
};

type RoleType = 'TEAM_LEAD' | 'PM' | 'MEMBER';

export default function AdminProjectDetailPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session, status } = useSession();

  const [data, setData] = useState<AdminSeasonProjectMemberListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 멤버 추가 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ userId: '', roleType: '' as RoleType | '' });
  const [adding, setAdding] = useState(false);

  // 역할 변경 모달
  const [roleTarget, setRoleTarget] = useState<AdminSeasonProjectMemberResponse | null>(null);
  const [newRole, setNewRole] = useState<RoleType>('MEMBER');
  const [changingRole, setChangingRole] = useState(false);

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState<AdminSeasonProjectMemberResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 종료 확인 모달
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken || !projectId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminProjectMembers(Number(projectId), { accessToken: session.accessToken });
      setData(result);
    } catch {
      setError('프로젝트 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, projectId]);

  useEffect(() => {
    if (status === 'authenticated') fetchData();
    else if (status === 'unauthenticated') router.push('/login');
  }, [status, fetchData, router]);

  const handleAddMember = async () => {
    if (!session?.accessToken || !addForm.userId || !addForm.roleType) {
      toast.error('유저 ID와 역할을 모두 입력하세요.');
      return;
    }
    try {
      setAdding(true);
      await addAdminProjectMember(
        Number(projectId),
        { userId: Number(addForm.userId), roleType: addForm.roleType },
        { accessToken: session.accessToken }
      );
      toast.success('멤버가 추가되었습니다.');
      setShowAddModal(false);
      setAddForm({ userId: '', roleType: '' });
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(msg.includes('409') ? '이미 등록된 참여자입니다.' : '멤버 추가에 실패했습니다.');
    } finally {
      setAdding(false);
    }
  };

  // 역할 변경은 백엔드 API가 없으므로 삭제 후 재추가 방식임을 안내
  const handleChangeRole = async () => {
    if (!roleTarget || !session?.accessToken) return;
    try {
      setChangingRole(true);
      await changeAdminProjectMemberRole(roleTarget.memberId, newRole, { accessToken: session.accessToken });
      toast.success('역할이 변경되었습니다.');
      setRoleTarget(null);
      await fetchData();
    } catch {
      toast.error('역할 변경에 실패했습니다.');
    } finally {
      setChangingRole(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    try {
      setDeleting(true);
      await removeAdminProjectMember(deleteTarget.memberId, { accessToken: session.accessToken });
      toast.success('멤버가 삭제되었습니다.');
      setDeleteTarget(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(msg.includes('400') ? '이미 점수가 지급된 참여자는 삭제할 수 없습니다.' : '멤버 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseProject = async () => {
    if (!session?.accessToken) return;
    try {
      setClosing(true);
      await closeAdminProject(Number(projectId), { accessToken: session.accessToken });
      toast.success('프로젝트가 종료되었습니다. 모든 멤버에게 점수가 지급되었습니다.');
      setShowCloseModal(false);
      await fetchData();
    } catch {
      toast.error('프로젝트 종료에 실패했습니다.');
    } finally {
      setClosing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">{error ?? '데이터를 불러올 수 없습니다.'}</p>
          <button onClick={fetchData} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const isOpen = data.members.some(m => !m.scoreGranted) || data.members.length === 0;
  const previewScore = (role: RoleType) => data.baseScore + ROLE_BONUS[role];

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.push('/admin/projects')}
          className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          프로젝트 목록으로
        </button>

        {/* 프로젝트 헤더 */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold ${LEVEL_COLOR[data.projectLevel]}`}>
              L{data.projectLevel}
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">{data.projectName}</h1>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                <span>Level {data.projectLevel}</span>
                <span>기본점수 {data.baseScore}점</span>
                <span>멤버 {data.members.length}명</span>
              </div>
            </div>
          </div>
          {isOpen && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
              >
                <Plus className="h-3.5 w-3.5" />
                멤버 추가
              </button>
              <button
                onClick={() => setShowCloseModal(true)}
                className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
              >
                프로젝트 종료
              </button>
            </div>
          )}
        </div>

        {/* 점수 구조 */}
        <div className="mb-4 flex gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-500">
          <span>점수 구조</span>
          {(['TEAM_LEAD', 'PM', 'MEMBER'] as RoleType[]).map(role => (
            <span key={role}>
              {ROLE_LABELS[role]}: <strong className="text-gray-900">{previewScore(role)}점</strong>
            </span>
          ))}
          {!isOpen && <span className="text-gray-400 ml-auto">종료된 프로젝트 · 점수 지급 완료</span>}
        </div>

        {/* 멤버 테이블 */}
        {data.members.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">등록된 멤버가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">참여자</th>
                  <th className="px-4 py-3">역할</th>
                  <th className="px-4 py-3">역할 보너스</th>
                  <th className="px-4 py-3">최종 점수</th>
                  <th className="px-4 py-3">점수 지급</th>
                  {isOpen && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.members.map(member => (
                  <tr key={member.memberId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {member.userName}
                      <span className="ml-2 text-xs text-gray-400">ID: {member.userId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${ROLE_STYLE[member.roleType]}`}>
                        {ROLE_LABELS[member.roleType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">+{member.roleBonus}점</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        {data.baseScore + member.roleBonus}점
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {member.scoreGranted
                        ? <span className="text-xs font-semibold text-green-600">✅ 지급 완료</span>
                        : <span className="text-xs font-semibold text-amber-500">⏳ 미지급</span>
                      }
                    </td>
                    {isOpen && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setRoleTarget(member); setNewRole(member.roleType); }}
                            className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                          >
                            역할 변경
                          </button>
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 멤버 추가 모달 */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-lg font-bold text-gray-900">멤버 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">유저 ID *</label>
                <input
                  type="number"
                  value={addForm.userId}
                  onChange={e => setAddForm(f => ({ ...f, userId: e.target.value }))}
                  placeholder="예: 42"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">역할 *</label>
                <select
                  value={addForm.roleType}
                  onChange={e => setAddForm(f => ({ ...f, roleType: e.target.value as RoleType }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                >
                  <option value="">역할을 선택하세요</option>
                  <option value="TEAM_LEAD">팀장 (Team Lead) — +2점</option>
                  <option value="PM">PM — +1점</option>
                  <option value="MEMBER">멤버 (Member) — +0점</option>
                </select>
                {addForm.roleType && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                    <span>지급될 점수 (종료 시)</span>
                    <span className="font-bold text-gray-900">{previewScore(addForm.roleType)}점</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAddModal(false)} disabled={adding} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">취소</button>
              <button onClick={handleAddMember} disabled={adding} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {adding ? '추가 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 역할 변경 모달 */}
      {roleTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setRoleTarget(null); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-lg font-bold text-gray-900">역할 변경</h2>
            <p className="mb-4 text-sm text-gray-500">대상: <strong className="text-gray-900">{roleTarget.userName}</strong></p>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">새 역할</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as RoleType)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              >
                <option value="TEAM_LEAD">팀장 (Team Lead) — +2점</option>
                <option value="PM">PM — +1점</option>
                <option value="MEMBER">멤버 (Member) — +0점</option>
              </select>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                <span>변경 후 지급 점수</span>
                <span className="font-bold text-gray-900">{previewScore(newRole)}점</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRoleTarget(null)} disabled={changingRole} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">취소</button>
              <button onClick={handleChangeRole} disabled={changingRole} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                {changingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {changingRole ? '변경 중...' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 삭제 모달 */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">멤버 삭제</h2>
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              <strong className="block mb-1">⚠️ 삭제하면 되돌릴 수 없습니다</strong>
              삭제된 멤버는 종료 시 점수가 지급되지 않습니다.
            </div>
            <p className="mb-5 text-sm text-gray-700"><strong className="text-gray-900">{deleteTarget.userName}</strong> 멤버를 프로젝트에서 삭제하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">취소</button>
              <button onClick={handleDeleteMember} disabled={deleting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 종료 모달 */}
      {showCloseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowCloseModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">프로젝트 종료</h2>
            <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm text-orange-700">
              <strong className="block mb-1">⚠️ 이 작업은 되돌릴 수 없습니다</strong>
              종료하면 모든 멤버에게 점수가 즉시 일괄 지급되며, 이후 멤버 추가·수정이 불가능합니다.
            </div>
            <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
              <p className="mb-2 font-semibold text-gray-900">지급 예정 점수 (멤버 {data.members.length}명)</p>
              <ul className="space-y-1 text-gray-600">
                {data.members.filter(m => !m.scoreGranted).map(m => (
                  <li key={m.memberId}>
                    {m.userName} ({ROLE_LABELS[m.roleType]}) →{' '}
                    <strong className="text-gray-900">{data.baseScore + m.roleBonus}점</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCloseModal(false)} disabled={closing} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">취소</button>
              <button onClick={handleCloseProject} disabled={closing} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {closing ? '처리 중...' : '종료 및 점수 지급'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
