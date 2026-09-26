import { Link } from 'react-router-dom';
import { categories } from '../data/mockData';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-12">
          <div>
            <h1 className="max-w-lg text-4xl font-semibold tracking-[-0.08em] text-slate-900 sm:text-5xl">
              Everyday sneakers for the city pace.
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-600">
              Discover clean silhouettes, lightweight cushioning, and versatile pairs designed for campus life and weekend plans.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
                Shop now
              </Link>
              <Link to="/about" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                Learn more
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80"
              alt="Sneaker on a clean studio setup"
              className="h-[420px] w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-slate-900">Shop by Style</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-xl font-semibold tracking-[-0.04em] text-slate-900">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <Link to="/shop" className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-sm transition hover:bg-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.05em]">Explore the latest collection</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-300">Browse the current catalogue, filter by size, and choose a pair that fits your everyday.</p>
        </div>
        <span className="shrink-0 rounded-full bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950">Shop all sneakers</span>
      </Link>

      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3 md:p-8">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.05em] text-slate-900">Built for everyday wear.</h3>
        </div>
        <div className="text-sm text-slate-600">
          Thoughtful silhouettes, balanced comfort, and no-fuss styling for campus, weekends, and daily movement.
        </div>
        <div className="text-sm text-slate-600">
          A lightweight project storefront designed to showcase a modern sneaker ecommerce experience.
        </div>
      </section>
    </div>
  );
}
