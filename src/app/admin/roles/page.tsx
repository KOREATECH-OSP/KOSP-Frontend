'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Users, Plus, CheckCircle2, X, Loader2 } from 'lucide-react';
import { getRoles, getPolicies, createRole, deleteRole, attachPolicyToRole, detachPolicyFromRole } from '@/lib/api/admin';
import type { RoleResponse, PolicyResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

export default function AdminRolesPage() {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [policies, setPolicies] = useState<PolicyResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const [rolesData, policiesData] = await Promise.all([
        getRoles({ accessToken: session.accessToken }).catch(() => ({ roles: [] })),
        getPolicies({ accessToken: session.accessToken }).catch(() => ({ policies: [] })),
      ]);
      setRoles(rolesData.roles || []);
      setPolicies(policiesData.policies || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('데이터를 불러오는데 실패했습니다.');
      setRoles([]);
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRoles = roles.filter(
    (role) =>
      role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRole = async (data: { name: string; description: string; policyIds: number[] }) => {
    if (!session?.accessToken) return;

    try {
      await createRole(data, { accessToken: session.accessToken });
      toast.success('역할이 생성되었습니다.');
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create role:', err);
      toast.error('역할 생성에 실패했습니다.');
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (!session?.accessToken) return;
    if (!confirm('이 역할을 삭제하시겠습니까?')) return;

    try {
      await deleteRole(roleName, { accessToken: session.accessToken });
      toast.success('역할이 삭제되었습니다.');
      fetchData();
    } catch (err) {
      console.error('Failed to delete role:', err);
      toast.error('역할 삭제에 실패했습니다.');
    }
  };

  const handlePolicyToggle = async (roleName: string, policyName: string, action: 'add' | 'remove') => {
    if (!session?.accessToken) return;

    try {
      if (action === 'add') {
        await attachPolicyToRole(roleName, policyName, { accessToken: session.accessToken });
        toast.success('정책이 추가되었습니다.');
      } else {
        await detachPolicyFromRole(roleName, policyName, { accessToken: session.accessToken });
        toast.success('정책이 제거되었습니다.');
      }
      fetchData();
    } catch (err) {
      console.error('Failed to toggle policy:', err);
      toast.error('정책 변경에 실패했습니다.');
    }
  };

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">역할(Role) 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            사용자에게 부여할 역할을 관리합니다
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">전체 역할</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{roles.length}개</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="역할 이름 또는 설명으로 검색"
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
              역할 생성
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      역할명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      설명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      정책
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{role.name}</div>
                          <div className="text-xs text-gray-400">ID: {role.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{role.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {role.policies && role.policies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {role.policies.slice(0, 3).map((policy, index) => (
                              <span
                                key={policy.id ?? policy.name ?? index}
                                className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                              >
                                {policy.name}
                              </span>
                            ))}
                            {role.policies.length > 3 && (
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                                +{role.policies.length - 3}
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
                              setSelectedRole(role);
                              setShowPolicyModal(true);
                            }}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            정책
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.name)}
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
          <RoleFormModal
            policies={policies}
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateRole}
          />
        )}

        {showPolicyModal && selectedRole && (
          <PolicyManageModal
            role={selectedRole}
            allPolicies={policies}
            onClose={() => setShowPolicyModal(false)}
            onToggle={handlePolicyToggle}
          />
        )}
      </div>
    </div>
  );
}

function RoleFormModal({
  policies,
  onClose,
  onSave,
}: {
  policies: PolicyResponse[];
  onClose: () => void;
  onSave: (data: { name: string; description: string; policyIds: number[] }) => void;
}) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPolicies, setSelectedPolicies] = useState<number[]>([]);

  const togglePolicy = (id: number) => {
    setSelectedPolicies((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }
    onSave({ ...formData, policyIds: selectedPolicies });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">역할 생성</h2>
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
              역할 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: ADMIN, MANAGER, MEMBER"
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
              placeholder="역할에 대한 설명을 입력하세요"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              정책 선택 ({selectedPolicies.length}개)
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3">
              {policies.map((policy, index) => (
                <label
                  key={policy.id ?? policy.name ?? index}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes(policy.id)}
                    onChange={() => togglePolicy(policy.id)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                    <div className="text-xs text-gray-500">{policy.description}</div>
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

function PolicyManageModal({
  role,
  allPolicies,
  onClose,
  onToggle,
}: {
  role: RoleResponse;
  allPolicies: PolicyResponse[];
  onClose: () => void;
  onToggle: (roleName: string, policyName: string, action: 'add' | 'remove') => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const rolePolicyNames = (role.policies || []).map((p) => p.name);
  const assignedCount = rolePolicyNames.length;

  const filteredPolicies = allPolicies.filter(
    (policy) =>
      policy.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">정책 관리</h2>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{role.name}</span> 역할에 할당된 정책: {assignedCount}개
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
              placeholder="정책 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredPolicies.length === 0 ? (
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
                    정책명
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
                {filteredPolicies.map((policy, index) => {
                  const hasPolicy = rolePolicyNames.includes(policy.name);
                  return (
                    <tr key={policy.id ?? policy.name ?? index} className={`transition-colors ${hasPolicy ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                      <td className="whitespace-nowrap px-6 py-3">
                        {hasPolicy ? (
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
                        <span className="font-medium text-gray-900">{policy.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-600">{policy.description || '-'}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        <button
                          onClick={() => onToggle(role.name, policy.name, hasPolicy ? 'remove' : 'add')}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            hasPolicy
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {hasPolicy ? '제거' : '추가'}
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
