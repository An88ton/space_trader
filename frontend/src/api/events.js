const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'

async function safeParseJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function getTravelEvents(token) {
  const response = await fetch(`${API_BASE}/events/travel`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      `Failed to fetch travel events with status ${response.status}`
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function getActiveEvents(token, planetId = null, turn = 0) {
  const params = new URLSearchParams()
  if (planetId !== null) {
    params.append('planetId', planetId)
  }
  if (turn !== 0) {
    params.append('turn', turn)
  }

  const url = `${API_BASE}/events/active${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      `Failed to fetch active events with status ${response.status}`
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}

export async function submitEventChoice(token, eventId, choiceId, travelLogId = null) {
  const response = await fetch(`${API_BASE}/events/choice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      eventId,
      choiceId,
      travelLogId,
    }),
  })

  if (!response.ok) {
    const errorBody = await safeParseJson(response)
    const message =
      errorBody?.message ??
      `Failed to submit event choice with status ${response.status}`
    throw new Error(Array.isArray(message) ? message[0] : message)
  }

  return response.json()
}
