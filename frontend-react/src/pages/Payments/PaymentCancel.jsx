import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-5"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold font-display text-dark-50">Payment cancelled</h1>
        <p className="text-sm text-dark-400 leading-relaxed">
          You cancelled the checkout before completing payment. No charges were made.
        </p>
        <Link
          to="/payments"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to wallet
        </Link>
      </motion.div>
    </div>
  );
}
