import L from 'leaflet'
import { state } from '../state.js'
import { navigate } from '../router.js'
import { addStory } from '../api.js'     // cukup addStory; API-mu sudah handle guest via token

export function AddView() {
  const el = document.createElement('section')
  el.className = 'grid'
  el.innerHTML = `
    <div class="card">
      <h1>Add Story</h1>
      <p class="muted">Click the map to select a location. The coordinates will be filled in automatically. Upload a photo or use the camera.</p>

      <!-- PETA -->
      <div id="map" class="map" role="region" aria-label="Peta pilih lokasi"></div>

      <!-- ➕ FORM TAMBAHAN (disisipkan di sini, sebelum grid lat/lon) -->
      <form id="form" class="stack" style="margin-top:1rem" novalidate>
        <label for="description">Description <span class="muted">(required)</span></label>
        <textarea id="description" name="description" rows="3" required aria-required="true" placeholder="Write a short description..."></textarea>

        <label for="photo">Foto</label>
        <input id="photo" name="photo" type="file" accept="image/*" />

        <div class="stack">
          <button type="button" id="openCam" class="btn secondary">Use camera</button>
          <button type="button" id="capture" class="btn" disabled>Take a photo</button>
          <button type="button" id="closeCam" class="btn secondary" disabled>Turn off the camera</button>
        </div>

        <video id="video" playsinline style="display:none;max-width:100%;border:1px solid #223;border-radius:.5rem"></video>
        <canvas id="canvas" style="display:none;"></canvas>

        <figure id="preview" class="stack" aria-live="polite"></figure>
      </form>
      <!-- ⬆️ END FORM TAMBAHAN -->

      <div class="grid" style="margin-top:1rem">
        <label for="lat">Latitude</label>
        <input id="lat" name="lat" type="text" inputmode="decimal" readonly aria-readonly="true"/>
        <label for="lon">Longitude</label>
        <input id="lon" name="lon" type="text" inputmode="decimal" readonly aria-readonly="true"/>
      </div>

      <p id="error" role="alert" class="muted" style="margin-top:.5rem"></p>
      <button id="submitBtn" class="btn" style="margin-top:.25rem">Submit story</button>
    </div>
  `

  /* =============== MAP (delayed init anti-mosaic) =============== */
  let map, marker
  function initMap () {
    const mapEl = el.querySelector('#map')
    map = L.map(mapEl).setView([-2.5489, 118.0149], 4)
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' })
    osm.addTo(map)

    const fixSize = () => map.invalidateSize(true)
    requestAnimationFrame(fixSize); setTimeout(fixSize, 0)
    window.addEventListener('resize', fixSize)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) fixSize() })
    if (window.ResizeObserver) new ResizeObserver(fixSize).observe(mapEl)

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      el.querySelector('#lat').value = lat.toFixed(6)
      el.querySelector('#lon').value = lng.toFixed(6)
      if (marker) marker.setLatLng(e.latlng)
      else marker = L.marker(e.latlng).addTo(map)
    })
  }
  requestAnimationFrame(initMap)
  /* ============================================================= */

  /* ================= Kamera + Preview ================= */
  const video = el.querySelector('#video')
  const canvas = el.querySelector('#canvas')
  const openCamBtn = el.querySelector('#openCam')
  const captureBtn = el.querySelector('#capture')
  const closeCamBtn = el.querySelector('#closeCam')
  const photoInput = el.querySelector('#photo')
  const preview = el.querySelector('#preview')
  const errorEl = el.querySelector('#error')
  const submitBtn = el.querySelector('#submitBtn')

  let stream = null
  let capturedFile = null

  function showPreview(file) {
    preview.innerHTML = ''
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    img.alt = 'preview the photo to be uploaded'
    img.style.maxWidth = '100%'; img.style.borderRadius = '.5rem'
    img.onload = () => URL.revokeObjectURL(url)
    preview.appendChild(img)
  }

  photoInput.addEventListener('change', () => {
    capturedFile = null
    const file = photoInput.files?.[0]
    showPreview(file)
  })

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      video.srcObject = stream
      video.style.display = 'block'
      await video.play()
      openCamBtn.disabled = true
      captureBtn.disabled = false
      closeCamBtn.disabled = false
      errorEl.textContent = ''
    } catch (err) {
      errorEl.textContent = 'Cannot access camera: ' + err.message
    }
  }
  function stopCamera() {
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
    video.pause(); video.srcObject = null; video.style.display = 'none'
    openCamBtn.disabled = false; captureBtn.disabled = true; closeCamBtn.disabled = true
  }
  async function capturePhoto() {
    if (!video.videoWidth) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    await new Promise(res => canvas.toBlob((blob) => {
      if (!blob) return res()
      capturedFile = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
      showPreview(capturedFile)
      photoInput.value = ''
      res()
    }, 'image/jpeg', 0.9))
  }

  openCamBtn.addEventListener('click', startCamera)
  captureBtn.addEventListener('click', capturePhoto)
  closeCamBtn.addEventListener('click', stopCamera)
  /* ==================================================== */

  /* ===================== Submit ke API ===================== */
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    errorEl.textContent = ''

    const description = el.querySelector('#description').value.trim()
    const lat = el.querySelector('#lat').value.trim()
    const lon = el.querySelector('#lon').value.trim()
    const file = capturedFile || photoInput.files?.[0] || null

    if (!description) return errorEl.textContent = 'description is required'
    if (!file) return errorEl.textContent = 'Select a photo or take one with the camera.'
    if (file.size > 1_000_000) return errorEl.textContent = 'Maximum photo size 1MB.'
    if (!lat || !lon) return errorEl.textContent = 'Please click on the map to select a location.'

    submitBtn.disabled = true; submitBtn.textContent = 'Sending...'
    try {
      await addStory({ description, photo: file, lat, lon }, state.token)
      stopCamera()
      alert('Story successfully submitted!')
      navigate('/home')
    } catch (err) {
      errorEl.textContent = err.message || 'Failed to submit story.'
    } finally {
      submitBtn.disabled = false; submitBtn.textContent = 'Submit Story'
    }
  })
  /* ========================================================== */

  return el
}
