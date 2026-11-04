# DriveX – Complete Environment Configuration & Deployment Guide

**Platform:** DriveX – Automotive Dealership Commerce & Lead Management Platform  
**Target Architecture:** MERN Stack (TypeScript, Express, MongoDB, React, Vite, Tailwind CSS)  
**Target Enterprise:** Authorized Passenger Car Dealership (Lucknow, Uttar Pradesh, India)  
**Repository:** [https://github.com/AbhinavY0318/drivex-dealership-platform.git](https://github.com/AbhinavY0318/drivex-dealership-platform.git)

---

## Table of Contents
1. [Audit of All Environment Variables](#1-audit-of-all-environment-variables)
2. [Step-by-Step Credential Generation Guide](#2-step-by-step-credential-generation-guide)
3. [Environment File Placement & Structure](#3-environment-file-placement--structure)
4. [Local Setup from Scratch (Windows PowerShell)](#4-local-setup-from-scratch-windows-powershell)
5. [External Integrations & Fallback Mechanics](#5-external-integrations--fallback-mechanics)
6. [Production Deployment Configuration (Vercel + Render + Atlas)](#6-production-deployment-configuration-vercel--render--atlas)
7. [Environment Differences (Development vs. Production)](#7-environment-differences-development-vs-production)
8. [Personal Setup Action Checklist](#8-personal-setup-action-checklist)

---

## 1. Audit of All Environment Variables

The table below catalogs every environment variable referenced in the DriveX codebase (`server/src/config/environment.ts`, `server/src/app.ts`, `server/src/index.ts`, `client/src/api/client.ts`).

| Variable Name | Required? | Category | Consumed By | Purpose & Behavior | Example Format |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **`PORT`** | Optional | Dev / Prod | Backend (`server`) | Port number on which Express HTTP server listens. Defaults to `5000` if unset. | `5000` |
| **`NODE_ENV`** | Optional | Dev / Prod | Backend (`server`) | Runtime environment flag (`development`, `production`, `test`). Controls logging and strict production startup validation. | `development` or `production` |
| **`CLIENT_ORIGIN`** *(or `CLIENT_URL`)* | Mandatory in Prod | Dev / Prod | Backend (`server`) | Whitelisted frontend origin for Cross-Origin Resource Sharing (CORS). Supports both variable names synonymously. | `http://localhost:5173` (Dev) / `https://drivex.vercel.app` (Prod) |
| **`MONGODB_URI`** | Mandatory in Prod | Dev / Prod | Backend (`server`) | MongoDB connection string. In development, if omitted, DriveX automatically spins up an in-memory `MongoMemoryServer`. In production, must be an external cluster. | `mongodb+srv://<db_user>:<db_password>@cluster0.xxxxx.mongodb.net/drivex?retryWrites=true&w=majority` |
| **`JWT_SECRET`** | Mandatory in Prod | Dev / Prod | Backend (`server`) | Cryptographic secret key used to sign HMAC SHA-256 access tokens (`1h` lifespan). In production, placeholder strings trigger startup failure. | 64-char hex string (e.g., `<your_random_64_char_hex_string>`) |
| **`JWT_REFRESH_SECRET`** | Mandatory in Prod | Dev / Prod | Backend (`server`) | Cryptographic secret key used to sign long-lived refresh tokens (`7d` lifespan). Must be distinct from `JWT_SECRET`. | 64-char hex string (e.g., `<your_second_random_64_char_hex_string>`) |
| **`JWT_EXPIRES_IN`** | Optional | Dev / Prod | Backend (`server`) | Lifespan of JWT access tokens. Defaults to `1h` if omitted. | `15m`, `1h`, `24h` |
| **`JWT_REFRESH_EXPIRES_IN`** | Optional | Dev / Prod | Backend (`server`) | Lifespan of JWT refresh tokens. Defaults to `7d` if omitted. | `7d`, `30d` |
| **`GEMINI_API_KEY`** | Optional | Dev / Prod | Backend (`server`) | Google Gemini Generative AI API key for buyer summarization and first-reply drafting. If omitted, built-in deterministic fallback activates. | `AIzaSy...` |
| **`DEALERSHIP_CITY`** | Optional | Dev / Prod | Backend (`server`) | Primary dealership headquarters city context. Defaults to `Lucknow`. | `Lucknow` |
| **`DEALERSHIP_STATE`** | Optional | Dev / Prod | Backend (`server`) | Primary dealership state context. Defaults to `Uttar Pradesh`. | `Uttar Pradesh` |
| **`SLA_RESPONSE_TIME_MINUTES`** | Optional | Dev / Prod | Backend (`server`) | Response SLA window in minutes for auto-assigned leads. Defaults to `5`. | `5` |
| **`VITE_API_URL`** | Optional | Dev / Prod | Frontend (`client`) | Base path or URL for backend API requests. In development, defaults to `/api` (proxied by Vite). In production, points to Render API + `/api`. | `/api` (Dev) / `https://drivex-api.onrender.com/api` (Prod) |

### Non-Integrated / Excluded Services Notice
In accordance with the client project brief and architecture:
- **No Third-Party Email Services (SendGrid/Mailgun/AWS SES):** Customer acknowledgements and consultant notifications are managed internally in MongoDB and rendered in the CRM notification drawer.
- **No Third-Party Payment Gateways (Stripe/Razorpay):** Test drive and vehicle enquiries generate official reservation tokens (`TD-2026-XXXX`) without charging upfront booking fees.
- **No Cloud Object Storage (AWS S3/Cloudinary):** Vehicle photography and 150-point inspection certificates utilize seeded automotive CDN assets and local vector illustrations.

---

## 2. Step-by-Step Credential Generation Guide

### A. MongoDB Atlas (Cloud Database)
*Required for production deployment or optional persistent local development.*

1. **Official Portal:** Navigate to [MongoDB Atlas Official Site](https://www.mongodb.com/cloud/atlas) and click **Try Free** or **Sign In**.
2. **Create Free M0 Cluster:**
   - In the Atlas Console, select **Build a Database**.
   - Choose the **M0 Free (Shared)** tier.
   - Select cloud provider **AWS** and region **`ap-south-1` (Mumbai)** for lowest latency to Lucknow, India.
   - Click **Create Cluster**.
3. **Create Database User:**
   - Navigate to **Security $\rightarrow$ Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g., `drivex_admin`.
   - Password: Click **Autogenerate Secure Password** and copy it to a secure notepad.
   - Built-in Role: **Read and write to any database** (`readWriteAnyDatabase`).
   - Click **Add User**.
4. **Configure Network Access:**
   - Navigate to **Security $\rightarrow$ Network Access**.
   - Click **Add IP Address**.
   - For initial development or cloud deployment (Render/Vercel): Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**.
5. **Obtain Connection String:**
   - Navigate to **Database $\rightarrow$ Clusters**, click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://<db_username>:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<db_password>` with your database user password and append `/drivex` before the `?` query string:
     ```text
     mongodb+srv://<db_username>:<db_password>@cluster0.xxxxx.mongodb.net/drivex?retryWrites=true&w=majority
     ```
   - **Target Variable:** `MONGODB_URI`

---

### B. Cryptographic JWT Secrets
*Mandatory for secure production authentication and session signing.*

Do not use simple strings like `secret123`. Generate cryptographically random 256-bit (32-byte) hex strings using Node.js:

1. Open PowerShell or Terminal and execute:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Run the command **twice** to produce two unique strings:
   - First output string $\rightarrow$ assign to **`JWT_SECRET`**
   - Second output string $\rightarrow$ assign to **`JWT_REFRESH_SECRET`**
3. Example format:
   ```text
   JWT_SECRET=<your_generated_random_64_character_hex_string>
   JWT_REFRESH_SECRET=<your_second_generated_random_64_character_hex_string>
   ```

---

### C. Google Gemini Generative AI API Key
*Optional: Unlocks real-time LLM buyer requirements summarization and personalized sales first-reply drafting. If omitted, DriveX seamlessly runs in deterministic fallback mode.*

1. **Official Portal:** Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Sign In:** Sign in with your standard Google Account.
3. **Create API Key:**
   - Click **Create API Key**.
   - Select **Create API key in new project** (or pick an existing Google Cloud project).
4. **Copy API Key:**
   - Copy the generated key string (format: `AIzaSy...`).
   - **Target Variable:** `GEMINI_API_KEY`
5. **Official Documentation:** [Google AI Studio Documentation](https://ai.google.dev/gemini-api/docs/api-key)

---

## 3. Environment File Placement & Structure

```
drivex-dealership-platform/
│
├── .env                  <-- [ROOT] Full-stack local development (read by npm run dev)
├── .env.example          <-- [ROOT] Monorepo template committed to Git
│
├── server/
│   ├── .env              <-- [BACKEND] Used when running server standalone or on Render
│   └── .env.example      <-- [BACKEND] Backend template committed to Git
│
└── client/
    ├── .env              <-- [FRONTEND] Used by Vite client during build/preview
    └── .env.example      <-- [FRONTEND] Frontend template committed to Git
```

### Critical Security Separation:
- **Server Variables (NEVER expose to Client):** `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`.
- **Client Variables (Vite Safe):** Only variables prefixed with `VITE_` (e.g. `VITE_API_URL`) are bundled into client JavaScript. Vite automatically strips all non-prefixed variables for security.

---

## 4. Local Setup from Scratch (Windows PowerShell)

Follow these exact commands step-by-step on your Windows machine.

### Step 1: Clone the GitHub Repository
```powershell
git clone https://github.com/AbhinavY0318/drivex-dealership-platform.git
Set-Location drivex-dealership-platform
```

### Step 2: Install All Dependencies
DriveX uses npm workspaces to manage dependencies across the root, server, and client in one unified command:
```powershell
npm install
```

### Step 3: Configure Environment File
Create your local development `.env` file from the provided template:
```powershell
Copy-Item .env.example .env
```

> [!NOTE]
> **Zero-Config In-Memory MongoDB:**
> If you leave `MONGODB_URI=` blank in `.env`, DriveX will automatically start a built-in in-memory MongoDB replica set (`mongodb-memory-server`). You do not need to install MongoDB locally or configure Atlas just to test the application!

### Step 4: Seed Database with Dealership Data
Populate the database with the 3 Lucknow showrooms, vehicle models, variants, dynamic city tax slabs, certified used cars, and staff user accounts:
```powershell
npm run seed
```

### Step 5: Start Development Servers
Start both the backend REST API (`http://localhost:5000`) and the frontend Vite SPA (`http://localhost:5173`) concurrently:
```powershell
npm run dev
```

### Step 6: Verify Application is Running
1. **API Health Check:** Open PowerShell and test the health endpoint:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/api/health"
   ```
   *Expected Response:* `status: "healthy", service: "DriveX Automotive Dealership API"`
2. **Frontend Buyer Portal:** Open your browser and visit:
   ```text
   http://localhost:5173
   ```
3. **One-Click Quick Login:** Visit `http://localhost:5173/login` and use the quick login buttons:
   - **Sales Consultant:** `priya.verma@drivex.in` / `Consultant@2026`
   - **Administrator:** `admin@drivex.in` / `Admin@2026`
   - **Buyer / Customer:** `customer@drivex.in` / `Buyer@2026`

### Step 7: Run Automated Verification Tests
Execute all 36 unit, integration, and edge-case tests:
```powershell
npm test
```

---

## 5. External Integrations & Fallback Mechanics

| Service | Primary Function | Behavior if API Key / URI is Missing | Fallback Implementation | How to Verify Working vs. Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **Database (MongoDB)** | Persistent data store for vehicles, bookings, leads, and staff accounts. | In development: Automatically spins up in-memory `MongoMemoryServer`.<br>In production: Startup fails with clear error. | Built-in in-memory MongoDB server (`mongodb-memory-server`). | Terminal log displays `[Database] No MONGODB_URI provided. Starting in-memory MongoMemoryServer...` |
| **Generative AI (Google Gemini)** | Ingests raw customer enquiry text and generates: (1) structured buyer executive summary, (2) personalized consultant first-reply drafts. | Server does **NOT** crash. Operates at 100% capacity in deterministic fallback mode. | Deterministic rule-based template engine in `server/src/services/aiService.ts`. | In Sales CRM (`/crm`), open any lead drawer: Responses generated via template show `status: 'FALLBACK'` in database records and lead history. If Gemini is active, `modelUsed: 'gemini-1.5-flash'` is logged in `ai_interactions` collection. |
| **Authentication (JWT)** | Issues signed HMAC SHA-256 access and refresh tokens. | Uses safe development placeholders in dev. In production, startup validator enforces high-entropy secrets. | Built-in crypto token generator. | Login succeeds on `/login` and issues tokens visible in browser LocalStorage (`drivex_token`). |

---

## 6. Production Deployment Configuration (Vercel + Render + Atlas)

```
                     ┌────────────────────────────────────────┐
                     │          Vercel (Frontend SPA)         │
                     │  Environment: VITE_API_URL            │
                     └───────────────────┬────────────────────┘
                                         │ REST API / CORS
                                         ▼
                     ┌────────────────────────────────────────┐
                     │         Render (Backend Web Service)   │
                     │  Environment: MONGODB_URI, JWT_SECRET, │
                     │               CLIENT_ORIGIN            │
                     └───────────────────┬────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
            ┌─────────────────────────┐     ┌─────────────────────────┐
            │   MongoDB Atlas Cluster │     │   Google Gemini API     │
            │      (Production DB)    │     │   (AI Drafter Engine)   │
            └─────────────────────────┘     └─────────────────────────┘
```

### A. Deploy Frontend on Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New $\rightarrow$ Project**.
2. Import your GitHub repository: `AbhinavY0318/drivex-dealership-platform`.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client` (Click Edit $\rightarrow$ select `client`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://<your-render-backend-name>.onrender.com/api`
5. Click **Deploy**.

### B. Deploy Backend on Render
1. Log in to [Render](https://render.com/) and click **New $\rightarrow$ Web Service**.
2. Connect your GitHub repository: `AbhinavY0318/drivex-dealership-platform`.
3. Configure Service Settings:
   - **Name:** `drivex-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
4. Configure Environment Variables in Render Dashboard:
   ```text
   NODE_ENV = production
   PORT = 5000
   CLIENT_ORIGIN = https://<your-vercel-app>.vercel.app
   MONGODB_URI = mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/drivex?retryWrites=true&w=majority
   JWT_SECRET = <your-32-byte-hex-string>
   JWT_REFRESH_SECRET = <your-second-32-byte-hex-string>
   JWT_EXPIRES_IN = 1h
   JWT_REFRESH_EXPIRES_IN = 7d
   GEMINI_API_KEY = <your-gemini-api-key>
   DEALERSHIP_CITY = Lucknow
   DEALERSHIP_STATE = Uttar Pradesh
   SLA_RESPONSE_TIME_MINUTES = 5
   ```
5. Click **Create Web Service**.
6. Seed Initial Production Data: Open Render **Shell** tab and run:
   ```bash
   node dist/scripts/seed.js
   ```

---

## 7. Environment Differences (Development vs. Production)

| Setting / Variable | Local Development | Production Environment |
| :--- | :--- | :--- |
| **`NODE_ENV`** | `development` | `production` (triggers strict startup checks) |
| **`MONGODB_URI`** | Blank (auto-starts `MongoMemoryServer`) | Remote MongoDB Atlas URI |
| **`CLIENT_ORIGIN`** | `http://localhost:5173` | Deployed Vercel URL (`https://drivex.vercel.app`) |
| **`VITE_API_URL`** | `/api` (local Vite proxy forwarding to port 5000) | `https://drivex-api.onrender.com/api` |
| **`JWT_SECRET`** | Default dev string | Cryptographically random 32-byte hex string |
| **`JWT_REFRESH_SECRET`**| Default dev string | Cryptographically random 32-byte hex string |
| **Database Persistence**| Temporary / in-memory | Durable, replicated cluster with automated backups |
| **Error Traces** | Verbose error logging | Sanitized error responses with no stack traces |

---

## 8. Personal Setup Action Checklist

Here is everything you personally need to obtain or configure:

- [ ] **GitHub Account:** Repository configured at `https://github.com/AbhinavY0318/drivex-dealership-platform.git`.
- [ ] **Node.js LTS:** Installed version `>= 20.10.0` ([nodejs.org](https://nodejs.org/)).
- [ ] **Local `.env` File:** Copied from `.env.example` in repository root.
- [ ] **Generate JWT Secrets:** Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` twice for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- [ ] **(Optional) Google Gemini Key:** Generated free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
- [ ] **(Production Only) MongoDB Atlas:** Free M0 cluster created in Mumbai (`ap-south-1`) at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- [ ] **(Production Only) Render Account:** Web service linked to `server/` directory on [Render](https://render.com/).
- [ ] **(Production Only) Vercel Account:** SPA project linked to `client/` directory on [Vercel](https://vercel.com/).
