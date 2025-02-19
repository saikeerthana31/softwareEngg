"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGrid, FiUsers, FiLogOut, FiPlus, FiEdit } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Doughnut, Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

interface Lab {
  id: number;
  name: string;
  location: string;
  status: string;
}

interface Report {
  id: number;
  message: string;
  submittedBy: string;
  date: string;
}

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminUser");
      if (!storedAdmin) {
        router.push("/loginAdmin");
        return;
      }
      const parsedAdmin = JSON.parse(storedAdmin);
      if (typeof parsedAdmin === "object" && parsedAdmin?.email) {
        setAdmin(parsedAdmin);
      } else {
        localStorage.removeItem("adminUser");
        router.push("/loginAdmin");
      }
    } catch (error) {
      localStorage.removeItem("adminUser");
      router.push("/loginAdmin");
    }
  }, [router]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/labs");
        if (!response.ok) throw new Error(`Failed to fetch labs: ${response.status}`);
        const data = await response.json();
        setLabs(data.labs);
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    };
    fetchLabs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/loginAdmin");
  };

  const openEditModal = (lab: Lab) => {
    setSelectedLab({ ...lab });
    setIsModalOpen(true);
  };

  const handleUpdateLab = async () => {
    if (!selectedLab) return;
    try {
      const response = await fetch(`http://localhost:5001/api/labs/${selectedLab.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedLab),
      });
      if (response.ok) {
        setLabs(labs.map(lab => (lab.id === selectedLab.id ? selectedLab : lab)));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating lab:", error);
    }
  };

  const filteredLabs = labs.filter(
    (lab) =>
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!admin) return null;

  const labStatusCounts = {
    Active: labs.filter((lab) => lab.status === "Active").length,
    "Under Maintenance": labs.filter((lab) => lab.status === "Under Maintenance").length,
    Free: labs.filter((lab) => lab.status === "Free").length,
  };

  const chartData = {
    labels: ["Active", "Under Maintenance", "Free"],
    datasets: [
      {
        data: [labStatusCounts.Active, labStatusCounts["Under Maintenance"], labStatusCounts.Free],
        backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"],
      },
    ],
  };

  return (
    <div className="relative flex min-h-screen bg-light-blue-100">
      <aside className={`z-10 bg-white shadow-xl text-black h-screen flex flex-col justify-between transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
        <div>
          <div className="p-4 flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>Admin Panel</h2>
            <button onClick={() => setIsOpen(!isOpen)} className="text-black">{isOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
          </div>
          {isOpen && <div className="p-4 text-xs text-gray-400">{admin.email}</div>}
          <nav className="pl-3 mt-4">
            <ul>
              <li className="mb-2">
                <Link href="../adminDashboard" className="flex items-center p-2 rounded hover:bg-gray-700">
                  <FiGrid size={20} />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Dashboard</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        {isOpen && (
          <button onClick={handleLogout} className="flex items-center justify-center p-3 m-4 bg-red-600 rounded hover:bg-red-700">
            <FiLogOut size={20} />
            <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Logout</span>
          </button>
        )}
      </aside>
      <div className="relative flex-1 p-6">
        <h2 className="text-xl font-bold mb-4">Labs Overview</h2>
        <div className="flex flex-row space-x-4">
          <div className="w-64">
            <Doughnut data={chartData} />
          </div>
          <div className="w-64 h-48 overflow-y-auto bg-white shadow-lg p-4 rounded">
            <h3 className="font-bold mb-2">Reports</h3>
            {reports.map((report) => (
              <div key={report.id} className="mb-2 p-2 border-b">
                <p className="text-sm">{report.message}</p>
                <p className="text-xs text-gray-500">By: {report.submittedBy} | {report.date}</p>
              </div>
            ))}
          </div>
        </div>
        <input
          type="text"
          placeholder="Search Labs..."
          className="border p-2 w-full mb-4 mt-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <h2 className="text-xl font-bold mb-4">Labs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredLabs.map((lab) => (
            <div key={lab.id} className="bg-white shadow-lg p-4 rounded">
              <h3 className="font-bold text-lg">{lab.name}</h3>
              <p>{lab.location}</p>
              <p className="text-sm text-gray-600">Status: {lab.status}</p>
              <button onClick={() => openEditModal(lab)} className="mt-2 p-2 border rounded w-full">Edit</button>
            </div>
          ))}
        </div>
        {isModalOpen && selectedLab && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">Edit Lab</h2>
              <input className="border p-2 w-full mb-2" value={selectedLab.name} onChange={(e) => setSelectedLab({ ...selectedLab, name: e.target.value })} />
              <input className="border p-2 w-full mb-2" value={selectedLab.location} onChange={(e) => setSelectedLab({ ...selectedLab, location: e.target.value })} />
              <select className="border p-2 w-full mb-2" value={selectedLab.status} onChange={(e) => setSelectedLab({ ...selectedLab, status: e.target.value })}>
                <option value="Free">Free</option>
                <option value="Active">Active</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
              <button onClick={handleUpdateLab} className="bg-blue-500 text-white p-2 rounded">Save</button>
              <button onClick={() => setIsModalOpen(false)} className="ml-2 p-2">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}