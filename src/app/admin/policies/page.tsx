'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { Search, Shield, Plus, X, Loader2 } from 'lucide-react';
import { getPolicies, getPolicy, getPermissions, createPolicy, deletePolicy, attachPermissionToPolicy, detachPermissionFromPolicy } from '@/lib/api/admin';
import type { PolicyResponse, PolicyDetailResponse, PermissionResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

export default function AdminPoliciesPage() {
  const { data: session } = useSession();
  const [policies, setPolicies] = useState<PolicyResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDetailResponse | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const [policiesData, permissionsData] = await Promise.all([
        getPolicies({ accessToken: session.accessToken }).catch(() => ({ policies: [] })),
        getPermissions({ accessToken: session.accessToken }).catch(() => ({ permissions: [] })),
      ]);
      setPolicies(policiesData.policies || []);
      setPermissions(permissionsData.permissions || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('데이터를 불러오는데 실패했습니다.');
      setPolicies([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePolicy = async (data: { name: string; description: string; permissionNames: string[] }) => {
    if (!session?.accessToken) return;

    try {
      // 1. 정책 생성
      await createPolicy(
        { name: data.name, description: data.description },
        { accessToken: session.accessToken }
      );

      // 2. 선택된 권한들을 정책에 할당
      for (const permissionName of data.permissionNames) {
        try {
          await attachPermissionToPolicy(data.name, permissionName, { accessToken: session.accessToken });
        } catch (permErr) {
          console.error(`Failed to attach permission ${permissionName}:`, permErr);
        }
      }

      toast.success('정책이 생성되었습니다.');
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create policy:', err);
      toast.error('정책 생성에 실패했습니다.');
    }
  };

  const handleDeletePolicy = async (policyName: string) => {
    if (!session?.accessToken) return;
    if (!confirm('이 정책을 삭제하시겠습니까?')) return;

    try {
      await deletePolicy(policyName, { accessToken: session.accessToken });
      toast.success('정책이 삭제되었습니다.');
      fetchData();
    } catch (err) {
      console.error('Failed to delete policy:', err);
      toast.error('정책 삭제에 실패했습니다.');
    }
  };

  const handleOpenPermissionModal = async (policy: PolicyResponse) => {
    if (!session?.accessToken) return;

    setIsLoadingPolicy(true);
    try {
      const policyDetail = await getPolicy(policy.name, { accessToken: session.accessToken });
      setSelectedPolicy(policyDetail);
      setShowPermissionModal(true);
    } catch (err) {
      console.error('Failed to fetch policy detail:', err);
      toast.error('정책 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingPolicy(false);
    }
  };

  const handlePermissionToggle = async (policyName: string, permissionName: string, action: 'add' | 'remove') => {
    if (!session?.accessToken) return;

    try {
      if (action === 'add') {
        await attachPermissionToPolicy(policyName, permissionName, { accessToken: session.accessToken });
        toast.success('권한이 추가되었습니다.');
      } else {
        await detachPermissionFromPolicy(policyName, permissionName, { accessToken: session.accessToken });
        toast.success('권한이 제거되었습니다.');
      }

      // 정책 상세 다시 조회해서 업데이트
      const updatedPolicy = await getPolicy(policyName, { accessToken: session.accessToken });
      setSelectedPolicy(updatedPolicy);
    } catch (err: unknown) {
      console.error('Failed to toggle permission:', err);
      const errorMessage = err instanceof Error ? err.message : '권한 변경에 실패했습니다.';
      toast.error(errorMessage);
      throw err; // 모달에서 에러 상태 처리를 위해 throw
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">정책(Policy) 관리</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            권한들을 그룹화한 정책을 관리합니다
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">전체 정책</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{policies.length}개</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="정책 이름 또는 설명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-5 w-5" />
              정책 생성
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-100">
              {filteredPolicies.map((policy) => (
                <li key={policy.id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-900">{policy.name}</span>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{policy.description || '설명 없음'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleOpenPermissionModal(policy)}
                      disabled={isLoadingPolicy}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      {isLoadingPolicy ? <Loader2 className="h-3 w-3 animate-spin" /> : '권한'}
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.name)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showCreateModal && (
          <PolicyFormModal
            permissions={permissions}
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreatePolicy}
          />
        )}

        {showPermissionModal && selectedPolicy && (
          <PermissionManageModal
            policy={selectedPolicy}
            allPermissions={permissions}
            onClose={() => setShowPermissionModal(false)}
            onToggle={handlePermissionToggle}
          />
        )}
      </div>
    </div>
  );
}

function PolicyFormModal({
  permissions,
  onClose,
  onSave,
}: {
  permissions: PermissionResponse[];
  onClose: () => void;
  onSave: (data: { name: string; description: string; permissionNames: string[] }) => void;
}) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('정책 이름을 입력해주세요');
      return;
    }
    onSave({ ...formData, permissionNames: selectedPermissions });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">정책 생성</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              정책 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: CHALLENGE_MANAGER"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="정책에 대한 설명을 입력하세요"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              권한 선택 ({selectedPermissions.length}개)
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3">
              {permissions.map((perm) => (
                <label
                  key={`create-perm-${perm.name}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.name)}
                    onChange={() => togglePermission(perm.name)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{perm.name}</div>
                    <div className="text-xs text-gray-500">{perm.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PermissionManageModal({
  policy,
  allPermissions,
  onClose,
  onToggle,
}: {
  policy: PolicyDetailResponse;
  allPermissions: PermissionResponse[];
  onClose: () => void;
  onToggle: (policyName: string, permissionName: string, action: 'add' | 'remove') => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPermission, setLoadingPermission] = useState<string | null>(null);

  // 현재 할당된 권한 이름 목록
  const assignedPermissionNames = new Set((policy.permissions || []).map((p) => p.name));

  const filteredPermissions = allPermissions.filter(
    (perm) =>
      perm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 할당된 권한과 미할당 권한 분리
  const assignedPermissions = filteredPermissions.filter((p) => assignedPermissionNames.has(p.name));
  const unassignedPermissions = filteredPermissions.filter((p) => !assignedPermissionNames.has(p.name));

  const handleAction = async (permName: string, action: 'add' | 'remove') => {
    setLoadingPermission(permName);
    try {
      await onToggle(policy.name, permName, action);
    } catch {
      // 에러는 이미 onToggle에서 처리됨
    }
    setLoadingPermission(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">권한 관리</h2>
              <p className="text-sm text-gray-500">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-900">
                  {policy.name}
                </span>
                <span className="ml-1">정책의 권한을 관리합니다</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="권한 이름 또는 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Content - 2열 레이아웃 */}
        <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-gray-200">
          {/* 좌측: 미할당 권한 */}
          <div className="flex min-h-0 flex-col">
            <div className="shrink-0 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600">
                  {unassignedPermissions.length}
                </span>
                미할당 권한
              </h3>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {unassignedPermissions.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-gray-400">
                  미할당 권한이 없습니다
                </div>
              ) : (
                <div className="space-y-2">
                  {unassignedPermissions.map((perm) => (
                    <div
                      key={`unassigned-${perm.name}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{perm.name}</div>
                        <div className="text-xs text-gray-500 truncate">{perm.description || '설명 없음'}</div>
                      </div>
                      <button
                        onClick={() => handleAction(perm.name, 'add')}
                        disabled={loadingPermission !== null}
                        className="flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                      >
                        {loadingPermission === perm.name ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            추가
                            <span className="ml-0.5">→</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 우측: 할당된 권한 */}
          <div className="flex min-h-0 flex-col">
            <div className="shrink-0 border-b border-gray-100 bg-green-50 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-green-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-xs text-green-700">
                  {assignedPermissions.length}
                </span>
                할당된 권한
              </h3>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-green-50/30 p-3">
              {assignedPermissions.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-gray-400">
                  할당된 권한이 없습니다
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedPermissions.map((perm) => (
                    <div
                      key={`assigned-${perm.name}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-white p-3 transition-all hover:shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{perm.name}</div>
                        <div className="text-xs text-gray-500 truncate">{perm.description || '설명 없음'}</div>
                      </div>
                      <button
                        onClick={() => handleAction(perm.name, 'remove')}
                        disabled={loadingPermission !== null}
                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {loadingPermission === perm.name ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <span className="mr-0.5">←</span>
                            제거
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
