import Header from '@/common/components/Header';
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
