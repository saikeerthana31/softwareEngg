// src/components/StaffManagement.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGrid, FiUsers, FiLogOut, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import * as supabaseActions from "../actions/supabaseActions";

interface User {
  user_id: string;
  email: string;
  role?: string;
  name?: string;
  pending_approval?: boolean;
}

interface AdminUser {
  email: string;
  role: string;
}

export default function StaffManagement() {
  const [isOpen, setIsOpen] = useState(true);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const hasInitialized = useRef(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { pendingUsers, allUsers } = await supabaseActions.fetchUsers();
      setPendingUsers(pendingUsers || []);
      setAllUsers(allUsers || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setPendingUsers([]);
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = useCallback(() => {
    try {
      const storedAdmin = localStorage.getItem("adminUser");
      if (!storedAdmin) {
        router.push("/loginAdmin");
        return null;
      }
      const parsedAdmin: AdminUser = JSON.parse(storedAdmin);
      if (parsedAdmin?.role !== "admin" || !parsedAdmin?.email) {
        localStorage.removeItem("adminUser");
        router.push("/loginAdmin");
        return null;
      }
      return parsedAdmin;
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("adminUser");
      router.push("/loginAdmin");
      return null;
    }
  }, [router]);

  // Initialize the component using useEffect
  useEffect(() => {
    if (hasInitialized.current) return;

    const initialize = async () => {
      const authenticatedAdmin = checkAuth();
      if (authenticatedAdmin) {
        setAdmin(authenticatedAdmin);
        await loadUsers();
      }
      hasInitialized.current = true;
    };

    initialize();
  }, [checkAuth, loadUsers]); // Dependencies ensure this runs only when needed

  const handleApproveUser = async (userId: string) => {
    try {
      await supabaseActions.approveUser(userId);
      await loadUsers();
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await supabaseActions.rejectUser(userId);
      await loadUsers();
    } catch (err) {
      console.error("Error rejecting user:", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await supabaseActions.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/loginAdmin");
  };

  if (!admin || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light-blue-400">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-light-blue-400">
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
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
          {isOpen && (
            <div className="p-4 text-xs text-gray-400">{admin.email}</div>
          )}
          <nav className="pl-3 mt-4">
            <ul>
              <li className="mb-2">
                <Link
                  href="/adminDashboard"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <FiGrid size={20} />
                  <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>
                    Dashboard
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/staffManagement"
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                >
                  <FiUsers size={20} />
                  <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>
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
            <span className="ml-2">Logout</span>
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
                        onClick={() => handleRejectUser(user.user_id)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
                      >
                        Reject
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
          {allUsers.length === 0 ? (
            <p>No users found.</p>
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
                {allUsers.map((user) => (
                  <tr key={user.user_id} className="border">
                    <td className="p-3 border">{user.user_id}</td>
                    <td className="p-3 border">{user.email}</td>
                    <td className="p-3 border">{user.name || "N/A"}</td>
                    <td className="p-3 border">{user.role || "N/A"}</td>
                    <td className="p-3 border">
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="bg-gray-500 text-white p-2 rounded hover:bg-gray-700"
                        aria-label="Delete user"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}