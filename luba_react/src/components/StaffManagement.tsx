"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGrid, FiUsers, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { supabase, supabaseAdmin } from "../utils/supabaseClient";

interface User {
  user_id: string;
  email: string;
  role?: string;
  name?: string;
  pending_approval?: boolean;
}

export default function StaffManagement() {
  const [isOpen, setIsOpen] = useState(true);
  const [admin, setAdmin] = useState<{ email: string; role: string } | null>(
    null
  );
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminUser");
      if (!storedAdmin) {
        router.push("/loginAdmin");
        return;
      }
      const parsedAdmin = JSON.parse(storedAdmin);
      if (parsedAdmin?.role !== "admin" || !parsedAdmin?.email) {
        localStorage.removeItem("adminUser");
        router.push("/loginAdmin");
      } else {
        setAdmin(parsedAdmin);
      }
    } catch (error) {
      localStorage.removeItem("adminUser");
      router.push("/loginAdmin");
    }
  }, [router]);

  const fetchUsers = async () => {
    const { data, error } = await supabaseAdmin // Use service role client
      .from("users")
      .select("user_id, email, role, name, pending_approval");
    if (error) {
      console.error("Error fetching users:", error.message);
    } else {
      console.log("Fetched users:", data);
      const pending = data.filter((user: User) => user.pending_approval);
      const all = data.filter((user: User) => !user.pending_approval);
      setPendingUsers(pending);
      setAllUsers(all);
    }
  };

  useEffect(() => {
    if (admin) fetchUsers();
  }, [admin]);

  const handleApproveUser = async (userId: string) => {
    try {
      const { error: updateError } = await supabaseAdmin // Use service role client
        .from("users")
        .update({ pending_approval: false })
        .eq("user_id", userId);
      if (updateError) throw updateError;
      await fetchUsers();
      console.log("User approved successfully");
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        userId
      );
      if (authError) throw authError;
      const { error: dbError } = await supabaseAdmin // Use service role client
        .from("users")
        .delete()
        .eq("user_id", userId);
      if (dbError) throw dbError;
      await fetchUsers();
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
    localStorage.removeItem("adminUser");
    router.push("/loginAdmin");
  };

  if (!admin) return null;

  return (
    <div className="relative flex min-h-screen bg-light-blue-400">
      {/* Rest of your JSX remains unchanged */}
      <aside
        className={`z-10 bg-white shadow-xl text-black h-screen flex flex-col justify-between transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <div>
          <div className="p-4 flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>
              Admin Panel
            </h2>
            <button onClick={() => setIsOpen(!isOpen)} className="text-black">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
          {isOpen && (
            <div className="p-4 text-xs text-gray-400">{admin?.email}</div>
          )}
          <nav className="pl-3 mt-4">
            <ul>
              <li className="mb-2">
                <Link
                  href="../adminDashboard"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <FiGrid size={20} />
                  <span
                    className={`ml-2 transition-all ${
                      isOpen ? "block" : "hidden"
                    }`}
                  >
                    Dashboard
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="../staffManagement"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <FiUsers size={20} />
                  <span
                    className={`ml-2 transition-all ${
                      isOpen ? "block" : "hidden"
                    }`}
                  >
                    Staff Management
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        {isOpen && (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-3 m-4 bg-red-600 rounded hover:bg-red-700"
          >
            <FiLogOut size={20} />
            <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
              Logout
            </span>
          </button>
        )}
      </aside>
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Staff Management</h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Access Requests</h3>
          {pendingUsers.length === 0 ? (
            <p>No pending access requests.</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border">User ID</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Role</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user) => (
                  <tr key={user.user_id} className="border">
                    <td className="p-3 border">{user.user_id}</td>
                    <td className="p-3 border">{user.email}</td>
                    <td className="p-3 border">{user.name || "N/A"}</td>
                    <td className="p-3 border">{user.role || "N/A"}</td>
                    <td className="p-3 border">
                      <button
                        onClick={() => handleApproveUser(user.user_id)}
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-700 mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">All Users</h3>
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">User ID</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.user_id} className="border">
                  <td className="p-3 border">{user.user_id}</td>
                  <td className="p-3 border">{user.email}</td>
                  <td className="p-3 border">{user.name || "N/A"}</td>
                  <td className="p-3 border">{user.role || "N/A"}</td>
                  <td className="p-3 border">
                    <button
                      onClick={() => handleDeleteUser(user.user_id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
