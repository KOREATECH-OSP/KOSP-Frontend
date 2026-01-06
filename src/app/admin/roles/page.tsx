'use client';

import { useState } from 'react';
import { Search, Users, Shield, Plus, CheckCircle2, X } from 'lucide-react';
import { toast } from '@/lib/toast';
import type { Role, Policy } from '@/types/admin';

const MOCK_ROLES: Role[] = [
  { name: 'ADMIN', description: '시스템 관리자 - 모든 권한 보유', policies: ['ALL_ACCESS'] },
  { name: 'MANAGER', description: '콘텐츠 관리자 - 콘텐츠 및 사용자 관리', policies: ['CONTENT_MANAGE', 'USER_VIEW'] },
  { name: 'MEMBER', description: '일반 회원 - 기본 접근 권한', policies: ['CONTENT_VIEW'] },
];

const MOCK_POLICIES: Policy[] = [
  { id: 1, name: 'ALL_ACCESS', description: '모든 기능 접근 권한', permissions: [] },
  { id: 2, name: 'CONTENT_MANAGE', description: '콘텐츠 관리 권한', permissions: [] },
  { id: 3, name: 'CONTENT_VIEW', description: '콘텐츠 조회 권한', permissions: [] },
  { id: 4, name: 'USER_VIEW', description: '사용자 조회 권한', permissions: [] },
  { id: 5, name: 'CHALLENGE_ADMIN', description: '챌린지 관리 권한', permissions: [] },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRole = (data: { name: string; description: string }) => {
    const newRole: Role = {
      name: data.name,
      description: data.description,
      policies: [],
    };
    setRoles([...roles, newRole]);
    setShowCreateModal(false);
    toast.success('역할이 생성되었습니다');
  };

  const handleAddPolicy = (roleName: string, policyName: string) => {
    setRoles(
      roles.map((r) =>
        r.name === roleName
          ? { ...r, policies: [...r.policies, policyName] }
          : r
      )
    );
    setShowPolicyModal(false);
    toast.success('정책이 추가되었습니다');
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredRoles.map((role) => (
            <div
              key={role.name}
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
                    정책 추가
                  </button>
                </div>

                {role.policies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {role.policies.map((policyName) => (
                      <div
                        key={policyName}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {policyName}
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

        {filteredRoles.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}

        {showCreateModal && (
          <RoleFormModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateRole}
          />
        )}

        {showPolicyModal && selectedRole && (
          <AddPolicyModal
            role={selectedRole}
            policies={MOCK_POLICIES}
            onClose={() => setShowPolicyModal(false)}
            onAdd={handleAddPolicy}
          />
        )}
      </div>
    </div>
  );
}

function RoleFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => void;
}) {
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
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

function AddPolicyModal({
  role,
  policies,
  onClose,
  onAdd,
}: {
  role: Role;
  policies: Policy[];
  onClose: () => void;
  onAdd: (roleName: string, policyName: string) => void;
}) {
  const [selectedPolicy, setSelectedPolicy] = useState('');

  const availablePolicies = policies.filter(
    (policy) => !role.policies.includes(policy.name)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) {
      toast.error('정책을 선택해주세요');
      return;
    }
    onAdd(role.name, selectedPolicy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">정책 추가</h2>
            <p className="text-sm text-gray-500">
              <span className="font-semibold">{role.name}</span> 역할에 정책을
              추가합니다
            </p>
          </div>
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
              정책 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            >
              <option value="">정책을 선택하세요</option>
              {availablePolicies.map((policy) => (
                <option key={policy.id} value={policy.name}>
                  {policy.name} - {policy.description}
                </option>
              ))}
            </select>
            {availablePolicies.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                추가할 수 있는 정책이 없습니다.
              </p>
            )}
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
              disabled={availablePolicies.length === 0}
              className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
