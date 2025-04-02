"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGrid, FiUsers, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { supabase } from "utils/supabaseClient";


export default function AdminHome() {
  const [isOpen, setIsOpen] = useState(true);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
   useEffect(() => {
      const checkAuth = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/loginAdmin";
        } else {
          setUserId(user.id as string);

        }
      };
  
      checkAuth();
      history.replaceState({}, "", location.href);
    }, []);
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminUser");

      if (!storedAdmin) {
        console.warn("No adminUser found, redirecting to login...");
        router.push("/loginAdmin");
        return;
      }

      const parsedAdmin = JSON.parse(storedAdmin);

      if (typeof parsedAdmin === "object" && parsedAdmin?.email) {
        setAdmin(parsedAdmin);
      } else {
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

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/loginAdmin");
  };

  if (!admin) return null;

  return (
    <div className="relative flex min-h-screen bg-light-blue-100">
      {/* Background Waves */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <svg className="absolute bottom-0 w-full h-auto opacity-30 animate-wave1" viewBox="0 0 1440 120">
          <path fill="#90caf9" d="M0,80L80,75C160,70,320,60,480,60C640,60,800,70,960,65C1120,60,1280,40,1360,30L1440,20L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
        <svg className="absolute bottom-0 w-full h-auto opacity-50 animate-wave2" viewBox="0 0 1440 120">
          <path fill="#64b5f6" d="M0,90L80,85C160,80,320,70,480,70C640,70,800,80,960,75C1120,70,1280,50,1360,40L1440,30L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
        <svg className="absolute bottom-0 w-full h-auto opacity-70 animate-wave3" viewBox="0 0 1440 120">
          <path fill="#42a5f5" d="M0,70L80,65C160,60,320,50,480,50C640,50,800,60,960,55C1120,50,1280,30,1360,20L1440,10L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>

      {/* Sidebar */}
      <aside className={`z-10 bg-white bg-opacity-80 backdrop-blur-md text-black h-screen flex flex-col justify-between transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
        <div>
          <div className="p-4 flex items-center justify-between">
            <h2 className={`text-xl font-bold transition-opacity ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
              Admin Panel
            </h2>
            <button onClick={() => setIsOpen(!isOpen)} className="text-black">
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
                <Link href="../adminDashboard" className="flex items-center p-2 rounded hover:bg-gray-700">
                  <FiGrid size={20} />
                  <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="../staffManagement" className="flex items-center p-2 rounded hover:bg-gray-700">
                  <FiUsers size={20} />
                  <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Staff Management</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Logout Button */}
        {isOpen && (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-3 m-4 text-white bg-red-600 rounded hover:bg-red-700"
          >
            <FiLogOut size={20} />
            <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Logout</span>
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-black">Welcome, {admin.email || "Admin"}!</h1>
        <p className="text-black mb-8 text-lg">What would you like to view?</p>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dashboard Card */}
          <Link href="../adminDashboard">
            <div className="w-72 h-72 bg-white bg-opacity-80 shadow-xl rounded-lg flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110">
              <FiGrid size={60} className="text-blue-500 mb-4" />
              <h2 className="text-2xl font-semibold">Dashboard</h2>
              <p className="text-gray-500 text-lg mt-2 text-center">View admin statistics and reports</p>
            </div>
          </Link>

          {/* Staff Management Card */}
          <Link href="../staffManagement">
            <div className="w-72 h-72 bg-white bg-opacity-80 shadow-xl rounded-lg flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110">
              <FiUsers size={60} className="text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold">Staff Management</h2>
              <p className="text-gray-500 text-lg mt-2 text-center">Manage and oversee staff members</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes wave1 {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(5px) translateX(5px); }
          100% { transform: translateY(0) translateX(0); }
        }

        @keyframes wave2 {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(7px) translateX(-5px); }
          100% { transform: translateY(0) translateX(0); }
        }

        @keyframes wave3 {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(10px) translateX(5px); }
          100% { transform: translateY(0) translateX(0); }
        }

        .animate-wave1 {
          animation: wave1 4s ease-in-out infinite;
        }

        .animate-wave2 {
          animation: wave2 5s ease-in-out infinite;
        }

        .animate-wave3 {
          animation: wave3 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
