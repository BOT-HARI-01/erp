from fastapi import Depends, HTTPException
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.faculty_service import get_faculty_by_email, get_student_info_by_rollno
from app.services.timetable_service import upload_timetable_image
from fastapi import APIRouter, UploadFile, File
from sqlalchemy.orm import Session
from app.models.faculty import Faculty
from app.models.student import Student
from app.models.academic import Academic
from app.models.internal_marks import InternalMarks
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

@router.get("/faculty")
def get_department_faculty(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "HOD":
        raise HTTPException(403, "Only HOD allowed")
        
    faculty = db.query(Faculty).all()
    return [
        {
            "id": f.faculty_id,
            "name": f"{f.first_name} {f.last_name}",
            "email": f.email,
            "sub": f.designation, 
            "att": 90 # Mock attendance until Faculty Attendance module is linked
        }
        for f in faculty
    ]

@router.get("/students-analytics")
def get_student_analytics(
    year: int,
    semester: int,
    section: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "HOD":
        raise HTTPException(403, "Only HOD allowed")

    results = db.query(Student, InternalMarks)\
        .join(Academic, Academic.sid == Student.id)\
        .outerjoin(InternalMarks, InternalMarks.roll_no == Student.roll_no)\
        .filter(
            Academic.year == year,
            Academic.semester == semester,
            Academic.section == section
        ).all()

    return [
        {
            "roll": s.roll_no,
            "name": f"{s.first_name} {s.last_name}",
            "m1": (m.mid1_marks if m else 0), 
            "m2": (m.mid2_marks if m else 0),
            "att": "85%", 
            "ph": s.parent_mobile_no
        }
        for s, m in results
    ]

@router.get("/student/{roll_no}")
def hod_view_student_by_rollno(
    roll_no: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "HOD":
        raise HTTPException(status_code=403, detail="Only HOD allowed")

    data = get_student_info_by_rollno(db, roll_no)
    if not data:
        raise HTTPException(status_code=404, detail="Student not found")

    return data
@router.get("/view/faculty/{email}")
def view_faculty(
        email:str,
        user=Depends(get_current_user),
        db: Session =Depends(get_db)
                 ):
    if user["role"] != "HOD":
        raise HTTPException(status_code=403,detail="Only HOD Allowed")
    data= get_faculty_by_email(db,email)
    if not data:
        return HTTPException(status_code=404, detail="Faculty not found")
    return data