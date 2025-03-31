"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function StaffLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Validate email format
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Sanitize input to remove potentially harmful characters
  const sanitizeInput = (input: string) => input.replace(/['";-]/g, "");
  
  const handleRedirect = (role: string) => {
    router.push(`/${role}`);
  }
  const handleLogin = async () => {
    setError("");

    // Sanitize and trim inputs
    const cleanEmail = sanitizeInput(email.trim());
    const cleanPassword = sanitizeInput(password);

    if (!validateEmail(cleanEmail)) {
      setError("Invalid email format.");
      return;
    }

    try {
      // Sign in with Supabase using sanitized inputs
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

      // Fetch user role from Supabase users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError || !userData) {
        setError("Failed to fetch user role.");
        return;
      }

      if (userData.role !== "faculty") {
        setError("Access denied. Only staff members are allowed.");
        return;
      }

      // Store staff authentication state
      localStorage.setItem("isStaffAuthenticated", "true");
      localStorage.setItem(
        "staffUser",
        JSON.stringify({ email: cleanEmail, role: userData.role }),
      );

      console.log("Staff authenticated:", userData);
      router.push("/staffhome");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="w-full bg-teal-100 py-4 px-6 fixed top-0 left-0 text-black font-bold text-lg shadow-md">
        Lab Utilization and Booking Application
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Staff Login"
          src="/staff.jpg"
          className="h-auto w-auto mb-5"
        />
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="block w-full border-b-2 border-gray-400 bg-transparent px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <div className="text-sm">
                <a onClick={() => handleRedirect('forgotPassword')} className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="block w-full border-b-2 border-gray-400 bg-transparent px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="button"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={handleLogin}
            >
              Sign in
            </button>
          </div>
          

        </form>
      </div>
    </div>
  );
}
