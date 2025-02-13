import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold">Login Page</h1>
      <p className="text-gray-600">Please log in to continue.</p>
      
      <div className="mt-6 space-x-4">
        <Link href="/admin">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Go to Admin</button>
        </Link>
        <Link href="/staff">
          <button className="px-4 py-2 bg-green-500 text-white rounded-md">Go to Staff</button>
        </Link>
      </div>
    </div>
  );
}
