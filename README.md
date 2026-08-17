<div align="center">

# 🧠 Intelligent Learning Platform
### *AI-Powered Semantic Study Assistant with RAG, Vector Search & Real-Time Analytics*

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FAISS](https://img.shields.io/badge/FAISS-Vector_Search-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)](https://github.com/facebookresearch/faiss)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

<p align="center">
  <b>An AI-powered study platform leveraging RAG & FAISS vector search to transform PDFs & notes into interactive Q&A, practice quizzes, 3D flashcards, and personalized analytics.</b>
</p>

</div>

<br/>

## 🌌 Overview

The **Intelligent Learning Platform** is an enterprise-grade AI study environment built on **Retrieval-Augmented Generation (RAG)** and **Dense Vector Embeddings**. Users can upload course documents or write text notes, query their material through semantic vector search, automatically synthesize educational materials, and track retention metrics over time.

```
                  +-------------------------------------------------+
                  |      React 18 Dark Academic Dashboard (Vite)     |
                  +-------------------------------------------------+
                                           |
                                           v
                  +-------------------------------------------------+
                  |        FastAPI High-Performance REST Engine     |
                  +-------------------------------------------------+
                      /                    |                    \
                     v                     v                     v
          +-------------------+  +-------------------+  +-------------------+
          |  PyPDF Ingestion  |  | SentenceTransform |  | PostgreSQL / DB   |
          |  & Sentence Chunk |  |  (384-D Vector)   |  | Analytics Metrics |
          +-------------------+  +-------------------+  +-------------------+
                                           |
                                           v
                                 +-------------------+
                                 |  FAISS Vector Store|
                                 |  Hybrid RAG Engine|
                                 +-------------------+
```

---

## 🔥 Key Features

<table>
  <tr>
    <td width="50%">
      <h3 align="center">📄 PDF & Notes Semantic Hub</h3>
      <ul>
        <li>Page-by-page text parsing for <code>.pdf</code> and <code>.txt</code> documents.</li>
        <li><b>Semantic Sentence-Boundary Chunking</b> ensures ideas remain whole.</li>
        <li>Persistent 384-dimensional vector indexing using <code>all-MiniLM-L6-v2</code> & FAISS.</li>
      </ul>
    </td>
    <td width="50%">
      <h3 align="center">🤖 Context-Aware RAG Workspace</h3>
      <ul>
        <li>Natural language Q&A over single or multi-document scope.</li>
        <li>Sub-second similarity search combining <b>Dense Vector + Sparse Reranking</b>.</li>
        <li>Click-to-expand source citations with exact page numbers and similarity scores.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3 align="center">⚡ AI Material Generators</h3>
      <ul>
        <li><b>Smart Summaries</b>: Executive overviews, bulleted takeaways & vocabulary terms.</li>
        <li><b>Practice Quizzes</b>: Multiple-choice questions with instant scoring & explanations.</li>
        <li><b>3D Flashcards</b>: Interactive active-recall flip cards with self-assessment ratings.</li>
      </ul>
    </td>
    <td width="50%">
      <h3 align="center">📊 Analytics & Mastery Recommendations</h3>
      <ul>
        <li>Real-time tracking of quiz accuracy %, study duration, and velocity.</li>
        <li>Topic weakness detection highlighting sub-70% retention areas.</li>
        <li>Personalized AI study recommendations linking directly to targeted flashcard decks.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend API** | `FastAPI` (Python 3.11) | High-throughput asynchronous REST API server |
| **Database** | `PostgreSQL` / `SQLite` | Persistent storage for documents, study materials, and analytics |
| **Embeddings** | `Sentence-Transformers` (`all-MiniLM-L6-v2`) | 384-dimensional dense semantic vector representations |
| **Vector Store** | `FAISS` (`IndexFlatIP`) | Fast vector similarity search and index persistence |
| **PDF Extraction** | `PyPDF` | Document parsing and page text extraction |
| **Frontend UI** | `React 18` + `Vite` + `Tailwind CSS` | Modern responsive academic interface with 3D card flips |
| **Icons** | `Lucide-React` | Crisp vector interface icons |
| **Containers** | `Docker` & `Docker Compose` | Multi-stage production container orchestration |

---

## 🚀 Quick Start Guide

### Option 1: Run with Docker (Recommended)

Run the entire platform with PostgreSQL, FastAPI, and Nginx React frontend in a single command:

```bash
docker-compose up --build
```
Access the web dashboard at `http://localhost:3000`.

---

### Option 2: Local Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI application
python main.py
```
> API available at `http://127.0.0.1:8000` | Interactive OpenAPI Docs at `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server
npm run dev
```
> Web UI available at `http://localhost:3000`

---

## 📁 Repository Structure

```
Intelligent-Learning-Platform/
├── backend/
│   ├── app/
│   │   ├── api/          # REST Endpoint Controllers (documents, rag, generator, analytics)
│   │   ├── core/         # App Config & SQLAlchemy Database Connection
│   │   ├── models/       # Database Entities (Document, StudyMaterial, QuizAttempt)
│   │   ├── schemas/      # Pydantic Validation Models
│   │   └── services/     # Core RAG, Sentence-Transformers, FAISS & Analytics Engines
│   ├── main.py           # FastAPI Main Entrypoint
│   ├── Dockerfile        # Backend Container Specification
│   └── requirements.txt  # Python Dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # React Components (RagChat, QuizRunner, Flashcards, Analytics)
│   │   ├── services/     # Axios API Client
│   │   ├── App.jsx       # App Root & Tab State
│   │   └── index.css     # Tailwind Imports & 3D CSS Effects
│   ├── Dockerfile        # Frontend Container Specification
│   ├── nginx.conf        # Production Reverse Proxy Configuration
│   └── vite.config.js    # Vite Build Config
├── docker-compose.yml    # Single-Command Orchestration
├── run_app.py            # CLI Python Startup Script
└── README.md
```

---

<div align="center">

### 🌟 Developed with Precision for Advanced Learning & Semantic Search 🌟

</div>
