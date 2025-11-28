import Header from '@/common/components/Header';
import { suitFont } from '../../style/font'

function CommunityPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main className={`${suitFont.className}`}>{children}</main>
      </body>
    </html>
  );
}

export default CommunityPageLayout;
