export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Laced is a sneaker ecommerce project.</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
        <p>This storefront is built as a college semester project to explore ecommerce, authentication, and web application workflows in a realistic setup.</p>
        <p>It focuses on a minimal sneaker-shopping experience with modern layout patterns, simple account flows, and a clear backend integration layer.</p>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Get in touch</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
        <p>This contact page is presented as part of the project demo.</p>
        <p>Email: project.laced@example.com</p>
        <p>Location: Demo campus project</p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Page not found</h1>
      <p className="mt-4 text-slate-600">The page you are looking for does not exist.</p>
    </div>
  );
}
