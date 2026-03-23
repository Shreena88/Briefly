from dataclasses import dataclass
from typing import Optional
import sqlite3
import os
from database import DB_PATH

@dataclass
class ScanProfile:
    name: str
    driver: str = "wia" # wia, twain
    device: Optional[str] = None
    dpi: int = 200
    paper_size: str = "a4" # a4, letter, auto
    color_mode: str = "color" # color, gray, bitonal
    id: Optional[int] = None

    @staticmethod
    def from_row(row):
        return ScanProfile(
            id=row[0],
            name=row[1],
            driver=row[2],
            device=row[3],
            dpi=row[4],
            paper_size=row[5],
            color_mode=row[6]
        )

def init_profiles_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            driver TEXT,
            device TEXT,
            dpi INTEGER,
            paper_size TEXT,
            color_mode TEXT
        )
    ''')
    conn.commit()
    conn.close()

def add_profile(profile: ScanProfile):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO profiles (name, driver, device, dpi, paper_size, color_mode)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (profile.name, profile.driver, profile.device, profile.dpi, profile.paper_size, profile.color_mode))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def update_profile(profile: ScanProfile):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE profiles 
        SET name=?, driver=?, device=?, dpi=?, paper_size=?, color_mode=?
        WHERE id=?
    ''', (profile.name, profile.driver, profile.device, profile.dpi, profile.paper_size, profile.color_mode, profile.id))
    conn.commit()
    conn.close()

def delete_profile(profile_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM profiles WHERE id=?', (profile_id,))
    conn.commit()
    conn.close()

def get_all_profiles():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM profiles ORDER BY name')
    rows = cursor.fetchall()
    conn.close()
    return [ScanProfile.from_row(row) for row in rows]

def get_profile_by_name(name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM profiles WHERE name=?', (name,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return ScanProfile.from_row(row)
    return None
