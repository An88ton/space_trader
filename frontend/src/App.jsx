import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  registerUser,
  loginUser,
  resumeSession,
  logoutSession,
} from './api/auth'
import PlayerStatsBar from './components/PlayerStatsBar'
import HexGridMap from './components/HexGridMap'

const initialFormState = { email: '', password: '' }
const SESSION_TOKEN_KEY = 'space_trader_access_token'
const VIEW = {
  LOGIN: 'login',
  REGISTER: 'register',
  PLAYER: 'player',
  MAP: 'map',
}

const readStoredToken = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  try {
    return window.localStorage.getItem(SESSION_TOKEN_KEY)
  } catch (error) {
    console.warn('Unable to read session token from storage', error)
    return null
  }
}

const writeStoredToken = (token) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  try {
    if (token) {
      window.localStorage.setItem(SESSION_TOKEN_KEY, token)
    } else {
      window.localStorage.removeItem(SESSION_TOKEN_KEY)
    }
  } catch (error) {
    console.warn('Unable to persist session token', error)
  }
}

function App() {
  const [registerForm, setRegisterForm] = useState(initialFormState)
  const [loginForm, setLoginForm] = useState(initialFormState)
  const [activeView, setActiveView] = useState(VIEW.LOGIN)

  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerResult, setRegisterResult] = useState(null)

  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginResult, setLoginResult] = useState(null)
  const [isLogoutSubmitting, setIsLogoutSubmitting] = useState(false)
  const sessionTokenRef = useRef(readStoredToken())

  useEffect(() => {
    const storedToken = sessionTokenRef.current
    if (!storedToken) {
      return
    }

    let isCancelled = false

    const bootstrapSession = async () => {
      try {
        const session = await resumeSession(storedToken)
        if (isCancelled) {
          return
        }

        setLoginResult(session.user)
        setLoginError('')
        sessionTokenRef.current = session.accessToken
        writeStoredToken(session.accessToken)
        setActiveView(VIEW.PLAYER)
      } catch {
        if (isCancelled) {
          return
        }
        sessionTokenRef.current = null
        writeStoredToken(null)
        setLoginResult(null)
        setActiveView((prev) =>
          prev === VIEW.PLAYER ? VIEW.LOGIN : prev,
        )
      }
    }

    bootstrapSession()

    return () => {
      isCancelled = true
    }
  }, [])

  const validateCredentials = (credentials) => {
    if (!credentials.email.trim()) {
      return 'Email is required'
    }
    if (!credentials.email.includes('@')) {
      return 'Email must be valid'
    }
    if (credentials.password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    return ''
  }

  const handleRegisterChange = (event) => {
    const { name, value } = event.target
    setRegisterForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()

    const validationMessage = validateCredentials(registerForm)
    if (validationMessage) {
      setRegisterError(validationMessage)
      setRegisterResult(null)
      return
    }

    setRegisterError('')
    setIsRegisterSubmitting(true)
    try {
      const response = await registerUser(registerForm)
      setRegisterResult(response)
      setRegisterForm(initialFormState)
    } catch (err) {
      setRegisterError(err.message ?? 'Unable to register right now.')
      setRegisterResult(null)
    } finally {
      setIsRegisterSubmitting(false)
    }
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()

    const validationMessage = validateCredentials(loginForm)
    if (validationMessage) {
      setLoginError(validationMessage)
      setLoginResult(null)
      return
    }

    setLoginError('')
    setIsLoginSubmitting(true)
    try {
      const session = await loginUser(loginForm)
      setLoginResult(session.user)
      sessionTokenRef.current = session.accessToken
      writeStoredToken(session.accessToken)
      setLoginForm(initialFormState)
    } catch (err) {
      setLoginError(err.message ?? 'Unable to log in right now.')
      setLoginResult(null)
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handleLogout = async () => {
    if (isLogoutSubmitting) {
      return
    }

    const token = sessionTokenRef.current
    setIsLogoutSubmitting(true)

    try {
      if (token) {
        await logoutSession(token)
      }
    } catch (error) {
      console.warn('Unable to terminate session on the backend', error)
    } finally {
      sessionTokenRef.current = null
      writeStoredToken(null)
      setLoginResult(null)
      setLoginError('')
      setActiveView(VIEW.LOGIN)
      setIsLogoutSubmitting(false)
    }
  }

  const playerPosition = loginResult?.position ?? null
  const currentPlanetName = playerPosition?.planetName ?? 'Unknown sector'
  const currentHexLabel = playerPosition?.hex
    ? `(${playerPosition.hex.q}, ${playerPosition.hex.r})`
    : null

  useEffect(() => {
    // Only change view when loginResult transitions from null to a value (login)
    // or from a value to null (logout), not when it's just updated
    if (loginResult) {
      // Only set to PLAYER if we're on LOGIN or REGISTER view (initial login)
      // Don't change view if we're already on MAP or PLAYER view
      setActiveView((prev) => {
        if (prev === VIEW.LOGIN || prev === VIEW.REGISTER) {
          return VIEW.PLAYER
        }
        return prev
      })
    } else {
      setActiveView((prev) =>
        prev === VIEW.PLAYER ? VIEW.LOGIN : prev,
      )
    }
  }, [loginResult])

  const isLoginView = !loginResult && activeView === VIEW.LOGIN
  const isRegisterView = !loginResult && activeView === VIEW.REGISTER
  const isPlayerView = !!loginResult && activeView === VIEW.PLAYER
  const isMapView = !!loginResult && activeView === VIEW.MAP

  return (
    <main className="app">
      {isPlayerView && (
        <PlayerStatsBar
          user={loginResult}
          onLogout={handleLogout}
          isLoggingOut={isLogoutSubmitting}
        />
      )}

      {isMapView && (
        <div style={{ position: 'relative' }}>
          <PlayerStatsBar
            user={loginResult}
            onLogout={handleLogout}
            isLoggingOut={isLogoutSubmitting}
          />
          <div style={{ marginTop: '60px' }}>
            <div style={{ position: 'absolute', top: '70px', right: '20px', zIndex: 100 }}>
              <button
                onClick={() => setActiveView(VIEW.PLAYER)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Back to Dashboard
              </button>
            </div>
            <HexGridMap 
              playerPosition={playerPosition}
              sessionToken={sessionTokenRef.current}
              onTravelSuccess={(updatedUser) => {
                // Update user state with the updated user from travel response
                setLoginResult(updatedUser);
              }}
            />
          </div>
        </div>
      )}

      {isPlayerView && (
        <div style={{ padding: '20px' }}>
          <h1>Welcome, {loginResult?.username}!</h1>
          <p>Your ship is currently orbiting <strong>{currentPlanetName}</strong>
            {currentHexLabel ? ` ${currentHexLabel}` : ''}.
          </p>
          <p>Your space trading journey begins here.</p>
          <button
            onClick={() => setActiveView(VIEW.MAP)}
            style={{
              padding: '15px 30px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px',
            }}
          >
            View Universe Map
          </button>
        </div>
      )}

      {isLoginView && (
        <section
          className="panel"
          aria-labelledby="login-heading"
          role="region"
          data-active={isLoginView}
        >
          <header className="panel__header">
            <p className="eyebrow">US-1.2</p>
            <h1 id="login-heading">Resume your voyage</h1>
            <p className="lede">
              Log in with your credentials to reload your fleet, credits, and
              current ship assignments.
            </p>
          </header>

          {loginError && (
            <div className="alert alert--error" role="alert">
              {loginError}
            </div>
          )}

          <form
            className="form"
            onSubmit={handleLoginSubmit}
            noValidate
            aria-labelledby="login-heading"
          >
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="captain@galactic-freight.com"
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Your secure password"
                autoComplete="current-password"
                required
                minLength={8}
              />
            </label>

            <button
              type="submit"
              className="primary-btn"
              disabled={isLoginSubmitting}
            >
              {isLoginSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="fine-print">
            Need an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => setActiveView(VIEW.REGISTER)}
            >
              Create one now.
            </button>
          </p>
        </section>
      )}

      {isRegisterView && (
        <section
          className="panel panel--secondary"
          aria-labelledby="register-heading"
          role="region"
          data-active={isRegisterView}
        >
          <header className="panel__header">
            <p className="eyebrow">US-1.1</p>
            <h1 id="register-heading">Claim your captain&apos;s log</h1>
            <p className="lede">
              Create an account to sync your fleet, track trade routes, and
              resume voyages from any device.
            </p>
          </header>

          {registerResult && (
            <div className="alert alert--success" role="status">
              Welcome aboard, <strong>{registerResult.username}</strong>! You can
              now log in with <strong>{registerResult.email}</strong>.
            </div>
          )}

          {registerError && (
            <div className="alert alert--error" role="alert">
              {registerError}
            </div>
          )}

          <form
            className="form"
            onSubmit={handleRegisterSubmit}
            noValidate
            aria-labelledby="register-heading"
          >
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="captain@galactic-freight.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>

            <button
              type="submit"
              className="primary-btn"
              disabled={isRegisterSubmitting}
            >
              {isRegisterSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="fine-print">
            Already have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => setActiveView(VIEW.LOGIN)}
            >
              Head to login.
            </button>
          </p>
        </section>
      )}
    </main>
  )
}

export default App
