<<<<<<< HEAD
"use client";
=======
export default function adminHome(){
    return (
        <h1>STAFF HOME</h1>
    );
>>>>>>> 44ccc15ae5f2d3fdfef1862db5c6b0a4c41efc51

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGrid, FiUsers } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function AdminHome() {
  const [isOpen, setIsOpen] = useState(true);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminUser");

      if (!storedAdmin) {
        console.warn("No adminUser found, redirecting to login...");
        router.push("/loginAdmin");
        return;
      }

      const parsedAdmin = JSON.parse(storedAdmin);

      // Validate required properties exist
      if (typeof parsedAdmin === "object" && parsedAdmin?.email) {
        setAdmin(parsedAdmin);
      } else {
        console.log(parsedAdmin);
        console.warn("Invalid adminUser data, clearing localStorage...");
        localStorage.removeItem("adminUser");
        router.push("/loginAdmin");
      }
    } catch (error) {
      console.error("Error parsing adminUser from localStorage:", error);
      localStorage.removeItem("adminUser");
      router.push("/loginAdmin");
    }
  }, [router]);

  if (!admin) return null; // Prevents rendering until data is verified

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`bg-gray-700 text-white h-screen transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
        <div className="p-4 flex items-center justify-between">
          <h2 className={`text-xl font-bold transition-opacity ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
            Admin Panel
          </h2>
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Admin Info */}
        {isOpen && admin && (
          <div className="flex flex-col p-4 border-b border-gray-700">
            <p className="text-xs text-gray-400">{admin.email}</p>
          </div>
        )}

        {/* Sidebar Navigation */}
        <nav className="pl-3 mt-4">
          <ul>
            <li className="mb-2">
              <Link href="/admin/dashboard" className="flex items-center p-2 rounded hover:bg-gray-700">
                <FiGrid size={20} />
                <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/staff-management" className="flex items-center p-2 rounded hover:bg-gray-700">
                <FiUsers size={20} />
                <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Staff Management</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome, {admin.email || "Admin"}!</p>
      </div>
    </div>
  );
}
