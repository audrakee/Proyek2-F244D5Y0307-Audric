import 'leaflet/dist/leaflet.css'
import { initRouter, navigate } from './router.js'
import { state, restoreSession, logout } from './state.js'
import { subscribePush, unsubscribePush, getPushStatus } from './push.js'

const menuBtn = document.getElementById('menuBtn')
const menu = document.getElementById('mainMenu')
menuBtn.addEventListener('click', () => {
  const expanded = menuBtn.getAttribute('aria-expanded') === 'true'
  menuBtn.setAttribute('aria-expanded', String(!expanded))
  menu.classList.toggle('show')
})

function updateAuthUI() {
  document.querySelectorAll('.auth-only').forEach(el => el.style.display = state.token ? 'block' : 'none')
  document.querySelectorAll('.guest-only').forEach(el => el.style.display = state.token ? 'none' : 'block')
  updatePushButton()
}

// --- PWA install prompt ---
let deferredInstallPrompt = null
const installBtn = document.getElementById('installBtn')
if (installBtn) installBtn.style.display = 'none'

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredInstallPrompt = e
  if (installBtn) installBtn.style.display = 'inline-block'
})
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null
  if (installBtn) installBtn.style.display = 'none'
})
document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'installBtn' && deferredInstallPrompt) {
    deferredInstallPrompt.prompt()
    await deferredInstallPrompt.userChoice
    deferredInstallPrompt = null
    if (installBtn) installBtn.style.display = 'none'
  }
})

// --- Push toggle UI ---
async function updatePushButton() {
  const btn = document.getElementById('subscribeBtn')
  if (!btn) return
  try {
    const active = await getPushStatus()
    btn.textContent = active ? 'Turn off Notification' : 'Turn on Notification'
    btn.setAttribute('aria-pressed', String(active))
    btn.disabled = !state.token
  } catch (e) {
    btn.textContent = 'Notification unsupported'
    btn.disabled = true
  }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) updatePushButton() })

async function registerSW() {
  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register('./sw.js')
  }
}

document.addEventListener('click', (e) => {
  const id = e.target.id
  if (id === 'logoutBtn') {
    logout()
    updateAuthUI()
    navigate('/login')
  }
  if (id === 'subscribeBtn') {
    getPushStatus()
      .then(active => active ? unsubscribePush() : subscribePush())
      .then(updatePushButton)
      .catch(err => alert('Gagal mengatur notifikasi: ' + err.message))
  }
})

restoreSession()
updateAuthUI()
registerSW()
initRouter(updateAuthUI)
updatePushButton()
