import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { OrderStatusBadge, PaymentMethodBadge, PaymentStatusBadge } from '../../components/order/StatusBadge';
import { useToast } from '../../context/ToastContext';

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, saving: false, error: '' });

  const loadOrder = async () => {
    try { const data = await apiRequest(`/api/admin/orders/${id}`); setOrder(data); setStatus(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'][Number(data.orderStatus)]); } catch (error) { setState({ loading: false, saving: false, error: error.message || 'Unable to load order.' }); } finally { setState((current) => ({ ...current, loading: false })); }
  };
  useEffect(() => { loadOrder(); }, [id]);

  const updateStatus = async (event) => {
    event.preventDefault(); setState((current) => ({ ...current, saving: true }));
    try { await apiRequest(`/api/admin/orders/${id}/status`, { method: 'PUT', body: { status } }); showToast('Order status updated.', 'success'); await loadOrder(); } catch (error) { showToast(error.message || 'Unable to update order status.', 'error'); } finally { setState((current) => ({ ...current, saving: false })); }
  };

  const cancelOrder = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try { await apiRequest(`/api/admin/orders/${id}/cancel`, { method: 'POST' }); showToast('Order cancelled.', 'success'); await loadOrder(); } catch (error) { showToast(error.message || 'Unable to cancel order.', 'error'); }
  };

  if (state.loading) return <p className="text-sm text-slate-500">Loading order...</p>;
  if (state.error || !order) return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{state.error || 'Order not found.'}</p>;
  const currentStatus = Number(order.orderStatus);

    return <div className="space-y-5"><div className="flex items-center justify-between gap-4"><div><Link to="/admin/orders" className="text-sm text-cyan-300 underline">Back to orders</Link><h2 className="mt-2 text-3xl font-semibold text-white">{order.id}</h2></div><div className="flex flex-wrap gap-2"><OrderStatusBadge status={order.orderStatus} /><PaymentStatusBadge status={order.paymentStatus} /><PaymentMethodBadge method={order.paymentMethod} /></div></div><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-semibold text-slate-900">Order details</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Customer</p><p className="mt-2 text-sm">{order.customerName || 'Unknown'}<br />{order.customerEmail}</p></div><div><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Date</p><p className="mt-2 text-sm">{new Date(order.createdAt).toLocaleString()}</p></div><div><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Shipping</p><p className="mt-2 text-sm">{order.shippingName}<br />{order.shippingPhone}<br />{order.shippingAddress}, {order.shippingCity} {order.shippingPostalCode}</p></div><div><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total amount</p><p className="mt-2 text-lg font-semibold">NPR {Number(order.totalAmount).toLocaleString()}</p></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-2 py-3">Product</th><th className="px-2 py-3">Size</th><th className="px-2 py-3">Quantity</th><th className="px-2 py-3">Unit price</th><th className="px-2 py-3">Line total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="px-2 py-3">{item.productName}</td><td className="px-2 py-3">{item.size}</td><td className="px-2 py-3">{item.quantity}</td><td className="px-2 py-3">NPR {Number(item.unitPrice).toLocaleString()}</td><td className="px-2 py-3">NPR {Number(item.lineTotal).toLocaleString()}</td></tr>)}</tbody></table></div></section><aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-semibold text-slate-900">Manage order</h3><form onSubmit={updateStatus} className="mt-4"><label className="text-sm font-medium">Order status<select value={status} onChange={(event) => setStatus(event.target.value)} disabled={currentStatus >= 4} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal">{statuses.map((value) => <option key={value}>{value}</option>)}</select></label><button disabled={state.saving || currentStatus >= 4} className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{state.saving ? 'Saving...' : 'Update status'}</button></form>{currentStatus < 3 && <button type="button" onClick={cancelOrder} className="mt-3 w-full rounded-full border border-red-200 px-4 py-2 text-sm text-red-700">Cancel order</button>}</aside></div></div>;
}
