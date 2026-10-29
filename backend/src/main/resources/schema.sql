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

-- 4. Sample Admin Seed (BCrypt hash for 'Admin@123')
INSERT INTO admins (name, email, password_hash, role)
VALUES (
    'Lead Administrator',
    'admin@edutech.com',
    '$2a$10$w8f8F0y/9m26FpY2tK1jX.dJv0o4hJj01w4Mv0gMh43b.HhJg.QWe',
    'admin'
)
ON CONFLICT (email) DO NOTHING;
