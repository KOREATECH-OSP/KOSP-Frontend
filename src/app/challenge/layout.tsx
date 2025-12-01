import AppHeader from '@/common/components/Header/AppHeader';
import { suitFont } from '../../style/font'

function ChallengePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppHeader />
        <main className={`${suitFont.className}`}>{children}</main>
      </body>
    </html>
  );
}

export default ChallengePageLayout;
