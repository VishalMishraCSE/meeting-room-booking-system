-- SQL Schema for Lumina Reserve Meeting Room Booking System
-- Database Target: MySQL
-- Optimized for compatibility with Prisma Schema

-- Disable foreign key checks to allow clean table re-creation
SET FOREIGN_KEY_CHECKS = 0;

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

-- 1. Departments Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    bookingQuota INT DEFAULT 5 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Floors Table
CREATE TABLE floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., "4th Floor"
    building VARCHAR(100) NOT NULL, -- e.g., "North Wing"
    floorPlanUrl VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users Table
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

-- 4. Rooms Table
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roomNumber VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    floorId INT NOT NULL,
    location VARCHAR(255) NULL, -- Specific directions
    description TEXT NULL,
    status VARCHAR(50) DEFAULT 'Available' NOT NULL, -- 'Available', 'Maintenance'
    heroImageUrl VARCHAR(255) NULL,
    avgRating FLOAT DEFAULT 0.0 NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_room_floor FOREIGN KEY (floorId) 
        REFERENCES floors(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Room Amenities Table (Separate table mapping back to rooms)
CREATE TABLE room_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roomId INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., "Projector", "Video Conference", "Whiteboard"
    icon VARCHAR(50) NULL, -- Material Icon string
    isActive BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT fk_amenity_room FOREIGN KEY (roomId) 
        REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Room Photos Table
CREATE TABLE room_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roomId INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    CONSTRAINT fk_photo_room FOREIGN KEY (roomId) 
        REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bookings Table
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

-- 8. Attendees Table (Maps external corporate emails to bookings)
CREATE TABLE attendees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    email VARCHAR(191) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Accepted', 'Declined'
    CONSTRAINT fk_attendee_booking FOREIGN KEY (bookingId) 
        REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Booking Histories Table (For audit trails)
CREATE TABLE booking_histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'Created', 'Modified', 'Cancelled', 'Preempted'
    performedBy VARCHAR(191) NOT NULL, -- User email
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_history_booking FOREIGN KEY (bookingId) 
        REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Favorites Table (Quick access rooms for users)
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


-- INDEXES FOR HIGH-PERFORMANCE SEARCHES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_rooms_number ON rooms(roomNumber);
CREATE INDEX idx_bookings_time ON bookings(startTime, endTime);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_amenities_room ON room_amenities(roomId);
CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_booking_histories_booking ON booking_histories(bookingId);
