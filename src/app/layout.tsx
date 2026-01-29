import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "K-OSP",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className={`antialiased`}>
        <Providers initialSession={session}>{children}</Providers>
        <Toaster
          richColors
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
