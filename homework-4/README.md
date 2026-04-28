# Game Tracker (Microsoft Azure)

## Description

A full-stack gaming platform deployed on Microsoft Azure, designed to manage personal game collections and deliver real-time content at scale.

This version extends the local application into a cloud-native architecture, leveraging managed services, serverless components, and event-driven processing, built entirely on Azure.

## ☁️ Cloud Architecture

<img width="820" height="392" alt="image" src="https://github.com/user-attachments/assets/f72e80eb-91ec-4818-884f-ae6834dd0dd7" />

## Key Features

* **News Hub**: Stay updated with the latest gaming headlines, featuring smart tag filtering and server-side pagination.
* **Scalable Backend**: Deployed on Azure App Service (FastAPI), handling REST API requests efficiently.
* **NoSQL Data Layer**: Game metadata, sessions, and reviews stored in Azure Cosmos DB with flexible schema.
* **Event-Driven Processing**: Session events published to Azure Service Bus and consumed asynchronously by Azure Function App.
* **Secure Configuration**: API keys and connection strings stored safely in App Settings / Environment Variables.
* **Monitoring & Observability**: Application health, logs, metrics, and traces tracked using Azure Application Insights.
* **Game & News Integration**: Real-time data from RAWG API and NewsAPI via outbound HTTP calls.

## Cloud Design Highlights

* **Decoupled Architecture**
  * Backend does NOT handle async processing directly → delegated to serverless Function App via Service Bus.

* **Event-Driven Workflow**
  * User action → Backend publishes message → Service Bus trigger → Function App consumes → stores analytics in Cosmos DB.

* **Single Source of Truth**
  * Cosmos DB stores all game, session, and review data → processed and served dynamically by the backend.

* **Separation of Concerns**
  * Frontend (React) communicates only with the Backend via REST.
  * Backend is the single integration point for all external services.

## Azure Services Used

| Service | Role |
|---|---|
| **Azure App Service** (×2) | React frontend + FastAPI backend hosting |
| **Azure Cosmos DB** | NoSQL database for games, sessions, reviews |
| **Azure Service Bus** | Async message queue (event: `session_created`) |
| **Azure Function App** | Serverless consumer — processes events from Service Bus |
| **Azure Application Insights** | Telemetry: logs, metrics, traces from backend |
| **App Settings / Env Variables** | Secure storage for API keys and connection strings |

## External Integrations

* **RAWG API** — game metadata, covers, ratings
* **NewsAPI** — latest gaming headlines

## Architecture Connections

```
Browser (User)
  └─► Azure App Service (React Frontend)   HTTP Request (UI interaction)
        └─► Azure App Service (FastAPI Backend)   REST API calls (JSON)
              ├─► Azure Cosmos DB                 CRUD operations (games, sessions, reviews)
              ├─► Azure Service Bus               Publish message (event: session_created)
              ├─► External APIs (RAWG, News API)  HTTP requests (fetch external data)
              └─► Azure Application Insights      Telemetry (logs, metrics, traces)

Azure Service Bus
  └─► Azure Function App                   Trigger (message consumption)
        └─► Azure Cosmos DB                Process & store analytics data

App Settings / Environment Variables
  └─► Azure App Service (FastAPI Backend)  Configuration (API keys, connection strings)
```

## Deployment Overview

* **Frontend**: deployed on Azure App Service (Node/React build)
* **Backend**: deployed on Azure App Service (Python/FastAPI)
* **Database**: Azure Cosmos DB (serverless or provisioned throughput)
* **Async pipeline**: Service Bus queue → Function App trigger (consumption-based billing)

## Security

* No secrets stored in code or repository
* All API keys and connection strings managed via App Settings / Environment Variables
* Runtime access via secure environment injection
* HTTPS enforced on all App Service endpoints

## Monitoring & Observability

* Telemetry (logs, metrics, traces) collected via Azure Application Insights
* Backend instrumented with the Application Insights SDK
* Alerts configurable directly in Azure Monitor based on metric thresholds
