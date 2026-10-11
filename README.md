# MediChain Omni — Clinical Intelligence Core

Federated Clinical Intelligence Network, Tiger Data Sentinel, Snowflake Vector RAG, and Solana Consent Layer.

## 🏥 Overview

MediChain Omni is an intelligent clinical decision support and outbreak surveillance platform designed to bridge hospital telemetry, federated outbreak analytics, and immutable patient audit trails.

- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide icons)
- **Backend**: FastAPI (Python), Sentinel Engine, Vector RAG (Snowflake & Healthcare Datasets), Live Outbreak Scraper, Solana Audit Trail

---

## 📁 Repository Structure

```
.
├── backend/                  # FastAPI intelligence server & analytics engines
│   ├── main.py               # API endpoints & core orchestrator
│   ├── sentinel.py           # Delhi-NCR Outbreak Sentinel engine
│   ├── healthcare_vector_db.py # Vector similarity search & RAG
│   ├── live_outbreak_scraper.py # Real-time outbreak registry
│   ├── snowflake_kb.py       # Snowflake knowledge base integration
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
│
└── frontend/                 # Next.js clinical dashboard
    ├── src/
    │   ├── app/              # App router pages & layouts
    │   └── components/       # Clinical UI decks, radar map, 3D anatomical viewer
    ├── package.json          # Node dependencies & scripts
    └── .env.example          # Frontend configuration template
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Run FastAPI server
uvicorn main:app --reload --port 8000
```

The API docs will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local if needed

# Run Next.js dev server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔒 Security Note

Never commit `.env` or `.env.local` files to version control. Reference `.env.example` templates for required variables.
