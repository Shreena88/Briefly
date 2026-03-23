"""
models.py
====================================
Data classes representing the core entities in the application.

This module defines the structure of data objects used throughout the system,
primarily for decoupling database rows from application logic.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Document:
    """
    Represents a single scanned or imported document.
    
    Attributes:
        path (str): Absolute file path to the image/document.
        filename (str): Base name of the file.
        status (str): Current workflow status (e.g., 'Pending', 'Completed').
        tags (str): Comma-separated tags for categorization.
        scan_date (str): Timestamp of creation/import.
        metadata (str): JSON string containing extra attributes (e.g., OCR data).
        label: str = "Unknown"  # Memory-only (not saved to iisDMS.db)
        confidence: float = 0.0 # Memory-only
        embedding_id: str = ""  # Memory-only
        id: Optional[int] = None
    """
    path: str
    filename: str
    status: str = "Pending"  # Pending, Approved, Rejected/Retake
    tags: str = ""
    scan_date: str = ""
    metadata: str = ""
    label: str = "Unknown"
    confidence: float = 0.0
    embedding_id: str = ""
    id: Optional[int] = None

    @staticmethod
    def from_row(row):
        # row: (id, path, filename, status, tags, scan_date, metadata)
        meta = "{}"
        if len(row) > 6: 
            meta = row[6]
        
        return Document(
            id=row[0],
            path=row[1],
            filename=row[2],
            status=row[3],
            tags=row[4],
            scan_date=row[5],
            metadata=meta
        ) 
