'use client';

import { useState } from 'react';
import { Search, Shield, Plus, X } from 'lucide-react';
import { toast } from '@/lib/toast';
import type { Policy } from '@/types/admin';

const MOCK_POLICIES: Policy[] = [
  { id: 1, name: 'ALL_ACCESS', description: '모든 기능 접근 권한', permissions: ['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE'] },
  { id: 2, name: 'CONTENT_MANAGE', description: '콘텐츠 관리 권한', permissions: ['ARTICLE_CREATE', 'ARTICLE_READ', 'ARTICLE_UPDATE', 'ARTICLE_DELETE'] },
  { id: 3, name: 'CONTENT_VIEW', description: '콘텐츠 조회 권한', permissions: ['ARTICLE_READ'] },
  { id: 4, name: 'USER_VIEW', description: '사용자 조회 권한', permissions: ['USER_READ'] },
  { id: 5, name: 'CHALLENGE_ADMIN', description: '챌린지 관리 권한', permissions: ['CHALLENGE_MANAGE'] },
];

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePolicy = (data: { name: string; description: string }) => {
    const newPolicy: Policy = {
      id: policies.length + 1,
      name: data.name,
      description: data.description,
      permissions: [],
    };
    setPolicies([...policies, newPolicy]);
    setShowCreateModal(false);
    toast.success('정책이 생성되었습니다');
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
              </div>

              <p className="mb-4 text-sm text-gray-500">{policy.description}</p>

              {policy.permissions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {policy.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPolicies.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}

        {showCreateModal && (
          <PolicyFormModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreatePolicy}
          />
        )}
      </div>
    </div>
  );
}

function PolicyFormModal({
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
