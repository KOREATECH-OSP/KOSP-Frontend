'use client';

import { X, Send } from 'lucide-react';
import { useState } from 'react';

interface TeamInviteModalProps {
  isOpen: boolean;
  teamName: string;
  onClose: () => void;
  onSendInvite: (studentId: string) => void;
}

export default function TeamInviteModal({
  isOpen,
  teamName,
  onClose,
  onSendInvite,
}: TeamInviteModalProps) {
  const [studentId, setStudentId] = useState('');

  const handleSendInvite = () => {
    if (!studentId.trim()) {
      alert('초대할 팀원의 학번을 입력해주세요');
      return;
    }

    if (!/^\d+$/.test(studentId)) {
      alert('학번은 숫자만 입력 가능합니다');
      return;
    }

    onSendInvite(studentId);
    
    // 초기화
    setStudentId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">팀원 초대</h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium text-blue-600">{teamName}</span>에 새로운 팀원을 초대하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div>
            <label htmlFor="studentId" className="block text-sm font-semibold text-gray-900 mb-2">
              팀원 학번 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="학번을 입력하세요 (예: 2024123456)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              초대할 팀원의 학번을 입력해주세요
            </p>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm"
          >
            취소
          </button>
          <button
            onClick={handleSendInvite}
            disabled={!studentId.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            초대 보내기
          </button>
        </div>
      </div>
    </div>
  );
}