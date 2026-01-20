import AppHeader from '@/common/components/Header/AppHeader';
import Footer from '@/common/components/Footer';

function NotificationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50`}>
      <AppHeader />
      <main className="flex flex-1 justify-center">{children}</main>
      <Footer />
    </div>
  );
}

export default NotificationLayout;
