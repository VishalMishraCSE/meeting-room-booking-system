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

interface PendingApproval {
  id: string;
  roomName: string;
  roomId: string;
  requestedBy: string;
  role: string;
  dateText: string;
  dateVal: string;
  timeText: string;
  timeVal: string;
  attendeesCount: number;
  details: string;
  priority: "VIP" | "Standard" | "Training";
}

export default function ManagerPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Sarah Jenkins");
  const [currentView, setCurrentView] = useState<string>("bookings"); // "bookings" | "rooms"

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

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    {
      id: "REQ-001",
      roomName: "Alpha Boardroom",
      roomId: "olympus",
      requestedBy: "Sarah Jenkins (VP Operations)",
      role: "VP Operations",
      dateText: "Tomorrow",
      dateVal: "24",
      timeText: "09:00 - 14:00",
      timeVal: "1:00 PM",
      attendeesCount: 12,
      details: "Full Catering Needed",
      priority: "VIP"
    },
    {
      id: "REQ-002",
      roomName: "Beta Lab",
      roomId: "titan",
      requestedBy: "Design Team",
      role: "Product Design",
      dateText: "Jun 24",
      dateVal: "24",
      timeText: "14:00 - 16:00",
      timeVal: "2:00 PM",
      attendeesCount: 4,
      details: "AV & Screen Setup Required",
      priority: "Standard"
    },
    {
      id: "REQ-003",
      roomName: "Studio C",
      roomId: "atlas",
      requestedBy: "HR Dept",
      role: "Human Resources",
      dateText: "Jun 26",
      dateVal: "26",
      timeText: "09:00 - 17:00",
      timeVal: "2:30 PM",
      attendeesCount: 25,
      details: "No Custom Setup",
      priority: "Training"
    }
  ]);

  // UI state for standard Booking panel
  const [selectedRoomId, setSelectedRoomId] = useState<string>("olympus");
  const [selectedDate, setSelectedDate] = useState<string>("23");
  const [selectedTime, setSelectedTime] = useState<string>("2:30 PM");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [capacityFilter, setCapacityFilter] = useState<string>("6-12");
  const [amenitiesFilter, setAmenitiesFilter] = useState<string[]>([]);
  const [attendees, setAttendees] = useState<string[]>(["Harshith Yadav", "Malavika Yadav"]);
  const [meetingTitle, setMeetingTitle] = useState<string>("Q3 Strategy Sync");
  const [attendeeInput, setAttendeeInput] = useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Manager Approval Queue search and filtering states
  const [approvalSearchQuery, setApprovalSearchQuery] = useState<string>("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "vip" | "large">("all");

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

      const pendingRes = await fetch("/api/approvals");
      const pendingData = await pendingRes.json();
      if (pendingRes.ok && Array.isArray(pendingData)) {
        const mappedApprovals = pendingData.map((dbB: any) => {
          const start = new Date(dbB.startTime);
          const end = new Date(dbB.endTime);
          const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isVIP = dbB.title.toLowerCase().includes("vip") || dbB.title.toLowerCase().includes("exec") || dbB.user?.role?.toLowerCase() === "manager";
          return {
            id: dbB.id.toString(),
            roomName: dbB.room?.name || "Unknown Room",
            roomId: dbB.roomId.toString(),
            requestedBy: dbB.user?.name || dbB.user?.email || "Unknown User",
            role: dbB.user?.role || "Employee",
            dateText: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dateVal: start.getDate().toString(),
            timeText: `${startStr} - ${endStr}`,
            timeVal: startStr,
            attendeesCount: dbB.attendees?.length || 0,
            details: dbB.agenda || "No custom setup",
            priority: isVIP ? ("VIP" as const) : dbB.room?.capacity >= 15 ? ("Training" as const) : ("Standard" as const)
          };
        });
        setPendingApprovals(mappedApprovals);
      }
    } catch (err) {
      console.error("Failed to fetch manager data:", err);
    }
  };

  // Initialize and Toggle Theme & Session Guard
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");
    if (!storedRole || storedRole !== "manager") {
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

  // Booking confirm handler
  const handleConfirmBooking = async () => {
    if (selectedRoom.status === "maintenance") {
      alert("This room is currently under maintenance and cannot be booked.");
      return;
    }

    const isBooked = bookings.some(
      b => b.roomId === selectedRoom.id && b.date === selectedDate && b.time === selectedTime
    );

    if (isBooked) {
      alert("This slot is already booked. Please select an available slot.");
      return;
    }

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
          title: meetingTitle || "Project Sync",
          agenda: "Scheduled by Manager",
          attendees: attendees,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to book");
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

  // Manager Approval Workflow Handlers
  const handleApproveRequest = async (reqId: string) => {
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: reqId, action: "Approve" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve request");
      }
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    const reason = prompt("Enter reason for rejection:", "Schedule conflict or priority adjustment");
    if (reason === null) return; // user cancelled prompt

    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: reqId, action: "Reject", reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject request");
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

  const filteredApprovals = pendingApprovals.filter(req => {
    const matchesSearch = req.roomName.toLowerCase().includes(approvalSearchQuery.toLowerCase()) ||
                          req.requestedBy.toLowerCase().includes(approvalSearchQuery.toLowerCase());
    const matchesFilter = approvalFilter === "all"
      ? true
      : approvalFilter === "vip"
        ? req.priority === "VIP"
        : req.attendeesCount >= 15;
    return matchesSearch && matchesFilter;
  });

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
            Manager Suite
          </span>
        </div>
        
        {/* Navigation Tabs */}
        <ul className="flex flex-col gap-stack-sm flex-1 mt-4">
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
              Book Room
            </button>
          </li>

          <li>
            <button 
              onClick={() => setCurrentView("bookings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-label-md text-label-md group hover:scale-105 active:scale-95 ${
                currentView === "bookings" 
                  ? 'text-primary font-bold bg-primary/10 shadow-[inset_0_0_10px_rgba(128,131,255,0.1)] border border-primary/20' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={currentView === "bookings" ? { fontVariationSettings: "'FILL' 1" } : {}}>check_box</span>
              Approval Queue
            </button>
          </li>
        </ul>

        {/* User Profile Card */}
        <div className="mt-auto pt-4 border-t border-outline-variant/20 px-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              alt="User profile photo" 
              className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWsxu684Zw8iwXpp-lB10J2kIwZkSYnGkRKL3VyoUVJRuSzd6jE7UYzX7ew-l-T4IqvoT8_xPYfB97fvpw5UAAr-HJe91-BR6a_ukNgFbHw2lpEhm_KuLYRmrI8T98QMLawW64PAPVts7Ad91FieBVb0Ac6T7trtjJoTJU_C-6XipnmNaIIkcNguqLzLlK6EZWAW4zrKbp034sOzAcJxKngHnL8b7U2klDs6zi1tWX-ACa2qf5G3EKH6lDM_3hIOGcvBzpKEyUzYhB"
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate max-w-[100px]">
                {userName}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px] truncate">
                VP Operations
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
            Lumina Approval Center
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
                Manager
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="flex-1 mt-0 md:mt-20 overflow-y-auto">
          
          {/* VIEW: APPROVAL QUEUE */}
          {currentView === "bookings" && (
            <main className="p-stack-lg max-w-[1440px] mx-auto w-full flex flex-col gap-6">
              <div className="flex flex-col gap-1 pt-2">
                <h1 className="font-headline-xl text-3xl font-black text-on-surface tracking-tight">Approval Queue</h1>
                <p className="font-body-md text-on-surface-variant max-w-2xl">Review and manage pending facility requests. High-priority requests from executive teams are highlighted.</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 flex flex-col gap-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Pending Approvals</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline-lg text-3xl font-bold text-on-surface">{pendingApprovals.length}</span>
                    <span className="font-body-sm text-xs text-error flex items-center gap-0.5 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">priority_high</span> 
                      {pendingApprovals.filter(x => x.priority === "VIP").length} Urgent
                    </span>
                  </div>
                </div>
                <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 flex flex-col gap-1">
                  <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Processed Today</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline-lg text-3xl font-bold text-on-surface">14</span>
                    <span className="font-body-sm text-xs text-tertiary flex items-center gap-0.5 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> 100% rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters & Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setApprovalFilter("all")}
                    className={`px-4 py-1.5 rounded-full font-label-sm text-xs border transition-colors ${
                      approvalFilter === "all" 
                        ? 'bg-surface-variant text-on-surface border-outline-variant/30 font-semibold' 
                        : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-variant/40'
                    }`}
                  >
                    All Requests
                  </button>
                  <button 
                    onClick={() => setApprovalFilter("vip")}
                    className={`px-4 py-1.5 rounded-full font-label-sm text-xs border transition-colors ${
                      approvalFilter === "vip" 
                        ? 'bg-surface-variant text-on-surface border-outline-variant/30 font-semibold' 
                        : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-variant/40'
                    }`}
                  >
                    VIP Priority
                  </button>
                  <button 
                    onClick={() => setApprovalFilter("large")}
                    className={`px-4 py-1.5 rounded-full font-label-sm text-xs border transition-colors ${
                      approvalFilter === "large" 
                        ? 'bg-surface-variant text-on-surface border-outline-variant/30 font-semibold' 
                        : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-variant/40'
                    }`}
                  >
                    Large Groups
                  </button>
                </div>
                <div className="relative w-full sm:w-auto">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                  <input 
                    value={approvalSearchQuery}
                    onChange={(e) => setApprovalSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-surface dark:bg-surface-dim border border-outline-variant/30 rounded-lg pl-9 pr-4 py-2 font-body-sm text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="Search requests..." 
                    type="text"
                  />
                </div>
              </div>

              {/* Request Cards Listing */}
              <div className="flex flex-col gap-4">
                {filteredApprovals.length === 0 ? (
                  <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-tertiary text-5xl">task_alt</span>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface">Queue Caught Up</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm">There are no pending room reservation requests requiring approval right now.</p>
                  </div>
                ) : (
                  filteredApprovals.map((request) => {
                    const isVIP = request.priority === "VIP";
                    return (
                      <div 
                        key={request.id} 
                        className={`bg-surface-container rounded-xl border p-5 flex flex-col lg:flex-row gap-4 lg:items-center relative overflow-hidden transition-all shadow-md ${
                          isVIP 
                            ? 'border-error/30 hover:border-error/50 shadow-inner' 
                            : 'border-outline-variant/20 hover:border-outline-variant/40'
                        }`}
                      >
                        {isVIP && <div className="absolute top-0 left-0 w-1.5 h-full bg-error"></div>}
                        <div className="flex-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            isVIP 
                              ? 'bg-error/10 text-error border-error/20' 
                              : 'bg-secondary-container text-on-secondary-container border-outline-variant/10'
                          }`}>
                            <span className="material-symbols-outlined">{isVIP ? 'star' : 'meeting_room'}</span>
                          </div>
                          <div className="flex flex-col gap-1 flex-grow">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-headline-md text-base font-bold text-on-surface">{request.roomName}</h3>
                              <span className={`font-label-sm text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                isVIP 
                                  ? 'bg-error/10 text-error border-error/20' 
                                  : 'bg-surface-variant text-on-surface-variant border-outline-variant/20'
                              }`}>
                                {request.priority} Priority
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant">Requested by <strong className="text-on-surface">{request.requestedBy}</strong> ({request.role}) • {request.dateText}, {request.timeText}</p>
                            <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-1 bg-surface-container-high/30 px-2 py-1 rounded w-fit border border-outline-variant/15">
                              <span className="material-symbols-outlined text-[14px]">groups</span> {request.attendeesCount} Attendees
                              <span className="text-outline">|</span>
                              <span className="material-symbols-outlined text-[14px]">settings_input_component</span> Notes: {request.details}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 lg:ml-auto pt-3 lg:pt-0 border-t border-outline-variant/10 lg:border-none w-full lg:w-auto justify-end">
                          <button 
                            onClick={() => handleRejectRequest(request.id)}
                            className="bg-transparent text-error hover:bg-error/10 font-semibold text-xs py-2 px-4 rounded-lg transition-colors border border-error/20"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs py-2 px-4 rounded-lg transition-all flex items-center gap-1 shadow-md hover:shadow-indigo-500/10"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span> Approve
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </main>
          )}

          {/* VIEW: ROOMS BOOKING VIEW */}
          {currentView === "rooms" && (
            <main className="flex-1 overflow-hidden flex flex-col p-stack-lg gap-stack-lg h-full">
              {/* Search & Filter Bar */}
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
                    <button 
                      onClick={() => setCapacityFilter("2-5")}
                      className={`px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap ${capacityFilter === "2-5" ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}
                    >
                      2-5
                    </button>
                    <button 
                      onClick={() => setCapacityFilter("6-12")}
                      className={`px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap ${capacityFilter === "6-12" ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}
                    >
                      6-12
                    </button>
                    <button 
                      onClick={() => setCapacityFilter("12+")}
                      className={`px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap ${capacityFilter === "12+" ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}
                    >
                      12+
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <span className="font-label-sm text-xs text-outline uppercase tracking-wider mr-1">Amenities</span>
                    <button 
                      onClick={() => handleToggleAmenity("video")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap group ${amenitiesFilter.includes("video") ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:text-primary'}`}
                    >
                      <span className="material-symbols-outlined text-[16px] group-hover:text-primary">videocam</span> Video Conf
                    </button>
                    <button 
                      onClick={() => handleToggleAmenity("whiteboard")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap group ${amenitiesFilter.includes("whiteboard") ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:text-primary'}`}
                    >
                      <span className="material-symbols-outlined text-[16px] group-hover:text-primary">desktop_windows</span> Whiteboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Split Screen Container */}
              <div className="flex flex-col lg:flex-row gap-gutter h-full overflow-hidden">
                <section className="lg:w-[60%] flex flex-col h-full bg-surface-container-lowest/30 rounded-2xl border border-outline-variant/10 overflow-hidden shadow-inner">
                  <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/20 shrink-0">
                    <h2 className="font-title-md text-base text-on-surface flex items-center gap-2 font-semibold">
                      <span className="material-symbols-outlined text-primary">view_cozy</span> Room Explorer
                    </h2>
                    <span className="font-label-sm text-xs text-outline bg-surface-container py-1 px-3 rounded-full border border-outline-variant/20 font-semibold">
                      {filteredRooms.length} Room{filteredRooms.length !== 1 ? 's' : ''} Available
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
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="relative w-full aspect-video">
                              <div 
                                className={`bg-cover bg-center w-full h-full ${isMaint ? 'grayscale' : ''}`} 
                                style={{ backgroundImage: `url('${room.image}')` }}
                              ></div>
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
                                  let title = 'Video Conferencing';
                                  if (amenity === 'whiteboard') { icon = 'desktop_windows'; title = 'Whiteboard'; }
                                  if (amenity === 'projector') { icon = 'cast'; title = 'Projector'; }
                                  if (amenity === 'tv') { icon = 'tv'; title = 'Smart Screen'; }
                                  return (
                                    <div key={amenity} className="p-1.5 rounded bg-surface-container-high text-on-surface-variant group-hover:text-primary transition-colors" title={title}>
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

                {/* RIGHT COLUMN: Booking Panel */}
                <aside className="lg:w-[40%] flex flex-col h-full bg-surface-container-low/40 backdrop-blur-xl rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden relative">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
                  <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6 hide-scrollbar relative">
                    <div>
                      <h2 className="font-headline-lg text-2xl text-on-surface font-bold tracking-tight">Book {selectedRoom.name}</h2>
                      <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[18px]">event</span> Select date and time
                      </p>
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2 -mx-2 px-2">
                        {["22", "23", "24", "25", "26"].map((d) => {
                          const isActive = selectedDate === d;
                          const dayName = d === "22" ? "Mon" : d === "23" ? "Tue" : d === "24" ? "Wed" : d === "25" ? "Thu" : "Fri";
                          return (
                            <button 
                              key={d}
                              onClick={() => setSelectedDate(d)}
                              className={isActive 
                                ? "flex flex-col items-center justify-center min-w-[72px] py-3.5 px-2 rounded-xl bg-gradient-to-b from-primary-container/20 to-primary/10 border-2 border-primary text-primary shadow-[0_4px_12px_rgba(192,193,255,0.15)] transform scale-105 transition-all relative font-bold"
                                : "flex flex-col items-center justify-center min-w-[64px] py-3 px-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200"
                              }
                            >
                              <span className={isActive ? "font-label-sm text-[10px] uppercase tracking-widest text-primary-fixed" : "font-label-sm text-[10px] uppercase tracking-widest text-outline"}>{dayName}</span>
                              <span className="font-title-md text-sm font-bold mt-1">{d}</span>
                              {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(192,193,255,0.8)]"></div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="bg-surface-container-lowest/50 rounded-xl border border-outline-variant/20 p-4 shadow-inner">
                        <h4 className="font-label-md text-xs text-outline mb-3 flex items-center gap-2 font-semibold">
                          <span className="material-symbols-outlined text-[16px]">light_mode</span> Afternoon / Evening
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
                                  className="py-2.5 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 font-label-md text-xs opacity-50 cursor-not-allowed relative group overflow-hidden"
                                >
                                  <span>Maint</span>
                                  <div className="absolute inset-0 bg-background/85 hidden group-hover:flex items-center justify-center text-[10px] text-outline font-normal">Maintenance</div>
                                </button>
                              );
                            }

                            if (isBooked) {
                              return (
                                <button 
                                  key={slot.time}
                                  disabled
                                  className="py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-highest text-on-surface-variant font-label-md text-xs opacity-40 cursor-not-allowed relative group overflow-hidden"
                                  title={`Booked by ${slot.booker}`}
                                >
                                  <span className="line-through">{slot.time}</span>
                                  <div className="absolute inset-0 bg-background/85 hidden group-hover:flex items-center justify-center text-[10px] text-outline font-normal">Booked</div>
                                </button>
                              );
                            }
                            
                            const isSelected = selectedTime === slot.time;
                            let btnClass = "py-2.5 rounded-lg border border-tertiary/30 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 transition-colors font-label-md text-xs shadow-[inset_0_0_8px_rgba(78,222,163,0.1)] font-semibold";
                            
                            if (isSelected) {
                              btnClass = "py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white font-label-md text-xs shadow-[0_0_15px_rgba(128,131,255,0.4)] border border-primary font-bold scale-105 transform transition-transform";
                            } else if (slot.status === "warning") {
                              btnClass = "py-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 font-label-md text-xs relative group hover:bg-amber-500/20 transition-colors font-semibold";
                            }
                            
                            return (
                              <button 
                                key={slot.time}
                                onClick={() => handleTimeSlotClick(slot.time)}
                                className={btnClass}
                              >
                                {slot.time}
                                {slot.status === "warning" && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-surface-container-low px-1 font-label-sm text-[10px] text-primary z-10 font-semibold">Meeting Title</label>
                        <input 
                          className="w-full bg-surface-container-highest/30 border border-primary/50 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-inner font-body-md text-sm transition-shadow" 
                          type="text" 
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-surface-container-low px-1 font-label-sm text-[10px] text-outline z-10 font-semibold">Attendees</label>
                        <div className="w-full min-h-[48px] bg-surface-container-highest/30 border border-outline-variant/40 rounded-lg py-2 px-3 flex flex-wrap gap-2 items-center focus-within:border-primary/50 transition-colors shadow-inner">
                          <div className="flex flex-wrap gap-2 items-center">
                            {attendees.map((att, idx) => (
                              <span key={idx} className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded border border-outline-variant/30 font-label-sm text-[11px] text-on-surface font-semibold">
                                {att}
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveAttendee(idx)}
                                  className="text-outline hover:text-error material-symbols-outlined text-[14px]"
                                >
                                  close
                                </button>
                              </span>
                            ))}
                          </div>
                          <input 
                            className="bg-transparent border-none p-0 focus:ring-0 text-xs text-on-surface placeholder-outline flex-1 min-w-[100px] outline-none" 
                            placeholder="Add more..." 
                            type="text"
                            value={attendeeInput}
                            onChange={(e) => setAttendeeInput(e.target.value)}
                            onKeyDown={handleAddAttendee}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-t border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-md mt-auto shrink-0 z-10">
                    <div className="flex justify-between items-center mb-4 text-xs">
                      <span className="text-outline font-label-sm font-semibold">{selectedRoom.name} Room</span>
                      <span className="text-on-surface font-label-md font-semibold">
                        {getDateName(selectedDate)} • {selectedTime} - {getEndTime(selectedTime)}
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleConfirmBooking}
                      disabled={isSelectedRoomMaintenance}
                      className={`w-full py-4 rounded-xl text-white font-title-md text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                        isSelectedRoomMaintenance
                          ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                          : "btn-gradient-primary"
                      }`}
                    >
                      {isSelectedRoomMaintenance 
                        ? "Room Under Maintenance" 
                        : "Confirm Booking"}
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
            <p className="font-body-md text-xs text-on-surface-variant mb-6">
              Your meeting has been scheduled successfully.
            </p>
            <div className="w-full bg-surface-container-low/50 border border-outline-variant/20 rounded-xl p-4 mb-6 text-left text-xs flex flex-col gap-2">
              <div className="flex justify-between"><span className="text-outline">Room:</span><span className="font-bold text-on-surface">{selectedRoom.name}</span></div>
              <div className="flex justify-between"><span className="text-outline">Date & Time:</span><span className="text-on-surface">{getDateName(selectedDate)} • {selectedTime} - {getEndTime(selectedTime)}</span></div>
              <div className="flex justify-between"><span className="text-outline">Title:</span><span className="text-on-surface">{meetingTitle || "Project Sync"}</span></div>
              <div className="flex justify-between"><span className="text-outline">Reserved By:</span><span className="text-on-surface font-semibold">Sarah Jenkins (VP)</span></div>
              <div className="flex justify-between"><span className="text-outline">Attendees:</span><span className="text-on-surface">{attendees.length > 0 ? attendees.join(", ") : "None"}</span></div>
            </div>
            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3 rounded-xl btn-gradient-primary text-white font-title-md text-sm font-bold shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
