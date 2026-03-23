from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import tempfile
import json
import asyncio
import base64
import time
import datetime
from concurrent.futures import ThreadPoolExecutor
import fitz  # PyMuPDF
import uuid
from ocr_manager import OCRManager
from intelligence_manager import IntelligenceManager
from logger import setup_logger

logger = setup_logger("API")
app = FastAPI()

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Managers
ocr = OCRManager()
intelligence = IntelligenceManager()

# Global stats (Mocked for now, could be pulled from DB)
stats_store = {
    "total_processed": 12,
    "success_rate": 98,
    "entities_extracted": 450,
    "system_status": "Operational",
    "recent_activity": []
}

# Local Persistence Path
STORE_PATH = os.path.join(os.path.dirname(__file__), "archival_intelligence.json")

def load_store():
    if os.path.exists(STORE_PATH):
        try:
            with open(STORE_PATH, "r") as f:
                return json.load(f)
        except:
            return []
    return []

def save_to_store(doc):
    store = load_store()
    # Prepend new document to keep recent-first (or we can use reverse slice in list_docs)
    store.insert(0, doc)
    with open(STORE_PATH, "w") as f:
        json.dump(store, f, indent=4)

# Load current state
document_store = load_store()

@app.get("/api/stats")
async def get_stats():
    return stats_store

@app.get("/api/documents")
async def list_docs():
    # Store is now prepended on save, so no reverse needed
    return load_store()

import hashlib

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Main endpoint for frontend uploads.
    Performs duplicate check, OCR on all pages, generates base64 previews, and runs intelligence.
    """
    start_time = time.time()
    content = await file.read()
    
    # Duplicate Detection using SHA-256 Content Hash
    file_hash = hashlib.sha256(content).hexdigest()
    if any(d.get("file_hash") == file_hash for d in document_store):
        raise HTTPException(status_code=409, detail=f"The document '{file.filename}' has already been processed.")

    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        pages = []
        full_text = ""
        
        if file.filename.lower().endswith('.pdf'):
            doc = fitz.open(file_path)
            num_pages = len(doc)
            
            for i in range(num_pages):
                page = doc.load_page(i)
                zoom = 150 / 72 
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat)
                
                img_path = os.path.join(temp_dir, f"page_{i}.png")
                pix.save(img_path)
                
                page_text = ocr.get_text(img_path, lang='eng', fast_mode=True)
                full_text += f"\n--- Page {i+1} ---\n{page_text}"
                
                with open(img_path, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                
                pages.append({
                    "page_number": i + 1,
                    "ocr_text": page_text,
                    "image_base64": f"data:image/png;base64,{encoded_string}"
                })
            doc.close()
        else:
            # Single Image
            page_text = ocr.get_text(file_path, lang='eng', fast_mode=True)
            full_text = page_text
            
            encoded_string = base64.b64encode(content).decode('utf-8')
            
            pages.append({
                "page_number": 1,
                "ocr_text": page_text,
                "image_base64": f"data:image/png;base64,{encoded_string}"
            })

        # Intelligence Analysis
        analysis = await intelligence.analyze_document(full_text)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Construct Response
        doc_id = str(uuid.uuid4())[:12].upper()
        response_data = {
            "document_id": doc_id,
            "file_hash": file_hash,
            "filename": file.filename,
            "status": "Success",
            "page_count": len(pages),
            "file_size_bytes": len(content),
            "processing_time_ms": processing_time,
            "full_text": full_text.strip(),
            "summary": analysis.get("summary", ""),
            "entities": analysis.get("entities", {}),
            "pages": pages
        }
        
        # Persistent Storage
        save_to_store(response_data)
        
        # Update Stats Store (Global runtime only)
        stats_store["total_processed"] += 1
        stats_store["recent_activity"].insert(0, {
            "id": response_data["document_id"],
            "filename": file.filename,
            "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "status": "Success"
        })
        
        return response_data

    except HTTPException:
        # Re-raise HTTP exceptions (like our 409)
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.get("/api/documents/{document_id}/export-txt")
async def export_doc_txt(document_id: str):
    # Lookup in persistent store
    store = load_store()
    doc = next((d for d in store if d["document_id"] == document_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document extraction data not found in persistent archive.")
    
    # Generate Structured Text Report
    report_lines = [
        "================================================",
        "      NEURAL ARCHIVAL INTELLIGENCE REPORT       ",
        "================================================",
        f"FILENAME: {doc['filename']}",
        f"DOC ID:   {doc['document_id']}",
        f"EXTR DATE: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "------------------------------------------------",
        "",
        "EXECUTIVE SUMMARY:",
        doc.get("summary", "N/A"),
        "",
        "------------------------------------------------",
        "EXTRACTED AUDIT ENTITIES:",
    ]
    
    entities = doc.get("entities", {})
    for key, list_vals in entities.items():
        if list_vals:
            report_lines.append(f"\n[{key.upper()}]")
            for item in list_vals:
                if isinstance(item, dict):
                    val = item.get("raw", item.get("name", str(item)))
                    context = item.get('context', 'N/A')
                    report_lines.append(f" • {val}")
                    report_lines.append(f"   Context: {context}")
                else:
                    report_lines.append(f" • {item}")
    
    report_lines.append("\n" + "------------------------------------------------")
    report_lines.append("FULL OCR LAYERS (RAW EXTRACTION):")
    
    for p in doc.get("pages", []):
        report_lines.append(f"\n--- PAGE {p['page_number']} ---")
        report_lines.append(p["ocr_text"])
        report_lines.append("-" * 20)
    
    report_text = "\n".join(report_lines)
    
    return Response(
        content=report_text,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={doc['filename'].split('.')[0]}_extraction.txt"}
    )

@app.get("/api/documents/{id}")
async def get_document(id: str):
    doc = next((d for d in document_store if d["document_id"] == id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.post("/api/ocr")
async def process_document_simple(file: UploadFile = File(...)):
    # Legacy support or simple OCR
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        text = ocr.get_text(file_path, fast_mode=True)
        return {"text": text}
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    import uvicorn
    # Start on 8005 to match original logic but update client.js to match
    uvicorn.run(app, host="0.0.0.0", port=8005)
