"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLoginRedirect = (role: string) => {
    router.push(`/${role}`);
  };
<<<<<<< HEAD
  const handleSignUp = (role: string) => {
    router.push(`/${role}`); // Navigates to "/admin" or "/staff"
  };
  
=======

>>>>>>> origin/nitish
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-8">
      {/* Background Image */}
      <img
        src="/bg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white bg-opacity-30 backdrop-blur-md text-gray-900 py-4 px-6 text-center font-bold text-lg shadow-md z-20">
        Lab Utilization and Booking Application (LUBA)
      </header>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-white drop-shadow-lg mb-10 mt-16 text-center z-10">
        Welcome
      </h1>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl z-10">
        {/* Staff Card */}
        <div className="flex flex-col items-center p-6 bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-lg">
          <img
            alt="Staff Login"
            src="/staff.jpg"
            className="h-40 w-40 rounded-lg mb-4 shadow-md"
          />
          <h2 className="text-2xl font-semibold text-white mb-4">Staff</h2>
          <button
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-700 transition-all w-full"
            onClick={() => handleLoginRedirect("loginStaff")}
          >
            Login as Staff
          </button>
        </div>

        {/* Admin Card */}
        <div className="flex flex-col items-center p-6 bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-lg">
          <img
            alt="Admin Login"
            src="/Admin.jpg"
            className="h-40 w-40 rounded-lg mb-4 shadow-md"
          />
          <h2 className="text-2xl font-semibold text-white mb-4">Admin</h2>
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-all w-full"
            onClick={() => handleLoginRedirect("loginAdmin")}
          >
            Login as Admin
          </button>
        </div>

        {/* Students Card */}
        <div className="flex flex-col items-center p-6 bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-lg">
          <img
            alt="Student Login"
            src="/student.jpg"
            className="h-40 w-40 rounded-lg mb-4 shadow-md"
          />
          <h2 className="text-2xl font-semibold text-white mb-4">Students</h2>
          <button
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-all w-full"
            onClick={() => handleLoginRedirect("loginStudent")}
          >
            Login as Student
          </button>
        </div>
        <div className="p-4">
        <button 
              className=" px-8 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full text-lg" 
              onClick={() => handleSignUp("signUp")}
            >
              sign up
            </button>
        </div>
        
      </div>
    </div>
  );
}
