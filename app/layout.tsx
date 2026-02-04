import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './lib/auth';

export const metadata: Metadata = {
  title: 'BA Program Admin Panel',
  description: 'Admin panel for BA Program multi-role backend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
