import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Star, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';

function FloatCard({ children, delay = 0, style, className = '' }) {
  return (
    <motion.div
      className={`absolute bg-white rounded-2xl shadow-2xl border border-dark-100/80 ${className}`}
      style={style}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.8, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero3D() {
  const containerRef = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 18 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      rawX.set((e.clientX - r.left) / r.width - 0.5);
      rawY.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => { rawX.set(0); rawY.set(0); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [rawX, rawY]);

  return (
    <div
      ref={containerRef}
      className="relative w-[420px] h-[480px] flex items-center justify-center select-none"
      style={{ perspective: '1100px' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 bg-primary-500/20 rounded-full blur-[90px]" />
      </div>

      {/* 3D scene root */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-[320px]"
      >
        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-[0_40px_80px_rgba(0,0,0,0.55)]"
          style={{ transform: 'translateZ(0px)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dark-800">
            <div className="w-8 h-8 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-400" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">AI Match Found</div>
              <div className="text-2xs text-dark-500">3 top candidates · 98% avg</div>
            </div>
            <span className="flex items-center gap-1.5 text-2xs font-semibold text-green-400 shrink-0">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>

          {/* Candidates */}
          <div className="space-y-2 mb-4">
            {[
              { name: 'Alex K.', role: 'React Developer', rate: '$95/hr', score: '99%', scoreColor: 'text-green-400' },
              { name: 'Maya R.', role: 'Node.js Expert',  rate: '$85/hr', score: '97%', scoreColor: 'text-green-400' },
              { name: 'Omar S.', role: 'UI/UX Designer',  rate: '$80/hr', score: '95%', scoreColor: 'text-yellow-400' },
            ].map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.35 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-800/70 border border-dark-700/40"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=4361ff&color=fff&size=40`}
                  className="w-8 h-8 rounded-full ring-1 ring-dark-600 shrink-0"
                  alt={c.name}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white leading-tight">{c.name}</div>
                  <div className="text-2xs text-dark-500">{c.role} · {c.rate}</div>
                </div>
                <div className={`text-xs font-bold ${c.scoreColor} shrink-0`}>{c.score}</div>
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-2xs text-dark-600 mb-1.5">
              <span>Match quality</span>
              <span>98%</span>
            </div>
            <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '98%' }}
                transition={{ delay: 0.6, duration: 0.9, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              />
            </div>
          </div>

          <button className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-colors tracking-wide">
            Invite Top Candidates
          </button>
        </motion.div>

        {/* ── Floating card: 5★ Review (top-left, closest depth) ── */}
        <FloatCard
          delay={0}
          className="px-3 py-2.5 w-36"
          style={{ top: '-32px', left: '-44px', transform: 'translateZ(52px)' }}
        >
          <div className="flex gap-0.5 mb-1">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <div className="text-2xs font-bold text-dark-100 leading-tight">5★ Review</div>
          <div className="text-2xs text-dark-500">Excellent work!</div>
        </FloatCard>

        {/* ── Floating card: New Proposal (top-right, mid depth) ── */}
        <FloatCard
          delay={1.3}
          className="px-3 py-2.5 w-44"
          style={{ top: '-24px', right: '-52px', transform: 'translateZ(38px)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xs font-bold text-dark-100">New Proposal</div>
              <div className="text-2xs text-dark-500">Senior dev applied</div>
            </div>
          </div>
        </FloatCard>

        {/* ── Floating card: Escrow (bottom-left, shallow depth) ── */}
        <FloatCard
          delay={2.1}
          className="px-3 py-2.5 w-40"
          style={{ bottom: '-28px', left: '-40px', transform: 'translateZ(28px)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xs font-bold text-dark-100">$2,400 Safe</div>
              <div className="text-2xs text-dark-500">Escrow protected</div>
            </div>
          </div>
        </FloatCard>

        {/* ── Floating card: Project done (bottom-right, far depth) ── */}
        <FloatCard
          delay={0.7}
          className="px-3 py-2.5 w-38"
          style={{ bottom: '-20px', right: '-44px', transform: 'translateZ(18px)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xs font-bold text-dark-100">Milestone Done</div>
              <div className="text-2xs text-dark-500">Payment released</div>
            </div>
          </div>
        </FloatCard>
      </motion.div>
    </div>
  );
}
