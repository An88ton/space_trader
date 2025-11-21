const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'

async function safeParseJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function getAvailableShips() {
  const response = await fetch(`${API_BASE}/shipyard/ships`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ?? 'Unable to fetch available ships.'
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function getUserShips(token) {
  const response = await fetch(`${API_BASE}/shipyard/my-ships`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      (response.status === 401
        ? 'Session expired. Please log in again.'
        : 'Unable to fetch your ships.')
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function buyShip(token, shipId, planetId) {
  const response = await fetch(`${API_BASE}/shipyard/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipId, planetId }),
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      (response.status === 401
        ? 'Session expired. Please log in again.'
        : 'Unable to buy ship.')
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function sellShip(token, userShipId) {
  const response = await fetch(`${API_BASE}/shipyard/sell`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userShipId }),
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      (response.status === 401
        ? 'Session expired. Please log in again.'
        : 'Unable to sell ship.')
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

