-- SQL Schema for Lumina Reserve Meeting Room Booking System
-- Database Target: MySQL 8.0+ / MariaDB
-- Engineered for MySQL Workbench EER Diagram Generation & Relationship Visualization

CREATE DATABASE IF NOT EXISTS meeting_room_booking;
USE meeting_room_booking;

-- Disable foreign key checks for clean teardown and re-creation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS room_supplies;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS booking_histories;
DROP TABLE IF EXISTS attendees;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_photos;
DROP TABLE IF EXISTS room_amenities;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS floors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. Departments Table
-- ==========================================
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    bookingQuota INT DEFAULT 5 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. Floors Table
-- ==========================================
CREATE TABLE floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., "4th Floor"
    building VARCHAR(100) NOT NULL, -- e.g., "Main Building"
    floorPlanUrl VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. Users Table
-- ==========================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Employee' NOT NULL, -- 'Employee', 'Manager', 'Admin'
    isActive BOOLEAN DEFAULT TRUE NOT NULL,
    departmentId INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_department FOREIGN KEY (departmentId) 
        REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. Rooms Table
-- ==========================================
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roomNumber VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    floorId INT NOT NULL,
    location VARCHAR(255) NULL, -- Directions / Wing info
    description TEXT NULL,
    status VARCHAR(50) DEFAULT 'Available' NOT NULL, -- 'Available', 'Maintenance'
    heroImageUrl TEXT NULL,
    avgRating FLOAT DEFAULT 0.0 NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_room_floor FOREIGN KEY (floorId) 
        REFERENCES floors(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. Room Amenities Table
-- ==========================================
CREATE TABLE room_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roomId INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., "Projector", "Video Conference"
    icon VARCHAR(50) NULL, -- Material Symbol icon name
    isActive BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT fk_amenity_room FOREIGN KEY (roomId) 
        REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. Room Photos Table
-- ==========================================
CREATE TABLE room_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roomId INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    CONSTRAINT fk_photo_room FOREIGN KEY (roomId) 
        REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. Bookings Table
-- ==========================================
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    roomId INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    title VARCHAR(150) NOT NULL,
    agenda TEXT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed' NOT NULL, -- 'Pending', 'Confirmed', 'Cancelled'
    recurrenceRule VARCHAR(255) NULL,
    checkedIn BOOLEAN DEFAULT FALSE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_booking_user FOREIGN KEY (userId) 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_booking_room FOREIGN KEY (roomId) 
        REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. Attendees Table
-- ==========================================
CREATE TABLE attendees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    email VARCHAR(191) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Accepted', 'Declined'
    CONSTRAINT fk_attendee_booking FOREIGN KEY (bookingId) 
        REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. Booking Histories Table (Audit Trail)
-- ==========================================
CREATE TABLE booking_histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'Created', 'Modified', 'Cancelled', 'Preempted'
    performedBy VARCHAR(191) NOT NULL, -- User email
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_history_booking FOREIGN KEY (bookingId) 
        REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. Favorites Table
-- ==========================================
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    roomId INT NOT NULL,
    CONSTRAINT uq_user_room UNIQUE (userId, roomId),
    CONSTRAINT fk_favorite_user FOREIGN KEY (userId) 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_favorite_room FOREIGN KEY (roomId) 
        REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 11. Notifications Table
-- ==========================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' NOT NULL, -- 'info', 'success', 'warning', 'error'
    isRead BOOLEAN DEFAULT FALSE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notification_user FOREIGN KEY (userId) 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 12. Room Supplies Table (Equipment Tracking)
-- ==========================================
CREATE TABLE room_supplies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roomId INT NOT NULL,
    itemName VARCHAR(150) NOT NULL, -- e.g., "HDMI Cable", "Whiteboard Markers"
    quantity INT DEFAULT 1 NOT NULL,
    status VARCHAR(50) DEFAULT 'Missing' NOT NULL, -- 'Missing', 'To Buy', 'Purchased', 'Replenished'
    notes TEXT NULL,
    reportedBy VARCHAR(191) NOT NULL, -- Reporter Name/Email
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_supply_room FOREIGN KEY (roomId) 
        REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCHES
-- ==========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_rooms_number ON rooms(roomNumber);
CREATE INDEX idx_bookings_time ON bookings(startTime, endTime);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_amenities_room ON room_amenities(roomId);
CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_booking_histories_booking ON booking_histories(bookingId);
CREATE INDEX idx_notifications_user ON notifications(userId);
CREATE INDEX idx_supplies_room ON room_supplies(roomId);
