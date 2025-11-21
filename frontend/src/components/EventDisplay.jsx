import { useEffect, useState } from 'react'
import { submitEventChoice } from '../api/events'
import './EventDisplay.css'

const EventDisplay = ({ event, onClose, sessionToken, travelLogId, onChoiceSubmitted }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedChoiceId, setSelectedChoiceId] = useState(null)
  const [choiceSubmitted, setChoiceSubmitted] = useState(false)

  useEffect(() => {
    if (event) {
      setIsVisible(true)
    }
  }, [event])

  if (!event || !isVisible) {
    return null
  }

  const getEventIcon = (category) => {
    switch (category) {
      case 'pirate_ambush':
        return '⚔️'
      case 'engine_failure':
        return '⚙️'
      case 'fuel_leak':
        return '💧'
      case 'safe_passage':
        return '✨'
      case 'meteor_shower':
        return '☄️'
      case 'space_patrol':
        return '🛡️'
      case 'epidemic':
        return '🦠'
      case 'harvest_boom':
        return '🌾'
      case 'mining_rush':
        return '⛏️'
      case 'planetary_famine':
        return '🌾'
      case 'trade_festival':
        return '🎉'
      case 'smuggling_crackdown':
        return '🚨'
      case 'black_market_offer':
        return '💰'
      case 'investor_interest':
        return '💼'
      case 'merchant_guild_reward':
        return '🎖️'
      case 'insurance_payout':
        return '📜'
      default:
        return '⭐'
    }
  }

  const getEventTypeClass = (type) => {
    switch (type) {
      case 'travel':
        return 'event-display--travel'
      case 'market':
        return 'event-display--market'
      case 'player_status':
        return 'event-display--player-status'
      default:
        return ''
    }
  }

  const getEventSeverityClass = (category) => {
    const positive = ['safe_passage', 'space_patrol', 'trade_festival', 'merchant_guild_reward', 'insurance_payout', 'harvest_boom', 'investor_interest']
    const negative = ['pirate_ambush', 'engine_failure', 'fuel_leak', 'meteor_shower', 'planetary_famine', 'smuggling_crackdown', 'black_market_offer']
    
    if (positive.includes(category)) {
      return 'event-display--positive'
    }
    if (negative.includes(category)) {
      return 'event-display--negative'
    }
    return 'event-display--neutral'
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onClose) {
        onClose()
      }
    }, 300) // Allow animation to complete
  }

  const handleChoiceSelect = async (choiceId) => {
    if (!event || !sessionToken || isSubmitting || !event.requiresChoice) {
      return
    }

    setIsSubmitting(true)
    setSelectedChoiceId(choiceId)

    try {
      const result = await submitEventChoice(
        sessionToken,
        event.id,
        choiceId,
        travelLogId
      )

      // Mark choice as submitted
      setChoiceSubmitted(true)
      
      // Update event with result
      if (onChoiceSubmitted) {
        onChoiceSubmitted(
          {
            ...event,
            requiresChoice: false,
            fuelModifier: result.eventResult.fuelModifier,
            cargoLost: result.eventResult.cargoLost,
            creditsLost: result.eventResult.creditsLost,
            reputationChange: result.eventResult.reputationChange,
            description: result.eventResult.description,
            choices: undefined, // Clear choices after submission
          },
          result.user // Pass updated user data
        )
      }
    } catch (err) {
      console.error('Failed to submit choice:', err)
      setSelectedChoiceId(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`event-display ${getEventTypeClass(event.eventType)} ${getEventSeverityClass(event.eventCategory)} ${isVisible ? 'event-display--visible' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="event-display__content">
        <div className="event-display__header">
          <span className="event-display__icon">{getEventIcon(event.eventCategory)}</span>
          <h3 className="event-display__title">{event.name}</h3>
          {(!event.requiresChoice || choiceSubmitted) && (
            <button
              className="event-display__close"
              onClick={handleClose}
              aria-label="Close event notification"
            >
              ×
            </button>
          )}
        </div>
        <div className="event-display__body">
          <p className="event-display__description">{event.description}</p>
          {event.reputationChange !== 0 && (
            <div className="event-display__effect">
              <strong>Reputation:</strong>{' '}
              <span className={event.reputationChange > 0 ? 'positive' : 'negative'}>
                {event.reputationChange > 0 ? '+' : ''}{event.reputationChange}
              </span>
            </div>
          )}
          {event.cargoLost > 0 && (
            <div className="event-display__effect">
              <strong>Cargo Lost:</strong>{' '}
              <span className="negative">{event.cargoLost} units</span>
            </div>
          )}
          {event.creditsLost > 0 && (
            <div className="event-display__effect">
              <strong>Credits Lost:</strong>{' '}
              <span className="negative">{event.creditsLost} credits</span>
            </div>
          )}
          {event.fuelModifier !== 1.0 && (
            <div className="event-display__effect">
              <strong>Fuel Consumption:</strong>{' '}
              <span className={event.fuelModifier > 1 ? 'negative' : 'positive'}>
                {event.fuelModifier > 1 ? '+' : ''}{Math.round((event.fuelModifier - 1) * 100)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Choices */}
        {event.requiresChoice && event.choices && event.choices.length > 0 && (
          <div className="event-display__choices">
            <h4 className="event-display__choices-title">Choose your response:</h4>
            <div className="event-display__choices-list">
              {event.choices.map((choice) => (
                <button
                  key={choice.id}
                  className={`event-display__choice ${
                    selectedChoiceId === choice.id ? 'event-display__choice--selected' : ''
                  }`}
                  onClick={() => handleChoiceSelect(choice.id)}
                  disabled={isSubmitting}
                >
                  <div className="event-display__choice-label">{choice.label}</div>
                  {choice.description && (
                    <div className="event-display__choice-description">{choice.description}</div>
                  )}
                  {isSubmitting && selectedChoiceId === choice.id && (
                    <div className="event-display__choice-loading">Processing...</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDisplay
