"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient"; 

export default function LoginAdmin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        try {
            // Sign in the user
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                setError(error.message);
                return;
            }

            // Extract user session details
            const { user } = data;
            if (!user) {
                setError("Authentication failed.");
                return;
            }

            // Fetch user role from Supabase users table
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("user_id", user.id) // Ensure the correct field is used
                .maybeSingle(); // Prevents crashes if no user is found


            if (userError || !userData) {
                setError("Failed to fetch user role.");
                return;
            }

            if (userData.role !== "admin") {
                setError("Access denied. Only admins are allowed.");
                return;
            }

            // Store admin authentication state
            localStorage.setItem("isAdminAuthenticated", "true");
            localStorage.setItem("adminUser", JSON.stringify({ email, role: userData.role }));

            console.log("Admin authenticated:", userData);
            router.push("/adminhome");
        } catch (err) {
            console.error(err);
            setError("Login failed. Please try again.");
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="w-full bg-slate-300 py-4 px-6 fixed top-0 left-0 text-black font-bold text-lg shadow-md">
                Lab Utilization and Booking Application
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img alt="Admin Login" src="/Admin.jpg" className="h-auto w-auto mb-5" />
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
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                            Password
                        </label>
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
