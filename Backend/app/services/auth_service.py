from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password, create_jwt

def signup(db: Session, email: str, password: str, role: str):
    user = User(
        email=email,
        password=hash_password(password),
        role=role
    )
    db.add(user)
    db.commit()
    return user

def login(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user or not verify_password(password, user.password):
        return None
    token = create_jwt(user.email, user.role)
    return token

def change_password(db: Session, email: str, old_password: str, new_password: str):
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user:
        return False, "User not found"

    if not verify_password(old_password, user.password):
        return False, "Old password is incorrect"

    user.password = hash_password(new_password)
    db.commit()
    return True, "Password updated successfully"
