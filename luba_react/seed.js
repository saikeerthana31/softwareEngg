const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function seedUsers() {
    const saltRounds = 10;
    
    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", saltRounds);
    const staffPassword = await bcrypt.hash("staff123", saltRounds);

    const query = `
        INSERT INTO users (email, password, role) VALUES
        ('admin@example.com', $1, 'admin'),
        ('staff@example.com', $2, 'staff')
        ON CONFLICT (email) DO NOTHING;
    `;

    try {
        await pool.query(query, [adminPassword, staffPassword]);
        console.log("✅ Users seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding users:", error);
    } finally {
        pool.end();
    }
}

seedUsers();
