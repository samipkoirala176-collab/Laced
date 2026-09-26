import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { apiRequest } from '../services/api';

const PAGE_SIZE = 12;

function buildFilterState(searchParams) {
  return {
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    page: Number(searchParams.get('page')) || 1,
  };
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => buildFilterState(searchParams));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, totalItems: 0, totalPages: 0 });

  const syncSearchParams = (nextFilters) => {
    const query = new URLSearchParams();

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (key === 'page') {
        return;
      }

      if (value !== '' && value !== null && value !== undefined) {
        query.set(key, String(value));
      }
    });

    query.set('page', String(nextFilters.page || 1));
    query.set('pageSize', String(PAGE_SIZE));
    setSearchParams(query, { replace: true });
  };

  const updateField = (field, value) => {
    setFilters((current) => {
      const next = { ...current, [field]: value, page: 1 };
      syncSearchParams(next);
      return next;
    });
  };

  const resetFilters = () => {
    const next = {
      search: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      page: 1,
    };
    setFilters(next);
    syncSearchParams(next);
  };

  const changePage = (page) => {
    const next = { ...filters, page };
    setFilters(next);
    syncSearchParams(next);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const query = new URLSearchParams();

        if (filters.search) query.set('search', filters.search.trim());
        if (filters.brand) query.set('brand', filters.brand.trim());
        if (filters.minPrice) query.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice) query.set('maxPrice', String(filters.maxPrice));
        if (filters.size) query.set('size', String(filters.size));
        query.set('page', String(filters.page || 1));
        query.set('pageSize', String(PAGE_SIZE));

        const result = await apiRequest(`/api/products?${query.toString()}`, { signal: controller.signal });

        setProducts(result?.items || []);
        setPagination({
          page: result?.page || 1,
          pageSize: result?.pageSize || PAGE_SIZE,
          totalItems: result?.totalItems || 0,
          totalPages: result?.totalPages || 0,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load products right now.');
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchProducts, 250);
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [filters]);

  const pageNumbers = useMemo(() => {
    const items = [];
    for (let page = 1; page <= pagination.totalPages; page += 1) {
      items.push(page);
    }
    return items;
  }, [pagination.totalPages]);

  return (
    <div className="space-y-8 pb-8">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900">Latest Drops</h1>
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen((value) => !value)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`${filterOpen ? 'block' : 'hidden'} rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm lg:block`}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            {(filters.search || filters.brand || filters.minPrice || filters.maxPrice || filters.size) && (
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                <X size={14} />
                Reset
              </button>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(event) => updateField('search', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Search sneakers"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Brand</label>
              <input
                value={filters.brand}
                onChange={(event) => updateField('brand', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Nike, Adidas..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Min price</label>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) => updateField('minPrice', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Max price</label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) => updateField('maxPrice', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="20000"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Size</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={filters.size}
                onChange={(event) => updateField('size', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="42"
              />
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[360px] animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-200/80" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
          ) : products.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold tracking-[-0.05em] text-slate-900">No products found</h2>
              <p className="mt-3 text-slate-600">Try a different search term or relax your filters.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  Showing {products.length} of {pagination.totalItems} products
                </span>
                <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(Math.max(1, filters.page - 1))}
                    disabled={filters.page <= 1}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => changePage(page)}
                      className={`rounded-full px-3 py-2 text-sm ${filters.page === page ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => changePage(Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={filters.page >= pagination.totalPages}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
