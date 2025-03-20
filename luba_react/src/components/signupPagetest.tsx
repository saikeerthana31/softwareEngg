"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }, // Set role in auth.users metadata
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const { user } = data;
      if (!user) {
        setError("Signup failed. No user data returned.");
        return;
      }

      const { error: insertError } = await supabase.from("users").insert({
        user_id: user.id,
        name,
        email,
        role,
        pending_approval: true,
      });

      if (insertError) {
        setError("Failed to create user profile: " + insertError.message);
        await supabase.auth.admin.deleteUser(user.id);
        return;
      }

      console.log("User signed up successfully:", { email, name, role });
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Signup failed. Please try again.");
    }
  };
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="w-full bg-slate-300 py-4 px-6 fixed top-0 left-0 text-black font-bold text-lg shadow-md">
        Lab Utilization and Booking Application
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="Signup" src="/Signup.jpg" className="h-auto w-auto mb-5" />
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-900"
            >
              Full Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="block w-full border-b-2 border-gray-400 bg-transparent px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="block w-full border-b-2 border-gray-400 bg-transparent px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-900"
            >
              Role
            </label>
            <div className="mt-2">
              <select
                id="role"
                name="role"
                className="block w-full border-b-2 border-gray-400 bg-transparent px-3 py-2 text-base text-gray-900 focus:border-indigo-600 focus:outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <button
              type="button"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={handleSignup}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
