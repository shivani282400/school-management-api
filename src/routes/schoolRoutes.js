const express = require("express");
const router = express.Router();
const { addSchool, listSchools } = require("../controllers/schoolController");
const {
  addSchoolValidation,
  listSchoolsValidation,
} = require("../middleware/validators");

/**
 * @route   POST /addSchool
 * @desc    Add a new school to the database
 * @access  Public
 * @body    { name, address, latitude, longitude }
 */
router.post("/addSchool", addSchoolValidation, addSchool);

/**
 * @route   GET /listSchools
 * @desc    Get all schools sorted by proximity to user's location
 * @access  Public
 * @query   latitude, longitude
 */
router.get("/listSchools", listSchoolsValidation, listSchools);

module.exports = router;
