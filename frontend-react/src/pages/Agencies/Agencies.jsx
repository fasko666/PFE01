import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Rocket, Sparkles, Building2 } from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const TARGET = new Date('2026-09-01T00:00:00');

function getTimeLeft() {
  const diff = TARGET - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  };
}

function Digit({ value, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-dark-900 border border-dark-700/80 flex items-center justify-center shadow-lg overflow-hidden">
        {/* shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
        <span className="relative text-3xl md:text-4xl font-bold font-display text-dark-50 tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs text-dark-500 uppercase tracking-widest font-semibold">{label}</span>
    </motion.div>
  );
}

export default function Agencies() {
  const [time, setTime]       = useState(getTimeLeft());
  const [email, setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleNotify = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4 py-24 relative overflow-x-hidden">

      {/* background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-500/8 blur-3xl" />
        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgb(var(--c-dark-300)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-dark-300)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-24 left-6 md:left-10"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">

        {/* logo + badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Enterprise & Agencies
          </div>
        </motion.div>

        {/* heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold font-display text-dark-50 leading-tight mb-4"
        >
          Something big is{' '}
          <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            coming
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-dark-400 text-lg mb-12 max-w-lg"
        >
          We're building a powerful enterprise solution for agencies and teams.
          Be the first to know when we launch.
        </motion.p>

        {/* countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-end gap-4 md:gap-6 mb-12"
        >
          <Digit value={time.days}    label="Days"    />
          <span className="text-3xl font-bold text-dark-600 mb-8">:</span>
          <Digit value={time.hours}   label="Hours"   />
          <span className="text-3xl font-bold text-dark-600 mb-8">:</span>
          <Digit value={time.minutes} label="Minutes" />
          <span className="text-3xl font-bold text-dark-600 mb-8">:</span>
          <Digit value={time.seconds} label="Seconds" />
        </motion.div>

        {/* notify form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-md"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400"
            >
              <Rocket className="w-5 h-5 shrink-0" />
              <span className="font-semibold">You're on the list! We'll notify you at launch.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-dark-900 border border-dark-700 text-dark-100 placeholder:text-dark-500 text-sm outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <Bell className="w-4 h-4" />
                Notify me
              </button>
            </form>
          )}
        </motion.div>

        {/* features teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
        >
          {[
            { icon: '🏢', title: 'Team Workspaces', desc: 'Collaborate with your whole agency in one place' },
            { icon: '📊', title: 'Advanced Analytics', desc: 'Deep insights into your team performance' },
            { icon: '🔒', title: 'Priority Support', desc: 'Dedicated account manager and SLA guarantees' },
          ].map((f) => (
            <div
              key={f.title}
              className="p-4 rounded-2xl bg-dark-900/60 border border-dark-800 text-left backdrop-blur-sm"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm font-bold text-dark-100 mb-1">{f.title}</div>
              <div className="text-xs text-dark-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* logo watermark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex items-center gap-2 text-dark-600 text-sm"
        >
          <PandaLogo className="w-5 h-5" invert />
          <span>PANDA Enterprise — Coming September 2026</span>
        </motion.div>
      </div>
    </div>
  );
}
