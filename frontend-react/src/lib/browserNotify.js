/* Browser notifications (system tray) + tab-title badge flasher.
 *
 *  - notify(title, body, onClick) — only fires when the tab is HIDDEN; if the
 *    user is looking, the in-app toast/UI handles it instead.
 *  - flashTitle(text) — animates the document.title until the tab regains
 *    focus, then restores the original title.
 *  - bumpFavicon(count) — overlays a red dot with the unread count on the
 *    favicon (canvas-rendered, no asset round-trip).
 */
let originalTitle = typeof document !== 'undefined' ? document.title : '';
let flashTimer = null;
let originalFavicon = null;

const ensureFavicon = () => {
  if (typeof document === 'undefined') return null;
  if (originalFavicon) return originalFavicon;
  const link = document.querySelector('link[rel~="icon"]');
  originalFavicon = link?.href ?? null;
  return link;
};

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted' || Notification.permission === 'denied') return Notification.permission;
  try { return await Notification.requestPermission(); } catch { return 'denied'; }
}

export function notify(title, body, onClick) {
  if (typeof document === 'undefined') return;
  if (document.visibilityState === 'visible') return; // user is here — don't double-notify
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, { body, silent: true });
    if (onClick) n.onclick = () => { window.focus(); try { onClick(); } catch { /* noop */ } n.close(); };
    setTimeout(() => { try { n.close(); } catch { /* noop */ } }, 6000);
  } catch { /* noop */ }
}

/** Replace document.title with `text` and pulse it until the tab is focused. */
export function flashTitle(text) {
  if (typeof document === 'undefined') return;
  if (document.visibilityState === 'visible') return;
  if (flashTimer) return; // already flashing — don't stack
  const original = originalTitle || document.title;
  let toggle = false;
  flashTimer = setInterval(() => {
    document.title = toggle ? original : text;
    toggle = !toggle;
  }, 900);
  const stop = () => {
    if (!flashTimer) return;
    clearInterval(flashTimer);
    flashTimer = null;
    document.title = original;
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', stop);
  };
  const onVisible = () => { if (document.visibilityState === 'visible') stop(); };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', stop);
}

/** Overlay a numeric badge on the favicon. count=0 restores the original. */
export function bumpFavicon(count) {
  if (typeof document === 'undefined') return;
  const link = ensureFavicon();
  if (!link) return;
  if (!count || count < 1) {
    if (originalFavicon) link.href = originalFavicon;
    return;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 32, 32);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(22, 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(count > 9 ? '9+' : String(count), 22, 11);
      link.href = canvas.toDataURL('image/png');
    };
    img.onerror = () => { /* CORS-blocked favicon — skip the overlay */ };
    img.src = originalFavicon || link.href;
  } catch { /* noop */ }
}
