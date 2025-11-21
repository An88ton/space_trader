import { useEffect, useState, useRef, useCallback } from 'react';
import { hexToPixel, hexPath } from '../utils/hex-coordinates';
import {
  getUniverseMap,
  getUniverseStatus,
  generateUniverse,
  getPath,
} from '../api/universe';
import { travelToPlanet } from '../api/travel';
import PlanetMarket from './PlanetMarket';
import './HexGridMap.css';

const HEX_SIZE = 25;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

function HexGridMap({ playerPosition = null, sessionToken = null, onTravelSuccess = null }) {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHex, setSelectedHex] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [path, setPath] = useState(null);
  const [pathStart, setPathStart] = useState(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelError, setTravelError] = useState(null);
  const [showMarket, setShowMarket] = useState(false);

  // Pan and zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const hasCenteredOnPlayer = useRef(false);
  const playerHex = playerPosition?.hex ?? null;

  // Load universe data
  const loadMap = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const status = await getUniverseStatus();
      if (!status.isGenerated) {
        // Auto-generate universe if not exists
        setIsGenerating(true);
        await generateUniverse({
          hexRadius: 10,
          planetCount: 50,
          seed: 'default-universe',
        });
        setIsGenerating(false);
      }

      const data = await getUniverseMap();
      setMapData(data);

      // Center the map
      if (data.bounds) {
        const centerHex = {
          q: Math.round((data.bounds.minQ + data.bounds.maxQ) / 2),
          r: Math.round((data.bounds.minR + data.bounds.maxR) / 2),
        };
        const centerPixel = hexToPixel(centerHex, HEX_SIZE);
        setPan({
          x: (window.innerWidth || 800) / 2 - centerPixel.x,
          y: (window.innerHeight || 600) / 2 - centerPixel.y,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load universe map');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  useEffect(() => {
    if (!mapData || !playerHex || hasCenteredOnPlayer.current) {
      return;
    }

    const playerPixel = hexToPixel(playerHex, HEX_SIZE);
    hasCenteredOnPlayer.current = true;
    setPan({
      x: (window.innerWidth || 800) / 2 - playerPixel.x,
      y: (window.innerHeight || 600) / 2 - playerPixel.y,
    });
  }, [mapData, playerHex]);

  // Handle hex click
  const handleHexClick = useCallback(
    async (hex, event) => {
      event.stopPropagation();

      if (pathStart) {
        // Calculate path
        try {
          const pathData = await getPath(pathStart.q, pathStart.r, hex.q, hex.r);
          setPath(pathData.path);
          setPathStart(null);
        } catch (err) {
          console.error('Failed to calculate path:', err);
          setPathStart(null);
        }
      } else {
        // Select hex
        setSelectedHex(hex);
        const planet = mapData?.planets.find(
          (p) => p.hexQ === hex.q && p.hexR === hex.r,
        );
        setSelectedPlanet(planet || null);
      }
    },
    [mapData, pathStart],
  );

  // Handle right-click to set path start
  const handleHexRightClick = useCallback((hex, event) => {
    event.preventDefault();
    setPathStart(hex);
    setPath(null);
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) {
      // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handlers
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
      setZoom(newZoom);
    },
    [zoom],
  );

  // Handle travel
  const handleTravel = useCallback(async () => {
    if (!selectedPlanet || !sessionToken || isTraveling) {
      return;
    }

    // Check if already at this planet
    if (playerPosition?.planetId === selectedPlanet.id) {
      setTravelError('You are already at this planet');
      return;
    }

    setIsTraveling(true);
    setTravelError(null);

    try {
      const result = await travelToPlanet(sessionToken, selectedPlanet.id);
      
      // Call success callback if provided
      if (onTravelSuccess) {
        onTravelSuccess(result.user);
      }

      // Clear selection and reload map
      setSelectedHex(null);
      setSelectedPlanet(null);
      setPath(null);
      setPathStart(null);
      
      // Reload map to show updated position
      await loadMap();
    } catch (err) {
      setTravelError(err.message || 'Travel failed');
    } finally {
      setIsTraveling(false);
    }
  }, [selectedPlanet, sessionToken, isTraveling, playerPosition, onTravelSuccess, loadMap]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setSelectedHex(null);
        setSelectedPlanet(null);
        setPath(null);
        setPathStart(null);
        setTravelError(null);
      }
      if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      }
      if (e.key === '-') {
        setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (loading || isGenerating) {
    return (
      <div className="hex-grid-map__loading">
        <p>{isGenerating ? 'Generating universe...' : 'Loading universe map...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hex-grid-map__error">
        <p>Error: {error}</p>
        <button onClick={loadMap}>Retry</button>
      </div>
    );
  }

  if (!mapData) {
    return null;
  }

  const hexPositions = mapData.hexes.map((hex) => {
    const pixel = hexToPixel({ q: hex.q, r: hex.r }, HEX_SIZE);
    return { ...hex, pixel };
  });

  return (
    <div
      className="hex-grid-map"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        className="hex-grid-map__svg"
        viewBox={`0 0 ${window.innerWidth || 800} ${window.innerHeight || 600}`}
        preserveAspectRatio="none"
      >
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          className="hex-grid-map__transform"
        >
          {/* Render hexes */}
          {hexPositions.map((hex) => {
            const hasPlanet = mapData.planets.some(
              (p) => p.hexQ === hex.q && p.hexR === hex.r,
            );
            const isSelected =
              selectedHex?.q === hex.q && selectedHex?.r === hex.r;
            const isPathStart =
              pathStart?.q === hex.q && pathStart?.r === hex.r;
            const isInPath =
              path && path.some((p) => p.q === hex.q && p.r === hex.r);
            const isPlayerHex =
              playerHex && playerHex.q === hex.q && playerHex.r === hex.r;

            return (
              <g
                key={`${hex.q},${hex.r}`}
                transform={`translate(${hex.pixel.x}, ${hex.pixel.y})`}
                onClick={(e) => handleHexClick({ q: hex.q, r: hex.r }, e)}
                onContextMenu={(e) =>
                  handleHexRightClick({ q: hex.q, r: hex.r }, e)
                }
                className="hex-grid-map__hex-group"
              >
                <path
                  d={hexPath(HEX_SIZE)}
                  className={`hex-grid-map__hex ${
                    hasPlanet ? 'hex-grid-map__hex--has-planet' : ''
                  } ${isSelected ? 'hex-grid-map__hex--selected' : ''} ${
                    isPathStart ? 'hex-grid-map__hex--path-start' : ''
                  } ${isInPath ? 'hex-grid-map__hex--in-path' : ''} ${
                    isPlayerHex ? 'hex-grid-map__hex--player' : ''
                  }`}
                />
                {hasPlanet && (
                  <circle
                    r={HEX_SIZE * 0.4}
                    className="hex-grid-map__planet-marker"
                  />
                )}
                {isPlayerHex && (
                  <circle
                    r={HEX_SIZE * 0.18}
                    className="hex-grid-map__player-marker"
                  />
                )}
                {/* Debug: show coordinates */}
                {zoom > 1.5 && (
                  <text
                    y={HEX_SIZE * 0.3}
                    textAnchor="middle"
                    className="hex-grid-map__hex-label"
                    fontSize={HEX_SIZE * 0.4}
                    pointerEvents="none"
                  >
                    {hex.q},{hex.r}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Controls */}
      <div className="hex-grid-map__controls">
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          className="hex-grid-map__control-button"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          className="hex-grid-map__control-button"
        >
          −
        </button>
        <button
          onClick={() => setZoom(1)}
          className="hex-grid-map__control-button"
        >
          Reset Zoom
        </button>
        <div className="hex-grid-map__zoom-indicator">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Info panel */}
      {(selectedHex || selectedPlanet || pathStart || playerPosition) && (
        <div className="hex-grid-map__info-panel">
          {playerPosition && (
            <div className="hex-grid-map__info-item">
              <strong>Your Ship</strong>
              <small>{playerPosition.planetName}</small>
              {playerPosition.hex && (
                <small>
                  Hex: ({playerPosition.hex.q}, {playerPosition.hex.r})
                </small>
              )}
            </div>
          )}
          {pathStart && (
            <div className="hex-grid-map__info-item">
              <strong>Path Start:</strong> ({pathStart.q}, {pathStart.r})
              <br />
              <small>Right-click another hex to set end point</small>
            </div>
          )}
          {selectedHex && (
            <div className="hex-grid-map__info-item">
              <strong>Hex:</strong> ({selectedHex.q}, {selectedHex.r})
            </div>
          )}
          {selectedPlanet && (
            <div className="hex-grid-map__info-item">
              <strong>Planet:</strong> {selectedPlanet.name}
              <br />
              <small>Type: {selectedPlanet.planetType}</small>
              <br />
              <small>Faction: {selectedPlanet.faction || 'Unclaimed'}</small>
              <br />
              <small>Security: {selectedPlanet.securityLevel}</small>
              <br />
              <small>Docking Fee: {selectedPlanet.dockingFee} credits</small>
              {selectedPlanet.resources && selectedPlanet.resources.length > 0 && (
                <>
                  <br />
                  <small>Resources: {selectedPlanet.resources.join(', ')}</small>
                </>
              )}
              <br />
              <br />
              <button
                onClick={() => setShowMarket(!showMarket)}
                style={{
                  padding: '8px 16px',
                  background: showMarket ? '#666' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%',
                  marginBottom: '8px',
                }}
              >
                {showMarket ? 'Hide Market' : 'View Market Prices'}
              </button>
              {playerPosition?.planetId !== selectedPlanet.id && sessionToken && (
                <>
                  <button
                    onClick={handleTravel}
                    disabled={isTraveling}
                    style={{
                      padding: '8px 16px',
                      background: isTraveling ? '#666' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isTraveling ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      width: '100%',
                    }}
                  >
                    {isTraveling ? 'Traveling...' : 'Travel Here'}
                  </button>
                </>
              )}
              {travelError && (
                <div style={{ marginTop: '8px', color: '#ff4444', fontSize: '12px' }}>
                  {travelError}
                </div>
              )}
            </div>
          )}
          {path && path.length > 0 && (
            <div className="hex-grid-map__info-item">
              <strong>Path:</strong> {path.length - 1} hexes
            </div>
          )}
          <button
            onClick={() => {
              setSelectedHex(null);
              setSelectedPlanet(null);
              setPath(null);
              setPathStart(null);
              setTravelError(null);
              setShowMarket(false);
            }}
            className="hex-grid-map__close-button"
          >
            ×
          </button>
        </div>
      )}

      {/* Market Prices Modal */}
      {showMarket && selectedPlanet && (
        <div className="hex-grid-map__market-modal">
          <div className="hex-grid-map__market-modal-content">
            <button
              onClick={() => setShowMarket(false)}
              className="hex-grid-map__market-modal-close"
            >
              ×
            </button>
            <PlanetMarket
              planetQ={selectedPlanet.hexQ}
              planetR={selectedPlanet.hexR}
              planetName={selectedPlanet.name}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="hex-grid-map__instructions">
        <small>
          Click hex to select • Right-click to set path start • Drag to pan •
          Scroll to zoom • Press ESC to clear • Gold hex = your ship
        </small>
      </div>
    </div>
  );
}

export default HexGridMap;

