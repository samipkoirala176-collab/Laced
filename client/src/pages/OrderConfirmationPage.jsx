import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { OrderStatusBadge, PaymentMethodBadge, PaymentStatusBadge } from '../components/order/StatusBadge';
import { apiRequest } from '../services/api';
import { buildImageUrl } from '../utils/image';

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Order information is missing.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const result = await apiRequest(`/api/orders/${orderId}`);
        setOrder(result);
      } catch (err) {
        setError(err.message || 'Unable to load your order details right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
        {error || 'Order information is not available.'}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Order confirmation</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Order placed successfully</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Order ID</p>
            <p className="mt-3 text-sm font-medium text-slate-900">{order.id}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
            <div className="mt-3"><OrderStatusBadge status={order.orderStatus} /></div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <PaymentMethodBadge method={order.paymentMethod} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">NPR {Number(order.totalAmount || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Shipping</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-900">Delivery details</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Name</p>
            <p className="mt-3 text-slate-900">{order.shippingName}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</p>
            <p className="mt-3 text-slate-900">{order.shippingPhone}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Address</p>
            <p className="mt-3 text-slate-900">{order.shippingAddress}, {order.shippingCity}{order.shippingPostalCode ? `, ${order.shippingPostalCode}` : ''}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-slate-900">Items</h2>
        </div>

        <div className="mt-5 space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[1rem] border border-slate-200 p-4 sm:flex-row sm:items-center">
              <img src={buildImageUrl(item.heroImage || item.image)} alt={item.productName} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="text-sm text-slate-600">Size {item.size}</p>
                </div>
                <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <span>Qty {item.quantity}</span>
                  <span>NPR {Number(item.unitPrice || 0).toLocaleString()} each</span>
                  <span className="font-medium text-slate-900">NPR {Number(item.lineTotal || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to={`/account/orders/${order.id}`} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
          View Order
        </Link>
        <Link to="/shop" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:border-slate-300">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
