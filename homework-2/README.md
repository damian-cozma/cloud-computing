# Game Tracker

## Description
A full-stack gaming hub designed for enthusiasts to manage their personal collections and stay updated with the industry. This version evolves from a simple script to a modern web application, featuring a dynamic React frontend, a high-performance FastAPI backend, and real-time integration with external News APIs.

## Key Features
* **News Hub**: Stay updated with the latest gaming headlines, featuring smart tag filtering and server-side pagination.
* **Library Management**: Track your game progress, categories, and personal ratings.
* **Smart Analytics**: Visualize gaming habits and library statistics via a dedicated dashboard.
* **Trending Engine**: Dynamic "Hot Tags" extraction based on title frequency and Jaccard similarity to avoid redundant categories.

## Demo
* **Landpage**
<img width="1863" height="912" alt="image" src="https://github.com/user-attachments/assets/7b2effc3-6143-4f6d-9846-3fbc8a1c2e4d" />
<br><br>

* **Browse Games**
<img width="1863" height="912" alt="image" src="https://github.com/user-attachments/assets/a9263793-891c-4b16-b9f6-deb70b63e5c8" />
<br><br>

* **Game Details**
<img width="1863" height="912" alt="image" src="https://github.com/user-attachments/assets/7d829e48-fada-4341-b10f-57d96718d616" />
<br><br>

* **My Collection**
<img width="1863" height="912" alt="image" src="https://github.com/user-attachments/assets/3c6a825a-b6b8-4414-bce2-b6d82e20cc1e" />
<br><br>

* **Sessions**
<img width="1863" height="912" alt="image" src="https://github.com/user-attachments/assets/7777e30c-ccea-4dfa-888a-f3340e7b974d" />
<br><br>

* **Analytics**
<img width="1863" height="912" alt="image" src="https://github.com/user-attachments/assets/c350eedc-4666-4a29-bd43-59c384e36e1e" />


## Technologies

### Backend
* **Language**: Python 3.x
* **Framework**: FastAPI - For high-performance asynchronous API routing.
* **External Integration**: 
  * **NewsAPI** - To fetch real-time global gaming news.
  * **RAWG API** - To retrieve comprehensive video game metadata, ratings, and covers.
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
│   ├── app/
│   │   ├── routers/          # FastAPI route definitions (games, news, analytics)
│   │   ├── services/         # Core business logic & external API integrations
│   │   ├── schemas/          # Pydantic models for data validation
│   │   ├── data/             # Local JSON databases (games.json, reviews.json)
│   │   └── main.py           # FastAPI entry point & CORS configuration
│   ├── requirements.txt
│   └── .env                  # API Keys (Not included in repo)
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components (Navbar)
    │   ├── pages/            # React views (Browse, GameDetails, News, etc.)
    │   ├── styles/           # Global CSS and variables
    │   ├── App.jsx           # Client-side routing configuration
    │   └── main.jsx          # React DOM entry point
    └── package.json
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

# Create a .env file in the backend folder and add your keys:
# NEWS_API_KEY=your_news_api_key_here
# RAWG_API_KEY=your_rawg_api_key_here

uvicorn app.main:app --reload
```

### 3. Frontend Setup
```
cd frontend
npm install
npm run dev
```
