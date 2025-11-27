import Header from '@/src/common/components/header';
import NoticeBanner from '@/src/common/components/noticeBanner';
import { suitFont } from '../../style/font'

function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-gray-50 ${suitFont.className}`}>
      <NoticeBanner />
      <Header />
      <main>{children}</main>
    </div>
  );
}

export default LoginLayout;
