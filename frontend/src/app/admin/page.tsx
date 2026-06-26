"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  name: string;
  seats: number;
  location: string;
  image: string;
  amenities: string[];
  status: "online" | "maintenance";
}

interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  time: string;
  title: string;
  booker: string;
  attendees: string[];
}

interface AuditLog {
  id: string;
  title: string;
  description: string;
  time: string;
  code: string;
  icon: string;
  iconColor: string;
}

export default function AdminPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Admin.01");
  const [currentView, setCurrentView] = useState<string>("dashboard"); // "dashboard" | "rooms" | "audit"

  // Unified reactive mock database state
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "olympus",
      name: "Alpha Boardroom",
      seats: 24,
      location: "Floor 4, North Wing",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0ol9PjeXi3Bj3rAKPRtdaOebaW7NNioctjsaVdX7XXDHcMPx_svn61gM1PJ1wPz0vjXKD-7D32w1RqCmMAgFgjllRLV_pvza_syZEMmDr8tWlPrugEnX9HPNiW0sdQVM_vBa721IlOrSEhBuukuN_P4KVfOALIBSmdY35kvwa5DKMRp-hGSkB1TIecPWpbFI4SEdbSXOcWqrXKF4EgJNlPenEWkuFyLvvAkKwMBL0odzWpyM_UmkdnlnJuk8zQmv6CZsY1JLg26Nm",
      amenities: ["video", "whiteboard", "projector"],
      status: "online"
    },
    {
      id: "titan",
      name: "Beta Lab",
      seats: 12,
      location: "Floor 4, East Wing",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmiAyfyc6MokYdRyOd9u11Ozjsl8e4bHGpUuQPTX_3whwNs35wgOOxpJcYxT2HK-tpwrVB3RFPMksfUlu0qsbpIfWCSKn3HdhIF_fdpvJFJxe_IDtNswB2BTRGN17IABhBtwyXPYiq4Z_ggChHTxjBWgiYble_1xZVpbd6SGWA4UFAQ5WiPjLKqrMJx4nJ6OKhIcz7OIFqJchasDT5113SaxI_sE4SrGRWRqe0SSje7iT3IiVFtlR8xs43rV5WtT-gYaFLOFSDgvx-",
      amenities: ["video", "tv"],
      status: "maintenance"
    },
    {
      id: "atlas",
      name: "Studio C",
      seats: 4,
      location: "Floor 5, South Wing",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFGHdHc3tTydeu1GdafZl4LlA9vHBRrBLuCCSi0jE8Y9Bg8eHgyAUcmjBzxoHCxDEKj8h2T2tue6xTpMGGIRqZyEOrizAXjJKS9g7Gn4TawU13VgqDH_HAcT1yZ2z2uodGRQMawisGkZMCFmJReN8Sh4ZIcfchLZdJ8nGQmTbWXYldxwYn3vHhP52YUP4yNbtVasfxb0RPueaB68oqfzgsPgi2mLCQWvi6Wubnwr3aAjZuocPyMj8_Plw9B1ij7I8lPQUM4SFaB7Mm",
      amenities: ["whiteboard"],
      status: "online"
    },
    {
      id: "helios",
      name: "Helios Suite",
      seats: 8,
      location: "Floor 2, West Wing",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
      amenities: ["video", "whiteboard", "tv"],
      status: "online"
    },
    {
      id: "prometheus",
      name: "Prometheus Hall",
      seats: 16,
      location: "Floor 3, East Wing",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop",
      amenities: ["video", "whiteboard", "projector", "tv"],
      status: "online"
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "BK-001",
      roomId: "olympus",
      roomName: "Alpha Boardroom",
      date: "23",
      time: "1:00 PM",
      title: "Sprint Planning",
      booker: "Rahul S.",
      attendees: ["Rahul S.", "Sarah J.", "Mike T."]
    },
    {
      id: "BK-002",
      roomId: "olympus",
      roomName: "Alpha Boardroom",
      date: "23",
      time: "1:30 PM",
      title: "Client Sync",
      booker: "Priya M.",
      attendees: ["Priya M.", "Alex R."]
    },
    {
      id: "BK-003",
      roomId: "titan",
      roomName: "Beta Lab",
      date: "23",
      time: "1:00 PM",
      title: "Design Review",
      booker: "Emily W.",
      attendees: ["Emily W.", "David L."]
    },
    {
      id: "BK-004",
      roomId: "titan",
      roomName: "Beta Lab",
      date: "23",
      time: "1:30 PM",
      title: "Design Review",
      booker: "Emily W.",
      attendees: ["Emily W.", "David L."]
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "LOG-001",
      title: "Beta Lab status changed",
      description: "Admin.01 set status to Maintenance",
      time: "10:42 AM",
      code: "ID-8492",
      icon: "build",
      iconColor: "text-secondary"
    },
    {
      id: "LOG-002",
      title: "New resource provisioned",
      description: "System auto-scaled 'Virtual Instance X1'",
      time: "09:15 AM",
      code: "SYS-AUTO",
      icon: "add",
      iconColor: "text-primary"
    },
    {
      id: "LOG-003",
      title: "Admin authenticated",
      description: "Session established from IP 192.168.1.45",
      time: "08:00 AM",
      code: "SEC-LOGIN",
      icon: "login",
      iconColor: "text-tertiary"
    }
  ]);

  // UI state for standard Booking panel
  const [selectedRoomId, setSelectedRoomId] = useState<string>("olympus");
  const [selectedDate, setSelectedDate] = useState<string>("23");
  const [selectedTime, setSelectedTime] = useState<string>("2:30 PM");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [capacityFilter, setCapacityFilter] = useState<string>("6-12");
  const [amenitiesFilter, setAmenitiesFilter] = useState<string[]>([]);
  const [attendees, setAttendees] = useState<string[]>(["Sarah J.", "Mike T."]);
  const [meetingTitle, setMeetingTitle] = useState<string>("Q3 Strategy Sync");
  const [attendeeInput, setAttendeeInput] = useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [locateQuery, setLocateQuery] = useState<string>("");
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editRoomName, setEditRoomName] = useState<string>("");
  const [editRoomSeats, setEditRoomSeats] = useState<number>(10);
  const [editRoomLocation, setEditRoomLocation] = useState<string>("");
  const [editRoomImage, setEditRoomImage] = useState<string>("");
  const [editRoomAmenities, setEditRoomAmenities] = useState<string[]>([]);

  // Add Room State
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState<boolean>(false);
  const [addRoomName, setAddRoomName] = useState<string>("");
  const [addRoomSeats, setAddRoomSeats] = useState<number>(10);
  const [addRoomLocation, setAddRoomLocation] = useState<string>("");
  const [addRoomImage, setAddRoomImage] = useState<string>("");
  const [addRoomAmenities, setAddRoomAmenities] = useState<string[]>([]);

  const getSlotDates = (dateStr: string, timeStr: string) => {
    const day = parseInt(dateStr);
    const year = 2026;
    const month = 5; // June is index 5
    
    const [time, ampm] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    
    const startTime = new Date(year, month, day, hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
    return { startTime, endTime };
  };

  const fetchData = async () => {
    try {
      const roomsRes = await fetch("/api/rooms");
      const roomsData = await roomsRes.json();
      if (roomsRes.ok && Array.isArray(roomsData)) {
        const mappedRooms = roomsData.map((dbR: any) => ({
          id: dbR.id.toString(),
          name: dbR.name,
          seats: dbR.capacity,
          location: dbR.location || `Room ${dbR.roomNumber}, Floor ${dbR.floorId}`,
          image: dbR.heroImageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
          amenities: dbR.amenities?.map((a: any) => a.name.toLowerCase()) || [],
          status: dbR.status.toLowerCase() === "available" ? ("online" as const) : ("maintenance" as const)
        }));
        setRooms(mappedRooms);
        if (mappedRooms.length > 0) {
          setSelectedRoomId(mappedRooms[0].id);
        }
      }

      const bookingsRes = await fetch("/api/bookings");
      const bookingsData = await bookingsRes.json();
      if (bookingsRes.ok && Array.isArray(bookingsData)) {
        const activeBookings = bookingsData.filter((b: any) => b.status !== 'Cancelled');
        const mappedBookings = activeBookings.map((dbB: any) => {
          const start = new Date(dbB.startTime);
          const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            id: dbB.id.toString(),
            roomId: dbB.roomId.toString(),
            roomName: dbB.room?.name || "Unknown Room",
            date: start.getDate().toString(),
            time: timeStr,
            title: dbB.title,
            booker: dbB.user?.name || "Unknown",
            attendees: dbB.attendees?.map((a: any) => a.email) || []
          };
        });
        setBookings(mappedBookings);
      }

      const logsRes = await fetch("/api/logs");
      const logsData = await logsRes.json();
      if (logsRes.ok && Array.isArray(logsData)) {
        setAuditLogs(logsData);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  const handleAddRoomSubmit = async () => {
    if (!addRoomName.trim() || !addRoomLocation.trim()) {
      alert("Please fill in the room designation and location.");
      return;
    }
    const generatedRoomNumber = `RM-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: addRoomName,
          roomNumber: generatedRoomNumber,
          capacity: addRoomSeats,
          floorId: 1, // default
          location: addRoomLocation,
          description: "Executive facility",
          status: "Available",
          heroImageUrl: addRoomImage.trim() || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
          amenities: addRoomAmenities,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      fetchData();
      
      // Reset state
      setAddRoomName("");
      setAddRoomSeats(10);
      setAddRoomLocation("");
      setAddRoomImage("");
      setAddRoomAmenities([]);
      setIsAddRoomModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    if (confirm(`Are you sure you want to delete room "${room.name}"? This action cannot be undone.`)) {
      try {
        const res = await fetch(`/api/rooms/${roomId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to delete room");
        }
        fetchData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Add system operation logs helper
  const addAuditLog = (title: string, description: string, code = "SYS-OP", icon = "info", iconColor = "text-primary") => {
    fetchData();
  };

  // Initialize and Toggle Theme & Session Guard
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");
    if (!storedRole || storedRole !== "admin") {
      router.push("/login");
    } else {
      setLoading(false);
      if (storedName) setUserName(storedName);
      fetchData();
    }

    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (storedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, [router]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  // Dynamic slot generation based on bookings and maintenance
  const getTimeSlotsForRoom = (roomId: string, date: string) => {
    const slots = ["1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"];
    return slots.map(time => {
      const room = rooms.find(r => r.id === roomId);
      if (room?.status === "maintenance") {
        return { time, status: "maintenance" as const, booker: "" };
      }
      const booking = bookings.find(b => b.roomId === roomId && b.date === date && b.time === time);
      if (booking) {
        return { time, status: "booked" as const, booker: booking.booker };
      }
      if (time === "3:30 PM" && roomId !== "titan") {
        return { time, status: "warning" as const, booker: "" };
      }
      return { time, status: "available" as const, booker: "" };
    });
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0] || { id: "0", name: "No Rooms", status: "maintenance" };
  const selectedRoomSlots = getTimeSlotsForRoom(selectedRoom.id, selectedDate);

  const isSlotAlreadyBooked = bookings.some(
    b => b.roomId === selectedRoom.id && b.date === selectedDate && b.time === selectedTime
  );
  const isSelectedRoomMaintenance = selectedRoom.status === "maintenance";

  // Booking confirm handler with Admin Preemption override logic
  const handleConfirmBooking = async () => {
    const isBooked = bookings.some(
      b => b.roomId === selectedRoom.id && b.date === selectedDate && b.time === selectedTime
    );

    const { startTime, endTime } = getSlotDates(selectedDate, selectedTime);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          title: meetingTitle || (isBooked ? "Admin Override Session" : "Project Sync"),
          agenda: "Admin override booking",
          attendees: attendees,
          preempt: isBooked, // Override booking if conflict exists!
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm booking");
      }

      setIsSuccessModalOpen(true);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (confirm(`Cancel reservation for ${booking.roomName} at ${booking.time}?`)) {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to cancel booking");
        }
        fetchData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleToggleMaintenance = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const nextStatus = room.status === "online" ? "Maintenance" : "Available";

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle status");
      }
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCapacity = true;
    if (capacityFilter === "2-5") {
      matchesCapacity = room.seats >= 2 && room.seats <= 5;
    } else if (capacityFilter === "6-12") {
      matchesCapacity = room.seats >= 6 && room.seats <= 12;
    } else if (capacityFilter === "12+") {
      matchesCapacity = room.seats > 12;
    }

    const matchesAmenities = amenitiesFilter.every(amenity => room.amenities.includes(amenity));

    return matchesSearch && matchesCapacity && matchesAmenities;
  });

  const filteredRoomsMatrix = rooms.filter(r =>
    r.name.toLowerCase().includes(locateQuery.toLowerCase()) ||
    r.location.toLowerCase().includes(locateQuery.toLowerCase())
  );

  const getDateName = (dateVal: string) => {
    switch (dateVal) {
      case "22": return "Mon, Jun 22";
      case "23": return "Tue, Jun 23";
      case "24": return "Wed, Jun 24";
      case "25": return "Thu, Jun 25";
      case "26": return "Fri, Jun 26";
      default: return `Tue, Jun ${dateVal}`;
    }
  };

  const getEndTime = (timeStr: string) => {
    if (!timeStr) return "3:00 PM";
    const parts = timeStr.split(" ");
    const timeVal = parts[0];
    const ampm = parts[1];
    const timeParts = timeVal.split(":");
    let hour = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]);
    
    minutes += 30;
    if (minutes >= 60) {
      minutes = 0;
      hour += 1;
      if (hour > 12) hour = 1;
    }
    
    return `${hour}:${minutes === 0 ? '00' : minutes} ${ampm}`;
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleAddAttendee = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = attendeeInput.trim();
      if (val && !attendees.includes(val)) {
        setAttendees([...attendees, val]);
        setAttendeeInput("");
      }
    }
  };

  const handleRemoveAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const handleToggleAmenity = (amenity: string) => {
    if (amenitiesFilter.includes(amenity)) {
      setAmenitiesFilter(amenitiesFilter.filter(a => a !== amenity));
    } else {
      setAmenitiesFilter([...amenitiesFilter, amenity]);
    }
  };

  const onlineRoomsCount = rooms.filter(r => r.status === "online").length;
  const maintenanceRoomsCount = rooms.filter(r => r.status === "maintenance").length;
  const globalOccupancyPercentage = Math.round((bookings.length / (rooms.length * 8)) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center font-bold text-lg">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
          <span>Redirecting to login...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-background text-on-surface">
      {/* Ambient Background Lighting */}
      <div className="ambient-glow-indigo"></div>
      <div className="ambient-glow-violet"></div>

      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low/40 backdrop-blur-xl border-r border-outline-variant/20 shadow-2xl p-gutter z-50">
        <div className="mb-6 pt-4 px-2">
          <h1 className="font-title-md text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">
            Lumina
          </h1>
          <span className="text-[10px] text-outline uppercase tracking-widest font-semibold block mt-1">
            System Admin Suite
          </span>
        </div>
        
        {/* Navigation Tabs */}
        <ul className="flex flex-col gap-stack-sm flex-1 mt-4">
          <li>
            <button 
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-label-md text-label-md group hover:scale-105 active:scale-95 ${
                currentView === "dashboard" 
                  ? 'text-primary font-bold bg-primary/10 shadow-[inset_0_0_10px_rgba(128,131,255,0.1)] border border-primary/20' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={currentView === "dashboard" ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
              Telemetry
            </button>
          </li>

          <li>
            <button 
              onClick={() => setCurrentView("rooms")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-label-md text-label-md group hover:scale-105 active:scale-95 ${
                currentView === "rooms" 
                  ? 'text-primary font-bold bg-primary/10 shadow-[inset_0_0_10px_rgba(128,131,255,0.1)] border border-primary/20' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={currentView === "rooms" ? { fontVariationSettings: "'FILL' 1" } : {}}>meeting_room</span>
              Book Room (Ovr)
            </button>
          </li>

          <li>
            <button 
              onClick={() => setCurrentView("audit")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-label-md text-label-md group hover:scale-105 active:scale-95 ${
                currentView === "audit" 
                  ? 'text-primary font-bold bg-primary/10 shadow-[inset_0_0_10px_rgba(128,131,255,0.1)] border border-primary/20' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={currentView === "audit" ? { fontVariationSettings: "'FILL' 1" } : {}}>history</span>
              Audit Trail
            </button>
          </li>
        </ul>

        {/* User Profile Card */}
        <div className="mt-auto pt-4 border-t border-outline-variant/20 px-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              alt="User profile photo" 
              className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnVJTXswVsQMnFZD5tboq9kccdPTM8n6rfrYc-y--H8jSR2OkiDDJfDqSprDH2fLxcGOb6ZvanDwmonHIfakUxdVjZ2kR0yR_6ejModzla6fQncsi2N71lOqZlVW5APwL5RgI9WEDK4Wac_ocm51h404B8rJowzI-PlxIMhxr_XBnKLkvWR2C4SwGEz6rmTysomrLm7WJeKBCPdzl_hxuBgV8qyfJVg_TSdT8vqHrVWAb1UIK27zCmaT3r5D7Pn2-aufRP16gyZWWT"
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate max-w-[100px]">
                {userName}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px] truncate">
                SysOps Admin
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors flex items-center justify-center"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="ml-0 md:ml-64 flex flex-col flex-1 h-screen">
        {/* TopNavBar */}
        <header className="hidden md:flex fixed top-0 right-0 left-64 h-20 bg-surface/60 backdrop-blur-md border-b border-outline-variant/10 shadow-sm z-40 px-stack-lg justify-between items-center transition-all duration-300">
          <div className="flex items-center font-title-md text-title-md text-on-surface font-semibold">
            Lumina Control Center
          </div>
          <div className="flex items-center gap-6">
            {/* Context Search Bar */}
            {currentView === "rooms" && (
              <div className="relative w-64 group focus-within:ring-2 focus-within:ring-primary/50 rounded-full transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2 border border-outline-variant/30 rounded-full leading-5 bg-surface-container-high/50 text-on-surface placeholder-outline focus:outline-none focus:bg-surface-container-highest focus:border-primary sm:text-sm transition-all duration-300 shadow-inner" 
                  placeholder="Search rooms..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            
            {/* Trailing Icons */}
            <div className="flex items-center gap-2 text-on-surface-variant">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-surface-container-highest hover:text-primary transition-colors" 
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
              </button>
              <button className="p-2 rounded-full hover:bg-surface-container-highest hover:text-primary transition-colors relative group">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
              </button>
              <div className="w-px h-6 bg-white/20"></div>
              <span className="font-label-sm text-xs font-semibold text-outline tracking-wider bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/20 uppercase">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="flex-1 mt-0 md:mt-20 overflow-y-auto">
          
          {/* VIEW: TELEMETRY DASHBOARD */}
          {currentView === "dashboard" && (
            <main className="p-stack-lg flex flex-col gap-6 max-w-[1440px] mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                  <h1 className="font-headline-lg text-3xl font-bold text-on-surface tracking-tight flex items-center gap-3">
                    System Telemetry
                    <span className="inline-flex h-3 w-3 rounded-full bg-tertiary dot-available animate-pulse"></span>
                  </h1>
                  <p className="font-body-md text-on-surface-variant mt-1">Real-time overview of workspace utilization, environmental controls, and administrative actions.</p>
                </div>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                <div className="md:col-span-3 glass-panel rounded-xl p-6 flex flex-col justify-between group hover:-translate-y-0.5 transition-transform duration-300">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary border border-primary/20">
                      <span className="material-symbols-outlined">donut_large</span>
                    </div>
                    <span className="font-label-sm text-[12px] text-tertiary bg-tertiary/10 px-2 py-1 rounded border border-tertiary/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span> +4.2%
                    </span>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1">Global Occupancy</h3>
                    <div className="font-display-xl text-4xl font-bold text-on-surface tracking-tighter">
                      {globalOccupancyPercentage > 0 ? `${globalOccupancyPercentage}%` : "12%"}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-6 glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
                  <div className="flex justify-between items-center mb-6 z-10">
                    <h3 className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                      Utilization Velocity
                    </h3>
                    <div className="flex gap-2">
                      <span className="w-2 h-8 bg-surface-container-high rounded-full overflow-hidden flex flex-col justify-end"><span className="w-full h-[40%] bg-outline-variant"></span></span>
                      <span className="w-2 h-8 bg-surface-container-high rounded-full overflow-hidden flex flex-col justify-end"><span className="w-full h-[60%] bg-primary/50"></span></span>
                      <span className="w-2 h-8 bg-surface-container-high rounded-full overflow-hidden flex flex-col justify-end"><span className="w-full h-[90%] bg-primary"></span></span>
                      <span className="w-2 h-8 bg-surface-container-high rounded-full overflow-hidden flex flex-col justify-end"><span className="w-full h-[30%] bg-outline-variant"></span></span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-end gap-2 z-10 h-28">
                    <div className="flex-1 bg-gradient-to-t from-primary/10 to-transparent h-[20%] rounded-t-sm border-t border-primary/20"></div>
                    <div className="flex-1 bg-gradient-to-t from-primary/20 to-transparent h-[40%] rounded-t-sm border-t border-primary/30"></div>
                    <div className="flex-1 bg-gradient-to-t from-primary/40 to-transparent h-[55%] rounded-t-sm border-t border-primary/40 relative transition-all duration-500"></div>
                    <div className="flex-1 bg-gradient-to-t from-secondary/60 to-transparent h-[85%] rounded-t-sm border-t border-secondary relative transition-all duration-500">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-high px-2 py-1 rounded text-[10px] font-bold text-secondary whitespace-nowrap border border-secondary/30 shadow-lg">Peak: 14:00</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-primary/50 to-transparent h-[70%] rounded-t-sm border-t border-primary/50 relative transition-all duration-500"></div>
                    <div className="flex-1 bg-gradient-to-t from-primary/30 to-transparent h-[50%] rounded-t-sm border-t border-primary/30"></div>
                    <div className="flex-1 bg-gradient-to-t from-primary/10 to-transparent h-[30%] rounded-t-sm border-t border-primary/20"></div>
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0"></div>
                </div>

                <div className="md:col-span-3 glass-panel rounded-xl p-6 flex flex-col justify-between group hover:-translate-y-0.5 transition-transform duration-300 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-secondary/15 blur-[40px] rounded-full pointer-events-none"></div>
                  <div className="flex justify-between items-start z-10">
                    <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/20">
                      <span className="material-symbols-outlined">health_and_safety</span>
                    </div>
                  </div>
                  <div className="mt-6 z-10">
                    <h3 className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1">System Integrity</h3>
                    <div className="font-headline-lg text-2xl font-bold text-secondary">Optimal</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary dot-available"></span>
                      <span className="text-[11px] text-on-surface-variant">{onlineRoomsCount} Rooms Online · {maintenanceRoomsCount} Maint</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-2">
                <div className="lg:col-span-8 glass-panel rounded-xl flex flex-col overflow-hidden min-h-[400px]">
                  <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">meeting_room</span>
                      <h2 className="font-headline-md text-lg font-semibold">Resource Matrix</h2>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto items-center">
                      <button 
                        onClick={() => setIsAddRoomModalOpen(true)}
                        className="px-4 py-2 btn-gradient-primary text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:shadow-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span> Add Room
                      </button>
                      <div className="relative flex-1 sm:w-64 rounded-lg">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input 
                          value={locateQuery}
                          onChange={(e) => setLocateQuery(e.target.value)}
                          className="w-full bg-surface-container-high/50 border border-white/10 text-on-surface text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none placeholder:text-on-surface-variant/50 backdrop-blur-md" 
                          placeholder="Locate resource..." 
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                          <th className="p-4 font-semibold w-12">#</th>
                          <th className="p-4 font-semibold">Designation</th>
                          <th className="p-4 font-semibold">Capacity</th>
                          <th className="p-4 font-semibold">Status</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-sm divide-y divide-white/5">
                        {filteredRoomsMatrix.map((room, index) => {
                          const isMaint = room.status === "maintenance";
                          return (
                            <tr key={room.id} className={`hover:bg-white/[0.02] transition-colors group ${isMaint ? 'bg-surface-container-high/20 opacity-85' : ''}`}>
                              <td className="p-4 text-on-surface-variant font-mono">0{index + 1}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center border border-white/10">
                                    <span className={`material-symbols-outlined text-[16px] ${isMaint ? 'text-secondary' : 'text-primary'}`}>
                                      {room.seats > 15 ? 'chair_alt' : room.seats > 6 ? 'computer' : 'podcasts'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium block text-on-surface">{room.name}</span>
                                    <span className="text-[11px] text-outline font-normal block">{room.location}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-on-surface-variant font-semibold">{room.seats} pax</td>
                              <td className="p-4">
                                {isMaint ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(208,188,255,0.8)]"></span> Maint
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/10 border border-tertiary/20 text-tertiary text-xs font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary dot-available"></span> Online
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditingRoom(room);
                                      setEditRoomName(room.name);
                                      setEditRoomSeats(room.seats);
                                      setEditRoomLocation(room.location || "");
                                      setEditRoomImage(room.image || "");
                                      setEditRoomAmenities(room.amenities || []);
                                      setIsEditRoomModalOpen(true);
                                    }}
                                    className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-white/5"
                                    title="Edit Room"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleToggleMaintenance(room.id)}
                                    className={`p-1.5 rounded transition-colors ${
                                      isMaint 
                                        ? "text-secondary bg-secondary/10 hover:bg-secondary/20" 
                                        : "text-on-surface-variant hover:text-secondary hover:bg-white/5"
                                    }`}
                                    title={isMaint ? "Clear Maintenance" : "Set Maintenance"}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">build</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteRoom(room.id)}
                                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors rounded hover:bg-white/5"
                                    title="Delete Room"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-4 glass-panel rounded-xl flex flex-col overflow-hidden min-h-[400px]">
                  <div className="p-5 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                    <h2 className="font-headline-md text-lg font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline">history</span>
                      Audit Log
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px]">
                    {auditLogs.map((log, index) => (
                      <div key={log.id} className="flex gap-4 relative">
                        {index < auditLogs.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-[-20px] w-px bg-white/10"></div>
                        )}
                        <div className="w-6 h-6 rounded-full bg-surface-container-high border border-white/20 flex items-center justify-center shrink-0 z-10 mt-0.5">
                          <span className={`material-symbols-outlined text-[12px] ${log.iconColor}`}>{log.icon}</span>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-on-surface">{log.title}</div>
                          <div className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{log.description}</div>
                          <div className="text-[9px] text-outline mt-1 font-mono">{log.time} · {log.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/10 text-center">
                    <button 
                      onClick={() => setCurrentView("audit")}
                      className="text-xs font-semibold text-primary hover:text-primary-fixed transition-colors uppercase tracking-widest"
                    >
                      View Full Log
                    </button>
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* VIEW: AUDIT LOGS */}
          {currentView === "audit" && (
            <main className="p-stack-lg max-w-[1440px] mx-auto w-full">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h1 className="font-headline-lg text-3xl font-bold text-on-surface">System Audit Trail</h1>
                  <p className="font-body-md text-on-surface-variant mt-1">Sequential records of administrative actions, room booking pre-emptions, and hardware maintenance controls.</p>
                </div>
                <button 
                  onClick={() => setCurrentView("dashboard")}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-sm rounded-lg border border-white/10 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Telemetry
                </button>
              </div>

              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-lg border border-white/5 text-xs text-outline font-semibold uppercase tracking-wider">
                  <span>Log Details</span>
                  <button 
                    onClick={() => {
                      if (confirm("Clear the audit logs history?")) {
                        setAuditLogs([{
                          id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                          title: "Logs Cleared",
                          description: "Admin cleared system audit logs history",
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          code: "ADM-CLR",
                          icon: "delete_sweep",
                          iconColor: "text-error"
                        }]);
                      }
                    }}
                    className="text-error hover:underline flex items-center gap-1 capitalize"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span> Clear Logs
                  </button>
                </div>

                <div className="divide-y divide-white/5">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-4 flex gap-4 items-start hover:bg-white/[0.01] px-2 rounded transition-colors">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center shrink-0">
                        <span className={`material-symbols-outlined text-[16px] ${log.iconColor}`}>{log.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-on-surface">{log.title}</h4>
                          <span className="text-[10px] text-outline font-mono bg-surface-container px-2 py-0.5 rounded">{log.code}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">{log.description}</p>
                        <span className="text-[10px] text-outline font-mono block mt-2">{log.time} · System ID: {log.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          )}

          {/* VIEW: BOOKING EXPLORER (WITH ADMIN PRIORITY OVERRIDES) */}
          {currentView === "rooms" && (
            <main className="flex-1 overflow-hidden flex flex-col p-stack-lg gap-stack-lg h-full">
              <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center gap-4 justify-between shrink-0 shadow-lg">
                <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                  <div className="relative w-full max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input 
                      className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-lg py-2 pl-10 pr-4 text-on-surface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary shadow-inner transition-all font-body-md text-sm" 
                      placeholder="Find a specific room or location..." 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                  <div className="flex items-center gap-2 border-r border-outline-variant/30 pr-3">
                    <span className="font-label-sm text-xs text-outline uppercase tracking-wider">Capacity</span>
                    <button onClick={() => setCapacityFilter("2-5")} className={`px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap ${capacityFilter === "2-5" ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}>2-5</button>
                    <button onClick={() => setCapacityFilter("6-12")} className={`px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap ${capacityFilter === "6-12" ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}>6-12</button>
                    <button onClick={() => setCapacityFilter("12+")} className={`px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap ${capacityFilter === "12+" ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}>12+</button>
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <span className="font-label-sm text-xs text-outline uppercase tracking-wider mr-1">Amenities</span>
                    <button onClick={() => handleToggleAmenity("video")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap group ${amenitiesFilter.includes("video") ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:text-primary'}`}><span className="material-symbols-outlined text-[16px] group-hover:text-primary">videocam</span> Video Conf</button>
                    <button onClick={() => handleToggleAmenity("whiteboard")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap group ${amenitiesFilter.includes("whiteboard") ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:text-primary'}`}><span className="material-symbols-outlined text-[16px] group-hover:text-primary">desktop_windows</span> Whiteboard</button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-gutter h-full overflow-hidden">
                <section className="lg:w-[60%] flex flex-col h-full bg-surface-container-lowest/30 rounded-2xl border border-outline-variant/10 overflow-hidden shadow-inner">
                  <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/20 shrink-0">
                    <h2 className="font-title-md text-base text-on-surface flex items-center gap-2 font-semibold">
                      <span className="material-symbols-outlined text-primary">view_cozy</span> Room Explorer (Admin Mode)
                    </h2>
                    <span className="font-label-sm text-xs text-outline bg-surface-container py-1 px-3 rounded-full border border-outline-variant/20 font-semibold">
                      {filteredRooms.length} Rooms Available
                    </span>
                  </div>
                  <div className="p-5 overflow-y-auto h-full flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredRooms.map((room) => {
                        const isSelected = room.id === selectedRoomId;
                        const isMaint = room.status === "maintenance";
                        return (
                          <div 
                            key={room.id}
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`glass-panel rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 relative group flex flex-col ${
                              isMaint ? 'border-red-500/20 bg-red-950/5 opacity-80' : isSelected ? 'card-active-glow border-primary' : 'border-outline-variant/30'
                            }`}
                          >
                            <div className="relative w-full aspect-video">
                              <div className={`bg-cover bg-center w-full h-full ${isMaint ? 'grayscale' : ''}`} style={{ backgroundImage: `url('${room.image}')` }}></div>
                              <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-outline-variant/30 shadow-lg">
                                <div className={`w-2 h-2 rounded-full ${isMaint ? 'bg-secondary animate-pulse' : 'bg-tertiary dot-available'}`}></div>
                                <span className={`font-label-sm text-[11px] ${isMaint ? 'text-secondary' : 'text-tertiary'} font-semibold`}>
                                  {isMaint ? "Maintenance" : "Available Now"}
                                </span>
                              </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-title-md text-base ${isSelected ? 'text-primary font-bold' : 'text-on-surface font-semibold'}`}>{room.name}</h3>
                                <span className="font-label-sm text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/20 flex items-center gap-1 font-semibold">
                                  <span className="material-symbols-outlined text-[14px]">group</span> {room.seats} Seats
                                </span>
                              </div>
                              <p className="font-body-md text-xs text-outline mb-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">location_on</span> {room.location}
                              </p>
                              <div className="mt-auto pt-3 border-t border-outline-variant/20 flex gap-2">
                                {room.amenities.map((amenity) => {
                                  let icon = 'videocam';
                                  if (amenity === 'whiteboard') icon = 'desktop_windows';
                                  if (amenity === 'projector') icon = 'cast';
                                  if (amenity === 'tv') icon = 'tv';
                                  return (
                                    <div key={amenity} className="p-1.5 rounded bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors">
                                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <aside className="lg:w-[40%] flex flex-col h-full bg-surface-container-low/40 backdrop-blur-xl rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden relative">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
                  <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6 hide-scrollbar relative">
                    <div>
                      <h2 className="font-headline-lg text-2xl text-on-surface font-bold tracking-tight">Book {selectedRoom.name}</h2>
                      <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[18px]">event</span> Admin Priority Override Panel
                      </p>
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2 -mx-2 px-2">
                        {["22", "23", "24", "25", "26"].map((d) => {
                          const isActive = selectedDate === d;
                          return (
                            <button 
                              key={d}
                              onClick={() => setSelectedDate(d)}
                              className={isActive 
                                ? "flex flex-col items-center justify-center min-w-[72px] py-3.5 px-2 rounded-xl bg-gradient-to-b from-primary-container/20 to-primary/10 border-2 border-primary text-primary shadow-lg transform scale-105 transition-all relative font-bold"
                                : "flex flex-col items-center justify-center min-w-[64px] py-3 px-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200"
                              }
                            >
                              <span className="font-title-md text-sm font-bold">{d}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="bg-surface-container-lowest/50 rounded-xl border border-outline-variant/20 p-4 shadow-inner">
                        <h4 className="font-label-md text-xs text-outline mb-3 flex items-center gap-2 font-semibold">
                          <span className="material-symbols-outlined text-[16px]">light_mode</span> Select Time Slot
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedRoomSlots.map((slot) => {
                            const isMaintenance = slot.status === "maintenance";
                            const isBooked = slot.status === "booked";
                            
                            if (isMaintenance) {
                              return (
                                <button 
                                  key={slot.time}
                                  disabled
                                  className="py-2.5 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 font-label-md text-xs opacity-50 cursor-not-allowed"
                                >
                                  <span>Maint</span>
                                </button>
                              );
                            }

                            if (isBooked) {
                              const isSelected = selectedTime === slot.time;
                              return (
                                <button 
                                  key={slot.time}
                                  onClick={() => setSelectedTime(slot.time)}
                                  className={`py-2.5 rounded-lg border relative group font-label-md text-xs transition-all font-semibold ${
                                    isSelected 
                                      ? "bg-gradient-to-r from-red-600 to-red-800 text-white border-red-500 scale-105 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                                      : "border-red-500/30 bg-red-950/10 text-red-400 hover:bg-red-950/20"
                                  }`}
                                  title={`Booked by ${slot.booker}. Click to override.`}
                                >
                                  {slot.time}
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-background"></span>
                                </button>
                              );
                            }
                            
                            const isSelected = selectedTime === slot.time;
                            let btnClass = "py-2.5 rounded-lg border border-tertiary/30 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 transition-colors font-label-md text-xs font-semibold";
                            if (isSelected) {
                              btnClass = "py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white font-label-md text-xs shadow-lg border border-primary font-bold scale-105 transform transition-transform";
                            }
                            return (
                              <button key={slot.time} onClick={() => setSelectedTime(slot.time)} className={btnClass}>
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-surface-container-low px-1 font-label-sm text-[10px] text-primary z-10 font-semibold">Meeting Title</label>
                        <input className="w-full bg-surface-container-highest/30 border border-primary/50 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-inner font-body-md text-sm transition-shadow" type="text" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)}/>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-t border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-md mt-auto shrink-0 z-10">
                    <div className="flex justify-between items-center mb-4 text-xs">
                      <span className="text-outline font-label-sm font-semibold">{selectedRoom.name} Room</span>
                      <span className="text-on-surface font-label-md font-semibold">{getDateName(selectedDate)} • {selectedTime}</span>
                    </div>
                    
                    <button 
                      onClick={handleConfirmBooking}
                      className={`w-full py-4 rounded-xl text-white font-title-md text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                        isSlotAlreadyBooked 
                          ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-red-500/20" 
                          : "btn-gradient-primary"
                      }`}
                    >
                      {isSlotAlreadyBooked ? "Preempt Booking (Admin Priority)" : "Confirm Booking"}
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                </aside>
              </div>
            </main>
          )}

        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSuccessModalOpen(false)}></div>
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 shadow-2xl relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary mb-4">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="font-headline-lg text-xl font-bold text-on-surface mb-2">Booking Confirmed!</h3>
            <p className="font-body-md text-xs text-on-surface-variant mb-6 font-semibold">
              Reservation logged with Admin Priority override.
            </p>
            <div className="w-full bg-surface-container-low/50 border border-outline-variant/20 rounded-xl p-4 mb-6 text-left text-xs flex flex-col gap-2">
              <div className="flex justify-between"><span className="text-outline">Room:</span><span className="font-bold text-on-surface">{selectedRoom.name}</span></div>
              <div className="flex justify-between"><span className="text-outline">Date & Time:</span><span className="text-on-surface">{getDateName(selectedDate)} • {selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-outline">Reserved By:</span><span className="text-on-surface font-semibold">Admin.01 (SysOps)</span></div>
            </div>
            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full py-3 rounded-xl btn-gradient-primary text-white font-title-md text-sm font-bold shadow-lg">Done</button>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {isEditRoomModalOpen && editingRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsEditRoomModalOpen(false)}></div>
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 shadow-2xl relative z-10 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <h3 className="font-headline-lg text-lg font-bold text-on-surface">Edit Room Details</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-outline">Room Designation</label>
                <input type="text" value={editRoomName} onChange={(e) => setEditRoomName(e.target.value)} className="w-full mt-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline">Capacity (Pax)</label>
                <input type="number" value={editRoomSeats} onChange={(e) => setEditRoomSeats(parseInt(e.target.value) || 1)} className="w-full mt-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline">Location</label>
                <input type="text" value={editRoomLocation} onChange={(e) => setEditRoomLocation(e.target.value)} className="w-full mt-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline">Image URL</label>
                <input type="text" value={editRoomImage} onChange={(e) => setEditRoomImage(e.target.value)} className="w-full mt-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline">Amenities</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {["video", "whiteboard", "projector", "tv"].map(amenity => {
                    const isSelected = editRoomAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setEditRoomAmenities(editRoomAmenities.filter(a => a !== amenity));
                          } else {
                            setEditRoomAmenities([...editRoomAmenities, amenity]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                          isSelected 
                            ? "bg-primary/20 border-primary text-primary" 
                            : "border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                        }`}
                      >
                        {amenity === "video" && "Video Conf"}
                        {amenity === "whiteboard" && "Whiteboard"}
                        {amenity === "projector" && "Projector"}
                        {amenity === "tv" && "TV"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setIsEditRoomModalOpen(false)} className="px-4 py-2 bg-transparent text-on-surface hover:bg-surface-container rounded-lg border border-outline-variant/30 text-sm font-semibold transition-colors">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/rooms/${editingRoom.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name: editRoomName,
                        capacity: editRoomSeats,
                        location: editRoomLocation,
                        heroImageUrl: editRoomImage.trim() || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
                        amenities: editRoomAmenities
                      }),
                    });

                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || "Failed to update room");
                    }

                    fetchData();
                    setIsEditRoomModalOpen(false);
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="px-4 py-2 btn-gradient-primary text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsAddRoomModalOpen(false)}></div>
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 shadow-2xl relative z-10 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <h3 className="font-headline-lg text-lg font-bold text-on-surface">Add New Room</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-outline">Room Designation</label>
                <input type="text" value={addRoomName} onChange={(e) => setAddRoomName(e.target.value)} className="w-full mt-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" placeholder="e.g. Gamma Meeting Room" />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline">Capacity (Pax)</label>
                <input type="number" value={addRoomSeats} onChange={(e) => setAddRoomSeats(parseInt(e.target.value) || 1)} className="w-full mt-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline">Location</label>
                <input type="text" value={addRoomLocation} onChange={(e) => setAddRoomLocation(e.target.value)} className="w-full mt-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" placeholder="e.g. Floor 3, West Wing" />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline">Image URL</label>
                <input type="text" value={addRoomImage} onChange={(e) => setAddRoomImage(e.target.value)} className="w-full mt-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" placeholder="Optional URL" />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline">Amenities</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {["video", "whiteboard", "projector", "tv"].map(amenity => {
                    const isSelected = addRoomAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setAddRoomAmenities(addRoomAmenities.filter(a => a !== amenity));
                          } else {
                            setAddRoomAmenities([...addRoomAmenities, amenity]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                          isSelected 
                            ? "bg-primary/20 border-primary text-primary" 
                            : "border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                        }`}
                      >
                        {amenity === "video" && "Video Conf"}
                        {amenity === "whiteboard" && "Whiteboard"}
                        {amenity === "projector" && "Projector"}
                        {amenity === "tv" && "TV"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setIsAddRoomModalOpen(false)} className="px-4 py-2 bg-transparent text-on-surface hover:bg-surface-container rounded-lg border border-outline-variant/30 text-sm font-semibold transition-colors">Cancel</button>
              <button
                onClick={handleAddRoomSubmit}
                className="px-4 py-2 btn-gradient-primary text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                Add Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
