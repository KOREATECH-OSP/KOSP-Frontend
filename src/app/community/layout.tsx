import AppHeader from '@/common/components/Header/AppHeader';
import { suitFont } from '../../style/font'
import Footer from '@/common/components/Footer';

function CommunityPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${suitFont.className}`}>
      <AppHeader />
      <main className="flex flex-1 justify-center">{children}</main>
      <Footer />
    </div>
  );
}

export default CommunityPageLayout;
