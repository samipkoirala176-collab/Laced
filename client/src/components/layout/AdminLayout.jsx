import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/refunds', label: 'Refunds' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    navigate('/');
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Laced admin</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-900">Store management</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:border-slate-300">Back to store</Link>
            <button type="button" onClick={handleLogout} className="rounded-full bg-slate-900 px-3 py-2 text-white hover:bg-slate-700">Logout</button>
          </div>
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto text-sm font-medium">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 ${isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
