# MediSync — Cryptographically Verified Healthcare & Prescription Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**MediSync** is an enterprise-grade digital healthcare management and electronic prescription tracking platform. It guarantees medical record authenticity using **RSA-2048 / SHA-256 digital signatures** and tamper-proof audit trails across doctors, hospitals, pharmacies, patients, and administrators.

---

## 🌟 Key Features

### 1. 🛡️ Cryptographic Prescription Signing (PKI)
- Every prescription is digitally signed using the prescribing physician's private key (SHA-256 + RSA).
- Pharmacies verify the cryptographic hash and integrity proof prior to dispensing medications.
- Immediate tamper detection prevents prescription fraud and unauthorized alteration.

### 2. 🏥 Role-Based Dashboards
- **Doctor Portal**: Issue verified prescriptions, filter by pending/dispensed status, search records, preview patient history, and export official prescription PDFs with cryptographic signatures.
- **Pharmacy Portal**: Real-time incoming prescription feed, cryptographic key validation, and 1-click dispensing status tracking.
- **Hospital Portal**: Comprehensive practitioner affiliation management, doctor directory, and system connections overview.
- **Patient Portal**: Personal prescription wallet, notification inbox, doctor contact directory, and instant PDF download.
- **Admin Portal**: User management, system audit logs, cryptographic ledger inspector, and platform health telemetry.

### 3. 🎨 Dark Mode, Light Mode & Clinical Themes
- **☀️ Light Mode**: High-clarity daylight medical palette.
- **🌙 Dark Mode**: High-comfort deep midnight slate (`#070b12` to `#0f172a`) optimized for low-light clinical shifts.
- **💻 System Sync**: Dynamically synchronizes with the operating system's dark/light schedule.
- **5 Accent Themes**: Clinical Teal, Trust Navy, Cyber Violet, Vital Amber, and Emergency Rose.
- **Clinical Accessibility**: Compact table density, high contrast mode, and 100%–120% UI typography scaling.

### 4. ⚙️ Integrated System Settings Suite
- **Auditory Chimes**: Synthesized audio feedback on prescription creation, verification, and alerts using the native Web Audio API.
- **Patient Privacy Screen**: Optional HIPAA-compliant blurring of patient names on shared clinic terminals.
- **Session Auto-Lock**: Configurable terminal timeout (15m, 30m, 1h, Never).
- **Default Validity Presets**: Pre-populate prescription expiration periods (7, 14, 30, 90 days).

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, jsPDF, Axios.
- **Backend**: Node.js, Express, JSON Web Tokens (JWT), Crypto (RSA/SHA-256), Bcrypt.
- **Storage**: MongoDB Atlas with zero-downtime offline persistent database engine fallback.
- **Deployment**: Vercel & GitHub.

---

## 💻 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ and npm installed.

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/tamilkakashi/medisync-healthcare.git
cd medisync-healthcare
```

Install server dependencies:
```bash
cd server
npm install
```

Install client dependencies:
```bash
cd ../client
npm install
```

### 3. Running Locally

Start the backend API (port 5000):
```bash
cd server
npm start
```

In a separate terminal, start the Vite frontend (port 5173):
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Doctor** | `testsurgeon@lumina.sys` | `123456` |
| **Pharmacy** | `testpharmacy@lumina.sys` | `123456` |
| **Hospital** | `testhospital@lumina.sys` | `123456` |
| **Patient** | `testpatient@lumina.sys` | `123456` |
| **Admin** | `admin@medisync.com` | `123456` |

---

## 📄 License
This project is licensed under the MIT License.
