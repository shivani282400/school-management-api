const { pool } = require("../config/database");

/**
 * Calculates the distance between two geographic coordinates
 * using the Haversine formula (great-circle distance).
 *
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * POST /addSchool
 * Adds a new school to the database after validation.
 */
const addSchool = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Check for duplicate school name at same location
    const [existing] = await pool.execute(
      "SELECT id FROM schools WHERE name = ? AND latitude = ? AND longitude = ?",
      [name.trim(), parseFloat(latitude), parseFloat(longitude)]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A school with the same name already exists at this location",
      });
    }

    // Insert the new school
    const [result] = await pool.execute(
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
      [
        name.trim(),
        address.trim(),
        parseFloat(latitude),
        parseFloat(longitude),
      ]
    );

    // Fetch the newly created school
    const [newSchool] = await pool.execute(
      "SELECT * FROM schools WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "School added successfully",
      data: newSchool[0],
    });
  } catch (error) {
    console.error("Error in addSchool:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding school",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /listSchools
 * Fetches all schools sorted by proximity to the user's location.
 * Query params: latitude, longitude
 */
const listSchools = async (req, res) => {
  try {
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    // Fetch all schools from DB
    const [schools] = await pool.execute(
      "SELECT id, name, address, latitude, longitude, created_at FROM schools"
    );

    if (schools.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No schools found in the database",
        userLocation: { latitude: userLat, longitude: userLon },
        count: 0,
        data: [],
      });
    }

    // Calculate distance for each school and attach it
    const schoolsWithDistance = schools.map((school) => {
      const distance = haversineDistance(
        userLat,
        userLon,
        school.latitude,
        school.longitude
      );
      return {
        ...school,
        distance_km: parseFloat(distance.toFixed(2)),
      };
    });

    // Sort by distance ascending (nearest first)
    schoolsWithDistance.sort((a, b) => a.distance_km - b.distance_km);

    return res.status(200).json({
      success: true,
      message: "Schools fetched and sorted by proximity",
      userLocation: { latitude: userLat, longitude: userLon },
      count: schoolsWithDistance.length,
      data: schoolsWithDistance,
    });
  } catch (error) {
    console.error("Error in listSchools:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching schools",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { addSchool, listSchools };
