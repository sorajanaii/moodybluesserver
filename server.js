const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ==============================
// SQLite Database Setup
// ==============================
const db = new sqlite3.Database("./ratings.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Use db.serialize() to ensure initialization tasks run sequentially
db.serialize(() => {
  // Create "ratings" table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      rating INTEGER NOT NULL,
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Table 'ratings' is ready.");
      }
    }
  );
});

// ==============================
// API Routes
// ==============================

// Route to save rating data
app.post("/api/rate", (req, res) => {
  const { name, email, rating, feedback } = req.body;

  // Input validation
  if (!name || !email || !rating) {
    return res.status(400).json({ error: "Name, email, and rating are required." });
  }

  const query = `INSERT INTO ratings (name, email, rating, feedback) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, email, rating, feedback || ""], function (err) {
    if (err) {
      console.error("Error inserting data:", err.message);
      return res.status(500).json({ error: "Failed to save data to the database." });
    }
    res.status(200).json({ message: "Rating submitted successfully!", id: this.lastID });
  });
});

// Route to fetch all ratings
app.get("/api/ratings", (req, res) => {
  const query = `SELECT * FROM ratings ORDER BY created_at DESC`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      return res.status(500).json({ error: "Failed to retrieve ratings." });
    }
    res.status(200).json(rows);
  });
});

// ==============================
// Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
