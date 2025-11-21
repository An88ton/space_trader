import { derivePlayerStats } from '../utils/playerStats'

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString() : value

const PlayerStatsBar = ({ user, onLogout, isLoggingOut }) => {
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
  const locationPlanet = user.position?.planetName ?? 'Unknown sector'
  const locationHex = user.position?.hex
    ? `(${user.position.hex.q}, ${user.position.hex.r})`
    : 'acquiring coordinates'

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
    </section>
  )
}

export default PlayerStatsBar


