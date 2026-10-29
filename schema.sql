-- ========================================================
-- EdTech CRM & Inquiry System - Database Schema (Supabase PostgreSQL)
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if needed for fresh setup (commented out for safety)
-- DROP TABLE IF EXISTS inquiries CASCADE;
-- DROP TABLE IF EXISTS admins CASCADE;

-- 1. Admins Table (Used for custom backend JWT authentication)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inquiries Table (Stores public CRM inquiry form submissions)
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('Parent', 'Student', 'School')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Scholarship', 'Concert', 'Admission', 'General Query')),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Contacted', 'Resolved')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Optimization Indexes for Fast Filtering & Search
CREATE INDEX IF NOT EXISTS idx_inquiries_category ON inquiries(category);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_type ON inquiries(user_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries(phone);
CREATE INDEX IF NOT EXISTS idx_inquiries_name ON inquiries(name);

-- 4. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inquiries_updated_at ON inquiries;
CREATE TRIGGER trg_inquiries_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ========================================================
-- Seed Data: Default Admin User
-- Password is 'Admin@123'
-- Hash generated via bcrypt (cost factor 10):
-- $2a$10$w8f8F0y/9m26FpY2tK1jX.dJv0o4hJj01w4Mv0gMh43b.HhJg.QWe
-- (Or use 'npm run db:seed' to auto-seed with verified bcryptjs hash)
-- ========================================================
INSERT INTO admins (name, email, password_hash, role)
VALUES (
    'Lead Administrator',
    'admin@edutech.com',
    '$2a$10$j81Z9FjU77i8xGgHhA4fauGqE.M2qYpZg7/4H8sZ6n8y2J9JvO2/a',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Sample Inquiries for immediate preview and testing
INSERT INTO inquiries (user_type, category, name, email, phone, message, status)
VALUES 
    ('Parent', 'Scholarship', 'Sarah Jenkins', 'sarah.jenkins@example.com', '+1 (555) 234-5678', 'Inquiring about merit-based STEM scholarships for Grade 11 students entering the 2026-2027 academic year.', 'Pending'),
    ('Student', 'Admission', 'Devon Patel', 'devon.patel@studenthub.org', '+1 (555) 876-5432', 'Would like to know the deadline for Fall Semester computer science bridge programs and prerequisite courses.', 'Contacted'),
    ('School', 'Concert', 'Elena Rostova', 'elena.r@stmarys-academy.edu', '+1 (555) 345-9876', 'Requesting partnership details for hosting the Regional Youth Symphony & Arts Concert at our campus hall.', 'In Progress'),
    ('Parent', 'General Query', 'Marcus Sterling', 'marcus.sterling@gmail.com', '+1 (555) 912-3401', 'Can you clarify the bus transportation zones and after-school robotics lab schedule?', 'Resolved'),
    ('Student', 'Scholarship', 'Aisha Khan', 'aisha.khan@edu.in', '+91 98765 43210', 'Seeking application criteria for the Women in Tech full-ride scholarship scheme.', 'Pending'),
    ('School', 'Admission', 'Principal Arthur Vance', 'avance@oakwoodhigh.org', '+1 (555) 678-1234', 'Proposal to setup dual-enrollment credits for senior secondary cohorts.', 'In Progress')
ON CONFLICT DO NOTHING;
