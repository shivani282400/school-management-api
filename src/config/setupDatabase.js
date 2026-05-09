const mysql = require("mysql2/promise");
require("dotenv").config();

const setupDatabase = async () => {
  let connection;

  try {
    // Connect without specifying the database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    const dbName = process.env.DB_NAME || "school_management";

    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database '${dbName}' created or already exists`);

    // Use the database
    await connection.query(`USE \`${dbName}\``);

    // Create schools table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(255)    NOT NULL,
        address     VARCHAR(500)    NOT NULL,
        latitude    FLOAT(10, 6)   NOT NULL,
        longitude   FLOAT(10, 6)   NOT NULL,
        created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (name),
        INDEX idx_location (latitude, longitude)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table 'schools' created or already exists");

    // Insert sample data for testing
    const [existing] = await connection.query(
      "SELECT COUNT(*) as count FROM schools"
    );
    if (existing[0].count === 0) {
      await connection.query(`
        INSERT INTO schools (name, address, latitude, longitude) VALUES
        ('Delhi Public School', 'Mathura Road, New Delhi, Delhi 110019', 28.5355, 77.2510),
        ('St. Xavier School', 'Park Street, Kolkata, West Bengal 700016', 22.5510, 88.3494),
        ('Ryan International School', 'Sector 40, Gurugram, Haryana 122001', 28.4595, 77.0266),
        ('Kendriya Vidyalaya', 'Chankyapuri, New Delhi, Delhi 110021', 28.5972, 77.1855),
        ('The Cathedral School', 'CST Road, Mumbai, Maharashtra 400098', 19.0760, 72.8777)
      `);
      console.log("✅ Sample data inserted (5 schools)");
    } else {
      console.log(
        `ℹ️  Schools table already has ${existing[0].count} record(s), skipping sample data`
      );
    }

    console.log("\n🎉 Database setup complete! You can now start the server.");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

setupDatabase();
