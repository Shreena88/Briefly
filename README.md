# InfoDoc Engine 🚀 🏢

**InfoDoc Engine** is a high-performance, institutional-grade AI Document Intelligence Platform. It combines advanced OCR technology with neural language models to transform static archival scans into rich, machine-readable intelligence.

---

## 🏛️ Features

### 1. Neural Archival Scans
Transform paper archives into high-fidelity digital assets using the specialized scanning engine. Supports both bulk image uploads (PNG/JPG) and institutional PDF documents.

### 2. Deep Executive Summaries
Powered by LLM AI, the system automatically generates professional executive summaries for every document, identifying the nature, parties, and intent of the correspondence in seconds.

### 3. Automated Entity Auditing
The engine automatically extracts and categorizes critical data points:
- **Stakeholders**: Named individuals and organizations.
- **Financials**: Multi-currency amount detection.
- **Temporal Data**: Key dates and deadlines.
- **Identifiers**: (New) Invoice numbers, serial IDs, and document keys.
- **Keywords**: Semantic key mappings of document content.

### 4. Side-by-Side Verification
An immersive audit view allows users to verify original "Archival Source Plates" against the "Binary Text Capture" in a high-speed, split-screen environment.

### 5. Persistent Intelligence Archive
All processed documents are saved to a local state-persistence layer, ensuring your neural extractions and summaries survive system restarts.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Tailwind CSS (Glassmorphism design), Zustand State Management.
- **Backend**: FastAPI, PyMuPDF (fitz), Tesseract OCR Engine.
- **AI Engine**: Groq (Llama-3.1 model) for high-speed neural intelligence.
- **DMS Core**: Spacy (Natural Language Processing).

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js & npm (latest)
- Tesseract OCR (installed and in system PATH)

### 1. Backend Setup
```bash
git clone https://github.com/Shreena88/InfoDoc-Engine.git
cd AI_OCR_Suite
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# AI Intelligence Key
XAI_API_KEY=your_groq_api_key_here
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Launch the Engine
Open a separate terminal and run the backend:
```bash
python api.py
```

---

