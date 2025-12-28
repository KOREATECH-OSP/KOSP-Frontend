import { auth } from '@/auth';
import Header from './index';

interface AppHeaderProps {
  simple?: boolean;
}

export default async function AppHeader({ simple = false }: AppHeaderProps) {
  const session = await auth();
  return <Header simple={simple} session={session} />;
}
