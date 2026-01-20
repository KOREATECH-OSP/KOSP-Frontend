

export default function CommunityPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50`}>
      {children}
    </div>
  );
}
