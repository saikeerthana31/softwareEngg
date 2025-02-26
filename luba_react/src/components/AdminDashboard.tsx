"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGrid, FiUsers, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import { Bar, Line } from "react-chartjs-2";
import "react-calendar/dist/Calendar.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

interface Lab {
  lab_id: string;
  lab_name: string;
  location: string;
  capacity: number;
  equipment: { name: string; quantity: number }[];
  description?: string;
}

interface Booking {
  booking_id: string;
  user_id: string;
  lab_id: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: string;
}

interface Utilization {
  utilization_id?: string;
  lab_id: string;
  date: string;
  total_hours_used: number;
}

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<{ lab: Lab; bookings: Booking[] } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [utilization, setUtilization] = useState<Utilization[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLabs = async () => {
    const { data: labsData, error: labsError } = await supabase.from("labs").select("*");
    if (labsError) {
      console.error("Error fetching labs:", labsError.message);
      return;
    }
    console.log("Labs fetched:", labsData);
    setLabs(labsData || []);
  };

  const fetchBookings = async () => {
    const { data: bookingsData, error: bookingsError } = await supabase.from("lab_bookings").select("*");
    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError.message);
      return;
    }
    console.log("Bookings fetched:", bookingsData);
    setBookings(bookingsData || []);
    setPendingRequests(bookingsData || []);
  };

  const fetchUtilization = async () => {
    const { data: utilizationData, error: utilizationError } = await supabase.from("lab_utilization").select("*");
    if (utilizationError) {
      console.error("Error fetching utilization:", utilizationError.message);
      return;
    }
    if (!utilizationData || utilizationData.length === 0) {
      console.warn("No utilization data returned from Supabase");
    } else {
      console.log("Utilization fetched:", utilizationData);
    }
    setUtilization(utilizationData || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchLabs(), fetchBookings(), fetchUtilization()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const utilizationByDate: { [key: string]: number } = {};
  utilization.forEach((entry) => {
    utilizationByDate[entry.date] = (utilizationByDate[entry.date] || 0) + entry.total_hours_used;
  });
  console.log("Utilization by date:", utilizationByDate);

  const utilizationChartData = {
    labels: Object.keys(utilizationByDate),
    datasets: [
      {
        label: "Total Hours Used",
        data: Object.values(utilizationByDate),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const bookingsByDate: { [key: string]: number } = {};
  bookings.forEach((booking) => {
    bookingsByDate[booking.date] = (bookingsByDate[booking.date] || 0) + 1;
  });
  console.log("Bookings by date:", bookingsByDate);

  const bookingChartData = {
    labels: Object.keys(bookingsByDate),
    datasets: [
      {
        label: "Number of Bookings",
        data: Object.values(bookingsByDate),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  const openLabDetails = async (lab: Lab) => {
    const { data: bookingsData, error } = await supabase
      .from("lab_bookings")
      .select("*")
      .eq("lab_id", lab.lab_id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching lab bookings:", error.message);
      return;
    }
    setSelectedLab({ lab, bookings: bookingsData || [] });
  };

  const updateBookingStatus = async (bookingId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("lab_bookings")
      .update({ status })
      .eq("booking_id", bookingId);

    if (error) {
      console.error("Error updating booking:", error.message);
      return;
    }
    if (selectedLab) {
      openLabDetails(selectedLab.lab);
    }
    fetchBookings();
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error.message);
        return; // Optionally, set an error state to display to the user
      }

      // Clear localStorage
      localStorage.removeItem("isAdminAuthenticated");
      localStorage.removeItem("adminUser");

      console.log("Logged out successfully");
      router.push("/loginAdmin");
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      router.push("/loginAdmin"); // Redirect even on error to ensure logout
    }
  };

  return (
    <div className="relative flex min-h-screen bg-gray-100">
      {/* Sidebar - Fixed Position */}
      <aside
        className={`fixed top-0 left-0 z-10 bg-white shadow-xl text-black h-screen flex flex-col justify-between transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <div>
          <div className="p-4 flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>Admin Panel</h2>
            <button onClick={() => setIsOpen(!isOpen)} className="text-black">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
          <nav className="pl-3 mt-4">
            <ul>
              <li className="mb-2">
                <Link href="../adminDashboard" className="flex items-center p-2 rounded hover:bg-gray-200">
                  <FiGrid size={20} />
                  <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="../staffManagement" className="flex items-center p-2 rounded hover:bg-gray-200">
                  <FiUsers size={20} />
                  <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Staff Management</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        {isOpen && (
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-3 m-4 bg-red-600 rounded hover:bg-red-700">
            <FiLogOut size={20} />
            <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Logout</span>
          </button>
        )}
      </aside>

      {/* Main Content - Dynamic Padding */}
      <div
        className={`flex-1 p-6 flex flex-col gap-6 transition-all duration-300 ${
          isOpen ? "pl-72" : "pl-24" // Adjust padding-left based on sidebar width
        }`}
      >
        {/* 📊 Lab Utilization Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 shadow-lg rounded">
            <h3 className="text-lg font-bold mb-2">Lab Utilization</h3>
            {utilization.length > 0 ? (
              <Bar data={utilizationChartData} height={150} />
            ) : (
              <p className="text-sm text-gray-500">No utilization data available.</p>
            )}
          </div>
          <div className="bg-white p-4 shadow-lg rounded">
            <h3 className="text-lg font-bold mb-2">Booking Trends</h3>
            {bookings.length > 0 ? (
              <Line data={bookingChartData} height={150} />
            ) : (
              <p className="text-sm text-gray-500">No booking data available.</p>
            )}
          </div>
        </div>

        {/* All Requests Table */}
        <div className="bg-white p-4 shadow-lg rounded mb-6">
          <h3 className="text-lg font-bold mb-2">All Requests</h3>
          {pendingRequests.length > 0 ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">User</th>
                  <th className="p-2">Lab</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((booking) => {
                  const lab = labs.find((l) => l.lab_id === booking.lab_id);
                  return (
                    <tr key={booking.booking_id} className="border-t">
                      <td className="p-2">{booking.user_id}</td>
                      <td className="p-2">{lab?.lab_name || "Unknown"}</td>
                      <td className="p-2">{booking.date}</td>
                      <td className="p-2">{`${booking.start_time} - ${booking.end_time}`}</td>
                      <td className={`p-2 ${booking.status === "approved" ? "text-green-600" : "text-yellow-600"}`}>
                        {booking.status}
                      </td>
                      <td className="p-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              className="bg-green-500 text-white px-2 py-1 rounded mr-1"
                              onClick={() => updateBookingStatus(booking.booking_id, "approved")}
                            >
                              ✓
                            </button>
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded"
                              onClick={() => updateBookingStatus(booking.booking_id, "rejected")}
                            >
                              ✗
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No requests available.</p>
          )}
        </div>

        {/* Labs Overview Section */}
        <div className="relative">
          <h2 className="text-xl font-bold mb-4">Labs Overview</h2>
          <div className="h-[400px] overflow-y-auto scrollbar-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labs.map((lab) => (
                <div
                  key={lab.lab_id}
                  className="bg-white shadow-lg p-4 rounded cursor-pointer hover:shadow-xl transition"
                  onClick={() => openLabDetails(lab)}
                >
                  <h3 className="font-bold text-lg">{lab.lab_name}</h3>
                  <p className="text-gray-600">{lab.location}</p>
                  <p className="text-sm text-gray-500">Capacity: {lab.capacity}</p>
                  <p className="text-sm text-gray-500">{lab.description || "No description"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lab Details Modal */}
        {selectedLab && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
              <h2 className="text-lg font-bold mb-2">{selectedLab.lab.lab_name}</h2>
              <p className="text-sm text-gray-600">{selectedLab.lab.description}</p>
              <p className="text-sm text-gray-600">Capacity: {selectedLab.lab.capacity}</p>
              <p className="text-sm text-gray-600">Location: {selectedLab.lab.location}</p>
              <h3 className="font-bold mt-4">Lab Bookings</h3>
              {selectedLab.bookings.length > 0 ? (
                <table className="w-full mt-2 text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2">User</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Time</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLab.bookings.map((booking) => (
                      <tr key={booking.booking_id} className="border-t">
                        <td className="p-2">{booking.user_id}</td>
                        <td className="p-2">{booking.date}</td>
                        <td className="p-2">{booking.start_time} - {booking.end_time}</td>
                        <td className={`p-2 ${booking.status === "approved" ? "text-green-600" : "text-red-600"}`}>
                          {booking.status}
                        </td>
                        <td className="p-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                className="bg-green-500 text-white px-2 py-1 rounded mr-1"
                                onClick={() => updateBookingStatus(booking.booking_id, "approved")}
                              >
                                ✓
                              </button>
                              <button
                                className="bg-red-500 text-white px-2 py-1 rounded"
                                onClick={() => updateBookingStatus(booking.booking_id, "rejected")}
                              >
                                ✗
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">No bookings found.</p>
              )}
              <button
                className="mt-4 bg-gray-500 text-white px-3 py-1 rounded w-full"
                onClick={() => setSelectedLab(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}