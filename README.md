# DriveX – Automotive Dealership Commerce & Lead Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248.svg)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Tests-36%20Passed%20(100%25)-brightgreen.svg)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-lightgrey.svg)](LICENSE)

> **DriveX** is an enterprise-grade digital commerce, dealership operations, and customer relationship management (CRM) platform engineered specifically for an authorized passenger car dealership network operating in **Lucknow, Uttar Pradesh, India** (3 retail showrooms, 2 service workshops, 1 certified pre-owned yard, and 340 employees).

---

## 🚗 Core Modules & Business Capabilities

1. **Editorial Buyer Portal & New Vehicle Inventory:**
   - Premium automotive showroom experience with high-resolution photography.
   - Comprehensive model listings with trims, technical specifications, and interactive color swatches.
   - Indexable, canonical URLs for individual vehicle models (`/vehicles/:slug`).

2. **Authoritative On-Road Pricing Engine:**
   - Server-authoritative calculation: $\text{Ex-Showroom} + \text{RTO Road Tax} + \text{Insurance} + \text{Accessories} + \text{TCS} + \text{Fastag} - \text{Discount}$.
   - Dynamic statutory tax slabs across Lucknow, Kanpur, Ayodhya, and Varanasi.
   - Validity dates, legal disclaimers, and immutable historical lead pricing snapshots.

3. **Reducing-Balance EMI Loan Calculator:**
   - Standard financial amortization: $E = P \cdot r \cdot \frac{(1+r)^n}{(1+r)^n - 1}$.
   - Real-time interactive sliders for down payment, loan tenure, and interest rate.
   - Complete breakdown: Monthly EMI, principal component, total interest, and total repayment amount.

4. **Certified Used-Car Marketplace (DPDP Compliant):**
   - 150-point technical inspection certificates across 5 mechanical categories.
   - Strict privacy compliance under India's Digital Personal Data Protection (DPDP) Act: vehicle registration numbers are masked as `UP32**1234` across all public REST APIs and frontend interfaces.

5. **Atomic Test-Drive Booking Engine:**
   - 3-step booking concierge with real-time showroom demo vehicle availability.
   - Double-booking prevention enforced via a MongoDB partial unique compound index `{ showroomId: 1, vehicleModelId: 1, bookingDate: 1, timeSlot: 1 }` with `{ status: { $in: ['PENDING', 'CONFIRMED'] } }`.

6. **Lead Management CRM & 5-Minute Response SLA:**
   - Deterministic auto-assignment based on least active workload with round-robin tiebreaker.
   - Live visual 5-minute countdown SLA timer (`responseDueAt = assignedAt + 5m`) with overdue alerts.
   - Activity timeline tracking all status transitions, notes, and consultant reallocations.

7. **Generative AI Drafter & Deterministic Fallback:**
   - Powered by Google Gemini AI to synthesize customer requirement summaries and personalized first-reply drafts.
   - Resilient dual-mode design: gracefully activates a structured deterministic template if the external API is offline or unconfigured (`status: 'FALLBACK'`).

8. **Centralized Administration CMS (`/admin`):**
   - Manage new vehicle models and variants.
   - Real-time updates to dynamic city tax and cess slabs.
   - Staff workload monitoring and automatic lead rebalancing when staff toggle availability.

---

## 🏗️ Architecture & Technology Stack

- **Monorepo Architecture:** npm workspaces (`client/` and `server/`).
- **Frontend SPA:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend REST API:** Node.js, Express, TypeScript, Mongoose 8.
- **Database & Persistence:** MongoDB (Atlas M10+ in production; automatic zero-config `MongoMemoryServer` in local development).
- **Authentication & Security:** JWT access & refresh tokens, bcrypt password hashing, RBAC middleware, and IDOR protection.
- **Testing:** Vitest, Supertest, MongoMemoryServer (36 automated tests, 100% pass rate).

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js:** `>= 20.10.0 LTS`
- **npm:** `>= 9.0.0`
- **MongoDB:** (Optional in local development; automatically spins up an in-memory replica if unset)

### 1. Installation
Clone the repository and install all dependencies across workspaces:
```bash
git clone https://github.com/AbhinavY0318/drivex-dealership-platform.git
cd drivex-dealership-platform
npm install
```

### 2. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
*(On Windows cmd: `copy .env.example .env`)*

The default configuration connects to an automatic **in-memory MongoDB instance** if `MONGODB_URI` is left blank, enabling instantaneous out-of-the-box operation with zero external database setup required.

> For complete step-by-step credential acquisition, MongoDB Atlas setup, JWT generation, and production deployment, see the **[Complete Environment Setup Guide (`ENV_SETUP_GUIDE.md`)](./ENV_SETUP_GUIDE.md)**.

### 3. Database Seeding
Seed Lucknow showrooms, vehicle models, variants, city pricing rules, certified used cars, and staff accounts:
```bash
npm run seed
```

### 4. Run Development Servers
Launch both the backend API (`http://localhost:5000`) and the frontend client (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Configured Demo Credentials

The login page (`/login`) includes a **One-Click Quick Login** panel for instant assessment:

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Buyer / Customer** | `customer@drivex.in` | `Buyer@2026` | Browse catalog, city on-road prices, EMI calculator, book test-drives, view personal booking history. |
| **Sales Consultant 1** | `priya.verma@drivex.in` | `Consultant@2026` | Hazratganj Showroom. Sales CRM inbox, live 5-minute SLA countdown timer, AI response editor, lead timeline. |
| **Sales Consultant 2** | `rohit.sharma@drivex.in` | `Consultant@2026` | Gomti Nagar Hub. Alternate showroom consultant with workload tracking and lead routing. |
| **Administrator** | `admin@drivex.in` | `Admin@2026` | Dealership CMS: vehicle catalog management, city pricing rules, showroom directory, staff workloads. |

---

## 🧪 Automated Testing

Run the complete automated test suite (36 tests across 6 suites):
```bash
npm test
```

### Verified Test Suites:
- `pricing.test.ts` (5 tests): On-road pricing breakdown, regional tax slabs, reducing-balance EMI formula, negative bounds.
- `testDrive.test.ts` (4 tests): Real-time slot availability, atomic booking, double-booking prevention, past date rejection.
- `leadAssignment.test.ts` (3 tests): Deterministic least-workload routing, round-robin tiebreaker, 5-minute SLA timer calculation.
- `authAndPrivacy.test.ts` (7 tests): DPDP registration masking (`UP32**1234`), JWT authentication, RBAC authorization, bcrypt hashing.
- `e2eWorkflow.test.ts` (8 tests): End-to-end customer discovery $\rightarrow$ on-road quote $\rightarrow$ test drive $\rightarrow$ auto-assignment $\rightarrow$ lead conversion.
- `productionReadiness.test.ts` (9 tests): 10 production edge cases (atomic concurrency, unassigned queue, auto-rebalance, snapshot immutability, DPDP consent, AI fallback, consultant lead RBAC isolation, registration sanitization).

---

## 📦 Production Build

Compile both workspaces for production deployment:
```bash
npm run build
```

---

## 📚 Detailed Documentation

- **[Environment Configuration & Setup Guide (`ENV_SETUP_GUIDE.md`)](./ENV_SETUP_GUIDE.md):** Comprehensive beginner-friendly guide covering variable audits, credential acquisition steps (Atlas, Gemini, JWT), file placement, and production deployment.
- **[Deployment & Operations Guide (`deployment.md`)](./deployment.md):** Technical deployment runbook for environment variables, database configuration, local installation, and production deployment on Render/Vercel/Docker.
- **[Technical Design Document (PDF)](./Technical_Design_Document.pdf):** Full 22-chapter architecture document with diagrams, formulas, embedded UI screenshots, and testing reports.
- **[Technical Design Document (Markdown)](./docs/Technical_Design_Document.md):** Source markdown document.

---

## 📄 License
This project is licensed under the ISC License.
