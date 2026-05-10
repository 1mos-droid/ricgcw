# 🏛️ RICGCW Church Management System (v2.2)

A bespoke, high-performance digital headquarters for the **Redeemed Christian Church of God, Word Assembly (RICGCW)**. This platform combines elite administrative governance with real-time departmental automation.

---

## ✨ Primary Enhancements

### 🎨 Authentic Church Branding
*   **Logo-Driven UI:** The application’s color palette is precision-matched to the official RICGCW logo—featuring **Metallic Gold**, **Globe Blue**, and **Deep Space** black.
*   **Executive Typography:** Utilizing **Playfair Display** (Serif) for authoritative headings and high-contrast weights for 100% legibility across all devices.
*   **Refined Design:** Premium glassmorphism effects blended with high-opacity surfaces to ensure a professional, non-distracting user experience.

### 🤖 Registry Automation ("Self-Healing" Data)
*   **Age-Based Categorization:** Members are automatically assigned to departments based on their birthday.
    *   **< 13 Years:** Automatically moved to the **Children's Court**.
    *   **13 - 35 Years:** Automatically moved to the **Youth Ministry**.
*   **Silent Background Sync:** The system automatically scans and "ages up" members whenever an admin views the dashboard.
*   **Manual Override:** Full database synchronization tools available in the Developer panel.

### 🛡️ Administrative Governance (Dev Tools)
*   **Maintenance Mode:** Lock the entire platform for non-admin users with a single toggle. Perfect for database maintenance or critical updates.
*   **Identity Mimicry:** Admins can "mimic" any member or branch leader to troubleshoot specific views or verify permissions exactly as the end-user sees them.
*   **System Health:** Real-time monitoring of active roles, identities, and environment status.

---

## 📊 Core Modules

| Module | Features |
| :--- | :--- |
| **Intelligent Dashboard** | Real-time membership growth, financial trajectories, and automated birthday detection. |
| **Treasury (Finance)** | Detailed ledger with **date-flexible entries** (backdating/future dating) and professional PDF/Excel exporting. |
| **Children's Court** | A dedicated, secure environment for managing our youngest members (formerly Children's Department). |
| **Youth Ministry** | Specialized workspace for departmental records and engagement tracking. |
| **Command Center** | "Quick Switch" between Sanctuary, Youth, and Children's Court environments with enforced data partitioning. |

---

## 🛠️ Technology Stack

*   **Frontend:** React 19 + Vite (Turbo-charged performance)
*   **Design:** Material UI (MUI) + Framer Motion (Fluid animations)
*   **Backend:** Firebase Firestore (Real-time DB) + Appwrite Cloud (Auth & Session)
*   **Utilities:** Recharts (Analytics), jsPDF (Reports), date-fns (Age Logic)

---

## 🚀 Deployment & Setup

### 1. Requirements
*   Node.js v18+
*   Firebase Project (Firestore enabled)
*   Appwrite Project

### 2. Quick Install
```bash
git clone <repository_url>
cd ricgcw
npm install
npm run dev
```

### 3. Environment Config (`.env`)
Ensure your `.env` contains:
*   `VITE_APPWRITE_PROJECT_ID`
*   `VITE_FIREBASE_API_KEY`
*   (See `.env.example` for the full list of required keys)

---

## 📜 Permissions Overview

*   **Developer:** Master system access. Only role capable of accessing **Master Control** tools and bypassing **Maintenance Mode**.
*   **Admin:** Comprehensive governance, including registry automation, member management, and global reports. Restricted from technical developer tools.
*   **Branch Admin:** Manage branch-specific members, finances, and attendance.
*   **Minister:** Read-only access to relevant departmental insights.

---

## 📱 Progressive Web App (PWA)
This application is fully optimized for mobile installation. Open the portal in your browser and select **"Add to Home Screen"** for a native, full-screen experience.

---

**© 2026 Rhema Inner Court Gospel Church - IT Administration Team**
