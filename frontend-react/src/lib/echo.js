/* Laravel Echo singleton — speaks the Pusher protocol against Reverb.
 *
 * One client per tab. We expose:
 *   getEcho()         lazy connect (returns the same instance every time)
 *   refreshEcho()     swap the Bearer token after login / token refresh
 *   disconnectEcho()  tear down on logout (channels + sockets + listeners)
 *   onConnectionState send 'connected'|'connecting'|'unavailable'|'disconnected'
 *                    to a subscriber callback
 *
 * Reverb uses Pusher's auto-reconnect with exponential backoff out of the box,
 * so we DON'T add a manual reconnect loop — that would race with the built-in
 * one and produce duplicate subscriptions. We only surface the connection state.
 */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echo = null;
let connectionStateListeners = new Set();

const apiBase = () => (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const buildAuthHeaders = () => {
  const token = localStorage.getItem('panda_token');
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const create = () => {
  const instance = new Echo({
    broadcaster: 'reverb',
    key:    import.meta.env.VITE_REVERB_APP_KEY || 'panda-key',
    wsHost: import.meta.env.VITE_REVERB_HOST    || '127.0.0.1',
    wsPort:   Number(import.meta.env.VITE_REVERB_PORT || 8080),
    wssPort:  Number(import.meta.env.VITE_REVERB_PORT || 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${apiBase()}/broadcasting/auth`,
    auth: { headers: buildAuthHeaders() },
  });

  // pusher-js fires `state_change` on every transition — bridge it to our subscribers
  const pusher = instance.connector?.pusher;
  if (pusher?.connection?.bind) {
    pusher.connection.bind('state_change', ({ current }) => {
      connectionStateListeners.forEach((cb) => {
        try { cb(current); } catch { /* swallow — don't crash other listeners */ }
      });
    });
  }

  return instance;
};

export function getEcho() {
  if (!echo) echo = create();
  return echo;
}

/** Swap the Bearer token without dropping subscriptions. */
export function refreshEcho() {
  if (!echo) return;
  if (echo.connector?.options) {
    echo.connector.options.auth = { headers: buildAuthHeaders() };
  }
}

/** Hard tear-down — leaves every channel, closes the socket, clears listeners. */
export function disconnectEcho() {
  if (!echo) return;
  try {
    // Leave all channels Echo is currently tracking
    const channels = echo.connector?.channels ?? {};
    Object.keys(channels).forEach((name) => {
      try { echo.leave(name); } catch { /* noop */ }
    });
    echo.disconnect();
  } catch { /* noop */ }
  echo = null;
  connectionStateListeners.clear();
}

/** Subscribe to connection-state updates. Returns an unsubscribe fn. */
export function onConnectionState(cb) {
  connectionStateListeners.add(cb);
  // emit current state immediately if we already have a socket
  const current = echo?.connector?.pusher?.connection?.state;
  if (current) {
    try { cb(current); } catch { /* noop */ }
  }
  return () => connectionStateListeners.delete(cb);
}
