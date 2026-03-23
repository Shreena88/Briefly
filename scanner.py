"""
scanner.py
====================================
Primary Scanning Controller.

This module manages the interaction with scanner hardware/software.
It prioritizes using the NAPS2 Console (CLI) for robust scanning support (drivers/profiles).
If NAPS2 is unavailable, it typically falls back to the `native_scanner` module.

Dependencies:
    - native_scanner.py: Fallback WIA scanner.
    - profiles.py: Uses ScanProfile objects for configuration.
"""

import os
import subprocess
import shutil
from logger import setup_logger
from profiles import ScanProfile
from native_scanner import NativeScanner

logger = setup_logger("ScannerManager")

class ScannerManager:
    """
    Coordinates scanning operations, managing NAPS2 detection and execution.
    """
    def __init__(self):
        self.native_scanner = NativeScanner()
        
        self.naps2_path = self.detect_naps2()
        if self.naps2_path:
            logger.info(f"NAPS2 detected at: {self.naps2_path}")
        else:
            logger.warning("NAPS2.Console.exe not found")

    def detect_naps2(self):
        """
        Attempts to locate NAPS2.Console.exe in standard directories.
        """
        # 1. Check local "bin" folder (Portable / Single Entity Mode)
        # Structure: bin/naps2/App/NAPS2.Console.exe (Portable Layout)
        local_bin = os.path.abspath(os.path.join(os.path.dirname(__file__), "bin", "naps2", "App", "NAPS2.Console.exe"))
        if os.path.exists(local_bin):
            logger.info(f"Found portable NAPS2 at: {local_bin}")
            return local_bin

        # 2. Check path if added to env
        if shutil.which("NAPS2.Console"):
            return "NAPS2.Console"
            
        # 3. Common install locations
        possible_paths = [
            r"C:\Program Files\NAPS2\NAPS2.Console.exe",
            r"C:\Program Files (x86)\NAPS2\NAPS2.Console.exe",
            # Portable versions could be anywhere, maybe user config later
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
                
        return None

    def get_profiles(self):
        """
        Returns a list of profile names configured in NAPS2.
        """
        if not self.naps2_path:
            return []
            
        profiles = []
        try:
            # Run --listprofiles
            result = subprocess.run(
                [self.naps2_path, "--listprofiles"],
                capture_output=True,
                text=True,
                check=True
            )
            
            # Parse output
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if line.strip():
                    profiles.append(line.strip())
                    
        except Exception as e:
            logger.error(f"Failed to get profiles: {e}")
            
        return profiles

    def scan(self, profile: ScanProfile, output_path):
        """
        Performs a scan using the specified python ScanProfile object.
        """
        if not self.naps2_path:
             # Try Native Scanner Fallback/Primary if NAPS2 missing
             if self.native_scanner.available:
                 logger.info("NAPS2 missing, attempting Native WIA Scan...")
                 return self.native_scanner.scan(output_path)
             else:
                 raise FileNotFoundError("NAPS2 not found and Native Scanner unavailable")
            
        logger.info(f"Starting scan with profile '{profile.name}' to {output_path}")
        
        try:
            # Build args dynamically
            # NAPS2.Console -o "output.jpg" --dpi 300 --pagessize A4 ...
            args = [
                self.naps2_path,
                "-o", output_path,
                "--force",
                "--dpi", str(profile.dpi),
                "--pagessize", profile.paper_size,
                "--bitdepth", self._map_color_mode(profile.color_mode)
            ]
            
            # Driver selection if specified
            if profile.driver:
                args.extend(["--driver", profile.driver])
                
            # Device ID if specified
            if profile.device:
                args.extend(["--device", profile.device])

            subprocess.run(args, check=True)
            
            if os.path.exists(output_path):
                logger.info("Scan completed successfully")
                return True
            else:
                logger.error("Scan command finished but file not found")
                return False
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Scan failed: {e}")
            return False
        except Exception as e:
            logger.error(f"Error during scan: {e}")
            return False

    def _map_color_mode(self, mode):
        # NAPS2 expects: bw, gray, color
        mode = mode.lower()
        if "color" in mode: return "color"
        if "gray" in mode: return "gray"
        if "bitonal" in mode or "bw" in mode or "black" in mode: return "bw"
        return "color"

    def open_naps2_gui(self):
        """
        Opens the NAPS2 GUI for profile editing.
        """
        if not self.naps2_path:
            return False
            
        # Assuming NAPS2.exe is in the same folder as NAPS2.Console.exe
        gui_path = self.naps2_path.replace("NAPS2.Console.exe", "NAPS2.exe")
        
        if os.path.exists(gui_path):
            try:
                subprocess.Popen([gui_path])
                return True
            except Exception as e:
                logger.error(f"Failed to open NAPS2 GUI: {e}")
                return False
        return False
