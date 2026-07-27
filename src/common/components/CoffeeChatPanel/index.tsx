'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Pencil, User as UserIcon, ChevronLeft, Smile, Paperclip, MoreVertical, Pin, Trash2, Search } from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import {
  getMyChatRooms,
  createOrGetRoom,
  getChatMessages,
  sendChatMessage,
  markRoomAsRead,
  deleteRoom,
  togglePinRoom,
} from '@/lib/api/coffeeChat';
import { getFollowingClient } from '@/lib/api/follow';
import type { CoffeeChatRoomResponse, CoffeeChatMessageResponse, FollowUserResponse } from '@/lib/api/types';
import koriChatDefault from '@/assets/images/kori-chat/kori-chat-default.png';
import koriChatActive from '@/assets/images/kori-chat/kori-chat-active.png';

function ProfileAvatar({ src, name, size = 44 }: { src: string | null; name: string; size?: number }) {
  return src ? (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="flex items-center justify-center rounded-full bg-gray-200 flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <UserIcon style={{ width: size * 0.45, height: size * 0.45 }} className="text-gray-400" />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function CoffeeChatPanel() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? null;
  const myId = session?.user?.id ? Number(session.user.id) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<CoffeeChatRoomResponse[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<CoffeeChatRoomResponse | null>(null);
  const [messages, setMessages] = useState<CoffeeChatMessageResponse[]>([]);
  const [input, setInput] = useState('');
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [sending, setSending] = useState(false);
  const [menuRoomId, setMenuRoomId] = useState<number | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [followingList, setFollowingList] = useState<FollowUserResponse[]>([]);
  const [composeSearch, setComposeSearch] = useState('');
  const [composeLoading, setComposeLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadRooms = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await getMyChatRooms({ accessToken });
      setRooms(data);
      const total = data.reduce((sum, r) => sum + r.unreadCount, 0);
      setUnreadTotal(total);
    } catch {
      // ignore
    }
  }, [accessToken]);

  const loadMessages = useCallback(async (room: CoffeeChatRoomResponse) => {
    if (!accessToken) return;
    try {
      const data = await getChatMessages(room.roomId, { accessToken });
      setMessages(data);
      if (room.unreadCount > 0) {
        await markRoomAsRead(room.roomId, { accessToken });
        setRooms(prev => prev.map(r => r.roomId === room.roomId ? { ...r, unreadCount: 0 } : r));
        setUnreadTotal(prev => Math.max(0, prev - room.unreadCount));
      }
    } catch {
      // ignore
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    loadRooms();
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, [accessToken, loadRooms]);

  useEffect(() => {
    if (!selectedRoom || !accessToken) return;
    loadMessages(selectedRoom);
    const interval = setInterval(() => loadMessages(selectedRoom), 3000);
    return () => clearInterval(interval);
  }, [selectedRoom, accessToken, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuRoomId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 프로필 "메시지" 버튼 이벤트
  useEffect(() => {
    const handler = async (e: Event) => {
      const { partnerId } = (e as CustomEvent).detail;
      if (!accessToken) return;
      setIsOpen(true);
      try {
        const room = await createOrGetRoom(partnerId, { accessToken });
        setSelectedRoom(room);
        setRooms(prev => {
          const exists = prev.find(r => r.roomId === room.roomId);
          return exists ? prev.map(r => r.roomId === room.roomId ? room : r) : [room, ...prev];
        });
      } catch {
        // ignore
      }
    };
    window.addEventListener('coffeeChat:openRoom', handler);
    return () => window.removeEventListener('coffeeChat:openRoom', handler);
  }, [accessToken]);

  const handleSend = async () => {
    if (!selectedRoom || !input.trim() || !accessToken || sending) return;
    setSending(true);
    const content = input.trim();
    setInput('');
    try {
      const msg = await sendChatMessage(selectedRoom.roomId, content, { accessToken });
      setMessages(prev => [...prev, msg]);
      setRooms(prev => prev.map(r =>
        r.roomId === selectedRoom.roomId
          ? { ...r, lastMessage: content, lastMessageAt: new Date().toISOString() }
          : r
      ));
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!accessToken) return;
    setMenuRoomId(null);
    try {
      await deleteRoom(roomId, { accessToken });
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
      if (selectedRoom?.roomId === roomId) setSelectedRoom(null);
    } catch {
      // ignore
    }
  };

  const handleTogglePin = async (roomId: number) => {
    if (!accessToken) return;
    setMenuRoomId(null);
    try {
      const updated = await togglePinRoom(roomId, { accessToken });
      setRooms(prev => {
        const newRooms = prev.map(r => r.roomId === roomId ? updated : r);
        return [...newRooms].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
      });
    } catch {
      // ignore
    }
  };

  const openCompose = async () => {
    if (!myId) return;
    setShowCompose(true);
    setComposeSearch('');
    setComposeLoading(true);
    try {
      const list = await getFollowingClient(myId);
      setFollowingList(list);
    } catch {
      setFollowingList([]);
    } finally {
      setComposeLoading(false);
    }
  };

  const openRoomWithUser = async (userId: number) => {
    if (!accessToken) return;
    setShowCompose(false);
    try {
      const room = await createOrGetRoom(userId, { accessToken });
      setSelectedRoom(room);
      setRooms(prev => {
        const exists = prev.find(r => r.roomId === room.roomId);
        return exists ? prev.map(r => r.roomId === room.roomId ? room : r) : [room, ...prev];
      });
    } catch {
      // ignore
    }
  };

  if (!accessToken) return null;

  return (
    <>
      {/* 플로팅 고양이 말풍선 아이콘 */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-8 right-10 z-40 drop-shadow-lg hover:drop-shadow-xl transition-all hover:scale-105"
        aria-label="커피챗 열기"
      >
        <div className="relative">
          <Image
            src={unreadTotal > 0 ? koriChatActive : koriChatDefault}
            alt="커피챗"
            width={56}
            height={56}
            className="object-contain"
          />
          {unreadTotal > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadTotal > 99 ? '99+' : unreadTotal}
            </span>
          )}
        </div>
      </button>

      {/* 메시지 패널 */}
      {isOpen && (
        <div className="fixed bottom-[88px] right-10 z-50 w-[380px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {showCompose ? (
            /* 팔로잉 목록 - 새 메시지 작성 뷰 */
            <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              <div className="flex items-center gap-3 px-4 py-4">
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="flex-1 text-base font-bold text-gray-900">새 메시지</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={composeSearch}
                    onChange={e => setComposeSearch(e.target.value)}
                    placeholder="이름으로 검색"
                    className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="overflow-y-auto flex-1 min-h-[200px] max-h-[400px]">
                {composeLoading ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-400">불러오는 중...</div>
                ) : followingList.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-400">팔로잉 중인 사용자가 없습니다</div>
                ) : (
                  followingList
                    .filter(u => u.name.includes(composeSearch))
                    .map(user => (
                      <button
                        key={user.userId}
                        onClick={() => openRoomWithUser(user.userId)}
                        className="flex w-full items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <ProfileAvatar src={user.profileImage} name={user.name} size={44} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                          {user.introduction && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{user.introduction}</p>
                          )}
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>
          ) : selectedRoom ? (
            /* 채팅방 뷰 */
            <div className="flex h-[520px] flex-col">
              {/* 헤더 */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <button
                  onClick={() => { setSelectedRoom(null); setMessages([]); }}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <ProfileAvatar src={selectedRoom.partnerProfileImage} name={selectedRoom.partnerName} size={32} />
                <span className="flex-1 font-semibold text-gray-900 text-sm">{selectedRoom.partnerName}님</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                  /* 빈 상태 - 프로필 카드 */
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
                    <ProfileAvatar src={selectedRoom.partnerProfileImage} name={selectedRoom.partnerName} size={80} />
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{selectedRoom.partnerName}님</p>
                      {selectedRoom.partnerGithubLogin && (
                        <p className="text-sm text-gray-500 mt-0.5">{selectedRoom.partnerGithubLogin}</p>
                      )}
                    </div>
                    <Link
                      href={`/user/${selectedRoom.partnerId}`}
                      className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                    >
                      프로필 보기
                    </Link>
                    <p className="mt-4 text-sm text-gray-400">대화를 시작해보세요!</p>
                  </div>
                ) : (
                  /* 메시지 목록 */
                  <div className="space-y-2">
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === myId;
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
                      return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <div className="w-7 flex-shrink-0">
                              {showAvatar && (
                                <ProfileAvatar src={selectedRoom.partnerProfileImage} name={selectedRoom.partnerName} size={28} />
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[65%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                              isMe
                                ? 'bg-gray-900 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* 입력창 */}
              <div className="border-t border-gray-100 px-3 py-3">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="메시지를 입력하세요."
                    className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                  />
                  <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                    <Smile className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 채팅 목록 뷰 */
            <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-bold text-gray-900">메시지</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="h-px bg-gray-100" />

              {/* 채팅방 목록 */}
              <div className="overflow-y-auto flex-1 min-h-[300px] max-h-[450px] relative">
                {rooms.length === 0 ? (
                  <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                    아직 메시지가 없습니다
                  </div>
                ) : (
                  rooms.map(room => (
                    <div
                      key={room.roomId}
                      className="group relative flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRoom(room)}
                    >
                      {/* 고정 핀 표시 */}
                      {room.isPinned && (
                        <Pin className="absolute top-2 right-5 h-3 w-3 text-orange-400 rotate-45" />
                      )}

                      <ProfileAvatar src={room.partnerProfileImage} name={room.partnerName} size={52} />

                      <div className="flex-1 min-w-0 pr-6">
                        <p className="font-semibold text-sm text-gray-900 truncate">{room.partnerName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-xs text-gray-400 truncate">
                            {room.lastMessage ?? '대화를 시작해보세요'}
                          </p>
                          {room.lastMessageAt && (
                            <>
                              <span className="text-xs text-gray-300 flex-shrink-0">·</span>
                              <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(room.lastMessageAt)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 더보기 버튼 (hover 시) */}
                      <button
                        onClick={e => { e.stopPropagation(); setMenuRoomId(prev => prev === room.roomId ? null : room.roomId); }}
                        className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>

                      {/* 드롭다운 메뉴 */}
                      {menuRoomId === room.roomId && (
                        <div
                          ref={menuRef}
                          className="absolute right-10 top-8 z-10 w-32 overflow-hidden rounded-lg bg-white shadow-lg border border-gray-100"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleTogglePin(room.roomId)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Pin className="h-3.5 w-3.5" />
                            {room.isPinned ? '고정 해제' : '고정하기'}
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.roomId)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            삭제하기
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 새 메시지 작성 버튼 */}
              <div className="relative pb-4 pt-2 flex justify-end px-4">
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                  onClick={openCompose}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
