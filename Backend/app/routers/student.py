from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.dependencies import get_current_user
from app.models.external_marks import ExternalMarks
from app.models.student import Student
from app.models.internal_marks import InternalMarks
from app.models.timetable import TimeTable
from app.schemas.student import StudentProfileRequest, StudentProfileResponse
from app.services.hostel_service import get_student_hostel_details
from app.services.student_service import get_student_by_email, upsert_student_profile
from app.services.payment_service import get_student_payment_details
from app.services.internal_marks_service import get_internal_marks_by_student
from app.services.attendance_service import get_semester_attendance_summary, get_student_monthly_attendance, get_subject_wise_attendance
from app.models.academic import Academic
router = APIRouter(prefix="/student", tags=["Student"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.get("/profile", response_model=StudentProfileResponse)
def view_profile(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(
        Student.user_email == user["sub"]
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student

@router.put("/profile", response_model=StudentProfileResponse)
def save_or_update_profile(
    req: StudentProfileRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    email = user["sub"]
    student = upsert_student_profile(db, email, req)
    return student
@router.get("/my-academics")
def view_my_academics(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Academic).filter(
        Academic.user_email == user["sub"]
    ).all()
@router.get("/payments")
def get_student_payments(
    semester: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "STUDENT":
        raise HTTPException(status_code=403)

    data = get_student_payment_details(
        db=db,
        student_email=user["sub"],
        semester=semester
    )

    if not data:
        raise HTTPException(status_code=404, detail="No payment data found")

    return data
@router.get("/internal-marks/{year}/{semester}")
def get_internal_marks(
    year: int,
    semester: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if user["role"] != "STUDENT":
        raise HTTPException(status_code=403)
    student = db.query(Student).filter(
        Student.user_email == user["sub"]
    ).first()   
    return get_internal_marks_by_student(db, student.roll_no, year, semester)
@router.get("/external-marks/{year}/{semester}")
def get_external_marks(
    year: int,
    semester: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if user["role"] != "STUDENT":
        raise HTTPException(status_code=403)
    student = db.query(Student).filter(
        Student.user_email == user["sub"]
    ).first()   
    externalmarks = db.query(ExternalMarks).filter(
        ExternalMarks.srno == student.roll_no,
        year==Academic.year,
        semester==Academic.semester
    ).all()
    

    return externalmarks

@router.get("/attendance/monthly")
def view_monthly_attendance(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    student = db.query(Student).filter(
        Student.user_email == user["sub"]
    ).first()

    return get_student_monthly_attendance(
        db=db,
        student_id=student.id,
        month=month,
        year=year
    )
@router.get("/attendance/summary")
def attendance_summary(
    semester: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    student = db.query(Student).filter(
        Student.user_email == user["sub"]
    ).first()
    return get_semester_attendance_summary(
        db=db,
        srno=student.roll_no,
        semester=semester
    )
@router.get("/attendance/subject-wise")
def subject_wise_attendance(
    semester: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    student = db.query(Student).filter(
        Student.user_email == user["sub"]
    ).first()
    return get_subject_wise_attendance(
        db=db,
        srno=student.roll_no,
        semester=semester
    )

@router.get("/hostel")
def view_hostel(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_student_hostel_details(db, user["sub"])
@router.get("/timetable")
def view_student_timetable(
   
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    academic = db.query(Academic).filter(
        Academic.user_email == user["sub"],
    ).first()
    timetable = db.query(TimeTable).filter(
        TimeTable.year == academic.year,
        TimeTable.semester == academic.semester,
        TimeTable.section == academic.section,
        TimeTable.branch == academic.branch
    ).first()

    if not timetable:
        return {"timetable": None}

    return {
        "image_url": timetable.image_path
    }

