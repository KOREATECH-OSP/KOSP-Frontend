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

  const handleCreateRole = async (data: { name: string; description: string; canAccessAdmin: boolean; policyNames: string[] }) => {
    if (!session?.accessToken) return;

    try {
      // 1. 역할 생성
      await createRole(
        { name: data.name, description: data.description, canAccessAdmin: data.canAccessAdmin },
        { accessToken: session.accessToken }
      );

      // 2. 선택된 정책들을 역할에 할당
      for (const policyName of data.policyNames) {
        try {
          await attachPolicyToRole(data.name, policyName, { accessToken: session.accessToken });
        } catch (policyErr) {
          console.error(`Failed to attach policy ${policyName}:`, policyErr);
        }
      }

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

      // 데이터 다시 불러오기
      const [rolesData, policiesData] = await Promise.all([
        getRoles({ accessToken: session.accessToken }).catch(() => ({ roles: [] })),
        getPolicies({ accessToken: session.accessToken }).catch(() => ({ policies: [] })),
      ]);
      setRoles(rolesData.roles || []);
      setPolicies(policiesData.policies || []);

      // 선택된 역할 업데이트
      if (selectedRole) {
        const updatedRole = (rolesData.roles || []).find((r: RoleResponse) => r.name === selectedRole.name);
        if (updatedRole) {
          setSelectedRole(updatedRole);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to toggle policy:', err);
      const errorMessage = err instanceof Error ? err.message : '정책 변경에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">역할(Role) 관리</h1>
          <p className="mt-0.5 text-sm text-gray-500">
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
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-100">
              {filteredRoles.map((role) => (
                <li key={role.name} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{role.name}</span>
                      {role.policies && role.policies.length > 0 && (
                        <div className="flex gap-1">
                          {role.policies.slice(0, 2).map((policyName, idx) => (
                            <span
                              key={`role-${role.name}-policy-${idx}`}
                              className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                            >
                              {policyName}
                            </span>
                          ))}
                          {role.policies.length > 2 && (
                            <span className="text-xs text-gray-400">+{role.policies.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{role.description || '설명 없음'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
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
                </li>
              ))}
            </ul>
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
  onSave: (data: { name: string; description: string; canAccessAdmin: boolean; policyNames: string[] }) => void;
}) {
  const [formData, setFormData] = useState({ name: '', description: '', canAccessAdmin: false });
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  const togglePolicy = (policyName: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policyName) ? prev.filter((p) => p !== policyName) : [...prev, policyName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('역할 이름을 입력해주세요');
      return;
    }
    onSave({ ...formData, policyNames: selectedPolicies });
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
              설명
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
            <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.canAccessAdmin}
                onChange={(e) => setFormData({ ...formData, canAccessAdmin: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-gray-900"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">관리자 페이지 접근 권한</div>
                <div className="text-xs text-gray-500">이 역할을 가진 사용자가 관리자 페이지에 접근할 수 있습니다</div>
              </div>
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              정책 선택 ({selectedPolicies.length}개)
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3">
              {policies.map((policy) => (
                <label
                  key={`create-policy-${policy.name}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes(policy.name)}
                    onChange={() => togglePolicy(policy.name)}
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
  onToggle: (roleName: string, policyName: string, action: 'add' | 'remove') => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPolicy, setLoadingPolicy] = useState<string | null>(null);
  const rolePolicyNames = role.policies || [];
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
                {filteredPolicies.map((policy, idx) => {
                  const hasPolicy = rolePolicyNames.includes(policy.name);
                  return (
                    <tr key={`manage-policy-${idx}`} className={`transition-colors ${hasPolicy ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
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
                          onClick={async () => {
                            setLoadingPolicy(policy.name);
                            await onToggle(role.name, policy.name, hasPolicy ? 'remove' : 'add');
                            setLoadingPolicy(null);
                          }}
                          disabled={loadingPolicy !== null}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                            hasPolicy
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {loadingPolicy === policy.name ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : hasPolicy ? '제거' : '추가'}
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
