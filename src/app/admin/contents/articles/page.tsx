'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import {
  FileText,
  Search,
  Eye,
  Heart,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { deleteAdminArticle } from '@/lib/api/admin';
import { clientApiClient } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import Pagination from '@/common/components/Pagination';

interface Board {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  boardId: number;
  author: {
    id: number;
    name: string;
    profileImage?: string;
  };
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

interface ArticlesResponse {
  posts: Article[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const BOARDS: Board[] = [
  { id: 1, name: '자유게시판' },
  { id: 2, name: '질문게시판' },
  { id: 4, name: '정보게시판' },
];

export default function ArticlesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArticles = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(null);

      if (selectedBoardId) {
        const response = await clientApiClient<ArticlesResponse>(
          `/v1/community/articles?boardId=${selectedBoardId}&page=${currentPage}&size=20`,
          { accessToken: session.accessToken, cache: 'no-store' }
        );
        setArticles(response.posts || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      } else {
        const [board1, board2, board4] = await Promise.all([
          clientApiClient<ArticlesResponse>(
            `/v1/community/articles?boardId=1&page=${currentPage}&size=20`,
            { accessToken: session.accessToken, cache: 'no-store' }
          ),
          clientApiClient<ArticlesResponse>(
            `/v1/community/articles?boardId=2&page=${currentPage}&size=20`,
            { accessToken: session.accessToken, cache: 'no-store' }
          ),
          clientApiClient<ArticlesResponse>(
            `/v1/community/articles?boardId=4&page=${currentPage}&size=20`,
            { accessToken: session.accessToken, cache: 'no-store' }
          ),
        ]);

        const allPosts = [
          ...(board1.posts || []),
          ...(board2.posts || []),
          ...(board4.posts || []),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setArticles(allPosts);
        setTotalPages(Math.max(
          board1.pagination?.totalPages || 1,
          board2.pagination?.totalPages || 1,
          board4.pagination?.totalPages || 1
        ));
        setTotalItems(
          (board1.pagination?.totalItems || 0) +
          (board2.pagination?.totalItems || 0) +
          (board4.pagination?.totalItems || 0)
        );
      }
    } catch (err: unknown) {
      console.error('Failed to fetch articles:', err);
      const errorMessage = err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다.';
      setError(errorMessage);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, currentPage, selectedBoardId]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchArticles();
    }
  }, [fetchArticles, session?.accessToken]);

  const handleDelete = async () => {
    if (!selectedArticle || !session?.accessToken) return;

    try {
      setDeleting(true);
      await deleteAdminArticle(selectedArticle.id, { accessToken: session.accessToken });
      toast.success('게시글이 삭제되었습니다.');
      setShowDeleteModal(false);
      setSelectedArticle(null);
      await fetchArticles();
    } catch (err: unknown) {
      console.error('Delete failed:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      toast.error(`게시글 삭제에 실패했습니다. ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stripHtml(article.content).toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBoardName = (boardId: number) => {
    const board = BOARDS.find(b => b.id === boardId);
    return board ? board.name : `게시판 ${boardId}`;
  };

  const getBoardBadgeColor = (boardId: number) => {
    switch (boardId) {
      case 1:
        return 'bg-blue-100 text-blue-700';
      case 2:
        return 'bg-green-100 text-green-700';
      case 4:
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-gray-400" />
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={fetchArticles}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">게시글 관리</h1>
          <p className="mt-0.5 text-sm text-gray-500">커뮤니티 게시글을 관리합니다</p>
        </div>

        {/* 통계 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">전체 게시글</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalItems}개</p>
            </div>
            <div className="flex gap-4">
              {BOARDS.map((board) => (
                <div key={board.id} className="text-center">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getBoardBadgeColor(board.id)}`}>
                    {board.name}
                  </span>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {articles.filter((a) => a.boardId === board.id).length}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <select
              value={selectedBoardId || ''}
              onChange={(e) => {
                setSelectedBoardId(e.target.value ? Number(e.target.value) : null);
                setCurrentPage(0);
              }}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            >
              <option value="">전체 게시판</option>
              {BOARDS.map(board => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="제목, 내용, 작성자로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 게시글 목록 */}
        {filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 게시글이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-100">
              {filteredArticles.map((article) => (
                <li
                  key={article.id}
                  className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                  onClick={() => router.push(`/admin/contents/articles/${article.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getBoardBadgeColor(article.boardId)}`}>
                        {getBoardName(article.boardId)}
                      </span>
                      <span className="truncate font-medium text-gray-900">{article.title}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>{article.author.name}</span>
                      <span>{formatDate(article.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {article.comments}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArticle(article);
                      setShowDeleteModal(true);
                    }}
                    className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>

          </div>
        )}

        {/* 페이지네이션 */}
        {filteredArticles.length > 0 && !searchQuery && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage + 1}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page - 1)}
            />
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-gray-900">게시글 삭제</h2>
              <div className="mb-6">
                <p className="font-semibold text-gray-900">{selectedArticle.title}</p>
                <p className="mt-2 text-sm text-gray-500">
                  작성자: {selectedArticle.author.name}
                </p>
                <p className="text-sm text-gray-500">
                  게시판: {getBoardName(selectedArticle.boardId)}
                </p>
                <p className="mt-4 text-sm text-gray-600">
                  이 게시글을 정말 삭제하시겠습니까?
                  <br />
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedArticle(null);
                  }}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      삭제 중...
                    </>
                  ) : (
                    '삭제'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
