const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'

async function safeParseJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function travelToPlanet(token, destinationPlanetId) {
  const response = await fetch(`${API_BASE}/travel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ destinationPlanetId }),
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      `Travel failed with status ${response.status}`
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

