import AppHeader from '@/common/components/Header/AppHeader';
import Footer from '@/common/components/Footer';

function TeamPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50`}>
      <AppHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default TeamPageLayout;
