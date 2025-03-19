"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Lab {
  lab_id: string;
  lab_name: string;
  location: string;
  capacity: number;
  description?: string;
}

interface Booking {
  booking_id: string;
  user_id: string;
  lab_id: string;
  booking_date: string;
  from: string;
  to: string;
  status: string;
}

export default function StudentBookingDashboard() {
  // Tabs: "book" = make a booking, "active" = active bookings, "history" = all bookings
  const [activeTab, setActiveTab] = useState("book");
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState(""); // e.g., "18:00-19:00"
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Returns an array of time slots based on the day of the week.
  const getTimeSlots = (date: Date): string[] => {
    const day = date.getDay(); // Sunday=0, Saturday=6
    if (day === 0 || day === 6) {
      // Weekend: one-hour slots from 08:00 to 21:00 (last slot: 20:00-21:00)
      const slots: string[] = [];
      for (let hour = 8; hour < 21; hour++) {
        const start = hour.toString().padStart(2, "0") + ":00";
        const end = (hour + 1).toString().padStart(2, "0") + ":00";
        slots.push(`${start}-${end}`);
      }
      return slots;
    } else {
      // Weekday: three slots only (6-7PM, 7-8PM, 8-9PM)
      return ["18:00-19:00", "19:00-20:00", "20:00-21:00"];
    }
  };

  // Format a Date to YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  // Fetch the current user using Supabase Auth
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setStudent(user);
      }
    };
    fetchUser();
  }, []);

  // Once the student is loaded, fetch available labs and all of the student's bookings.
  useEffect(() => {
    if (!student) return;

    const fetchLabs = async () => {
      const { data, error } = await supabase.from("labs").select("*");
      if (error) {
        console.error("Error fetching labs:", error.message);
      } else {
        setLabs(data as Lab[]);
      }
    };

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from("student_bookings")
        .select("*")
        .eq("user_id", student.id);
      if (error) {
        console.warn("Error fetching bookings:", error.message);
      } else if (data) {
        setBookings(data as Booking[]);
      }
    };

    fetchLabs();
    fetchBookings();
  }, [student]);

  // Handler for booking a lab.
  const handleBookLab = async () => {
    setError("");
    setSuccess("");

    if (!student) {
      setError("User not authenticated.");
      return;
    }
    if (!selectedLab) {
      setError("No lab selected.");
      return;
    }
    if (selectedLab.capacity <= 0) {
      setError("No available systems in this lab.");
      return;
    }
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    // Check if the student already has an active booking for the selected lab.
    const existingBooking = bookings.find(
      (b) => b.lab_id === selectedLab.lab_id && b.status === "active",
    );
    if (existingBooking) {
      setError("You already have an active booking for this lab.");
      return;
    }

    const [timeFrom, timeTo] = selectedSlot.split("-");
    const bookingData = {
      user_id: student.id,
      lab_id: selectedLab.lab_id,
      from: timeFrom,
      to: timeTo,
      booking_date: formatDate(selectedDate),
      status: "active",
    };

    const { data, error: bookingError } = await supabase
      .from("student_bookings")
      .insert(bookingData)
      .select();
    if (bookingError) {
      setError("Booking failed: " + bookingError.message);
      return;
    }

    // Decrement lab capacity by one.
    const { error: updateError } = await supabase
      .from("labs")
      .update({ capacity: selectedLab.capacity - 1 })
      .eq("lab_id", selectedLab.lab_id);
    if (updateError) {
      setError("Error updating lab capacity: " + updateError.message);
      return;
    }

    setSuccess("Booking successful!");
    const newBooking = (data && data[0]) as Booking;
    setBookings((prev) => [...prev, newBooking]);
    setLabs((prevLabs) =>
      prevLabs.map((lab) =>
        lab.lab_id === selectedLab.lab_id
          ? { ...lab, capacity: lab.capacity - 1 }
          : lab,
      ),
    );
    setSelectedLab(null);
    setSelectedSlot("");
  };

  // Handler for cancelling a booking by updating its status to "cancelled"
  const handleCancelBooking = async (booking: Booking) => {
    setError("");
    setSuccess("");

    if (!student) {
      setError("User not authenticated.");
      return;
    }

    const { error: updateError } = await supabase
      .from("student_bookings")
      .update({ status: "cancelled" })
      .eq("booking_id", booking.booking_id);
    if (updateError) {
      setError("Error cancelling booking: " + updateError.message);
      return;
    }

    // Increase the lab capacity by one.
    const labToUpdate = labs.find((lab) => lab.lab_id === booking.lab_id);
    if (labToUpdate) {
      const { error: capacityError } = await supabase
        .from("labs")
        .update({ capacity: labToUpdate.capacity + 1 })
        .eq("lab_id", labToUpdate.lab_id);
      if (capacityError) {
        setError("Error updating lab capacity: " + capacityError.message);
        return;
      }
      setLabs((prevLabs) =>
        prevLabs.map((lab) =>
          lab.lab_id === labToUpdate.lab_id
            ? { ...lab, capacity: lab.capacity + 1 }
            : lab,
        ),
      );
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === booking.booking_id ? { ...b, status: "cancelled" } : b,
      ),
    );
    setSuccess("Booking cancelled successfully.");
  };

  // Derive active bookings and full booking history.
  const activeBookings = bookings.filter((b) => b.status === "active");
  const bookingHistory = bookings; // Includes both active and cancelled.

  // Compute available time slots based on the selected date.
  const availableTimeSlots = getTimeSlots(selectedDate);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Three Tabs */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow">
        <h1 className="text-2xl font-bold">Student Booking Dashboard</h1>
        <div className="mt-2 space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "book" ? "bg-blue-800" : "bg-blue-400"
            }`}
            onClick={() => setActiveTab("book")}
          >
            Book Lab
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "active" ? "bg-blue-800" : "bg-blue-400"
            }`}
            onClick={() => setActiveTab("active")}
          >
            My Active Bookings
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "history" ? "bg-blue-800" : "bg-blue-400"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Booking History
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* "Book Lab" Tab */}
        {activeTab === "book" && (
          <>
            <h2 className="text-xl font-bold mb-4">Available Labs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <div
                  key={lab.lab_id}
                  className="bg-white shadow-lg rounded p-4 cursor-pointer hover:shadow-2xl transition-all"
                  onClick={() => setSelectedLab(lab)}
                >
                  <h2 className="text-xl font-semibold mb-2">{lab.lab_name}</h2>
                  <p className="text-gray-600 mb-2">{lab.location}</p>
                  <p className="text-sm text-gray-500">
                    Available Systems: {lab.capacity}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lab.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Booking Modal */}
        {activeTab === "book" && selectedLab && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{selectedLab.lab_name}</h2>
              <p className="mb-2 text-gray-600">
                <strong>Location:</strong> {selectedLab.location}
              </p>
              <p className="mb-2 text-gray-600">
                <strong>Available Systems:</strong> {selectedLab.capacity}
              </p>
              <p className="mb-4 text-gray-600">{selectedLab.description}</p>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Select Date:
                </label>
                <Calendar onChange={setSelectedDate} value={selectedDate} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Select Time Slot:
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  <option value="">-- Select a time slot --</option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={handleBookLab}
              >
                Confirm Booking
              </button>
              <button
                className="mt-4 text-gray-600 underline"
                onClick={() => setSelectedLab(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* "My Active Bookings" Tab */}
        {activeTab === "active" && (
          <div>
            <h2 className="text-xl font-bold mb-4">My Active Bookings</h2>
            {activeBookings.length > 0 ? (
              activeBookings.map((booking) => {
                const labInfo = labs.find(
                  (lab) => lab.lab_id === booking.lab_id,
                );
                return (
                  <div
                    key={booking.booking_id}
                    className="bg-white shadow-lg rounded p-4 mb-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {labInfo?.lab_name || "Unknown Lab"}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Date: {booking.booking_date}
                      </p>
                      <p className="text-gray-600 mb-2">
                        Time: {booking.from} - {booking.to}
                      </p>
                    </div>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      onClick={() => handleCancelBooking(booking)}
                    >
                      Cancel
                    </button>
                  </div>
                );
              })
            ) : (
              <p>You have no active bookings.</p>
            )}
          </div>
        )}

        {/* "Booking History" Tab */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Booking History</h2>
            {bookingHistory.length > 0 ? (
              bookingHistory.map((booking) => {
                const labInfo = labs.find(
                  (lab) => lab.lab_id === booking.lab_id,
                );
                return (
                  <div
                    key={booking.booking_id}
                    className="bg-white shadow-lg rounded p-4 mb-4"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {labInfo?.lab_name || "Unknown Lab"}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Date: {booking.booking_date}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Time: {booking.from} - {booking.to}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Status: {booking.status}
                    </p>
                  </div>
                );
              })
            ) : (
              <p>You have no booking history.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
