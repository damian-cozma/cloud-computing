# ☁️ Cloud Computing Projects

This repository contains my coursework for the **Cloud Computing** elective during my Computer Science studies.
The assignments are **evolution-based**, starting from low-level implementations and gradually moving toward modern full-stack applications and cloud deployments.

---

## 📈 Evolution Path

- Homework 1 → Custom backend using **vanilla Python**
- Homework 2 → Full-stack app with **FastAPI + React**
- Homework 3 → Cloud-native full-stack application on **Google Cloud Platform**
- Homework 4 → Cloud-native full-stack application on **Microsoft Azure**

---

## 🧩 Homework 1 – Game Tracker API

### Description

A RESTful API built using **only standard Python modules**, designed to manage a personal game library.

It allows users to:
- track game progress
- write reviews and compute ratings
- generate filtered leaderboards and statistics

### Tech Highlights

- Pure Python (no frameworks)
- Custom HTTP server (`http.server`)
- Regex-based routing (`re`)
- JSON-based storage (local "database")

### Key Concepts

- Building a backend **from scratch**
- Manual request handling and routing
- Data processing and API design fundamentals

---

## 🎮 Homework 2 – Game Tracker (Full-Stack)

### Description

A full-stack gaming hub that expands the initial API into a modern web application with a dynamic frontend and real-time data.

### Features

- News Hub with live gaming news (NewsAPI)
- Personal game library management
- Analytics dashboard for user stats
- Trending system using similarity (Jaccard-based tags)

### ⚙️ Tech Stack

**Backend**
- FastAPI (Python)
- External APIs: NewsAPI, RAWG
- Pydantic, async endpoints

**Frontend**
- React (Vite)
- Hooks (useState, useEffect, useMemo)
- Custom CSS

### Key Concepts

- Full-stack architecture
- API integration
- State management & UI design
- Moving from local scripts to real applications

---

## 🌩️ Homework 3 – Game Tracker (Google Cloud Platform)

### Description

A cloud-native full-stack gaming platform deployed on **Google Cloud Platform**, extending the local application with managed services, serverless components, and event-driven processing.

### Features

- News Hub with smart tag filtering and server-side pagination
- Scalable backend on App Engine
- Cloud Storage image optimization with automatic resizing
- Event-driven image processing via Eventarc + Cloud Run
- Secure secrets management with Secret Manager
- Monitoring and alerting via Cloud Logging & Cloud Monitoring

### ⚙️ GCP Services Used

| Service | Role |
|---|---|
| **App Engine** | FastAPI backend hosting |
| **Cloud Datastore** | NoSQL database for game metadata |
| **Cloud Storage** | Image storage (covers & thumbnails) |
| **Cloud Run** | Serverless image processing (resize) |
| **Eventarc** | Trigger system for storage events |
| **Secret Manager** | Secure API key storage |
| **Cloud Logging** | Application logs |
| **Cloud Monitoring** | Metrics and alerting |

### Key Concepts

- Decoupled architecture — image processing delegated to serverless service
- Event-driven workflow: Upload → Eventarc → Cloud Run → thumbnail generation
- Cost optimization via serving small images instead of originals
- No secrets stored in code

---

## 🔷 Homework 4 – Game Tracker (Microsoft Azure)

### Description

A cloud-native full-stack gaming platform deployed on **Microsoft Azure**, extending the previous architecture with Azure-native managed services, async messaging, and serverless compute.

### Features

- News Hub with live gaming news (NewsAPI + RAWG API)
- Personal game library management backed by Cosmos DB
- Event-driven session processing via Service Bus + Function App
- Secure configuration via App Settings / Environment Variables
- Full observability with Application Insights (logs, metrics, traces)

### ⚙️ Azure Services Used

| Service | Role |
|---|---|
| **Azure App Service** (×2) | React frontend + FastAPI backend hosting |
| **Azure Cosmos DB** | NoSQL database for games, sessions, reviews |
| **Azure Service Bus** | Async message queue (`session_created` event) |
| **Azure Function App** | Serverless consumer — processes Service Bus events |
| **Azure Application Insights** | Telemetry: logs, metrics, traces |
| **App Settings / Env Variables** | Secure storage for API keys and connection strings |

### Key Concepts

- Decoupled architecture — async processing delegated to Function App via Service Bus
- Event-driven workflow: User action → Backend → Service Bus → Function App → Cosmos DB
- Single integration point — backend is the only service communicating with external APIs
- No secrets stored in code or repository
