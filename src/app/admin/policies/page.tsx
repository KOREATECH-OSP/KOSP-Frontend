'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Shield, Plus, X, Loader2, Trash2, Key, CheckCircle2 } from 'lucide-react';
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
        getPolicies({ accessToken: session.accessToken }),
        getPermissions({ accessToken: session.accessToken }),
      ]);
      setPolicies(policiesData.policies);
      setPermissions(permissionsData.permissions);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDeletePolicy = async (policyId: number) => {
    if (!session?.accessToken) return;
    if (!confirm('이 정책을 삭제하시겠습니까?')) return;

    try {
      await deletePolicy(policyId, { accessToken: session.accessToken });
      toast.success('정책이 삭제되었습니다.');
      fetchData();
    } catch (err) {
      console.error('Failed to delete policy:', err);
      toast.error('정책 삭제에 실패했습니다.');
    }
  };

  const handlePermissionToggle = async (policyId: number, permissionId: number, action: 'add' | 'remove') => {
    if (!session?.accessToken) return;

    try {
      if (action === 'add') {
        await attachPermissionToPolicy(policyId, permissionId, { accessToken: session.accessToken });
        toast.success('권한이 추가되었습니다.');
      } else {
        await detachPermissionFromPolicy(policyId, permissionId, { accessToken: session.accessToken });
        toast.success('권한이 제거되었습니다.');
      }
      fetchData();
    } catch (err) {
      console.error('Failed to toggle permission:', err);
      toast.error('권한 변경에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 md:p-8">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                      <Shield className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                      <span className="text-xs text-gray-400">ID: {policy.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="mb-4 text-sm text-gray-500">{policy.description}</p>

                <div className="border-t border-gray-100 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        권한 ({policy.permissions.length})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setShowPermissionModal(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      관리
                    </button>
                  </div>

                  {policy.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {policy.permissions.slice(0, 5).map((perm) => (
                        <span
                          key={perm.id}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                        >
                          {perm.name}
                        </span>
                      ))}
                      {policy.permissions.length > 5 && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                          +{policy.permissions.length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-50 p-2 text-center text-xs text-gray-400">
                      권한 없음
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              {permissions.map((perm) => (
                <label
                  key={perm.id}
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
  onToggle: (policyId: number, permissionId: number, action: 'add' | 'remove') => void;
}) {
  const policyPermissionIds = policy.permissions.map((p) => p.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">권한 관리</h2>
            <p className="text-sm text-gray-500">{policy.name} 정책의 권한을 관리하세요</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {allPermissions.map((perm) => {
            const hasPermission = policyPermissionIds.includes(perm.id);
            return (
              <div
                key={perm.id}
                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                  hasPermission ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{perm.name}</span>
                      {hasPermission && <CheckCircle2 className="h-4 w-4 text-gray-900" />}
                    </div>
                    <p className="text-xs text-gray-500">{perm.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => onToggle(policy.id, perm.id, hasPermission ? 'remove' : 'add')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    hasPermission
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {hasPermission ? '제거' : '추가'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
