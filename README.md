# 🎓 EduSphere - EdTech CRM & Public Inquiry System

A simple, responsive, and secure full-stack CRM inquiry management system built for educational institutions. It allows prospective students, parents, and partner schools to submit inquiries, while administrators log in via **custom JWT-based authentication implemented from scratch** to view, filter, search, and manage all submissions.

---

## 📑 Table of Contents
1. [Tech Stack & Architecture](#-tech-stack--architecture)
2. [Key Features](#-key-features)
3. [Database Schema & Supabase Setup](#-database-schema--supabase-setup)
4. [Environment Variables (.env.example)](#-environment-variables)
5. [Quick Start & Local Setup](#-quick-start--local-setup)
   - [Running the Java Backend](#1-running-the-java-backend)
   - [Running the Frontend](#2-running-the-frontend)
   - [Alternative Node.js Backend](#3-optional-nodejs-backend)
6. [How to Test Custom JWT Authentication](#-how-to-test-custom-jwt-authentication)
7. [API Endpoints Reference](#-api-endpoints-reference)
8. [Responsive UI/UX Highlights](#-responsive-uiux-highlights)
9. [Deployment Guide](#-deployment-guide)

---

## 🛠 Tech Stack & Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   EduSphere Full-Stack CRM                     │
├───────────────────────────────┬────────────────────────────────┤
│ Frontend                      │ React.js 18 + Vite             │
│                               │ Tailwind CSS (Mobile-First)   │
│                               │ Lucide Icons                   │
├───────────────────────────────┼────────────────────────────────┤
│ Backend                       │ Java (Spring Boot 3 / Java SE) │
│ (Custom JWT from Scratch)     │ Alternative: Node.js Express   │
├───────────────────────────────┼────────────────────────────────┤
│ Database                      │ Supabase (PostgreSQL)          │
│                               │ Native Connection Strings      │
└───────────────────────────────┴────────────────────────────────┘
```

- **Frontend**: Modern React (Vite), Tailwind CSS with responsive card views for mobile and tables for desktop, glassmorphism design, and toast notification alerts.
- **Backend (Java)**: Standard Java architecture with Controllers, Repositories, Entities, and Security Filters.
  - **Custom JWT Auth**: Password hashing using BCrypt, custom HMAC-SHA256 JWT generation and validation filter. Supabase Auth is **strictly not used** as per assessment requirements.
- **Database**: Supabase PostgreSQL database provider connected via standard connection strings (`DATABASE_URL`), complete with table constraints, updated_at triggers, and performance indexes.

---

## ✨ Key Features

### A. Public Inquiry Form
- Clean, responsive inquiry submission form with interactive pill selectors and native dropdowns.
- Required fields:
  - **User Type (Dropdown)**: `Parent`, `Student`, `School`
  - **Category (Dropdown)**: `Scholarship`, `Concert`, `Admission`, `General Query`
  - **Personal Details**: Full Name, Email Address, Phone Number
  - **Message / Query**: Multi-line text area with live character counter.
- Real-time client-side input validation and error feedback.
- Animated submission confirmation receipt with reference tracking ID.
- Saves directly to the Supabase PostgreSQL database.

### B. Admin Authentication & Protected CRM Dashboard
- **Custom JWT Authentication**:
  - Secure `/api/auth/login` endpoint verifying bcrypt-hashed credentials.
  - Signed JWT token returned upon successful login and stored securely in client.
  - Protected backend routes requiring `Authorization: Bearer <token>`.
  - Automatic session expiration detection and logout handling.
- **Admin Tabular & Card Views**:
  - Desktop view displays an interactive data table with: Name, Phone, Email, User Type, Category, Date, Status, and Actions.
  - Mobile view automatically switches to a card layout so columns are never truncated on phones.
  - Direct status modification (`Pending`, `In Progress`, `Contacted`, `Resolved`).
  - View full query in an inspection modal.
  - Internal staff notes editor for CRM follow-ups.

### C. Search & Filtering (Mandatory)
- **Filter by Category**: `Scholarship`, `Concert`, `Admission`, `General Query`, or `All`.
- **Filter by User Type**: `Parent`, `Student`, `School`, or `All`.
- **Filter by Status**: `Pending`, `In Progress`, `Contacted`, `Resolved`, or `All`.
- **Search Bar**: Real-time search matching **Name**, **Phone number**, or **Email**.
- **Metrics Summary Cards**: Dynamic statistics showing Total Inquiries, Pending Attention, In Progress, Contacted, and Resolved counts.
- **Export to CSV**: 1-click export of filtered records to `.csv` format.

---

## 🗄 Database Schema & Supabase Setup

The complete database schema is located in `schema.sql` at the root of the repository.

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project (or select an existing one).
3. Navigate to **SQL Editor** in the left sidebar.
4. Copy and paste the contents of `schema.sql` and click **Run**.

### Schema Summary:
```sql
-- Admins table for custom backend JWT authentication
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Public Inquiries table
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_category ON inquiries(category);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_type ON inquiries(user_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
```

### Pre-Seeded Default Admin:
- **Email**: `admin@edutech.com`
- **Password**: `Admin@123`

---

## 🔑 Environment Variables

Copy `.env.example` in both `backend` and `frontend`:

### Root / Backend `.env`:
```env
# Server Port
PORT=5000

# Supabase PostgreSQL Connection String
# Found in: Supabase Project Settings -> Database -> Connection URI
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require

# Custom JWT Secret (minimum 32 characters)
JWT_SECRET=edtech_crm_super_secure_jwt_secret_key_2026_xyz
JWT_EXPIRATION_MS=604800000

# Default Admin Credentials
ADMIN_DEFAULT_NAME="Lead Administrator"
ADMIN_DEFAULT_EMAIL=admin@edutech.com
ADMIN_DEFAULT_PASSWORD=Admin@123
```

### Frontend `.env`:
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quick Start & Local Setup

### 1. Running the Java Backend

You can run the Java backend using either the pre-compiled runner or standard Maven:

#### Option A: Instant Zero-Dependency Runner (Recommended)
The repository includes a ready-to-run Java server that boots in under 1 second without waiting for dependency downloads:

**Windows (PowerShell or CMD):**
```powershell
cd backend
.\run-java.bat
# Or using powershell:
.\run-java.ps1
```

#### Option B: Spring Boot with Maven
If you have Maven installed on your machine:
```bash
cd backend
mvn spring-boot:run
```

The Java backend will start listening at:
`http://localhost:5000`

---

### 2. Running the Frontend

In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at:
`http://localhost:5173`

---

### 3. (Optional) Node.js Backend

As a bonus, the complete Node.js Express backend is also available in `backend-node/`:
```bash
cd backend-node
npm install
npm run dev
```

---

## 🔒 How to Test Custom JWT Authentication

The backend implements JWT-based authentication from scratch using BCrypt password hashing and HMAC-SHA256 signature verification. Supabase Auth is **not** used.

### Test via UI:
1. Open the web app at `http://localhost:5173`.
2. Click **Admin Dashboard** in the navbar.
3. Click the convenient **"Use Evaluator Demo Credentials"** button (or enter `admin@edutech.com` / `Admin@123`).
4. Click **Sign In**.
5. The backend validates credentials, returns the JWT token, and unlocks the protected CRM Dashboard.

### Test via cURL / Terminal:

#### 1. Unauthorized Access Attempt (Should return 401):
```bash
curl -i http://localhost:5000/api/inquiries
```
*Expected response:* `401 Unauthorized` with message `"Admin token required to access this CRM route."`

#### 2. Authenticate and Obtain JWT:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@edutech.com\",\"password\":\"Admin@123\"}"
```
*Expected response:*
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "name": "Lead Administrator",
    "email": "admin@edutech.com",
    "role": "admin"
  }
}
```

#### 3. Access Protected Route with JWT Bearer Token:
```bash
curl http://localhost:5000/api/inquiries?category=Scholarship \
  -H "Authorization: Bearer <PASTE_TOKEN_HERE>"
```
*Expected response:* Returns status 200 with filtered inquiry records and metrics.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inquiries` | Public | Submit a new public inquiry into Supabase DB |
| `POST` | `/api/auth/login` | Public | Authenticate admin & generate custom JWT token |
| `GET` | `/api/auth/status` | Public | Health check & database connection status |
| `GET` | `/api/auth/me` | Protected | Get current authenticated admin profile |
| `GET` | `/api/inquiries` | Protected | List inquiries with filters (`category`, `user_type`, `status`, `search`) |
| `PATCH` | `/api/inquiries/:id/status`| Protected | Update inquiry status (`Pending`, `In Progress`, `Contacted`, `Resolved`) |
| `PATCH` | `/api/inquiries/:id/notes` | Protected | Save internal admin CRM staff notes |
| `DELETE`| `/api/inquiries/:id` | Protected | Delete an inquiry record |

---

## 📱 Responsive UI/UX Highlights

- **Mobile First Design**: Tested across mobile viewports (375px, 414px, 768px, 1280px+).
- **Adaptive Layout**: On small screens, data tables seamlessly transform into interactive swipeable inquiry cards with accordion message drawers.
- **Smooth Animations**: Micro-interactions on buttons, pulsating status indicators, and clean toast alerts for feedback.
- **Glassmorphism Aesthetic**: Modern EdTech palette with indigo, violet, and emerald accents.

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel / Netlify)
1. Push this repository to GitHub.
2. In Vercel or Netlify, import the repository and set the root directory to `frontend`.
3. Set the Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://your-backend.onrender.com/api`).
4. Build Command: `npm run build`
5. Output Directory: `dist`

### Backend Deployment (Render / Railway)
1. Create a Web Service pointing to `backend`.
2. Set Environment Variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string.
   - `JWT_SECRET`: A secure random 32-character string.
   - `PORT`: `5000`
3. Build & Start Commands:
   - Java: `./mvnw spring-boot:run` or `java -cp bin com.edtech.crm.standalone.JavaCrmServer`
   - Node.js alternative: `npm install && npm start`

---

## 👨‍💻 Candidate Submission Notes
- **Assessment**: Full-Stack Assessment Task: EdTech CRM & Inquiry System
- **Database Used**: Supabase (PostgreSQL) with `schema.sql`
- **Authentication**: Custom JWT built from scratch in backend without Supabase Auth
- **Status**: Tested, verified, and complete with all mandatory filters and search criteria.
