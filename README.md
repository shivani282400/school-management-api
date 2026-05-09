# 🎓 School Management API

A production-ready REST API built with **Node.js**, **Express.js**, and **MySQL** that lets you manage school data and retrieve schools sorted by geographic proximity using the **Haversine formula**.

---

## 📁 Project Structure

```
school-management-api/
├── src/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool
│   │   └── setupDatabase.js     # DB + table creation script
│   ├── controllers/
│   │   └── schoolController.js  # Business logic + Haversine distance
│   ├── middleware/
│   │   └── validators.js        # Input validation rules
│   ├── routes/
│   │   └── schoolRoutes.js      # API route definitions
│   └── index.js                 # App entry point
├── docs/
│   └── SchoolManagement.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/school-management-api.git
cd school-management-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management
```

### 3. Setup Database

```bash
npm run setup-db
```

This creates the `school_management` database, the `schools` table, and inserts 5 sample schools.

### 4. Start the Server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`

---

## 📡 API Endpoints

### `GET /` — Health Check

```
GET http://localhost:3000/
```

**Response:**
```json
{
  "success": true,
  "message": "School Management API is running 🎓",
  "version": "1.0.0"
}
```

---

### `POST /addSchool` — Add a New School

**Request:**
```
POST http://localhost:3000/addSchool
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Delhi Public School",
  "address": "Mathura Road, New Delhi, Delhi 110019",
  "latitude": 28.5355,
  "longitude": 77.2510
}
```

**Validation Rules:**
| Field     | Type   | Rules                              |
|-----------|--------|------------------------------------|
| name      | string | Required, 2–255 characters         |
| address   | string | Required, 5–500 characters         |
| latitude  | float  | Required, between -90 and 90       |
| longitude | float  | Required, between -180 and 180     |

**Success Response (201):**
```json
{
  "success": true,
  "message": "School added successfully",
  "data": {
    "id": 1,
    "name": "Delhi Public School",
    "address": "Mathura Road, New Delhi, Delhi 110019",
    "latitude": 28.5355,
    "longitude": 77.251,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "latitude", "message": "Latitude must be a number between -90 and 90", "value": 999 }
  ]
}
```

---

### `GET /listSchools` — List Schools by Proximity

**Request:**
```
GET http://localhost:3000/listSchools?latitude=28.6139&longitude=77.2090
```

**Query Parameters:**
| Parameter | Type  | Description              |
|-----------|-------|--------------------------|
| latitude  | float | User's current latitude  |
| longitude | float | User's current longitude |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Schools fetched and sorted by proximity",
  "userLocation": { "latitude": 28.6139, "longitude": 77.209 },
  "count": 3,
  "data": [
    {
      "id": 4,
      "name": "Kendriya Vidyalaya",
      "address": "Chankyapuri, New Delhi",
      "latitude": 28.5972,
      "longitude": 77.1855,
      "distance_km": 3.21
    },
    {
      "id": 1,
      "name": "Delhi Public School",
      "address": "Mathura Road, New Delhi",
      "latitude": 28.5355,
      "longitude": 77.251,
      "distance_km": 8.78
    }
  ]
}
```

---

## 🧮 Haversine Formula

Distance is calculated using the **Haversine formula**, which gives the great-circle distance between two points on a sphere:

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
d = R × c          (R = 6371 km)
```

This accurately accounts for Earth's curvature, unlike simple Euclidean distance.

---

## 🗄️ Database Schema

```sql
CREATE TABLE schools (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  address     VARCHAR(500)  NOT NULL,
  latitude    FLOAT(10, 6)  NOT NULL,
  longitude   FLOAT(10, 6)  NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_location (latitude, longitude)
);
```

---

## ☁️ Deployment Guide

### Option A: Railway (Recommended — Free Tier)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a **MySQL** service in the same project
4. Set environment variables from Railway's MySQL service details
5. Railway auto-deploys on every push ✅

### Option B: Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `npm start`
5. Add environment variables from a managed MySQL (e.g., [PlanetScale](https://planetscale.com))

### Option C: Heroku + ClearDB

```bash
heroku create your-school-api
heroku addons:create cleardb:ignite
heroku config | grep CLEARDB_DATABASE_URL
# Parse the URL into DB_HOST, DB_USER, DB_PASSWORD, DB_NAME env vars
git push heroku main
```

---

## 🧪 Testing with Postman

1. Open Postman
2. Click **Import** → Upload `docs/SchoolManagement.postman_collection.json`
3. Set the `base_url` variable to your deployed URL (or `http://localhost:3000` locally)
4. Run requests in order: Health Check → Add Schools → List Schools

---

## 🛠 Tech Stack

| Technology       | Purpose                        |
|------------------|--------------------------------|
| Node.js          | Runtime environment            |
| Express.js       | Web framework                  |
| MySQL2           | Database driver with promises  |
| express-validator| Input validation               |
| dotenv           | Environment variable management|
| cors             | Cross-origin resource sharing  |
| morgan           | HTTP request logging           |

---

## 📄 License

MIT — free to use for personal and commercial projects.
