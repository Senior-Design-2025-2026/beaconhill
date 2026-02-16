import React from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
 * MapComponent — renders an interactive Leaflet map with node markers.
 *
 * @param {Object} props
 * @param {Array<{nodeId: string, nodeName: string, lat: number, lon: number}>} props.nodes
 *   Array of node objects to plot as pins on the map.
 * @param {number} [props.centerLat] - Latitude for the map center (defaults to avg of nodes)
 * @param {number} [props.centerLon] - Longitude for the map center (defaults to avg of nodes)
 * @param {number} [props.zoom] - Initial zoom level (default 15)
 * @param {number} [props.height] - Map container height in pixels (default 400)
 */
function MapComponent({ nodes = [], centerLat, centerLon, zoom = 15, height = 400 }) {
  const defaultCenter = [41.6611, -91.5302];

  let center = defaultCenter;
  if (centerLat != null && centerLon != null) {
    center = [centerLat, centerLon];
  } else if (nodes.length > 0) {
    const avgLat = nodes.reduce((sum, n) => sum + n.lat, 0) / nodes.length;
    const avgLon = nodes.reduce((sum, n) => sum + n.lon, 0) / nodes.length;
    center = [avgLat, avgLon];
  }

  return (
    <Box sx={{ width: '100%', height, borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {nodes.map((node) => (
          <Marker key={node.nodeId} position={[node.lat, node.lon]}>
            <Popup>
              <strong>{node.nodeName}</strong>
              <br />
              Lat: {node.lat}, Lon: {node.lon}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}

export default MapComponent;
