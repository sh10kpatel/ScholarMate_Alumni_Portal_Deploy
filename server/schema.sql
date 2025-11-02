CREATE DATABASE IF NOT EXISTS alumni_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alumni_db;

CREATE TABLE IF NOT EXISTS alumni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  branch ENUM('cse','ece','dsai') NULL,
  batch VARCHAR(10) NULL,
  company VARCHAR(100) NULL,
  description TEXT NULL,
  image VARCHAR(512) NULL,
  user_id VARCHAR(64) UNIQUE NULL,
  password VARCHAR(128) NULL,
  role ENUM('alumni','student','admin') DEFAULT 'alumni',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO alumni (name, branch, batch, company, description, image, user_id, password, role) VALUES
('Aarav Sharma','cse','2021','Google','Software Engineer focusing on distributed systems and reliability.','https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=1200&q=80&auto=format&fit=crop','aarav','pass1234','alumni'),
('Ananya Gupta','ece','2020','Microsoft','Hardware-software co-design, building low-latency signal processing stacks.','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80&auto=format&fit=crop','ananya','pass1234','student'),
('Rohan Verma','dsai','2022','Amazon','Applied scientist working on recommendation systems and personalization.','https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=1200&q=80&auto=format&fit=crop','rohan','pass1234','admin');

-- Announcements table for job postings, internships, events, and general announcements
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('job', 'internship', 'event', 'general') DEFAULT 'general',
  company VARCHAR(255),
  location VARCHAR(255),
  description TEXT NOT NULL,
  requirements TEXT,
  application_link VARCHAR(512),
  posted_by INT NOT NULL,
  posted_by_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_type (type),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_active (is_active),
  FOREIGN KEY (posted_by) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

