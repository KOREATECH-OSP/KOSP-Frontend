import AppHeader from '@/common/components/Header/AppHeader';
import { suitFont } from '../../style/font'

function ResetPasswordPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppHeader simple />
        <main className={`${suitFont.className}`}>{children}</main>
      </body>
    </html>
  );
}

export default ResetPasswordPageLayout;
