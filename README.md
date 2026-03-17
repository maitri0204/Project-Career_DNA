<div align="center">
  <img src="frontend/public/banner.png" alt="Career DNA Profiler" width="100%" />
</div>

<h1 align="center">Project — Career DNA Profiler</h1>

<p align="center">
  A comprehensive psychometric &amp; aptitude assessment platform designed to help students discover their strengths, learning styles, personality types, and ideal career paths.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-4.x-green?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Assessment Sections](#-assessment-sections)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [API Endpoints](#-api-endpoints)
- [Roles & Permissions](#-roles--permissions)
- [Deployment](#-deployment)

---

## 🧬 Overview

**Career DNA Profiler** is a full-stack web application that administers 8 psychometric and aptitude assessments to students. Results are scored automatically and presented as detailed visual reports — bar charts, MBTI personality grids, learning style rankings — giving students actionable insight into their cognitive strengths and career direction.

The platform supports two roles:
- **Students** — register, take assessments, and view detailed results
- **Admins** — manage students, view all test records per student/service

---

## ✨ Features

### Student
- OTP-based email authentication (no password required)
- Service registration & enrollment system
- Sequential section locking — complete one section to unlock the next
- Full-screen test mode with question navigator
- Real-time progress tracking per section
- Detailed results page with vertical bar charts, MBTI personality grid, and learning style rankings
- Student-friendly personality type names (no raw MBTI codes shown)

### Admin
- Admin dashboard with student overview table
- Per-student detail page showing enrolled services
- Per-service test records with scores, attempts, and section breakdowns
- View any student's full result report

---

## 📊 Assessment Sections

| # | Section | Description |
|---|---------|-------------|
| 1 | 🧠 Cognitive Ability | Verbal, numerical, spatial reasoning & memory |
| 2 | 🔢 Aptitude Tests | Logical, numerical, verbal, mechanical & creative aptitude |
| 3 | 🪞 Personality Assessment | MBTI-style 4-dimension personality profiling |
| 4 | 🧭 Career Interest | RIASEC-based vocational interest assessment |
| 5 | ❤️ Emotional Intelligence | Self-awareness, empathy, self-regulation & social skills |
| 6 | 📚 Learning Style | VARK + extended learning style identification |
| 7 | 🤝 Behavioral & Social Skills | Interpersonal & collaborative ability assessment |
| 8 | 🛡️ Stress & Resilience | Coping mechanisms & psychological resilience |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT + OTP via email (Nodemailer) |
| **Process Manager** | PM2 (production) |
| **Web Server** | Nginx (reverse proxy + SSL) |

---

## 📁 Project Structure

```
Numeric_Assessment/
├── backend/
│   ├── src/
│   │   ├── config/              # MongoDB connection
│   │   ├── controllers/         # authController, questionController, testController
│   │   ├── middleware/          # auth, authorize, validate
│   │   ├── models/              # User, Question, TestResult
│   │   ├── routes/              # authRoutes, questionRoutes, testRoutes, serviceRoutes
│   │   ├── scripts/             # Database seed scripts (8 assessment types + services)
│   │   ├── types/               # roles.ts (USER_ROLE enum)
│   │   ├── utils/               # email.ts, jwt.ts, otp.ts
│   │   └── index.ts             # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── public/                  # JPEG section images + career-dna-logo.png
    └── src/
        ├── app/
        │   ├── admin/
        │   │   ├── dashboard/           # Admin overview table
        │   │   ├── questions/           # Question management
        │   │   └── students/[id]/       # Student detail + service records
        │   ├── login/                   # OTP-based login
        │   ├── signup/                  # Student registration + OTP verify
        │   └── student/
        │       ├── dashboard/           # My Services cards
        │       ├── results/[id]/        # Detailed result report
        │       ├── test/                # Assessment instructions page
        │       ├── test/start/          # Section selection with sequential lock
        │       └── test/sections/       # Live test page per section
        ├── components/
        │   └── Navbar.tsx
        ├── lib/
        │   └── api.ts                   # Axios API client
        └── types/
            └── index.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-org/career-dna-profiler.git
cd career-dna-profiler
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Set up environment variables

See [Environment Variables](#-environment-variables) below.

### 4. Seed the database

```bash
cd backend
npm run seed:all
```

### 5. Start development servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_url

# JWT
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Email / OTP (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🌱 Database Seeding

Seed scripts are provided for every assessment section individually or all at once:

```bash
cd backend

npm run seed:cognitive              # Cognitive Ability questions
npm run seed:aptitude               # Aptitude Test questions
npm run seed:personality            # Personality Assessment questions
npm run seed:career-interest        # Career Interest (RIASEC) questions
npm run seed:emotional-intelligence # Emotional Intelligence questions
npm run seed:learning-style         # Learning Style questions
npm run seed:behavioral-social      # Behavioral & Social questions
npm run seed:stress-resilience      # Stress & Resilience questions

# Or seed everything at once
npm run seed:all
```

> The default admin account is auto-created on the first database connection via `backend/src/config/database.ts`.

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/send-otp` | Send OTP to student email |
| POST | `/verify-otp` | Verify OTP and issue JWT |
| POST | `/signup` | Register a new student account |

### Questions — `/api/questions`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get all questions (admin only) |
| GET | `/:testType` | Get questions by assessment type |

### Tests — `/api/test`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/start` | Start or resume a test attempt |
| GET | `/in-progress/:serviceCode` | Get current in-progress attempt |
| POST | `/submit-section` | Submit answers for one section |
| POST | `/complete` | Complete and score the full test |
| GET | `/results/:attemptId` | Get detailed result breakdown |
| GET | `/my-results` | Get all results for logged-in student |
| GET | `/admin/students` | Get all students (admin only) |
| GET | `/admin/students/:studentId` | Get a student's full detail (admin) |

### Services — `/api/services`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all available services |
| POST | `/enroll` | Enroll student in a service |
| GET | `/my-enrollments` | Get student's enrolled services |

### Health — `/api/health`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Returns server status |

---

## 👥 Roles & Permissions

| Feature | Student | Admin |
|---------|:-------:|:-----:|
| Register / Login | ✅ | ✅ |
| Take Assessments | ✅ | ❌ |
| View Own Results | ✅ | ❌ |
| Enroll in Services | ✅ | ❌ |
| View All Students | ❌ | ✅ |
| View Any Result | ❌ | ✅ |
| Manage Questions | ❌ | ✅ |
| View Service Records | ❌ | ✅ |

---

## 📬 Support

For issues or inquiries, contact the Admitra team at **hello@admitra.io**, including a description and any relevant screenshots.

---

<p align="center">
  Made with ❤️ by the <strong>Admitra</strong> team &nbsp;&nbsp;|&nbsp;&nbsp; © 2026 Career DNA Profiler. All rights reserved.
</p>
