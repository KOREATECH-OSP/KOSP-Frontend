import { auth } from '@/auth';
import UserEditClient from './UserEditClient';

export default async function ProfileEditPage() {
  const session = await auth();
  return <UserEditClient session={session} />;
}
