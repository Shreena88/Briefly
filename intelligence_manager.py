import spacy
import os
import json
import httpx
import re
from dotenv import load_dotenv
from logger import setup_logger

load_dotenv()
logger = setup_logger("IntelligenceManager")

class IntelligenceManager:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy en_core_web_sm model")
        except Exception as e:
            logger.warning(f"spaCy model not found: {e}. Falling back to regex extraction.")
            self.nlp = None

        self.api_key = os.getenv("XAI_API_KEY", "").strip() or os.getenv("GROQ_API_KEY", "").strip()
        
        # Determine Provider
        if self.api_key.startswith("gsk_"):
            self.base_url = "https://api.groq.com/openai/v1"
            self.model_name = "llama-3.1-8b-instant" # Updated to non-decommissioned version
            logger.info("Using Groq (LLaMA 3.1) model for intelligence.")
        else:
            self.base_url = "https://api.x.ai/v1"
            self.model_name = "grok-1"
            logger.info("Using xAI (Grok) model for intelligence.")

    def extract_entities(self, text):
        entities = {
            "amounts": [],
            "dates": [],
            "names": [],
            "invoice_numbers": [],
            "key_terms": []
        }
        
        if not text:
            return entities

        def get_context(full_text, start_idx, end_idx, window=40):
            start = max(0, start_idx - window)
            end = min(len(full_text), end_idx + window)
            return full_text[start:end].replace("\n", " ").strip()

        # 1. Regex Extraction (Always run for accuracy in invoices)
        # We'll search for these first to get offsets
        invoice_regex = r"(?:Invoice|Ref|ID|No\.?)\s*:?\s*([A-Z0-9\-/]{5,})"
        money_regex = r"(?:Rs\.?|INR|USD|\$)\s*[\d,]+(?:\.\d{2})?"
        date_regex = r"\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b"

        for match in re.finditer(invoice_regex, text, re.IGNORECASE):
            entities["invoice_numbers"].append({
                "raw": match.group(1),
                "context": get_context(text, match.start(), match.end())
            })

        for match in re.finditer(money_regex, text):
            entities["amounts"].append({
                "raw": match.group(0),
                "context": get_context(text, match.start(), match.end())
            })

        for match in re.finditer(date_regex, text):
            entities["dates"].append({
                "raw": match.group(0),
                "context": get_context(text, match.start(), match.end())
            })

        # 2. spaCy Extraction
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                context = get_context(text, ent.start_char, ent.end_char)
                if ent.label_ in ["DATE", "TIME"]:
                    if not any(d["raw"] == ent.text for d in entities["dates"]):
                        entities["dates"].append({"raw": ent.text, "context": context})
                elif ent.label_ in ["MONEY"]:
                    if not any(a["raw"] == ent.text for a in entities["amounts"]):
                        entities["amounts"].append({"raw": ent.text, "context": context})
                elif ent.label_ in ["ORG"]:
                    if not any(n["name"] == ent.text for n in entities["names"]):
                        entities["names"].append({"name": ent.text, "context": context})

        # 3. Key Terms
        key_terms_list = ["payment due", "subtotal", "tax", "gst", "total", "remittance", "bank details", "tds", "igst", "cgst", "sgst"]
        for term in key_terms_list:
            if term.lower() in text.lower():
                entities["key_terms"].append(term)

        # 4. Cleanup & Filtering (Simplified for brevity in bridge)
        # Filter names (organizations)
        blacklist = ["total", "gst", "tds", "tax", "invoice", "date", "number", "qty", "unit", "amount", "net value"]
        entities["names"] = [
            n for n in entities["names"]
            if len(n["name"]) > 2 and n["name"].lower() not in blacklist and not n["name"].isdigit()
        ]
        
        return entities

    async def generate_summary(self, text, entities):
        if not self.api_key:
            return "Intelligence Offline: Please set XAI_API_KEY or GROQ_API_KEY in your .env file."

        prompt = f"""
        You are an expert archival document analyst for an enterprise intelligence system.
        
        TASK:
        Generate a professional executive summary based on the provided OCR text and extracted data. 
        If the input contains multiple different documents (e.g. an ID card followed by an invoice), please describe each one clearly.

        ANALYSIS FOCUS:
        1. NATURE: What kind of document(s) are these? (e.g., Governmental ID, Commercial Invoice, Legal Letter).
        2. PARTIES: Explicitly name all major organizations, government bodies, and individuals mentioned.
        3. FINANCIALS: Identify all monetary values, fees, or taxes found.
        4. TIMELINE: Mention all significant dates (issuance, expiry, due dates).
        5. IDENTIFIERS: Include any unique serial numbers, ID numbers, or invoice references.

        STRICT OUTPUT RULES:
        - Return EXACTLY one paragraph (no lists, no JSON).
        - Use professional, human-readable language (analyst tone).
        - DO NOT use bullet points or "Key Terms" headings.
        - Aim for a detailed summary of approximately 4-7 sentences.

        DETECTED CONTEXT (SAMPLED):
        - DATES: {entities.get('dates', [])[:5]}
        - AMOUNTS: {entities.get('amounts', [])[:5]}
        - IDENTIFIERS: {entities.get('invoice_numbers', [])[:5]}
        - ORGANIZATIONS/NAMES: {entities.get('names', [])[:5]}

        SOURCE OCR TEXT (SAMPLE):
        {text[:2500]}
        """

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": "You are a professional archival researcher. Your goal is to convert raw OCR data into a clear, descriptive narrative summary useful for administrative audits. DO NOT use technical formats like JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.2,
                        "max_tokens": 1024
                    },
                    timeout=20.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    summary = data['choices'][0]['message']['content'].strip()
                    
                    # Post-processing: Remove JSON structures if the model leaked them
                    if summary.startswith("{") or "```json" in summary.lower():
                        # Use regex to find text outside of JSON if it exists, or just try to clean it
                        summary = re.sub(r'```json.*?```', '', summary, flags=re.DOTALL)
                        summary = re.sub(r'\{.*?\}', '', summary, flags=re.DOTALL)
                        summary = summary.strip()
                        if not summary: # If it was pure JSON, try to extract 'summary' or 'content' key
                             try:
                                 # This is a fallback if the AI really insists on JSON
                                 import json
                                 j = json.loads(data['choices'][0]['message']['content'].strip())
                                 raw_summary = j.get("summary", j.get("content", j))
                                 
                                 if isinstance(raw_summary, list):
                                     summary = " ".join([str(s) for s in raw_summary])
                                 else:
                                     summary = str(raw_summary)
                                     
                             except:
                                 pass
                    
                    return summary
                else:
                    logger.error(f"API Error: {response.status_code} - {response.text}")
                    return f"AI Summary unavailable (API Error {response.status_code}). Check your API key permissions."
        except Exception as e:
            logger.error(f"Intelligence processing failed: {e}")
            return f"Thinking... (Error: {str(e)})"

    async def analyze_document(self, text):
        if not text or len(text.strip()) < 5:
            return {"entities": {}, "summary": "Waiting for document content..."}
            
        entities = self.extract_entities(text)
        logger.info(f"Entities extracted with keys: {list(entities.keys())}")
        summary = await self.generate_summary(text, entities)
        
        return {
            "entities": entities,
            "summary": summary
        }
