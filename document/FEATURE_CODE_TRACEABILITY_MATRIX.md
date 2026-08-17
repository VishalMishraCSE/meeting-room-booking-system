# 📋 Lumina Reserve: Feature-to-Code Traceability Matrix

> **Purpose**: Detailed technical mapping connecting every user feature to its exact frontend component lines, backend API logic, code snippets, and MySQL database tables.

---

## Feature 1: User Authentication (Sign In & Sign Up)

### 📝 Plain-English Description
Allows users to log in or create a new account. Normalizes email input (email.trim().toLowerCase()) to prevent mobile auto-capitalization errors. Encrypts passwords using bcrypt.hashSync(password, 10) before MySQL database insertion.

### 💻 Frontend File & Location
`frontend/src/app/login/page.tsx` (Lines 40 - 130)

### ⚙️ Backend API Route & Location
`frontend/src/app/api/auth/login/route.ts (Lines 5-61) & frontend/src/app/api/auth/register/route.ts (Lines 5-64)`

### ⚡ Step-by-Step Backend Logic Flow
1. Extract email and password from request payload.
2. Apply email.trim().toLowerCase() normalization.
3. Query MySQL via Prisma: prisma.user.findFirst({ where: { email } }).
4. Compare password hash using bcrypt.compareSync(password, user.passwordHash).
5. Set HTTP-only session cookie 'userSession' with sameSite: 'lax' for smooth cross-device navigation.

### 🗄️ MySQL Database Table & Schema
`users (id, name, email, passwordHash, role, isActive)`

### 🔑 Key Code Snippet Highlight
```typescript
const normalizedEmail = email.trim().toLowerCase();
const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });
if (!user || !bcrypt.compareSync(password, user.passwordHash)) { ... }
```

---

## Feature 2: All-Rooms Explorer & Filter Engine

### 📝 Plain-English Description
Displays all meeting rooms by default when the application opens (capacityFilter = 'All'). Users can search by room name or floor location, and filter by seat capacity (All, 2-5, 6-12, 12+) or room amenities.

### 💻 Frontend File & Location
`frontend/src/app/page.tsx (Lines 120-240), frontend/src/app/admin/page.tsx (Lines 180-350), frontend/src/app/manager/page.tsx (Lines 190-360)` (Lines 120 - 360)

### ⚙️ Backend API Route & Location
`frontend/src/app/api/rooms/route.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. GET handler queries MySQL database via Prisma.
2. Includes relational joins: include: { floor: true, amenities: true, photos: true }.
3. Returns full room list sorted by room number.
4. Client component applies instant capacity pills filter and live search query matching.

### 🗄️ MySQL Database Table & Schema
`rooms, room_amenities, floors`

### 🔑 Key Code Snippet Highlight
```typescript
const rooms = await prisma.room.findMany({
  include: { floor: true, amenities: true, photos: true },
  orderBy: { roomNumber: 'asc' }
});
```

---

## Feature 3: Direct Computer Photo File Upload (<input type='file'>)

### 📝 Plain-English Description
Enables Admins to select image files directly from their local computer hard drive using a file picker input (<input type='file'>) when creating or editing meeting rooms.

### 💻 Frontend File & Location
`frontend/src/app/admin/page.tsx` (Lines 385 - 428 & Lines 550 - 580)

### ⚙️ Backend API Route & Location
`frontend/src/app/api/rooms/route.ts & frontend/src/app/api/rooms/[id]/route.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. Client component reads file via FileReader.readAsDataURL(file).
2. Converts local file into high-resolution Base64 Data URL string.
3. POST/PUT request sends heroImageUrl to API route.
4. Backend persists Base64 string into MySQL rooms table annotated @db.Text in Prisma schema.

### 🗄️ MySQL Database Table & Schema
`rooms.heroImageUrl (@db.Text in schema.prisma / TEXT in MySQL DDL)`

### 🔑 Key Code Snippet Highlight
```typescript
const reader = new FileReader();
reader.onloadend = () => setAddRoomImage(reader.result as string);
reader.readAsDataURL(file);
```

---

## Feature 4: Conflict-Free Real-Time Room Booking (Double Booking Guard)

### 📝 Plain-English Description
Guarantees zero double bookings by validating time slots before creation. If two employees attempt to reserve the same room at the same time, the second request is rejected.

### 💻 Frontend File & Location
`frontend/src/app/page.tsx` (Lines 310 - 420)

### ⚙️ Backend API Route & Location
`frontend/src/app/api/bookings/route.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. Backend constructs time overlap filter:
   OR: [
     { startTime: { lte: start }, endTime: { gt: start } },
     { startTime: { lt: end }, endTime: { gte: end } },
     { startTime: { gte: start }, endTime: { lte: end } }
   ]
2. Checks if status is in ['Confirmed', 'Pending'].
3. If conflict exists and user is not Admin with preempt flag, returns HTTP 409 Conflict error.

### 🗄️ MySQL Database Table & Schema
`bookings (roomId, startTime, endTime, status)`

### 🔑 Key Code Snippet Highlight
```typescript
const conflict = await prisma.booking.findFirst({
  where: {
    roomId: roomParsedId,
    status: { in: ['Confirmed', 'Pending'] },
    OR: [ { startTime: { lte: start }, endTime: { gt: start } }, ... ]
  }
});
```

---

## Feature 5: 15-Minute Auto-Approval Engine & Manager Queue

### 📝 Plain-English Description
Employee reservation requests start in 'Pending' status with a 15-minute auto-approval buffer badge. If a manager does not manually decline within 15 minutes, the system treats the request as auto-approved so employees are never delayed.

### 💻 Frontend File & Location
`frontend/src/app/manager/page.tsx & frontend/src/app/admin/page.tsx` (Lines 980 - 1060)

### ⚙️ Backend API Route & Location
`frontend/src/app/api/approvals/route.ts & frontend/src/app/api/bookings/route.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. Employee bookings are assigned initialStatus = 'Pending'.
2. Manager Approval Queue fetches all Pending requests.
3. Clicking 'Approve' updates status to 'Confirmed' via PATCH /api/approvals.
4. Client timer badge evaluates creation timestamp + 15m window to display 'Auto-Approved (15m Window)'.

### 🗄️ MySQL Database Table & Schema
`bookings.status ('Pending', 'Confirmed', 'Cancelled')`

### 🔑 Key Code Snippet Highlight
```typescript
const initialStatus = user.role === 'employee' ? 'Pending' : 'Confirmed';
await prisma.booking.create({ data: { status: initialStatus, ... } });
```

---

## Feature 6: Multi-Channel WhatsApp Automated Broadcasting (Green API)

### 📝 Plain-English Description
Dispatches formatted WhatsApp invitations containing meeting title, room location, scheduled time, attendees, and a direct 1-Click Google Calendar link to designated phone numbers.

### 💻 Frontend File & Location
`frontend/src/app/admin/page.tsx, frontend/src/app/page.tsx, frontend/src/app/manager/page.tsx (getWhatsAppShareLink)` (Lines 175 - 195)

### ⚙️ Backend API Route & Location
`frontend/src/lib/whatsapp.ts & frontend/src/app/api/bookings/route.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. On booking creation, POST /api/bookings calls broadcastWhatsAppBookingNotification(waText).
2. Module iterates over designated chat numbers: ['919652456879', '919949584392', '918317695769'].
3. Dispatches HTTP POST to Green API endpoint (https://7107.api.greenapi.com/waInstance710722711905/sendMessage/01ff7b...).
4. Green API delivers WhatsApp text directly to mobile phones.

### 🗄️ MySQL Database Table & Schema
`Green API Service (Instance 710722711905)`

### 🔑 Key Code Snippet Highlight
```typescript
export const DESIGNATED_WHATSAPP_CHATS = ['919652456879', '919949584392', '918317695769'];
await fetch(`${baseUrl}/waInstance${instanceId}/sendMessage/${apiToken}`, { body: JSON.stringify({ chatId, message }) });
```

---

## Feature 7: Real Gmail SMTP Calendar Email Notifications (Nodemailer)

### 📝 Plain-English Description
Sends real HTML email confirmations for bookings, approvals, and cancellations directly to attendee email inboxes.

### 💻 Frontend File & Location
`Triggered automatically upon booking creation or manager approval.` (Asynchronous background trigger)

### ⚙️ Backend API Route & Location
`frontend/src/lib/mail.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. Configures Nodemailer transport with Gmail SMTP (smtp.gmail.com:587, meetingroom9252@gmail.com).
2. Constructs HTML email body featuring '📅 Add to Google Calendar' button.
3. Generates standard iCalendar (.ics) attachment with VEVENT component.
4. Sends email asynchronously without blocking HTTP response.

### 🗄️ MySQL Database Table & Schema
`Nodemailer SMTP Transporter`

### 🔑 Key Code Snippet Highlight
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 587, auth: { user: 'meetingroom9252@gmail.com', pass: 'ncgb hxqj swzb zgbu' }
});
```

---

## Feature 8: Edit Participants on Active Meetings

### 📝 Plain-English Description
Allows Managers and Admins to modify meeting attendee lists on active reservations without having to cancel and recreate the meeting.

### 💻 Frontend File & Location
`frontend/src/app/admin/page.tsx & frontend/src/app/manager/page.tsx (handleOpenEditMembers)` (Lines 181 - 187 & Lines 1058 - 1064)

### ⚙️ Backend API Route & Location
`frontend/src/app/api/bookings/[id]/route.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. PATCH handler receives updated attendees array.
2. Deletes existing attendee records for bookingId.
3. Re-creates new attendee entries in attendees table.
4. Logs audit entry in booking_histories table (action: 'MembersUpdated').

### 🗄️ MySQL Database Table & Schema
`attendees (id, bookingId, email, status)`

### 🔑 Key Code Snippet Highlight
```typescript
await prisma.attendee.deleteMany({ where: { bookingId: parsedId } });
await prisma.attendee.createMany({ data: validAttendees.map(email => ({ bookingId: parsedId, email, status: 'Pending' })) });
```

---

## Feature 9: Room-Specific Audit History & Global System Logs

### 📝 Plain-English Description
Provides a dedicated audit history modal for every room, displaying a chronological log of all past bookings, status changes, cancellations, and participant edits.

### 💻 Frontend File & Location
`frontend/src/app/admin/page.tsx & frontend/src/app/manager/page.tsx (handleOpenRoomHistory)` (Lines 188 - 192)

### ⚙️ Backend API Route & Location
`frontend/src/app/api/rooms/[id]/history/route.ts & frontend/src/app/api/logs/route.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. GET handler accepts roomId.
2. Queries booking_histories joined with bookings where roomId = targetId.
3. Returns chronological timeline of audit actions (Created, Preempted, Cancelled, MembersUpdated).
4. Displays audit entries in modal with timestamp and operator details.

### 🗄️ MySQL Database Table & Schema
`booking_histories (id, bookingId, action, performedBy, details, createdAt)`

### 🔑 Key Code Snippet Highlight
```typescript
const history = await prisma.bookingHistory.findMany({
  where: { booking: { roomId: parsedId } },
  include: { booking: true },
  orderBy: { createdAt: 'desc' }
});
```

---

## Feature 10: Room Supplies & Maintenance Restock Tracking

### 📝 Plain-English Description
Tracks facility equipment reports (missing HDMI cables, whiteboard markers, remotes). Managers cycle statuses: Missing -> To Buy -> Purchased -> Restocked.

### 💻 Frontend File & Location
`frontend/src/app/admin/page.tsx & frontend/src/app/manager/page.tsx` (Lines 154 - 164 & Lines 1180 - 1220)

### ⚙️ Backend API Route & Location
`frontend/src/app/api/supplies/route.ts & frontend/src/app/api/supplies/[id]/route.ts`

### ⚡ Step-by-Step Backend Logic Flow
1. GET/POST/PATCH handlers manage equipment records in room_supplies table.
2. Updating status modifies record in MySQL database.
3. UI updates badge colors dynamically (Red for Missing, Amber for To Buy, Blue for Purchased, Green for Restocked).

### 🗄️ MySQL Database Table & Schema
`room_supplies (id, roomId, itemName, quantity, status, notes)`

### 🔑 Key Code Snippet Highlight
```typescript
const updatedSupply = await prisma.roomSupply.update({
  where: { id: parsedId },
  data: { status: newStatus }
});
```

---

