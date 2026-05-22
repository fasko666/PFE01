import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, MessageSquare, Star, TrendingUp, Zap } from 'lucide-react';

/* Floating chip that bobs up/down */
function Chip({ children, style, delay = 0, className = '' }) {
  return (
    <motion.div
      className={`absolute bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-3 py-2 ${className}`}
      style={style}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/* Spinning ring */
function Ring({ size, opacity, duration, clockwise = true, className = '' }) {
  return (
    <motion.div
      className={`absolute rounded-full border border-white/10 ${className}`}
      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      animate={{ rotate: clockwise ? 360 : -360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* Pulsing dot */
function Dot({ style, delay = 0, color = 'bg-white/40' }) {
  return (
    <motion.span
      className={`absolute w-1.5 h-1.5 rounded-full ${color}`}
      style={style}
      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2.5, delay, repeat: Infinity }}
    />
  );
}

const FEATURES = [
  { icon: Sparkles,      title: 'AI-Powered Matching', desc: 'Instantly surface the right talent' },
  { icon: Shield,        title: 'Escrow Protection',   desc: 'Every payment fully secured' },
  { icon: MessageSquare, title: 'Real-time Chat',      desc: 'Collaborate without friction' },
];

export default function AuthScene3D() {
  const containerRef = useRef(null);

  return (
    <div className="relative w-full h-full flex flex-col justify-center p-12 overflow-hidden">

      {/* ── Orbital rings (3D depth effect) ── */}
      <div className="absolute top-1/2 left-1/2 pointer-events-none" style={{ transform: 'rotateX(60deg)' }}>
        <Ring size={320} duration={18} clockwise className="left-1/2 top-1/2" />
        <Ring size={480} duration={28} clockwise={false} className="left-1/2 top-1/2" />
        <Ring size={640} duration={40} clockwise className="left-1/2 top-1/2" />
      </div>

      {/* ── Floating ambient dots ── */}
      {[
        { top: '15%', left: '20%', delay: 0    },
        { top: '35%', left: '80%', delay: 0.8  },
        { top: '65%', left: '10%', delay: 1.6  },
        { top: '80%', left: '70%', delay: 2.4  },
        { top: '50%', left: '50%', delay: 3.2  },
      ].map((d, i) => (
        <Dot key={i} style={{ top: d.top, left: d.left }} delay={d.delay} />
      ))}

      {/* ── Floating stat chips ── */}
      <Chip delay={0}   style={{ top: '8%',  right: '5%'  }}>
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">4.9 ★ avg rating</span>
        </div>
      </Chip>

      <Chip delay={1.5} style={{ top: '22%', left: '0%'   }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-bold text-white">$2B+ paid out</span>
        </div>
      </Chip>

      <Chip delay={0.8} style={{ bottom: '20%', right: '2%' }}>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-xs font-bold text-white">AI matched in &lt;1s</span>
        </div>
      </Chip>

      <Chip delay={2.2} style={{ bottom: '8%', left: '5%' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
          <span className="text-xs font-bold text-white">500K+ freelancers online</span>
        </div>
      </Chip>

      {/* ── Main content ── */}
      <div className="relative z-10 space-y-8">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='black'/%3E%3Ccircle cx='14' cy='15' r='4' fill='white'/%3E%3Ccircle cx='26' cy='15' r='4' fill='white'/%3E%3Cellipse cx='20' cy='26' rx='7' ry='4' fill='white'/%3E%3C/svg%3E"
              className="w-9 h-9"
              alt="PANDA"
            />
          </div>
          <div>
            <p className="font-black font-display text-white text-2xl tracking-widest uppercase leading-none">PANDA</p>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Freelance Platform</p>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold font-display text-white leading-tight">
            The future of<br />
            <span className="text-white/50">freelancing</span> is here
          </h2>
          <p className="text-white/40 text-sm mt-3 max-w-xs leading-relaxed">
            Join thousands of top professionals on the AI-powered platform that connects talent with opportunity.
          </p>
        </motion.div>

        {/* Feature cards with 3D hover */}
        <div className="space-y-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-default"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white/70" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">{f.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 flex-wrap"
        >
          {['SOC 2 Certified', 'GDPR Compliant', '99.9% Uptime'].map((badge) => (
            <span key={badge} className="flex items-center gap-1.5 text-2xs font-medium text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
