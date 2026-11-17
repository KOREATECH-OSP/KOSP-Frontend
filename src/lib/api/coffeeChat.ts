import { clientApiClient } from './client';
import type { CoffeeChatRoomResponse, CoffeeChatMessageResponse, CoffeeChatUnreadCountResponse } from './types';

interface AuthOptions {
  accessToken: string;
}

export async function getMyChatRooms(auth: AuthOptions): Promise<CoffeeChatRoomResponse[]> {
  return clientApiClient<CoffeeChatRoomResponse[]>('/v1/coffee-chat/rooms', {
    accessToken: auth.accessToken,
  });
}

export async function createOrGetRoom(partnerId: number, auth: AuthOptions): Promise<CoffeeChatRoomResponse> {
  return clientApiClient<CoffeeChatRoomResponse>('/v1/coffee-chat/rooms', {
    method: 'POST',
    body: { partnerId },
    accessToken: auth.accessToken,
  });
}

export async function getChatMessages(roomId: number, auth: AuthOptions): Promise<CoffeeChatMessageResponse[]> {
  return clientApiClient<CoffeeChatMessageResponse[]>(`/v1/coffee-chat/rooms/${roomId}/messages`, {
    accessToken: auth.accessToken,
  });
}

export async function sendChatMessage(roomId: number, content: string, auth: AuthOptions): Promise<CoffeeChatMessageResponse> {
  return clientApiClient<CoffeeChatMessageResponse>(`/v1/coffee-chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: { content },
    accessToken: auth.accessToken,
  });
}

export async function markRoomAsRead(roomId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/coffee-chat/rooms/${roomId}/read`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

export async function getChatUnreadCount(auth: AuthOptions): Promise<number> {
  const res = await clientApiClient<CoffeeChatUnreadCountResponse>('/v1/coffee-chat/unread-count', {
    accessToken: auth.accessToken,
  });
  return res.count;
}

export async function deleteRoom(roomId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/coffee-chat/rooms/${roomId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

export async function togglePinRoom(roomId: number, auth: AuthOptions): Promise<CoffeeChatRoomResponse> {
  return clientApiClient<CoffeeChatRoomResponse>(`/v1/coffee-chat/rooms/${roomId}/pin`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}
