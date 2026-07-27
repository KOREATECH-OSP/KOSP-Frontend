'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, Pencil, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  getMyChatRooms,
  getChatMessages,
  sendChatMessage,
  markRoomAsRead,
} from '@/lib/api/coffeeChat';
import type { CoffeeChatRoomResponse, CoffeeChatMessageResponse } from '@/lib/api/types';

export default function CoffeeChatPanel() {
  const { session } = useAuth();
  const accessToken = session?.accessToken ?? null;
  const myId = session?.user?.id ? Number(session.user.id) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<CoffeeChatRoomResponse[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<CoffeeChatRoomResponse | null>(null);
  const [messages, setMessages] = useState<CoffeeChatMessageResponse[]>([]);
  const [input, setInput] = useState('');
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // 글로벌 이벤트: 프로필에서 "메시지" 버튼 클릭 시 해당 room으로 이동
  useEffect(() => {
    const handler = async (e: Event) => {
      const { partnerId } = (e as CustomEvent).detail;
      if (!accessToken) return;
      setIsOpen(true);
      try {
        const { clientApiClient } = await import('@/lib/api/client');
        const room = await clientApiClient<CoffeeChatRoomResponse>('/v1/coffee-chat/rooms', {
          method: 'POST',
          body: JSON.stringify({ partnerId }),
          accessToken,
        });
        setSelectedRoom(room);
        setRooms(prev => {
          const exists = prev.find(r => r.roomId === room.roomId);
          return exists ? prev : [room, ...prev];
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

  if (!accessToken) return null;

  return (
    <>
      {/* 플로팅 고양이 아이콘 */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
        aria-label="커피챗 열기"
      >
        {/* 고양이 아이콘 SVG */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="16" cy="18" rx="10" ry="9" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1"/>
          {/* 귀 */}
          <polygon points="8,11 6,5 12,9" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1"/>
          <polygon points="24,11 26,5 20,9" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1"/>
          {/* 얼굴 */}
          <ellipse cx="16" cy="17" rx="8" ry="7" fill="white"/>
          {/* 눈 */}
          <ellipse cx="13" cy="15" rx="1.2" ry="1.2" fill="#333"/>
          <ellipse cx="19" cy="15" rx="1.2" ry="1.2" fill="#333"/>
          {/* 코 */}
          <ellipse cx="16" cy="18" rx="0.8" ry="0.6" fill="#FFB6C1"/>
          {/* 수염 */}
          <line x1="8" y1="17" x2="13" y2="18" stroke="#999" strokeWidth="0.8"/>
          <line x1="8" y1="19" x2="13" y2="19" stroke="#999" strokeWidth="0.8"/>
          <line x1="19" y1="18" x2="24" y2="17" stroke="#999" strokeWidth="0.8"/>
          <line x1="19" y1="19" x2="24" y2="19" stroke="#999" strokeWidth="0.8"/>
        </svg>
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </span>
        )}
      </button>

      {/* 메시지 패널 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100">
          {selectedRoom ? (
            /* 채팅방 뷰 */
            <>
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  ←
                </button>
                <div className="flex flex-1 items-center gap-2">
                  {selectedRoom.partnerProfileImage ? (
                    <Image
                      src={selectedRoom.partnerProfileImage}
                      alt={selectedRoom.partnerName}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <span className="font-semibold text-gray-900 text-sm">{selectedRoom.partnerName}</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === myId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                        msg.senderId === myId
                          ? 'bg-orange-400 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-100 px-3 py-2 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="메시지 입력..."
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="rounded-full bg-orange-400 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-50"
                >
                  전송
                </button>
              </div>
            </>
          ) : (
            /* 채팅 목록 뷰 */
            <>
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                <h2 className="text-base font-bold text-gray-900">메시지</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {rooms.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    아직 메시지가 없습니다
                  </div>
                ) : (
                  rooms.map(room => (
                    <button
                      key={room.roomId}
                      onClick={() => setSelectedRoom(room)}
                      className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0">
                        {room.partnerProfileImage ? (
                          <Image
                            src={room.partnerProfileImage}
                            alt={room.partnerName}
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        {room.unreadCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-900 truncate">{room.partnerName}</span>
                          <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                            {room.lastMessageAt ? formatDate(room.lastMessageAt) : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${room.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                          {room.lastMessage ?? '대화를 시작해보세요'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* 새 메시지 작성 버튼 */}
              <div className="relative h-0">
                <button
                  className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white shadow-md hover:bg-gray-700"
                  onClick={() => {
                    // TODO: 새 메시지 작성 UI (추후 구현)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
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
