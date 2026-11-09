import AppHeader from '@/common/components/Header/AppHeader';
import Footer from '@/common/components/Footer';

export default function NoticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
