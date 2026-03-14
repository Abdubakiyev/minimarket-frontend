import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qarz Daftar',
  description: 'Qarzdorlarni boshqarish tizimi',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}