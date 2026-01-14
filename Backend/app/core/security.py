# Password hashing & JWT creation
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

from app.core.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    # bcrypt supports max 72 bytes
    safe_password = password[:72]
    return pwd_context.hash(safe_password)


def verify_password(password: str, hashed: str):
    safe_password = password[:72]
    return pwd_context.verify(safe_password, hashed)


def create_jwt(email: str, role: str):
    payload = {
        "sub": email,          
        "role": role,          
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
