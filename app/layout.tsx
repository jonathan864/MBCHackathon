import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentGuard Sandbox',
  description: 'AI Trading Bot Strategy Evaluation Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-lg text-slate-900">AgentGuard</span>
              </Link>
              <div className="flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/policies"
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Strategies
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
