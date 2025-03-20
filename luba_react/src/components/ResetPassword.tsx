"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check for token in URL on mount
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const token = hashParams.get("access_token");
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, []);

  const handleUpdatePassword = async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to update password. Please try again.");
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
              alt="Reset Password"
              src="/reset-password.jpg"
              className="h-24 w-24 rounded-full mb-4 object-cover shadow-md"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              Set New Password
            </h2>
          </div>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="********"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
            <div>
              <button
                type="button"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
                onClick={handleUpdatePassword}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}