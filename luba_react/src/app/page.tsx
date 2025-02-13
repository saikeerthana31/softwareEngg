"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLoginRedirect = (role: string) => {
    router.push(`/${role}`); // Navigates to "/admin" or "/staff"
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* Top bar */}
      <div className="w-full bg-gray-200 py-4 px-6 fixed top-0 left-0 text-black font-bold text-lg shadow-md">
        Lab Utilization and Booking Application
      </div>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl h-[80vh] flex flex-col items-center justify-center mt-16">
        <h1 className="text-2xl font-bold mb-4 text-center">Lab Utilization and Booking Application</h1>
        <div className="mt-6 flex w-full items-center">
          {/* Left Section - Staff */}
          <div className="flex-1 flex flex-col items-center">
            <img alt="Staff Login" src="/staff.jpg" className="h-40 w-40 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Staff</h2>
            <button 
              className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 w-full" 
              onClick={() => handleLoginRedirect("loginStaff")}
            >
              Staff
            </button>
          </div>
          {/* Divider */}
          <div className="w-px bg-gray-300 h-32 mx-6"></div>
          {/* Right Section - Admin */}
          <div className="flex-1 flex flex-col items-center">
            <img alt="Admin Login" src="/Admin.svg" className="h-40 w-40 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Admin</h2>
            <button 
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full" 
              onClick={() => handleLoginRedirect("loginAdmin")}
            >
              Admins
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
