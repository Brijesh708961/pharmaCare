import os
import json
import hashlib
import secrets
from typing import Dict, Optional, Tuple

USERS_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "users.json")

def _seed_demo_users(db: Dict):
    changed = False
    demo_users = [
        ("Dr. Demo", "doctor@gmail.com", "doctor"),
        ("John Doe", "patient@gmail.com", "patient")
    ]
    for name, email, role in demo_users:
        if email not in db["users"]:
            db["users"][email] = {
                "name": name,
                "email": email,
                "password_hash": _hash_password("12345678"),
                "role": role,
                "wallet_address": None
            }
            changed = True
    if changed:
        _save_db(db)

def _load_db() -> Dict:
    if not os.path.exists(USERS_DB_PATH):
        db = {"users": {}, "tokens": {}}
        _seed_demo_users(db)
        return db
    try:
        with open(USERS_DB_PATH, "r") as f:
            db = json.load(f)
            _seed_demo_users(db)
            return db
    except Exception:
        db = {"users": {}, "tokens": {}}
        _seed_demo_users(db)
        return db

def _save_db(db: Dict):
    os.makedirs(os.path.dirname(USERS_DB_PATH), exist_ok=True)
    with open(USERS_DB_PATH, "w") as f:
        json.dump(db, f, indent=4)

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

class AuthService:
    
    @staticmethod
    def register(name: str, email: str, password: str) -> dict:
        db = _load_db()
        email = email.lower().strip()
        
        if email in db["users"]:
            raise ValueError("User with this email already exists")
            
        user = {
            "name": name,
            "email": email,
            "password_hash": _hash_password(password),
            "role": None,
            "wallet_address": None
        }
        
        db["users"][email] = user
        
        token = secrets.token_hex(32)
        db["tokens"][token] = email
        
        _save_db(db)
        
        return {
            "token": token,
            "user": {
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "wallet_address": user["wallet_address"]
            }
        }

    @staticmethod
    def login(email: str, password: str) -> dict:
        db = _load_db()
        email = email.lower().strip()
        
        user = db["users"].get(email)
        if not user or user["password_hash"] != _hash_password(password):
            raise ValueError("Invalid email or password")
            
        token = secrets.token_hex(32)
        db["tokens"][token] = email
        
        _save_db(db)
        
        return {
            "token": token,
            "user": {
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "wallet_address": user["wallet_address"]
            }
        }

    @staticmethod
    def set_role(token: str, role: str, wallet_address: str = None) -> dict:
        db = _load_db()
        email = db["tokens"].get(token)
        if not email:
            raise ValueError("Invalid authentication token")
            
        user = db["users"].get(email)
        if not user:
            raise ValueError("User not found")
            
        if role not in ["doctor", "patient"]:
            raise ValueError("Invalid role specified")
            
        user["role"] = role
        user["wallet_address"] = wallet_address
        
        _save_db(db)
        
        return {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "wallet_address": user["wallet_address"]
        }
