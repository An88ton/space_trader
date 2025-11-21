import { useState, useEffect } from 'react';
import { getPlanetMarket } from '../api/universe';
import './PlanetMarket.css';

function PlanetMarket({ planetQ, planetR, planetName }) {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="planet-market">
      <h3 className="planet-market__title">Market Prices - {planetName}</h3>
      
      {sellingGoods.length > 0 && (
        <div className="planet-market__section">
          <h4 className="planet-market__section-title">Goods for Sale</h4>
          <div className="planet-market__table">
            <div className="planet-market__table-header">
              <div className="planet-market__col-name">Good</div>
              <div className="planet-market__col-type">Type</div>
              <div className="planet-market__col-price">Price</div>
              <div className="planet-market__col-base">Base</div>
            </div>
            {sellingGoods.map((item) => (
              <div key={item.good.id} className="planet-market__table-row">
                <div className="planet-market__col-name">{item.good.name}</div>
                <div className="planet-market__col-type">{item.good.type}</div>
                <div className="planet-market__col-price planet-market__col-price--sell">
                  {item.selling.price.toLocaleString()} ₵
                </div>
                <div className="planet-market__col-base">
                  {item.good.basePrice.toLocaleString()} ₵
                </div>
              </div>
            ))}
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
            </div>
            {buyingGoods.map((item) => (
              <div key={item.good.id} className="planet-market__table-row">
                <div className="planet-market__col-name">{item.good.name}</div>
                <div className="planet-market__col-type">{item.good.type}</div>
                <div className="planet-market__col-price planet-market__col-price--buy">
                  {item.buying.price.toLocaleString()} ₵
                </div>
                <div className="planet-market__col-base">
                  {item.good.basePrice.toLocaleString()} ₵
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sellingGoods.length === 0 && buyingGoods.length === 0 && (
        <div className="planet-market__empty">
          No market data available for this planet.
        </div>
      )}
    </div>
  );
}

export default PlanetMarket;

