import Link from "next/link";

export default function StaffHome() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center bg-purple-300 text-black p-4 shadow-md">
        <div className="text-xl font-bold">LUBA</div>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="relative p-4 hover:text-black hover:after:block 
                        after:absolute after:left-0 after:bottom-0 
                        after:w-0 after:h-[2px] after:bg-black 
                        hover:after:w-full transition-all"
          >
            Dashboard
          </Link>
          <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">Sign Out</button>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-8">
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <p className="text-gray-600">Welcome to the staff panel.</p>
      </div>
    </div>
  );
}
