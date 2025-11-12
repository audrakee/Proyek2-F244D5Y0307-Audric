import { getStoryDetail } from '../api.js'
import { state } from '../state.js'
import L from 'leaflet'

export function DetailView(id) {
  const el = document.createElement('section')
  el.className = 'grid'
  el.innerHTML = `<h1>Story Details</h1><div id="wrap" class="grid"></div>`
  const wrap = el.querySelector('#wrap')

  async function load() {
    wrap.innerHTML = '<p class="muted">Memuat...</p>'
    const res = await getStoryDetail(id, state.token)
    const s = res.story
    wrap.innerHTML = `
      <article class="card grid">
        <img src="${s.photoUrl}" alt="Story photo by ${s.name}" style="width:100%; max-height:420px; object-fit:cover; border-radius:.5rem"/>
        <h2>${s.name}</h2>
        <p>${s.description}</p>
        <p class="muted">Created: ${new Date(s.createdAt).toLocaleString('id-ID')}</p>
      </article>
      <div class="card">
        <div id="map" class="map"></div>
      </div>
    `
    if (s.lat != null && s.lon != null) {
      const map = L.map(el.querySelector('#map')).setView([s.lat, s.lon], 10)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map)
      const fixSize = () => map.invalidateSize();
      requestAnimationFrame(fixSize);
      window.addEventListener('resize', fixSize);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) fixSize();
      });

      L.marker([s.lat, s.lon]).addTo(map).bindPopup('Story location').openPopup()
    } else {
      el.querySelector('#map').outerHTML = '<p class="muted">This story has no location.</p>'
    }
  }
  load()
  return el
}
