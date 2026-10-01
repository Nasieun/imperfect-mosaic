import type { MetadataRoute } from 'next';
import { withBase } from '@/lib/basePath';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '불완전한 모자이크',
    short_name: '모자이크',
    description: '완벽하지 않은 나도 하나의 모습이 됩니다.',
    lang: 'ko',
    start_url: withBase('/'),
    scope: withBase('/'),
    display: 'standalone',
    background_color: '#f6f1e8',
    theme_color: '#f6f1e8',
    icons: [
      { src: withBase('/icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: withBase('/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: withBase('/icons/maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
