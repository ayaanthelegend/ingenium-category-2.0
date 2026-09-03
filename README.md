# 🚀 INGENIUM 26 - Monorepo (Frontend & Backend)

## 📌 Project Overview
This monorepo contains:
- **`Den-WOWS-Frontend`**: Next.js 15 App (`http://localhost:3001`), deployed to **Vercel** (`goldmans_gambit`).
- **`Den-WOWS-Backend`**: NestJS App (`http://localhost:3000`), deployed to **Render** (`https://ingenium-category-2-0.onrender.com`).

---

## 💻 Setup Instructions for Antigravity AI on Laptop

### 1️⃣ Clone & Install Dependencies
Run the following commands in terminal:
```bash
git clone https://github.com/ayaanthelegend/ingenium-category-2.0.git
cd ingenium-category-2.0
npm install
npm install --prefix Den-WOWS-Backend
npm install --prefix Den-WOWS-Frontend
```

### 2️⃣ Environment & Vercel Configuration
All environment variables (`.env`, `.env.local`) and Vercel project configurations (`.vercel/project.json`) are committed to this repository.

- **Backend Environment (`Den-WOWS-Backend/.env`)**:
  ```env
  PORT=3000
  MONGO_URI=mongodb://localhost/nest-auth
  ADMIN_KEY=admin123
  JWT_SECRET=supersecretjwtkey
  ```
  *(Note: If local MongoDB is not running on port 27017, the NestJS backend automatically starts an in-memory MongoDB server)*

- **Frontend Environment (`Den-WOWS-Frontend/.env.local`)**:
  ```env
  NEXT_PUBLIC_API_URL=https://ingenium-category-2-0.onrender.com
  NEXT_PUBLIC_SERVER_URL=https://ingenium-category-2-0.onrender.com
  ```

---

## 🏃 Running the Project Locally

### Option A: Run Both Backend & Frontend Simultaneously (Monorepo)
```bash
npm run dev
```
- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:3001`

### Option B: Run Services Separately
- **Backend Only**:
  ```bash
  npm run dev:backend
  ```
- **Frontend Only**:
  ```bash
  npm run dev:frontend
  ```

---

## ☁️ Connecting to Vercel MCP & Redeploying

### How Antigravity CLI Connects to Vercel MCP:
1. Ensure your Vercel account is connected in Composio/Antigravity CLI.
2. The Vercel Project ID (`prj_ASvGuKWElewjn8nD0kIJoKnF3ICZ`) and Team ID (`team_ITGj6lXlwrxSWpDSa9d1GSkT`) are already pre-configured in `.vercel/project.json` and `Den-WOWS-Frontend/.vercel/project.json`.
3. To trigger a redeployment on Vercel using Antigravity AI, ask:
   > *"Redeploy the website on Vercel"*

---

## ⚡ Live Production Endpoints
- **Frontend (Vercel):** `https://goldmansgambit-ayaanthelegends-projects.vercel.app`
- **Backend (Render):** `https://ingenium-category-2-0.onrender.com`
- **Backend Health Endpoint:** `https://ingenium-category-2-0.onrender.com/health`
