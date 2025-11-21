const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'

export async function registerUser(credentials) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      (response.status === 409
        ? 'That email is already registered.'
        : 'Registration failed. Please try again.')
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      (response.status === 401
        ? 'Invalid email or password.'
        : 'Login failed. Please try again.')
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function resumeSession(token) {
  const response = await fetch(`${API_BASE}/auth/session`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      (response.status === 401
        ? 'Session expired. Please log in again.'
        : 'Unable to resume your session right now.')
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function logoutSession(token) {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const responseBody = await safeParseJson(response)

  if (!response.ok) {
    const message =
      responseBody?.message ??
      (response.status === 401
        ? 'Your session has already expired.'
        : 'Unable to log out securely. Please try again.')
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return responseBody ?? { success: true }
}

async function safeParseJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

