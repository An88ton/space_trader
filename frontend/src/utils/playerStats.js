const coerceNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const buildShipFuelFallback = (ship) => {
  if (!ship) {
    return { current: null, capacity: null, percentage: null }
  }

  const current = coerceNumber(ship.fuelCurrent)
  const capacity = coerceNumber(ship.fuelCapacity)
  const percentage =
    typeof current === 'number' &&
    typeof capacity === 'number' &&
    capacity > 0
      ? Math.round((current / capacity) * 100)
      : null

  return { current, capacity, percentage }
}

const ensureFuelStats = (fuel, fallback) => {
  if (!fuel) {
    return fallback
  }

  return {
    current: coerceNumber(fuel.current) ?? fallback.current,
    capacity: coerceNumber(fuel.capacity) ?? fallback.capacity,
    percentage: coerceNumber(fuel.percentage) ?? fallback.percentage,
  }
}

export const derivePlayerStats = (user) => {
  if (!user) {
    return null
  }

  const fallbackFuel = buildShipFuelFallback(user.ship)
  const stats = user.stats ?? {}

  return {
    credits: coerceNumber(stats.credits) ?? coerceNumber(user.credits) ?? 0,
    reputation:
      coerceNumber(stats.reputation) ?? coerceNumber(user.reputation) ?? 0,
    cargoCapacity:
      coerceNumber(stats.cargoCapacity) ??
      coerceNumber(user.ship?.cargoCapacity) ??
      null,
    fuel: ensureFuelStats(stats.fuel, fallbackFuel),
  }
}


