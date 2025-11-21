import { useEffect, useState } from 'react'
import { getActiveEvents } from '../api/events'
import './ActiveEventsBar.css'

const ActiveEventsBar = ({ sessionToken, planetId, turn = 0 }) => {
  const [activeEvents, setActiveEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionToken) {
      return
    }

    const loadActiveEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        const events = await getActiveEvents(sessionToken, planetId, turn)
        setActiveEvents(events || [])
      } catch (err) {
        setError(err.message)
        setActiveEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadActiveEvents()

    // Refresh every 30 seconds
    const interval = setInterval(loadActiveEvents, 30000)
    return () => clearInterval(interval)
  }, [sessionToken, planetId, turn])

  if (!sessionToken || activeEvents.length === 0) {
    return null
  }

  const getEventIcon = (category) => {
    const icons = {
      epidemic: '🦠',
      harvest_boom: '🌾',
      mining_rush: '⛏️',
      planetary_famine: '🌾',
      trade_festival: '🎉',
      smuggling_crackdown: '🚨',
    }
    return icons[category] || '⭐'
  }

  const getEventTypeClass = (type) => {
    switch (type) {
      case 'market':
        return 'active-events-bar__event--market'
      default:
        return ''
    }
  }

  return (
    <div className="active-events-bar">
      <div className="active-events-bar__header">
        <span className="active-events-bar__title">Active Events</span>
        {loading && <span className="active-events-bar__loading">...</span>}
      </div>
      {error && (
        <div className="active-events-bar__error">
          <small>{error}</small>
        </div>
      )}
      <div className="active-events-bar__events">
        {activeEvents.map((event) => (
          <div
            key={event.id}
            className={`active-events-bar__event ${getEventTypeClass(event.eventType)}`}
            title={event.description || event.name}
          >
            <span className="active-events-bar__event-icon">
              {getEventIcon(event.eventCategory)}
            </span>
            <span className="active-events-bar__event-name">{event.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActiveEventsBar
