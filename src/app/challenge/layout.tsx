import Header from '@/src/common/components/Header';
import { suitFont } from '../../style/font'

function ChallengePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main className={`${suitFont.className}`}>{children}</main>
      </body>
    </html>
  );
}

export default ChallengePageLayout;
