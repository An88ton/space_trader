import { useState } from 'react'
import { derivePlayerStats } from '../utils/playerStats'

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString() : value

const PlayerStatsBar = ({ user, onLogout, isLoggingOut }) => {
  const [isCargoExpanded, setIsCargoExpanded] = useState(false)
  if (!user) {
    return null
  }

  const stats = derivePlayerStats(user)
  if (!stats) {
    return null
  }

  const fuel = stats.fuel ?? {
    current: null,
    capacity: null,
    percentage: null,
  }

  const hasFuelReadings =
    typeof fuel.current === 'number' && typeof fuel.capacity === 'number'
  const fuelValue = hasFuelReadings
    ? `${fuel.current}/${fuel.capacity}${
        typeof fuel.percentage === 'number' ? ` (${fuel.percentage}%)` : ''
      }`
    : 'Awaiting ship'
  const capacityValue =
    typeof stats.cargoCapacity === 'number'
      ? `${stats.cargoCapacity} units`
      : 'Awaiting ship'
  const hasCargoReadings =
    typeof stats.cargoUsed === 'number' &&
    typeof stats.cargoCapacity === 'number'
  const cargoValue = hasCargoReadings
    ? `${stats.cargoUsed}/${stats.cargoCapacity}${
        stats.cargoCapacity > 0
          ? ` (${Math.round((stats.cargoUsed / stats.cargoCapacity) * 100)}%)`
          : ''
      }`
    : 'Awaiting ship'
  const locationPlanet = user.position?.planetName ?? 'Unknown sector'
  const locationHex = user.position?.hex
    ? `(${user.position.hex.q}, ${user.position.hex.r})`
    : 'acquiring coordinates'
  const cargoItems = Array.isArray(stats.cargoItems) ? stats.cargoItems : []
  const hasCargo = cargoItems.length > 0

  return (
    <section
      className="player-stats-bar"
      aria-labelledby="player-stats-heading"
      role="region"
    >
      <header className="player-stats-bar__header">
        <p className="eyebrow player-stats-bar__eyebrow">US-2.3</p>
        <div>
          <h2 id="player-stats-heading">Player stats</h2>
          <p className="player-stats-bar__subhead">
            Monitoring vital stats for <strong>{user.username}</strong>
          </p>
        </div>
        <div className="player-stats-bar__actions">
          <p className="player-stats-bar__rank">{user.rank}</p>
          {onLogout ? (
            <button
              type="button"
              className="player-stats-bar__logout"
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </button>
          ) : null}
        </div>
      </header>

      <dl className="player-stats-bar__metrics">
        <div>
          <dt>Credits</dt>
          <dd>{formatNumber(stats.credits)}</dd>
        </div>
        <div>
          <dt>Fuel</dt>
          <dd>{fuelValue}</dd>
        </div>
        <div>
          <dt>Cargo</dt>
          <dd>{cargoValue}</dd>
        </div>
        <div>
          <dt>Ship capacity</dt>
          <dd>{capacityValue}</dd>
        </div>
        <div>
          <dt>Reputation</dt>
          <dd>{formatNumber(stats.reputation)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>
            {locationPlanet}
            <br />
            <small>{locationHex}</small>
          </dd>
        </div>
      </dl>

      {hasCargo && (
        <div className="player-stats-bar__cargo">
          <button
            type="button"
            className="player-stats-bar__cargo-toggle"
            onClick={() => setIsCargoExpanded(!isCargoExpanded)}
            aria-expanded={isCargoExpanded}
            aria-controls="cargo-contents"
          >
            <h3 className="player-stats-bar__cargo-title">Cargo Contents</h3>
            <span className="player-stats-bar__cargo-arrow">
              {isCargoExpanded ? '▼' : '▶'}
            </span>
          </button>
          {isCargoExpanded && (
            <ul
              id="cargo-contents"
              className="player-stats-bar__cargo-list"
            >
              {cargoItems.map((item) => (
                <li key={item.goodId} className="player-stats-bar__cargo-item">
                  <span className="player-stats-bar__cargo-good">
                    {item.goodName}
                  </span>
                  <span className="player-stats-bar__cargo-quantity">
                    {formatNumber(item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default PlayerStatsBar


