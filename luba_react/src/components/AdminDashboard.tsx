"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGrid, FiUsers, FiLogOut, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Lab {
  lab_id: string;
  lab_name: string;
  location: string;
  capacity: number;
  equipment: { name: string; quantity: number }[];
  availability: { [key: string]: { start: string; end: string }[] }; // Date-wise time slots
  description?: string;
}

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLabs = async () => {
      const { data, error } = await supabase.from("labs").select("*");
  
      if (error) {
          console.error("Error fetching labs:", error.message);
          return;
      }
  
      if (!data || data.length === 0) {
          console.warn("No labs found in the database.");
      } else {
          console.log("Fetched Labs:", data); // Debugging
      }
  
      // Convert JSON string to object
      const formattedLabs = data.map((lab) => ({
        ...lab,
        availability: lab.availability || {}, // ✅ No parsing needed, use as is
      }));
    
  
      setLabs(formattedLabs);
  };
  

    fetchLabs();
  }, []);

  const handleDateChange = (value: Date | Date[] | null) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };
  

  const openLabDetails = (lab: Lab) => {
    setSelectedLab(lab);
  };

  // Format selected date to match JSON keys (YYYY-MM-DD)
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return (
    <div className="relative flex min-h-screen bg-light-blue-400">
      {/* Sidebar */}
      <aside className={`z-10 bg-white shadow-xl text-black h-screen flex flex-col justify-between transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
        <div>
          <div className="p-4 flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>Admin Panel</h2>
            <button onClick={() => setIsOpen(!isOpen)} className="text-black">{isOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
          </div>
          {isOpen && <div className="p-4 text-xs text-gray-400">{admin?.email}</div>}
          <nav className="pl-3 mt-4">
            <ul>
              <li className="mb-2">
                <Link href="../adminDashboard" className="flex items-center p-2 rounded hover:bg-gray-700">
                  <FiGrid size={20} />
                  <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="../staffManagement" className="flex items-center p-2 rounded hover:bg-gray-700">
                  <FiUsers size={20} />
                  <span className={`ml-2 transition-all ${isOpen ? "block" : "hidden"}`}>Staff Management</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        {isOpen && (
          <button className="flex items-center justify-center p-3 m-4 bg-red-600 rounded hover:bg-red-700">
            <FiLogOut size={20} />
            <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Logout</span>
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="relative flex-1 p-6">
        <h2 className="text-xl font-bold mb-4">Labs Overview</h2>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => (
            <div key={lab.lab_id} className="bg-white shadow-lg p-4 rounded cursor-pointer" onClick={() => openLabDetails(lab)}>
              <h3 className="font-bold text-lg">{lab.lab_name}</h3>
              <p>{lab.location}</p>
              <p className="text-sm text-gray-600">Capacity: {lab.capacity}</p>
              <p className="text-sm text-gray-600">{lab.description || "No description"}</p>
            </div>
          ))}
        </div>

        {/* Lab Details Modal */}
        {selectedLab && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-[500px]">
              <h2 className="text-lg font-bold mb-2">{selectedLab.lab_name}</h2>
              <p className="text-sm text-gray-600">{selectedLab.description}</p>
              <p className="text-sm text-gray-600">Capacity: {selectedLab.capacity}</p>
              <p className="text-sm text-gray-600">Location: {selectedLab.location}</p>

              {/* Equipment List */}
              <h3 className="font-bold mt-4">Equipment</h3>
              <ul className="text-sm">
                {selectedLab.equipment.map((item, index) => (
                  <li key={index}>- {item.name} ({item.quantity})</li>
                ))}
              </ul>

              {/* Lab Calendar */}
              <h3 className="font-bold mt-4">Lab Availability</h3>
              <Calendar onChange={handleDateChange} value={selectedDate} />


              {/* Display Time Slots for Selected Date */}
              <div className="mt-2">
                <h4 className="text-sm font-bold">Available Slots:</h4>
                {selectedLab.availability[formatDate(selectedDate)] ? (
                  selectedLab.availability[formatDate(selectedDate)].map((slot, index) => (
                    <p key={index} className="text-sm text-gray-600">{slot.start} - {slot.end}</p>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No available slots</p>
                )}
              </div>

              <button className="mt-4 bg-blue-500 text-white p-2 rounded" onClick={() => setSelectedLab(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
      {/* test */}
    </div>
  );
}
