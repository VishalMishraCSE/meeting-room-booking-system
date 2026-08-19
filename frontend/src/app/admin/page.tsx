"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import PayswiffLogo from "@/components/PayswiffLogo";

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
  status: string;
  checkedIn?: boolean;
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

interface RoomSupply {
  id: number;
  roomId: number;
  itemName: string;
  quantity: number;
  status: string; // Missing, To Buy, Purchased, Replenished
  notes?: string;
  reportedBy: string;
  createdAt: string;
  room?: { id: number; name: string; roomNumber: string; location: string };
}

export default function AdminPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Admin.01");
  const [currentView, setCurrentView] = useState<string>("dashboard"); // "dashboard" | "rooms" | "audit"

  // Unified reactive mock database state
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "Conference Room 1",
      seats: 24,
      location: "Floor 5",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0ol9PjeXi3Bj3rAKPRtdaOebaW7NNioctjsaVdX7XXDHcMPx_svn61gM1PJ1wPz0vjXKD-7D32w1RqCmMAgFgjllRLV_pvza_syZEMmDr8tWlPrugEnX9HPNiW0sdQVM_vBa721IlOrSEhBuukuN_P4KVfOALIBSmdY35kvwa5DKMRp-hGSkB1TIecPWpbFI4SEdbSXOcWqrXKF4EgJNlPenEWkuFyLvvAkKwMBL0odzWpyM_UmkdnlnJuk8zQmv6CZsY1JLg26Nm",
      amenities: ["video", "whiteboard", "projector"],
      status: "online"
    },
    {
      id: "2",
      name: "Conference Room 2",
      seats: 12,
      location: "Floor 5",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmiAyfyc6MokYdRyOd9u11Ozjsl8e4bHGpUuQPTX_3whwNs35wgOOxpJcYxT2HK-tpwrVB3RFPMksfUlu0qsbpIfWCSKn3HdhIF_fdpvJFJxe_IDtNswB2BTRGN17IABhBtwyXPYiq4Z_ggChHTxjBWgiYble_1xZVpbd6SGWA4UFAQ5WiPjLKqrMJx4nJ6OKhIcz7OIFqJchasDT5113SaxI_sE4SrGRWRqe0SSje7iT3IiVFtlR8xs43rV5WtT-gYaFLOFSDgvx-",
      amenities: ["video", "tv"],
      status: "maintenance"
    },
    {
      id: "3",
      name: "Conference Room 3",
      seats: 4,
      location: "Floor 5",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFGHdHc3tTydeu1GdafZl4LlA9vHBRrBLuCCSi0jE8Y9Bg8eHgyAUcmjBzxoHCxDEKj8h2T2tue6xTpMGGIRqZyEOrizAXjJKS9g7Gn4TawU13VgqDH_HAcT1yZ2z2uodGRQMawisGkZMCFmJReN8Sh4ZIcfchLZdJ8nGQmTbWXYldxwYn3vHhP52YUP4yNbtVasfxb0RPueaB68oqfzgsPgi2mLCQWvi6Wubnwr3aAjZuocPyMj8_Plw9B1ij7I8lPQUM4SFaB7Mm",
      amenities: ["whiteboard"],
      status: "online"
    },
    {
      id: "4",
      name: "Conference Room 4",
      seats: 8,
      location: "Floor 5",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
      amenities: ["video", "whiteboard", "tv"],
      status: "online"
    },
    {
      id: "5",
      name: "Conference Room 5",
      seats: 16,
      location: "Floor 5",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop",
      amenities: ["video", "whiteboard", "projector", "tv"],
      status: "online"
    },
    {
      id: "6",
      name: "Conference Room 6",
      seats: 10,
      location: "Floor 5",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=600&auto=format&fit=crop",
      amenities: ["video", "whiteboard", "projector"],
      status: "online"
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // 6 Days Real-World Date Generation from Today
  const upcoming6Days = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const isToday = i === 0;
      const dayNum = d.getDate();
      const month = d.getMonth();
      const year = d.getFullYear();
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const fullLabel = isToday ? `Today (${dayName}, ${monthName} ${dayNum})` : `${dayName}, ${monthName} ${dayNum}`;
      const dateKey = `${year}-${month}-${dayNum}`;
      list.push({
        index: i,
        isToday,
        dateKey,
        dayNum,
        month,
        year,
        dayName,
        monthName,
        fullLabel,
        dateObj: d,
      });
    }
    return list;
  }, []);

  // UI state for standard Booking panel
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const selectedDayItem = useMemo(() => {
    return upcoming6Days[selectedDayIndex] || upcoming6Days[0];
  }, [upcoming6Days, selectedDayIndex]);

  const selectedMonth = selectedDayItem.month;
  const selectedYear = selectedDayItem.year;
  const selectedDate = selectedDayItem.dayNum.toString();

  const [selectedRoomId, setSelectedRoomId] = useState<string>("1");
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [capacityFilter, setCapacityFilter] = useState<string>("All");
  const [amenitiesFilter, setAmenitiesFilter] = useState<string[]>([]);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [meetingTitle, setMeetingTitle] = useState<string>("Project Sync");
  const [attendeeInput, setAttendeeInput] = useState<string>("");
  const [showAttendeeDropdown, setShowAttendeeDropdown] = useState<boolean>(false);
  const [corporateUsers, setCorporateUsers] = useState<{ id: number; name: string; email: string; role: string }[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Custom Extension Modal State
  const [isExtendModalOpen, setIsExtendModalOpen] = useState<boolean>(false);
  const [targetExtendBooking, setTargetExtendBooking] = useState<any>(null);
  const [customExtensionMinutes, setCustomExtensionMinutes] = useState<string>("30");
  const [isExtending, setIsExtending] = useState<boolean>(false);

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

  // Room Supply Tracker State
  const [supplies, setSupplies] = useState<RoomSupply[]>([]);
  const [supplyFilter, setSupplyFilter] = useState<string>("All");
  const [isAddSupplyModalOpen, setIsAddSupplyModalOpen] = useState<boolean>(false);
  const [newSupplyItemName, setNewSupplyItemName] = useState<string>("");
  const [newSupplyRoomId, setNewSupplyRoomId] = useState<string>("");
  const [newSupplyQuantity, setNewSupplyQuantity] = useState<number>(1);
  const [newSupplyStatus, setNewSupplyStatus] = useState<string>("Missing");
  const [newSupplyNotes, setNewSupplyNotes] = useState<string>("");
  const [isSubmittingSupply, setIsSubmittingSupply] = useState<boolean>(false);

  // Audit Trail & Bookings Filter State
  const [auditBookingFilter, setAuditBookingFilter] = useState<"all" | "approved" | "pending" | "cancelled" | "logs">("all");
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>("");
  const [isProcessingApproval, setIsProcessingApproval] = useState<string | null>(null);

  // Edit Members State
  const [isEditMembersModalOpen, setIsEditMembersModalOpen] = useState<boolean>(false);
  const [targetEditBooking, setTargetEditBooking] = useState<any>(null);
  const [editMembersList, setEditMembersList] = useState<string[]>([]);
  const [newMemberEmailInput, setNewMemberEmailInput] = useState<string>("");

  // Room Specific History State
  const [isRoomHistoryModalOpen, setIsRoomHistoryModalOpen] = useState<boolean>(false);
  const [targetRoomHistory, setTargetRoomHistory] = useState<Room | null>(null);

  const handleAdminApprovalAction = async (bookingId: string, action: "Approved" | "Rejected") => {
    setIsProcessingApproval(bookingId);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action.toLowerCase()} request`);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessingApproval(null);
    }
  };

  // Helper for Rich Automated WhatsApp Share link
  const getWhatsAppShareLink = (booking: any) => {
    const attendeesStr = booking.attendees && booking.attendees.length > 0 
      ? booking.attendees.join(', ') 
      : 'All Team Members';
      
    const text = 
`🏢 *PAYSWIFF RESERVE: OFFICIAL MEETING INVITATION*

📌 *Meeting Title:* ${booking.title}
🚪 *Facility Room:* ${booking.roomName}
⏰ *Scheduled Time:* ${booking.time}
👤 *Organized By:* ${booking.booker || 'Corporate Team'}
👥 *Invited Participants:* ${attendeesStr}
✅ *Status:* Approved (15m Auto-Approval Window)

📅 *Add to Google Calendar:* https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.title)}&location=${encodeURIComponent(booking.roomName)}

🔗 *Access Portal:* http://192.168.149.172:3000/login

_Please confirm your attendance!_`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const handleOpenEditMembers = (booking: any) => {
    setTargetEditBooking(booking);
    setEditMembersList(booking.attendees || []);
    setNewMemberEmailInput("");
    setIsEditMembersModalOpen(true);
  };

  const handleOpenRoomHistory = (room: Room) => {
    setTargetRoomHistory(room);
    setIsRoomHistoryModalOpen(true);
  };

  const monthsList = useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  const morningSlots = useMemo(() => ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"], []);
  const afternoonSlots = useMemo(() => ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"], []);
  const eveningSlots = useMemo(() => ["4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"], []);
  const allSlots = useMemo(() => [...morningSlots, ...afternoonSlots, ...eveningSlots], [morningSlots, afternoonSlots, eveningSlots]);

  // Helper to parse slot time string into hours and minutes
  const parseSlotTime = (timeStr: string) => {
    const parts = timeStr.split(" ");
    const timeVal = parts[0] || "10:00";
    const ampm = parts[1] || "AM";
    let [hours, minutes] = timeVal.split(":").map(Number);
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };

  // Helper to check if a slot on a given day has already passed real-world time
  const isSlotInPast = (dayItem: typeof upcoming6Days[0], timeStr: string) => {
    if (!dayItem || !dayItem.isToday) return false;
    const { hours, minutes } = parseSlotTime(timeStr);
    const slotDate = new Date(dayItem.year, dayItem.month, dayItem.dayNum, hours, minutes, 0, 0);
    const now = new Date();
    return slotDate.getTime() <= now.getTime();
  };

  const getSlotDates = (dayItem: typeof upcoming6Days[0], timeStr: string) => {
    const { hours, minutes } = parseSlotTime(timeStr);
    const startTime = new Date(dayItem.year, dayItem.month, dayItem.dayNum, hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
    return { startTime, endTime };
  };

  const fetchData = async () => {
    try {
      // Fetch rooms, bookings, and logs in parallel for faster page load
      const [roomsRes, bookingsRes, logsRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/bookings"),
        fetch("/api/logs"),
      ]);

      const [roomsData, bookingsData, logsData] = await Promise.all([
        roomsRes.json(),
        bookingsRes.json(),
        logsRes.json(),
      ]);

      if (roomsRes.ok && Array.isArray(roomsData)) {
        const mappedRooms = roomsData.map((dbR: any) => ({
          id: dbR.id.toString(),
          name: dbR.name,
          seats: dbR.capacity,
          location: dbR.location || `Room ${dbR.roomNumber}, Floor ${dbR.floorId}`,
          image: dbR.heroImageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
          amenities: dbR.amenities?.map((a: any) => {
            const name = a.name.toLowerCase();
            if (name.includes("video") || name.includes("conf")) return "video";
            return name;
          }) || [],
          status: dbR.status.toLowerCase() === "available" ? ("online" as const) : ("maintenance" as const)
        }));
        setRooms(mappedRooms);
        if (mappedRooms.length > 0) {
          setSelectedRoomId(mappedRooms[0].id);
        }
      }

      if (bookingsRes.ok && Array.isArray(bookingsData)) {
        const mappedBookings = bookingsData.map((dbB: any) => {
          const start = new Date(dbB.startTime);
          let hours = start.getHours();
          const minutes = start.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
          const timeStr = `${hours}:${minStr} ${ampm}`;

          const monthName = start.toLocaleDateString("en-US", { month: "short" });
          const dayName = start.toLocaleDateString("en-US", { weekday: "short" });

          return {
            id: dbB.id.toString(),
            roomId: dbB.roomId.toString(),
            roomName: dbB.room?.name || "Unknown Room",
            month: start.getMonth(),
            monthName,
            dayName,
            year: start.getFullYear(),
            date: start.getDate().toString(),
            fullDateStr: `${monthName} ${start.getDate()}, ${start.getFullYear()}`,
            startTimeRaw: dbB.startTime,
            endTimeRaw: dbB.endTime,
            time: timeStr,
            title: dbB.title,
            booker: dbB.user?.name || dbB.user?.email || "Unknown",
            bookerEmail: dbB.user?.email || "",
            bookerRole: dbB.user?.role || "Employee",
            attendees: dbB.attendees?.map((a: any) => a.email) || [],
            status: dbB.status || "Approved"
          };
        });
        setBookings(mappedBookings);
      }

      // Fetch corporate users for attendee search autocomplete
      fetch("/api/users").then(res => res.json()).then(data => {
        if (Array.isArray(data)) setCorporateUsers(data);
      }).catch(e => console.error("Failed to fetch users:", e));

      // Fetch in-app notifications
      fetch("/api/notifications").then(res => res.json()).then(data => {
        if (data && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadNotificationsCount(data.unreadCount || 0);
        }
      }).catch(e => console.error("Failed to fetch notifications:", e));

      if (logsRes.ok && Array.isArray(logsData)) {
        setAuditLogs(logsData);
      }

      // Fetch room supplies & missing equipment
      fetch("/api/supplies").then(res => res.json()).then(data => {
        if (Array.isArray(data)) setSupplies(data);
      }).catch(e => console.error("Failed to fetch room supplies:", e));
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  const handleCreateSupply = async () => {
    if (!newSupplyItemName.trim() || !newSupplyRoomId) {
      alert("Please select a room and enter the item name.");
      return;
    }
    setIsSubmittingSupply(true);
    try {
      const res = await fetch("/api/supplies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: newSupplyRoomId,
          itemName: newSupplyItemName,
          quantity: newSupplyQuantity,
          status: newSupplyStatus,
          notes: newSupplyNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log supply item");
      setIsAddSupplyModalOpen(false);
      setNewSupplyItemName("");
      setNewSupplyNotes("");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingSupply(false);
    }
  };

  const handleUpdateSupplyStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/supplies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update supply status");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSupply = async (id: number) => {
    if (!confirm("Are you sure you want to remove this supply report?")) return;
    try {
      const res = await fetch(`/api/supplies/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete supply item");
      fetchData();
    } catch (err: any) {
      alert(err.message);
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
      router.replace("/login");
      return;
    }
    setLoading(false);
    if (storedName) setUserName(storedName);
    fetchData();

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

  // Dynamic slot generation based on live bookings, maintenance, and real-world passed time
  const getTimeSlotsForRoom = (roomId: string, dayItem: typeof upcoming6Days[0]) => {
    return allSlots.map(time => {
      const room = rooms.find(r => r.id === roomId);
      if (room?.status === "maintenance") {
        return { time, status: "maintenance" as const, booker: "" };
      }
      if (isSlotInPast(dayItem, time)) {
        return { time, status: "passed" as const, booker: "" };
      }
      const booking = bookings.find(b => 
        b.roomId === roomId && 
        (b as any).month === dayItem.month && 
        (b as any).year === dayItem.year && 
        b.date === dayItem.dayNum.toString() && 
        b.time === time &&
        b.status !== 'Cancelled'
      );
      if (booking) {
        return { time, status: "booked" as const, booker: booking.booker };
      }
      return { time, status: "available" as const, booker: "" };
    });
  };

  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId) || rooms[0] || { id: "1", name: "Conference Room 1", status: "online", seats: 24, location: "Floor 5", image: "", amenities: [] };
  }, [rooms, selectedRoomId]);

  const selectedRoomSlots = useMemo(() => {
    return getTimeSlotsForRoom(selectedRoom.id, selectedDayItem);
  }, [selectedRoom.id, selectedDayItem, bookings, rooms, allSlots]);

  // If the current selected time is passed/maintenance on the active day, select the first available future slot
  useEffect(() => {
    const isCurrentTimeUnavailable = selectedRoomSlots.some(
      s => s.time === selectedTime && (s.status === "passed" || s.status === "maintenance")
    );
    if (isCurrentTimeUnavailable) {
      const firstAvailable = selectedRoomSlots.find(s => s.status === "available" || s.status === "booked");
      if (firstAvailable) {
        setSelectedTime(firstAvailable.time);
      }
    }
  }, [selectedRoomSlots, selectedTime]);

  const isSlotAlreadyBooked = useMemo(() => {
    return bookings.some(
      b => b.roomId === selectedRoom.id && 
           (b as any).month === selectedMonth && 
           (b as any).year === selectedYear && 
           b.date === selectedDate && 
           b.time === selectedTime &&
           b.status !== 'Cancelled'
    );
  }, [bookings, selectedRoom.id, selectedMonth, selectedYear, selectedDate, selectedTime]);

  const isSelectedTimePassed = useMemo(() => {
    return isSlotInPast(selectedDayItem, selectedTime);
  }, [selectedDayItem, selectedTime]);

  const isSelectedRoomMaintenance = selectedRoom.status === "maintenance";

  const getDateName = (dayItem: typeof upcoming6Days[0]) => {
    if (!dayItem) return "Selected Date";
    return `${dayItem.dayName}, ${dayItem.monthName} ${dayItem.dayNum}, ${dayItem.year}`;
  };

  // Booking confirm handler with Admin Preemption override logic
  const handleConfirmBooking = async () => {
    if (isSubmitting) return;

    if (isSelectedTimePassed) {
      alert("This time slot has already passed. Please select an upcoming time slot.");
      return;
    }

    const isBooked = bookings.some(
      b => b.roomId === selectedRoom.id && 
           (b as any).month === selectedMonth && 
           (b as any).year === selectedYear && 
           b.date === selectedDate && 
           b.time === selectedTime && 
           b.status !== 'Cancelled'
    );

    const { startTime, endTime } = getSlotDates(selectedDayItem, selectedTime);
    setIsSubmitting(true);

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
          preempt: true, // Admin always has preempt authority
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm booking");
      }

      setIsSuccessModalOpen(true);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
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

  // Extension Handler
  const handleOpenExtendModal = (booking: any) => {
    setTargetExtendBooking(booking);
    setCustomExtensionMinutes("30");
    setIsExtendModalOpen(true);
  };

  const handleExecuteExtend = async () => {
    if (!targetExtendBooking || isExtending) return;
    const mins = parseInt(customExtensionMinutes, 10);
    if (isNaN(mins) || mins <= 0) {
      alert("Please enter a valid extension duration in minutes.");
      return;
    }
    setIsExtending(true);
    try {
      const res = await fetch(`/api/bookings/${targetExtendBooking.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extensionMinutes: mins }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extend meeting");
      }
      alert(data.message || "Meeting extended successfully!");
      setIsExtendModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsExtending(false);
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
          <PayswiffLogo size="md" />
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
              onClick={() => {
                setCurrentView("audit");
                setAuditBookingFilter("all");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-label-md text-label-md group hover:scale-105 active:scale-95 ${
                currentView === "audit" && auditBookingFilter !== "approved"
                  ? 'text-primary font-bold bg-primary/10 shadow-[inset_0_0_10px_rgba(128,131,255,0.1)] border border-primary/20' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={currentView === "audit" && auditBookingFilter !== "approved" ? { fontVariationSettings: "'FILL' 1" } : {}}>history</span>
              Audit Trail
            </button>
          </li>

          <li>
            <button 
              onClick={() => setCurrentView("supplies")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-label-md text-label-md group hover:scale-105 active:scale-95 ${
                currentView === "supplies" 
                  ? 'text-primary font-bold bg-primary/10 shadow-[inset_0_0_10px_rgba(128,131,255,0.1)] border border-primary/20' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={currentView === "supplies" ? { fontVariationSettings: "'FILL' 1" } : {}}>inventory_2</span>
              Room Supplies
            </button>
          </li>

          <li>
            <button 
              onClick={() => {
                setCurrentView("audit");
                setAuditBookingFilter("approved");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-label-md text-label-md group hover:scale-105 active:scale-95 ${
                currentView === "audit" && auditBookingFilter === "approved"
                  ? 'text-primary font-bold bg-primary/10 shadow-[inset_0_0_10px_rgba(128,131,255,0.1)] border border-primary/20' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={currentView === "audit" && auditBookingFilter === "approved" ? { fontVariationSettings: "'FILL' 1" } : {}}>update</span>
              Active Reservations
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
      <div className="ml-0 md:ml-64 flex flex-col flex-1 h-screen w-full max-w-full overflow-x-hidden">
        {/* TopNavBar */}
        <header className="hidden md:flex fixed top-0 right-0 left-64 h-20 bg-surface/60 backdrop-blur-md border-b border-outline-variant/10 shadow-sm z-40 px-stack-lg justify-between items-center transition-all duration-300">
          <div className="flex items-center">
            <PayswiffLogo size="sm" />
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
            <div className="flex items-center gap-2 text-on-surface-variant relative">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-surface-container-highest hover:text-primary transition-colors" 
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
              </button>

              {/* In-App Notifications Bell */}
              <button 
                onClick={() => {
                  setShowNotificationsPopover(!showNotificationsPopover);
                  if (!showNotificationsPopover && unreadNotificationsCount > 0) {
                    fetch("/api/notifications", { method: "PATCH" });
                    setUnreadNotificationsCount(0);
                  }
                }}
                className="p-2 rounded-full hover:bg-surface-container-highest hover:text-primary transition-colors relative"
                title="In-App Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-surface animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {showNotificationsPopover && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3.5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest/50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">notifications_active</span>
                      <h4 className="font-title-md text-xs font-bold text-on-surface">In-App Notifications</h4>
                    </div>
                    <button 
                      onClick={() => {
                        fetch("/api/notifications", { method: "PATCH" });
                        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                        setUnreadNotificationsCount(0);
                      }}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/10">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-on-surface-variant flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-3xl">notifications_off</span>
                        <span>No notifications yet</span>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 text-xs transition-colors ${n.isRead ? 'opacity-70 bg-transparent' : 'bg-primary/10 font-medium'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold text-[11px] ${n.type === 'success' ? 'text-emerald-400' : n.type === 'error' ? 'text-red-400' : n.type === 'warning' ? 'text-amber-400' : 'text-primary'}`}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-outline">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-on-surface-variant text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              <div className="w-px h-6 bg-white/20"></div>
              <span className="font-label-sm text-xs font-semibold text-outline tracking-wider bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/20 uppercase">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="flex-1 mt-0 md:mt-20 overflow-y-auto">
          
          {/* VIEW: ACTIVE RESERVATIONS & EXTENSION */}
          {currentView === "active_reservations" && (
            <main className="p-stack-lg max-w-[1440px] mx-auto w-full flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-2">
                <div>
                  <h1 className="font-headline-lg text-3xl font-bold text-on-surface">Active Reservations</h1>
                  <p className="font-body-md text-on-surface-variant mt-1">Confirmed workspace room schedules with admin preemption and meeting extension controls.</p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-outline text-5xl">event_busy</span>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">No Active Reservations</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm">No active confirmed bookings exist in the system right now.</p>
                </div>
              ) : (
                <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-outline-variant/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[850px]">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                          <th className="p-4 font-semibold">Booking ID</th>
                          <th className="p-4 font-semibold">Room Name</th>
                          <th className="p-4 font-semibold">Schedule</th>
                          <th className="p-4 font-semibold">Title & Participants</th>
                          <th className="p-4 font-semibold">15m Approval & Check-In</th>
                          <th className="p-4 font-semibold">Reserved By</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-sm divide-y divide-white/5">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono text-xs text-outline">{booking.id}</td>
                            <td className="p-4">
                              <span className="font-bold text-on-surface block">{booking.roomName}</span>
                              <button 
                                onClick={() => {
                                  const r = rooms.find(room => room.name === booking.roomName || room.id === booking.roomId);
                                  if (r) handleOpenRoomHistory(r);
                                }}
                                className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5 mt-0.5"
                              >
                                <span className="material-symbols-outlined text-[12px]">history</span> Room History
                              </button>
                            </td>
                            <td className="p-4 text-xs font-semibold text-on-surface-variant">
                              Date {booking.date} · {booking.time}
                            </td>
                            <td className="p-4 text-on-surface-variant font-medium">
                              <div className="font-bold text-on-surface mb-0.5">{booking.title}</div>
                              <button
                                onClick={() => handleOpenEditMembers(booking)}
                                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[13px]">group</span>
                                {booking.attendees && booking.attendees.length > 0 
                                  ? `${booking.attendees.length} Members` 
                                  : "+ Add Members"}
                              </button>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setBookings(bookings.map(b => b.id === booking.id ? { ...b, checkedIn: !b.checkedIn } : b));
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                                  booking.checkedIn
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                                }`}
                                title="Auto-approves after 15 minutes or click to approve immediately"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${booking.checkedIn ? 'bg-emerald-400' : 'bg-blue-400 animate-pulse'}`}></span>
                                {booking.checkedIn ? "Approved / Checked In" : "Auto-Approved (15m Window)"}
                              </button>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-container-high border border-outline-variant/20 text-xs font-semibold text-on-surface">
                                {booking.booker}
                              </span>
                            </td>
                            <td className="p-4 text-right flex items-center justify-end gap-2">
                              <a
                                href={getWhatsAppShareLink(booking)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 transition-all flex items-center gap-1 shadow-sm"
                                title="Share meeting reminder on WhatsApp"
                              >
                                <span className="material-symbols-outlined text-[14px]">chat</span> WhatsApp
                              </a>
                              <button 
                                onClick={() => handleOpenEditMembers(booking)}
                                className="text-xs font-bold text-primary bg-primary/20 hover:bg-primary/30 px-2.5 py-1.5 rounded-lg border border-primary/30 transition-all flex items-center gap-1 shadow-sm"
                                title="Edit meeting participants"
                              >
                                <span className="material-symbols-outlined text-[14px]">person_add</span> Edit
                              </button>
                              <button 
                                onClick={() => handleOpenExtendModal(booking)}
                                className="text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all flex items-center gap-1 shadow-sm"
                                title="Extend meeting duration"
                              >
                                <span className="material-symbols-outlined text-[14px]">update</span> Extend
                              </button>
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

          {/* VIEW: AUDIT LOGS & COMPREHENSIVE BOOKINGS TRAIL */}
          {(currentView === "audit" || currentView === "active_reservations") && (
            <main className="p-stack-lg max-w-[1440px] mx-auto w-full flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant/20 pb-4 gap-4">
                <div>
                  <h1 className="font-headline-lg text-3xl font-bold text-on-surface flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-3xl">history_edu</span>
                    System Audit Trail & Reservations
                  </h1>
                  <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1">
                    Real-time records and history of all user bookings, manager approvals, cancellations, and administrative events.
                  </p>
                </div>
                <button 
                  onClick={() => setCurrentView("dashboard")}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-sm rounded-xl border border-outline-variant/30 flex items-center gap-2 transition-colors self-start md:self-auto shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Telemetry
                </button>
              </div>

              {/* Filter Tabs & Quick Search */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-lg border border-outline-variant/20">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                  <input
                    type="text"
                    placeholder="Search by room, user, meeting title, or ID..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs md:text-sm text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                  />
                  {auditSearchQuery && (
                    <button onClick={() => setAuditSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs">
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter Pills (All, Approved, Pending, Cancelled, System Logs) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setAuditBookingFilter("all")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      auditBookingFilter === "all"
                        ? "bg-primary text-on-primary shadow-md shadow-primary/20 scale-105"
                        : "bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest border border-outline-variant/20"
                    }`}
                  >
                    <span>All Bookings</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
                      {bookings.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setAuditBookingFilter("approved")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      auditBookingFilter === "approved"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105"
                        : "bg-surface-container-high/60 text-emerald-400 hover:bg-emerald-950/30 border border-emerald-500/20"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Approved</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950/40 text-emerald-300 font-mono">
                      {bookings.filter(b => b.status.toLowerCase() === "approved").length}
                    </span>
                  </button>

                  <button
                    onClick={() => setAuditBookingFilter("pending")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      auditBookingFilter === "pending"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-105"
                        : "bg-surface-container-high/60 text-amber-400 hover:bg-amber-950/30 border border-amber-500/20"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Pending</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-950/40 text-amber-300 font-mono">
                      {bookings.filter(b => b.status.toLowerCase() === "pending").length}
                    </span>
                  </button>

                  <button
                    onClick={() => setAuditBookingFilter("cancelled")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      auditBookingFilter === "cancelled"
                        ? "bg-red-600 text-white shadow-md shadow-red-600/20 scale-105"
                        : "bg-surface-container-high/60 text-red-400 hover:bg-red-950/30 border border-red-500/20"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span>Cancelled</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-950/40 text-red-300 font-mono">
                      {bookings.filter(b => b.status.toLowerCase() === "cancelled").length}
                    </span>
                  </button>

                  <button
                    onClick={() => setAuditBookingFilter("logs")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      auditBookingFilter === "logs"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                        : "bg-surface-container-high/60 text-indigo-400 hover:bg-indigo-950/30 border border-indigo-500/20"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    <span>System Activity</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-950/40 text-indigo-300 font-mono">
                      {auditLogs.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              {auditBookingFilter === "logs" ? (
                /* System Activity Event Logs */
                <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 shadow-xl border border-outline-variant/20">
                  <div className="flex justify-between items-center bg-surface-container-lowest/50 p-3 rounded-xl border border-outline-variant/15 text-xs text-outline font-semibold uppercase tracking-wider">
                    <span>Administrative System Activity ({auditLogs.length} Events)</span>
                    <span className="text-[11px] text-primary font-bold">Encrypted Audit Trail</span>
                  </div>

                  <div className="divide-y divide-outline-variant/10">
                    {auditLogs
                      .filter(l => 
                        !auditSearchQuery || 
                        l.title.toLowerCase().includes(auditSearchQuery.toLowerCase()) || 
                        l.description.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                        l.code.toLowerCase().includes(auditSearchQuery.toLowerCase())
                      )
                      .map((log) => (
                        <div key={log.id} className="py-4 flex gap-4 items-start hover:bg-white/[0.02] px-3 rounded-xl transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shrink-0 shadow-inner">
                            <span className={`material-symbols-outlined text-[18px] ${log.iconColor}`}>{log.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-bold text-on-surface truncate">{log.title}</h4>
                              <span className="text-[10px] text-outline font-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant/20">{log.code}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{log.description}</p>
                            <span className="text-[10px] text-outline font-mono block mt-2">{log.time} · System ID: {log.id}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                /* Bookings Records Matrix */
                <div className="flex flex-col gap-4">
                  {bookings
                    .filter((b) => {
                      const matchesStatus = 
                        auditBookingFilter === "all" ? true :
                        b.status.toLowerCase() === auditBookingFilter.toLowerCase();
                      
                      const matchesSearch = 
                        !auditSearchQuery ||
                        b.title.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                        b.roomName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                        b.booker.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                        (b.bookerEmail && b.bookerEmail.toLowerCase().includes(auditSearchQuery.toLowerCase())) ||
                        b.id.includes(auditSearchQuery) ||
                        b.fullDateStr.toLowerCase().includes(auditSearchQuery.toLowerCase());

                      return matchesStatus && matchesSearch;
                    }).length === 0 ? (
                      <div className="glass-panel rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3 border border-outline-variant/20">
                        <span className="material-symbols-outlined text-outline text-5xl">event_busy</span>
                        <h3 className="font-headline-md text-lg font-bold text-on-surface">No Reservation Records Found</h3>
                        <p className="text-xs text-on-surface-variant max-w-sm">
                          {auditSearchQuery 
                            ? `No records match search "${auditSearchQuery}" for filter "${auditBookingFilter}".`
                            : `There are currently no ${auditBookingFilter === "all" ? "" : auditBookingFilter} bookings in the system.`}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {bookings
                          .filter((b) => {
                            const matchesStatus = 
                              auditBookingFilter === "all" ? true :
                              b.status.toLowerCase() === auditBookingFilter.toLowerCase();
                            
                            const matchesSearch = 
                              !auditSearchQuery ||
                              b.title.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              b.roomName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              b.booker.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              (b.bookerEmail && b.bookerEmail.toLowerCase().includes(auditSearchQuery.toLowerCase())) ||
                              b.id.includes(auditSearchQuery) ||
                              b.fullDateStr.toLowerCase().includes(auditSearchQuery.toLowerCase());

                            return matchesStatus && matchesSearch;
                          })
                          .map((booking) => {
                            const isApproved = booking.status.toLowerCase() === "approved";
                            const isPending = booking.status.toLowerCase() === "pending";
                            const isCancelled = booking.status.toLowerCase() === "cancelled";

                            const statusBadge = isApproved ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span> Approved
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                                <span className="material-symbols-outlined text-[13px]">hourglass_top</span> Pending Approval
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
                                <span className="material-symbols-outlined text-[13px]">cancel</span> Cancelled
                              </span>
                            );

                            return (
                              <div 
                                key={booking.id} 
                                className={`glass-panel rounded-2xl p-5 border flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${
                                  isCancelled ? "opacity-75 border-outline-variant/20 bg-surface-container-lowest/30" : "border-outline-variant/30"
                                }`}
                              >
                                <div className={`absolute top-0 left-0 w-full h-1 ${
                                  isApproved ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                  isPending ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                                  "bg-gradient-to-r from-red-600 to-red-800"
                                }`}></div>

                                <div>
                                  {/* Header */}
                                  <div className="flex justify-between items-start gap-2 mb-3 pt-1">
                                    <div>
                                      <span className="font-mono text-[10px] text-outline uppercase tracking-wider block">RESERVATION #{booking.id}</span>
                                      <h3 className="font-title-md text-base font-bold text-on-surface mt-0.5">{booking.title}</h3>
                                    </div>
                                    {statusBadge}
                                  </div>

                                  {/* Details */}
                                  <div className="bg-surface-container-low/50 border border-outline-variant/15 rounded-xl p-3.5 space-y-2 mb-4 text-xs">
                                    <p className="text-on-surface font-semibold flex items-center gap-1.5">
                                      <span className="material-symbols-outlined text-primary text-[16px]">meeting_room</span>
                                      {booking.roomName}
                                    </p>
                                    <p className="text-on-surface-variant flex items-center gap-1.5">
                                      <span className="material-symbols-outlined text-outline text-[16px]">event</span>
                                      {booking.fullDateStr} · <strong className="text-on-surface">{booking.time}</strong>
                                    </p>
                                    <p className="text-on-surface-variant flex items-center gap-1.5">
                                      <span className="material-symbols-outlined text-outline text-[16px]">person</span>
                                      Organizer: <span className="text-on-surface font-medium">{booking.booker}</span>
                                      {booking.bookerRole && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-container-high text-primary font-bold uppercase ml-1">
                                          {booking.bookerRole}
                                        </span>
                                      )}
                                    </p>
                                    {booking.attendees && booking.attendees.length > 0 && (
                                      <div className="pt-2 border-t border-outline-variant/10">
                                        <span className="text-[10px] text-outline block mb-1 font-semibold uppercase">Invited Attendees ({booking.attendees.length}):</span>
                                        <div className="flex flex-wrap gap-1">
                                          {booking.attendees.map((att: string) => (
                                            <span key={att} className="text-[10px] px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono">
                                              {att}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Actions Toolbar */}
                                <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-between gap-2">
                                  {isPending ? (
                                    <div className="flex items-center gap-2 w-full">
                                      <button
                                        onClick={() => handleAdminApprovalAction(booking.id, "Approved")}
                                        disabled={isProcessingApproval === booking.id}
                                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                                      >
                                        <span className="material-symbols-outlined text-[15px]">check</span>
                                        {isProcessingApproval === booking.id ? "Processing..." : "Approve"}
                                      </button>
                                      <button
                                        onClick={() => handleAdminApprovalAction(booking.id, "Rejected")}
                                        disabled={isProcessingApproval === booking.id}
                                        className="flex-1 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                                      >
                                        <span className="material-symbols-outlined text-[15px]">close</span>
                                        Reject
                                      </button>
                                    </div>
                                  ) : isApproved ? (
                                    <div className="flex items-center justify-between w-full">
                                      <a
                                        href={getWhatsAppShareLink(booking)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">share</span> WhatsApp Invite
                                      </a>
                                      <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="text-[11px] font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">cancel</span> Cancel Reservation
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-outline italic">
                                      Cancelled record retained for audit log history
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                </div>
              )}
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
                    <button onClick={() => setCapacityFilter("All")} className={`px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap ${capacityFilter === "All" ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}>All</button>
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

              <div className="flex flex-col xl:flex-row gap-6 h-full min-h-0 overflow-y-auto xl:overflow-hidden">
                <section className="flex-1 min-w-0 flex flex-col h-full bg-surface-container-lowest/30 rounded-2xl border border-outline-variant/10 overflow-hidden shadow-inner">
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

                <aside className="w-full xl:w-[420px] 2xl:w-[460px] shrink-0 flex flex-col h-full bg-surface-container-low/40 backdrop-blur-xl rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden relative">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
                  <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6 hide-scrollbar relative">
                    <div>
                      <h2 className="font-headline-lg text-2xl text-on-surface font-bold tracking-tight">Book {selectedRoom.name}</h2>
                      <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[18px]">event</span> Admin Priority Override Panel
                      </p>
                    </div>

                    <div className="relative flex flex-col gap-3">
                      {/* Active Selection Header */}
                      <div className="flex items-center justify-between bg-surface-container-high/50 p-2.5 rounded-xl border border-outline-variant/30">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                          <span className="font-title-md text-sm font-bold text-on-surface">
                            {selectedDayItem.monthName} {selectedDayItem.year}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                          {selectedDayItem.isToday ? "Today" : `+${selectedDayIndex} Day`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center px-1">
                        <span className="font-label-sm text-xs text-outline font-semibold uppercase tracking-wider">Select Day (6-Day Window)</span>
                        <span className="font-label-sm text-[11px] text-primary font-semibold">{getDateName(selectedDayItem)}</span>
                      </div>

                      {/* 6-Day Date Scroll Reel Starting from Today */}
                      <div className="grid grid-cols-6 gap-1.5 py-1">
                        {upcoming6Days.map((d) => {
                          const isActive = selectedDayIndex === d.index;
                          return (
                            <button 
                              key={d.dateKey}
                              onClick={() => setSelectedDayIndex(d.index)}
                              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all duration-200 shrink-0 ${
                                isActive 
                                  ? "bg-gradient-to-b from-primary-container/30 to-primary/20 border-2 border-primary text-primary shadow-lg font-bold scale-105"
                                  : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                              }`}
                            >
                              <span className="text-[9px] uppercase font-bold opacity-90">{d.isToday ? "TODAY" : d.dayName}</span>
                              <span className="font-title-md text-sm font-extrabold my-0.5">{d.dayNum}</span>
                              <span className="text-[9px] opacity-75">{d.monthName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="bg-surface-container-lowest/50 rounded-xl border border-outline-variant/20 p-4 shadow-inner flex flex-col gap-4">
                        {/* Morning Section */}
                        <div>
                          <h4 className="font-label-md text-xs text-outline mb-2 flex items-center gap-1.5 font-semibold">
                            <svg className="w-4 h-4 text-amber-400 shrink-0 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"></path></svg>
                            Morning (8:00 AM - 11:30 AM)
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedRoomSlots.filter(s => morningSlots.includes(s.time)).map((slot) => {
                              const isMaintenance = slot.status === "maintenance";
                              const isBooked = slot.status === "booked";
                              const isPassed = slot.status === "passed";

                              if (isMaintenance) {
                                return (<button key={slot.time} disabled className="py-2 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 font-label-md text-xs opacity-50 cursor-not-allowed">Maint</button>);
                              }
                              if (isPassed) {
                                return (
                                  <button key={slot.time} disabled className="py-2 px-1 rounded-lg border border-slate-800/80 bg-slate-900/50 text-slate-500 font-label-md text-xs cursor-not-allowed flex items-center justify-center gap-1 opacity-40 shadow-inner group relative" title="This time has passed for today">
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-slate-500">history</span>
                                  </button>
                                );
                              }
                              if (isBooked) {
                                return (
                                  <button key={slot.time} onClick={() => setSelectedTime(slot.time)} className={`py-2 px-1 rounded-lg border text-xs font-bold relative transition-all flex items-center justify-center gap-1 ${selectedTime === slot.time ? 'bg-gradient-to-r from-red-600 to-red-800 text-white border-red-500 scale-105 shadow-lg' : 'border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-900/40 cursor-pointer shadow-sm'}`} title={slot.booker ? `Booked by ${slot.booker}. Click to preempt (Admin Override).` : "Booked slot. Click to preempt."}>
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-red-400 font-bold">bolt</span>
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-surface animate-pulse"></span>
                                  </button>
                                );
                              }
                              const isSelected = selectedTime === slot.time;
                              return (
                                <button key={slot.time} onClick={() => setSelectedTime(slot.time)} className={`py-2 rounded-lg border text-xs font-semibold transition-all ${isSelected ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-lg font-bold scale-105 ring-2 ring-primary/40' : 'border-tertiary/30 bg-tertiary/10 text-tertiary hover:bg-tertiary/20'}`}>
                                  {slot.time}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Afternoon Section */}
                        <div>
                          <h4 className="font-label-md text-xs text-outline mb-2 flex items-center gap-1.5 font-semibold">
                            <svg className="w-4 h-4 text-orange-400 shrink-0 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42"></path></svg>
                            Afternoon (12:00 PM - 3:30 PM)
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedRoomSlots.filter(s => afternoonSlots.includes(s.time)).map((slot) => {
                              const isMaintenance = slot.status === "maintenance";
                              const isBooked = slot.status === "booked";
                              const isPassed = slot.status === "passed";

                              if (isMaintenance) {
                                return (<button key={slot.time} disabled className="py-2 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 font-label-md text-xs opacity-50 cursor-not-allowed">Maint</button>);
                              }
                              if (isPassed) {
                                return (
                                  <button key={slot.time} disabled className="py-2 px-1 rounded-lg border border-slate-800/80 bg-slate-900/50 text-slate-500 font-label-md text-xs cursor-not-allowed flex items-center justify-center gap-1 opacity-40 shadow-inner group relative" title="This time has passed for today">
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-slate-500">history</span>
                                  </button>
                                );
                              }
                              if (isBooked) {
                                return (
                                  <button key={slot.time} onClick={() => setSelectedTime(slot.time)} className={`py-2 px-1 rounded-lg border text-xs font-bold relative transition-all flex items-center justify-center gap-1 ${selectedTime === slot.time ? 'bg-gradient-to-r from-red-600 to-red-800 text-white border-red-500 scale-105 shadow-lg' : 'border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-900/40 cursor-pointer shadow-sm'}`} title={slot.booker ? `Booked by ${slot.booker}. Click to preempt (Admin Override).` : "Booked slot. Click to preempt."}>
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-red-400 font-bold">bolt</span>
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-surface animate-pulse"></span>
                                  </button>
                                );
                              }
                              const isSelected = selectedTime === slot.time;
                              return (
                                <button key={slot.time} onClick={() => setSelectedTime(slot.time)} className={`py-2 rounded-lg border text-xs font-semibold transition-all ${isSelected ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-lg font-bold scale-105 ring-2 ring-primary/40' : 'border-tertiary/30 bg-tertiary/10 text-tertiary hover:bg-tertiary/20'}`}>
                                  {slot.time}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Evening Section */}
                        <div>
                          <h4 className="font-label-md text-xs text-outline mb-2 flex items-center gap-1.5 font-semibold">
                            <svg className="w-4 h-4 text-indigo-400 shrink-0 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>
                            Evening (4:00 PM - 7:00 PM)
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedRoomSlots.filter(s => eveningSlots.includes(s.time)).map((slot) => {
                              const isMaintenance = slot.status === "maintenance";
                              const isBooked = slot.status === "booked";
                              const isPassed = slot.status === "passed";

                              if (isMaintenance) {
                                return (<button key={slot.time} disabled className="py-2 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 font-label-md text-xs opacity-50 cursor-not-allowed">Maint</button>);
                              }
                              if (isPassed) {
                                return (
                                  <button key={slot.time} disabled className="py-2 px-1 rounded-lg border border-slate-800/80 bg-slate-900/50 text-slate-500 font-label-md text-xs cursor-not-allowed flex items-center justify-center gap-1 opacity-40 shadow-inner group relative" title="This time has passed for today">
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-slate-500">history</span>
                                  </button>
                                );
                              }
                              if (isBooked) {
                                return (
                                  <button key={slot.time} onClick={() => setSelectedTime(slot.time)} className={`py-2 px-1 rounded-lg border text-xs font-bold relative transition-all flex items-center justify-center gap-1 ${selectedTime === slot.time ? 'bg-gradient-to-r from-red-600 to-red-800 text-white border-red-500 scale-105 shadow-lg' : 'border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-900/40 cursor-pointer shadow-sm'}`} title={slot.booker ? `Booked by ${slot.booker}. Click to preempt (Admin Override).` : "Booked slot. Click to preempt."}>
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-red-400 font-bold">bolt</span>
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-surface animate-pulse"></span>
                                  </button>
                                );
                              }
                              const isSelected = selectedTime === slot.time;
                              return (
                                <button key={slot.time} onClick={() => setSelectedTime(slot.time)} className={`py-2 rounded-lg border text-xs font-semibold transition-all ${isSelected ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-lg font-bold scale-105 ring-2 ring-primary/40' : 'border-tertiary/30 bg-tertiary/10 text-tertiary hover:bg-tertiary/20'}`}>
                                  {slot.time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-surface-container-low px-1 font-label-sm text-[10px] text-primary z-10 font-semibold">Meeting Title</label>
                        <input className="w-full bg-surface-container-highest/30 border border-primary/50 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-inner font-body-md text-sm transition-shadow" type="text" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)}/>
                      </div>

                      {/* Add Attendees with Dynamic Corporate User Autocomplete */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-surface-container-low px-1 font-label-sm text-[10px] text-primary z-10 font-semibold">Add Attendees</label>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-surface-container-highest/30 border border-primary/50 rounded-lg min-h-[46px] focus-within:ring-1 focus-within:ring-primary shadow-inner">
                          {attendees.map((email) => {
                            const corpUser = corporateUsers.find(u => u.email === email);
                            return (
                              <span key={email} className="inline-flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 text-xs px-2.5 py-1 rounded-md font-medium">
                                {corpUser ? corpUser.name : email}
                                <button type="button" onClick={() => setAttendees(attendees.filter(a => a !== email))} className="hover:text-red-400 text-xs font-bold ml-1">×</button>
                              </span>
                            );
                          })}
                          <input
                            type="text"
                            placeholder={attendees.length === 0 ? "Type name or email (e.g. Harshith)..." : "Add more..."}
                            className="bg-transparent text-xs text-on-surface focus:outline-none flex-1 min-w-[140px] py-1 px-1"
                            value={attendeeInput}
                            onChange={(e) => {
                              setAttendeeInput(e.target.value);
                              setShowAttendeeDropdown(true);
                            }}
                            onFocus={() => setShowAttendeeDropdown(true)}
                          />
                        </div>

                        {/* Dynamic Corporate User Autocomplete Dropdown */}
                        {showAttendeeDropdown && attendeeInput.trim().length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-outline-variant/10">
                            {corporateUsers.filter(u => 
                              !attendees.includes(u.email) && 
                              (u.name.toLowerCase().includes(attendeeInput.toLowerCase()) || u.email.toLowerCase().includes(attendeeInput.toLowerCase()))
                            ).length === 0 ? (
                              <div className="p-3 text-xs text-on-surface-variant text-center">No matching corporate users</div>
                            ) : (
                              corporateUsers.filter(u => 
                                !attendees.includes(u.email) && 
                                (u.name.toLowerCase().includes(attendeeInput.toLowerCase()) || u.email.toLowerCase().includes(attendeeInput.toLowerCase()))
                              ).map(u => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    setAttendees([...attendees, u.email]);
                                    setAttendeeInput("");
                                    setShowAttendeeDropdown(false);
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-primary/10 transition-colors flex items-center justify-between group"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-on-surface group-hover:text-primary">{u.name}</span>
                                    <span className="text-[10px] text-on-surface-variant">{u.email}</span>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-highest text-primary font-semibold uppercase">{u.role}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-t border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-md mt-auto shrink-0 z-10">
                    <div className="flex justify-between items-center mb-4 text-xs">
                      <span className="text-outline font-label-sm font-semibold">{selectedRoom.name}</span>
                      <span className="text-on-surface font-label-md font-semibold">{getDateName(selectedDayItem)} • {selectedTime}</span>
                    </div>
                    
                    <button 
                      onClick={handleConfirmBooking}
                      disabled={isSelectedTimePassed || isSubmitting}
                      className={`w-full py-4 rounded-xl text-white font-title-md text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                        isSelectedTimePassed || isSubmitting 
                          ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                          : isSlotAlreadyBooked 
                            ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-red-500/20" 
                            : "btn-gradient-primary"
                      }`}
                    >
                      {isSelectedTimePassed 
                        ? "Selected Time Has Passed" 
                        : isSubmitting 
                          ? "Processing..." 
                          : isSlotAlreadyBooked 
                            ? "Preempt Booking (Admin Priority)" 
                            : "Confirm Booking"}
                      {!isSubmitting && !isSelectedTimePassed && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                    </button>
                  </div>
                </aside>
              </div>
            </main>
          )}

          {/* VIEW: ROOM SUPPLIES & PROCUREMENT TRACKER */}
          {currentView === "supplies" && (
            <main className="p-stack-lg max-w-[1440px] mx-auto w-full flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-headline-lg text-3xl font-bold text-on-surface">Room Supplies & Procurement Control</h1>
                    <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/30">SysOps Admin Authority</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mt-1">Manage workspace equipment, missing hardware (HDMI, adapters, remotes), and procurement requests across all facility floors.</p>
                </div>
                <button 
                  onClick={() => {
                    if (rooms.length > 0) setNewSupplyRoomId(rooms[0].id);
                    setIsAddSupplyModalOpen(true);
                  }}
                  className="px-4 py-2.5 btn-gradient-primary text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span> Report Missing / Needed Item
                </button>
              </div>

              {/* Status Filter Tabs */}
              <div className="glass-panel rounded-xl p-3 mb-6 flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {["All", "Missing", "To Buy", "Purchased", "Replenished"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSupplyFilter(st)}
                      className={`px-3.5 py-1.5 rounded-lg font-label-md text-xs font-bold transition-all ${
                        supplyFilter === st
                          ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/40'
                      }`}
                    >
                      {st} ({st === 'All' ? supplies.length : supplies.filter(s => s.status.toLowerCase() === st.toLowerCase()).length})
                    </button>
                  ))}
                </div>
                <span className="text-xs text-outline font-semibold">
                  Showing {supplies.filter(s => supplyFilter === 'All' || s.status.toLowerCase() === supplyFilter.toLowerCase()).length} item(s)
                </span>
              </div>

              {/* Supplies Listing Table */}
              {supplies.filter(s => supplyFilter === 'All' || s.status.toLowerCase() === supplyFilter.toLowerCase()).length === 0 ? (
                <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-outline text-5xl">inventory_2</span>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">No Supply Reports Found</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm">All room equipment is fully stocked or no items match the selected filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {supplies
                    .filter(s => supplyFilter === 'All' || s.status.toLowerCase() === supplyFilter.toLowerCase())
                    .map((item) => {
                      const roomObj = rooms.find(r => r.id === item.roomId.toString()) || item.room;
                      const statusColor = 
                        item.status === 'Missing' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        item.status === 'To Buy' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        item.status === 'Purchased' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

                      return (
                        <div key={item.id} className="glass-panel rounded-2xl p-5 border border-outline-variant/20 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary"></div>
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-3 pt-1">
                              <div>
                                <span className="font-mono text-[10px] text-outline uppercase tracking-wider block">ITEM REPORT #{item.id}</span>
                                <h3 className="font-title-md text-base font-bold text-on-surface mt-0.5">{item.itemName}</h3>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                                {item.status}
                              </span>
                            </div>

                            <div className="bg-surface-container-low/50 border border-outline-variant/15 rounded-xl p-3 space-y-1.5 mb-3 text-xs">
                              <p className="text-on-surface font-semibold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-primary text-[16px]">meeting_room</span>
                                {roomObj?.name || `Room #${item.roomId}`} ({roomObj?.location || 'Facility Room'})
                              </p>
                              <p className="text-on-surface-variant flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-outline text-[16px]">format_list_numbered</span>
                                Quantity: <strong className="text-on-surface">{item.quantity}</strong>
                              </p>
                              <p className="text-on-surface-variant flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-outline text-[16px]">person</span>
                                Reported by: <span className="text-on-surface font-medium">{item.reportedBy}</span>
                              </p>
                              {item.notes && (
                                <p className="text-on-surface-variant italic mt-1 pt-1 border-t border-outline-variant/10">
                                  &ldquo;{item.notes}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick Action Status Cycle Buttons */}
                          <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              {item.status !== 'To Buy' && (
                                <button
                                  onClick={() => handleUpdateSupplyStatus(item.id, 'To Buy')}
                                  className="text-[11px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                                >
                                  Mark To Buy
                                </button>
                              )}
                              {item.status !== 'Purchased' && (
                                <button
                                  onClick={() => handleUpdateSupplyStatus(item.id, 'Purchased')}
                                  className="text-[11px] font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                                >
                                  Mark Purchased
                                </button>
                              )}
                              {item.status !== 'Replenished' && (
                                <button
                                  onClick={() => handleUpdateSupplyStatus(item.id, 'Replenished')}
                                  className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                                >
                                  Mark Restocked
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteSupply(item.id)}
                              className="p-1 text-outline hover:text-error hover:bg-error/10 rounded transition-colors"
                              title="Delete report"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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
              <div className="flex justify-between"><span className="text-outline">Date & Time:</span><span className="text-on-surface">{getDateName(selectedDayItem)} • {selectedTime}</span></div>
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
                <label className="text-xs font-semibold text-outline">Upload Photo or Image URL</label>
                <div className="flex flex-col gap-2 mt-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) setEditRoomImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-on-surface file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                  />
                  <input type="text" value={editRoomImage} onChange={(e) => setEditRoomImage(e.target.value)} className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" placeholder="Or paste image URL" />
                </div>
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
                <label className="text-xs font-semibold text-outline">Upload Photo or Image URL</label>
                <div className="flex flex-col gap-2 mt-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) setAddRoomImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-on-surface file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                  />
                  <input type="text" value={addRoomImage} onChange={(e) => setAddRoomImage(e.target.value)} className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface focus:outline-none focus:border-primary text-sm shadow-inner" placeholder="Or paste image URL" />
                </div>
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

      {/* Custom Meeting Extension Modal */}
      {isExtendModalOpen && targetExtendBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-5 relative">
            <div className="flex justify-between items-start border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-400 text-2xl">update</span>
                <div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface">Extend Room Reservation</h3>
                  <p className="text-xs text-on-surface-variant">{targetExtendBooking.roomName} • {targetExtendBooking.title}</p>
                </div>
              </div>
              <button onClick={() => setIsExtendModalOpen(false)} className="text-outline hover:text-on-surface text-lg font-bold">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider">Quick Presets</label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 60, 120].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setCustomExtensionMinutes(mins.toString())}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      customExtensionMinutes === mins.toString()
                        ? 'bg-amber-500 text-white border-amber-400 shadow-lg scale-105'
                        : 'bg-surface-container-highest/50 border-outline-variant/30 text-on-surface hover:border-amber-500/50'
                    }`}
                  >
                    +{mins >= 60 ? `${mins/60}h` : `${mins}m`}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <label className="absolute -top-2 left-3 bg-surface-container-high px-1 text-[10px] text-amber-400 font-semibold z-10">Custom Extension Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="9000"
                    placeholder="e.g. 45 or 150"
                    value={customExtensionMinutes}
                    onChange={(e) => setCustomExtensionMinutes(e.target.value)}
                    className="w-full bg-surface-container-highest/30 border border-amber-500/40 rounded-xl py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-amber-400 font-semibold shadow-inner"
                  />
                  <span className="text-xs font-semibold text-outline shrink-0">Minutes</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-300 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mt-1">
                ⚠️ <strong>Overrun Protection:</strong> Extending this meeting will recalculate spatial schedules and send automated email + in-app alerts to any conflicting upcoming teams.
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => setIsExtendModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-highest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteExtend}
                disabled={isExtending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isExtending ? 'Updating Schedule...' : 'Confirm Extension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supply / Missing Equipment Modal */}
      {isAddSupplyModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-outline-variant/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
              <h3 className="font-title-md text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
                Report Missing Room Equipment
              </h3>
              <button
                onClick={() => setIsAddSupplyModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-highest"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSupply();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Target Room</label>
                <select
                  value={newSupplyRoomId}
                  onChange={(e) => setNewSupplyRoomId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 px-3 text-on-surface font-medium outline-none focus:border-primary"
                  required
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} className="bg-surface-container-high text-on-surface">
                      {r.name} ({r.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Item / Equipment Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDMI Cable, Whiteboard Markers, Presenter Remote"
                  value={newSupplyItemName}
                  onChange={(e) => setNewSupplyItemName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 px-3 text-on-surface placeholder:text-outline outline-none focus:border-primary font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newSupplyQuantity}
                    onChange={(e) => setNewSupplyQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 px-3 text-on-surface outline-none focus:border-primary font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Current Status</label>
                  <select
                    value={newSupplyStatus}
                    onChange={(e) => setNewSupplyStatus(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 px-3 text-on-surface font-medium outline-none focus:border-primary"
                  >
                    <option value="Missing" className="bg-surface-container-high">Missing</option>
                    <option value="To Buy" className="bg-surface-container-high">To Buy</option>
                    <option value="Purchased" className="bg-surface-container-high">Purchased</option>
                    <option value="Replenished" className="bg-surface-container-high">Replenished</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Notes / Specifications (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs 3-meter USB-C to HDMI 2.0 cable for teleconference"
                  value={newSupplyNotes}
                  onChange={(e) => setNewSupplyNotes(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-on-surface placeholder:text-outline outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setIsAddSupplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSupply}
                  className="px-5 py-2 btn-gradient-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingSupply ? 'Saving Report...' : 'Log Supply Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Participants Modal */}
      {isEditMembersModalOpen && targetEditBooking && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="glass-panel border border-outline-variant/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">group_add</span>
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface">Edit Meeting Participants</h3>
                  <p className="text-[11px] text-on-surface-variant">{targetEditBooking.title} • {targetEditBooking.roomName}</p>
                </div>
              </div>
              <button onClick={() => setIsEditMembersModalOpen(false)} className="text-outline hover:text-on-surface text-lg font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Current Attendees</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl min-h-[50px]">
                  {editMembersList.length === 0 ? (
                    <span className="text-outline italic text-[11px]">No attendees added yet.</span>
                  ) : (
                    editMembersList.map((email) => (
                      <span key={email} className="inline-flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 text-xs px-2.5 py-1 rounded-md font-medium">
                        {email}
                        <button
                          type="button"
                          onClick={() => setEditMembersList(editMembersList.filter(e => e !== email))}
                          className="hover:text-red-400 font-bold ml-1 text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Add New Participant Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="e.g. colleague@company.com"
                    value={newMemberEmailInput}
                    onChange={(e) => setNewMemberEmailInput(e.target.value)}
                    className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 text-on-surface outline-none focus:border-primary font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newMemberEmailInput.trim() && !editMembersList.includes(newMemberEmailInput.trim())) {
                        setEditMembersList([...editMembersList, newMemberEmailInput.trim().toLowerCase()]);
                        setNewMemberEmailInput("");
                      }
                    }}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/15">
                <button
                  onClick={() => setIsEditMembersModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setBookings(bookings.map(b => b.id === targetEditBooking.id ? { ...b, attendees: editMembersList } : b));
                    setIsEditMembersModalOpen(false);
                  }}
                  className="px-5 py-2 btn-gradient-primary text-white font-bold rounded-xl shadow-lg"
                >
                  Save Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room History Modal */}
      {isRoomHistoryModalOpen && targetRoomHistory && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="glass-panel border border-outline-variant/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">history</span>
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface">{targetRoomHistory.name} - Room History</h3>
                  <p className="text-[11px] text-on-surface-variant">{targetRoomHistory.location} • Capacity: {targetRoomHistory.seats} Pax</p>
                </div>
              </div>
              <button onClick={() => setIsRoomHistoryModalOpen(false)} className="text-outline hover:text-on-surface text-lg font-bold">✕</button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-3">
                <h4 className="font-bold text-xs text-primary uppercase mb-2">Past & Current Bookings</h4>
                {bookings.filter(b => b.roomId === targetRoomHistory.id || b.roomName === targetRoomHistory.name).length === 0 ? (
                  <p className="text-xs text-outline italic">No booking history recorded for this room yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bookings.filter(b => b.roomId === targetRoomHistory.id || b.roomName === targetRoomHistory.name).map(b => (
                      <div key={b.id} className="p-2 bg-surface-container-high rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-on-surface block">{b.title}</span>
                          <span className="text-[10px] text-on-surface-variant">Date {b.date} • {b.time} (By: {b.booker})</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Confirmed
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-3">
                <h4 className="font-bold text-xs text-amber-400 uppercase mb-2">Equipment & Supply Reports</h4>
                {supplies.filter(s => s.roomId.toString() === targetRoomHistory.id).length === 0 ? (
                  <p className="text-xs text-outline italic">No equipment reports or missing item logs for this room.</p>
                ) : (
                  <div className="space-y-2">
                    {supplies.filter(s => s.roomId.toString() === targetRoomHistory.id).map(s => (
                      <div key={s.id} className="p-2 bg-surface-container-high rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-on-surface block">{s.itemName} (Qty: {s.quantity})</span>
                          <span className="text-[10px] text-on-surface-variant">Reported by {s.reportedBy}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant/15 mt-4">
              <button
                onClick={() => setIsRoomHistoryModalOpen(false)}
                className="px-5 py-2 btn-gradient-primary text-white font-bold text-xs rounded-xl"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
