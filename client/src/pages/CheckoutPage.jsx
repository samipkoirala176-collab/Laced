import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../services/api';
import { buildImageUrl } from '../utils/image';

const initialForm = {
  shippingName: '',
  shippingPhone: '',
  shippingAddress: '',
  shippingCity: '',
  shippingPostalCode: '',
  paymentMethod: 'COD',
};

function submitEsewaForm(paymentData) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentData.paymentUrl;

  Object.entries(paymentData.fields || {}).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value ?? '');
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900">Checkout</h1>
        <p className="mt-4 text-slate-600">Your cart is empty. Add a pair to continue.</p>
        <Link to="/shop" className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700">
          Continue shopping
        </Link>
      </div>
    );
  }

  const validate = () => {
    const nextErrors = {};

    if (!form.shippingName.trim()) {
      nextErrors.shippingName = 'Name is required.';
    }

    if (!form.shippingPhone.trim()) {
      nextErrors.shippingPhone = 'Phone is required.';
    } else if (form.shippingPhone.replace(/\D/g, '').length < 7) {
      nextErrors.shippingPhone = 'Enter a valid phone number.';
    }

    if (!form.shippingAddress.trim()) {
      nextErrors.shippingAddress = 'Address is required.';
    }

    if (!form.shippingCity.trim()) {
      nextErrors.shippingCity = 'City is required.';
    }

    if (!form.paymentMethod || !['COD', 'Esewa'].includes(form.paymentMethod)) {
      nextErrors.paymentMethod = 'Please choose a payment method.';
    }

    if (items.some((item) => Number(item.quantity || 0) < 1)) {
      nextErrors.cart = 'One or more cart items are invalid.';
    }

    return nextErrors;
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '', cart: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      const order = await apiRequest('/api/orders', {
        method: 'POST',
        body: {
          shippingName: form.shippingName.trim(),
          shippingPhone: form.shippingPhone.trim(),
          shippingAddress: form.shippingAddress.trim(),
          shippingCity: form.shippingCity.trim(),
          shippingPostalCode: form.shippingPostalCode.trim() || null,
          paymentMethod: form.paymentMethod,
        },
      });

      if (form.paymentMethod === 'Esewa') {
        const paymentResponse = await apiRequest(`/api/payments/esewa/initiate/${order.id}`, {
          method: 'POST',
        });

        await clearCart();
        submitEsewaForm(paymentResponse);
        return;
      }

      await clearCart();
      navigate(`/order-confirmation?orderId=${order.id}`);
    } catch (error) {
      showToast(error.message || 'Unable to place the order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,1.3fr)_360px]">
      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900">Checkout</h1>

        <div className="mt-7 space-y-6">
          <section>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-900">Shipping Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  value={form.shippingName}
                  onChange={(event) => handleChange('shippingName', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="John Doe"
                />
                {errors.shippingName && <p className="mt-1 text-sm text-red-600">{errors.shippingName}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input
                  value={form.shippingPhone}
                  onChange={(event) => handleChange('shippingPhone', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="9800000000"
                />
                {errors.shippingPhone && <p className="mt-1 text-sm text-red-600">{errors.shippingPhone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
                <input
                  value={form.shippingAddress}
                  onChange={(event) => handleChange('shippingAddress', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="New Baneshwor"
                />
                {errors.shippingAddress && <p className="mt-1 text-sm text-red-600">{errors.shippingAddress}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
                <input
                  value={form.shippingCity}
                  onChange={(event) => handleChange('shippingCity', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Kathmandu"
                />
                {errors.shippingCity && <p className="mt-1 text-sm text-red-600">{errors.shippingCity}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Postal code</label>
                <input
                  value={form.shippingPostalCode}
                  onChange={(event) => handleChange('shippingPostalCode', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="44600"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-900">Payment Method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['COD', 'Esewa'].map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${form.paymentMethod === method ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                >
                  <span className="font-medium">{method === 'COD' ? 'Cash on Delivery' : 'eSewa'}</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={() => handleChange('paymentMethod', method)}
                    className="h-4 w-4 accent-slate-900"
                  />
                </label>
              ))}
            </div>
            {errors.paymentMethod && <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>}
          </section>

          {errors.cart && <p className="text-sm text-red-600">{errors.cart}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Placing order...' : 'Place Order'}
          </button>
        </div>
      </form>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-900">Order Summary</h2>

        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-[1rem] border border-slate-200 p-3">
              <img src={buildImageUrl(item.heroImage)} alt={item.productName} className="h-20 w-20 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{item.productName}</p>
                <p className="mt-1 text-sm text-slate-600">Size {item.size}</p>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Qty {item.quantity}</span>
                  <span className="font-medium text-slate-900">NPR {Number(item.lineTotal || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">NPR {Number(total || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>NPR {Number(total || 0).toLocaleString()}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
