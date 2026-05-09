const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const { testConnection } = require("./config/database");
const schoolRoutes = require("./routes/schoolRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan("dev")); // HTTP request logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "School Management API is running 🎓",
    version: "1.0.0",
    endpoints: {
      addSchool: {
        method: "POST",
        path: "/addSchool",
        description: "Add a new school",
        body: { name: "string", address: "string", latitude: "float", longitude: "float" },
      },
      listSchools: {
        method: "GET",
        path: "/listSchools?latitude=28.61&longitude=77.20",
        description: "Get all schools sorted by proximity",
        query: { latitude: "float", longitude: "float" },
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/", schoolRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: ["POST /addSchool", "GET /listSchools"],
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const startServer = async () => {
  await testConnection(); // Verify DB before starting
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Docs available at http://localhost:${PORT}/\n`);
  });
};

startServer();
