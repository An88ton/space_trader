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

export async function generateUniverse(config = {}) {
  return fetchApi('/universe/generate', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function getUniverseMap() {
  return fetchApi('/universe/map');
}

export async function getUniverseHexes() {
  return fetchApi('/universe/hexes');
}

export async function getUniversePlanets() {
  return fetchApi('/universe/planets');
}

export async function getUniverseBounds() {
  return fetchApi('/universe/bounds');
}

export async function getUniverseStatus() {
  return fetchApi('/universe/status');
}

export async function getHex(q, r) {
  return fetchApi(`/universe/hex/${q}/${r}`);
}

export async function getPlanet(q, r) {
  return fetchApi(`/universe/planet/${q}/${r}`);
}

export async function getPlanetMarket(q, r) {
  return fetchApi(`/universe/planet/${q}/${r}/market`);
}

export async function getDistance(fromQ, fromR, toQ, toR) {
  return fetchApi(`/universe/distance?fromQ=${fromQ}&fromR=${fromR}&toQ=${toQ}&toR=${toR}`);
}

export async function getPath(fromQ, fromR, toQ, toR) {
  return fetchApi('/universe/path', {
    method: 'POST',
    body: JSON.stringify({ fromQ, fromR, toQ, toR }),
  });
}

export async function clearUniverse() {
  return fetchApi('/universe', {
    method: 'DELETE',
  });
}

