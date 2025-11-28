import Header from '@/src/common/components/Header';
import { suitFont } from '../../style/font'

function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`bg-gray-50 ${suitFont.className}`}>
      <Header simple/>
      <main className={`flex h-[calc(100vh-56px)]`}>{children}</main>
    </div>
  );
}

export default LoginLayout;
