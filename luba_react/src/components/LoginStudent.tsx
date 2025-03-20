"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function StudentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Validate email format
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Sanitize input to remove potentially harmful characters
  const sanitizeInput = (input: string) => input.replace(/['";-]/g, "");

  const handleLogin = async () => {
    setError("");

    // Sanitize and trim email and password
    const cleanEmail = sanitizeInput(email.trim());
    const cleanPassword = sanitizeInput(password);

    if (!validateEmail(cleanEmail)) {
      setError("Invalid email format.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });
      if (error) {
        setError(error.message);
        return;
      }

      const { user } = data;
      if (!user) {
        setError("Authentication failed.");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError || !userData) {
        setError("Failed to fetch user role.");
        return;
      }

      if (userData.role !== "student") {
        setError("Access denied. Only students are allowed.");
        return;
      }

      localStorage.setItem("isStudentAuthenticated", "true");
      localStorage.setItem(
        "studentUser",
        JSON.stringify({ email: cleanEmail, role: userData.role }),
      );

      console.log("Student authenticated:", userData);
      router.push("/studentHome");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-blue-50 py-4 px-6 shadow-md">
        <h1 className="text-xl font-bold text-blue-700">
          Lab Utilization and Booking Application
        </h1>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <img
              alt="Student Login"
              src="/student.jpg"
              className="h-24 w-24 rounded-full mb-4 object-cover shadow-md"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              Sign in to your account
            </h2>
          </div>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="********"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <button
                type="button"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleLogin}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
