import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const statuses = ['Requested', 'Approved', 'Rejected', 'Paid'];
const label = (value) => statuses[Number(value)] || value || 'Unknown';

export default function AdminRefundsPage() {
  const { showToast } = useToast();
  const [refunds, setRefunds] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [savingId, setSavingId] = useState('');
  const [notes, setNotes] = useState({});

  const loadRefunds = async () => {
    try {
      setState({ loading: true, error: '' });
      const result = await apiRequest('/api/admin/refunds') || [];
      setRefunds(result);
      setNotes(Object.fromEntries(result.map((refund) => [refund.id, refund.adminNote || ''])));
    } catch (error) { setState({ loading: false, error: error.message || 'Unable to load refunds.' }); } finally { setState((current) => ({ ...current, loading: false })); }
  };
  useEffect(() => { loadRefunds(); }, []);

  const updateStatus = async (refund, status) => {
    setSavingId(refund.id);
    try { await apiRequest(`/api/admin/refunds/${refund.id}/status`, { method: 'PUT', body: { status, adminNote: notes[refund.id] || null } }); showToast('Refund status updated.', 'success'); await loadRefunds(); } catch (error) { showToast(error.message || 'Unable to update refund.', 'error'); } finally { setSavingId(''); }
  };

  if (state.loading) return <p className="text-sm text-slate-500">Loading refunds...</p>;
  if (state.error) return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{state.error}</p>;
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-2xl font-semibold text-slate-900">Refund requests</h2>{refunds.length === 0 ? <p className="mt-4 text-sm text-slate-600">No refund requests found.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-3 py-3">Order</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Reason</th><th className="px-3 py-3">Payment info</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Created</th><th className="px-3 py-3">Admin action</th></tr></thead><tbody>{refunds.map((refund) => <tr key={refund.id} className="border-b border-slate-100 align-top"><td className="px-3 py-3"><Link to={`/admin/refunds/${refund.id}`} className="underline">{refund.orderId}</Link></td><td className="px-3 py-3">{refund.customerName || 'Unknown'}<br />{refund.customerEmail}</td><td className="max-w-xs whitespace-normal px-3 py-3">{refund.reason}</td><td className="max-w-xs whitespace-normal px-3 py-3">{refund.paymentInfo}</td><td className="px-3 py-3">{label(refund.status)}</td><td className="px-3 py-3">{new Date(refund.createdAt).toLocaleDateString()}</td><td className="px-3 py-3"><select value={label(refund.status)} disabled={savingId === refund.id} onChange={(event) => updateStatus(refund, event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1"><option value={label(refund.status)}>{label(refund.status)}</option>{statuses.filter((status) => status !== label(refund.status)).map((status) => <option key={status}>{status}</option>)}</select><textarea value={notes[refund.id] || ''} onChange={(event) => setNotes({ ...notes, [refund.id]: event.target.value })} placeholder="Admin note" rows="2" className="mt-2 w-40 rounded-lg border border-slate-200 px-2 py-1 text-xs" /></td></tr>)}</tbody></table></div>}</div>;
}
