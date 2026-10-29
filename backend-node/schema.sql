-- ========================================================
-- EdTech CRM & Inquiry System - Database Schema (Supabase PostgreSQL)
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Sample Admin User:
-- Email: admin@edutech.com
-- Password: Admin@123
INSERT INTO admins (name, email, password_hash, role)
VALUES (
    'Lead Administrator',
    'admin@edutech.com',
    '$2a$10$0k7n/e6W1e0jB.6qP4xVce/yU2fF5c6gHhJ.M3pL4r5qW6e7R8sTa',
    'admin'
)
ON CONFLICT (email) DO NOTHING;
