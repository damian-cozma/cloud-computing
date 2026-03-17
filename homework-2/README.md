# Game Tracker Pro

## Description
A full-stack gaming hub designed for enthusiasts to manage their personal collections and stay updated with the industry. This version evolves from a simple script to a modern web application, featuring a dynamic React frontend, a high-performance FastAPI backend, and real-time integration with external News APIs.

## Key Features
* **News Hub**: Stay updated with the latest gaming headlines, featuring smart tag filtering and server-side pagination.
* **Library Management**: Track your game progress, categories, and personal ratings.
* **Smart Analytics**: Visualize gaming habits and library statistics via a dedicated dashboard.
* **Trending Engine**: Dynamic "Hot Tags" extraction based on title frequency and Jaccard similarity to avoid redundant categories.

## Technologies

### Backend
* **Language**: Python 3.x
* **Framework**: FastAPI - For high-performance asynchronous API routing.
* **External Integration**: NewsAPI - To fetch real-time global gaming news.
* **Libraries**: `requests` (API communication), `python-dotenv` (environment variables).

### Frontend
* **Library**: React 18 (Vite)
* **State Management**: React Hooks (`useState`, `useEffect`, `useMemo`).
* **Styling**: Custom CSS3 with CSS Variables for theme consistency.
* **Features**: Local filtering, smooth-scroll pagination, and intelligent error handling for broken image links.

## Project Structure
```
game-tracker-v2/
├── backend/
│   ├── api/
│   │   └── external_news.py  # News API endpoints
│   ├── services/
│   │   └── news_service.py   # Multi-page fetching & anti-politics filtering
│   └── main.py               # FastAPI entry point
├── src/
│   ├── pages/
│   │   ├── News.jsx          # News hub logic & tag similarity engine
│   │   ├── News.css          # Grid layout & stacking context fixes
│   │   ├── Analytics.jsx     # Data visualization dashboard
│   │   └── ...               # Browse, Library, Sessions, HomePage
│   ├── components/
│   │   └── Navbar.jsx        # Navigation & Branding
│   └── App.jsx               # Client-side routing
└── .env                      # API Keys and configuration
```
## Installation & Usage

### 1. Prerequisites
* Python 3.9+
* Node.js & npm
* NewsAPI Key 
* RAWG API Key

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup
```
cd frontend
npm install
npm run dev
```