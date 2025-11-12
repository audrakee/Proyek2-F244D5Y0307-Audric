export const state = { token: null, user: null }

export function restoreSession() {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  if (token) state.token = token
  if (user) state.user = JSON.parse(user)
}

export function saveSession({ token, user }) {
  state.token = token
  state.user = user
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  state.token = null
  state.user = null
}
