# 📊 Lumina Reserve: Presentation Slide Deck Guide (18 Slides)

> **Purpose**: Use this slide-by-slide structure to build your PowerPoint (`.pptx`) or Google Slides presentation for management.  
> **Screenshot Instructions**: Every slide includes a highlighted `📸 [INSERT SCREENSHOT HERE]` placeholder telling you exactly which screenshot to paste!

---

## Slide 1: Title Slide & Project Overview
* **Title**: Lumina Reserve: Corporate Spatial Management Suite
* **Subtitle**: Intelligent Meeting Room Reservation & Workplace Resource System
* **Presenter**: Development & Operations Team
* **Key Theme**: Streamlining office room bookings with strict SQL database security and automated notifications.
* **📸 [INSERT SCREENSHOT HERE: Title slide image / App Logo or Homepage overview]**

---

## Slide 2: Executive Business Impact & Problem Statement
* **The Problem**:
  * Double bookings causing employee friction and meeting delays.
  * Managers tied up in manual approval bottlenecks.
  * Lack of room audit history and equipment maintenance tracking.
* **The Solution**:
  * Real-time slot locking with zero conflicts.
  * 15-minute auto-approval window.
  * 1-click WhatsApp sharing & automated Gmail calendar invitations.
* **📸 [INSERT SCREENSHOT HERE: Employee Dashboard Overview showing active reservations]**

---

## Slide 3: Simple Architecture Overview
* **Database Engine**: Relational SQL (MySQL 8.0 InnoDB Engine) for enterprise data security.
* **Web Frontend**: Modern interactive Web Application with dark/light themes.
* **Email Engine**: Real Gmail SMTP integration for `.ics` calendar invites.
* **📸 [INSERT SCREENSHOT HERE: Visual diagram of User -> Web App -> MySQL Database -> Gmail/WhatsApp]**

---

## Slide 4: MySQL Database Structure & EER Diagram
* **Relational Integrity**: 12 structured tables linked with strict foreign key constraints.
* **EER Diagram Capability**: Press `Ctrl + R` in MySQL Workbench to auto-generate the visual relational model.
* **Key Tables**: `users`, `rooms`, `bookings`, `attendees`, `booking_histories`, `room_supplies`.
* **📸 [INSERT SCREENSHOT HERE: MySQL Workbench EER Diagram generated via Ctrl + R]**

---

## Slide 5: Sign In & Sign Up Authentication Portal
* **Sign In Tab**: Secure corporate login auto-trimming email inputs and hashing passwords with `bcrypt`.
* **Sign Up Tab**: New employee/manager account registration saving directly into MySQL database.
* **Role Redirection**: Automatic portal routing based on user role (Employee, Manager, Admin).
* **📸 [INSERT SCREENSHOT HERE: Login & Registration Page with Sign In / Sign Up tabs]**

---

## Slide 6: All-Rooms Explorer & Visual Cards
* **Default Visibility**: All corporate meeting rooms are displayed immediately upon page load.
* **Search Bar**: Real-time room or floor location search (e.g. `"Floor 4"` or `"Helios"`).
* **Capacity & Amenity Filters**: Instant filtering by seats (`All`, `2-5`, `6-12`, `12+`) or features (`Video Conf`, `Whiteboard`, `TV`).
* **📸 [INSERT SCREENSHOT HERE: Room Explorer grid displaying all room cards]**

---

## Slide 7: Direct Room Photo File Upload
* **Computer File Picker**: Admins can click **Choose File** to pick room images directly from their hard drive.
* **Base64 Storage**: Converts images into high-resolution Data URLs saved in the MySQL `rooms` table.
* **Fallback Link Support**: Web image URLs are also fully supported.
* **📸 [INSERT SCREENSHOT HERE: Add/Edit Room Modal showing the 'Choose File' button]**

---

## Slide 8: Real-Time Room Booking & Time Slots
* **Interactive Date & Time Slot Grid**: Half-hourly slot selection (Morning, Afternoon, Evening).
* **Conflict Prevention**: Already-booked slots are highlighted and disabled to prevent double bookings.
* **Attendee Tagging**: Add team member emails to meeting invites.
* **📸 [INSERT SCREENSHOT HERE: Booking side panel with date/time slot picker and attendee list]**

---

## Slide 9: 15-Minute Auto-Approval Mechanism
* **Smart Processing**: Pending requests automatically process after a 15-minute buffer.
* **Zero Bottlenecks**: Prevents meeting cancellations if a manager is unavailable or in another meeting.
* **Badge Status**: Clear visual badges displaying `"Approved"` or `"Auto-Approved (15m Window)"`.
* **📸 [INSERT SCREENSHOT HERE: Booking list showing 15-Min Auto-Approved status badge]**

---

## Slide 10: 1-Click WhatsApp Sharing
* **Instant Notification**: 1-click WhatsApp share button on all booking cards.
* **Pre-Formatted Invite**: Opens WhatsApp with formatted date, time, room name, and meeting title ready to send.
* **📸 [INSERT SCREENSHOT HERE: Booking card showing WhatsApp button and pre-filled message preview]**

---

## Slide 11: Edit Participants on Active Meetings
* **Dynamic Member Management**: Managers and Admins can click **Edit Members** on any active reservation.
* **Flexibility**: Add new attendees or remove members without canceling the reservation.
* **📸 [INSERT SCREENSHOT HERE: 'Edit Participants' Modal with add/remove attendee controls]**

---

## Slide 12: Manager Approval Suite & VIP Requests
* **Pending Approval Queue**: Managers view incoming meeting requests with priority tagging (VIP, Training, Standard).
* **1-Click Actions**: Single-click Approve or Decline buttons with reason logging.
* **📸 [INSERT SCREENSHOT HERE: Manager Dashboard showing Pending Approval queue]**

---

## Slide 13: Room-Specific Audit Logs & History
* **Room History Button**: Click any room card to open its dedicated audit history modal.
* **Complete Trail**: Displays creation dates, cancellation reasons, member modifications, and supply reports.
* **Database Persistence**: Saved permanently in the `booking_histories` SQL table.
* **📸 [INSERT SCREENSHOT HERE: 'Room History' Modal displaying chronological audit logs]**

---

## Slide 14: Facility Room Supplies & Maintenance Tracking
* **Equipment Reports**: Track reported missing items (HDMI cables, markers, remotes).
* **Status Lifecycles**: Cycle items through `To Buy` -> `Purchased` -> `Restocked`.
* **Maintenance Mode**: Set malfunctioning rooms to Maintenance Mode to temporarily pause bookings.
* **📸 [INSERT SCREENSHOT HERE: Room Supplies & Maintenance tracking card grid]**

---

## Slide 15: Automated Gmail Calendar Email Notifications
* **Real Gmail Integration**: Powered by Gmail SMTP (`meetingroom9252@gmail.com`).
* **Interactive Emails**: Includes **"📅 Add to Google Calendar"** buttons.
* **Calendar Attachments**: Sends standard `.ics` invite files compatible with Outlook, Apple Calendar, and Google.
* **📸 [INSERT SCREENSHOT HERE: Sample Gmail booking confirmation email in inbox]**

---

## Slide 16: System Security & Role Permissions
* **Password Encryption**: Industry-standard `bcrypt` password hashing.
* **Role-Based Access Control**:
  * **Employee**: Bookings & Room Explorer.
  * **Manager**: Approvals, Member Edits, Supplies, Room History.
  * **Admin**: Room Management, Photo Uploads, Maintenance Mode, Global Audit Logs.
* **📸 [INSERT SCREENSHOT HERE: Role comparison table from Master System Manual]**

---

## Slide 17: Step-by-Step 3-Minute Live Demo Flow
* **Step 1**: Show MySQL Workbench EER Diagram (`Ctrl + R`).
* **Step 2**: Log in as Employee, book a room, and click WhatsApp Share.
* **Step 3**: Log in as Manager, click **Edit Members** and **Room History**.
* **Step 4**: Check Gmail inbox for the automated calendar invite email.
* **📸 [INSERT SCREENSHOT HERE: Multi-window view showing App, MySQL Workbench, and Gmail inbox]**

---

## Slide 18: Summary of Business Benefits & Conclusion
* **Operational Efficiency**: 100% elimination of meeting room conflicts.
* **Manager Convenience**: Automated 15-minute approvals and equipment tracking.
* **Enterprise Security**: Relational SQL database foundation meeting company compliance.
* **Q&A Session**: Ready for Management Questions.
* **📸 [INSERT SCREENSHOT HERE: Closing Thank You slide with app link http://localhost:3000/login]**
