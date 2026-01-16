from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.notification_service import get_student_notifications
from app.core.database import SessionLocal
from app.core.dependencies import get_current_user
from app.models.external_marks import ExternalMarks
from app.models.semester_result import SemesterResult
from app.models.student import Student
from app.models.internal_marks import InternalMarks
from app.models.timetable import TimeTable
from app.schemas.student import StudentProfileRequest, StudentProfileResponse
from app.services.library_service import get_student_library_books
from app.services.external_marks_service import get_semester_result
from app.services.hostel_service import get_student_hostel_details
from app.services.student_service import get_student_by_email, upsert_student_profile
from app.services.payment_service import get_student_payment_details
from app.services.internal_marks_service import get_internal_marks_by_student
from app.services.attendance_service import (
    get_semester_attendance_summary,
    get_student_monthly_attendance,
    get_subject_wise_attendance,
)
from app.services.attendance_service import get_low_subjects
from app.services.ai_service import get_attendance_advice
from sqlalchemy import func
from app.models.academic import Academic
from app.models.payment import Payment
from app.models.library_issue import LibraryIssue
from app.models.attendance_record import AttendanceRecord
from app.models.attendance_session import AttendanceSession
router = APIRouter(prefix="/student", tags=["Student"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard")
def get_student_dashboard_data(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "STUDENT":
        raise HTTPException(status_code=403, detail="Access denied")

    email = user["sub"]
    
    student = db.query(Student).filter(Student.user_email == email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")
    academic = db.query(Academic).filter(Academic.sid == student.id).order_by(Academic.year.desc()).first()
    current_sem = academic.semester if academic else 1

    att_data = get_semester_attendance_summary(db, student.roll_no, current_sem)
    att_percentage = att_data["attendance_percentage"]

    results = db.query(SemesterResult).filter(SemesterResult.srno == student.roll_no).all()
    if results:
        total_sgpa = sum([r.sgpa for r in results if r.sgpa is not None])
        cgpa = round(total_sgpa / len(results), 2)
    else:
        cgpa = 0.0

    payment_data = get_student_payment_details(db, email, academic.semester + academic.year)
    print(payment_data)
    total_dues = sum([item["balance"] for item in payment_data["structure"]])

    lib_data = get_student_library_books(db, email, current_sem)
    active_books_count = len(lib_data["books"])

    low_subs = get_low_subjects(db, student.roll_no, current_sem)
    
    if not low_subs:
        ai_msg = f"🎉 Great job, {student.first_name}! You have good attendance in all subjects."
    else:
        ai_msg = get_attendance_advice(low_subs)

    return {
        "profile": {
            "name": f"{student.first_name} {student.last_name}",
            "roll_no": student.roll_no,
            "branch": academic.branch if academic else "N/A",
            "semester": current_sem
        },
        "stats": {
            "attendance": att_percentage,
            "cgpa": cgpa,
            "fee_dues": total_dues,
            "library_books": active_books_count
        },
        "ai_insight": ai_msg
    }

@router.get("/profile", response_model=StudentProfileResponse)
def view_profile(user=Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_email == user["sub"]).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student


@router.put("/profile", response_model=StudentProfileResponse)
def save_or_update_profile(
    req: StudentProfileRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    email = user["sub"]
    student = upsert_student_profile(db, email, req)
    return student


@router.get("/my-academics")
def view_my_academics(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Academic).filter(Academic.user_email == user["sub"]).all()


@router.get("/payments")
def get_student_payments(
    semester: int, user=Depends(get_current_user), db: Session = Depends(get_db)
):
    if user["role"] != "STUDENT":
        raise HTTPException(status_code=403)

    data = get_student_payment_details(
        db=db, student_email=user["sub"], semester=semester
    )
    print(data)
    if not data:
        raise HTTPException(status_code=404, detail="No payment data found")

    return data


@router.get("/internal-marks/{year}/{semester}")
def get_internal_marks(
    year: int,
    semester: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if user["role"] != "STUDENT":
        raise HTTPException(status_code=403)
    student = db.query(Student).filter(Student.user_email == user["sub"]).first()
    return get_internal_marks_by_student(db, student.roll_no, year, semester)


@router.get("/external-marks/{year}/{semester}")
def get_external_marks(
    year: int,
    semester: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if user["role"] != "STUDENT":
        raise HTTPException(status_code=403)
    externalmarks = get_semester_result(year, semester, db, user["sub"])

    return externalmarks


@router.get("/attendance/monthly")
def view_monthly_attendance(
    month: int, year: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_email == user["sub"]).first()

    return get_student_monthly_attendance(
        db=db, student_id=student.id, month=month, year=year
    )


@router.get("/attendance/summary")
def attendance_summary(
    semester: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_email == user["sub"]).first()
    return get_semester_attendance_summary(
        db=db, srno=student.roll_no, semester=semester
    )


@router.get("/attendance/subject-wise")
def subject_wise_attendance(
    semester: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_email == user["sub"]).first()
    return get_subject_wise_attendance(db=db, srno=student.roll_no, semester=semester)


@router.get("/hostel")
def view_hostel(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_student_hostel_details(db, user["sub"])


@router.get("/timetable")
def view_student_timetable(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    academic = (
        db.query(Academic)
        .filter(
            Academic.user_email == user["sub"],
        )
        .first()
    )
    timetable = (
        db.query(TimeTable)
        .filter(
            TimeTable.year == academic.year,
            TimeTable.semester == academic.semester,
            TimeTable.section == academic.section,
            TimeTable.branch == academic.branch,
        )
        .first()
    )

    if not timetable:
        return {"timetable": None}

    return {"image_url": timetable.image_path}

@router.get("/notifications")
def view_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "STUDENT":
        raise HTTPException(403, "Access denied")

    
    batch = db.query(Academic.batch).filter(Academic.user_email == current_user["sub"]).scalar()
    print("Student Batch:", batch)
    if not batch:
        raise HTTPException(404, "Student academic record not found")

    return get_student_notifications(db, current_user["sub"], batch)