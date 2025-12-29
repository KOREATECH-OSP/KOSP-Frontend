import AppHeader from '@/common/components/Header/AppHeader';
import { suitFont } from '../../style/font'
import Footer from '@/common/components/Footer';

function TeamPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${suitFont.className}`}>
      <AppHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default TeamPageLayout;
