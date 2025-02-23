const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedUsers() {
    const users = [
        { email: "admin@example.com", password: "admin123", display_name: "Admin User", role: "admin" },
        { email: "staff@example.com", password: "staff123", display_name: "Staff Member", role: "staff" }
    ];

    try {
        for (const user of users) {
            // 1️⃣ **Check if user already exists**
            const { data: existingUser, error: findError } = await supabase
                .from("users")
                .select("id")
                .eq("email", user.email)
                .maybeSingle();

            if (findError) {
                console.error(`❌ Error checking existing user (${user.email}):`, findError.message);
                continue;
            }

            if (existingUser) {
                console.log(`⚠️ User ${user.email} already exists, skipping.`);
                continue;
            }

            // 2️⃣ **Create user in Supabase Auth**
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password, // Supabase hashes this internally
                email_confirm: true,
                user_metadata: { display_name: user.display_name }
            });

            if (authError) {
                console.error(`❌ Error creating ${user.role} user:`, authError.message);
                continue;
            }

            console.log(`✅ ${user.role} user created in Auth:`, authUser);

            // 3️⃣ **Insert user metadata into the `users` table**
            const { error: dbError } = await supabase
                .from("users")
                .upsert([{ 
                    id: authUser.user.id, 
                    email: user.email, 
                    display_name: user.display_name, 
                    role: user.role 
                }], { onConflict: ["email"] });

            if (dbError) {
                console.error(`❌ Error inserting ${user.role} user into DB:`, dbError.message);
            } else {
                console.log(`✅ ${user.role} user added to database.`);
            }
        }
    } catch (error) {
        console.error("❌ Unexpected error:", error);
    }
}

// Run script
seedUsers();
