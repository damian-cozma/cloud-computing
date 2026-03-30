# Game Tracker (Google Cloud Platform)

## Description
A full-stack gaming platform deployed on Google Cloud Platform, designed to manage personal game collections and deliver real-time content at scale.
This version extends the local application into a cloud-native architecture, leveraging managed services, serverless components, and event-driven processing.

## ☁️ Cloud Architecture
<img width="1049" height="472" alt="image" src="https://github.com/user-attachments/assets/124fb231-997d-45e8-8cc2-594555ee6b47" />

## Key Features
* **News Hub**: Stay updated with the latest gaming headlines, featuring smart tag filtering and server-side pagination.
* **Scalable Backend**: Deployed on App Engine, handling API requests efficiently.
* **Cloud Storage Optimization**: Images stored and served via Cloud Storage, with automatic resizing.
* **Event-Driven Processing**: Image processing handled asynchronously using Eventarc + Cloud Run.
* **Secure Secrets Management**: API keys stored safely in Secret Manager.
* **Monitoring & Alerts**: Application health tracked using Cloud Logging & Monitoring.
* **Game & News Integration**: Real-time data from RAWG API and NewsAPI.

## Cloud Design Highlights
* Decoupled Architecture
  * Backend does NOT process images directly → delegated to serverless service.
* Event-Driven Workflow
  * Upload → Eventarc trigger → Cloud Run → Thumbnail generation.
* Cost Optimization
  * Small images served instead of large originals → reduced bandwidth.
* Single Source of Truth
  * Database stores only original data → transformations done dynamically.

## Google Cloud Services Used
* App Engine: Main backend (FastAPI)
* Cloud Datastore: NoSQL database for game metadata
* Cloud Storage: Image storage (covers & thumbnails)
* Cloud Run: Image processing service (resize)
* Eventarc: Trigger system for storage events
* Secret Manager: Secure API key storage
* Cloud Logging: Application logs
* Cloud Monitoring: Metrics and alerting

## Deployment Overview
* **Backend**: deployed using Google App Engine
* **Image Processing**: Triggered via Eventarc, processed in Cloud Run
* **Storage**: Images stored in Cloud Storage bucket

## Security
* No secrets stored in code
* All API keys managed via Secret Manager
* Runtime access via secure environment injection

## Monitoring & Alerts
* Logs collected using Cloud Logging
* Notifications sent automatically
