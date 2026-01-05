import { searchGlobal } from '@/lib/api/search';
import SearchPageClient from './SearchPageClient';

interface PageProps {
  searchParams: Promise<{ keyword?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { keyword } = await searchParams;
  const decodedKeyword = keyword ? decodeURIComponent(keyword) : '';

  if (!decodedKeyword) {
    return <SearchPageClient keyword="" initialData={null} />;
  }

  let data = null;
  try {
    data = await searchGlobal(decodedKeyword);
  } catch (error) {
    console.error('Search failed:', error);
  }

  return <SearchPageClient keyword={decodedKeyword} initialData={data} />;
}
