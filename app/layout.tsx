import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LCy 2026 Year End Party',
  description: '李長榮集團 2026 年終尾牙盛會 · 榮聚新勢・催化未來 · 得獎名單',
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
