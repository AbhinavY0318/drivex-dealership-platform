# DriveX – Deployment & Operation Guide

**Platform:** DriveX – Automotive Dealership Commerce & Lead Management Platform  
**Target Enterprise:** Authorized Passenger Car Dealership (Lucknow, Uttar Pradesh, India)  
**Dealership Scale:** 3 Showrooms, 2 Service Workshops, 1 Certified Used-Car Yard, 340 Employees  
**Architecture:** MERN Stack (Node.js/Express, TypeScript, MongoDB, React, Tailwind CSS, Vite)

---

## 1. System Prerequisites

Before running or deploying the DriveX platform, ensure your environment meets the following specifications:

| Requirement | Minimum Version | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.10.0 LTS` | `v20.x` or `v22.x` | Modern ES module & crypto support |
| **npm** | `>= 9.0.0` | `>= 10.0.0` | Monorepo npm workspaces enabled |
| **MongoDB** | `>= 6.0` (Optional in Dev) | MongoDB Atlas / Local 7.x | Built-in in-memory fallback included for zero-config local dev |
| **OS** | Windows 10/11, macOS, or Linux | Ubuntu 22.04 LTS / Debian 12 | Cross-platform compatibility verified |
| **RAM** | 4 GB | 8 GB+ | For building client bundles and running in-memory Mongo |
| **Google Gemini API Key** | Optional | Pro / Flash Key | Deterministic graceful fallback active if key is not configured |

---

## 2. Quick-Start (Local Development)

The DriveX repository is structured as a unified npm workspace monorepo (`client/` and `server/`).

### Step 1: Clone and Install Dependencies
From the repository root (`d:\DriveX` or your cloned path):
```bash
# Install dependencies across root, server, and client workspaces
npm install
```

### Step 2: Configure Environment Variables
Copy the sample environment file in the root directory:
```bash
# On Linux / macOS / PowerShell
cp .env.example .env
```
*(On Windows cmd: `copy .env.example .env`)*

Review the `.env` settings. The default configuration connects to an automatic **in-memory MongoDB instance** if `MONGODB_URI` is left blank, enabling instantaneous out-of-the-box operation with zero external database installation required.

### Step 3: Seed Database with Dealership Data
Seed the 3 Lucknow showrooms, vehicle models, variants, city pricing rules, certified used vehicles, and user accounts:
```bash
npm run seed
```
This provisions:
- **3 Lucknow Showrooms:** Hazratganj Flagship, Gomti Nagar Premium Hub, Kanpur Road Commercial Hub
- **New Vehicle Catalog:** Model H (ZX AT ₹12,45,000, EX MT ₹9,85,000), Model C (ZX Petrol ₹15,20,000, VX Diesel ₹13,90,000), Model S (LX Petrol ₹6,40,000, VXI ₹7,25,000)
- **Certified Used Cars:** Complete 150-point inspection certificates and DPDP-compliant masked registration numbers (`UP32**1234`)
- **City Pricing Rules:** Lucknow, Kanpur, Ayodhya, and Varanasi with RTO slabs, insurance, and municipal cess
- **Enterprise Staff:** Sales consultants with realistic workloads and pre-configured credentials

### Step 4: Run the Application
Launch both backend API (`http://localhost:5000`) and frontend client (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 3. Environment Variables Reference

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | `5000` | Port for the Express backend REST API |
| `MONGODB_URI` | *(empty string)* | MongoDB connection string. If unset, automatically spins up `MongoMemoryServer` |
| `JWT_SECRET` | `drivex_super_secret_jwt_key_2026` | Secret key used to sign access tokens |
| `JWT_EXPIRES_IN` | `1d` | Access token lifespan (e.g. `15m`, `1d`, `7d`) |
| `JWT_REFRESH_SECRET` | `drivex_refresh_token_secret_key_2026` | Secret key for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifespan |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for frontend |
| `GEMINI_API_KEY` | *(optional)* | Google Gemini API key for AI buyer summary and consultant first-reply drafts. If omitted, structured deterministic fallback kicks in with `status: 'FALLBACK'`. |
| `VITE_API_URL` | `/api` | Base path for frontend API proxy (or `http://localhost:5000/api`) |

---

## 4. Pre-Configured Demo Login Credentials

The platform features a **One-Click Quick Login** panel on the login page (`/login`) for convenience during testing and assessment, as well as direct credential authentication:

| Role | Email | Password | Assigned Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **Buyer / Customer** | `customer@drivex.in` | `Buyer@2026` | Browse catalog, city on-road prices, interactive EMI calculator, book test-drives, view personal booking history & SLA status. |
| **Sales Consultant 1** | `priya.verma@drivex.in` | `Consultant@2026` | Hazratganj Flagship Showroom. Access Sales CRM inbox, live 5-minute SLA countdown timer, AI response generator, lead timeline, and status updates. |
| **Sales Consultant 2** | `rohit.sharma@drivex.in` | `Consultant@2026` | Gomti Nagar Premium Hub. Alternate showroom consultant with workload tracking and lead routing. |
| **Administrator** | `admin@drivex.in` | `Admin@2026` | Dealership-wide administration: vehicle catalog management, city pricing rules, showroom directory, and consultant team overview. |

---

## 5. Automated Test Suite Execution

DriveX includes an automated test suite across unit, integration, and end-to-end workflows:

```bash
# Execute the full test suite
npm test

# Run tests in watch mode
npm run test --workspace=server -- --watch
```

### Verified Test Suites:
1. **`pricing.test.ts` (5 tests):**
   - Validates on-road price composition: $ExShowroom + RTO + Insurance + TCS + Accessories - Offers$.
   - Validates city-specific tax differences between Lucknow and Ayodhya.
   - Tests standard reducing-balance EMI formula against analytical financial benchmarks ($E = P \cdot r \cdot \frac{(1+r)^n}{(1+r)^n - 1}$).
   - Validates error handling for non-positive loans, zero tenure, and invalid variant IDs.
2. **`testDrive.test.ts` (4 tests):**
   - Slot availability calculation across showroom demo vehicles.
   - Successful atomic reservation creation.
   - Prevents double-booking collision on identical date, slot, and vehicle.
   - Rejection of test-drive bookings requested in the past.
3. **`leadAssignment.test.ts` (3 tests):**
   - Validates deterministic routing to the consultant with the lowest active lead workload in the chosen showroom.
   - Validates round-robin tiebreaker when consultants share identical workloads.
   - Validates setting of 5-minute response SLA timer (`responseDueAt = now + 5 min`).
4. **`authAndPrivacy.test.ts` (7 tests):**
   - Digital Personal Data Protection (DPDP) Act compliance: asserts that used vehicle registration numbers are masked as `UP32**1234` in public endpoints and raw registration numbers are never exposed.
   - JWT authentication: access token generation and authorization headers.
   - Role-based route protection: verifies 403 Forbidden when a Buyer attempts to access consultant lead inboxes.
   - Password encryption: verifies bcrypt salt hashing on storage.
5. **`e2eWorkflow.test.ts` (8 tests):**
   - Full customer lifecycle: model discovery $\rightarrow$ on-road price calculation $\rightarrow$ test-drive booking $\rightarrow$ enquiry submission $\rightarrow$ deterministic auto-assignment $\rightarrow$ sales consultant login $\rightarrow$ AI first-reply draft retrieval $\rightarrow$ lead status progression to `CONVERTED`.
6. **`productionReadiness.test.ts` (9 tests):**
   - Production edge cases: concurrent demo vehicle booking prevention with atomic compound unique indexes, graceful unassigned queue routing when all staff are offline, consultant auto-rebalancing upon unavailability, immutable lead pricing snapshots, expired pricing detection with customer disclaimers, DPDP customer consent enforcement, AI timeout & malformed JSON fallbacks, consultant lead ownership RBAC isolation (HTTP 403), and public vehicle registration sanitization (`UP32**1234`).

**Total Test Score:** 36 passed out of 36 executed (100% Passed across 6 suites).

---

## 6. Production Build & Deployment Guide

### A. Production Build Verification
To compile both the server TypeScript files to `server/dist/` and Vite client to `client/dist/`:
```bash
npm run build
```

### B. Deployment Topology (Recommended Cloud Stack)
For production deployment, the recommended hosting topology is:
- **Backend API:** Render Web Service, AWS ECS Fargate, or Railway (Node.js runtime).
- **Frontend SPA:** Vercel, Netlify, or Cloudflare Pages (Static Vite build with client-side routing rewrites).
- **Database:** MongoDB Atlas (M10+ cluster with Automated Backups and Replica Set).
- **AI Service:** Google Cloud Vertex AI or Google AI Studio (Gemini 1.5 Pro / Flash API).

### C. Docker Deployment (Optional Single-Container or Compose)

#### Dockerfile (Backend Service)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=server
COPY server/ ./server/
RUN npm run build --workspace=server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --omit=dev --workspace=server
COPY --from=builder /app/server/dist ./server/dist
EXPOSE 5000
CMD ["node", "server/dist/index.js"]
```

#### Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: drivex_admin
      MONGO_INITDB_ROOT_PASSWORD: drivex_secure_password
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
    restart: always
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://drivex_admin:drivex_secure_password@mongodb:27017/drivex?authSource=admin
      JWT_SECRET: drivex_production_secret_key_change_in_prod
      JWT_REFRESH_SECRET: drivex_production_refresh_key_change_in_prod
      CLIENT_ORIGIN: http://localhost:5173
    depends_on:
      - mongodb

volumes:
  mongo_data:
```

### D. Security & Production Checklist
1. **Enforce HTTPS / TLS 1.3:** Configure SSL certificates via Cloudflare or AWS ACM.
2. **Set Unique JWT Secrets:** Generate cryptographically strong random secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET` using `openssl rand -hex 64`.
3. **Database Network Peering / Whitelist:** In MongoDB Atlas, configure IP access lists to allow traffic only from backend production subnets.
4. **CORS Allowlist:** Set `CLIENT_ORIGIN` to match your production frontend domain (e.g. `https://drivex.lucknowcars.in`).
5. **Rate Limiting:** Protect `/api/auth/*` and `/api/leads/*` against brute-force or spam enquiries using `express-rate-limit`.
6. **DPDP Data Masking:** Verify that all public API endpoints route through the sanitization utilities, preventing raw vehicle registration numbers and unconsented PII leakage.

---

## 7. Troubleshooting & Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`Cannot connect to MongoDB`** | No local MongoDB service running | Leave `MONGODB_URI` blank in `.env` to let the embedded `MongoMemoryServer` start automatically, or supply a valid MongoDB Atlas connection string. |
| **`AI summary shows status: 'FALLBACK'`** | `GEMINI_API_KEY` is not set or rate-limited | This is expected behavior. The platform features deterministic fallback templates that generate comprehensive summaries and reply drafts without crashing. Set a valid key in `.env` to enable live Gemini generation. |
| **`404 on frontend page refresh in production`** | Single Page Application (SPA) routing rewrite missing | In Nginx or Vercel, ensure all non-asset requests rewrite to `/index.html` (`try_files $uri $uri/ /index.html;`). |
| **`Test drive slot shows unavailable`** | Slot has already been booked by another lead or test | Pick another available time slot or date. The atomic reservation engine prevents simultaneous duplicate bookings for the same demo car. |
