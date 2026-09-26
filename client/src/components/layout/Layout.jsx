import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogOut, Menu, ShieldCheck, ShoppingCart, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <p className="text-lg font-semibold tracking-[0.2em] text-slate-900">LACED</p>
          <p className="mt-2 max-w-xs text-slate-600">Minimal sneaker essentials for everyday wear.</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Navigate</p>
          <ul className="mt-3 space-y-2"> 
            <li><Link to="/shop" className="hover:text-slate-900">Shop</Link></li>
            <li><Link to="/about" className="hover:text-slate-900">About</Link></li>
            <li><Link to="/contact" className="hover:text-slate-900">Contact</Link></li>
            <li><Link to="/terms" className="hover:text-slate-900">Terms</Link></li>
            <li><Link to="/privacy" className="hover:text-slate-900">Privacy</Link></li>
          </ul>
        </div>

        <div className="max-w-xs text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Project note</p>
          <p className="mt-3">Laced is a college semester project and is not a real commercial ecommerce business.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();
  const { cartCount } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    showToast('Logged out successfully.', 'info');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#f5f3ee]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-[0.24em] text-slate-900">
            LACED
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `transition-colors ${isActive ? 'text-slate-900' : 'hover:text-slate-900'}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300" aria-label="Cart">
              <ShoppingCart size={16} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {role === 'Admin' && (
                  <Link to="/admin" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-700">
                    <ShieldCheck size={16} />
                    Admin
                  </Link>
                )}
                <Link to="/account" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300">
                  <User size={16} />
                  Account
                </Link>
                <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-full bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-700">
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-[#f5f3ee] md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-slate-700 sm:px-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `rounded-md px-2 py-2 ${isActive ? 'bg-slate-100 text-slate-900' : 'hover:bg-white'}`}
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/shop" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-white">Shop</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-white">Account</Link>
                  {role === 'Admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-white">Admin</Link>
                  )}
                  <button type="button" onClick={handleLogout} className="rounded-md px-2 py-2 text-left hover:bg-white">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-white">Login</Link>
              )}
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-white">
                <span>Cart</span>
                {cartCount > 0 && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{cartCount}</span>}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
