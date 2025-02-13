import Link from "next/link";

export default function StaffDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold">Staff Dashboard</h1>
      <p className="text-gray-600">Welcome to the staff panel.</p>

      <div className="mt-6 space-x-4">
        <Link href="/">
          <button className="px-4 py-2 bg-gray-500 text-white rounded-md">Go to Login</button>
        </Link>
        <Link href="/admin">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Go to Admin</button>
        </Link>
      </div>
    </div>
  );
}
