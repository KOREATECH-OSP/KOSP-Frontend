import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import ResumePageClient from './ResumePageClient';

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=/user/resume');
  }
  return <ResumePageClient session={session} />;
}
