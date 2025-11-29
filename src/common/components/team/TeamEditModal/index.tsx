'use client';

import { X } from 'lucide-react';
import React from 'react';

interface TeamEditFormData {
  title: string;
  description: string;
  inviteMessage: string;
}

interface TeamEditModalProps {
  isOpen: boolean;
  formData: TeamEditFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onClose: () => void;
  onSave: () => void;
}

function TeamEditModal({
  isOpen,
  formData,
  onChange,
  onClose,
  onSave,
}: TeamEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">팀 정보 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6 space-y-6">
          {/* 팀 이름 */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
              팀 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="팀 이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 팀 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
              팀 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="팀에 대한 설명을 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 초대 메시지 */}
          <div>
            <label htmlFor="inviteMessage" className="block text-sm font-semibold text-gray-900 mb-2">
              초대 메시지 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="inviteMessage"
              name="inviteMessage"
              value={formData.inviteMessage}
              onChange={onChange}
              placeholder="새로운 멤버에게 보낼 초대 메시지를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamEditModal;
