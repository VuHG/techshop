/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bỏ qua ESLint lúc `next build` (cấu hình eslint-config-next dễ vênh khi cài sạch
  // trong Docker). VẪN giữ kiểm tra TypeScript để bắt lỗi thật.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Khi có ảnh sản phẩm thật (Phase 8) thêm domain CDN vào đây.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
