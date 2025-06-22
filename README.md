# 📈 Real-Time Stock Market Tracker

A full-stack Real-Time Stock Market Tracker web application that allows users to track live stock prices with dynamic charts, built with:
* **ReactJS** (Frontend)
* **NodeJS and ExpressJS** (Backend)
* **MongoDB Atlas** (Database)
* **Socket.io**(Real-time Communications)
* **Yahoo Finance API** (Stock Data)

## 🚀 Features

- ✅ **Track Real-Time Stock Prices** from global markets
- ✅ **Live Interactive Charts** using Recharts
- ✅ **Save Recently Tracked Stocks** with timestamp
- ✅ **Dynamic Currency Symbol** detection (INR, JPY, USD, etc.)
- ✅ **Responsive & Modern UI** with Tailwind CSS
- ✅ **Responsive & Modern UI** with Tailwind CSS
- ✅ **Full CRUD API** for Stocks
- ✅ **Deployed on Vercel (Frontend & Backend)**

---

## 📁 Project Structure

```
📦 EazyByts-Module-2
├─ backend
│  ├─ .gitignore
│  ├─ api
│  │  └─ index.js
│  ├─ package-lock.json
│  └─ package.json
└─ frontend
   ├─ .gitignore
   ├─ README.md
   ├─ eslint.config.js
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.js
   ├─ public
   │  └─ vite.svg
   ├─ src
   │  ├─ App.css
   │  ├─ App.jsx
   │  ├─ assets
   │  │  └─ react.svg
   │  ├─ components
   │  │  └─ RealTimeStockChart.jsx
   │  ├─ index.css
   │  ├─ main.jsx
   │  └─ pages
   │     ├─ RecentTrackedStock.jsx
   │     └─ StockTracker.jsx
   ├─ tailwind.config.js
   └─ vite.config.js

```

## 🖥️ Demo
**Live Site:** https://your-live-site.vercel.app

**Backend API:** https://your-backend.vercel.app
## ✅ Clone the Repository
```bash
https://github.com/SUGATACHANDA/EazyByts-Module-2.git

cd EazyByts-Module-2
```
### 1️⃣ Backend Setup
```bash
cd backend
npm install 
```
#### Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
```
#### Run the server:
```bash
npm start
```
### 2️⃣ Frontend Setup
```bash
cd client
npm install
```
#### Create a `.env` file in `client/`:
```env
VITE_BACKEND_API_URL=http://localhost:5000
```
#### Run the React app:
```bash
npm run dev
```
## 🌐 API Endpoints
| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/api/stocks/recent` | Get recently tracked stocks |
| Socket | `startTracking`      | Start real-time tracking    |
| Socket | `stopTracking`       | Stop tracking and save      |



## 🖥️ Tech Stack
| Tech              | Usage                     |
| ----------------- | ------------------------- |
| React             | Frontend UI               |
| Express           | Backend server            |
| MongoDB           | Data storage              |
| Socket.io         | Real-time communication   |
| Yahoo Finance API | Stock data source         |
| Recharts          | Graph/Chart Visualization |
| Tailwind CSS      | Styling                   |


📧 Contact
For feedback, contributions, or queries:

- Name: Sugata Chanda

- Portfolio: https://sugatachanda.vercel.app

- GitHub: @SUGATACHANDA
## 📜 License
This project is licensed under the MIT License.

© 2025 SUGATA CHANDA

