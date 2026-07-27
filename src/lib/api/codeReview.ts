import { clientApiClient } from './client';
import type { CodeReviewListResponse, CodeReviewResponse } from './types';

const BASE = '/v1/code-reviews';

interface AuthOptions {
  accessToken: string;
}

export async function getCodeReviews(
  repoOwner: string,
  repositoryName: string,
  auth?: AuthOptions,
): Promise<CodeReviewListResponse> {
  const url = `${BASE}?repoOwner=${encodeURIComponent(repoOwner)}&repositoryName=${encodeURIComponent(repositoryName)}`;
  if (auth?.accessToken) {
    return clientApiClient<CodeReviewListResponse>(url, { accessToken: auth.accessToken });
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch code reviews');
  return res.json();
}

export async function createCodeReview(
  data: { repoOwner: string; repositoryName: string; content: string; parentId?: number },
  auth: AuthOptions,
): Promise<CodeReviewResponse> {
  return clientApiClient<CodeReviewResponse>(BASE, {
    method: 'POST',
    body: { ...data, parentId: data.parentId ?? null },
    accessToken: auth.accessToken,
  });
}

export async function deleteCodeReview(reviewId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`${BASE}/${reviewId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

export async function toggleCodeReviewLike(reviewId: number, auth: AuthOptions): Promise<boolean> {
  return clientApiClient<boolean>(`${BASE}/${reviewId}/like`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}
