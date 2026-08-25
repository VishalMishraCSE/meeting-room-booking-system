"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import PayswiffLogo from "@/components/PayswiffLogo";
import MeetingFeedbackModal from "@/components/MeetingFeedbackModal";
import FlashScreen from "@/components/FlashScreen";

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
  userId?: string;
  roomId: string;
  roomName: string;
  month?: number;
  monthName?: string;
  dayName?: string;
  year?: number;
  date: string;
  fullDateStr?: string;
  startTimeRaw?: string;
  endTimeRaw?: string;
  time: string;
  title: string;
  booker: string;
  bookerEmail?: string;
  attendees: string[];
  status: string;
  pendingExtensionMinutes?: number;
  extensionReason?: string;
  extensionStatus?: string;
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

export default function ManagerPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("Sarah Jenkins");
  const [currentView, setCurrentView] = useState<string>("bookings"); // "bookings" | "rooms"

  // Post-meeting 5-star feedback modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [targetFeedbackBooking, setTargetFeedbackBooking] = useState<any>(null);

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
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  // Real-World Date Generation from Today to End of Current Month
  const upcoming6Days = useMemo(() => {
    const list = [];
    const base = new Date();
    const currentYear = base.getFullYear();
    const currentMonth = base.getMonth();
    const todayDate = base.getDate();
    // Calculate total days remaining in the current month starting from today
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalDaysRemaining = lastDayOfMonth - todayDate + 1;

    for (let i = 0; i < totalDaysRemaining; i++) {
      const d = new Date(currentYear, currentMonth, todayDate + i);
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
  const [isRoomHistoryModalOpen, setIsRoomHistoryModalOpen] = useState<boolean>(false);
  const [targetRoomHistory, setTargetRoomHistory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Custom Extension Modal State
  const [isExtendModalOpen, setIsExtendModalOpen] = useState<boolean>(false);
  const [targetExtendBooking, setTargetExtendBooking] = useState<any>(null);
  const [customExtensionMinutes, setCustomExtensionMinutes] = useState<string>("30");
  const [isExtending, setIsExtending] = useState<boolean>(false);

  // Manager Approval Queue search and filtering states
  const [approvalSearchQuery, setApprovalSearchQuery] = useState<string>("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "vip" | "large">("all");

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
      // Fetch rooms, bookings, and pending approvals in parallel for faster page load
      const [roomsRes, bookingsRes, pendingRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/bookings"),
        fetch("/api/approvals"),
      ]);

      const [roomsData, bookingsData, pendingData] = await Promise.all([
        roomsRes.json(),
        bookingsRes.json(),
        pendingRes.json(),
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
        const activeBookings = bookingsData.filter((b: any) => b.status !== 'Cancelled');
        const mappedBookings = activeBookings.map((dbB: any) => {
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
            userId: dbB.userId?.toString() || (dbB.user?.id ? dbB.user.id.toString() : ""),
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
            booker: dbB.user?.name || "Unknown",
            bookerEmail: dbB.user?.email || "",
            attendees: dbB.attendees?.map((a: any) => a.email) || [],
            status: dbB.status,
            pendingExtensionMinutes: dbB.pendingExtensionMinutes,
            extensionReason: dbB.extensionReason,
            extensionStatus: dbB.extensionStatus
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

      // Check for completed meetings needing feedback
      fetch("/api/feedback?pendingOnly=true").then(res => res.json()).then(data => {
        if (data && Array.isArray(data.pendingFeedbacks) && data.pendingFeedbacks.length > 0) {
          const first = data.pendingFeedbacks[0];
          setTargetFeedbackBooking({
            id: first.id,
            title: first.title,
            roomName: first.room?.name || "Meeting Room",
            roomId: first.roomId,
            date: first.startTime ? new Date(first.startTime).toLocaleDateString() : "",
          });
          setIsFeedbackModalOpen(true);
        }
      }).catch(e => console.error("Failed to check feedback requests:", e));

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

      // Fetch room supplies & missing equipment
      fetch("/api/supplies").then(res => res.json()).then(data => {
        if (Array.isArray(data)) setSupplies(data);
      }).catch(e => console.error("Failed to fetch room supplies:", e));
    } catch (err) {
      console.error("Failed to fetch manager data:", err);
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

  const getWhatsAppShareLink = (booking: any) => {
    const attendeesStr = booking.attendees && booking.attendees.length > 0 
      ? booking.attendees.join(', ') 
      : 'All Team Members';
      
    const text = 
`🏢 *PAYSWIFF MEETING ROOM: OFFICIAL MEETING INVITATION*

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

  const handleRebookRoom = (booking: any) => {
    setSelectedRoomId(booking.roomId.toString());
    if (booking.title) setMeetingTitle(booking.title);
    setCurrentView("rooms");
  };

  // Initialize and Toggle Theme & Session Guard
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedUserId = localStorage.getItem("userId");
    if (!storedRole || storedRole !== "manager") {
      router.replace("/login");
      return;
    }
    setLoading(false);
    if (storedUserId) setUserId(storedUserId);
    if (storedEmail) setUserEmail(storedEmail);
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

  // If current selected time is passed/maintenance/booked on active day, select first available slot
  useEffect(() => {
    const isCurrentTimeUnavailable = selectedRoomSlots.some(
      s => s.time === selectedTime && (s.status === "passed" || s.status === "maintenance" || s.status === "booked")
    );
    if (isCurrentTimeUnavailable) {
      const firstAvailable = selectedRoomSlots.find(s => s.status === "available");
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

  const getEndTime = (timeStr: string) => {
    const { hours, minutes } = parseSlotTime(timeStr);
    const end = new Date(selectedYear, selectedMonth, parseInt(selectedDate), hours, minutes + 30);
    let endHours = end.getHours();
    const endMins = end.getMinutes();
    const endAmPm = endHours >= 12 ? 'PM' : 'AM';
    endHours = endHours % 12;
    endHours = endHours ? endHours : 12;
    const endMinStr = endMins < 10 ? `0${endMins}` : `${endMins}`;
    return `${endHours}:${endMinStr} ${endAmPm}`;
  };

  // Booking confirm handler
  const handleConfirmBooking = async () => {
    if (isSubmitting) return;

    if (selectedRoom.status === "maintenance") {
      alert("This room is currently under maintenance and cannot be booked.");
      return;
    }

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

    if (isBooked) {
      alert("This slot is already booked. Please select an available slot.");
      return;
    }

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

  // Manager Approval Workflow Handlers
  const handleApproveRequest = async (reqId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
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
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    if (isSubmitting) return;
    const reason = prompt("Enter reason for rejection:", "Schedule conflict or priority adjustment");
    if (reason === null) return; // user cancelled prompt
    setIsSubmitting(true);

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
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="flex-1 flex overflow-hidden bg-background text-on-surface relative">
      {/* Guaranteed Full Splash Animation Overlay */}
      {showSplash && (
        <FlashScreen
          show={showSplash}
          message="Authenticating Manager Portal..."
          subMessage="Loading Space Allocations & Approvals..."
          minDuration={3200}
          onFinished={() => setShowSplash(false)}
        />
      )}

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
              onClick={() => setCurrentView("active_reservations")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 font-label-md text-label-md group hover:scale-105 active:scale-95 ${
                currentView === "active_reservations" 
                  ? 'text-primary font-bold bg-primary/10 shadow-[inset_0_0_10px_rgba(128,131,255,0.1)] border border-primary/20' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={currentView === "active_reservations" ? { fontVariationSettings: "'FILL' 1" } : {}}>update</span>
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
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors flex items-center justify-center cursor-pointer"
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
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-high/60 px-3 py-1 rounded-full border border-outline-variant/20 hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Operations Manager Authority
            </span>
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
                Manager
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="flex-1 mt-0 md:mt-20 overflow-y-auto">
          
          {/* VIEW: ACTIVE RESERVATIONS & EXTENSION */}
          {currentView === "active_reservations" && (() => {
            const isBookingMine = (b: any) => {
              if (userId && b.userId && b.userId.toString() === userId.toString()) return true;
              if (userEmail && b.bookerEmail && b.bookerEmail.toLowerCase() === userEmail.toLowerCase()) return true;
              if (userName && b.booker && b.booker.toLowerCase().includes(userName.toLowerCase())) return true;
              return false;
            };
            const myBookings = bookings.filter(isBookingMine);

            return (
            <main className="p-stack-lg max-w-[1440px] mx-auto w-full flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-2">
                <div>
                  <h1 className="font-headline-lg text-3xl font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">history</span>
                    My Booking History
                  </h1>
                  <p className="font-body-md text-on-surface-variant mt-1">Confirmed workspace room schedules booked by you with meeting extension control.</p>
                </div>
              </div>

              {myBookings.length === 0 ? (
                <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-outline text-5xl">event_busy</span>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">No Reservations Found</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm">You do not have any confirmed room reservations in the system yet.</p>
                </div>
              ) : (
                <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-outline-variant/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                          <th className="p-4 font-semibold">Booking ID</th>
                          <th className="p-4 font-semibold">Room Name</th>
                          <th className="p-4 font-semibold">Schedule</th>
                          <th className="p-4 font-semibold">Title</th>
                          <th className="p-4 font-semibold">Status</th>
                          <th className="p-4 font-semibold">Reserved By</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-sm divide-y divide-white/5">
                        {myBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono text-xs text-outline">{booking.id}</td>
                            <td className="p-4 font-bold text-on-surface">{booking.roomName}</td>
                            <td className="p-4 text-xs font-semibold text-on-surface-variant">
                              Date {booking.date} · {booking.time}
                            </td>
                            <td className="p-4 text-on-surface-variant font-medium">{booking.title}</td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1 items-start">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  Approved
                                </span>
                                {booking.extensionStatus === "Pending" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/40 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    +Ext ({booking.pendingExtensionMinutes || 30}m) Pending Admin
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-container-high border border-outline-variant/20 text-xs font-semibold text-on-surface">
                                {booking.booker}
                              </span>
                            </td>
                            <td className="p-4 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRebookRoom(booking)}
                                className="text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-3 py-1.5 rounded-lg border border-red-500/30 transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                title={`Rebook ${booking.roomName}`}
                              >
                                <span className="material-symbols-outlined text-[15px]">event_repeat</span> Rebook
                              </button>
                              <button
                                onClick={() => {
                                  setTargetFeedbackBooking({
                                    id: booking.id,
                                    title: booking.title,
                                    roomName: booking.roomName,
                                    roomId: booking.roomId,
                                  });
                                  setIsFeedbackModalOpen(true);
                                }}
                                className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1.5 rounded-lg border border-amber-500/40 transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                title="Give feedback & 5-star rating for this room"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                Rate
                              </button>
                              <button
                                onClick={() => {
                                  const r = rooms.find(room => room.id === booking.roomId || room.name === booking.roomName);
                                  setTargetRoomHistory(r || { id: booking.roomId, name: booking.roomName, location: "Corporate Floor", seats: 10 });
                                  setIsRoomHistoryModalOpen(true);
                                }}
                                className="text-xs font-bold text-primary bg-primary/15 hover:bg-primary/25 px-2.5 py-1.5 rounded-lg border border-primary/30 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                                title="View room utilization history and audit log"
                              >
                                <span className="material-symbols-outlined text-[14px]">history</span> History
                              </button>
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
                                onClick={() => handleOpenExtendModal(booking)}
                                className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 rounded-lg border border-amber-500/40 transition-all flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                title="Extend meeting duration & notify upcoming teams"
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
            );
          })()}

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
                            disabled={isSubmitting}
                            className={`bg-transparent text-error hover:bg-error/10 font-semibold text-xs py-2 px-4 rounded-lg transition-colors border border-error/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isSubmitting}
                            className={`bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs py-2 px-4 rounded-lg transition-all flex items-center gap-1 shadow-md hover:shadow-indigo-500/10 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span> {isSubmitting ? 'Processing...' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </main>
          )}

          {/* VIEW: ROOM SUPPLIES & EQUIPMENT TRACKER */}
          {currentView === "supplies" && (
            <main className="p-stack-lg max-w-[1440px] mx-auto w-full flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-headline-lg text-3xl font-bold text-on-surface">Room Supplies & Missing Equipment</h1>
                    <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/30">Manager Access Only</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mt-1">Track and procure missing room equipment (HDMI cables, markers, adapters, remotes).</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setTargetFeedbackBooking({
                        id: "direct",
                        title: "Facility Review",
                        roomName: rooms.length > 0 ? rooms[0].name : "Meeting Room",
                        roomId: rooms.length > 0 ? rooms[0].id : 1,
                      });
                      setIsFeedbackModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Give Room Feedback
                  </button>
                  <button 
                    onClick={() => {
                      if (rooms.length > 0) setNewSupplyRoomId(rooms[0].id);
                      setIsAddSupplyModalOpen(true);
                    }}
                    className="px-4 py-2.5 btn-gradient-primary text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span> Report Missing / Needed Item
                  </button>
                </div>
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

                          {/* Read-only Admin Procurement Note */}
                          <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-between text-[11px] text-on-surface-variant">
                            <span className="flex items-center gap-1 text-outline font-medium">
                              <span className="material-symbols-outlined text-[14px]">lock</span> Procurement & restocking managed by Admin
                            </span>
                            <span className="font-mono text-[10px] text-outline">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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
                      onClick={() => setCapacityFilter("All")}
                      className={`px-3 py-1.5 rounded-full border transition-colors font-label-md text-xs whitespace-nowrap ${capacityFilter === "All" ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}
                    >
                      All
                    </button>
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
              <div className="flex flex-col xl:flex-row gap-6 h-full min-h-0 overflow-y-auto xl:overflow-hidden">
                <section className="flex-1 min-w-0 flex flex-col h-full bg-surface-container-lowest/30 rounded-2xl border border-outline-variant/10 overflow-hidden shadow-inner">
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
                <aside className="w-full xl:w-[420px] 2xl:w-[460px] shrink-0 flex flex-col h-full bg-surface-container-low/40 backdrop-blur-xl rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden relative">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
                  <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6 hide-scrollbar relative">
                    <div>
                      <h2 className="font-headline-lg text-2xl text-on-surface font-bold tracking-tight">Book {selectedRoom.name}</h2>
                      <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[18px]">event</span> Select date and time ({upcoming6Days.length} Days Available This Month)
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
                          {selectedDayItem.isToday ? "Today" : `+${selectedDayIndex} Days`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center px-1">
                        <span className="font-label-sm text-xs text-outline font-semibold uppercase tracking-wider">Select Day ({upcoming6Days.length} Days in {selectedDayItem.monthName})</span>
                        <span className="font-label-sm text-[11px] text-primary font-semibold">{getDateName(selectedDayItem)}</span>
                      </div>

                      {/* Date Scroll Reel Starting from Today till End of Month */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
                        {upcoming6Days.map((d) => {
                          const isActive = selectedDayIndex === d.index;
                          return (
                            <button 
                              key={d.dateKey}
                              onClick={() => setSelectedDayIndex(d.index)}
                              className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border transition-all duration-200 shrink-0 min-w-[60px] cursor-pointer ${
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
                                  <button key={slot.time} disabled className="py-2 px-1 rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-400 font-label-md text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1 opacity-50 shadow-inner group relative" title={slot.booker ? `Reserved by ${slot.booker}` : "Reserved slot"}>
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-slate-400 font-bold">lock</span>
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
                                  <button key={slot.time} disabled className="py-2 px-1 rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-400 font-label-md text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1 opacity-50 shadow-inner group relative" title={slot.booker ? `Reserved by ${slot.booker}` : "Reserved slot"}>
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-slate-400 font-bold">lock</span>
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
                                  <button key={slot.time} disabled className="py-2 px-1 rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-400 font-label-md text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1 opacity-50 shadow-inner group relative" title={slot.booker ? `Reserved by ${slot.booker}` : "Reserved slot"}>
                                    <span className="line-through">{slot.time}</span>
                                    <span className="material-symbols-outlined text-[12px] text-slate-400 font-bold">lock</span>
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
                        <input 
                          className="w-full bg-surface-container-highest/30 border border-primary/50 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-inner font-body-md text-sm transition-shadow" 
                          type="text" 
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                        />
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
                      <span className="text-on-surface font-label-md font-semibold">
                        {getDateName(selectedDayItem)} • {selectedTime} - {getEndTime(selectedTime)}
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleConfirmBooking}
                      disabled={isSelectedRoomMaintenance || isSelectedTimePassed || isSubmitting}
                      className={`w-full py-4 rounded-xl text-white font-title-md text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                        isSelectedRoomMaintenance || isSelectedTimePassed || isSubmitting
                          ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                          : "btn-gradient-primary"
                      }`}
                    >
                      {isSelectedRoomMaintenance 
                        ? "Room Under Maintenance" 
                        : isSelectedTimePassed
                          ? "Selected Time Has Passed"
                          : isSubmitting ? "Submitting..." : "Confirm Booking"}
                      {!isSubmitting && !isSelectedRoomMaintenance && !isSelectedTimePassed && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
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
              <div className="flex justify-between"><span className="text-outline">Date & Time:</span><span className="text-on-surface">{getDateName(selectedDayItem)} • {selectedTime} - {getEndTime(selectedTime)}</span></div>
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
                🔒 <strong>Admin Authorization Required:</strong> Meeting extensions must be approved by the System Admin. Submitting this will alert the Admin for approval.
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
                {isExtending ? 'Submitting to Admin...' : 'Request Admin Approval'}
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
                    value={newSupplyQuantity}
                    onChange={(e) => setNewSupplyQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 px-3 text-on-surface outline-none focus:border-primary font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Initial Status</label>
                  <select
                    value={newSupplyStatus}
                    onChange={(e) => setNewSupplyStatus(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 px-3 text-on-surface font-medium outline-none focus:border-primary"
                  >
                    <option value="Missing">Missing</option>
                    <option value="To Buy">To Buy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Notes / Context (Optional)</label>
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

      {/* Room History Audit Log Modal */}
      {isRoomHistoryModalOpen && targetRoomHistory && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="glass-panel border border-outline-variant/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">history</span>
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface">{targetRoomHistory.name} - Room Audit History</h3>
                  <p className="text-[11px] text-on-surface-variant">{targetRoomHistory.location} • Capacity: {targetRoomHistory.seats || 10} Pax</p>
                </div>
              </div>
              <button onClick={() => setIsRoomHistoryModalOpen(false)} className="text-outline hover:text-on-surface text-lg font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Chronological Utilization & Event Logs</div>
              {bookings.filter(b => b.roomId === targetRoomHistory.id || b.roomName === targetRoomHistory.name).length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant bg-surface-container-low/50 rounded-xl border border-outline-variant/20 italic">
                  No historical bookings or operations logged for this room yet.
                </div>
              ) : (
                bookings.filter(b => b.roomId === targetRoomHistory.id || b.roomName === targetRoomHistory.name).map(b => (
                  <div key={b.id} className="p-3 bg-surface-container-low/60 border border-outline-variant/20 rounded-xl flex flex-col gap-1.5 hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-on-surface text-xs">{b.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-bold">{b.status}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>👤 Reserved By: {b.booker}</span>
                      <span>📅 {b.date} • {b.time}</span>
                    </div>
                    <div className="text-[10px] text-outline font-mono pt-1 border-t border-outline-variant/10 flex justify-between">
                      <span>Event Logged: SysOps DB Engine</span>
                      <span>Status: Protected</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/15 mt-4">
              <button
                onClick={() => setIsRoomHistoryModalOpen(false)}
                className="px-5 py-2 btn-gradient-primary text-white font-bold rounded-xl shadow-lg text-xs"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Meeting 5-Star Feedback Modal */}
      <MeetingFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        booking={targetFeedbackBooking}
        onFeedbackSubmitted={fetchData}
      />
    </div>
  );
}
