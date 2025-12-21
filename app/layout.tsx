import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LCy 2025 Year End Party',
  description: '榮耀時刻 · 得獎名單 - 創新永續,共創未來',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
