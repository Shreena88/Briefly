"""
ocr_manager.py
====================================
OCR Management via NAPS2.

This module leverages the NAPS2 Console to perform OCR tasks,
removing the need for a separate Tesseract installation.
It supports:
1. Creating searchable PDFs from images.
2. Extracting text from images (via intermediate PDF serialization).
3. Discovering installed OCR languages in NAPS2.

Dependencies:
    - scanner.py: To locate NAPS2.
    - pymupdf (fitz): To extract text from generated PDFs.
"""

import os
import subprocess
import shutil
import tempfile
import glob
from concurrent.futures import ThreadPoolExecutor, as_completed
from logger import setup_logger
# from scanner import ScannerManager (Unused and causing import issues)

logger = setup_logger("OCRManager")

class OCRManager:
    """
    Manages OCR operations using the bundled Tesseract binary directly.
    """
    def __init__(self):
        # Locate bundled Tesseract
        # bin/naps2/App/lib/_win64/tesseract.exe
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.tesseract_exe = os.path.join(base_dir, "bin", "naps2", "App", "lib", "_win64", "tesseract.exe")
        
        # Locate tessdata
        # bin/naps2/Data/tessdata
        self.tessdata_dir = os.path.join(base_dir, "bin", "naps2", "Data", "tessdata")
        
        if os.path.exists(self.tesseract_exe):
             logger.info(f"OCR Manager using Bundled Tesseract: {self.tesseract_exe}")
        else:
             logger.warning(f"Bundled Tesseract not found at: {self.tesseract_exe}")
             # Search for other locations (Same as backend logic)
             candidates = [
                 r"C:\Program Files\tessaract\tesseract.exe",
                 r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                 r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                 r"C:\Program Files\tessaract folder\tesseract.exe",
                 r"C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe".format(os.getlogin())
             ]
             
             self.tesseract_exe = None
             for cand in candidates:
                 if os.path.exists(cand):
                     self.tesseract_exe = cand
                     logger.info(f"Tesseract found at custom path: {self.tesseract_exe}")
                     break
             
             if not self.tesseract_exe:
                 logger.error("No Tesseract executable found on system.")

    def is_available(self):
        exists = self.tesseract_exe is not None and os.path.exists(self.tesseract_exe)
        if not exists:
            logger.error(f"OCR ENGINE NOT FOUND: Tried looking at {self.tesseract_exe}")
        return exists

    def get_text(self, image_path, lang='eng', save_to_file=False, page_number=None, output_txt_path=None, fast_mode=False):
        """
        Extracts raw text from an image using Tesseract stdout with diagnostic logging.
        """
        if not self.is_available():
            return "ERROR: Tesseract binary not found. Check server logs."
        
        cwd_path = os.path.dirname(self.tesseract_exe)
        try:
            image_path = os.path.abspath(image_path)
            cmd = [
                self.tesseract_exe,
                image_path,
                "stdout",
                "-l", lang,
                "--tessdata-dir", self.tessdata_dir
            ]
            
            if fast_mode:
                cmd.extend(["--psm", "3", "--oem", "1"])
            
            logger.info(f"Executing OCR: {' '.join(cmd)}")
            
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                startupinfo=startupinfo, 
                encoding='utf-8', 
                errors='replace',
                cwd=cwd_path,
                timeout=30
            )
            
            if result.returncode == 0:
                extracted_text = result.stdout.strip()
                if not extracted_text:
                    logger.warning(f"OCR successful but returned EMPTY text for: {image_path}")
                else:
                    logger.info(f"OCR Success: Captured {len(extracted_text)} characters.")
                
                if save_to_file and output_txt_path:
                    try:
                        mode = 'a' if os.path.exists(output_txt_path) else 'w'
                        with open(output_txt_path, mode, encoding='utf-8') as f:
                            if page_number is not None:
                                f.write(f"\n{'='*60}\nPAGE {page_number}\n{'='*60}\n")
                            f.write(extracted_text + "\n")
                        logger.info(f"Saved OCR text to: {output_txt_path}")
                    except Exception as e:
                        logger.error(f"Failed to save text to file: {e}")
                return extracted_text
            else:
                logger.error(f"OCR FAILED (Code {result.returncode}): {result.stderr}")
                return ""
        except Exception as e:
            logger.error(f"OCR EXCEPTION: {str(e)}")
            return ""

    def create_searchable_pdf(self, image_paths, output_path, lang='eng+hin+guj+mar', save_text=False):
        """
        Creates a searchable PDF from a list of images using parallel processing for speed.
        """
        if not self.is_available():
            raise EnvironmentError("Tesseract not found.")

        import fitz
        from concurrent.futures import ThreadPoolExecutor, as_completed
        import tempfile

        # Binary definition should be in same folder as DLLs
        cwd_path = os.path.dirname(self.tesseract_exe)
        temp_dir = tempfile.mkdtemp()

        def ocr_page(img_path, page_num):
            """Process a single page to a searchable PDF chunk"""
            chunk_base = os.path.join(temp_dir, f"page_{page_num:04d}")
            cmd = [
                self.tesseract_exe,
                img_path,
                chunk_base,
                "-l", lang,
                "--tessdata-dir", self.tessdata_dir,
                "--psm", "3",
                "--oem", "1",
                "pdf"
            ]
            
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            
            subprocess.run(cmd, check=True, startupinfo=startupinfo, cwd=cwd_path)
            return chunk_base + ".pdf"

        try:
            logger.info(f"⚡ Creating searchable PDF (Parallel) for {len(image_paths)} pages...")
            
            # 1. OCR all pages in parallel
            pdf_chunks = {}
            max_threads = min(8, os.cpu_count() or 4)
            
            with ThreadPoolExecutor(max_workers=max_threads) as executor:
                futures = {
                    executor.submit(ocr_page, img_path, i): i 
                    for i, img_path in enumerate(image_paths)
                }
                
                for future in as_completed(futures):
                    page_num = futures[future]
                    try:
                        pdf_chunks[page_num] = future.result()
                    except Exception as e:
                        logger.error(f"Failed to OCR page {page_num}: {e}")

            if not pdf_chunks:
                return False

            # 2. Merge chunks using fitz (Extremely fast)
            final_doc = fitz.open()
            for i in sorted(pdf_chunks.keys()):
                chunk_path = pdf_chunks[i]
                if os.path.exists(chunk_path):
                    with fitz.open(chunk_path) as m_doc:
                        final_doc.insert_pdf(m_doc)
            
            final_doc.save(output_path, garbage=4, deflate=True)
            final_doc.close()
            
            logger.info(f"✅ Searchable PDF saved: {output_path}")
            return True

        except Exception as e:
            logger.error(f"Parallel PDF Creation Failed: {e}")
            return False
        finally:
            # Clean up all temp files
            try:
                shutil.rmtree(temp_dir)
            except:
                pass
