from sqlalchemy.orm import Session
from app.models.notification import Notification

def create_notification(db: Session, data, admin_email: str):
    notification = Notification(
        title=data.title,
        message=data.message,
        target_role=data.target_role,
        batch=data.batch,
        created_by=admin_email
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
from sqlalchemy import or_

def get_student_notifications(
    db: Session,
    student_email: str,
    batch: str
):
    print(batch)
    data = db.query(Notification).filter(
        or_(
            Notification.target_role == "ALL",
            Notification.target_role == "STUDENT"
        ),
        or_(
            Notification.batch == batch,
            Notification.batch == None
        )
    ).all()

    print("Fetched Notifications:", data)
    return data

