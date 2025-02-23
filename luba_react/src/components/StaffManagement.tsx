"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGrid, FiUsers, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import { UUID } from "crypto";

interface User {
  id: string;
  email: string;
  role?: string;
  name?: string;
}

export default function StaffManagement() {
  const [isOpen, setIsOpen] = useState(true);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminUser");
      if (!storedAdmin) {
        router.push("/loginAdmin");
        return;
      }
      const parsedAdmin = JSON.parse(storedAdmin);
      if (typeof parsedAdmin === "object" && parsedAdmin?.email) {
        setAdmin(parsedAdmin);
      } else {
        localStorage.removeItem("adminUser");
        router.push("/loginAdmin");
      }
    } catch (error) {
      localStorage.removeItem("adminUser");
      router.push("/loginAdmin");
    }
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, display_name");
  
      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        console.log("Fetched users:", data);
        setUsers(data);
      }
    };
  
    fetchUsers();
  }, []);
  
  
  const handleDeleteUser = async (userId:string) => {
    try {
      // Delete from authentication (Supabase Auth)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
  
      // Delete from users table
      const { error: dbError } = await supabase.from("users").delete().eq("id", userId);
      if (dbError) throw dbError;
  
      // Update UI after deletion
      setUsers(users.filter(user => user.id !== userId));
  
      console.log("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-light-blue-400">
      <aside className={`z-10 bg-white shadow-xl text-black h-screen flex flex-col justify-between transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
        <div>
          <div className="p-4 flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>Admin Panel</h2>
            <button onClick={() => setIsOpen(!isOpen)} className="text-black">{isOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
          </div>
          {isOpen && <div className="p-4 text-xs text-gray-400">{admin?.email}</div>}
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
        {isOpen && (
          <button onClick={handleLogout} className="flex items-center justify-center p-3 m-4 bg-red-600 rounded hover:bg-red-700">
            <FiLogOut size={20} />
            <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Logout</span>
          </button>
        )}
      </aside>
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Staff Management</h2>
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border">
                <td className="p-3 border">{user.id}</td>
                <td className="p-3 border">{user.email}</td>
                <td className="p-3 border">{user.name || "N/A"}</td>
                <td className="p-3 border">{user.role || "N/A"}</td>
                <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
