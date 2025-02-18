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
    origin: "*", // Allows requests from any device
    methods: "GET,POST",
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
    console.error("❌ Missing email or password");
    return res.status(400).json({ success: false, message: "Missing email or password" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 AND role = $2", [email, role]);
    console.log("User Query Result:", result.rows);

    if (result.rows.length === 0) {
      console.error("❌ User not found or role mismatch");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];
    if (!user.password) {
      console.error("❌ User has no password stored");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch);

    if (isMatch) {
      const userInfo = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      return res.json({ success: true, message: "Login successful", user: userInfo });
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

