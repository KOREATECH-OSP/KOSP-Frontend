'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Shield, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { getPolicies, getPermissions, createPolicy, deletePolicy, attachPermissionToPolicy, detachPermissionFromPolicy } from '@/lib/api/admin';
import type { PolicyResponse, PermissionResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

export default function AdminPoliciesPage() {
  const { data: session } = useSession();
  const [policies, setPolicies] = useState<PolicyResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyResponse | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

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

  const handleCreatePolicy = async (data: { name: string; description: string; permissionIds: number[] }) => {
    if (!session?.accessToken) return;

    try {
      await createPolicy(data, { accessToken: session.accessToken });
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
      fetchData();
    } catch (err) {
      console.error('Failed to toggle permission:', err);
      toast.error('권한 변경에 실패했습니다.');
    }
  };

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">정책(Policy) 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
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
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      정책명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      설명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      권한
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPolicies.map((policy) => (
                    <tr key={policy.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{policy.name}</div>
                          <div className="text-xs text-gray-400">ID: {policy.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{policy.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {policy.permissions && policy.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {policy.permissions.slice(0, 3).map((perm, index) => (
                              <span
                                key={perm.id ?? perm.name ?? index}
                                className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                              >
                                {perm.name}
                              </span>
                            ))}
                            {policy.permissions.length > 3 && (
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                                +{policy.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setShowPermissionModal(true);
                            }}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            권한
                          </button>
                          <button
                            onClick={() => handleDeletePolicy(policy.name)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  onSave: (data: { name: string; description: string; permissionIds: number[] }) => void;
}) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const togglePermission = (id: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }
    onSave({ ...formData, permissionIds: selectedPermissions });
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
              설명 <span className="text-red-500">*</span>
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
              {permissions.map((perm, index) => (
                <label
                  key={perm.id ?? perm.name ?? index}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
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
  policy: PolicyResponse;
  allPermissions: PermissionResponse[];
  onClose: () => void;
  onToggle: (policyName: string, permissionName: string, action: 'add' | 'remove') => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const policyPermissionNames = (policy.permissions || []).map((p) => p.name);
  const assignedCount = policyPermissionNames.length;

  const filteredPermissions = allPermissions.filter(
    (perm) =>
      perm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">권한 관리</h2>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{policy.name}</span> 정책에 할당된 권한: {assignedCount}개
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
              placeholder="권한 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredPermissions.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-500">
              검색 결과가 없습니다
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    권한명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    설명
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPermissions.map((perm, index) => {
                  const hasPermission = policyPermissionNames.includes(perm.name);
                  return (
                    <tr key={perm.id ?? perm.name ?? index} className={`transition-colors ${hasPermission ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                      <td className="whitespace-nowrap px-6 py-3">
                        {hasPermission ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            할당됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                            미할당
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <span className="font-medium text-gray-900">{perm.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-600">{perm.description || '-'}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        <button
                          onClick={() => onToggle(policy.name, perm.name, hasPermission ? 'remove' : 'add')}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            hasPermission
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {hasPermission ? '제거' : '추가'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
