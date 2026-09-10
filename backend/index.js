 require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed:");
    console.log(error.message);
  });


// ===============================
// DATABASE SCHEMAS
// ===============================

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: String,
  driverName: String,
  vehicleType: String,
  state: String,
  status: String,
  riskLevel: String,
  latitude: Number,
  longitude: Number
});

const routeSchema = new mongoose.Schema({
  routeId: String,
  source: String,
  destination: String,
  distance: Number,
  riskLevel: String,
  status: String
});

const riskZoneSchema = new mongoose.Schema({
  name: String,
  state: String,
  latitude: Number,
  longitude: Number,
  riskLevel: String,
  reason: String
});

const alertSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: String,
  severity: String,
  location: String,
  active: Boolean
});


// ===============================
// MODELS
// ===============================

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
const Route = mongoose.model("Route", routeSchema);
const RiskZone = mongoose.model("RiskZone", riskZoneSchema);
const Alert = mongoose.model("Alert", alertSchema);


// ===============================
// DEMO VEHICLE DATA
// ===============================

const vehiclesData = [
  {
    vehicleNumber: "NER-001",
    driverName: "Raj Kumar",
    vehicleType: "Heavy Truck",
    state: "Assam",
    status: "Active",
    riskLevel: "Low",
    latitude: 26.1445,
    longitude: 91.7362
  },
  {
    vehicleNumber: "NER-002",
    driverName: "Amit Das",
    vehicleType: "Heavy Truck",
    state: "Meghalaya",
    status: "Active",
    riskLevel: "Medium",
    latitude: 25.5788,
    longitude: 91.8933
  },
  {
    vehicleNumber: "NER-003",
    driverName: "Rakesh Singh",
    vehicleType: "Transport Bus",
    state: "Tripura",
    status: "Idle",
    riskLevel: "Low",
    latitude: 23.8315,
    longitude: 91.2868
  }
];


// ===============================
// DEMO ROUTE DATA
// ===============================

const routesData = [
  {
    routeId: "R-001",
    source: "Guwahati",
    destination: "Shillong",
    distance: 100,
    riskLevel: "Medium",
    status: "Active"
  },
  {
    routeId: "R-002",
    source: "Imphal",
    destination: "Dimapur",
    distance: 210,
    riskLevel: "High",
    status: "Active"
  },
  {
    routeId: "R-003",
    source: "Agartala",
    destination: "Guwahati",
    distance: 550,
    riskLevel: "Low",
    status: "Active"
  }
];


// ===============================
// RISK ZONE DATA
// ===============================

const riskZonesData = [
  {
    name: "Shillong Hills",
    state: "Meghalaya",
    latitude: 25.5788,
    longitude: 91.8933,
    riskLevel: "High",
    reason: "Potential landslide-prone terrain"
  },
  {
    name: "Imphal Road Zone",
    state: "Manipur",
    latitude: 24.817,
    longitude: 93.9368,
    riskLevel: "Medium",
    reason: "Road accessibility and traffic risk"
  },
  {
    name: "Guwahati",
    state: "Assam",
    latitude: 26.1445,
    longitude: 91.7362,
    riskLevel: "Low",
    reason: "Normal logistics activity"
  }
];


// ===============================
// ALERT DATA
// ===============================

const alertsData = [
  {
    title: "High Risk Route",
    message: "Extra caution recommended on Imphal - Dimapur route.",
    type: "Road",
    severity: "High",
    location: "Manipur-Nagaland",
    active: true
  },
  {
    title: "Landslide Risk",
    message: "Monitor hill routes around Shillong.",
    type: "Security",
    severity: "High",
    location: "Shillong, Meghalaya",
    active: true
  },
  {
    title: "Traffic Monitoring",
    message: "Normal traffic monitoring active.",
    type: "Traffic",
    severity: "Low",
    location: "Guwahati, Assam",
    active: true
  }
];


// ===============================
// ROOT API
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "NER Smart Logistics Backend is running",
    status: "Online"
  });
});


// ===============================
// VEHICLES API
// ===============================

app.get("/api/vehicles", async (req, res) => {
  try {
    let vehicles = await Vehicle.find();

    if (vehicles.length === 0) {
      await Vehicle.insertMany(vehiclesData);
      vehicles = await Vehicle.find();
    }

    res.json(vehicles);

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Unable to fetch vehicles"
    });
  }
});


// ===============================
// ROUTES API
// ===============================

app.get("/api/routes", async (req, res) => {
  try {
    let routes = await Route.find();

    if (routes.length === 0) {
      await Route.insertMany(routesData);
      routes = await Route.find();
    }

    res.json(routes);

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Unable to fetch routes"
    });
  }
});


// ===============================
// RISK ZONES API
// ===============================

app.get("/api/risk-zones", async (req, res) => {
  try {
    let zones = await RiskZone.find();

    if (zones.length === 0) {
      await RiskZone.insertMany(riskZonesData);
      zones = await RiskZone.find();
    }

    res.json(zones);

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Unable to fetch risk zones"
    });
  }
});


// ===============================
// ALERTS API
// ===============================

app.get("/api/alerts", async (req, res) => {
  try {
    let alerts = await Alert.find();

    if (alerts.length === 0) {
      await Alert.insertMany(alertsData);
      alerts = await Alert.find();
    }

    res.json(alerts);

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Unable to fetch alerts"
    });
  }
});


// ===============================
// AI RISK ANALYSIS API
// ===============================

app.get("/api/ai/risk-analysis", async (req, res) => {
  try {

    const zones = await RiskZone.find();

    const highRisk = zones.filter(
      zone =>
        zone.riskLevel === "High" ||
        zone.riskLevel === "Critical"
    ).length;

    let score = 25;

    if (highRisk >= 1) {
      score += 25;
    }

    if (highRisk >= 2) {
      score += 20;
    }

    let level = "Low";

    if (score >= 60) {
      level = "High";
    } else if (score >= 40) {
      level = "Medium";
    }

    res.json({
      riskScore: score,
      riskLevel: level,
      highRiskZones: highRisk,
      recommendation:
        level === "High"
          ? "Avoid high-risk routes and monitor accessibility conditions."
          : "Continue monitoring logistics routes and risk zones.",
      engine: "Rule-Based AI Risk Engine"
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "AI risk analysis failed"
    });
  }
});


// ===============================
// WEATHER INTELLIGENCE API
// ===============================

app.get("/api/weather", (req, res) => {

  const weatherData = [

    {
      location: "Guwahati",
      state: "Assam",
      temperature: 29,
      condition: "Cloudy",
      rainfall: 20,
      visibility: 8,
      roadCondition: "Good",
      riskLevel: "Low"
    },

    {
      location: "Shillong",
      state: "Meghalaya",
      temperature: 22,
      condition: "Heavy Rain",
      rainfall: 75,
      visibility: 4,
      roadCondition: "Wet",
      riskLevel: "High"
    },

    {
      location: "Imphal",
      state: "Manipur",
      temperature: 24,
      condition: "Light Rain",
      rainfall: 45,
      visibility: 6,
      roadCondition: "Moderate",
      riskLevel: "Medium"
    },

    {
      location: "Agartala",
      state: "Tripura",
      temperature: 30,
      condition: "Partly Cloudy",
      rainfall: 15,
      visibility: 9,
      roadCondition: "Good",
      riskLevel: "Low"
    }

  ];

  res.json({

    success: true,

    source: "NER Weather Intelligence Engine",

    updated: new Date(),

    data: weatherData

  });

});


// ===============================
// WEATHER TEST API
// ===============================

app.get("/api/weather-test", (req, res) => {

  res.json({
    success: true,
    message: "Weather API is working correctly"
  });

});


// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    requestedURL: req.originalUrl
  });

});


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {

  console.log("----------------------------------------");
  console.log("NER SMART LOGISTICS BACKEND");
  console.log("----------------------------------------");
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Available APIs:");
  console.log("GET /");
  console.log("GET /api/vehicles");
  console.log("GET /api/routes");
  console.log("GET /api/risk-zones");
  console.log("GET /api/alerts");
  console.log("GET /api/ai/risk-analysis");
  console.log("GET /api/weather");
  console.log("GET /api/weather-test");
  console.log("----------------------------------------");

});