import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { buildImageUrl } from '../../utils/image';
import { useToast } from '../../context/ToastContext';

export default function AdminProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    apiRequest(`/api/products/${id}`)
      .then(setProduct)
      .catch((error) => setState({ loading: false, error: error.message || 'Unable to load product.' }))
      .finally(() => setState((current) => ({ ...current, loading: false })));
  }, [id]);

  const handleDelete = async () => {
    if (!product || !window.confirm(`Delete ${product.name}?`)) return;
    try {
      await apiRequest(`/api/products/${product.id}`, { method: 'DELETE' });
      showToast('Product deleted.', 'success');
      navigate('/admin/products');
    } catch (error) {
      showToast(error.message || 'Unable to delete product.', 'error');
    }
  };

  if (state.loading) return <p className="text-sm text-slate-300">Loading product...</p>;
  if (state.error || !product) return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{state.error || 'Product not found.'}</p>;

  const hero = product.images?.find((image) => image.isHero) || product.images?.[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 p-5">
        <div>
          <Link to="/admin/products" className="text-sm text-cyan-300 underline">Back to products</Link>
          <h2 className="mt-2 text-3xl font-semibold text-white">{product.name}</h2>
          <p className="mt-1 text-sm text-slate-300">{product.isActive ? 'Active product' : 'Inactive product'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/admin/products?edit=${product.id}`} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-200">Edit product</Link>
          <button type="button" onClick={handleDelete} className="rounded-full border border-red-400 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950">Delete product</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <img src={buildImageUrl(hero?.url)} alt={product.name} className="aspect-[4/3] w-full rounded-xl bg-slate-100 object-cover" />
          {product.images?.length > 1 && <div className="mt-4 grid grid-cols-4 gap-3">{product.images.map((image) => <img key={image.id} src={buildImageUrl(image.url)} alt={image.fileName} className="aspect-square w-full rounded-lg border border-slate-200 object-cover" />)}</div>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{product.brand}</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900">NPR {Number(product.price).toLocaleString()}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">{product.description || 'No description available.'}</p>
          <h3 className="mt-6 border-t border-slate-100 pt-5 text-sm font-semibold text-slate-900">Inventory</h3>
          <div className="mt-3 space-y-2">{product.sizes?.map((size) => <div key={size.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>Size {size.size}</span><span className="font-medium">{size.quantity} available</span></div>)}</div>
        </section>
      </div>
    </div>
  );
}
