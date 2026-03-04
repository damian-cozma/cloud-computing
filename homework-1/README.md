# Game Tracker API

## Description

A RESTful API built with vanilla Python for managing a personal game library. It allows users to track game progress, calculate ratings via detailed reviews, and generate dynamic statistics or filtered leaderboards.
## Technologies

* Language: Python 3.x

* Standard Modules Only:

    * http.server - For the core web server functionality.

    * json - For data manipulation and storage.

    * re - For advanced routing via Regex.

    * urllib.parse - For parsing complex URLs and query strings.

## Project Structure
```
homework-1/
├── logic/
│   ├── games_service.py     # Game management logic
│   ├── reviews_service.py   # Review logic and rating calculation
│   └── analytics_service.py # Filtering, sorting, and statistics
├── storage/
│   ├── games.json           # Local database for games
│   └── reviews.json         # Local database for reviews
├── server.py                # Entry point (HTTP Request Handler)
├── README.md                # Project documentation
└── Homework_1_Postman_Collection.json # Exported API tests
```

## Installation & Usage
1. Clone the repository
```
git clone [your-repo-link]
cd homework-1
```
2. Start the server
```
python3 server.py
```

## Postman Evaluation
To evaluate the API, import the Homework_1_Postman_Collection.json file into Postman. The collection is organized into folders to demonstrate a complete End-to-End flow:

1. Games: Create, view, and update game entries.

2. Reviews: Add reviews and see the automatic rating calculation in action.

3. Leaderboard: Test the power of filters like ?platform= and ?sort=.

4. Cleanup: A dedicated folder for deletions to ensure the database remains clean after automated test runs.
