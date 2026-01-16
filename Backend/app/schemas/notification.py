# app/schemas/notification.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationCreate(BaseModel):
    title: str
    message: str
    target_role: str     # STUDENT | ALL
    batch: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    created_at: datetime
