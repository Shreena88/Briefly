import asyncio
import os
from intelligence_manager import IntelligenceManager
from dotenv import load_dotenv

async def main():
    load_dotenv()
    print("--- [AI KEY TESTER] ---")
    
    intel = IntelligenceManager()
    
    test_text = """
    TAX INVOICE
    Excellence Chairs
    GSTIN: 27AGTFPK4891C1ZD
    Invoice No: B67
    Invoice Date: 13/01/2026
    
    Bill To: Inside Infotech Solutions
    Amount Due: $5,782.00
    Payment Terms: Net 30
    """
    
    print(f"\n[1] Extractor Detected: {intel.model_name} at {intel.base_url}")
    print(f"[2] Key Format: {intel.api_key[:10]}...{intel.api_key[-4:]}")
    
    print("\n[3] Running Analysis (this may take 5-10 seconds)...")
    
    try:
        result = await intel.analyze_document(test_text)
        
        print("\n--- RESULTS ---")
        print(f"Summary: {result['summary']}")
        print(f"Entities Found: {result['entities']}")
        
        if "Error" in result['summary'] or "Offline" in result['summary']:
            print("\n❌ TEST FAILED: Check your API Key or Network Connection.")
        else:
            print("\n✅ TEST PASSED: Your Document Intelligence is LIVE!")
            
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")

# Run the test
if __name__ == "__main__":
    asyncio.run(main())
