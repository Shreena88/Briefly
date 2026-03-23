"""
native_scanner.py
====================================
Windows Image Acquisition (WIA) Wrapper.

This module provides a fallback scanning mechanism using the native Windows WIA dialog.
It requires `pywin32` (win32com) to interface with the OS COM objects.

Usage:
    scanner = NativeScanner()
    if scanner.available:
        scanner.scan("output.jpg")
"""

import os
import datetime
from logger import setup_logger

# Try importing win32com for WIA
try:
    import win32com.client
    WIA_AVAILABLE = True
except ImportError:
    WIA_AVAILABLE = False

logger = setup_logger("NativeScanner")

class NativeScanner:
    def __init__(self):
        self.available = WIA_AVAILABLE
        if not self.available:
            logger.warning("pywin32 not present. Native scanning unavailable.")

    def scan(self, output_path):
        """
        Scans an image using the Windows Native WIA Dialog.
        Returns True if successful, False otherwise.
        """
        if not self.available:
            logger.error("Native scan requested but WIA not available.")
            return False

        try:
            # WIA Common Dialog
            # This opens the standard Windows Scan UI
            wia_dialog = win32com.client.Dispatch("WIA.CommonDialog")
            
            # ShowAcquireImage args:
            # DeviceType=1 (Scanner), Intent=1 (Color), Bias=0 (MinMax), 
            # FormatID="{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}" (JPEG)
            # We'll let the user choose in the UI or use defaults
            image = wia_dialog.ShowAcquireImage()
            
            if image:
                # Save
                # WIA ImageFile object has SaveFile method
                # Ensure directory exists
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                
                # Check if file exists, WIA might error if overwrite?
                if os.path.exists(output_path):
                    os.remove(output_path)
                    
                image.SaveFile(output_path)
                logger.info(f"Native scan saved to: {output_path}")
                return True
            else:
                logger.info("User cancelled scan.")
                return False

        except Exception as e:
            # If user cancels, it throws a COM error usually
            s_e = str(e)
            if "0x80210015" in s_e: # WIA_ERROR_BUSY or Cancelled
                 logger.info("Scan cancelled by user.")
            else:
                 logger.error(f"Native Scan Error: {e}", exc_info=True)
            return False
