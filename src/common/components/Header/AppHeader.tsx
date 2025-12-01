import Header from './index';
import { fetchSessionUser } from '@/lib/auth/session';

interface AppHeaderProps {
  simple?: boolean;
}

export default async function AppHeader({ simple = false }: AppHeaderProps) {
  const user = await fetchSessionUser();
  return <Header simple={simple} user={user} />;
}
