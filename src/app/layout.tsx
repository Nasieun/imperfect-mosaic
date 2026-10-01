import type { Metadata, Viewport } from 'next';
import { Nanum_Myeongjo } from 'next/font/google';
import ClientInit from '@/components/ClientInit';
import { withBase } from '@/lib/basePath';
import './globals.css';

// 스토리·바라보기 문장용 세리프. 빌드 때 내려받아 같은 출처에서 제공한다(오프라인에서도 유지).
const serif = Nanum_Myeongjo({ weight: ['400', '700'], subsets: ['latin'], preload: false, variable: '--font-serif' });

export const metadata: Metadata = {
  title: '불완전한 모자이크',
  description: '완벽하지 않은 나도 하나의 모습이 됩니다.',
  applicationName: '불완전한 모자이크',
  appleWebApp: { capable: true, title: '모자이크', statusBarStyle: 'default' },
  icons: { icon: withBase('/icons/icon-192.png'), apple: withBase('/icons/icon-192.png') },
  manifest: withBase('/manifest.webmanifest'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f1e8' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1c1a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={serif.variable}>
      <body>
        <ClientInit />
        {children}
      </body>
    </html>
  );
}
