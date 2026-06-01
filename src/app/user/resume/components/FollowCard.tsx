'use client';

import { User } from 'lucide-react';

const MOCK_FOLLOW_USERS = [
  { id: 1, name: '강준형', username: 'Kevin1234' },
  { id: 2, name: '이지은', username: 'jieun_dev' },
  { id: 3, name: '박민수', username: 'minsoo_p' },
  { id: 4, name: '김태현', username: 'taehyun_k' },
];

function FollowUserItem({ name, username }: { name: string; username: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-800">{name}</p>
          <p className="text-[10px] text-gray-400">@{username}</p>
        </div>
      </div>
      <button
        type="button"
        className="rounded-md border border-orange-400 px-2.5 py-1 text-[10px] font-medium text-orange-500 hover:bg-orange-50 transition-colors"
      >
        팔로우
      </button>
    </div>
  );
}

export default function FollowCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">팔로우</h3>
        <div className="flex gap-3 text-[11px] text-gray-400">
          <span><span className="font-semibold text-gray-700">12</span> 팔로잉</span>
          <span><span className="font-semibold text-gray-700">8</span> 팔로워</span>
        </div>
      </div>
      <ul className="space-y-3">
        {MOCK_FOLLOW_USERS.map((user) => (
          <li key={user.id}>
            <FollowUserItem name={user.name} username={user.username} />
          </li>
        ))}
      </ul>
    </div>
  );
}
