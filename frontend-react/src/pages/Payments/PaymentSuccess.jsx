import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../api';

/**
 * Stripe Checkout success landing page.
 * The actual wallet credit happens via the webhook (server-side), so we
 * just confirm + refresh the wallet on the client.
 */
export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionId = params.get('session_id');

  useEffect(() => {
    let mounted = true;
    // Give the webhook ~2s to fire then refresh the wallet
    const t = setTimeout(async () => {
      try {
        const w = await api.payments.wallet();
        if (mounted) setWallet(w.data?.data);
      } catch {}
      if (mounted) setLoading(false);
    }, 2000);
    return () => { mounted = false; clearTimeout(t); };
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-5"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/15 border border-green-500/40 flex items-center justify-center">
          {loading
            ? <Loader2 className="w-7 h-7 text-green-400 animate-spin" />
            : <CheckCircle2 className="w-8 h-8 text-green-400" />}
        </div>
        <h1 className="text-2xl font-bold font-display text-dark-50">
          {loading ? 'Processing payment…' : 'Payment successful'}
        </h1>
        <p className="text-sm text-dark-400 leading-relaxed">
          {loading
            ? 'We\'re confirming your deposit with Stripe. This usually takes a few seconds.'
            : 'Your funds have been added to your wallet. You can use them to fund escrows for contracts.'}
        </p>
        {!loading && wallet && (
          <div className="inline-block px-5 py-3 rounded-xl bg-dark-900 border border-dark-800">
            <div className="text-2xs text-dark-500 uppercase tracking-wider">New balance</div>
            <div className="text-xl font-bold font-display text-dark-50">
              ${Number(wallet.balance || 0).toFixed(2)}
            </div>
          </div>
        )}
        {sessionId && (
          <div className="text-2xs text-dark-600 font-mono">Session: {sessionId.slice(0, 24)}…</div>
        )}
        <Link
          to="/payments"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all"
        >
          View wallet <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
