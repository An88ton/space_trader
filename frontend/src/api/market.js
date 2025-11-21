const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

async function safeParseJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      `Request failed with status ${response.status}`
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function buyGoods(sessionToken, goodId, quantity, planetId) {
  return fetchApi('/market/buy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ goodId, quantity, planetId }),
  })
}

export async function sellGoods(sessionToken, goodId, quantity, planetId) {
  return fetchApi('/market/sell', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ goodId, quantity, planetId }),
  })
}

export async function getInventory(sessionToken) {
  return fetchApi('/market/inventory', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  })
}

