import AppHeader from '@/common/components/Header/AppHeader';

function LogoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`bg-gray-50`}>
      <AppHeader simple />
      <main className={`flex h-[calc(100vh-56px)]`}>{children}</main>
    </div>
  );
}

export default LogoutLayout;
