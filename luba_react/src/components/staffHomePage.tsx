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
  const [isEditing, setIsEditing] = useState(false);

  // User Profile Data (Editable)
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
    profilePic: "/profile_staff.png",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/loginStaff"; // Redirect if not authenticated
      } else {
        setUserId(user.id);
        fetchLabs();
      }
    };

    checkAuth();

    // Prevent back navigation after logout
    history.replaceState(null, null, location.href);
  }, []);

  const fetchLabs = async () => {
    const { data, error } = await supabase.from("labs").select("*");
    if (!error) setLabs(data);
  };

  const handleBookLab = async (labId) => {
    const today = new Date();
    const selectedLabDate = new Date(selectedDate[labId]);

    if (!userId) return alert("User not authenticated!");
    if (!selectedDate[labId] || !selectedTimeSlot[labId]) {
      return alert("Please select both date and time slot.");
    }
    if (
      selectedLabDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0) ||
      (selectedLabDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0) &&
        new Date().getHours() >=
          parseInt(selectedTimeSlot[labId].split(":")[0]))
    ) {
      return alert("You cannot book a lab for a past date or time.");
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
      <div className="w-64 bg-gray-900 text-white p-4 fixed h-full">
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
              activePage === "profileDetails" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActivePage("profileDetails")}
          >
            Profile Details
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navigation Bar */}
        <div className="bg-gray-800 text-white p-4 flex justify-between">
          <h2 className="text-lg font-bold">
            {activePage === "dashboard"
              ? "Dashboard"
              : activePage === "bookLab"
                ? "Book a Lab"
                : "Profile Details"}
          </h2>
          <button
            className="bg-red-500 px-4 py-2 rounded"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/loginStaff"; // Redirect to login page
              history.replaceState(null, null, location.href); // Prevent back button navigation
            }}
          >
            Logout
          </button>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {activePage === "dashboard" && <p>Welcome to the dashboard!</p>}

          {/* Profile Details Page */}
          {activePage === "profileDetails" && (
            <div className="max-w-3xl mx-auto bg-[#f7f7f7] shadow-lg rounded-lg p-6 relative">
              <button
                className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Save" : "Edit"}
              </button>

              <div className="flex items-center mb-6">
                <img
                  src={userProfile.profilePic}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-gray-300 shadow-md"
                />
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {userProfile.name}
                  </h2>
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
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <p className="text-gray-700 font-semibold">{item.label}</p>
                    <p className="text-gray-600">{userProfile[item.key]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Book a Lab Page */}
          {activePage === "bookLab" && (
            <>
              <input
                type="text"
                placeholder="Search Labs..."
                className="p-2 border rounded w-full mb-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-6">
                {labs
                  .filter((lab) =>
                    lab.lab_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                  )
                  .map((lab) => (
                    <div
                      key={lab.lab_id}
                      className="p-4 border rounded-lg shadow-md bg-white flex flex-col justify-between"
                    >
                      <h2 className="text-lg font-bold">{lab.lab_name}</h2>
                      <p className="text-gray-600">
                        {lab.location} | <b>{lab.num_computers} Computers</b>
                      </p>
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
