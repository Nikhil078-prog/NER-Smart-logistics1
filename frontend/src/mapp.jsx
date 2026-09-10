 import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Vehicle icon
const vehicleIcon = L.divIcon({
  className: "vehicle-icon",
  html: "🚚",
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

function MapView() {

  // NER States
  const states = [
    { name: "Assam", position: [26.2, 92.9] },
    { name: "Arunachal Pradesh", position: [28.2, 94.7] },
    { name: "Manipur", position: [24.7, 93.9] },
    { name: "Meghalaya", position: [25.5, 91.3] },
    { name: "Mizoram", position: [23.7, 92.7] },
    { name: "Nagaland", position: [26.1, 94.1] },
    { name: "Tripura", position: [23.8, 91.3] },
    { name: "Sikkim", position: [27.5, 88.5] }
  ];

  // Vehicles
  const vehicles = [
    {
      id: "TRUCK-101",
      position: [26.1445, 91.7362],
      status: "Moving",
      route: "Guwahati → Shillong",
      speed: "52 km/h"
    },
    {
      id: "TRUCK-102",
      position: [27.4728, 94.9120],
      status: "Moving",
      route: "Dibrugarh → Itanagar",
      speed: "48 km/h"
    },
    {
      id: "TRUCK-103",
      position: [24.8170, 93.9368],
      status: "Stopped",
      route: "Imphal → Silchar",
      speed: "0 km/h"
    }
  ];

  // Risk Zones
  const riskZones = [
    {
      name: "Landslide Risk Zone",
      position: [25.6, 91.8],
      level: "High"
    },
    {
      name: "Flood Risk Zone",
      position: [26.1, 91.7],
      level: "Medium"
    },
    {
      name: "Road Accessibility Risk",
      position: [24.8, 93.9],
      level: "High"
    }
  ];

  // Logistics Routes
  const routes = [
    {
      name: "Guwahati → Shillong",
      positions: [
        [26.1445, 91.7362],
        [25.5788, 91.8933]
      ]
    },
    {
      name: "Dibrugarh → Itanagar",
      positions: [
        [27.4728, 94.9120],
        [27.0844, 93.6053]
      ]
    },
    {
      name: "Imphal → Silchar",
      positions: [
        [24.8170, 93.9368],
        [24.8333, 92.7789]
      ]
    }
  ];

  return (
    <div className="map-wrapper">

      {/* Map */}
      <MapContainer
        center={[25.5, 93.5]}
        zoom={6}
        className="ner-map"
      >

        {/* OpenStreetMap */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* NER State Markers */}
        {states.map((state) => (
          <Marker
            key={state.name}
            position={state.position}
          >
            <Popup>
              <strong>📍 {state.name}</strong>
              <br />
              North Eastern Region
              <br />
              Logistics monitoring active
            </Popup>
          </Marker>
        ))}

        {/* Vehicle Markers */}
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={vehicle.position}
            icon={vehicleIcon}
          >
            <Popup>
              <strong>🚚 {vehicle.id}</strong>
              <br />
              Status: {vehicle.status}
              <br />
              Route: {vehicle.route}
              <br />
              Speed: {vehicle.speed}
            </Popup>
          </Marker>
        ))}

        {/* Risk Zones */}
        {riskZones.map((zone) => (
          <Circle
            key={zone.name}
            center={zone.position}
            radius={15000}
            pathOptions={{
              fillOpacity: 0.25,
              weight: 2
            }}
          >
            <Popup>
              <strong>⚠️ {zone.name}</strong>
              <br />
              Risk Level: {zone.level}
            </Popup>
          </Circle>
        ))}

        {/* Logistics Routes */}
        {routes.map((route) => (
          <Polyline
            key={route.name}
            positions={route.positions}
            pathOptions={{
              weight: 5
            }}
          >
            <Popup>
              <strong>🛣️ {route.name}</strong>
              <br />
              Active Logistics Route
            </Popup>
          </Polyline>
        ))}

      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">

        <h4>🗺️ Map Legend</h4>

        <div className="legend-item">
          <span>📍</span>
          <span>NER Location</span>
        </div>

        <div className="legend-item">
          <span>🚚</span>
          <span>Active Vehicle</span>
        </div>

        <div className="legend-item">
          <span>⚠️</span>
          <span>Risk Zone</span>
        </div>

        <div className="legend-item">
          <span>🟦</span>
          <span>Logistics Route</span>
        </div>

      </div>

    </div>
  );
}

export default MapView;