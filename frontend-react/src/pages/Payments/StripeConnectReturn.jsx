import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../api';

/**
 * Where Stripe sends the freelancer after Connect onboarding.
 * We immediately refresh the local snapshot of their Connect status.
 */
export default function StripeConnectReturn() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.payments.stripeConnectStatus()
      .then((res) => setStatus(res.data?.data))
      .catch(() => setStatus({ status: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const ready = status?.payouts_enabled === true;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-5"
      >
        <div className={`w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center ${
          ready ? 'bg-green-500/15 border-green-500/40' : 'bg-yellow-500/15 border-yellow-500/40'
        }`}>
          {loading
            ? <Loader2 className="w-7 h-7 text-primary-400 animate-spin" />
            : ready
              ? <CheckCircle2 className="w-8 h-8 text-green-400" />
              : <AlertCircle className="w-8 h-8 text-yellow-400" />}
        </div>
        <h1 className="text-2xl font-bold font-display text-dark-50">
          {loading ? 'Checking your account…' : ready ? 'Stripe connected' : 'Verification in progress'}
        </h1>
        <p className="text-sm text-dark-400 leading-relaxed">
          {ready
            ? 'Your Stripe account is fully verified — you can now receive instant payouts.'
            : 'Stripe is still reviewing your information. This usually takes 5-10 minutes. You\'ll be notified when payouts are enabled.'}
        </p>
        <Link
          to="/payments/withdraw"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all"
        >
          Back to withdrawals <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
