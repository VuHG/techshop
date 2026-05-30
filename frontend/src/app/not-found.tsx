import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-xl font-semibold text-gray-800">Không tìm thấy trang</h1>
      <p className="mt-2 text-gray-500">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
