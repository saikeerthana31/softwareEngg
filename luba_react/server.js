require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization"
}));

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

// Login Endpoint
app.post("/api/login", async (req, res) => {
    console.log("Received login request:", req.body);
    
    const { email, password } = req.body;
    if (!email || !password) {
        console.error("❌ Missing email or password");
        return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        console.log("User Query Result:", result.rows);

        if (result.rows.length === 0) {
            console.error("❌ User not found");
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
            const adminUser = {
                id: user.id,
                email: user.email,
                role: user.role,
                  // If you store names in DB
            };
            return res.json({ success: true, message: "Login successful", admin: adminUser });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("❌ Database error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
