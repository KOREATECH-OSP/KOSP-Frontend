import NoticePageClient, { type NoticeTab } from './NoticePageClient';

export const metadata = {
  title: '공지사항 · FAQ | K-OSP',
  description: 'K-OSP 공지사항과 자주 묻는 질문을 확인하세요.',
};

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function NoticePage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const initialTab: NoticeTab = tab === 'faq' ? 'faq' : 'notice';
  return <NoticePageClient initialTab={initialTab} />;
}
