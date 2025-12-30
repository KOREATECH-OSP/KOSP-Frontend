import { getBoards } from '@/lib/api';
import WritePageClient from './WritePageClient';

export default async function WritePage() {
  const boardsResponse = await getBoards();
  // 모집 공고용이 아닌 게시판만 필터링
  const boards = boardsResponse.boards.filter((board) => !board.isRecruitAllowed);

  return <WritePageClient boards={boards} />;
}
