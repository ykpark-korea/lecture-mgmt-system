import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "한화 강의 관리",
  description: "한화 내부 강의 포털"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
