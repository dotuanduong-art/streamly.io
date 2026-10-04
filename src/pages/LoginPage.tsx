import { Link, useLocation } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { USE_MOCK_AUTH } from '@/lib/constants';
import { mockAuthDemoCredentials } from '@/api/auth.api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface ReturnLocation { pathname?: string; search?: string; hash?: string }

export default function LoginPage() {
  useDocumentTitle('Đăng nhập | Streamly');
  const location = useLocation();
  const from = (location.state as { from?: ReturnLocation } | null)?.from;
  const returnTo = `${from?.pathname ?? '/'}${from?.search ?? ''}${from?.hash ?? ''}`;
  return <div className="page-gutter flex min-h-[calc(100svh-6rem)] items-center justify-center py-12">
    <section className="w-full max-w-md rounded-card border border-text-primary/10 bg-surface/95 p-6 shadow-card sm:p-9" aria-labelledby="login-heading">
      <Link to="/" className="text-xl font-extrabold text-brand">Streamly<span className="text-text-primary">.</span></Link>
      <h1 id="login-heading" className="mt-8 text-3xl font-bold leading-snug">Chào mừng trở lại</h1>
      <p className="mt-2 text-sm text-text-secondary">Đăng nhập để lưu và xem lại những bộ phim yêu thích.</p>
      <div className="mt-7"><LoginForm returnTo={returnTo} /></div>
      {USE_MOCK_AUTH && <div className="mt-6 rounded-button bg-background/60 p-3 text-xs text-text-secondary"><p className="font-semibold text-text-primary">Tài khoản dùng thử</p><p className="mt-1">Người dùng: {mockAuthDemoCredentials.user.email} / {mockAuthDemoCredentials.user.password}</p><p>Quản trị: {mockAuthDemoCredentials.admin.email} / {mockAuthDemoCredentials.admin.password}</p></div>}
      <p className="mt-6 text-center text-sm text-text-secondary">Chưa có tài khoản? <Link to="/register" state={location.state} className="font-semibold text-text-primary hover:underline">Đăng ký</Link></p>
      <Link to="/" className="mt-4 block text-center text-sm text-text-secondary hover:text-text-primary">Về trang chủ</Link>
    </section>
  </div>;
}
