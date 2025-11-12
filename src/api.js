const API_BASE = 'https://story-api.dicoding.dev/v1'

function getHeaders(token) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function register({ name, email, password }) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  return res.json()
}

// export async function login({ email, password }) {
//   const res = await fetch(`${API_BASE}/login`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password }),
//   })
//   return res.json()
// }
export async function login({ email, password }) {
  const res = await fetch(`https://story-api.dicoding.dev/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  // Tangani non-2xx -> baca pesan dari body
  let data;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    const msg = data?.message || `Login gagal (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return data; // { error:false, loginResult:{ userId, name, token } }
}

export async function getStories({ page=1, size=10, location=1 } = {}, token) {
  const url = new URL(`${API_BASE}/stories`)
  url.searchParams.set('page', page)
  url.searchParams.set('size', size)
  url.searchParams.set('location', location)
  const res = await fetch(url, { headers: getHeaders(token) })
  return res.json()
}

export async function getStoryDetail(id, token) {
  const res = await fetch(`${API_BASE}/stories/${id}`, { headers: getHeaders(token) })
  return res.json()
}

export async function addStory({ description, photo, lat, lon }, token) {
  const fd = new FormData()
  fd.append('description', description)
  fd.append('photo', photo)
  if (lat != null) fd.append('lat', lat)
  if (lon != null) fd.append('lon', lon)

  const url = token ? `${API_BASE}/stories` : `${API_BASE}/stories/guest`
  const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined

  const res = await fetch(url, { method:'POST', headers, body: fd })
  return res.json()
}

export async function subscribeNotif({ endpoint, p256dh, auth }, token) {
  const res = await fetch(`${API_BASE}/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ endpoint, keys: { p256dh, auth } })
  })
  return res.json()
}

export async function unsubscribeNotif({ endpoint }, token) {
  const res = await fetch(`${API_BASE}/notifications/subscribe`, {
    method: 'DELETE',
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ endpoint })
  })
  return res.json()
}
