import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Loader2, Upload, CheckCircle2, AlertTriangle, X, Clock } from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { id: 'national_id',     label: 'National ID' },
  { id: 'passport',        label: 'Passport' },
  { id: 'driving_license', label: 'Driving license' },
];

const STATUS_UI = {
  not_submitted: { Icon: ShieldAlert,   cls: 'bg-dark-700/40 border-dark-600 text-dark-200',     label: 'Not submitted' },
  pending:       { Icon: Clock,         cls: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300', label: 'Pending review' },
  in_review:     { Icon: Loader2,       cls: 'bg-blue-500/15 border-blue-500/30 text-blue-300',       label: 'In review' },
  approved:      { Icon: CheckCircle2,  cls: 'bg-green-500/15 border-green-500/30 text-green-300',    label: 'Verified' },
  rejected:      { Icon: X,             cls: 'bg-red-500/15 border-red-500/30 text-red-300',          label: 'Rejected' },
};

export default function IdentityVerification() {
  const [status, setStatus]     = useState({ status: 'not_submitted' });
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [docType, setDocType]   = useState('national_id');
  const [country, setCountry]   = useState('');
  const [docNum,  setDocNum]    = useState('');
  const [errors,  setErrors]    = useState({});
  const frontRef  = useRef();
  const backRef   = useRef();
  const selfieRef = useRef();
  const [front,  setFront]  = useState(null);
  const [back,   setBack]   = useState(null);
  const [selfie, setSelfie] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.kyc.status(); setStatus(data.data); }
    catch { /* swallow */ }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setBusy(true);
    try {
      const fd = new FormData();
      fd.append('document_type', docType);
      fd.append('country', country.toUpperCase());
      if (docNum) fd.append('document_number', docNum);
      if (front)  fd.append('id_front', front);
      if (back)   fd.append('id_back', back);
      if (selfie) fd.append('selfie', selfie);
      await api.kyc.submit(fd);
      toast.success('Submitted for review');
      await load();
    } catch (err) {
      setErrors(err?.response?.data?.errors || {});
      toast.error(err?.response?.data?.message || 'Submission failed');
    } finally { setBusy(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>;

  const curStatus = STATUS_UI[status.status] || STATUS_UI.not_submitted;
  const Icon = curStatus.Icon;

  const showForm = ['not_submitted', 'rejected'].includes(status.status);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="w-5 h-5 text-primary-400" />
          <h1 className="text-xl font-bold font-display text-dark-50">Identity verification</h1>
        </div>
        <p className="text-sm text-dark-400">Verify your identity to unlock larger withdrawals and the "Verified" badge.</p>

        <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${curStatus.cls}`}>
          <Icon className={`w-3.5 h-3.5 ${status.status === 'in_review' ? 'animate-spin' : ''}`} />
          <span className="text-xs font-semibold">{curStatus.label}</span>
        </div>

        {status.status === 'rejected' && status.rejection_reason && (
          <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-300 mt-0.5 shrink-0" />
            <div className="text-2xs text-red-200">
              <div className="font-semibold text-red-100">Submission rejected</div>
              <div className="mt-0.5 whitespace-pre-wrap">{status.rejection_reason}</div>
            </div>
          </motion.div>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="rounded-2xl border border-dark-800 bg-dark-900 p-5 space-y-4">
          <h2 className="text-sm font-bold text-dark-100">Submit your documents</h2>

          <Field label="Document type" error={errors.document_type?.[0]}>
            <select value={docType} onChange={e => setDocType(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 outline-none focus:border-primary-500/50">
              {DOC_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Country (2-letter)" error={errors.country?.[0]}>
              <input value={country} onChange={e => setCountry(e.target.value)} maxLength={2}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 outline-none focus:border-primary-500/50 uppercase" />
            </Field>
            <Field label="Document number (optional)">
              <input value={docNum} onChange={e => setDocNum(e.target.value)} maxLength={120}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 outline-none focus:border-primary-500/50" />
            </Field>
          </div>

          <FileField label="Front of ID" file={front} onPick={setFront} inputRef={frontRef} error={errors.id_front?.[0]} required />
          {docType !== 'passport' && (
            <FileField label="Back of ID" file={back} onPick={setBack} inputRef={backRef} error={errors.id_back?.[0]} />
          )}
          <FileField label="Selfie holding the ID" file={selfie} onPick={setSelfie} inputRef={selfieRef} error={errors.selfie?.[0]} required />

          <button type="submit" disabled={busy || !front || !selfie || !country}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold disabled:opacity-40 transition-colors">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Submit for review
          </button>
          <p className="text-2xs text-dark-500 text-center">Files: JPG / PNG / WebP, max 8 MB each. Documents are encrypted at rest and visible only to verification staff.</p>
        </form>
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

function FileField({ label, file, onPick, inputRef, error, required }) {
  return (
    <Field label={label + (required ? ' *' : '')} error={error}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-xs text-dark-200 hover:bg-dark-700">
          <Upload className="w-3.5 h-3.5" /> {file ? 'Change' : 'Choose file'}
        </button>
        <span className="text-2xs text-dark-400 truncate flex-1">{file?.name || 'No file chosen'}</span>
        {file && <button type="button" onClick={() => onPick(null)} className="text-dark-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => onPick(e.target.files?.[0] || null)} />
      </div>
    </Field>
  );
}
