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

### 2️⃣ Environment Configuration
Copy the example environment files and update them with your local or production values:

- **Backend Environment**:
  ```bash
  cp Den-WOWS-Backend/.env.example Den-WOWS-Backend/.env
  ```
  *(Note: If local MongoDB is not running on port 27017, the NestJS backend automatically falls back to an in-memory MongoDB server)*

- **Frontend Environment**:
  ```bash
  cp Den-WOWS-Frontend/.env.example Den-WOWS-Frontend/.env.local
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

---

## 📄 License
This project is licensed under the [GNU General Public License v3.0](LICENSE) (GPL-3.0). Free and open-source software — copyleft ensures that any modified or derivative versions must also remain free and open source under the same license.
