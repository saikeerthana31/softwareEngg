"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function LabBooking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [labs, setLabs] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({});
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    const { data, error } = await supabase.from("labs").select("*");
    if (!error) setLabs(data);
  };

  const handleBookLab = async (labId) => {
    if (!userId) return alert("User not authenticated!");
    if (!selectedDate[labId] || !selectedTimeSlot[labId]) {
      return alert("Please select both date and time slot.");
    }

    const { error } = await supabase.from("lab_bookings").insert([
      {
        user_id: userId,
        lab_id: labId,
        date: selectedDate[labId],
        start_time: selectedTimeSlot[labId].split("-")[0],
        end_time: selectedTimeSlot[labId].split("-")[1],
        purpose: "Project Work",
        status: "pending",
      },
    ]);

    if (!error) {
      alert("Lab booked successfully!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Lab Management</h1>
        <ul>
          <li
            className={`p-2 rounded cursor-pointer ${
              activePage === "dashboard" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={`p-2 rounded cursor-pointer ${
              activePage === "bookLab" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActivePage("bookLab")}
          >
            Book a Lab
          </li>
          <li
            className={`p-2 rounded cursor-pointer ${
              activePage === "myBookings" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActivePage("myBookings")}
          >
            My Bookings
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Bar */}
        <div className="bg-gray-800 text-white p-4 flex justify-between">
          <h2 className="text-lg font-bold">
            {activePage === "dashboard"
              ? "Dashboard"
              : activePage === "bookLab"
              ? "Book a Lab"
              : "My Bookings"}
          </h2>
          <button className="bg-red-500 px-4 py-2 rounded">Logout</button>
        </div>

        {/* Conditional Rendering Based on Sidebar Selection */}
        <div className="p-6">
          {activePage === "dashboard" && <p>Welcome to the dashboard!</p>}
          {activePage === "myBookings" && <p>Here you can view your bookings.</p>}

          {activePage === "bookLab" && (
            <>
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search Labs..."
                className="p-2 border rounded w-full mb-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Lab List (2 Labs Per Row) */}
              <div className="grid grid-cols-2 gap-6">
                {labs
                  .filter((lab) =>
                    lab.lab_name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((lab) => (
                    <div
                      key={lab.lab_id}
                      className="p-4 border rounded-lg shadow-md bg-white flex flex-col justify-between"
                    >
                      {/* Lab Name */}
                      <h2 className="text-lg font-bold">{lab.lab_name}</h2>

                      {/* Lab Address */}
                      <p className="text-gray-600">
                        {lab.location} | <b>{lab.num_computers} Computers</b>
                      </p>
                      
                      {/* Date Picker */}
                      <input
                        type="date"
                        className="border p-2 w-full mt-2"
                        value={selectedDate[lab.lab_id] || ""}
                        onChange={(e) =>
                          setSelectedDate({
                            ...selectedDate,
                            [lab.lab_id]: e.target.value,
                          })
                        }
                      />

                      {/* Time Slot Picker */}
                      <select
                        className="border p-2 w-full mt-2"
                        value={selectedTimeSlot[lab.lab_id] || ""}
                        onChange={(e) =>
                          setSelectedTimeSlot({
                            ...selectedTimeSlot,
                            [lab.lab_id]: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Time Slot</option>
                        <option value="10:45 am - 01:15 pm">10:45 am - 01:15 pm</option>
                        <option value="02:05 pm - 04:35 pm">02:05 pm - 04:35 pm</option>
                      </select>

                      {/* Book Button (Disabled Until Date & Time Are Selected) */}
                      <button
                        className={`px-4 py-2 rounded mt-4 text-white ${
                          selectedDate[lab.lab_id] && selectedTimeSlot[lab.lab_id]
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!selectedDate[lab.lab_id] || !selectedTimeSlot[lab.lab_id]}
                        onClick={() => handleBookLab(lab.lab_id)}
                      >
                        Book
                      </button>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
