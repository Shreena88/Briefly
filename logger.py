"""
logger.py
====================================
Centralized logging configuration for the iisDMS application.

This module provides a consistent logging format across the application,
writing logs to both the console (stdout) and a file (`iisDMS.log`).

Usage:
    from logger import setup_logger
    logger = setup_logger(__name__)
    logger.info("Message")
"""

import logging
import os
import sys

def setup_logger(name=__name__):
    """
    Configures and returns a logger instance with standard formatting.
    
    Format:
        YYYY-MM-DD HH:MM:SS | Name | Level | Function:Line | Message
        
    Args:
        name (str): The name of the logger, typically __name__.
        
    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger(name)
    
    # Idempotency check: only add handlers if none exist to prevent duplicate logs
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        
        # Formatter: When - Who - Level - Where - What
        formatter = logging.Formatter(
            '%(asctime)s | %(name)s | %(levelname)s | %(funcName)s:%(lineno)d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # File Handler (logs to app.log)
        try:
            file_handler = logging.FileHandler('iisDMS.log', mode='a', encoding='utf-8')
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        except Exception as e:
            print(f"Failed to setup file logging: {e}")

        # Console Handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
    return logger
