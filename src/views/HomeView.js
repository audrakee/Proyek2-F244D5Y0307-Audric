import { getStories } from '../api.js'
import { state } from '../state.js'
import L from 'leaflet'

export function HomeView() {
  const el = document.createElement('section')
  el.className = 'grid'
  el.innerHTML = `
    <div class="hero">
      <div class="card">
        <h1>Home</h1>
        <p class="muted">A list of user stories. Click an item to highlight a marker on the map.</p>
        <div class="stack">
          <label for="filterLocation" class="sr-only">Location filter</label>
          <select id="filterLocation">
            <option value="1">Only those with locations</option>
            <option value="0">All stories</option>
          </select>
          <label for="pageSize" class="sr-only">Number per page</label>
          <select id="pageSize" title="Number of items per page">
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
      <div class="card">
        <div id="map" class="map" role="region" aria-label="Story map"></div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Story List</h2>
        <div id="list" class="list" aria-live="polite"></div>
        <div class="stack">
          <button id="prevBtn" class="btn secondary">Previous</button>
          <button id="nextBtn" class="btn">Next</button>
        </div>
      </div>
    </div>
  `

  let page = 1, size = 10, location = 1
  const list = el.querySelector('#list')
  const filterEl = el.querySelector('#filterLocation')
  const pageSize = el.querySelector('#pageSize')

  // ======== MAP (delayed init supaya ukuran pas di SPA) ========
  let map, markerLayer
  const markersById = new Map()

  function initMapAndLayers () {
    const mapEl = el.querySelector('#map')
    map = L.map(mapEl, { preferCanvas: true }).setView([-2.5489, 118.0149], 4)

    const osm   = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' })
    const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO & OpenStreetMap' })
    const hot   = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: '&copy; OSM HOT' })
    osm.addTo(map)

    L.control.layers({ 'OSM': osm, 'Carto Light': carto, 'OSM HOT': hot }).addTo(map)

    markerLayer = L.layerGroup().addTo(map)

    // perbaiki ukuran setelah tampil + saat berubah
    const fixSize = () => map.invalidateSize(true)
    requestAnimationFrame(fixSize)
    setTimeout(fixSize, 0)
    window.addEventListener('resize', fixSize)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) fixSize() })
    // kalau browser support, pantau container
    if (window.ResizeObserver) new ResizeObserver(fixSize).observe(mapEl)

    load() // muat data setelah map siap
  }
  requestAnimationFrame(initMapAndLayers)
  // =============================================================

  filterEl.value = String(location)
  pageSize.value = String(size)
  filterEl.addEventListener('change', () => { location = Number(filterEl.value); page = 1; load() })
  pageSize.addEventListener('change', () => { size = Number(pageSize.value); page = 1; load() })
  el.querySelector('#prevBtn').addEventListener('click', () => { if (page > 1) { page--; load() } })
  el.querySelector('#nextBtn').addEventListener('click', () => { page++; load() })

  function highlight(id) {
    const m = markersById.get(id)
    if (m) { m.openPopup(); map.setView(m.getLatLng(), 8, { animate: true }) }
  }
  // pasang 1x (jangan di dalam load)
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]')
    if (btn) highlight(btn.dataset.id)
  })

  async function load() {
    // kalau map belum siap, coba lagi di frame berikutnya
    if (!map || !markerLayer) return requestAnimationFrame(load)

    list.innerHTML = '<p class="muted">Loading...</p>'
    markerLayer.clearLayers()
    markersById.clear()

    try {
      const res = await getStories({ page, size, location }, state.token)
      const stories = res.listStory || []
      list.innerHTML = ''

      stories.forEach((s) => {
        const item = document.createElement('article')
        item.className = 'story'
        item.innerHTML = `
          <img src="${s.photoUrl}" alt="Story photo by ${s.name}" loading="lazy"/>
          <div>
            <h3 id="st-${s.id}">${s.name || 'Anonymous'}</h3>
            <p class="muted">${s.description || ''}</p>
            <div class="stack">
              <a class="btn" href="#/detail/${s.id}" aria-describedby="st-${s.id}">Detail</a>
              ${s.lat != null ? `<button class="btn secondary" data-id="${s.id}">See on the map</button>` : ''}
            </div>
          </div>
        `
        list.appendChild(item)

        if (s.lat != null && s.lon != null) {
          const marker = L.marker([s.lat, s.lon])
            .addTo(markerLayer)
            .bindPopup(`<strong>${s.name}</strong><br>${s.description}`)
          markersById.set(s.id, marker)
        }
      })
    } catch (e) {
      list.innerHTML = `<p class="muted">Failed to load: ${e.message}</p>`
    }
  }

  return el
}
