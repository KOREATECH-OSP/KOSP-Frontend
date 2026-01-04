import AppHeader from '@/common/components/Header/AppHeader';
import { suitFont } from '../../style/font'

function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-white ${suitFont.className}`}>
      <AppHeader simple />
      <main className="flex justify-center min-h-[calc(100vh-56px)]">
        {children}
      </main>
    </div>
  );
}

export default SignupLayout;
