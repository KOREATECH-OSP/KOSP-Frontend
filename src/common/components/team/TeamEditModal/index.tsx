/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { X, Camera, Upload } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
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

  // formData.imageUrl이 변경될 때 imagePreview 업데이트
  // useEffect(() => {
  //   setImagePreview(formData.imageUrl);
  // }, [formData.imageUrl]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 이미지 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        
        // formData 업데이트
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
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
          {/* 팀 이미지 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              팀 이미지
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* 이미지 미리보기 */}
              <div className="relative">
                <div 
                  onClick={handleImageClick}
                  className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-blue-500 transition-colors"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview} 
                      alt="팀 이미지 미리보기" 
                      className="w-full h-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                      <div className="w-full h-full rounded-lg flex items-center justify-center bg-gray-100">
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
                    <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                </div>

                {/* 이미지 삭제 버튼 */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 안내 텍스트 & 업로드 버튼 */}
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">
                  팀을 대표하는 이미지를 업로드하세요
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    이미지 선택
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                    >
                      이미지 제거
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG 형식 | 최대 5MB
                </p>
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
          </div>

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