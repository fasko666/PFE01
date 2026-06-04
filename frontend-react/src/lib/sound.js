/* Tiny WebAudio "ding" — no asset file, no network, no autoplay headaches.
 * Browsers block audio until the user interacts with the page; the first
 * call will silently fail until a click/keypress unlocks AudioContext.
 */
let ctx = null;
let enabled = true;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
};

export function setSoundEnabled(v) { enabled = !!v; }
export function isSoundEnabled() { return enabled; }

export function playPing() {
  if (!enabled) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') ac.resume();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.08);
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, ac.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.18);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.2);
  } catch {
    // Hard-fail silently — audio is a nice-to-have, never block the UX
  }
}
