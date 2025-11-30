import Header from '@/common/components/Header';
import { suitFont } from '../../style/font'
import Footer from '@/common/components/Footer';

function TeamPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${suitFont.className}`}>
      <Header/>
      <main className="flex flex-1 justify-center">{children}</main>
      <Footer />
    </div>
  );
}

export default TeamPageLayout;
