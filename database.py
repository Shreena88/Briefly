"""
database.py
====================================
SQLite database interaction layer.

This module handles all persistent storage operations, including initializing
the schema, adding documents, updating statuses, and retrieving history.

Dependencies:
    - models.py: Uses the Document data class.
    - profiles.py: Initializes the scanner profiles table.
"""

import sqlite3
import os
import sys
from datetime import datetime
from models import Document

def get_base_path():
    """
    Returns the base application path.
    - Frozen (PyInstaller): The folder containing the executable.
    - Dev (Script): The folder containing this script (app/).
    """
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

BASE_DIR = get_base_path()
DB_PATH = os.path.join(BASE_DIR, "data", "iisDMS.db")


def init_db():
    """
    Initializes the SQLite database and creates necessary tables (documents).
    Also triggers profile table initialization.
    
    Schema:
        documents: Stores metadata for every scanned/imported file.
    """
    os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if we need to migrate from old schema (remove labels)
    cursor.execute("PRAGMA table_info(documents)")
    existing_cols = [c[1] for c in cursor.fetchall()]
    if 'label' in existing_cols:
        cursor.execute("DROP TABLE documents")
        conn.commit()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE,
            filename TEXT,
            status TEXT,
            tags TEXT,
            scan_date TEXT,
            metadata TEXT
        )
    ''')
    
    # Schema Migration: Add missing columns if they don't exist
    columns_to_add = [
        ("metadata", "TEXT")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE documents ADD COLUMN {col_name} {col_type}")
        except sqlite3.OperationalError:
            pass # Already exists
        
    conn.commit()
    conn.close()
    
    # Initialize Profiles Table (Cross-module dependency)
    from profiles import init_profiles_table
    init_profiles_table()

def add_document(path, metadata_json="{}"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    filename = os.path.basename(path)
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        cursor.execute('''
            INSERT INTO documents (path, filename, status, tags, scan_date, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (path, filename, "Pending", "", date_str, metadata_json))
        conn.commit()
    except sqlite3.IntegrityError:
        pass # Already exists
    conn.close()

def update_status(path, status):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE documents SET status = ? WHERE path = ?', (status, path))
    conn.commit()
    conn.close()

def update_metadata(path, metadata_json):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE documents SET metadata = ? WHERE path = ?', (metadata_json, path))
    conn.commit()
    conn.close()

def delete_document(path):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM documents WHERE path = ?', (path,))
    conn.commit()
    conn.close()

def get_all_documents():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM documents ORDER BY id ASC')
    rows = cursor.fetchall()
    conn.close()
    return [Document.from_row(row) for row in rows]

def reset_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM documents')
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='documents'")
    conn.commit()
    conn.close()
