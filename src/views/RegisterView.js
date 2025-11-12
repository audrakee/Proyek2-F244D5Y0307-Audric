import { register } from '../api.js'
import { navigate } from '../router.js'

export function RegisterView() {
  const el = document.createElement('section')
  el.className = 'grid'
  el.innerHTML = `
    <h1>Register</h1>
    <form class="card" id="form" novalidate>
      <label for="name">Username</label>
      <input id="name" name="name" type="text" required aria-required="true"/>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required aria-required="true"/>
      <label for="password">Password (min 8 characters)</label>
      <input id="password" name="password" type="password" minlength="8" required aria-required="true"/>
      <div class="stack">
        <button type="submit" class="btn">Create an account</button>
        <a class="btn secondary" href="#/login">Already have an account</a>
      </div>
      <p id="error" class="muted" role="alert"></p>
    </form>
  `
  const form = el.querySelector('#form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = form.name.value.trim()
    const email = form.email.value.trim()
    const password = form.password.value.trim()
    if (!name || !email || password.length < 8) return showErr('Username, email, and password min 8 characters are required.')
    try {
      const res = await register({ name, email, password })
      if (res.error) return showErr(res.message || 'Gagal daftar.')
      alert('Akun berhasil dibuat, silakan masuk.')
      navigate('/login')
    } catch(err) {
      showErr(err.message)
    }
  })
  function showErr(msg){ el.querySelector('#error').textContent = msg }
  return el
}
