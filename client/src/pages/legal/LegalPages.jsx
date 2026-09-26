export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Terms</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Terms and conditions</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
        <p>Laced is a college semester project built for demonstration and learning purposes. It is not a real commercial ecommerce business.</p>
        <p>Account users are responsible for the information they provide and for keeping their login credentials secure.</p>
        <p>Orders, payments, and checkout flows are presented as part of the project demo and should not be treated as real commercial transactions.</p>
        <p>Users must use the site only for lawful and appropriate demo purposes. Misuse, abuse, or attempts to interfere with the application are not acceptable.</p>
        <p>Laced is provided on an as-is basis for educational use, and the project team is not responsible for real-world commercial obligations, guarantees, or liabilities.</p>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Privacy</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Privacy policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
        <p>This project exists as a university demo and is not a real company privacy policy.</p>
        <p>Laced may collect information needed to demonstrate account and order flows, including name, email address, and shipping or order details entered during the project.</p>
        <p>Data is used for educational demonstration and testing within the project environment, not for real commercial operations.</p>
        <p>We do not claim real-world legal compliance or formal data protection guarantees beyond the limits of a college project.</p>
      </div>
    </div>
  );
}
