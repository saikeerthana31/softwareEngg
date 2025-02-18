"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLoginRedirect = (role: string) => {
    router.push(`/${role}`); // Navigates to "/admin" or "/staff"
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 relative">
      {/* Background Image */}
      <img
        src="/bg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Top bar */}
      <div className="w-full bg-gray-200 py-4 px-6 fixed top-0 left-0 text-black font-bold text-lg shadow-md z-10">
        Lab Utilization and Booking Application
      </div>
      
      <div className="relative bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl h-[90vh] flex flex-col items-center justify-center mt-16 z-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome</h1>
        <div className="mt-6 flex w-full items-center">
          {/* Left Section - Staff */}
          <div className="flex-1 flex flex-col items-center">
            <img alt="Staff Login" src="/staff.jpg" className="h-60 w-60 mb-6" />
           
            <button 
              className="px-8 py-4 bg-purple-400 text-white rounded-md hover:bg-purple-600 w-full text-lg" 
              onClick={() => handleLoginRedirect("loginStaff")}
            >
              Staff
            </button>
          </div>
          {/* Divider */}
          <div className="w-px bg-gray-300 h-40 mx-8"></div>
          {/* Right Section - Admin */}
          <div className="flex-1 flex flex-col items-center">
            <img alt="Admin Login" src="/Admin.jpg" className="h-60 w-60 mb-6" />
            
            <button 
              className="px-8 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full text-lg" 
              onClick={() => handleLoginRedirect("loginAdmin")}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
