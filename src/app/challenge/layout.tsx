import AppHeader from '@/common/components/Header/AppHeader';

function ChallengePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}

export default ChallengePageLayout;
