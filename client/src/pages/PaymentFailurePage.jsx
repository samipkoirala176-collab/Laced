import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentFailurePage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');

  return (
    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Payment result</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Payment was not completed</h1>
      <p className="mt-4 max-w-xl text-slate-600">
        {status === 'invalid' ? 'The payment callback was invalid or incomplete.' : 'The payment attempt was unsuccessful or cancelled.'}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {orderId ? (
          <Link to={`/account/orders/${orderId}`} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
            Return to order
          </Link>
        ) : (
          <Link to="/cart" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
            Return to cart
          </Link>
        )}
        <Link to="/shop" className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:border-red-300">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
