import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const renderApp = () => render(<App />)

const getLoginSection = () =>
  screen.getByRole('region', { name: /resume your voyage/i })

const openRegisterSection = async () => {
  const loginSection = getLoginSection()
  await userEvent.click(
    within(loginSection).getByRole('button', { name: /create one now/i }),
  )
  return screen.getByRole('region', { name: /claim your captain/i })
}

describe('Registration flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = vi.fn()
    window.localStorage?.clear()
  })

  it('validates email before calling the backend', async () => {
    renderApp()
    const registerSection = await openRegisterSection()

    await userEvent.type(
      within(registerSection).getByLabelText(/email address/i),
      'not-an-email',
    )
    await userEvent.type(
      within(registerSection).getByLabelText(/password/i),
      'longenoughpassword',
    )
    await userEvent.click(
      within(registerSection).getByRole('button', { name: /create account/i }),
    )

    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(
      await within(registerSection).findByRole('alert'),
    ).toHaveTextContent(/email must be valid/i)
  })

  it('shows a success message when registration succeeds', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 42,
        email: 'pilot@example.com',
        username: 'pilot-01',
        createdAt: new Date().toISOString(),
      }),
    })

    renderApp()
    const registerSection = await openRegisterSection()

    await userEvent.type(
      within(registerSection).getByLabelText(/email address/i),
      'pilot@example.com',
    )
    await userEvent.type(
      within(registerSection).getByLabelText(/password/i),
      'secretpass',
    )
    await userEvent.click(
      within(registerSection).getByRole('button', {
        name: /create account/i,
      }),
    )

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' }),
    )

    expect(
      await within(registerSection).findByRole('status'),
    ).toHaveTextContent('pilot-01')
  })
})

describe('Login flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = vi.fn()
    window.localStorage?.clear()
  })

  it('validates login credentials before calling the backend', async () => {
    renderApp()
    const loginSection = getLoginSection()

    await userEvent.type(
      within(loginSection).getByLabelText(/email address/i),
      'bad-email',
    )
    await userEvent.type(
      within(loginSection).getByLabelText(/password/i),
      'short',
    )
    await userEvent.click(
      within(loginSection).getByRole('button', { name: /log in/i }),
    )

    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(
      await within(loginSection).findByRole('alert'),
    ).toHaveTextContent(/email must be valid/i)
  })

  it('shows profile details when login succeeds', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'token-123',
        user: {
          id: 42,
          email: 'pilot@example.com',
          username: 'pilot-01',
          rank: 'Commander',
          reputation: 1200,
          credits: 75000,
          createdAt: new Date('2024-01-02T00:00:00Z').toISOString(),
          updatedAt: new Date().toISOString(),
          ship: {
            id: 7,
            name: 'Starlifter',
            level: 5,
            price: 60000,
            cargoCapacity: 120,
            fuelCapacity: 80,
            fuelCurrent: 65,
            speed: 9,
            acquiredAt: new Date().toISOString(),
          },
          stats: {
            credits: 75000,
            reputation: 1200,
            cargoCapacity: 120,
            fuel: {
              current: 65,
              capacity: 80,
              percentage: 81,
            },
          },
          position: {
            planetId: 55,
            planetName: 'Nexus Station',
            hex: { q: 1, r: 1 },
          },
        },
      }),
    })

    renderApp()
    const loginSection = getLoginSection()

    await userEvent.type(
      within(loginSection).getByLabelText(/email address/i),
      'pilot@example.com',
    )
    await userEvent.type(
      within(loginSection).getByLabelText(/password/i),
      'secretpass',
    )
    await userEvent.click(
      within(loginSection).getByRole('button', { name: /log in/i }),
    )

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' }),
    )

    const statsRegion = await screen.findByRole('region', {
      name: /player stats/i,
    })
    expect(statsRegion).toHaveTextContent(/75,000/i)
    expect(statsRegion).toHaveTextContent(/65\/80/i)
    expect(statsRegion).toHaveTextContent(/\(81%/i)
    expect(statsRegion).toHaveTextContent(/120 units/i)
    expect(statsRegion).toHaveTextContent(/1,200/i)
    expect(statsRegion).toHaveTextContent(/Nexus Station/i)
  })

  it('derives stats when the backend has not been upgraded yet', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'legacy-token',
        user: {
          id: 51,
          email: 'legacy@example.com',
          username: 'legacy-01',
          rank: 'Lieutenant',
          reputation: 900,
          credits: 54000,
          createdAt: new Date('2024-03-15T00:00:00Z').toISOString(),
          updatedAt: new Date().toISOString(),
          ship: {
            id: 11,
            name: 'Wayfarer',
            level: 3,
            price: 25000,
            cargoCapacity: 90,
            fuelCapacity: 90,
            fuelCurrent: 45,
            speed: 7,
            acquiredAt: new Date().toISOString(),
          },
        },
      }),
    })

    renderApp()
    const loginSection = getLoginSection()

    await userEvent.type(
      within(loginSection).getByLabelText(/email address/i),
      'legacy@example.com',
    )
    await userEvent.type(
      within(loginSection).getByLabelText(/password/i),
      'secretpass',
    )
    await userEvent.click(
      within(loginSection).getByRole('button', { name: /log in/i }),
    )

    const statsRegion = await screen.findByRole('region', {
      name: /player stats/i,
    })
    expect(statsRegion).toHaveTextContent(/54,000/i)
    expect(statsRegion).toHaveTextContent(/45\/90/i)
    expect(statsRegion).toHaveTextContent(/\(50%/i)
    expect(statsRegion).toHaveTextContent(/90 units/i)
    expect(statsRegion).toHaveTextContent(/900/i)
  })
})

describe('Logout flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = vi.fn()
    window.localStorage?.clear()
  })

  it('revokes the local session token and hides player stats', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'token-123',
          user: {
            id: 17,
            email: 'captain@example.com',
            username: 'captain-01',
            rank: 'Commander',
            reputation: 900,
            credits: 5000,
            createdAt: new Date('2024-01-02T00:00:00Z').toISOString(),
            updatedAt: new Date().toISOString(),
            stats: {
              credits: 5000,
              reputation: 900,
              cargoCapacity: null,
              fuel: {
                current: null,
                capacity: null,
                percentage: null,
              },
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    renderApp()
    const loginSection = getLoginSection()

    await userEvent.type(
      within(loginSection).getByLabelText(/email address/i),
      'captain@example.com',
    )
    await userEvent.type(
      within(loginSection).getByLabelText(/password/i),
      'secretpass',
    )
    await userEvent.click(
      within(loginSection).getByRole('button', { name: /log in/i }),
    )

    const logoutButton = await screen.findByRole('button', { name: /log out/i })
    expect(window.localStorage.getItem('space_trader_access_token')).toBe(
      'token-123',
    )

    await userEvent.click(logoutButton)

    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      '/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer token-123' },
      }),
    )

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: /player stats/i }),
      ).not.toBeInTheDocument(),
    )
    expect(window.localStorage.getItem('space_trader_access_token')).toBeNull()
  })
})

