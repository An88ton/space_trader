import { useState, useEffect } from 'react';
import { getPlanetMarket } from '../api/universe';
import { buyGoods, sellGoods, getInventory } from '../api/market';
import ActiveEventsBar from './ActiveEventsBar';
import './PlanetMarket.css';

function PlanetMarket({ planetQ, planetR, planetName, planetId, sessionToken, playerPosition, onBuySuccess, onSellSuccess }) {
  const [marketData, setMarketData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buyingGoodId, setBuyingGoodId] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState(null);
  const [sellingGoodId, setSellingGoodId] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [isSelling, setIsSelling] = useState(false);
  const [sellError, setSellError] = useState(null);

  const isAtPlanet = playerPosition?.planetId === planetId;

  useEffect(() => {
    if (!planetQ || planetR === undefined) {
      return;
    }

    const loadMarket = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPlanetMarket(planetQ, planetR);
        setMarketData(data);
      } catch (err) {
        setError(err.message || 'Failed to load market prices');
      } finally {
        setLoading(false);
      }
    };

    loadMarket();
  }, [planetQ, planetR]);

  useEffect(() => {
    if (!sessionToken || !isAtPlanet) {
      return;
    }

    const loadInventory = async () => {
      try {
        const data = await getInventory(sessionToken);
        setInventoryData(data);
      } catch (err) {
        console.error('Failed to load inventory:', err);
      }
    };

    loadInventory();
  }, [sessionToken, isAtPlanet]);

  const handleBuyClick = (goodId) => {
    if (!isAtPlanet) {
      setBuyError('You can only buy goods on the planet where you are located');
      return;
    }
    setBuyingGoodId(goodId);
    setBuyQuantity(1);
    setBuyError(null);
  };

  const handleBuySubmit = async (e, goodId) => {
    e.preventDefault();
    if (!sessionToken || !isAtPlanet || !planetId) {
      return;
    }

    setIsBuying(true);
    setBuyError(null);

    try {
      const updatedUser = await buyGoods(sessionToken, goodId, buyQuantity, planetId);
      setBuyingGoodId(null);
      setBuyQuantity(1);
      
      // Reload inventory
      const inventory = await getInventory(sessionToken);
      setInventoryData(inventory);
      
      // Reload market data
      const market = await getPlanetMarket(planetQ, planetR);
      setMarketData(market);

      // Notify parent of user update
      if (onBuySuccess) {
        onBuySuccess(updatedUser);
      }
    } catch (err) {
      setBuyError(err.message || 'Failed to buy goods');
    } finally {
      setIsBuying(false);
    }
  };

  const handleCancelBuy = () => {
    setBuyingGoodId(null);
    setBuyQuantity(1);
    setBuyError(null);
  };

  const handleSellClick = (goodId) => {
    if (!isAtPlanet) {
      setSellError('You can only sell goods on the planet where you are located');
      return;
    }
    setSellingGoodId(goodId);
    setSellQuantity(1);
    setSellError(null);
  };

  const handleSellSubmit = async (e, goodId) => {
    e.preventDefault();
    if (!sessionToken || !isAtPlanet || !planetId) {
      return;
    }

    setIsSelling(true);
    setSellError(null);

    try {
      const updatedUser = await sellGoods(sessionToken, goodId, sellQuantity, planetId);
      setSellingGoodId(null);
      setSellQuantity(1);
      
      // Reload inventory
      const inventory = await getInventory(sessionToken);
      setInventoryData(inventory);
      
      // Reload market data
      const market = await getPlanetMarket(planetQ, planetR);
      setMarketData(market);

      // Notify parent of user update
      if (onSellSuccess) {
        onSellSuccess(updatedUser);
      }
    } catch (err) {
      setSellError(err.message || 'Failed to sell goods');
    } finally {
      setIsSelling(false);
    }
  };

  const handleCancelSell = () => {
    setSellingGoodId(null);
    setSellQuantity(1);
    setSellError(null);
  };

  const getInventoryQuantity = (goodId) => {
    if (!inventoryData) return 0;
    const item = inventoryData.inventory.find(inv => inv.good.id === goodId);
    return item ? item.quantity : 0;
  };

  const getAvailableCargo = () => {
    if (!inventoryData) return null;
    return inventoryData.availableCargo;
  };

  const getCargoUsage = () => {
    if (!inventoryData) return null;
    return `${inventoryData.cargoUsage}/${inventoryData.cargoCapacity}`;
  };

  if (loading) {
    return (
      <div className="planet-market">
        <div className="planet-market__loading">Loading market prices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="planet-market">
        <div className="planet-market__error">Error: {error}</div>
      </div>
    );
  }

  if (!marketData) {
    return null;
  }

  // Separate goods into selling and buying categories
  const sellingGoods = marketData.market.filter((item) => item.selling);
  const buyingGoods = marketData.market.filter((item) => item.buying);

  const availableCargo = getAvailableCargo();
  const cargoUsage = getCargoUsage();

  return (
    <div className="planet-market">
      <h3 className="planet-market__title">Market Prices - {planetName}</h3>
      
      {/* Active Events for this planet */}
      {sessionToken && (
        <div className="planet-market__events">
          <ActiveEventsBar
            sessionToken={sessionToken}
            planetId={planetId}
            turn={0}
          />
        </div>
      )}
      
      {!isAtPlanet && (
        <div className="planet-market__warning">
          ⚠️ You must be at this planet to buy goods
        </div>
      )}

      {isAtPlanet && inventoryData && (
        <div className="planet-market__cargo-info">
          <div className="planet-market__cargo-stat">
            <span className="planet-market__cargo-label">Cargo:</span>
            <span className="planet-market__cargo-value">{cargoUsage}</span>
          </div>
          <div className="planet-market__cargo-stat">
            <span className="planet-market__cargo-label">Available:</span>
            <span className="planet-market__cargo-value">{availableCargo}</span>
          </div>
        </div>
      )}

      {buyError && (
        <div className="planet-market__error-message">{buyError}</div>
      )}

      {sellError && (
        <div className="planet-market__error-message">{sellError}</div>
      )}
      
      {sellingGoods.length > 0 && (
        <div className="planet-market__section">
          <h4 className="planet-market__section-title">Goods for Sale</h4>
          <div className="planet-market__table">
            <div className="planet-market__table-header">
              <div className="planet-market__col-name">Good</div>
              <div className="planet-market__col-type">Type</div>
              <div className="planet-market__col-price">Price</div>
              <div className="planet-market__col-base">Base</div>
              {isAtPlanet && <div className="planet-market__col-action">Action</div>}
            </div>
            {sellingGoods.map((item) => {
              const isBuyingThis = buyingGoodId === item.good.id;
              const totalCost = item.selling.price * buyQuantity;
              // Credits are in user.stats.credits, not playerPosition
              const canAfford = true; // Will be validated on backend
              const canFit = availableCargo !== null && buyQuantity <= availableCargo;

              return (
                <div key={item.good.id} className="planet-market__table-row">
                  <div className="planet-market__col-name">{item.good.name}</div>
                  <div className="planet-market__col-type">{item.good.type}</div>
                  <div className="planet-market__col-price planet-market__col-price--sell">
                    {item.selling.price.toLocaleString()} ₵
                  </div>
                  <div className="planet-market__col-base">
                    {item.good.basePrice.toLocaleString()} ₵
                  </div>
                  {isAtPlanet && (
                    <div className="planet-market__col-action">
                      {!isBuyingThis ? (
                        <button
                          type="button"
                          className="planet-market__buy-btn"
                          onClick={() => handleBuyClick(item.good.id)}
                          disabled={isBuying}
                        >
                          Buy
                        </button>
                      ) : (
                        <form
                          className="planet-market__buy-form"
                          onSubmit={(e) => handleBuySubmit(e, item.good.id)}
                        >
                          <input
                            type="number"
                            min="1"
                            max={availableCargo || 999}
                            value={buyQuantity}
                            onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                            className="planet-market__quantity-input"
                            disabled={isBuying}
                          />
                          <div className="planet-market__buy-actions">
                            <button
                              type="submit"
                              className="planet-market__confirm-btn"
                              disabled={isBuying || !canAfford || !canFit || buyQuantity < 1}
                            >
                              {isBuying ? 'Buying...' : `Buy (${totalCost.toLocaleString()} ₵)`}
                            </button>
                            <button
                              type="button"
                              className="planet-market__cancel-btn"
                              onClick={handleCancelBuy}
                              disabled={isBuying}
                            >
                              Cancel
                            </button>
                          </div>
                          {!canAfford && (
                            <div className="planet-market__buy-warning">
                              Insufficient credits
                            </div>
                          )}
                          {!canFit && (
                            <div className="planet-market__buy-warning">
                              Insufficient cargo space
                            </div>
                          )}
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {buyingGoods.length > 0 && (
        <div className="planet-market__section">
          <h4 className="planet-market__section-title">Goods in Demand</h4>
          <div className="planet-market__table">
            <div className="planet-market__table-header">
              <div className="planet-market__col-name">Good</div>
              <div className="planet-market__col-type">Type</div>
              <div className="planet-market__col-price">Price</div>
              <div className="planet-market__col-base">Base</div>
              {isAtPlanet && <div className="planet-market__col-action">Action</div>}
            </div>
            {buyingGoods.map((item) => {
              const isSellingThis = sellingGoodId === item.good.id;
              const inventoryQty = getInventoryQuantity(item.good.id);
              const totalCredits = item.buying.price * sellQuantity;
              const canSell = inventoryQty > 0 && sellQuantity <= inventoryQty;

              return (
                <div key={item.good.id} className="planet-market__table-row">
                  <div className="planet-market__col-name">{item.good.name}</div>
                  <div className="planet-market__col-type">{item.good.type}</div>
                  <div className="planet-market__col-price planet-market__col-price--buy">
                    {item.buying.price.toLocaleString()} ₵
                  </div>
                  <div className="planet-market__col-base">
                    {item.good.basePrice.toLocaleString()} ₵
                  </div>
                  {isAtPlanet && (
                    <div className="planet-market__col-action">
                      {!isSellingThis ? (
                        <button
                          type="button"
                          className="planet-market__sell-btn"
                          onClick={() => handleSellClick(item.good.id)}
                          disabled={isSelling || inventoryQty === 0}
                        >
                          Sell {inventoryQty > 0 ? `(${inventoryQty})` : ''}
                        </button>
                      ) : (
                        <form
                          className="planet-market__sell-form"
                          onSubmit={(e) => handleSellSubmit(e, item.good.id)}
                        >
                          <input
                            type="number"
                            min="1"
                            max={inventoryQty}
                            value={sellQuantity}
                            onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                            className="planet-market__quantity-input"
                            disabled={isSelling}
                          />
                          <div className="planet-market__sell-actions">
                            <button
                              type="submit"
                              className="planet-market__confirm-btn planet-market__confirm-btn--sell"
                              disabled={isSelling || !canSell || sellQuantity < 1}
                            >
                              {isSelling ? 'Selling...' : `Sell (${totalCredits.toLocaleString()} ₵)`}
                            </button>
                            <button
                              type="button"
                              className="planet-market__cancel-btn"
                              onClick={handleCancelSell}
                              disabled={isSelling}
                            >
                              Cancel
                            </button>
                          </div>
                          {!canSell && inventoryQty > 0 && (
                            <div className="planet-market__sell-warning">
                              Not enough in inventory
                            </div>
                          )}
                          {inventoryQty === 0 && (
                            <div className="planet-market__sell-warning">
                              You don't have this good
                            </div>
                          )}
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sellingGoods.length === 0 && buyingGoods.length === 0 && (
        <div className="planet-market__empty">
          No market data available for this planet.
        </div>
      )}

      {inventoryData && inventoryData.inventory.length > 0 && (
        <div className="planet-market__section planet-market__section--inventory">
          <h4 className="planet-market__section-title">Your Inventory</h4>
          <div className="planet-market__table">
            <div className="planet-market__table-header planet-market__table-header--inventory">
              <div className="planet-market__col-name">Good</div>
              <div className="planet-market__col-type">Type</div>
              <div className="planet-market__col-price">Quantity</div>
              {isAtPlanet && <div className="planet-market__col-action">Action</div>}
            </div>
            {inventoryData.inventory.map((item) => {
              const isSellingThis = sellingGoodId === item.good.id;
              const marketItem = buyingGoods.find(m => m.good.id === item.good.id);
              const canSell = marketItem && isAtPlanet;
              const sellPrice = marketItem ? marketItem.buying.price : 0;
              const totalCredits = sellPrice * sellQuantity;

              return (
                <div key={item.good.id} className="planet-market__table-row planet-market__table-row--inventory">
                  <div className="planet-market__col-name">{item.good.name}</div>
                  <div className="planet-market__col-type">{item.good.type}</div>
                  <div className="planet-market__col-price">{item.quantity}</div>
                  {isAtPlanet && (
                    <div className="planet-market__col-action">
                      {!isSellingThis ? (
                        canSell ? (
                          <button
                            type="button"
                            className="planet-market__sell-btn"
                            onClick={() => handleSellClick(item.good.id)}
                            disabled={isSelling}
                          >
                            Sell
                          </button>
                        ) : (
                          <span className="planet-market__no-demand">No demand</span>
                        )
                      ) : (
                        <form
                          className="planet-market__sell-form"
                          onSubmit={(e) => handleSellSubmit(e, item.good.id)}
                        >
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            value={sellQuantity}
                            onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                            className="planet-market__quantity-input"
                            disabled={isSelling}
                          />
                          <div className="planet-market__sell-actions">
                            <button
                              type="submit"
                              className="planet-market__confirm-btn planet-market__confirm-btn--sell"
                              disabled={isSelling || sellQuantity < 1 || sellQuantity > item.quantity}
                            >
                              {isSelling ? 'Selling...' : `Sell (${totalCredits.toLocaleString()} ₵)`}
                            </button>
                            <button
                              type="button"
                              className="planet-market__cancel-btn"
                              onClick={handleCancelSell}
                              disabled={isSelling}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanetMarket;
