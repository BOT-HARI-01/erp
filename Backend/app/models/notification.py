# app/models/notification.py
from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)

    target_role = Column(String(20))  
    # ALL | STUDENT | HOD | FACULTY

    batch = Column(String(20), nullable=True)  
    # 2022-2026 

    created_by = Column(String(100)) 
    created_at = Column(DateTime, default=datetime.utcnow)
