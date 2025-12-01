import AppHeader from '@/common/components/Header/AppHeader';
import { suitFont } from '../../style/font'

function ForgotPasswordPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`bg-gray-50 ${suitFont.className}`}>
      <AppHeader simple />
      <main className={`flex h-[calc(100vh-56px)]`}>{children}</main>
    </div>
  );
}

export default ForgotPasswordPageLayout;
