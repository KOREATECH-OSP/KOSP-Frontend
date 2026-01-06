'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Users, Shield, Plus, CheckCircle2, X, Loader2, Trash2 } from 'lucide-react';
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
        getRoles({ accessToken: session.accessToken }),
        getPolicies({ accessToken: session.accessToken }),
      ]);
      setRoles(rolesData.roles);
      setPolicies(policiesData.policies);
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

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDeleteRole = async (roleId: number) => {
    if (!session?.accessToken) return;
    if (!confirm('이 역할을 삭제하시겠습니까?')) return;

    try {
      await deleteRole(roleId, { accessToken: session.accessToken });
      toast.success('역할이 삭제되었습니다.');
      fetchData();
    } catch (err) {
      console.error('Failed to delete role:', err);
      toast.error('역할 삭제에 실패했습니다.');
    }
  };

  const handlePolicyToggle = async (roleId: number, policyId: number, action: 'add' | 'remove') => {
    if (!session?.accessToken) return;

    try {
      if (action === 'add') {
        await attachPolicyToRole(roleId, policyId, { accessToken: session.accessToken });
        toast.success('정책이 추가되었습니다.');
      } else {
        await detachPolicyFromRole(roleId, policyId, { accessToken: session.accessToken });
        toast.success('정책이 제거되었습니다.');
      }
      fetchData();
    } catch (err) {
      console.error('Failed to toggle policy:', err);
      toast.error('정책 변경에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 md:p-8">
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        보유 정책 ({role.policies.length})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRole(role);
                        setShowPolicyModal(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      정책 관리
                    </button>
                  </div>

                  {role.policies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {role.policies.map((policy) => (
                        <div
                          key={policy.id}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {policy.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-400">
                      추가된 정책이 없습니다
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              {policies.map((policy) => (
                <label
                  key={policy.id}
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
  onToggle: (roleId: number, policyId: number, action: 'add' | 'remove') => void;
}) {
  const rolePolicyIds = role.policies.map((p) => p.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">정책 관리</h2>
            <p className="text-sm text-gray-500">{role.name} 역할의 정책을 관리하세요</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {allPolicies.map((policy) => {
            const hasPolicy = rolePolicyIds.includes(policy.id);
            return (
              <div
                key={policy.id}
                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                  hasPolicy ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{policy.name}</span>
                      {hasPolicy && <CheckCircle2 className="h-4 w-4 text-gray-900" />}
                    </div>
                    <p className="text-xs text-gray-500">{policy.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => onToggle(role.id, policy.id, hasPolicy ? 'remove' : 'add')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    hasPolicy
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {hasPolicy ? '제거' : '추가'}
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
