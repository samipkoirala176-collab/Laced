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
    <div className="-mx-4 -mt-8 min-h-[calc(100vh-5rem)] space-y-6 bg-slate-950 px-4 pb-8 pt-8 text-slate-100 sm:-mx-6 sm:px-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Laced operations</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">Store management</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/" className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 hover:border-slate-500">Back to store</Link>
            <button type="button" onClick={handleLogout} className="rounded-full bg-cyan-300 px-3 py-2 text-slate-950 hover:bg-cyan-200">Logout</button>
          </div>
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto text-sm font-medium">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 ${isActive ? 'bg-cyan-300 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
