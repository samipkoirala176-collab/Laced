import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderStatusBadge, PaymentMethodBadge, PaymentStatusBadge } from '../../components/order/StatusBadge';
import { apiRequest } from '../../services/api';

function formatCurrency(value) {
  return `NPR ${Number(value || 0).toLocaleString()}`;
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const result = await apiRequest('/api/orders?page=1&pageSize=20');
        setOrders(result?.items || []);
      } catch (err) {
        setError(err.message || 'Unable to load orders right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading orders...</div>;
  }

  if (error) {
    return <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900">Your orders</h1>
        <p className="mt-4 text-slate-600">You have not placed any orders yet.</p>
        <Link to="/shop" className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700">
          Shop sneakers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900">Your orders</h1>
      </div>

      {orders.map((order) => (
        <Link
          key={order.id}
          to={`/account/orders/${order.id}`}
          className="block rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Order</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-900">{order.id}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
              <PaymentMethodBadge method={order.paymentMethod} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Date</p>
              <p className="mt-2 text-sm text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Items</p>
              <p className="mt-2 text-sm text-slate-900">{(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} items</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment</p>
              <p className="mt-2 text-sm text-slate-900">{order.paymentMethod === 1 ? 'eSewa' : 'Cash on Delivery'}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
