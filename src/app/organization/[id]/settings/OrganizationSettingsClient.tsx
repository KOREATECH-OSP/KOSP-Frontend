'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { ArrowLeft, Crown, Shield, Search, X, Plus } from 'lucide-react';
import type {
  OrganizationDetailResponse,
  OrganizationMemberResponse,
} from '@/lib/api/organization';
import { updateOrganization, addOrganizationMember } from '@/lib/api/organization';

type Section = 'profile' | 'members' | 'repositories' | 'board';

interface OrganizationSettingsClientProps {
  detail: OrganizationDetailResponse;
  members: OrganizationMemberResponse[];
  accessToken: string;
  currentUserId: number;
  initialSection: Section;
}

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'profile', label: '기본 프로필' },
  { key: 'members', label: '조직 멤버' },
  { key: 'repositories', label: '공유된 레포지토리' },
  { key: 'board', label: '게시판' },
];

function MemberRoleBadge({ role }: { role: OrganizationMemberResponse['role'] }) {
  if (role === 'OWNER') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">
        <Crown className="h-2.5 w-2.5" />
        OWNER
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 border border-purple-200">
        <Shield className="h-2.5 w-2.5" />
        OWNER
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200">
      OWNER
    </span>
  );
}

export default function OrganizationSettingsClient({
  detail,
  members: initialMembers,
  accessToken,
  currentUserId,
  initialSection,
}: OrganizationSettingsClientProps) {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [members, setMembers] = useState(initialMembers);

  // 기본 프로필 폼 상태
  const [displayName, setDisplayName] = useState(detail.displayName);
  const [description, setDescription] = useState(detail.description ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(
    detail.tags ? detail.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 멤버 추가 상태
  const [memberSearch, setMemberSearch] = useState('');
  const [pendingUsernames, setPendingUsernames] = useState<string[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);

  const currentMember = members.find((m) => m.userId === currentUserId);
  const isOwner = currentMember?.role === 'OWNER';

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags((prev) => [...prev, val]);
        setTagInput('');
      }
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleProfileSave() {
    setProfileLoading(true);
    try {
      await updateOrganization(
        detail.id,
        { displayName, description, tags: tags.join(',') },
        accessToken
      );
      alert('저장되었습니다.');
    } catch {
      alert('저장에 실패했습니다.');
    } finally {
      setProfileLoading(false);
    }
  }

  function handleAddPendingUsername() {
    const val = memberSearch.trim();
    if (val && !pendingUsernames.includes(val)) {
      setPendingUsernames((prev) => [...prev, val]);
      setMemberSearch('');
    }
  }

  function removePendingUsername(username: string) {
    setPendingUsernames((prev) => prev.filter((u) => u !== username));
  }

  async function handleMemberAdd() {
    if (pendingUsernames.length === 0) return;
    setMemberLoading(true);
    const errors: string[] = [];
    const added: OrganizationMemberResponse[] = [];
    for (const username of pendingUsernames) {
      try {
        const newMember = await addOrganizationMember(detail.id, { githubUsername: username }, accessToken);
        added.push(newMember);
      } catch {
        errors.push(username);
      }
    }
    setMembers((prev) => [...prev, ...added]);
    setPendingUsernames([]);
    setMemberLoading(false);
    if (errors.length > 0) {
      alert(`추가 실패한 사용자: ${errors.join(', ')}`);
    } else {
      alert('멤버가 추가되었습니다.');
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        {/* 좌측 사이드바 */}
        <aside className="w-56 flex-shrink-0">
          <div className="mb-4">
            <Link
              href={`/organization/${detail.id}`}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              돌아가기
            </Link>
            <h2 className="text-xl font-bold text-gray-900">설정하기</h2>
          </div>

          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={[
                  'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                  activeSection === s.key
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                ].join(' ')}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 우측 메인 */}
        <div className="flex-1 min-w-0">

          {/* 기본 프로필 */}
          {activeSection === 'profile' && (
            <div>
              <h1 className="mb-1 text-xl font-bold text-gray-900">기본 프로필</h1>
              <p className="mb-6 text-sm text-gray-500">
                GitHub에서 Owner 권한을 가진 Organization을 K-OSP에 등록할 수 있습니다.
              </p>

              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
                {/* 조직 이름 */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">조직 이름</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="내용을 입력해주세요"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  />
                </div>

                {/* 조직 설명 */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">조직 설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="내용을 입력해주세요"
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 resize-none"
                  />
                </div>

                {/* 태그 추가하기 */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">태그 추가하기</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="내용을 입력해주세요"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                        {isOwner && (
                          <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-700">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    <span className="ml-auto text-xs text-gray-400">Enter로 태그 추가(최대 5개)</span>
                  </div>
                </div>

                {/* 조직 이미지 */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">조직 이미지 (선택)</label>
                  <div
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-10 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) setImageFile(file);
                    }}
                  >
                    {imageFile ? (
                      <p className="text-sm text-gray-600">{imageFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-400">첨부할 파일을 여기에 끌어 놓거나,</p>
                        <p className="text-sm text-gray-400">파일 선택 버튼을 직접 선택해주세요.</p>
                      </>
                    )}
                    <button
                      type="button"
                      className="mt-4 rounded-lg bg-gray-700 px-5 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      파일선택
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setDisplayName(detail.displayName);
                      setDescription(detail.description ?? '');
                      setTags(detail.tags ? detail.tags.split(',').map((t) => t.trim()).filter(Boolean) : []);
                      setImageFile(null);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    취소하기
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={profileLoading || !isOwner}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {profileLoading ? '저장 중...' : '업로드하기'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 조직 멤버 */}
          {activeSection === 'members' && (
            <div>
              <h1 className="mb-1 text-xl font-bold text-gray-900">조직 멤버</h1>
              <p className="mb-6 text-sm text-gray-500">{detail.displayName}</p>

              {/* 멤버 목록 */}
              <div className="rounded-xl border border-gray-200 bg-white mb-4">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">조직 멤버 목록</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                        <Image
                          src={`https://github.com/${member.githubUsername}.png`}
                          alt={member.githubUsername}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">
                            {member.githubUsername}
                          </span>
                          <MemberRoleBadge role={member.role} />
                        </div>
                        <p className="text-xs text-gray-400">({member.role === 'OWNER' ? 'OWNER' : member.role === 'ADMIN' ? 'ADMIN' : '멤버'})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 멤버 추가하기 */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-gray-700">조직 멤버 추가하기</p>
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPendingUsername();
                      }
                    }}
                    placeholder="내용을 입력해주세요"
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  />
                  <button
                    onClick={handleAddPendingUsername}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {/* 추가 예정 사용자 태그 */}
                {pendingUsernames.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {pendingUsernames.map((username) => (
                      <span
                        key={username}
                        className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600"
                      >
                        {username}
                        <button onClick={() => removePendingUsername(username)} className="text-gray-400 hover:text-gray-700">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => { setMemberSearch(''); setPendingUsernames([]); }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    취소하기
                  </button>
                  <button
                    onClick={handleMemberAdd}
                    disabled={memberLoading || pendingUsernames.length === 0}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {memberLoading ? '추가 중...' : '업로드하기'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 공유된 레포지토리 - 미구성 */}
          {activeSection === 'repositories' && (
            <div>
              <h1 className="mb-6 text-xl font-bold text-gray-900">공유된 레포지토리</h1>
              <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
                <p className="text-sm text-gray-400">준비 중입니다.</p>
              </div>
            </div>
          )}

          {/* 게시판 - 미구성 */}
          {activeSection === 'board' && (
            <div>
              <h1 className="mb-6 text-xl font-bold text-gray-900">게시판</h1>
              <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
                <p className="text-sm text-gray-400">준비 중입니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
