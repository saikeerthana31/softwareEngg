const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use the Service Role Key for DB operations

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedUsers() {
    const saltRounds = 10;

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", saltRounds);
    const staffPassword = await bcrypt.hash("staff123", saltRounds);

    const users = [
        { email: "admin@example.com", password: adminPassword, role: "admin" },
        { email: "staff@example.com", password: staffPassword, role: "staff" }
    ];

    try {
        const { data, error } = await supabase
            .from("users")
            .upsert(users, { onConflict: ["email"] }); // Ensures no duplicate emails

        if (error) {
            throw error;
        }

        console.log("✅ Users seeded successfully!", data);
    } catch (error) {
        console.error("❌ Error seeding users:", error);
    }
}

seedUsers();
