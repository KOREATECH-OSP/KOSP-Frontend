import AppHeader from '@/common/components/Header/AppHeader';

function ResetPasswordPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppHeader simple />
        <main>{children}</main>
      </body>
    </html>
  );
}

export default ResetPasswordPageLayout;
