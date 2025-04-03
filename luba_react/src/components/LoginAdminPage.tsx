"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Fixed regex: removed the extra dash to avoid invalid range error
  const sanitizeInput = (input: string) => input.replace(/['";-]/g, "");
  const handleRedirect = (role: string) => {
    router.push(`/${role}`);
  }
  const handleLogin = async () => {
    setError("");

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
        .select("role, pending_approval")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError || !userData) {
        setError("Failed to fetch user role.");
        return;
      }

      if (userData.pending_approval) {
        setError("Your account is pending approval.");
        return;
      }

      if (userData.role !== "admin") {
        setError("Access denied.");
        return;
      }

      localStorage.setItem("isAdminAuthenticated", "true");
      localStorage.setItem(
        "adminUser",
        JSON.stringify({ email: cleanEmail, role: userData.role }),
      );

      router.push("/adminhome");
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="w-full bg-slate-300 py-4 px-6 fixed top-0 left-0 text-black font-bold text-lg shadow-md">
        Lab Utilization and Booking Application
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Admin Login"
          src="/Admin.jpg"
          className="h-auto w-auto mb-5"
        />
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>

            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email address
            </label>
          
            <input
              type="email"
              className="block w-full border-b-2 border-gray-400 bg-transparent px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="text-sm">
                  <a onClick={() => handleRedirect('forgotPassword')} className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                </div>
            </div>
            <input
              type="password"
              className="block w-full border-b-2 border-gray-400 bg-transparent px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="button"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={handleLogin}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
