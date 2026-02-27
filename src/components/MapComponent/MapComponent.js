import React, { useMemo, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* Fix default marker icon paths broken by CRA/webpack bundling */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * Build an SVG map-pin icon with the given fill color.
 * Returns an L.divIcon so we can use inline SVG without external assets.
 */
function createColoredIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z"
            fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

const greenIcon = createColoredIcon('#2e7d32');
const redIcon = createColoredIcon('#c62828');
const defaultIcon = createColoredIcon('#1976d2');

/**
 * MapComponent — renders an interactive Leaflet map with node markers.
 *
 * @param {Object} props
 * @param {Array<{nodeId: string, nodeName: string, lat: number, lon: number, online?: boolean, selected?: boolean}>} props.nodes
 *   Array of node objects. If `online` / `selected` are provided, markers are
 *   colored green (online) or red (offline) and use full (selected) or half (unselected) opacity.
 * @param {number} [props.centerLat] - Latitude for the map center (defaults to avg of nodes)
 * @param {number} [props.centerLon] - Longitude for the map center (defaults to avg of nodes)
 * @param {number} [props.zoom] - Initial zoom level (default 15)
 * @param {number|string} [props.height] - Map container height in pixels or CSS string (default 400)
 */
/** Programmatically re-center the map only when lat/lon actually change. */
function ChangeView({ center, zoom }) {
  const map = useMap();
  const prevCenter = useRef(center);
  useEffect(() => {
    const [prevLat, prevLon] = prevCenter.current;
    const [lat, lon] = center;
    if (prevLat !== lat || prevLon !== lon) {
      map.flyTo(center, zoom, { duration: 1 });
      prevCenter.current = center;
    }
  }, [map, center, zoom]);
  return null;
}

const DEFAULT_CENTER = [41.6611, -91.5302];

function MapComponent({ nodes = [], centerLat, centerLon, zoom = 15, height = 400 }) {
  const center = useMemo(() => {
    if (centerLat != null && centerLon != null) return [centerLat, centerLon];
    if (nodes.length > 0) {
      const avgLat = nodes.reduce((sum, n) => sum + n.lat, 0) / nodes.length;
      const avgLon = nodes.reduce((sum, n) => sum + n.lon, 0) / nodes.length;
      return [avgLat, avgLon];
    }
    return DEFAULT_CENTER;
  }, [nodes, centerLat, centerLon]);

  return (
    <Box sx={{ width: '100%', height, borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {nodes.map((node) => {
          const hasStatus = node.online !== undefined;
          const icon = hasStatus
            ? (node.online ? greenIcon : redIcon)
            : defaultIcon;
          const opacity = hasStatus
            ? (node.selected !== false ? 1.0 : 0.5)
            : 1.0;

          return (
            <Marker
              key={node.nodeId}
              position={[node.lat, node.lon]}
              icon={icon}
              opacity={opacity}
            >
              <Popup>
                <strong>{node.nodeName}</strong>
                <br />
                Lat: {node.lat}, Lon: {node.lon}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
}

export default MapComponent;
