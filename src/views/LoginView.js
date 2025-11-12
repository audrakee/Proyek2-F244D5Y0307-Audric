// src/views/LoginView.js
import { login } from '../api.js';
import { saveSession } from '../state.js';
import { navigate } from '../router.js';

export function LoginView() {
  const el = document.createElement('section');
  el.className = 'grid';
  el.innerHTML = `
    <h1>Sign In</h1>
    <form class="card" id="form" novalidate>
      <p class="muted">Use your account to upload stories and receive notifications.</p>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" required aria-required="true"/>
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required minlength="8" aria-required="true"/>
      <div class="stack">
        <button type="submit" class="btn" id="submitBtn">Sign In</button>
        <a class="btn secondary" href="#/register">Register</a>
      </div>
      <p id="error" class="muted" role="alert"></p>
    </form>
  `;

  const form = el.querySelector('#form');
  const errEl = el.querySelector('#error');
  const submitBtn = el.querySelector('#submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.textContent = '';
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    if (!email || !password) {
      errEl.textContent = 'Email dan password wajib diisi.';
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';

      const res = await login({ email, password });
      if (res.error) throw new Error(res.message || 'Gagal masuk.');

      const { userId, name, token } = res.loginResult;
      saveSession({ token, user: { id: userId, name, email } });

      alert(`Berhasil masuk sebagai ${name}.`);
      navigate('/home');
    } catch (err) {
      // contoh pesan dari API: "User not found" / "Invalid password"
      errEl.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Masuk';
    }
  });

  return el;
}
