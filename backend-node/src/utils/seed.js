const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function runSeed() {
  console.log('🌱 Starting Database Seeding...');
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString.includes('your-project-ref')) {
    console.error('❌ Error: DATABASE_URL is not set or contains placeholder.');
    console.log('   Please set your Supabase connection string in backend/.env');
    console.log('   Example: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require');
    process.exit(1);
  }

  const isSupabase = connectionString.includes('supabase.co') || connectionString.includes('supabase.com');
  const pool = new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database.');

    // 1. Ensure tables exist
    console.log('📦 Verifying schema tables...');
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_type VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Hash admin password
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@edutech.com').toLowerCase();
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_DEFAULT_NAME || 'Lead Administrator';

    console.log(`🔐 Hashing password for admin: ${adminEmail}...`);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(adminPassword, salt);

    // Upsert admin
    await client.query(`
      INSERT INTO admins (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $3, name = $1, updated_at = CURRENT_TIMESTAMP;
    `, [adminName, adminEmail, hash]);
    console.log(`✅ Admin account seeded: ${adminEmail} (password: ${adminPassword})`);

    // 3. Seed sample inquiries
    const sampleInquiries = [
      {
        user_type: 'Parent',
        category: 'Scholarship',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 234-5678',
        message: 'Inquiring about merit-based STEM scholarships for Grade 11 students entering the 2026-2027 academic year.',
        status: 'Pending'
      },
      {
        user_type: 'Student',
        category: 'Admission',
        name: 'Devon Patel',
        email: 'devon.patel@studenthub.org',
        phone: '+1 (555) 876-5432',
        message: 'Would like to know the deadline for Fall Semester computer science bridge programs and prerequisite courses.',
        status: 'Contacted'
      },
      {
        user_type: 'School',
        category: 'Concert',
        name: 'Elena Rostova',
        email: 'elena.r@stmarys-academy.edu',
        phone: '+1 (555) 345-9876',
        message: 'Requesting partnership details for hosting the Regional Youth Symphony & Arts Concert at our campus hall.',
        status: 'In Progress'
      },
      {
        user_type: 'Parent',
        category: 'General Query',
        name: 'Marcus Sterling',
        email: 'marcus.sterling@gmail.com',
        phone: '+1 (555) 912-3401',
        message: 'Can you clarify the bus transportation zones and after-school robotics lab schedule?',
        status: 'Resolved'
      },
      {
        user_type: 'Student',
        category: 'Scholarship',
        name: 'Aisha Khan',
        email: 'aisha.khan@edu.in',
        phone: '+91 98765 43210',
        message: 'Seeking application criteria and eligibility for the Women in Tech full-ride scholarship scheme.',
        status: 'Pending'
      },
      {
        user_type: 'School',
        category: 'Admission',
        name: 'Principal Arthur Vance',
        email: 'avance@oakwoodhigh.org',
        phone: '+1 (555) 678-1234',
        message: 'Proposal to setup dual-enrollment credits for senior secondary cohorts starting this August.',
        status: 'In Progress'
      }
    ];

    for (const inq of sampleInquiries) {
      await client.query(`
        INSERT INTO inquiries (user_type, category, name, email, phone, message, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [inq.user_type, inq.category, inq.name, inq.email, inq.phone, inq.message, inq.status]);
    }

    console.log(`✅ Seeded ${sampleInquiries.length} sample inquiries into Supabase PostgreSQL.`);
    client.release();
    await pool.end();
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

runSeed();
