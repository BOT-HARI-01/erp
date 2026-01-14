from fastapi import Depends, HTTPException
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.timetable_service import upload_timetable_image
from fastapi import APIRouter, UploadFile, File
from sqlalchemy.orm import Session

router = APIRouter(prefix="/hod", tags=["HOD"])

@router.post("/timetable/upload")
def upload_timetable(
    year: int,
    semester: int,
    branch: str,
    section: str = None,
    faculty_email: str = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "HOD":
        raise HTTPException(403, "Only HOD allowed")

    return upload_timetable_image(
        db, file, year, semester, branch, section, faculty_email, user["sub"]
    )
