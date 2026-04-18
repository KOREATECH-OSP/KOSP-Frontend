import { clientApiClient } from './client';
import type { TermsResponse } from './types';

export async function getActiveTerms(): Promise<TermsResponse> {
  return clientApiClient<TermsResponse>('/v1/terms');
}
