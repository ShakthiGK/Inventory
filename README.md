# InvenTrack — Inventory Management System

A full-stack inventory management app built with **Python (FastAPI)**, **React (Vite)**, and **MongoDB**.

## Features

- **Dashboard** — Overview stats: total products, categories, low-stock count, out-of-stock count, total inventory value
- **Products** — Full CRUD, search by name/SKU, filter by category, update stock (add/remove)
- **Categories** — Create, edit, delete product categories
- **Low Stock Alerts** — Visual badges and dashboard alerts when stock falls below threshold

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local at `mongodb://localhost:27017` or a MongoDB Atlas URI)
- A Firebase project (for Google authentication)

---

## Setup

### 1. Backend (FastAPI)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment (edit .env if needed)
# Default: MONGODB_URL=mongodb://localhost:27017
#          DATABASE_NAME=inventory_db

# Start the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2. Firebase Setup (for Google Sign-In)

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication** → **Sign-in method** → enable **Google** and **Email/Password**
3. Go to **Project Settings** → **Your apps** → add a Web app → copy the config
4. Fill in `frontend/.env` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** In Firebase Console → Authentication → Settings → Authorized domains, add `localhost`.

---

### 3. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App available at: http://localhost:5173

---

## Project Structure

```
inventory/
├── backend/
│   ├── main.py          # FastAPI app entry point
│   ├── config.py        # Settings / env vars
│   ├── database.py      # MongoDB connection
│   ├── models.py        # Pydantic models
│   ├── routes/
│   │   ├── products.py  # Product CRUD + stock update
│   │   ├── categories.py
│   │   └── dashboard.py # Stats endpoint
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── api/index.js       # Axios API calls
    │   ├── components/        # Layout, Modal, Sidebar
    │   ├── pages/             # Dashboard, Products, Categories
    │   └── index.css          # Global styles
    └── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get inventory stats |
| GET | `/api/products` | List products (supports `search`, `category_id`, `low_stock`) |
| POST | `/api/products` | Create product |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| PATCH | `/api/products/{id}/stock` | Update stock quantity |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
