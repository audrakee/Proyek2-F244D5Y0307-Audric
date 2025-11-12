import { getAllFavorites, deleteFavorite } from '../db.js'

export function FavoritesView() {
  const el = document.createElement('section')
  el.innerHTML = `
    <h1>Saved Offline</h1>
    <div class="grid">
      <div class="card">
        <label for="q">Search</label>
        <input id="q" type="text" placeholder="Type to filter by name or description"/>
        <div id="list" class="list" aria-live="polite" style="margin-top:.5rem"></div>
      </div>
    </div>`

  const listEl = el.querySelector('#list')
  const qEl = el.querySelector('#q')

  let items = []
  function render() {
    const q = (qEl.value || '').toLowerCase()
    const filtered = items.filter(s => (s.name||'').toLowerCase().includes(q) || (s.description||'').toLowerCase().includes(q))
    listEl.innerHTML = filtered.length ? filtered.map(s => `
      <article class="card">
        <h3>${s.name||'(unknown)'}</h3>
        <p class="muted">${new Date(s.createdAt).toLocaleString()}</p>
        <img src="${s.photoUrl}" alt="Story photo by ${s.name}" loading="lazy" style="max-width:100%;border-radius:.5rem"/>
        <p>${s.description||''}</p>
        <div class="stack">
          <a class="btn" href="#/detail/${s.id}">Open</a>
          <button class="btn danger" data-del="${s.id}">Delete</button>
        </div>
      </article>`).join('') : '<p class="muted">No saved items.</p>'
  }

  async function load() { items = await getAllFavorites(); render(); }

  el.addEventListener('input', (e) => { if (e.target.id === 'q') render() })
  el.addEventListener('click', async (e) => {
    const del = e.target.getAttribute('data-del')
    if (del) { await deleteFavorite(del); await load() }
  })

  load()
  return el
}
