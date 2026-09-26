import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { buildImageUrl } from '../utils/image';

export default function CartPage() {
  const { items, total, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { showToast } = useToast();

  if (loading) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cart</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Your cart is empty</h1>
        <p className="mt-4 text-slate-600">Start exploring the latest drops and add a pair to your cart.</p>
        <Link to="/shop" className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700">
          Continue shopping
        </Link>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) {
      return;
    }

    await updateQuantity(itemId, quantity);
  };

  const handleCheckout = () => {
    showToast('Checkout will be added in a later prompt.', 'info');
  };

  return (
    <div className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,1.5fr)_360px]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cart</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Your items</h1>
          </div>
          <button type="button" onClick={() => clearCart()} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300">
            Clear cart
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 p-4 sm:flex-row sm:items-center">
              <img src={buildImageUrl(item.heroImage)} alt={item.productName} className="h-28 w-full rounded-[1rem] object-cover sm:w-28" />

              <div className="flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-900">{item.productName}</h2>
                    <p className="mt-1 text-sm text-slate-600">Size {item.size}</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">NPR {Number(item.lineTotal || 0).toLocaleString()}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, Number(item.quantity) - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700"
                      aria-label="Decrease item quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="min-w-10 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, Number(item.quantity) + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700"
                      aria-label="Increase item quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span>Unit: NPR {Number(item.unitPrice || 0).toLocaleString()}</span>
                    <button type="button" onClick={() => removeItem(item.id)} className="inline-flex items-center gap-2 text-red-600">
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Summary</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-900">Order total</h2>

        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">NPR {Number(total || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>—</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>NPR {Number(total || 0).toLocaleString()}</span>
          </div>
        </div>

        <Link to="/checkout" className="mt-6 block w-full rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-700">
          Proceed to checkout
        </Link>
        <Link to="/shop" className="mt-3 block rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:border-slate-300">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
