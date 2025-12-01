import type { Metadata } from "next";
import "./globals.css";

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
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
