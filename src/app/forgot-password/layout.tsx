import AppHeader from '@/common/components/Header/AppHeader';

function ForgotPasswordPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-white`}>
      <AppHeader simple />
      <main className="flex justify-center min-h-[calc(100vh-56px)]">
        {children}
      </main>
    </div>
  );
}

export default ForgotPasswordPageLayout;
