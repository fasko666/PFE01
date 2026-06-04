import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, Loader2, Copy, RefreshCw, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

/**
 * 2FA settings page — flow:
 *   - status: shows enabled / pending / disabled
 *   - if disabled → button to start setup; receives secret + otpauth URI + recovery codes
 *   - if pending  → show QR + 6-digit code field to confirm
 *   - if enabled  → buttons to view recovery codes / regenerate / disable (password + code required)
 *
 * QR rendering: we use a free public QR-API as a no-deps fallback. The
 * secret is also shown so users can type it manually into any authenticator.
 */
export default function TwoFactorSettings() {
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState({ enabled: false, pending: false });
  const [setupData, setSetup]   = useState(null);            // { secret, otpauth_uri, recovery_codes }
  const [confirmCode, setCode]  = useState('');
  const [busy, setBusy]         = useState(false);
  const [recoveryCodes, setRec] = useState(null);
  const [disableForm, setDF]    = useState({ open: false, password: '', code: '' });

  const load = async () => {
    setLoading(true);
    try { setStatus((await api.twoFactor.status()).data.data); }
    catch { toast.error('Failed to load 2FA status'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const startSetup = async () => {
    setBusy(true);
    try { setSetup((await api.twoFactor.enable()).data.data); await load(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed to start setup'); }
    finally { setBusy(false); }
  };

  const confirmSetup = async (e) => {
    e?.preventDefault?.();
    setBusy(true);
    try {
      await api.twoFactor.confirm(confirmCode);
      toast.success('Two-factor authentication enabled!');
      setSetup(null); setCode('');
      await load();
    } catch (e) { toast.error(e?.response?.data?.message || 'Invalid code'); }
    finally { setBusy(false); }
  };

  const viewRecovery = async () => {
    try { setRec((await api.twoFactor.recoveryCodes()).data.data); }
    catch (e) { toast.error(e?.response?.data?.message || 'Could not load codes'); }
  };

  const regen = async () => {
    if (!confirm('Regenerate recovery codes? Old codes will stop working.')) return;
    try {
      const { data } = await api.twoFactor.regenerate();
      setRec(data.data);
      toast.success('New recovery codes generated');
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  const disable2FA = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.twoFactor.disable({ password: disableForm.password, code: disableForm.code });
      toast.success('2FA disabled');
      setDF({ open: false, password: '', code: '' });
      setRec(null);
      await load();
    } catch (e) { toast.error(e?.response?.data?.message || 'Could not disable'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>;

  const qrUrl = (otpauth) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(otpauth)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-5 h-5 text-primary-400" />
          <h1 className="text-xl font-bold font-display text-dark-50">Two-factor authentication</h1>
        </div>
        <p className="text-sm text-dark-400">Add a second step at sign-in using an authenticator app (Google Authenticator, Authy, 1Password, etc.).</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5
          ${status.enabled ? 'bg-green-500/15 border-green-500/30 text-green-300' : 'bg-dark-700/40 border-dark-600 text-dark-300'}">
          {status.enabled
            ? <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
            : <Shield className="w-3.5 h-3.5 text-dark-400" />}
          <span className="text-xs font-semibold">{status.enabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>

      {/* Setup wizard */}
      <AnimatePresence>
        {setupData && (
          <motion.form
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            onSubmit={confirmSetup}
            className="rounded-2xl border border-dark-800 bg-dark-900 p-5 space-y-4"
          >
            <h2 className="text-sm font-bold text-dark-100">1. Scan this QR with your authenticator app</h2>
            <div className="flex justify-center">
              <img src={qrUrl(setupData.otpauth_uri)} alt="QR code"
                className="w-60 h-60 rounded-xl border border-dark-700 bg-white p-2" />
            </div>
            <div className="text-2xs text-dark-500 text-center">
              Can't scan? Enter this secret manually:
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-dark-800 border border-dark-700 px-3 py-1.5 font-mono text-dark-100">
                <span>{setupData.secret.match(/.{1,4}/g)?.join(' ')}</span>
                <button type="button" onClick={() => { navigator.clipboard.writeText(setupData.secret); toast.success('Copied'); }} className="text-dark-400 hover:text-white">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <hr className="border-dark-800" />
            <h2 className="text-sm font-bold text-dark-100">2. Enter the 6-digit code shown in your app</h2>
            <input
              autoFocus inputMode="numeric" maxLength={6}
              value={confirmCode} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-3 text-center text-2xl font-mono tracking-widest text-dark-100 outline-none focus:border-primary-500/50"
            />

            <hr className="border-dark-800" />
            <h2 className="text-sm font-bold text-dark-100">3. Save these recovery codes somewhere safe</h2>
            <p className="text-2xs text-dark-500">If you lose your phone you can use one of these codes (each works once) to sign in.</p>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
              {setupData.recovery_codes.map((c, i) => (
                <div key={i} className="rounded bg-dark-800 border border-dark-700 px-2 py-1 text-dark-100">{c}</div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSetup(null)}
                className="px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 hover:bg-dark-700">Cancel</button>
              <button type="submit" disabled={busy || confirmCode.length < 6}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Enable 2FA
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Action panel */}
      {!setupData && !status.enabled && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
          <button onClick={startSetup} disabled={busy}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Set up two-factor authentication
          </button>
        </div>
      )}

      {!setupData && status.enabled && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5 space-y-3">
          <h2 className="text-sm font-bold text-dark-100">Manage 2FA</h2>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={viewRecovery}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-xs text-dark-200 hover:bg-dark-700">
              View recovery codes
            </button>
            <button onClick={regen}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-xs text-dark-200 hover:bg-dark-700">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate codes
            </button>
          </div>

          {recoveryCodes && (
            <div className="rounded-xl border border-dark-700 bg-dark-900/40 p-3">
              <div className="text-2xs text-dark-500 mb-2 uppercase tracking-wider font-semibold">Recovery codes</div>
              {recoveryCodes.length === 0 ? (
                <p className="text-2xs text-dark-400 italic">No codes available — regenerate to create new ones.</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                  {recoveryCodes.map((c, i) => (
                    <div key={i} className="rounded bg-dark-800 border border-dark-700 px-2 py-1 text-dark-100">{c}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={() => setDF({ open: true, password: '', code: '' })}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/25">
            <AlertTriangle className="w-3.5 h-3.5" /> Disable 2FA
          </button>

          {disableForm.open && (
            <form onSubmit={disable2FA} className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-2">
              <div className="text-xs font-bold text-red-200">Confirm disable</div>
              <input type="password" placeholder="Current password" required value={disableForm.password}
                onChange={(e) => setDF((s) => ({ ...s, password: e.target.value }))}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100" />
              <input inputMode="numeric" placeholder="TOTP or recovery code" required value={disableForm.code}
                onChange={(e) => setDF((s) => ({ ...s, code: e.target.value }))}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 font-mono" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setDF({ open: false, password: '', code: '' })}
                  className="px-3 py-1.5 rounded-full text-xs text-dark-300 hover:text-white">Cancel</button>
                <button type="submit" disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold disabled:opacity-40">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Disable
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
