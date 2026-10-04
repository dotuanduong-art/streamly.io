import { Film, Tags, Users, ArrowLeft } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

export interface AdminSidebarProps { onNavigate?: () => void; testId?: string }

export function AdminSidebar({ onNavigate, testId = 'admin-sidebar' }: AdminSidebarProps) {
  const links = [
    { to: '/admin/movies', label: 'Movies', icon: Film },
    { to: '/admin/genres', label: 'Genres', icon: Tags },
    { to: '/admin/users', label: 'Users', icon: Users },
  ];
  return <nav data-testid={testId} aria-label="Admin navigation" className="flex h-full flex-col bg-surface p-5">
    <Link to="/admin/movies" onClick={onNavigate} className="mb-8 text-xl font-extrabold text-brand">Streamly<span className="text-text-primary"> Admin</span></Link>
    <div className="space-y-2">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-button px-4 py-3 font-semibold ${isActive ? 'bg-brand text-white' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}><Icon size={19} />{label}</NavLink>)}</div>
    <Link to="/" onClick={onNavigate} className="mt-auto flex items-center gap-3 rounded-button px-4 py-3 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><ArrowLeft size={19} />Back to site</Link>
  </nav>;
}
