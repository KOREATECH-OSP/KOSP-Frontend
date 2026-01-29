import { searchGlobal } from '@/lib/api/search';
import SearchPageClient from './SearchPageClient';
import { auth } from '@/lib/auth/server';

interface PageProps {
  searchParams: Promise<{ keyword?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { keyword } = await searchParams;
  const decodedKeyword = keyword ? decodeURIComponent(keyword) : '';
  const session = await auth();

  if (!decodedKeyword) {
    return <SearchPageClient keyword="" initialData={null} session={session} />;
  }

  let data = null;
  try {
    data = await searchGlobal(decodedKeyword);
  } catch (error) {
    console.error('Search failed:', error);
  }

  return <SearchPageClient keyword={decodedKeyword} initialData={data} session={session} />;
}
