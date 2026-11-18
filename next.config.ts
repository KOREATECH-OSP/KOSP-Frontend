import { withSentryConfig } from '@sentry/nextjs';
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // 이미지 최적화 프록시(/_next/image)가 임의 호스트를 대신 요청하지 않도록(SSRF)
    // 실제로 쓰는 호스트만 허용한다. 새 이미지 출처가 생기면 여기에 추가해야 한다.
    remotePatterns: [
      // GitHub 프로필 이미지 (profileImage / avatarUrl)
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // https://github.com/{username}.png → avatars 로 리다이렉트
      { protocol: 'https', hostname: 'github.com', pathname: '/*.png' },
      // S3 업로드 파일·칭호 아이콘 (AWS_S3_CUSTOM_DOMAIN): 운영 / 개발
      { protocol: 'https', hostname: 'static.swkoreatech.io' },
      { protocol: 'https', hostname: 'dev.static.swkoreatech.io' },
    ],
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "koreatech-xd",

  project: "koreatech-osp",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Keep client uploads narrow if build-time Sentry work is re-enabled later.
  widenClientFileUpload: false,

  telemetry: false,

  // Disable build-time source map upload and release management in all environments.
  sourcemaps: {
    disable: true,
  },

  release: {
    create: false,
    finalize: false,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
