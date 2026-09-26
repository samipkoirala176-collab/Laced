import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/order/StatusBadge';
import { apiRequest } from '../services/api';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const callbackStatus = searchParams.get('status');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    apiRequest(`/api/orders/${orderId}`).then(setOrder).catch((requestError) => setError(requestError.message || 'Unable to load the order status.'));
  }, [orderId]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900">{callbackStatus === 'pending' ? 'Payment is being verified' : 'Payment confirmed'}</h1>
      <p className="mt-4 max-w-xl text-slate-600">
        {callbackStatus === 'pending' ? 'eSewa has returned your payment for verification. Check the order status before trying again.' : 'Your eSewa payment callback was received. The order below shows the current payment and delivery state.'}
      </p>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {order && <div className="mt-5 flex flex-wrap gap-3"><span className="text-sm font-medium text-slate-700">Order status</span><OrderStatusBadge status={order.orderStatus} /><span className="text-sm font-medium text-slate-700">Payment status</span><PaymentStatusBadge status={order.paymentStatus} /></div>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {orderId ? (
          <Link to={`/account/orders/${orderId}`} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
            View order
          </Link>
        ) : null}
        <Link to="/shop" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:border-slate-300">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
