import Header from '@/src/common/components/header';
import { suitFont } from '../../style/font'

function ResetPasswordPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header simple />
        <main className={`${suitFont.className}`}>{children}</main>
      </body>
    </html>
  );
}

export default ResetPasswordPageLayout;
