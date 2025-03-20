"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetPassword`
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage("Check your email for a password reset link.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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
              alt="Forgot Password"
              src="/forgot-password.jpg"
              className="object-cover "
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              Reset Your Password
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
            <div>
              <button
                type="button"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
                onClick={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm"
                onClick={() => router.push("/")}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}