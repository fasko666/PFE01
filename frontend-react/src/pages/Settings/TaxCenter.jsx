import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, FileText, CheckCircle2, AlertTriangle, Clock, X, Printer } from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const FORM_LABELS = { w9: 'W-9 (US)', w8ben: 'W-8BEN (non-US)', vat: 'VAT (EU)' };
const STATUS_COLOR = {
  draft:    'bg-dark-700/40 border-dark-600 text-dark-300',
  submitted:'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  approved: 'bg-green-500/15 border-green-500/30 text-green-300',
  rejected: 'bg-red-500/15 border-red-500/30 text-red-300',
};
const STATUS_ICON = { draft: Clock, submitted: Clock, approved: CheckCircle2, rejected: X };

export default function TaxCenter() {
  const [rows, setRows] = useState([]);
  const [loading, setL] = useState(true);
  const [showForm, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [d, setD] = useState({
    form_type: 'w9', country: 'US', legal_name: '', tax_id: '',
    address_line1: '', address_line2: '', city: '', state_region: '', postal_code: '',
  });

  const load = async () => {
    setL(true);
    try { setRows((await api.taxDocs.list()).data.data); }
    catch { toast.error('Failed to load tax documents'); }
    finally { setL(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setBusy(true);
    try {
      await api.taxDocs.create(d); setShow(false);
      setD({ form_type: 'w9', country: 'US', legal_name: '', tax_id: '', address_line1: '', address_line2: '', city: '', state_region: '', postal_code: '' });
      toast.success('Submitted for review'); load();
    } catch (e) {
      setErrors(e?.response?.data?.errors || {});
      toast.error(e?.response?.data?.message || 'Submission failed');
    } finally { setBusy(false); }
  };

  const openPdf = async (docId) => {
    try {
      const res = await fetch(api.taxDocs.pdfUrl(docId), {
        headers: { Authorization: `Bearer ${localStorage.getItem('panda_token')||''}` },
      });
      const html = await res.text();
      const w = window.open(); w.document.open(); w.document.write(html); w.document.close();
    } catch { toast.error('Could not open PDF'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <div className="flex items-center gap-3 mb-1">
          <Receipt className="w-5 h-5 text-primary-400" />
          <h1 className="text-xl font-bold font-display text-dark-50">Tax center</h1>
        </div>
        <p className="text-sm text-dark-400">Submit tax documents required for withdrawals above local thresholds.</p>
        <button onClick={() => setShow(s => !s)} className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold">
          {showForm ? 'Cancel' : 'Submit a new form'}
        </button>
      </div>

      {showForm && (
        <motion.form onSubmit={submit} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
          className="rounded-2xl border border-dark-800 bg-dark-900 p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Form type" error={errors.form_type?.[0]}>
              <select value={d.form_type} onChange={e => setD({...d, form_type: e.target.value})}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100">
                {Object.entries(FORM_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </Field>
            <Field label="Country (2-letter)" error={errors.country?.[0]}>
              <input maxLength={2} value={d.country} onChange={e => setD({...d, country: e.target.value.toUpperCase()})}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 uppercase" />
            </Field>
          </div>
          <Field label="Legal name" error={errors.legal_name?.[0]}>
            <input value={d.legal_name} onChange={e => setD({...d, legal_name: e.target.value})}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100" />
          </Field>
          <Field label="Tax ID" error={errors.tax_id?.[0]}>
            <input value={d.tax_id} onChange={e => setD({...d, tax_id: e.target.value})}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100" />
            <p className="text-2xs text-dark-500 mt-1">Only the last 4 digits are persisted at rest.</p>
          </Field>
          <Field label="Address line 1" error={errors.address_line1?.[0]}>
            <input value={d.address_line1} onChange={e => setD({...d, address_line1: e.target.value})}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100" />
          </Field>
          <Field label="Address line 2 (optional)">
            <input value={d.address_line2} onChange={e => setD({...d, address_line2: e.target.value})}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" error={errors.city?.[0]}>
              <input value={d.city} onChange={e => setD({...d, city: e.target.value})}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100" />
            </Field>
            <Field label="State/Region">
              <input value={d.state_region} onChange={e => setD({...d, state_region: e.target.value})}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100" />
            </Field>
            <Field label="Postal code" error={errors.postal_code?.[0]}>
              <input value={d.postal_code} onChange={e => setD({...d, postal_code: e.target.value})}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100" />
            </Field>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={busy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} Submit
            </button>
          </div>
        </motion.form>
      )}

      {/* Existing docs */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-dark-500 italic text-center py-8">No tax documents yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(d => {
            const Icon = STATUS_ICON[d.status] || Clock;
            return (
              <li key={d.id} className="rounded-2xl border border-dark-800 bg-dark-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-dark-100">{FORM_LABELS[d.form_type] || d.form_type}</div>
                    <div className="text-2xs text-dark-500 mt-0.5">{d.country} · {d.legal_name} · {d.tax_id_last4}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-1 rounded-full border ${STATUS_COLOR[d.status]}`}>
                    <Icon className="w-3 h-3" /> {d.status}
                  </span>
                </div>
                {d.status === 'rejected' && d.rejection_reason && (
                  <div className="mt-2 text-2xs text-red-300 border-l-2 border-red-500/30 pl-2 italic">{d.rejection_reason}</div>
                )}
                {d.status === 'approved' && (
                  <button onClick={() => openPdf(d.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-primary-400 hover:underline">
                    <Printer className="w-3 h-3" /> Download PDF
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <div className="text-2xs text-dark-500 font-semibold uppercase tracking-wider mb-1">{label}</div>
      {children}
      {error && <p className="text-2xs text-red-400 mt-1">{error}</p>}
    </label>
  );
}
