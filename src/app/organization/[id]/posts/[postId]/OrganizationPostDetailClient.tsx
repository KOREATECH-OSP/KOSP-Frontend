'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Paperclip, Trash2, Send, User } from 'lucide-react';
import {
  deleteOrganizationPost,
  createOrganizationPostComment,
  deleteOrganizationPostComment,
  type OrganizationPostDetail,
  type OrganizationPostComment,
} from '@/lib/api/organizationPost';

interface Props {
  orgId: number;
  orgName: string;
  post: OrganizationPostDetail;
  initialComments: OrganizationPostComment[];
  currentUserId: number | null;
  isMember: boolean;
  isAdminOrOwner: boolean;
  accessToken: string;
}

function formatDate(str: string) {
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function AuthorAvatar({ author }: { author: { name: string; profileImage: string | null } }) {
  if (author.profileImage) {
    return (
      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
        <Image src={author.profileImage} alt={author.name} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <User className="h-4 w-4" />
    </div>
  );
}

export default function OrganizationPostDetailClient({
  orgId,
  orgName,
  post,
  initialComments,
  currentUserId,
  isMember,
  isAdminOrOwner,
  accessToken,
}: Props) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  const isPostAuthor = currentUserId !== null && post.author.id === currentUserId;
  const canDeletePost = isPostAuthor || isAdminOrOwner;

  async function handleDeletePost() {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      await deleteOrganizationPost(orgId, post.id, accessToken);
      router.push(`/organization/${orgId}`);
      router.refresh();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const newComment = await createOrganizationPostComment(
        orgId, post.id, { content: commentText.trim() }, accessToken
      );
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch {
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    setDeletingCommentId(commentId);
    try {
      await deleteOrganizationPostComment(orgId, post.id, commentId, accessToken);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert('댓글 삭제에 실패했습니다.');
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* 뒤로가기 */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/organization/${orgId}`}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {orgName}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700">게시판</span>
      </div>

      {/* 게시글 본문 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-4">
        {/* 헤더 */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {post.category === 'NOTICE' && (
                  <span className="rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                    공지
                  </span>
                )}
                {post.visibility === 'MEMBERS_ONLY' && (
                  <span className="rounded-md bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                    멤버 공개
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
              {post.description && (
                <p className="mt-1 text-sm text-gray-500">{post.description}</p>
              )}
            </div>
            {canDeletePost && (
              <button
                onClick={handleDeletePost}
                className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                title="게시글 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <AuthorAvatar author={post.author} />
            <div className="text-sm">
              <span className="font-medium text-gray-700">{post.author.name}</span>
              <span className="ml-2 text-gray-400">{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* 첨부파일 */}
        {post.files.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-medium text-gray-500 flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              첨부파일 ({post.files.length})
            </p>
            <ul className="space-y-1">
              {post.files.map((file) => (
                <li key={file.fileUrl}>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {file.fileName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 댓글 */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">댓글 {comments.length}</p>
        </div>

        {comments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => {
              const isCommentAuthor = currentUserId !== null && comment.author.id === currentUserId;
              const canDeleteComment = isCommentAuthor || isAdminOrOwner;
              return (
                <div key={comment.id} className="flex items-start gap-3 px-5 py-4">
                  <AuthorAvatar author={comment.author} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">{comment.author.name}</span>
                        <span className="text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      {canDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className="shrink-0 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-gray-400">
            첫 번째 댓글을 남겨보세요.
          </div>
        )}

        {/* 댓글 입력 (멤버만) */}
        {isMember ? (
          <form onSubmit={handleCommentSubmit} className="border-t border-gray-100 px-5 py-4">
            <div className="flex items-end gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력해주세요"
                rows={2}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 resize-none"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !commentText.trim()}
                className="shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-gray-100 px-5 py-3 text-center text-xs text-gray-400">
            댓글은 조직 멤버만 작성할 수 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
