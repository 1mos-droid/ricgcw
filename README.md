# 🏛️ RICGCW Church Management System (v2.0)

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![Appwrite](https://img.shields.io/badge/Auth-Appwrite-red.svg)](https://appwrite.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A high-performance, professional Church Management System (CMS) designed for the **Redeemed Christian Church of God, Word Assembly (RICGCW)**. This platform streamlines administrative operations, financial tracking, and member engagement across multiple branches.

---

## 🚀 Core Features

### 📊 Intelligent Dashboard
* **Real-time Analytics:** Visual trends for membership growth and financial health.
* **Automated Events:** Background detection for member birthdays and special anniversaries.
* **Cash Flow Analysis:** Interactive Recharts-powered graphs for income vs. expenditure.

### 💰 Treasury & Financials
* **Transaction Ledger:** Detailed tracking of contributions and expenses.
* **Flexible Date Selection:** Assign historical or future dates to financial entries for accurate auditing.
* **Exportable Reports:** One-click generation of professional PDFs and Excel spreadsheets.

### 👥 Member & Attendance Management
* **Multi-Branch Registry:** Unified database supporting Mallam, Langma, Kokrobitey, and Diaspora branches.
* **Detailed Profiles:** Track status, membership dates, and contact information.
* **Attendance Logs:** Digitized service attendance with trend analysis.

### 🧑‍💻 Advanced Developer Section (Admin Only)
* **Maintenance Mode:** Global toggle to restrict app access during database updates.
* **Identity Mimicry:** Admins can "mimic" any user identity to troubleshoot branch-specific views and permissions.
* **System Health:** Real-time monitoring of active roles and environment status.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Material UI (MUI), Framer Motion, Lucide React |
| **Authentication** | Appwrite Cloud (Email/Password Session Management) |
| **Database** | Firebase Firestore (Real-time NoSQL) |
| **Utilities** | Recharts, jsPDF, XLSX, date-fns, EmailJS |
| **Build Tool** | Vite |

---

## 📦 Installation & Setup

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* Firebase Project Credentials
* Appwrite Project ID & Endpoint

### 1. Clone & Install
```bash
git clone <repository_url>
cd ricgcw
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and populate it with your service keys:

```env
# Appwrite Config
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id

# Firebase Config (Copy from Firebase Console)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# EmailJS Config
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🛡️ Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full system access, User Management, Developer Tools, Multi-branch view. |
| **Branch Admin** | Branch-specific data entry, reports, and member management. |
| **Minister** | Read-only access to dashboard and specific datasets. |

---

## 📱 Progressive Web App (PWA)

This application is PWA-ready. It can be installed on iOS, Android, and Desktop for a native-like experience, supporting offline manifests and push-style notifications.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Feedback

For technical support or feature requests, please contact the IT Administration team or use the built-in **Help** section within the application.
