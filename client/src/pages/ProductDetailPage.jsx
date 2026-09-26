import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../services/api';
import { buildImageUrl } from '../utils/image';

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await apiRequest(`/api/products/${id}`);
        const images = result?.images || [];
        const initialHero = images.find((image) => image.isHero) || images[0];

        setProduct(result);
        setSelectedImage(initialHero?.url || '');
        const firstAvailable = (result?.sizes || []).find((size) => Number(size.quantity) > 0);
        setSelectedSizeId(firstAvailable?.id || '');
      } catch (err) {
        setError(err.message || 'Unable to load this product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const selectedSize = useMemo(
    () => (product?.sizes || []).find((size) => size.id === selectedSizeId) || null,
    [product, selectedSizeId],
  );

  const maxQuantity = Number(selectedSize?.quantity || 0);

  useEffect(() => {
    if (selectedSize && quantity > maxQuantity) {
      setQuantity(maxQuantity || 1);
    }
  }, [maxQuantity, quantity, selectedSize]);

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!selectedSizeId) {
      showToast('Please select a size first.', 'error');
      return;
    }

    if (quantity < 1) {
      showToast('Please choose a valid quantity.', 'error');
      return;
    }

    await addItem({ productSizeId: selectedSizeId, quantity });
  };

  if (loading) {
    return <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
        {error || 'This product could not be found.'}
      </div>
    );
  }

  const images = product.images || [];
  const heroImage = images.find((image) => image.url === selectedImage) || images.find((image) => image.isHero) || images[0];

  return (
    <div className="pb-8">
      <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
            <img
              src={buildImageUrl(heroImage?.url)}
              alt={product.name}
              className="h-[420px] w-full object-cover sm:h-[520px]"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(image.url)}
                  className={`overflow-hidden rounded-xl border ${selectedImage === image.url ? 'border-slate-900' : 'border-slate-200'}`}
                >
                  <img src={buildImageUrl(image.url)} alt={`${product.name} thumbnail`} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{product.brand}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">{product.name}</h1>
          <p className="mt-5 text-3xl font-semibold text-slate-900">NPR {Number(product.price || 0).toLocaleString()}</p>
          <p className="mt-5 text-slate-600">{product.description || 'No description available for this sneaker.'}</p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Select size</p>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || []).map((size) => {
                  const isAvailable = Number(size.quantity) > 0;
                  const isSelected = selectedSizeId === size.id;

                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => isAvailable && setSelectedSizeId(size.id)}
                      disabled={!isAvailable}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : isAvailable
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      }`}
                    >
                      {size.size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Quantity</p>
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="min-w-12 text-center text-sm font-medium text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(maxQuantity || 1, value + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:border-slate-300">
              Back to shop
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
