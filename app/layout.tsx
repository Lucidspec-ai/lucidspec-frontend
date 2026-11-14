// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthCleanup } from '@/app/providers/AuthCleanup';
import { Toaster } from '@/app/providers/Toaster';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
  'https://lucidspec-frontend-qfnw.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'LucidSpec',
  description: 'Generate Jira tickets with AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sha =
    (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.NEXT_PUBLIC_COMMIT_SHA ||
      '') as string;
  const shortSha = sha ? sha.slice(0, 7) : null;
  const showStamp = process.env.NEXT_PUBLIC_SHOW_BUILD_STAMP === 'true';
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-white text-[#212529]">
        {/* Ensure sign-out on tab close; sessionStorage clears on browser close */}
        <AuthCleanup />
        <Toaster />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer shortSha={shortSha} showStamp={showStamp} />
      </body>
    </html>
  );
}
