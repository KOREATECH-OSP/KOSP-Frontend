import Header from '@/src/common/components/header';
import { suitFont } from '../../style/font'

function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-gray-50 ${suitFont.className}`}>
      <Header simple/>
      <main className={`py-18`}>{children}</main>
    </div>
  );
}

export default LoginLayout;
