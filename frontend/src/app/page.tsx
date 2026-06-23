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

export default function BookingDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const role = "employee";
  const [currentView, setCurrentView] = useState<string>("rooms"); // "rooms" | "bookings"

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

  // Initialize and Toggle Theme & Session Guard
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole || storedRole !== "employee") {
      router.push("/login");
    } else {
      setLoading(false);
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

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];
  const selectedRoomSlots = getTimeSlotsForRoom(selectedRoom.id, selectedDate);

  const isSlotAlreadyBooked = bookings.some(
    b => b.roomId === selectedRoom.id && b.date === selectedDate && b.time === selectedTime
  );
  const isSelectedRoomMaintenance = selectedRoom.status === "maintenance";

  // Booking confirm handler
  const handleConfirmBooking = () => {
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

    const newBooking: Booking = {
      id: `BK-${Date.now()}`,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      date: selectedDate,
      time: selectedTime,
      title: meetingTitle || "Project Sync",
      booker: "Alex Rivers",
      attendees: [...attendees]
    };

    setBookings(prev => [...prev, newBooking]);
    setIsSuccessModalOpen(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (confirm(`Cancel reservation for ${booking.roomName} at ${booking.time}?`)) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
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
        <div className="mb-stack-lg pt-4 px-2">
          <h1 className="font-title-md text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">
            Lumina
          </h1>
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
              Rooms
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
              <span className="material-symbols-outlined text-[20px]" style={currentView === "bookings" ? { fontVariationSettings: "'FILL' 1" } : {}}>calendar_month</span>
              Bookings
            </button>
          </li>
        </ul>

        {/* User Profile */}
        <div className="mt-auto pt-4 border-t border-outline-variant/20 px-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              alt="User profile photo" 
              className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0xNYgdcg5mdCo2E4d0WUXELauNpPz9sKAsS89TN5zvbVExdpn1p_QWn9-cDPz7kxN3K1pB-XNbU5Hg-Igmadf8pjAXULBfVypjLsjYsyNaxv6XQ2pZVg3ROccMir4PnQ4MS-K5M-D_UtcCcWIpxc7FPhoTW7NPVhBb6abVNTiz639dyIsb8RlH5ewm4TL33hUjJEQ5t6sFDHkUZZWOretc2-_lIQwPxvpCXIWpwvCB80ZlyGp68snCw7a55L2TIp8c47m5HJkTDTV"
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate max-w-[100px]">
                Alex Rivers
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px]">
                Employee
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
            Lumina Reserve
          </div>
          <div className="flex items-center gap-6">
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
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="flex-1 mt-0 md:mt-20 overflow-y-auto">
          
          {/* VIEW: ROOMS BOOKING LIST */}
          {currentView === "bookings" && (
            <main className="p-stack-lg max-w-[1440px] mx-auto w-full">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h1 className="font-headline-lg text-3xl font-bold text-on-surface">Active Reservations</h1>
                  <p className="font-body-md text-on-surface-variant mt-1">Confirmed and ongoing room schedules in the workspace.</p>
                </div>
                <button 
                  onClick={() => setCurrentView("rooms")}
                  className="px-4 py-2 btn-gradient-primary text-white text-sm rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> New Booking
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-outline text-5xl">event_busy</span>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">No Active Bookings</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm">No reservations exist in the system yet. Click below to book a room.</p>
                </div>
              ) : (
                <div className="glass-panel rounded-xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                          <th className="p-4 font-semibold">Booking ID</th>
                          <th className="p-4 font-semibold">Room Name</th>
                          <th className="p-4 font-semibold">Schedule</th>
                          <th className="p-4 font-semibold">Title</th>
                          <th className="p-4 font-semibold">Reserved By</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-sm divide-y divide-white/5">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono text-xs text-outline">{booking.id}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-tertiary dot-available"></span>
                                <span className="font-bold text-on-surface">{booking.roomName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-xs font-semibold text-on-surface-variant">
                              Jun {booking.date} · {booking.time} - {getEndTime(booking.time)}
                            </td>
                            <td className="p-4 text-on-surface-variant font-medium">{booking.title}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-container-high border border-outline-variant/20 text-xs font-semibold text-on-surface">
                                {booking.booker}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-xs font-semibold text-error hover:underline bg-error/5 hover:bg-error/10 px-3 py-1.5 rounded-lg border border-error/15 transition-all"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </main>
          )}

          {/* VIEW: ROOMS LIST / SPLIT SCREEN BOOKING */}
          {currentView === "rooms" && (
            <main className="flex-1 overflow-hidden flex flex-col p-stack-lg gap-stack-lg h-full">
              {/* Search & Filter Bar */}
              <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center gap-4 justify-between shrink-0 shadow-lg">
                <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                  <div className="relative w-full max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input 
                      id="search-input" 
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
                                    <div key={amenity} className="p-1.5 rounded bg-surface-container-high text-on-surface-variant group-hover:text-primary transition-colors">
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
                        <span className="material-symbols-outlined text-[18px]">event</span> Select date and time
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
                          <span className="material-symbols-outlined text-[16px]">light_mode</span> Afternoon / Evening
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedRoomSlots.map((slot) => {
                            const isMaintenance = slot.status === "maintenance";
                            const isBooked = slot.status === "booked";
                            
                            if (isMaintenance) {
                              return (
                                <button key={slot.time} disabled className="py-2.5 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 font-label-md text-xs opacity-50 cursor-not-allowed">
                                  <span>Maint</span>
                                </button>
                              );
                            }

                            if (isBooked) {
                              return (
                                <button key={slot.time} disabled className="py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-highest text-on-surface-variant font-label-md text-xs opacity-40 cursor-not-allowed">
                                  <span className="line-through">{slot.time}</span>
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
                      disabled={isSelectedRoomMaintenance}
                      className={`w-full py-4 rounded-xl text-white font-title-md text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                        isSelectedRoomMaintenance
                          ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                          : "btn-gradient-primary"
                      }`}
                    >
                      {isSelectedRoomMaintenance ? "Room Under Maintenance" : "Confirm Booking"}
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
              <div className="flex justify-between"><span className="text-outline">Date & Time:</span><span className="text-on-surface">{getDateName(selectedDate)} • {selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-outline">Title:</span><span className="text-on-surface">{meetingTitle || "Project Sync"}</span></div>
            </div>
            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full py-3 rounded-xl btn-gradient-primary text-white font-title-md text-sm font-bold shadow-lg">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
