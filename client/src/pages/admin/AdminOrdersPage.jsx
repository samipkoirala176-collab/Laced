import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { OrderStatusBadge, PaymentMethodBadge, PaymentStatusBadge } from '../../components/order/StatusBadge';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/common/Pagination';

const orderStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const paymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: '', paymentStatus: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0 });
  const [state, setState] = useState({ loading: true, error: '' });

  const loadOrders = async (page = pagination.page) => {
    try {
      setState({ loading: true, error: '' });
      const query = new URLSearchParams({ page: String(page), pageSize: '10' });
      Object.entries(filters).forEach(([key, value]) => value && query.set(key, value));
      const result = await apiRequest(`/api/admin/orders?${query}`);
      setOrders(result?.items || []);
      setPagination({ page: result?.page || page, totalPages: result?.totalPages || 0 });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Unable to load admin orders.' });
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  };

  useEffect(() => { loadOrders(1); }, [filters.status, filters.paymentStatus]);

  const cancelOrder = async (order) => {
    if (!window.confirm(`Cancel order ${order.id}?`)) return;
    try {
      await apiRequest(`/api/admin/orders/${order.id}/cancel`, { method: 'POST' });
      showToast('Order cancelled.', 'success');
      await loadOrders();
    } catch (error) { showToast(error.message || 'Unable to cancel order.', 'error'); }
  };

  return <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-2xl font-semibold text-slate-900">Orders</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} onKeyDown={(event) => event.key === 'Enter' && loadOrders(1)} placeholder="Search customer email" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" /><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">All order statuses</option>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select><select value={filters.paymentStatus} onChange={(event) => setFilters({ ...filters, paymentStatus: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">All payment statuses</option>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select></div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{state.loading ? <p className="text-sm text-slate-500">Loading orders...</p> : state.error ? <p className="text-sm text-red-700">{state.error}</p> : orders.length === 0 ? <p className="text-sm text-slate-600">No orders found.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-3 py-3">Order</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Payment method</th><th className="px-3 py-3">Payment status</th><th className="px-3 py-3">Order status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-slate-100"><td className="px-3 py-3"><Link className="font-medium underline" to={`/admin/orders/${order.id}`}>{order.id}</Link></td><td className="px-3 py-3">{order.customerEmail || order.customerName || 'Unknown'}</td><td className="px-3 py-3">{new Date(order.createdAt).toLocaleDateString()}</td><td className="px-3 py-3">NPR {Number(order.totalAmount).toLocaleString()}</td><td className="px-3 py-3"><PaymentMethodBadge method={order.paymentMethod} /></td><td className="px-3 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td><td className="px-3 py-3"><OrderStatusBadge status={order.orderStatus} /></td><td className="px-3 py-3">{Number(order.orderStatus) < 3 && <button type="button" onClick={() => cancelOrder(order)} className="text-red-600 underline">Cancel</button>}</td></tr>)}</tbody></table></div>}<Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={loadOrders} /></div></div>;
}
