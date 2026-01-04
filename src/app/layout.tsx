import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "K-OSP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Providers>{children}</Providers>
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
