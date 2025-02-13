import Link from "next/link";
import StaffDashboard from "../../components/staffDashboard";

export default function Staff() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <StaffDashboard />
      <div className="mt-4 space-x-4">
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
