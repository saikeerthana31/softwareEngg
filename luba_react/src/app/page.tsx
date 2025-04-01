"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleRedirect = (role: string) => {
    router.push(`/${role}`);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-12">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 w-full h-full bg-black bg-opacity-40 z-0" />
      <img
        src="/bg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white bg-opacity-30 backdrop-blur-md text-gray-900 py-6 px-8 text-center font-bold text-xl shadow-md z-20">
        Lab Utilization and Booking Application (LUBA)
      </header>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center mt-20">
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-12 text-center">
          Welcome to LUBA
        </h1>

        {/* Login Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl mb-16">
          {/* Staff Card */}
          <div className="flex flex-col items-center p-8 bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg">
            <img
              alt="Staff Login"
              src="/staff.jpg"
              className="h-48 w-48 rounded-lg mb-6 shadow-md object-cover"
            />
            <h2 className="text-3xl font-semibold text-white mb-6">Staff</h2>
            <button
              className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all w-full text-lg"
              onClick={() => handleRedirect("loginStaff")}
            >
              Login as Staff
            </button>
          </div>

          {/* Admin Card */}
          <div className="flex flex-col items-center p-8 bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg">
            <img
              alt="Admin Login"
              src="/Admin.jpg"
              className="h-48 w-48 rounded-lg mb-6 shadow-md object-cover"
            />
            <h2 className="text-3xl font-semibold text-white mb-6">Admin</h2>
            <button
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all w-full text-lg"
              onClick={() => handleRedirect("loginAdmin")}
            >
              Login as Admin
            </button>
          </div>

          {/* Students Card */}
          <div className="flex flex-col items-center p-8 bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg">
            <img
              alt="Student Login"
              src="/student.jpg"
              className="h-48 w-48 rounded-lg mb-6 shadow-md object-cover"
            />
            <h2 className="text-3xl font-semibold text-white mb-6">Students</h2>
            <button
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all w-full text-lg"
              onClick={() => handleRedirect("loginStudent")}
            >
              Login as Student
            </button>
          </div>
          
        </div>
        {/* Sign Up Section */}
        <div className="flex flex-col w-full max-w-lg">
            <p className="text-black text-xl mb-6 drop-shadow-md items-center text-center">
              Don't have access? Sign up
            </p>
            <button
              className="px-10 py-5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full text-xl transition-all"
              onClick={() => handleRedirect("signUp")}
            >
              Sign Up
            </button>
          </div>


      </div>
    </div>
  );
}