import { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { buildImageUrl } from '../../utils/image';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/common/Pagination';

const emptyForm = { name: '', description: '', brand: '', price: '', isActive: true, sizes: [{ size: '', quantity: 0 }], images: [], heroImageIndex: '' };

function normalizeSizes(sizes) {
  return (sizes || []).map((item) => ({ size: item.size, quantity: item.quantity }));
}

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [heroImageId, setHeroImageId] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, totalItems: 0 });
  const [state, setState] = useState({ loading: true, saving: false, error: '' });

  const loadProducts = async (page = pagination.page) => {
    try {
      setState((current) => ({ ...current, loading: true, error: '' }));
      const result = await apiRequest(`/api/products?page=${page}&pageSize=10`);
      setProducts(result?.items || []);
      setPagination({ page: result?.page || page, totalPages: result?.totalPages || 0, totalItems: result?.totalItems || 0 });
    } catch (error) {
      setState((current) => ({ ...current, error: error.message || 'Unable to load products.' }));
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const startCreate = () => {
    setEditingId('');
    setForm(emptyForm);
    setExistingImages([]);
    setRemoveImageIds([]);
    setHeroImageId('');
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    const hero = (product.images || []).find((image) => image.isHero);
    setForm({ name: product.name, description: product.description || '', brand: product.brand, price: product.price, isActive: product.isActive, sizes: normalizeSizes(product.sizes), images: [], heroImageIndex: '' });
    setExistingImages(product.images || []);
    setRemoveImageIds([]);
    setHeroImageId(hero?.id || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSize = (index, key, value) => setForm((current) => ({ ...current, sizes: current.sizes.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const addSize = () => setForm((current) => ({ ...current, sizes: [...current.sizes, { size: '', quantity: 0 }] }));
  const removeSize = (index) => setForm((current) => ({ ...current, sizes: current.sizes.filter((_, itemIndex) => itemIndex !== index) }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true }));
    try {
      const sizes = form.sizes.filter((item) => item.size !== '').map((item) => ({ size: Number(item.size), quantity: Number(item.quantity) }));
      const body = new FormData();
      body.append('name', form.name);
      body.append('description', form.description);
      body.append('brand', form.brand);
      body.append('price', String(form.price));
      body.append('isActive', String(form.isActive));
      body.append('sizes', JSON.stringify(sizes));
      if (heroImageId) body.append('heroImageId', heroImageId);
      if (form.heroImageIndex !== '') body.append('heroImageIndex', String(form.heroImageIndex));
      if (removeImageIds.length) body.append('removeImageIds', removeImageIds.join(','));
      form.images.forEach((image) => body.append('images', image));
      await apiRequest(editingId ? `/api/products/${editingId}` : '/api/products', { method: editingId ? 'PUT' : 'POST', body });
      showToast(editingId ? 'Product updated.' : 'Product created.', 'success');
      startCreate();
      await loadProducts(pagination.page);
    } catch (error) {
      showToast(error.message || 'Unable to save product.', 'error');
    } finally {
      setState((current) => ({ ...current, saving: false }));
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await apiRequest(`/api/products/${product.id}`, { method: 'DELETE' });
      showToast('Product deleted.', 'success');
      await loadProducts();
    } catch (error) {
      showToast(error.message || 'Unable to delete product.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold text-slate-900">{editingId ? 'Edit product' : 'Add product'}</h2>{editingId && <button type="button" onClick={startCreate} className="text-sm text-slate-600 underline">New product</button>}</div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>
          <label className="text-sm font-medium text-slate-700">Brand<input required value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>
          <label className="text-sm font-medium text-slate-700">Price<input required min="0.01" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Active</label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>
        </div>
        <div className="mt-5"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-900">Sizes and inventory</h3><button type="button" onClick={addSize} className="text-sm text-slate-700 underline">Add size</button></div><div className="mt-3 space-y-2">{form.sizes.map((item, index) => <div key={index} className="flex gap-2"><input required type="number" min="0.01" step="0.01" placeholder="Size" value={item.size} onChange={(event) => updateSize(index, 'size', event.target.value)} className="w-32 rounded-xl border border-slate-200 px-3 py-2" /><input required type="number" min="0" placeholder="Quantity" value={item.quantity} onChange={(event) => updateSize(index, 'quantity', event.target.value)} className="w-32 rounded-xl border border-slate-200 px-3 py-2" /><button type="button" onClick={() => removeSize(index)} disabled={form.sizes.length === 1} className="px-2 text-sm text-red-600 disabled:opacity-40">Remove</button></div>)}</div></div>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-slate-900">Product photos</h3><p className="mt-1 text-xs text-slate-500">Add clear product photos, then choose one as the hero image.</p></div><label className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">Add photos<input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={(event) => setForm((current) => ({ ...current, images: [...current.images, ...event.target.files] }))} className="hidden" /></label></div>
          {(existingImages.length > 0 || form.images.length > 0) && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{existingImages.map((image) => <div key={image.id} className={`rounded-xl border bg-white p-2 ${removeImageIds.includes(image.id) ? 'opacity-40' : heroImageId === image.id ? 'border-slate-900' : 'border-slate-200'}`}><img src={buildImageUrl(image.url)} alt={image.fileName} className="aspect-square w-full rounded-lg object-cover" /><div className="mt-2 flex items-center justify-between gap-2 text-xs"><button type="button" onClick={() => setHeroImageId(image.id)} disabled={removeImageIds.includes(image.id)} className="font-medium text-slate-700 disabled:opacity-40">{heroImageId === image.id ? 'Hero image' : 'Set as hero'}</button><button type="button" onClick={() => { setRemoveImageIds((current) => current.includes(image.id) ? current.filter((id) => id !== image.id) : [...current, image.id]); if (heroImageId === image.id) setHeroImageId(''); }} className="text-red-600">Remove</button></div></div>)}{form.images.map((image, index) => <div key={`${image.name}-${index}`} className={`rounded-xl border bg-white p-2 ${heroImageId === `new-${index}` ? 'border-slate-900' : 'border-slate-200'}`}><img src={URL.createObjectURL(image)} alt={image.name} className="aspect-square w-full rounded-lg object-cover" /><div className="mt-2 flex items-center justify-between gap-2 text-xs"><button type="button" onClick={() => { setHeroImageId(`new-${index}`); setForm((current) => ({ ...current, heroImageIndex: String(index) })); }} className="font-medium text-slate-700">{heroImageId === `new-${index}` ? 'Hero image' : 'Set as hero'}</button><button type="button" onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))} className="text-red-600">Remove</button></div></div>)}</div>}
        </div>
        <button disabled={state.saving} className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{state.saving ? 'Saving...' : editingId ? 'Update product' : 'Create product'}</button>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-end justify-between gap-3"><div><h2 className="text-2xl font-semibold text-slate-900">Products</h2><p className="mt-1 text-sm text-slate-500">{pagination.totalItems} products, including inactive listings.</p></div></div>{state.loading ? <p className="mt-4 text-sm text-slate-500">Loading products...</p> : state.error ? <p className="mt-4 text-sm text-red-700">{state.error}</p> : products.length === 0 ? <p className="mt-4 text-sm text-slate-600">No products found.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-3 py-3">Product</th><th className="px-3 py-3">Brand</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Sizes</th><th className="px-3 py-3">Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id} className="border-b border-slate-100"><td className="px-3 py-3 font-medium text-slate-900">{product.name}{!product.isActive && <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">Inactive</span>}</td><td className="px-3 py-3">{product.brand}</td><td className="px-3 py-3">NPR {Number(product.price).toLocaleString()}</td><td className="px-3 py-3">{product.sizes?.map((size) => `${size.size} (${size.quantity})`).join(', ')}</td><td className="px-3 py-3"><button type="button" onClick={() => startEdit(product)} className="mr-3 underline">Edit</button><button type="button" onClick={() => handleDelete(product)} className="text-red-600 underline">Delete</button></td></tr>)}</tbody></table></div>}<Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={loadProducts} /></section>
    </div>
  );
}
