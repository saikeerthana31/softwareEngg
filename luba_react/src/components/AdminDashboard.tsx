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
import { UUID } from "crypto";

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
  const [isAddLabModalOpen, setIsAddLabModalOpen] = useState(false);
  const [isEditLabModalOpen, setIsEditLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
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
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("lab_bookings")
      .select("*");
  
    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError.message);
      return;
    }
  
    console.log("Bookings fetched:", bookingsData);
    setBookings(bookingsData || []);
    setPendingRequests(bookingsData || []); // Optionally filter to only pending requests
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

  const handleAddLab = async (newLab: Omit<Lab, "lab_id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to add a lab.");
        return;
      }

      console.log("Attempting to add lab as user:", user.id);
      console.log("New lab data:", newLab);

      const { data, error } = await supabase
        .from("labs")
        .insert([newLab])
        .select()
        .single();

      if (error) {
        console.error("Error adding lab:", error.message, error.details);
        alert(`Failed to add lab: ${error.message}`);
        return;
      }

      console.log("Lab added successfully:", data);
      setLabs([...labs, data]);
      setIsAddLabModalOpen(false);
    } catch (err) {
      console.error("Unexpected error adding lab:", err);
      alert("An unexpected error occurred while adding the lab.");
    }
  };

  const handleEditLab = async (updatedLab: Lab) => {
    try {
      console.log("Attempting to update lab:", updatedLab);

      const { data, error } = await supabase
        .from("labs")
        .update({
          lab_name: updatedLab.lab_name,
          location: updatedLab.location,
          capacity: updatedLab.capacity,
          equipment: updatedLab.equipment,
          description: updatedLab.description,
        })
        .eq("lab_id", updatedLab.lab_id)
        .select()
        .single();

      if (error) {
        console.error("Error updating lab:", error.message, error.details);
        alert(`Failed to update lab: ${error.message}`);
        return;
      }

      console.log("Lab updated successfully:", data);
      setLabs(labs.map((lab) => (lab.lab_id === updatedLab.lab_id ? data : lab)));
      setIsEditLabModalOpen(false);
      setEditingLab(null);
    } catch (err) {
      console.error("Unexpected error updating lab:", err);
      alert("An unexpected error occurred while updating the lab.");
    }
  };

  const handleDeleteLab = async (labId: string) => {
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("lab_bookings")
      .select("booking_id")
      .eq("lab_id", labId);

    if (bookingsError) {
      console.error("Error checking bookings:", bookingsError.message);
      return;
    }

    if (bookingsData && bookingsData.length > 0) {
      alert("Cannot delete lab with existing bookings. Please cancel all bookings first.");
      return;
    }

    const { error } = await supabase
      .from("labs")
      .delete()
      .eq("lab_id", labId);

    if (error) {
      console.error("Error deleting lab:", error.message);
      return;
    }

    setLabs(labs.filter((lab) => lab.lab_id !== labId));
    setIsEditLabModalOpen(false);
    setEditingLab(null);
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
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication error:", authError?.message || "No user logged in");
        alert("You must be logged in to update bookings.");
        return;
      }
      console.log("Authenticated user ID:", user.id);
  
      // Fetch user role
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (userError || !userData) {
        console.error("Error fetching user role:", userError?.message);
        alert("Unable to verify user role.");
        return;
      }
      console.log("User role:", userData.role);
  
      // Log booking ID details
      console.log("Attempting to update booking with ID:", bookingId);
      console.log("Type of bookingId:", typeof bookingId);
      console.log("bookingId value:", JSON.stringify(bookingId));
  
      // Verify the booking exists and is accessible
      const { data: existingBooking, error: fetchError } = await supabase
        .from("lab_bookings")
        .select("*")
        .eq("booking_id", bookingId);
      if (fetchError) {
        console.error("Error fetching booking:", fetchError.message, fetchError.details);
      }
      console.log("Booking visible to user:", existingBooking);
  
      // Attempt the update
      const { data, error } = await supabase
        .from("lab_bookings")
        .update({ status })
        .eq("booking_id", bookingId)
        .select();
  
      if (error) {
        console.error("Supabase update error:", error.message, error.details, error.hint);
        alert(`Failed to update booking: ${error.message}`);
        return;
      }
  
      if (!data || data.length === 0) {
        console.error("No rows updated for booking_id:", bookingId);
        alert("No booking found to update. Check RLS permissions or booking ID.");
        return;
      }
  
      console.log("Booking updated successfully:", data[0]);
      await fetchBookings();
      if (selectedLab) {
        await openLabDetails(selectedLab.lab);
      }
    } catch (err) {
      console.error("Unexpected error in updateBookingStatus:", err);
      alert("An unexpected error occurred while updating the booking.");
    }
  };

  // Filter labs based on search term
  const filteredLabs = labs.filter((lab) =>
    [lab.lab_name, lab.location, lab.description || ""]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error.message);
        return;
      }

      localStorage.removeItem("isAdminAuthenticated");
      localStorage.removeItem("adminUser");

      console.log("Logged out successfully");
      router.push("/loginAdmin");
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      router.push("/loginAdmin");
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
            className="flex items-center justify-center p-3 m-4 bg-red-600 rounded hover:bg-red-700"
          >
            <FiLogOut size={20} />
            <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Logout</span>
          </button>
        )}
      </aside>

      {/* Main Content - Dynamic Padding */}
      <div
        className={`flex-1 p-6 flex flex-col gap-6 transition-all duration-300 ${
          isOpen ? "pl-72" : "pl-24"
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
            <Line
              data={bookingChartData}
              height={150}
              options={{
                scales: {
                  y: {
                    beginAtZero: true, // This ensures the y-axis starts at 0
                  },
                },
              }}
            />
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
                  <th className="p-2">Id</th>
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
                      <td className="p-2">{booking.booking_id}</td>
                      <td className="p-2">{booking.date}</td>
                      <td className="p-2">{`${booking.start_time} - ${booking.end_time}`}</td>
                      <td className={`p-2 ${booking.status === "approved" ? "text-green-600" : booking.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                        {booking.status}
                      </td>
                      <td className="p-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              className="bg-green-500 text-white px-2 py-1 rounded mr-1 hover:bg-green-600"
                              onClick={() => updateBookingStatus(booking.booking_id, "approved")}
                            >
                              ✅
                            </button>
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                              onClick={() => updateBookingStatus(booking.booking_id, "rejected")}
                            >
                              ❌
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
        {/* Labs Overview Section with Search Bar */}
        <div className="relative">
          <div className="flex flex-col gap-4 mb-4">
            <h2 className="text-xl font-bold">Labs Overview</h2>
            <input
              type="text"
              placeholder="Search labs by name, location, or description..."
              className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="self-end bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
              onClick={() => setIsAddLabModalOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="h-[400px] overflow-y-auto scrollbar-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLabs.map((lab) => (
                <div
                  key={lab.lab_id}
                  className="bg-white shadow-lg p-4 rounded cursor-pointer hover:shadow-xl transition relative"
                >
                  <div onClick={() => openLabDetails(lab)}>
                    <h3 className="font-bold text-lg">{lab.lab_name}</h3>
                    <p className="text-gray-600">{lab.location}</p>
                    <p className="text-sm text-gray-500">Capacity: {lab.capacity}</p>
                    <p className="text-sm text-gray-500">{lab.description || "No description"}</p>
                  </div>
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setEditingLab(lab);
                      setIsEditLabModalOpen(true);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Lab Modal */}
        {isAddLabModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
              <h2 className="text-lg font-bold mb-4">Add New Lab</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  handleAddLab({
                    lab_name: form.lab_name.value,
                    location: form.location.value,
                    capacity: parseInt(form.capacity.value),
                    equipment: JSON.parse(form.equipment.value || "[]"),
                    description: form.description.value,
                  });
                }}
              >
                <input className="w-full p-2 mb-2 border rounded" name="lab_name" placeholder="Lab Name" required />
                <input className="w-full p-2 mb-2 border rounded" name="location" placeholder="Location" required />
                <input className="w-full p-2 mb-2 border rounded" name="capacity" type="number" placeholder="Capacity" required />
                <textarea
                  className="w-full p-2 mb-2 border rounded"
                  name="equipment"
                  placeholder='Equipment (JSON format, e.g. [{"name": "Microscope", "quantity": 5}])'
                />
                <textarea className="w-full p-2 mb-2 border rounded" name="description" placeholder="Description" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-500 text-white p-2 rounded">Add Lab</button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-500 text-white p-2 rounded"
                    onClick={() => setIsAddLabModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Lab Modal with Delete */}
        {isEditLabModalOpen && editingLab && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
              <h2 className="text-lg font-bold mb-4">Edit Lab</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  handleEditLab({
                    ...editingLab,
                    lab_name: form.lab_name.value,
                    location: form.location.value,
                    capacity: parseInt(form.capacity.value),
                    equipment: JSON.parse(form.equipment.value || "[]"),
                    description: form.description.value,
                  });
                }}
              >
                <input className="w-full p-2 mb-2 border rounded" name="lab_name" defaultValue={editingLab.lab_name} required />
                <input className="w-full p-2 mb-2 border rounded" name="location" defaultValue={editingLab.location} required />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="capacity"
                  type="number"
                  defaultValue={editingLab.capacity}
                  required
                />
                <textarea className="w-full p-2 mb-2 border rounded" name="equipment" defaultValue={JSON.stringify(editingLab.equipment)} />
                <textarea className="w-full p-2 mb-2 border rounded" name="description" defaultValue={editingLab.description} />
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 bg-blue-500 text-white p-2 rounded">Save Changes</button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-500 text-white p-2 rounded"
                    onClick={() => {
                      setIsEditLabModalOpen(false);
                      setEditingLab(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
                <button
                  type="button"
                  className="w-full mt-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${editingLab.lab_name}?`)) {
                      handleDeleteLab(editingLab.lab_id);
                    }
                  }}
                >
                  Delete Lab
                </button>
              </form>
            </div>
          </div>
        )}

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