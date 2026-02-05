/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { X, Upload, Type, FileText, MessageCircle, ImageIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';
import Image from 'next/image';

interface TeamEditFormData {
  title: string;
  description: string;
  inviteMessage: string;
  imageUrl?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(formData.imageUrl);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);

        onChange({
          target: {
            name: 'imageUrl',
            value: result
          }
        } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    onChange({
      target: {
        name: 'imageUrl',
        value: ''
      }
    } as any);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-[#f7f8fa] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl safe-area-bottom">
        {/* 모달 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 bg-white rounded-t-2xl">
          {/* Mobile drag indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">팀 정보 수정</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">팀 정보를 업데이트하세요</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors touch-feedback"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* 팀 이미지 섹션 */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                imagePreview ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">팀 이미지</h3>
                <p className="text-[13px] text-gray-400">팀을 대표하는 이미지를 업로드하세요</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              {/* 이미지 미리보기 */}
              <div className="relative">
                <div
                  onClick={handleImageClick}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-orange-400 transition-colors"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="팀 이미지 미리보기"
                      className="w-full h-full object-cover"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Image
                        src={KoriSupport}
                        alt="팀 기본 아이콘"
                        width={48}
                        height={48}
                        className="w-10 h-10 sm:w-12 sm:h-12"
                      />
                    </div>
                  )}

                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* 이미지 삭제 버튼 */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 업로드 버튼 */}
              <div className="flex-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 touch-feedback"
                >
                  <Upload className="w-4 h-4" />
                  이미지 선택
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors touch-feedback"
                  >
                    이미지 제거
                  </button>
                )}
                <p className="text-[12px] text-gray-400 mt-1">JPG, PNG 형식 | 최대 5MB</p>
              </div>

              {/* 숨겨진 파일 입력 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </section>

          {/* 팀 이름 섹션 */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  formData.title.trim() ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Type className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">팀 이름</h3>
                  <p className="text-[13px] text-gray-400">팀을 잘 나타내는 이름을 지어주세요</p>
                </div>
              </div>
              <span className="text-xs text-red-400">필수</span>
            </div>

            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="예: 오픈소스 스터디"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
            />
          </section>

          {/* 팀 설명 섹션 */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  formData.description.trim() ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">팀 설명</h3>
                  <p className="text-[13px] text-gray-400">팀의 목표와 활동을 소개하세요</p>
                </div>
              </div>
              <span className="text-xs text-red-400">필수</span>
            </div>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="팀에 대한 설명을 입력하세요"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none resize-none transition-colors"
            />
          </section>

          {/* 초대 메시지 섹션 */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  formData.inviteMessage.trim() ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">초대 메시지</h3>
                  <p className="text-[13px] text-gray-400">새 멤버에게 보낼 환영 메시지</p>
                </div>
              </div>
              <span className="text-xs text-red-400">필수</span>
            </div>

            <textarea
              id="inviteMessage"
              name="inviteMessage"
              value={formData.inviteMessage}
              onChange={onChange}
              placeholder="새로운 멤버에게 보낼 초대 메시지를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none resize-none transition-colors"
            />
          </section>
        </div>

        {/* 모달 푸터 */}
        <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 p-4 sm:p-5 border-t border-gray-200 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="min-h-[48px] px-6 py-3 rounded-xl text-[14px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 touch-feedback"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="min-h-[48px] px-8 py-3 bg-orange-500 text-white rounded-xl text-[14px] font-semibold shadow-sm transition-all hover:bg-orange-600 touch-feedback"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamEditModal;
