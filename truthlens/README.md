# TruthLens: Evidence-Based Misinformation Verification Platform

TruthLens is an evidence-first misinformation and news verification engine designed to combat digital falsehoods, misleading viral claims, and inaccurate headlines by routing assertions directly against official public records, government gazettes, and authoritative reporting repositories.

> **Visual & Architectural Principle:**  
> *"Evidence first, explanation second."*

---

## Current Status: Phase 3 (Evidence Retrieval Foundation — Free News API Provider)

This repository has completed **Phase 3 (Evidence Retrieval Foundation)**.  
The system now incorporates the first real evidence candidate retrieval layer powered by **Free News API** through an extensible **Evidence Orchestrator**.

### What is IMPLEMENTED:
- [x] **FastAPI Application & API Layer**: Modular backend architecture with Uvicorn server runtime.
- [x] **Health Check Endpoint**: `GET /api/health` providing service status and connectivity reporting.
- [x] **Evidence Search Endpoint**: `POST /api/evidence/search` querying news archives via Free News API.
- [x] **Free News API Provider**: Keyless, public article search integration with strict parameter validation and robust HTTP failure handling.
- [x] **Evidence Orchestrator**: Extensible abstraction layer performing deterministic deduplication and provider normalization.
- [x] **Normalized Evidence Model**: Pydantic `NormalizedEvidenceItem` standardizing candidate articles across current and future providers.
- [x] **Regional Sources Registry**: Documented official gazette and bureau directories for 6 priority jurisdictions.
- [x] **CORS Configuration**: Configured to allow communication between React frontend (`localhost:5173`) and FastAPI backend (`localhost:8000`).
- [x] **React / Vite / Tailwind CSS Frontend**: Modern, research-oriented UI with custom typography and dark theme.
- [x] **Centralized Axios API Service**: Handles health checks and evidence search requests from frontend.
- [x] **Real Evidence Presentation**: `ResultsPage` renders live candidate evidence records using `EvidenceCard` with safe external links (`rel="noopener noreferrer"`).
- [x] **Honest Verification Disclosure**: Clear callout: *"These are retrieved evidence sources, not a final fact-check. TruthLens has not yet compared the claim against the evidence."*

### What is NOT Implemented Yet (Planned Future Modules):
- [ ] **AI / NLP Models (Sentence Transformers / Hugging Face)**: Natural Language Inference (Entailment, Contradiction, Neutral) is NOT yet loaded or running.
- [ ] **External Search Engine (Brave Search API)**: Web evidence search is NOT active; no external search requests or API keys are configured.
- [ ] **Fact-Checking ClaimReview Ingestion (Google Fact Check / IFCN)**: ClaimReview schema lookup is NOT yet implemented.
- [ ] **OCR Engine (EasyOCR)**: Image and WhatsApp screenshot text extraction is NOT yet active.
- [ ] **Database Persistence (SQLite / ORM)**: Claims caching, user submission history, and persistent audit logs are NOT yet connected.
- [ ] **Authentication & User Accounts**: Intentionally excluded in this baseline phase.

---

## Planned Jurisdiction Coverage & Languages

### Priority Indian Jurisdictions
1. **Central Government / India** (Press Information Bureau - PIB, The Gazette of India, Central Ministries)
2. **Andhra Pradesh** (GoAP Portals, I&PR Department)
3. **Telangana** (GoTS Portals, Digital Media Wing)
4. **Tamil Nadu** (DIPR, TNeGA)
5. **Andaman & Nicobar Islands** (Administration Announcements & Portals)
6. **Jammu & Kashmir** (DIPR-J&K, Department of Information)

### Initial Language Priorities
- **English**
- **Telugu (తెలుగు)**
- **Tamil (தமிழ்)**

*The architecture is designed to extend dynamically to additional Indian states, Union Territories, and regional languages.*

---

## Architecture & Directory Layout

```
truthlens/
│
├── frontend/                     # React 18 + Vite + Tailwind CSS SPA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation & live backend health status
│   │   │   └── Footer.jsx        # Research disclosures & jurisdiction badges
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Claim submission console
│   │   │   ├── ResultsPage.jsx   # Results explanation placeholder
│   │   │   └── HistoryPage.jsx   # Audit history placeholder
│   │   ├── services/
│   │   │   └── api.js            # Axios client with environment base URL
│   │   ├── App.jsx               # React Router layout
│   │   ├── index.css             # Tailwind base & theme definitions
│   │   └── main.jsx              # React DOM entry
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                      # Python FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI entry, CORS, and router registry
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── health.py         # GET /api/health implementation
│   │   ├── schemas/
│   │   │   └── __init__.py       # Pydantic schemas (HealthResponse, etc.)
│   │   ├── services/
│   │   │   └── __init__.py       # Placeholder for search, NLI, and OCR services
│   │   ├── models/
│   │   │   └── __init__.py       # Placeholder for SQLite database models
│   │   └── sources/
│   │       └── __init__.py       # Registry for official government portals
│   ├── requirements.txt          # Minimal Python dependencies
│   └── .env.example
│
├── .gitignore                    # Git exclusions for venv, env files, node_modules
└── README.md                     # Documentation
```

---

## Getting Started: Local Development

### Prerequisites
- **Python**: 3.10+ (tested with Python 3.14)
- **Node.js**: 18.0+ (tested with Node.js v22.19)
- **npm**: 9.0+ (tested with npm 11.7)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd truthlens/backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend development server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. **Verify backend**:
   - Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
   - Interactive OpenAPI documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd truthlens/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment configuration**:
   Ensure `.env` exists (copied from `.env.example`):
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Run the frontend development server**:
   ```bash
   npm run dev
   ```

5. **Access the web application**:
   - Open [http://localhost:5173](http://localhost:5173) in your browser.
   - The top navigation bar will automatically ping `GET /api/health` and indicate `Backend: Online` when connected.

---

## Roadmap

| Phase | Focus | Status |
|---|---|---|
| **Phase 1** | Foundation: FastAPI + React + Vite + Tailwind + Health check | **Completed** |
| **Phase 2** | Frontend Verification Experience: Form, URL validation, EvidenceCard, Results Shell | **Completed** |
| **Phase 3** | Evidence Retrieval Foundation: Free News API Provider, Orchestrator, Normalization | **Completed** |
| **Phase 4** | Multilingual NLI & Claim Decomposition: Sentence Transformers, Cross-lingual inference | Next |
| **Phase 5** | Persistence & Audit: SQLite claims database, historical tracking | Upcoming |
