 import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./App.css";

const API = "http://localhost:5000";

const routeCoordinates = {
  "R-001": [
    [26.1445, 91.7362],
    [25.5788, 91.8933]
  ],

  "R-002": [
    [24.817, 93.9368],
    [25.5788, 93.7273]
  ],

  "R-003": [
    [23.8315, 91.2868],
    [26.1445, 91.7362]
  ]
};

function getRiskColor(level) {
  if (level === "Critical") {
    return "#7f1d1d";
  }

  if (level === "High") {
    return "#dc2626";
  }

  if (level === "Medium") {
    return "#f59e0b";
  }

  return "#16a34a";
}

function getWeatherIcon(condition) {
  const value = String(condition || "").toLowerCase();

  if (value.includes("heavy")) {
    return "🌧️";
  }

  if (value.includes("rain")) {
    return "🌦️";
  }

  if (value.includes("cloud")) {
    return "☁️";
  }

  if (value.includes("sun")) {
    return "☀️";
  }

  return "🌤️";
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function generateWeatherAlerts(weatherData) {
  const generatedAlerts = [];

  weatherData.forEach(function (item, index) {
    const reasons = [];

    const rainfall = Number(item.rainfall);
    const visibility = Number(item.visibility);

    if (
      item.riskLevel === "High" ||
      item.riskLevel === "Critical"
    ) {
      reasons.push(
        item.riskLevel + " weather risk detected"
      );
    }

    if (rainfall >= 60) {
      reasons.push(
        "heavy rainfall of " + rainfall + " mm"
      );
    }

    if (visibility <= 4) {
      reasons.push(
        "low visibility of " + visibility + " km"
      );
    }

    const roadCondition = String(
      item.roadCondition || ""
    ).toLowerCase();

    if (
      roadCondition.includes("wet") ||
      roadCondition.includes("poor")
    ) {
      reasons.push(
        "road condition is " + item.roadCondition
      );
    }

    if (reasons.length === 0) {
      return;
    }

    let severity = "Medium";

    if (
      item.riskLevel === "High" ||
      item.riskLevel === "Critical" ||
      rainfall >= 60 ||
      visibility <= 4
    ) {
      severity = "High";
    }

    generatedAlerts.push({
      id: "weather-" + index,
      location: item.location,
      state: item.state,
      condition: item.condition,
      rainfall: item.rainfall,
      visibility: item.visibility,
      roadCondition: item.roadCondition,
      severity: severity,
      reasons: reasons
    });
  });

  return generatedAlerts;
}

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState([]);
  const [aiRisk, setAiRisk] = useState(null);

  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  async function loadDashboardData() {
    try {
      const responses = await Promise.all([
        fetch(API + "/api/vehicles"),
        fetch(API + "/api/routes"),
        fetch(API + "/api/risk-zones"),
        fetch(API + "/api/alerts"),
        fetch(API + "/api/ai/risk-analysis"),
        fetch(API + "/api/weather")
      ]);

      const vehiclesResponse = responses[0];
      const routesResponse = responses[1];
      const zonesResponse = responses[2];
      const alertsResponse = responses[3];
      const aiResponse = responses[4];
      const weatherResponse = responses[5];

      if (
        !vehiclesResponse.ok ||
        !routesResponse.ok ||
        !zonesResponse.ok ||
        !alertsResponse.ok ||
        !aiResponse.ok ||
        !weatherResponse.ok
      ) {
        throw new Error("One or more APIs failed");
      }

      const vehiclesData =
        await vehiclesResponse.json();

      const routesData =
        await routesResponse.json();

      const zonesData =
        await zonesResponse.json();

      const alertsData =
        await alertsResponse.json();

      const aiData =
        await aiResponse.json();

      const weatherData =
        await weatherResponse.json();

      setVehicles(vehiclesData);
      setRoutes(routesData);
      setRiskZones(zonesData);
      setAlerts(alertsData);
      setAiRisk(aiData);

      if (Array.isArray(weatherData)) {
        setWeather(weatherData);
      } else {
        setWeather(weatherData.data || []);
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setLoading(false);
    }
  }

  useEffect(function () {
    loadDashboardData();

    const refreshTimer = setInterval(
      function () {
        loadDashboardData();
      },
      10000
    );

    return function () {
      clearInterval(refreshTimer);
    };
  }, []);

  useEffect(function () {
    const movementTimer = setInterval(
      function () {
        setVehicles(function (currentVehicles) {
          return currentVehicles.map(
            function (vehicle) {
              if (vehicle.status !== "Active") {
                return vehicle;
              }

              const latitudeChange =
                (Math.random() - 0.5) * 0.01;

              const longitudeChange =
                (Math.random() - 0.5) * 0.01;

              return {
                ...vehicle,

                latitude:
                  Number(vehicle.latitude) +
                  latitudeChange,

                longitude:
                  Number(vehicle.longitude) +
                  longitudeChange
              };
            }
          );
        });
      },
      3000
    );

    return function () {
      clearInterval(movementTimer);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          <h2>NER Smart Logistics</h2>

          <p>
            Loading intelligence dashboard...
          </p>
        </div>
      </div>
    );
  }

  const activeVehicles = vehicles.filter(
    function (vehicle) {
      return vehicle.status === "Active";
    }
  ).length;

  const activeAlerts = alerts.filter(
    function (alert) {
      return alert.active;
    }
  ).length;

  const highRiskZones = riskZones.filter(
    function (zone) {
      return (
        zone.riskLevel === "High" ||
        zone.riskLevel === "Critical"
      );
    }
  ).length;

  const weatherAlerts =
    generateWeatherAlerts(weather);

  const totalIntelligentAlerts =
    activeAlerts + weatherAlerts.length;

  return (
    <div className="app">

      {/* HEADER */}

      <header className="top-header">

        <div>
          <h1>NER Smart Logistics</h1>

          <p>
            AI-Based Smart Logistics &
            Accessibility Intelligence Platform
          </p>
        </div>

        <div className="header-status">

          <span className="live-badge">
            ● SYSTEM ONLINE
          </span>

          <button
            className="refresh-button"
            onClick={loadDashboardData}
          >
            ↻ Refresh
          </button>

        </div>

      </header>

      {/* STATISTICS */}

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            🚚
          </div>

          <div>
            <span>Total Vehicles</span>
            <strong>{vehicles.length}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            🛰️
          </div>

          <div>
            <span>Active Vehicles</span>
            <strong>{activeVehicles}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            ⚠️
          </div>

          <div>
            <span>High Risk Zones</span>
            <strong>{highRiskZones}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            🚨
          </div>

          <div>
            <span>Intelligent Alerts</span>
            <strong>
              {totalIntelligentAlerts}
            </strong>
          </div>

        </div>

      </section>

      {/* AI RISK */}

      {aiRisk && (
        <section className="dashboard-card ai-card">

          <div className="card-header">

            <div>

              <h2>
                🤖 AI Risk Intelligence
              </h2>

              <p>
                Automated logistics risk analysis
              </p>

            </div>

            <span
              className="risk-badge"
              style={{
                backgroundColor:
                  getRiskColor(
                    aiRisk.riskLevel
                  )
              }}
            >
              {aiRisk.riskLevel}
            </span>

          </div>

          <div className="ai-content">

            <div className="ai-score">

              <span>Risk Score</span>

              <strong>
                {aiRisk.riskScore}
              </strong>

              <small>/ 100</small>

            </div>

            <div className="ai-details">

              <p>
                <strong>
                  High Risk Zones:
                </strong>{" "}
                {aiRisk.highRiskZones}
              </p>

              <p>
                <strong>
                  Recommendation:
                </strong>{" "}
                {aiRisk.recommendation}
              </p>

              <p>
                <strong>
                  Engine:
                </strong>{" "}
                {aiRisk.engine}
              </p>

            </div>

          </div>

        </section>
      )}

      {/* MAP */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              🗺️ NER Logistics Map
            </h2>

            <p>
              Vehicle tracking, routes and
              risk zones
            </p>

          </div>

          <span className="live-badge">
            ● LIVE TRACKING
          </span>

        </div>

        <div className="map-container">

          <MapContainer
            center={[25.8, 92.5]}
            zoom={6}
            scrollWheelZoom={true}
            style={{
              width: "100%",
              height: "500px"
            }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* ROUTES */}

            {routes.map(function (route) {

              const coordinates =
                routeCoordinates[
                  route.routeId
                ];

              if (!coordinates) {
                return null;
              }

              return (
                <Polyline
                  key={route.routeId}
                  positions={coordinates}
                  pathOptions={{
                    color:
                      getRiskColor(
                        route.riskLevel
                      ),
                    weight: 5
                  }}
                >

                  <Popup>

                    <strong>
                      {route.routeId}
                    </strong>

                    <br />

                    {route.source} →{" "}
                    {route.destination}

                    <br />

                    Distance:{" "}
                    {route.distance} km

                    <br />

                    Risk:{" "}
                    {route.riskLevel}

                  </Popup>

                </Polyline>
              );
            })}

            {/* VEHICLES */}

            {vehicles.map(function (vehicle) {

              return (
                <CircleMarker
                  key={
                    vehicle._id ||
                    vehicle.vehicleNumber
                  }
                  center={[
                    Number(vehicle.latitude),
                    Number(vehicle.longitude)
                  ]}
                  radius={9}
                  pathOptions={{
                    color:
                      getRiskColor(
                        vehicle.riskLevel
                      ),
                    fillColor:
                      getRiskColor(
                        vehicle.riskLevel
                      ),
                    fillOpacity: 0.85
                  }}
                >

                  <Popup>

                    <strong>
                      {vehicle.vehicleNumber}
                    </strong>

                    <br />

                    Driver:{" "}
                    {vehicle.driverName}

                    <br />

                    Type:{" "}
                    {vehicle.vehicleType}

                    <br />

                    State:{" "}
                    {vehicle.state}

                    <br />

                    Status:{" "}
                    {vehicle.status}

                    <br />

                    Risk:{" "}
                    {vehicle.riskLevel}

                  </Popup>

                </CircleMarker>
              );
            })}

            {/* RISK ZONES */}

            {riskZones.map(function (zone) {

              return (
                <CircleMarker
                  key={
                    zone.name +
                    "-" +
                    zone.state
                  }
                  center={[
                    Number(zone.latitude),
                    Number(zone.longitude)
                  ]}
                  radius={13}
                  pathOptions={{
                    color:
                      getRiskColor(
                        zone.riskLevel
                      ),
                    fillColor:
                      getRiskColor(
                        zone.riskLevel
                      ),
                    fillOpacity: 0.35
                  }}
                >

                  <Popup>

                    <strong>
                      ⚠️ {zone.name}
                    </strong>

                    <br />

                    State: {zone.state}

                    <br />

                    Risk: {zone.riskLevel}

                    <br />

                    Reason: {zone.reason}

                  </Popup>

                </CircleMarker>
              );
            })}

          </MapContainer>

        </div>

      </section>

      {/* WEATHER */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              🌦️ Weather Intelligence
            </h2>

            <p>
              Weather and road-condition
              monitoring
            </p>

          </div>

          <span className="live-badge">
            WEATHER ENGINE
          </span>

        </div>

        <div className="weather-grid">

          {weather.map(function (item) {

            return (
              <div
                className="weather-card"
                key={
                  item.location +
                  "-" +
                  item.state
                }
              >

                <div className="weather-top">

                  <div>

                    <h3>
                      {item.location}
                    </h3>

                    <p>
                      {item.state}
                    </p>

                  </div>

                  <div className="weather-icon">
                    {getWeatherIcon(
                      item.condition
                    )}
                  </div>

                </div>

                <div className="temperature">
                  {item.temperature}°C
                </div>

                <div className="weather-condition">
                  {item.condition}
                </div>

                <div className="weather-details">

                  <div>
                    <span>
                      Rainfall
                    </span>

                    <strong>
                      {item.rainfall} mm
                    </strong>
                  </div>

                  <div>
                    <span>
                      Visibility
                    </span>

                    <strong>
                      {item.visibility} km
                    </strong>
                  </div>

                  <div>
                    <span>
                      Road
                    </span>

                    <strong>
                      {item.roadCondition}
                    </strong>
                  </div>

                </div>

                <div
                  className="weather-risk"
                  style={{
                    color:
                      getRiskColor(
                        item.riskLevel
                      )
                  }}
                >
                  Risk: {item.riskLevel}
                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* SMART WEATHER ALERTS */}

      {weatherAlerts.length > 0 && (

        <section className="dashboard-card warning-card">

          <div className="card-header">

            <div>

              <h2>
                🚨 Smart Weather Risk Alerts
              </h2>

              <p>
                Automatically generated
                logistics warnings from
                weather intelligence
              </p>

            </div>

            <span className="live-badge">
              ● AI MONITORING
            </span>

          </div>

          <div className="alerts-list">

            {weatherAlerts.map(
              function (item) {

                return (
                  <div
                    className="alert-card"
                    key={item.id}
                  >

                    <div className="alert-icon">

                      {item.severity === "High"
                        ? "🚨"
                        : "⚠️"}

                    </div>

                    <div className="alert-content">

                      <h3>
                        {item.location}
                        {" "}Weather Risk
                      </h3>

                      <p>
                        {item.condition}
                        {" "}detected with{" "}
                        {item.rainfall}
                        {" "}mm rainfall,
                        visibility of{" "}
                        {item.visibility}
                        {" "}km and{" "}
                        {String(
                          item.roadCondition
                        ).toLowerCase()}
                        {" "}road conditions.
                      </p>

                      <p>
                        <strong>
                          Detection:
                        </strong>{" "}
                        {item.reasons.join(
                          ", "
                        )}
                        .
                      </p>

                      <p>
                        <strong>
                          Recommendation:
                        </strong>{" "}
                        Monitor the affected
                        route and use extra
                        caution during
                        logistics operations.
                      </p>

                      <small>
                        {item.state}
                      </small>

                    </div>

                    <span
                      className="alert-severity"
                      style={{
                        color:
                          getRiskColor(
                            item.severity
                          )
                      }}
                    >
                      {item.severity}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </section>
      )}

      {/* VEHICLE PROXIMITY */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              📍 Vehicle Proximity
              Intelligence
            </h2>

            <p>
              Distance between active vehicles
              and risk zones
            </p>

          </div>

        </div>

        <div className="proximity-grid">

          {vehicles
            .filter(function (vehicle) {
              return vehicle.status === "Active";
            })
            .map(function (vehicle) {

              let nearestZone = null;
              let nearestDistance = Infinity;

              riskZones.forEach(
                function (zone) {

                  const distance =
                    calculateDistance(
                      Number(
                        vehicle.latitude
                      ),
                      Number(
                        vehicle.longitude
                      ),
                      Number(
                        zone.latitude
                      ),
                      Number(
                        zone.longitude
                      )
                    );

                  if (
                    distance <
                    nearestDistance
                  ) {
                    nearestDistance =
                      distance;

                    nearestZone = zone;
                  }
                }
              );

              return (
                <div
                  className="proximity-card"
                  key={
                    vehicle._id ||
                    vehicle.vehicleNumber
                  }
                >

                  <h3>
                    🚚{" "}
                    {vehicle.vehicleNumber}
                  </h3>

                  <p>
                    Driver:{" "}
                    {vehicle.driverName}
                  </p>

                  {nearestZone && (
                    <>
                      <p>
                        Nearest Zone:{" "}
                        {nearestZone.name}
                      </p>

                      <strong>
                        {nearestDistance.toFixed(
                          1
                        )}{" "}
                        km away
                      </strong>
                    </>
                  )}

                </div>
              );
            })}

        </div>

      </section>

      {/* VEHICLES TABLE */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              🚚 Vehicle Monitoring
            </h2>

            <p>
              Current fleet information
            </p>

          </div>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Type</th>
                <th>State</th>
                <th>Status</th>
                <th>Risk</th>
              </tr>

            </thead>

            <tbody>

              {vehicles.map(function (vehicle) {

                return (
                  <tr
                    key={
                      vehicle._id ||
                      vehicle.vehicleNumber
                    }
                  >

                    <td>
                      <strong>
                        {vehicle.vehicleNumber}
                      </strong>
                    </td>

                    <td>
                      {vehicle.driverName}
                    </td>

                    <td>
                      {vehicle.vehicleType}
                    </td>

                    <td>
                      {vehicle.state}
                    </td>

                    <td>
                      {vehicle.status}
                    </td>

                    <td
                      style={{
                        color:
                          getRiskColor(
                            vehicle.riskLevel
                          ),
                        fontWeight: "700"
                      }}
                    >
                      {vehicle.riskLevel}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </section>

      {/* ROUTES */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              🛣️ Route Management
            </h2>

            <p>
              Logistics route risk monitoring
            </p>

          </div>

        </div>

        <div className="routes-grid">

          {routes.map(function (route) {

            return (
              <div
                className="route-card"
                key={route.routeId}
              >

                <div className="route-header">

                  <strong>
                    {route.routeId}
                  </strong>

                  <span
                    style={{
                      color:
                        getRiskColor(
                          route.riskLevel
                        ),
                      fontWeight: "700"
                    }}
                  >
                    {route.riskLevel}
                  </span>

                </div>

                <h3>
                  {route.source} →{" "}
                  {route.destination}
                </h3>

                <p>
                  Distance:{" "}
                  {route.distance} km
                </p>

                <p>
                  Status:{" "}
                  {route.status}
                </p>

              </div>
            );
          })}

        </div>

      </section>

      {/* RISK ZONES */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              ⚠️ Risk Zones
            </h2>

            <p>
              Accessibility and logistics
              risk areas
            </p>

          </div>

        </div>

        <div className="risk-zone-grid">

          {riskZones.map(function (zone) {

            return (
              <div
                className="risk-zone-card"
                key={
                  zone.name +
                  "-" +
                  zone.state
                }
              >

                <div className="route-header">

                  <h3>
                    {zone.name}
                  </h3>

                  <span
                    style={{
                      color:
                        getRiskColor(
                          zone.riskLevel
                        ),
                      fontWeight: "700"
                    }}
                  >
                    {zone.riskLevel}
                  </span>

                </div>

                <p>
                  <strong>
                    State:
                  </strong>{" "}
                  {zone.state}
                </p>

                <p>
                  <strong>
                    Reason:
                  </strong>{" "}
                  {zone.reason}
                </p>

              </div>
            );
          })}

        </div>

      </section>

      {/* SYSTEM ALERTS */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              🔔 System Alerts
            </h2>

            <p>
              Logistics intelligence
              notifications
            </p>

          </div>

        </div>

        <div className="alerts-list">

          {alerts.map(function (alert, index) {

            return (
              <div
                className="alert-card"
                key={
                  alert._id ||
                  alert.title +
                    "-" +
                    index
                }
              >

                <div className="alert-icon">

                  {alert.severity === "High"
                    ? "🚨"
                    : "⚠️"}

                </div>

                <div className="alert-content">

                  <h3>
                    {alert.title}
                  </h3>

                  <p>
                    {alert.message}
                  </p>

                  <small>
                    {alert.location}
                  </small>

                </div>

                <span
                  style={{
                    color:
                      getRiskColor(
                        alert.severity
                      ),
                    fontWeight: "700"
                  }}
                >
                  {alert.severity}
                </span>

              </div>
            );
          })}

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div>

          <strong>
            NER Smart Logistics
          </strong>

          <p>
            AI-Based Logistics &
            Accessibility Intelligence
            Platform
          </p>

        </div>

        <div>

          <p>
            Last Update:{" "}
            {lastUpdate
              ? lastUpdate.toLocaleTimeString()
              : "Loading..."}
          </p>

          <p>
            © 2026 NER Smart Logistics
          </p>

        </div>

      </footer>

    </div>
  );
}

export default App;