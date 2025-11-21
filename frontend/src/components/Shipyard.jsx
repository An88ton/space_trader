import { useState, useEffect } from 'react';
import {
  getAvailableShips,
  getUserShips,
  buyShip,
  sellShip,
} from '../api/shipyard';
import './Shipyard.css';

function Shipyard({ sessionToken, playerPosition, onShipTransaction }) {
  const [availableShips, setAvailableShips] = useState([]);
  const [userShips, setUserShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buyingShipId, setBuyingShipId] = useState(null);
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState(null);
  const [sellingUserShipId, setSellingUserShipId] = useState(null);
  const [isSelling, setIsSelling] = useState(false);
  const [sellError, setSellError] = useState(null);

  const currentPlanetId = playerPosition?.planetId;

  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    const loadShips = async () => {
      setLoading(true);
      setError(null);
      try {
        const [available, user] = await Promise.all([
          getAvailableShips(),
          getUserShips(sessionToken),
        ]);
        setAvailableShips(available);
        setUserShips(user);
      } catch (err) {
        setError(err.message || 'Failed to load ships');
      } finally {
        setLoading(false);
      }
    };

    loadShips();
  }, [sessionToken]);

  const handleBuyClick = (shipId) => {
    if (!currentPlanetId) {
      setBuyError('You must be at a planet to buy a ship');
      return;
    }
    setBuyingShipId(shipId);
    setBuyError(null);
  };

  const handleBuyConfirm = async (e, shipId) => {
    e.preventDefault();
    if (!sessionToken || !currentPlanetId) {
      return;
    }

    setIsBuying(true);
    setBuyError(null);

    try {
      const updatedUser = await buyShip(sessionToken, shipId, currentPlanetId);
      setBuyingShipId(null);

      // Reload ships
      const [available, user] = await Promise.all([
        getAvailableShips(),
        getUserShips(sessionToken),
      ]);
      setAvailableShips(available);
      setUserShips(user);

      // Notify parent of user update
      if (onShipTransaction) {
        onShipTransaction(updatedUser);
      }
    } catch (err) {
      setBuyError(err.message || 'Failed to buy ship');
    } finally {
      setIsBuying(false);
    }
  };

  const handleBuyCancel = () => {
    setBuyingShipId(null);
    setBuyError(null);
  };

  const handleSellClick = (userShipId) => {
    const userShip = userShips.find((us) => us.id === userShipId);
    if (userShip?.isActive) {
      setSellError('Cannot sell your active ship. Please activate another ship first.');
      return;
    }
    setSellingUserShipId(userShipId);
    setSellError(null);
  };

  const handleSellConfirm = async (e, userShipId) => {
    e.preventDefault();
    if (!sessionToken) {
      return;
    }

    setIsSelling(true);
    setSellError(null);

    try {
      const updatedUser = await sellShip(sessionToken, userShipId);
      setSellingUserShipId(null);

      // Reload ships
      const [available, user] = await Promise.all([
        getAvailableShips(),
        getUserShips(sessionToken),
      ]);
      setAvailableShips(available);
      setUserShips(user);

      // Notify parent of user update
      if (onShipTransaction) {
        onShipTransaction(updatedUser);
      }
    } catch (err) {
      setSellError(err.message || 'Failed to sell ship');
    } finally {
      setIsSelling(false);
    }
  };

  const handleSellCancel = () => {
    setSellingUserShipId(null);
    setSellError(null);
  };

  const selectedShip =
    buyingShipId &&
    availableShips.find((ship) => ship.id === buyingShipId);

  const selectedUserShip =
    sellingUserShipId &&
    userShips.find((us) => us.id === sellingUserShipId);

  const ownedShipIds = new Set(userShips.map((us) => us.ship.id));

  if (loading) {
    return (
      <div className="shipyard">
        <div className="shipyard__loading">Loading shipyard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shipyard">
        <div className="shipyard__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="shipyard">
      <header className="shipyard__header">
        <h1>Shipyard</h1>
        <p>Buy new ships or sell ships from your fleet</p>
        {currentPlanetId ? (
          <p className="shipyard__location">
            You are at: <strong>{playerPosition?.planetName}</strong>
          </p>
        ) : (
          <p className="shipyard__location shipyard__location--warning">
            You must be at a planet to buy ships
          </p>
        )}
      </header>

      {/* Available Ships Section */}
      <section className="shipyard__section">
        <h2>Available Ships</h2>
        <div className="shipyard__grid">
          {availableShips.map((ship) => {
            const isOwned = ownedShipIds.has(ship.id);
            return (
              <div
                key={ship.id}
                className={`shipyard__ship-card ${
                  isOwned ? 'shipyard__ship-card--owned' : ''
                }`}
              >
                <div className="shipyard__ship-header">
                  <h3>{ship.name}</h3>
                  <span className="shipyard__ship-level">Level {ship.level}</span>
                </div>
                <div className="shipyard__ship-stats">
                  <div className="shipyard__stat">
                    <span className="shipyard__stat-label">Price:</span>
                    <span className="shipyard__stat-value">
                      {ship.price.toLocaleString()} credits
                    </span>
                  </div>
                  <div className="shipyard__stat">
                    <span className="shipyard__stat-label">Cargo:</span>
                    <span className="shipyard__stat-value">{ship.cargoCapacity}</span>
                  </div>
                  <div className="shipyard__stat">
                    <span className="shipyard__stat-label">Fuel:</span>
                    <span className="shipyard__stat-value">
                      {ship.fuelCapacity}
                    </span>
                  </div>
                  <div className="shipyard__stat">
                    <span className="shipyard__stat-label">Speed:</span>
                    <span className="shipyard__stat-value">{ship.speed}</span>
                  </div>
                </div>
                {buyingShipId === ship.id ? (
                  <div className="shipyard__confirm-dialog">
                    <p>
                      Buy <strong>{ship.name}</strong> for{' '}
                      <strong>{ship.price.toLocaleString()} credits</strong>?
                    </p>
                    {buyError && (
                      <div className="shipyard__error-message">{buyError}</div>
                    )}
                    <div className="shipyard__confirm-buttons">
                      <button
                        onClick={(e) => handleBuyConfirm(e, ship.id)}
                        disabled={isBuying || !currentPlanetId}
                        className="shipyard__btn shipyard__btn--primary"
                      >
                        {isBuying ? 'Buying...' : 'Confirm Purchase'}
                      </button>
                      <button
                        onClick={handleBuyCancel}
                        disabled={isBuying}
                        className="shipyard__btn shipyard__btn--secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyClick(ship.id)}
                    disabled={isOwned || !currentPlanetId}
                    className={`shipyard__btn ${
                      isOwned
                        ? 'shipyard__btn--disabled'
                        : 'shipyard__btn--primary'
                    }`}
                  >
                    {isOwned ? 'Already Owned' : 'Buy Ship'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* User Ships Section */}
      <section className="shipyard__section">
        <h2>Your Fleet</h2>
        {userShips.length === 0 ? (
          <p className="shipyard__empty">You don't own any ships yet.</p>
        ) : (
          <div className="shipyard__grid">
            {userShips.map((userShip) => (
              <div
                key={userShip.id}
                className={`shipyard__ship-card ${
                  userShip.isActive ? 'shipyard__ship-card--active' : ''
                }`}
              >
                <div className="shipyard__ship-header">
                  <h3>
                    {userShip.ship.name}
                    {userShip.isActive && (
                      <span className="shipyard__active-badge">Active</span>
                    )}
                  </h3>
                  <span className="shipyard__ship-level">
                    Level {userShip.ship.level}
                  </span>
                </div>
                <div className="shipyard__ship-stats">
                  <div className="shipyard__stat">
                    <span className="shipyard__stat-label">Value:</span>
                    <span className="shipyard__stat-value">
                      {Math.floor(userShip.ship.price * 0.5).toLocaleString()}{' '}
                      credits (50% of purchase)
                    </span>
                  </div>
                  <div className="shipyard__stat">
                    <span className="shipyard__stat-label">Cargo:</span>
                    <span className="shipyard__stat-value">
                      {userShip.ship.cargoCapacity}
                    </span>
                  </div>
                  <div className="shipyard__stat">
                    <span className="shipyard__stat-label">Fuel:</span>
                    <span className="shipyard__stat-value">
                      {userShip.ship.fuelCurrent}/{userShip.ship.fuelCapacity}
                    </span>
                  </div>
                  <div className="shipyard__stat">
                    <span className="shipyard__stat-label">Speed:</span>
                    <span className="shipyard__stat-value">
                      {userShip.ship.speed}
                    </span>
                  </div>
                  {userShip.currentPlanet && (
                    <div className="shipyard__stat">
                      <span className="shipyard__stat-label">Location:</span>
                      <span className="shipyard__stat-value">
                        {userShip.currentPlanet.name}
                      </span>
                    </div>
                  )}
                </div>
                {sellingUserShipId === userShip.id ? (
                  <div className="shipyard__confirm-dialog">
                    <p>
                      Sell <strong>{userShip.ship.name}</strong> for{' '}
                      <strong>
                        {Math.floor(userShip.ship.price * 0.5).toLocaleString()}{' '}
                        credits
                      </strong>
                      ?
                    </p>
                    <p className="shipyard__warning">
                      Note: You must unload all cargo before selling a ship.
                    </p>
                    {sellError && (
                      <div className="shipyard__error-message">{sellError}</div>
                    )}
                    <div className="shipyard__confirm-buttons">
                      <button
                        onClick={(e) => handleSellConfirm(e, userShip.id)}
                        disabled={isSelling || userShip.isActive}
                        className="shipyard__btn shipyard__btn--danger"
                      >
                        {isSelling ? 'Selling...' : 'Confirm Sale'}
                      </button>
                      <button
                        onClick={handleSellCancel}
                        disabled={isSelling}
                        className="shipyard__btn shipyard__btn--secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSellClick(userShip.id)}
                    disabled={userShip.isActive}
                    className={`shipyard__btn ${
                      userShip.isActive
                        ? 'shipyard__btn--disabled'
                        : 'shipyard__btn--danger'
                    }`}
                  >
                    {userShip.isActive ? 'Cannot Sell Active Ship' : 'Sell Ship'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Shipyard;

