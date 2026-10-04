import { Link, useLocation } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface ReturnLocation { pathname?: string; search?: string; hash?: string }

export default function RegisterPage() {
  useDocumentTitle('Create Account | Streamly');
  const location = useLocation();
  const from = (location.state as { from?: ReturnLocation } | null)?.from;
  const returnTo = `${from?.pathname ?? '/'}${from?.search ?? ''}${from?.hash ?? ''}`;
  return <div className="page-gutter flex min-h-[calc(100svh-6rem)] items-center justify-center py-12">
    <section className="w-full max-w-md rounded-card border border-text-primary/10 bg-surface/95 p-6 shadow-card sm:p-9" aria-labelledby="register-heading">
      <Link to="/" className="text-xl font-extrabold text-brand">Streamly<span className="text-text-primary">.</span></Link>
      <h1 id="register-heading" className="mt-8 text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-sm text-text-secondary">Save movies and return to them anytime.</p>
      <div className="mt-7"><RegisterForm returnTo={returnTo} /></div>
      <p className="mt-6 text-center text-sm text-text-secondary">Already have an account? <Link to="/login" state={location.state} className="font-semibold text-text-primary hover:underline">Sign in</Link></p>
      <Link to="/" className="mt-4 block text-center text-sm text-text-secondary hover:text-text-primary">Back to home</Link>
    </section>
  </div>;
}
