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
  const [activeTab, setActiveTab] = useState("book");
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getTimeSlots = (date: Date): string[] => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      const slots: string[] = [];
      for (let hour = 8; hour < 21; hour++) {
        const start = hour.toString().padStart(2, "0") + ":00";
        const end = (hour + 1).toString().padStart(2, "0") + ":00";
        slots.push(`${start}-${end}`);
      }
      return slots;
    } else {
      return ["18:00-19:00", "19:00-20:00", "20:00-21:00"];
    }
  };

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setStudent(user);
          setUserId(user.id as string);
        } else {
          window.location.replace("http://localhost:3000/loginStudent");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        window.location.replace("http://localhost:3000/loginStudent");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!student) return;

    const fetchData = async () => {
      try {
        const [labsResponse, bookingsResponse] = await Promise.all([
          supabase.from("labs").select("*"),
          supabase
            .from("student_bookings")
            .select("*")
            .eq("user_id", student.id),
        ]);

        if (labsResponse.error) {
          console.error("Error fetching labs:", labsResponse.error.message);
        } else {
          setLabs(labsResponse.data as Lab[]);
        }

        if (bookingsResponse.error) {
          console.warn("Error fetching bookings:", bookingsResponse.error.message);
        } else if (bookingsResponse.data) {
          setBookings(bookingsResponse.data as Booking[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [student]);

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
      booking_date: formatDate(selectedDate || new Date()),
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

  const activeBookings = bookings.filter((b) => b.status === "active");
  const bookingHistory = bookings;

  const availableTimeSlots = getTimeSlots(selectedDate ?? new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white py-4 px-6 shadow flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Booking Dashboard</h1>
        </header>
        <main className="p-6">Loading...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-4 px-6 shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Booking Dashboard</h1>
        <div className="space-x-4">
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
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.replace("http://localhost:3000/loginStudent");
            }}
          >
            Logout
          </button>
        </div>
      </header>

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

        {activeTab === "book" && (
          <>
            <h2 className="text-xl font-bold mb-4">Available Labs</h2>
            {Array.isArray(labs) && labs.length > 0 ? (
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
            ) : (
              <p>No labs available at the moment.</p>
            )}
          </>
        )}

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
                <Calendar
                  onChange={(value) =>
                    setSelectedDate(value instanceof Date ? value : null)
                  }
                  value={selectedDate}
                />
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