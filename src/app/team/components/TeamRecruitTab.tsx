'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Loader2 } from 'lucide-react';
import type { RecruitResponse, RecruitListResponse, PageMeta } from '@/lib/api/types';
import RecruitPostCard from '@/common/components/team/RecruitPostCard';
import Pagination from '@/common/components/Pagination';
import { getRecruits } from '@/lib/api/recruit';

const PAGE_SIZE = 10;

interface TeamRecruitTabProps {
  recruits: RecruitResponse[];
  boardId?: number;
  initialPagination?: PageMeta;
}

export default function TeamRecruitTab({
  recruits: initialRecruits,
  boardId = 5,
  initialPagination
}: TeamRecruitTabProps) {
  const [recruits, setRecruits] = useState<RecruitResponse[]>(initialRecruits);
  const [currentPage, setCurrentPage] = useState(initialPagination ? initialPagination.currentPage + 1 : 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecruits = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const response: RecruitListResponse = await getRecruits(boardId, { page, size: PAGE_SIZE });
      setRecruits(response.recruits);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.currentPage + 1);
    } catch (error) {
      console.error('Failed to fetch recruits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    // 초기 데이터 업데이트 시 상태 동기화
    setRecruits(initialRecruits);
    if (initialPagination) {
      setTotalPages(initialPagination.totalPages);
      setCurrentPage(initialPagination.currentPage + 1);
    }
  }, [initialRecruits, initialPagination]);

  const handlePageChange = (page: number) => {
    fetchRecruits(page);
  };

  const openRecruits = recruits.filter((r) => r.status === 'OPEN');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (openRecruits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 mb-4">
          <Users className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">모집 중인 공고가 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">새로운 팀원을 찾는 첫 번째 주인공이 되어보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {openRecruits.map((recruit) => (
          <RecruitPostCard key={recruit.id} recruit={recruit} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
