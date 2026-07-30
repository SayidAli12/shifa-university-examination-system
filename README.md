# Shifa University — Examination Management System

A modern, responsive, and dynamic **University Examination Management System** built with **React**, **Tailwind CSS**, and **Firebase** (Authentication & Firestore). 

Designed exclusively for university administration and academic staff with **Admin** and **Teacher** roles. Features the official **Shifa University** brand identity and logo with a **Horizontal Top Navigation Bar** architecture (**NO SIDEBAR**).

---

## 🏫 Brand Identity & Styling System
- **Official Logo**: Integrated `<Logo />` component rendering the official **Shifa University** emblem.
- **Primary Red (`60%`)**: `#C62828` (Dark Red `#8E0000`, Light Red `#EF5350`) — Used for primary buttons, active navigation, key headers, and brand highlights.
- **White (`30%`)**: `#FFFFFF` — Dominates content cards, data tables, forms, and containers.
- **Accent Palette (`10%`)**: Status badges, alerts, success indicators (`#2E7D32`), warnings (`#F9A825`), and metadata chips.
- **Clean Background**: `#F8FAFC`

---

## 🚫 Strict Scope Restrictions
- ❌ **NO Student Portal / Student Accounts / Student Registration**
- ❌ **NO Student Online Examination / Exam Attempt**
- ❌ **NO Dynamic Question Management / Question Bank**
- ❌ **NO Sidebar Navigation** (Horizontal Top Bar only)
- ❌ **NO Role Selector Dropdown on Login** (Roles are resolved dynamically from Firestore user profiles)

---

## ✨ Features Overview

### 1. Authentication & Role Resolution
- **Firebase Auth** + **Firestore `users` collection** role resolution (`admin` or `teacher`).
- **Protected Routes** guarding admin-only pages (`/faculties`, `/departments`, `/teachers`, `/users`).
- **Firestore Security Rules** (`firestore.rules`) enforcing server-side role authorization.
- **Demo Mode Fallback**: Automatic offline development preview mode when environment variables are not populated.

### 2. Horizontal Top Navigation Bar (NO SIDEBAR)
- Top bar header featuring the official **Shifa University Logo**, quick role indicator, user profile summary, and logout button.
- Responsive mobile menu drawer for small screens.

### 3. Complete Management Modules
- **Faculties**: Dynamic CRUD, Active/Inactive status toggle, search & filter.
- **Departments**: Linked to parent Faculty (`facultyId`), parent selector, search & filter.
- **Courses**: Cascading Faculty → Department selects, credit hours, course code validation.
- **Teachers**: Employee ID, contact info, linked to Faculty & Department.
- **Exams**: Title, Course, Supervising Teacher, Type (*Midterm, Final, Quiz*), Total Marks, Duration, Date, Status (*Draft, Scheduled, Completed, Cancelled*).
- **Exam Schedules**: Timetable management with Exam, Room allocation, Date, Start/End times, Status.
- **Results**: Examination-level outcome assessment records (*Pending, Recorded, Approved, Published*). Strictly institutional (no student portals/names).
- **Reports & Print Layout**: Dynamic multi-tab reports (Faculties, Departments, Courses, Teachers, Exams, Schedules, Results) with interactive real-time filters and browser `window.print()` layout featuring the official Shifa University logo.
- **User Management**: Admin-only user directory with status activation/deactivation controls.
- **Profile**: Institutional user profile overview.

### 4. Admin & Teacher Dashboards
- **Admin Dashboard**: Dynamic Firestore statistics (Total Faculties, Departments, Courses, Teachers, Exams, Schedules, Recorded Results), quick action shortcuts, recent exam records, upcoming timetables.
- **Teacher Dashboard**: My Assigned Courses, My Examination Duties, My Schedule timetable, My Recorded Results.

---

## 🛠️ Project Structure
```text
university-examination-system/
├── src/
│   ├── assets/
│   │   └── logo/
│   │       └── logo.jpg    # Official Shifa University Logo
│   ├── components/
│   │   ├── common/         # Button, Card, Input, Select, Modal, ConfirmModal, Table, Badge, Toast, LoadingSpinner, EmptyState, Logo
│   │   └── navigation/     # Navbar (Top Horizontal Bar), MobileNav
│   ├── context/
│   │   ├── AuthContext.jsx # Auth & Role state management
│   │   └── DataContext.jsx # Firestore sync & CRUD operations
│   ├── firebase/
│   │   ├── config.js       # Firebase initialization & Demo Mode detection
│   │   ├── auth.js         # Authentication helpers & role lookup
│   │   └── firestoreService.js # Firestore CRUD & real-time subscriptions
│   ├── layouts/
│   │   └── MainLayout.jsx  # Container layout with Navbar & Footer
│   ├── pages/
│   │   ├── Login.jsx       # Sign-in page with official logo
│   │   ├── Unauthorized.jsx
│   │   ├── dashboard/      # AdminDashboard, TeacherDashboard
│   │   ├── faculties/      # FacultyList
│   │   ├── departments/    # DepartmentList
│   │   ├── courses/        # CourseList
│   │   ├── teachers/       # TeacherList
│   │   ├── exams/          # ExamList
│   │   ├── schedules/      # ScheduleList
│   │   ├── results/        # ResultsList
│   │   ├── reports/        # ReportsPage (Print-friendly layout)
│   │   ├── users/          # UserList (Admin user management)
│   │   └── profile/        # ProfilePage
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   └── utils/              # constants, formatters, seedData
├── firestore.rules          # Firestore Security Rules
├── index.html
├── package.json
├── tailwind.config.js
├── vercel.json             # Vercel SPA deployment configuration
└── vite.config.js
```

---

## 🚀 Local Setup & Run Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🌐 Vercel Deployment

1. Import the repository into Vercel.
2. In Project Settings → Environment Variables, configure the `VITE_FIREBASE_*` variables.
3. Deploy! The included `vercel.json` automatically handles SPA routing rewrites.
