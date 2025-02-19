require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const os = require("os");

const app = express();
const PORT = 5001;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verify database connection
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

// Generic login function
const handleLogin = async (req, res, role) => {
  console.log(`Received ${role} login request:`, req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing email or password" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 AND role = $2", [email, role]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return res.json({
        success: true,
        message: "Login successful",
        user: { id: user.id, email: user.email, role: user.role },
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("❌ Database error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin Login Endpoint
app.post("/api/login/admin", (req, res) => handleLogin(req, res, "admin"));

// Staff Login Endpoint
app.post("/api/login/staff", (req, res) => handleLogin(req, res, "staff"));

// Add a new lab
app.post("/api/labs", async (req, res) => {
  const { name, location, capacity, status, image_url } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Lab name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO labs (name, location, capacity, status, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, location || null, capacity || null, status || "Available", image_url || null]
    );
    res.status(201).json({ success: true, lab: result.rows[0] });
  } catch (error) {
    console.error("❌ Error adding lab:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get all labs
app.get("/api/labs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM labs");
    res.json({ success: true, labs: result.rows });
  } catch (error) {
    console.error("❌ Error fetching labs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get a specific lab by ID
app.get("/api/labs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM labs WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Lab not found" });
    }

    res.json({ success: true, lab: result.rows[0] });
  } catch (error) {
    console.error("❌ Error fetching lab:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update a lab
app.put("/api/labs/:id", async (req, res) => {
  const { id } = req.params;
  const { name, location, capacity, status, image_url } = req.body;

  try {
    const result = await pool.query(
      "UPDATE labs SET name = $1, location = $2, capacity = $3, status = $4, image_url = $5 WHERE id = $6 RETURNING *",
      [name, location, capacity, status, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Lab not found" });
    }

    res.json({ success: true, lab: result.rows[0] });
  } catch (error) {
    console.error("❌ Error updating lab:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete a lab
app.delete("/api/labs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM labs WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Lab not found" });
    }

    res.json({ success: true, message: "Lab deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting lab:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Start server and listen on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Access from local network at: http://${getLocalIp()}:${PORT}`);
});

// Function to get the local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (let iface of Object.values(interfaces)) {
    for (let details of iface) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address;
      }
    }
  }
  return "localhost"; // Fallback
}
