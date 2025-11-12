import { state } from './state.js'
import { subscribeNotif, unsubscribeNotif } from './api.js'

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'

async function getSW() {
  if (!('serviceWorker' in navigator)) throw new Error('Service worker tidak didukung browser.')
  return await navigator.serviceWorker.ready
}

async function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const outputArray = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) outputArray[i] = raw.charCodeAt(i)
  return outputArray
}

export async function subscribePush() {
  if (!state.token) throw new Error('Masuk terlebih dulu.')
  const reg = await getSW()
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: await urlB64ToUint8Array(VAPID_PUBLIC_KEY)
  })
  const json = sub.toJSON()
  const res = await subscribeNotif({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }, state.token)
  alert(res.message || 'Berhasil mengaktifkan notifikasi.')
  return res
}

export async function unsubscribePush() {
  if (!state.token) throw new Error('Masuk terlebih dulu.')
  const reg = await getSW()
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    const json = sub.toJSON()
    await unsubscribeNotif({ endpoint: json.endpoint }, state.token)
    await sub.unsubscribe()
    alert('Berhasil menonaktifkan notifikasi.')
  }
}


export async function getPushStatus() {
  if (!('serviceWorker' in navigator)) return false
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  return !!sub
}
