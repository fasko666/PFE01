/* Web Push helper — registers the SW, subscribes via VAPID, posts to backend.
 * Called from Settings → Notifications page. Browsers will prompt the user
 * for permission on the first call.
 */
import { api } from '../api';

const urlBase64ToUint8Array = (b64) => {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4);
  const base64  = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export async function isPushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function subscribeToPush() {
  if (!(await isPushSupported())) throw new Error('Push not supported in this browser');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permission denied');

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const { data } = await api.push.vapidPublicKey();
  const key = data?.public_key;
  if (!key) throw new Error('Server is missing VAPID_PUBLIC_KEY — push not configured');

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });

  await api.push.subscribe({
    endpoint: sub.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
      auth:   btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
    },
  });
  return sub;
}

export async function unsubscribeFromPush() {
  if (!(await isPushSupported())) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager?.getSubscription();
  if (!sub) return;
  await api.push.unsubscribe(sub.endpoint);
  await sub.unsubscribe();
}
