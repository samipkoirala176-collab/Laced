import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import ProfilePage from './pages/account/ProfilePage';
import AccountOrdersPage from './pages/account/AccountOrdersPage';
import AccountRefundsPage from './pages/account/AccountRefundsPage';
import OrderDetailPage from './pages/account/OrderDetailPage';
import AdminPage from './pages/admin/AdminPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminRefundsPage from './pages/admin/AdminRefundsPage';
import AdminRefundDetailPage from './pages/admin/AdminRefundDetailPage';
import { TermsPage, PrivacyPage } from './pages/legal/LegalPages';
import { AboutPage, ContactPage, NotFoundPage } from './pages/InfoPages';

function AccountLayout() {
  const accountLinks = [
    { to: '/account/profile', label: 'Profile' },
    { to: '/account/orders', label: 'Orders' },
    { to: '/account/refunds', label: 'Refunds' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <nav className="flex flex-wrap gap-2 text-sm font-medium text-slate-600">
          {accountLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/account'}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/account/profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<AccountOrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="refunds" element={<AccountRefundsPage />} />
        </Route>

        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-failure" element={<PaymentFailurePage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failure" element={<PaymentFailurePage />} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="refunds" element={<AdminRefundsPage />} />
          <Route path="refunds/:id" element={<AdminRefundDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
