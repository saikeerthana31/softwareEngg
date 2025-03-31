"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function LabBooking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [labs, setLabs] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Record<string, string>>({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    Record<string, string>
  >({});
  const [activePage, setActivePage] = useState("dashboard");
  const [upcomingLabs, setUpcomingLabs] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [bookingPurpose, setBookingPurpose] = useState<Record<string, string>>(
    {}
  );
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [bookedLabId, setBookedLabId] = useState(null);

  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    collegeId: "CSE12345",
    specialization: "Computer Science and Engineering",
    program: "B.Tech",
    gender: "Male",
    campus: "Coimbatore",
    dob: "2002-05-15",
    phone: "+91 9876543210",
    profilePic: "/profile_staff.jpeg",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.error(
            "Authentication error:",
            error?.message || "No user found"
          );
          await supabase.auth.signOut();
          window.location.href = "/loginStaff";
          return;
        }

        console.log("Authenticated user:", user);
        setUserId(user.id as string);
        setUserProfile((prev) => ({
          ...prev,
          email: user.email || prev.email,
        }));
        fetchLabs();
      } catch (error) {
        console.error("Unexpected error during authentication:", error);
        await supabase.auth.signOut();
        window.location.href = "/loginStaff";
      }
    };

    checkAuth();
    history.replaceState({}, "", location.href);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUpcomingLabs();
    }
  }, [userId]);

  const fetchLabs = async () => {
    const { data, error } = await supabase.from("labs").select("*");
    if (!error) setLabs(data);
  };

  const fetchUpcomingLabs = async () => {
    if (!userId) {
      console.error("No userId available to fetch bookings.");
      return;
    }

    const { data, error } = await supabase
      .from("lab_bookings")
      .select(
        "booking_id, lab_id, date, start_time, end_time, status, purpose, labs(lab_name, location)"
      )
      .eq("user_id", userId)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching upcoming labs:", error.message || error);
      return;
    }

    console.log("Fetched upcoming labs for user:", userId, data);
    setUpcomingLabs(data || []);
  };

  const handleBookLab = async (labId: string, labName: string) => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("User not authenticated:", authError?.message);
        await supabase.auth.signOut();
        window.location.href = "/loginStaff";
        return;
      }

      const date = selectedDate[labId];
      const timeSlot = selectedTimeSlot[labId];
      const purpose = bookingPurpose[labId];

      if (!date || !timeSlot || !purpose) {
        alert("Please fill in date, time slot, and purpose before booking.");
        return;
      }

      const [startTime, endTime] = timeSlot.split(" - ");

      const { data, error } = await supabase.from("lab_bookings").insert([
        {
          user_id: user.id,
          lab_id: labId,
          date,
          start_time: startTime,
          end_time: endTime,
          purpose,
          status: "pending",
        },
      ]);

      if (error) throw error;

      setPopupMessage(labName);
      setBookedLabId(labId);
      setShowPopup(true);

      setSelectedDate((prev) => ({ ...prev, [labId]: "" }));
      setSelectedTimeSlot((prev) => ({ ...prev, [labId]: "" }));
      setBookingPurpose((prev) => ({ ...prev, [labId]: "" }));

      fetchUpcomingLabs();
    } catch (error) {
      console.error("Error in handleBookLab:", error);
      await supabase.auth.signOut();
      window.location.href = "/loginStaff";
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const { error } = await supabase
        .from("lab_bookings")
        .delete()
        .eq("booking_id", bookingId);

      if (error) throw error;

      fetchUpcomingLabs();
      setPopupMessage("Booking has been successfully deleted.");
      setShowPopup(true);
    } catch (error) {
      console.error("Error deleting booking:", error);
      setPopupMessage("Failed to delete booking. Please try again.");
      setShowPopup(true);
    }
  };

  const handleRemoveFromDashboard = (bookingId: string) => {
    setUpcomingLabs((prev) =>
      prev.filter((booking) => booking.booking_id !== bookingId)
    );
  };

  const handleProfileChange = (key: string, value: string) => {
    setUserProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with slide-in animation */}
      <div className="w-64 bg-gray-900 text-white p-4 fixed h-full transform transition-transform duration-300 ease-in-out">
        <h1 className="text-xl font-bold mb-6 animate-fade-in">
          Lab Management
        </h1>
        <ul>
          {["dashboard", "bookLab", "profileDetails"].map((page) => (
            <li
              key={page}
              className={`p-2 rounded cursor-pointer transition-all duration-200 hover:bg-gray-700 ${
                activePage === page ? "bg-gray-700" : ""
              }`}
              onClick={() => setActivePage(page)}
            >
              {page === "dashboard"
                ? "Dashboard"
                : page === "bookLab"
                ? "Book a Lab"
                : "Profile Details"}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col ml-64">
        {/* Header with fade-in */}
        <div className="bg-gray-800 text-white p-4 flex justify-between animate-fade-in-down">
          <h2 className="text-lg font-bold capitalize">
            {activePage.replace(/([A-Z])/g, " $1")}
          </h2>
          <button
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/loginStaff";
            }}
          >
            Logout
          </button>
        </div>

        <div className="p-6 overflow-auto">
          {activePage === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-fade-in">
                Your Upcoming Lab Bookings
              </h2>
              {upcomingLabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingLabs.map((booking) => (
                    <div
                      key={booking.booking_id}
                      className="p-4 bg-white rounded-lg shadow-md border flex flex-col transform transition-all duration-300 hover:scale-105 animate-fade-in-up"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {booking.labs.lab_name}
                        </h3>
                        <div>
                          <button
                            className="text-gray-500 hover:text-gray-700 font-semibold mr-2 transition-colors duration-200"
                            onClick={() =>
                              handleRemoveFromDashboard(booking.booking_id)
                            }
                          >
                            Hide
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 font-semibold transition-colors duration-200"
                            onClick={() =>
                              handleDeleteBooking(booking.booking_id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        Location: {booking.labs.location}
                      </p>
                      <p className="text-gray-600">Date: {booking.date}</p>
                      <p className="text-gray-600">
                        Time: {booking.start_time} - {booking.end_time}
                      </p>
                      <p className="text-gray-600">
                        Purpose: {booking.purpose}
                      </p>
                      <p
                        className={`mt-2 font-medium ${
                          booking.status === "approved"
                            ? "text-green-600"
                            : booking.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Status:{" "}
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 animate-fade-in">
                  No upcoming lab bookings for you.
                </p>
              )}
            </div>
          )}

          {activePage === "profileDetails" && (
            <div className="max-w-3xl mx-auto bg-[#f7f7f7] shadow-lg rounded-lg p-6 relative transform transition-all duration-500 animate-slide-up">
              <button
                className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all duration-200"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Save" : "Edit"}
              </button>

              <div className="flex items-center mb-6">
                <img
                  src={userProfile.profilePic}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-gray-300 shadow-md transform transition-transform duration-300 hover:scale-110"
                />
                <div className="ml-6">
                  {isEditing ? (
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      className="text-2xl font-bold text-gray-800 border p-2 rounded w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">
                      {userProfile.name}
                    </h2>
                  )}
                  <p className="text-gray-600">{userProfile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "College ID", key: "collegeId" },
                  { label: "Specialization", key: "specialization" },
                  { label: "Program", key: "program" },
                  { label: "Gender", key: "gender" },
                  { label: "Campus", key: "campus" },
                  { label: "Date of Birth", key: "dob" },
                  { label: "Phone Number", key: "phone" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fade-in-up"
                  >
                    <p className="text-gray-700 font-semibold">{item.label}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userProfile[item.key]}
                        onChange={(e) =>
                          handleProfileChange(item.key, e.target.value)
                        }
                        className="text-gray-600 border p-2 rounded w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">{userProfile[item.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === "bookLab" && (
            <>
              <input
                type="text"
                placeholder="Search Labs..."
                className="p-2 border rounded w-full mb-4 transition-all duration-200 focus:ring-2 focus:ring-blue-500 animate-fade-in"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-6">
                {labs
                  .filter((lab) =>
                    lab.lab_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((lab) => (
                    <div
                      key={lab.lab_id}
                      className="p-4 border rounded-lg shadow-md bg-white transform transition-all duration-300 hover:scale-105 animate-fade-in-up"
                    >
                      <h2 className="text-lg font-bold">{lab.lab_name}</h2>
                      <p className="text-gray-600">
                        {lab.location} |{" "}
                        <b>{lab.num_computers || "N/A"} Computers</b>
                      </p>
                      <input
                        type="date"
                        className="border p-2 w-full mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        value={selectedDate[lab.lab_id] || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setSelectedDate({
                            ...selectedDate,
                            [lab.lab_id]: e.target.value,
                          })
                        }
                      />
                      <select
                        className="border p-2 w-full mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        value={selectedTimeSlot[lab.lab_id] || ""}
                        onChange={(e) =>
                          setSelectedTimeSlot({
                            ...selectedTimeSlot,
                            [lab.lab_id]: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Time Slot</option>
                        <option value="08:00 AM - 10:35 PM">
                          08:00 AM - 10:35 PM
                        </option>
                        <option value="10:45 AM - 01:15 PM">
                          10:45 AM - 01:15 PM
                        </option>
                        <option value="02:05 PM - 04:35 PM">
                          02:05 PM - 04:35 PM
                        </option>
                      </select>
                      <textarea
                        className="border p-2 w-full mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter purpose of booking..."
                        rows="3"
                        value={bookingPurpose[lab.lab_id] || ""}
                        onChange={(e) =>
                          setBookingPurpose({
                            ...bookingPurpose,
                            [lab.lab_id]: e.target.value,
                          })
                        }
                      />
                      <button
                        className="px-4 py-2 rounded mt-4 text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
                        onClick={() => handleBookLab(lab.lab_id, lab.lab_name)}
                      >
                        Book
                      </button>
                    </div>
                  ))}
              </div>

              {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                  <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all duration-300 scale-0 animate-pop-in">
                    <h2 className="text-xl font-bold mb-4">
                      {popupMessage.includes("deleted") ||
                      popupMessage.includes("removed")
                        ? "Booking Removed"
                        : "Booking Confirmed!"}
                    </h2>
                    <p className="mb-4">
                      {popupMessage.includes("deleted") ||
                      popupMessage.includes("removed")
                        ? popupMessage
                        : `${popupMessage} has been successfully booked.`}
                    </p>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
                      onClick={() => setShowPopup(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          80% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-in-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-in-out;
        }
        .animate-pop-in {
          animation: popIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
