import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';

const refundStatus = { 0: 'Requested', 1: 'Approved', 2: 'Rejected', 3: 'Paid' };

function statusLabel(value) {
  return refundStatus[Number(value)] || value || 'Unknown';
}

export default function AccountRefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    apiRequest('/api/refunds/my')
      .then((data) => setRefunds(data || []))
      .catch((error) => setState({ loading: false, error: error.message || 'Unable to load refunds.' }))
      .finally(() => setState((current) => ({ ...current, loading: false })));
  }, []);

  if (state.loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading refunds...</div>;
  if (state.error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{state.error}</div>;
  if (!refunds.length) return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold text-slate-900">My refunds</h1><p className="mt-3 text-sm text-slate-600">You have not submitted any refund requests.</p><Link to="/account/orders" className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm text-white">View orders</Link></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900">My refunds</h1>
      {refunds.map((refund) => (
        <div key={refund.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Order ID</p><Link to={`/account/orders/${refund.orderId}`} className="mt-2 block text-sm font-medium text-slate-900 underline">{refund.orderId}</Link></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</p><p className="mt-2 text-sm text-slate-900">{statusLabel(refund.status)}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Created</p><p className="mt-2 text-sm text-slate-900">{new Date(refund.createdAt).toLocaleString()}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Processed</p><p className="mt-2 text-sm text-slate-900">{refund.processedAt ? new Date(refund.processedAt).toLocaleString() : 'Not processed'}</p></div>
          </div>
          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reason</p><p className="mt-2 text-sm text-slate-700">{refund.reason}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Admin note</p><p className="mt-2 text-sm text-slate-700">{refund.adminNote || 'No note yet'}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}
