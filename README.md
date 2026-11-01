# MediSync — Cryptographically Verified Healthcare & Prescription Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20(GitHub%20Pages)-success?style=for-the-badge&logo=github)](https://tamilkakashi.github.io/medisync-healthcare/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/tamilkakashi/medisync-healthcare)
[![React Version](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🌐 **Live Web Application**: **[https://tamilkakashi.github.io/medisync-healthcare/](https://tamilkakashi.github.io/medisync-healthcare/)**  
> 🔗 **GitHub Repository**: **[https://github.com/tamilkakashi/medisync-healthcare](https://github.com/tamilkakashi/medisync-healthcare)**  
> Experience real-time role-based portals (Doctor, Pharmacy, Hospital, Patient, Admin) with instant dark/light themes and cryptographic verification.

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

## 🚀 Live Demo Quick Access

Click the link below to launch the live platform:
👉 **[Open MediSync Live App](https://tamilkakashi.github.io/medisync-healthcare/)**

### Demo Account Credentials
Login directly with any of the pre-configured role accounts:

| Role | Email | Password | Quick Link |
| :--- | :--- | :--- | :--- |
| **Doctor** | `testsurgeon@lumina.sys` | `123456` | [Login as Doctor](https://tamilkakashi.github.io/medisync-healthcare/#/login) |
| **Pharmacy** | `testpharmacy@lumina.sys` | `123456` | [Login as Pharmacy](https://tamilkakashi.github.io/medisync-healthcare/#/login) |
| **Hospital** | `testhospital@lumina.sys` | `123456` | [Login as Hospital](https://tamilkakashi.github.io/medisync-healthcare/#/login) |
| **Patient** | `testpatient@lumina.sys` | `123456` | [Login as Patient](https://tamilkakashi.github.io/medisync-healthcare/#/login) |
| **Admin** | `admin@medisync.com` | `123456` | [Login as Admin](https://tamilkakashi.github.io/medisync-healthcare/#/login) |

---

## 💻 Local Development Setup

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

## 📄 License
This project is licensed under the MIT License.
