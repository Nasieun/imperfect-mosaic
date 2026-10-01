import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

// GitHub Pages 같은 정적 호스팅용 빌드: STATIC_EXPORT=true 이면 out/ 폴더에 정적 파일을 만든다.
const staticExport = process.env.STATIC_EXPORT === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 정적 호스팅에서 /journey/ 처럼 폴더 주소로 열리도록 끝에 / 를 붙인다.
  trailingSlash: true,
  ...(staticExport ? { output: 'export' } : {}),
  ...(basePath ? { basePath } : {}),
  // 첫 화면을 막는 CSS 요청을 없애기 위해 CSS를 HTML에 넣는다.
  experimental: { inlineCss: true },
  webpack: (config) => {
    // konva의 Node용 진입점이 'canvas' 패키지를 찾지 않도록 한다.
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
