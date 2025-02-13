import Link from "next/link";
import AdminDashboard from "../../components/adminDashboard";

export default function Admin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <AdminDashboard />
      <div className="mt-4 space-x-4">
        <Link href="/">
          <button className="px-4 py-2 bg-gray-500 text-white rounded-md">Go to Login</button>
        </Link>
        <Link href="/staff">
          <button className="px-4 py-2 bg-green-500 text-white rounded-md">Go to Staff</button>
        </Link>
      </div>
    </div>
  );
}
