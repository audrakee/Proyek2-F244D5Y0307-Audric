import { LoginView } from './views/LoginView.js'
import { RegisterView } from './views/RegisterView.js'
import { HomeView } from './views/HomeView.js'
import { AddView } from './views/AddView.js'
import { DetailView } from './views/DetailView.js'
import { AboutView } from './views/AboutView.js'
import { FavoritesView } from './views/FavoritesView.js'
import { state } from './state.js'

const routes = [
  { path: /^#\/?$/, view: () => LoginView(), title: 'Masuk · StoryMap' },
  { path: /^#\/home\/?$/, view: () => HomeView(), title: 'Beranda · StoryMap' },
  { path: /^#\/login\/?$/, view: () => LoginView(), title: 'Masuk · StoryMap' },
  { path: /^#\/register\/?$/, view: () => RegisterView(), title: 'Daftar · StoryMap' },
  { path: /^#\/add\/?$/, view: () => state.token ? AddView() : LoginView(), title: 'Tambah Cerita · StoryMap' },
  { path: /^#\/detail\/(.+)\/?$/, view: (id) => DetailView(id), title: 'Detail Cerita · StoryMap' },
  { path: /^#\/about\/?$/, view: () => AboutView(), title: 'Tentang · StoryMap' },
  { path: /^#\/favorites\/?$/, view: () => FavoritesView(), title: 'Favorit · StoryMap' },
]

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : '#' + path.replace(/^\//,'')
}

function render(view) {
  const outlet = document.getElementById('content')
  const go = () => { outlet.innerHTML = ''; outlet.appendChild(view) }
  if (document.startViewTransition) document.startViewTransition(go)
  else go()
  document.getElementById('content').focus()
}

export function initRouter(onRouteChange) {
  const handle = () => {
    const hash = window.location.hash || '#/login'
    for (const r of routes) {
      const match = hash.match(r.path)
      if (match) {
        const params = match.slice(1)
        render(r.view(...params))
        document.title = r.title || 'StoryMap'
        onRouteChange?.()
        return
      }
    }
    render(LoginView())
    document.title = 'Masuk · StoryMap'
    onRouteChange?.()
  }
  window.addEventListener('hashchange', handle)
  handle()
}
