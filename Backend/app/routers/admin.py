from fastapi import APIRouter, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.hostel import HostelAllocateRequest, HostelRoomCreate
from app.services.excel_service import process_excel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.fee_structure import FeeStructureCreate
from app.services.fee_structure_service import create_fee_structure
from app.schemas.fee_structure import FeeStructureBulkCreate
from app.services.fee_structure_service import bulk_create_fee_structure
from app.schemas.external_marks import ExternalMarksCreate
from app.services.excel_marks_service import upload_external_marks_excel
from app.services.hostel_service import allocate_student_hostel, upload_hostel_rooms_excel, vacate_hostel_room
from app.models.student import Student
from app.models.academic import Academic
from sqlalchemy import func
from app.models.faculty import Faculty
from app.models.payment import Payment
from app.schemas.admin import AdminProfileUpdate
from app.services.admin_service import get_admin_profile, update_admin_profile
router = APIRouter(prefix="/admin")
@router.get("/get-profile")
def view_admin_profile(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    profile = get_admin_profile(db, user["sub"])
    if not profile:
        raise HTTPException(status_code=404, detail="Admin profile not found")
    return profile


@router.put("/update-profile")
def update_admin(
    data: AdminProfileUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    updated = update_admin_profile(db, user["sub"], data)
    if not updated:
        raise HTTPException(status_code=404, detail="Admin profile not found")
    return {"message": "Admin profile updated successfully"}

@router.post("/upload-students")
def upload_excel(
    file: UploadFile,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403)

    process_excel(file, db, user["sub"])
    return {"message": "Excel uploaded successfully"}

@router.post("/fee-structure")
def add_fee_structure(
    req: FeeStructureCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403)

    success, msg = create_fee_structure(db, req.dict())
    if not success:
        raise HTTPException(status_code=400, detail=msg)

    return {"message": msg}


@router.post("/fee-structure/bulk")
def bulk_fee_structure(
    req: FeeStructureBulkCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403)

    msg = bulk_create_fee_structure(db, [i.dict() for i in req.items])
    return {"message": msg}

# 👉 External marks via Excel
@router.post("/external-marks/upload/{batch}/{semester}")
def upload_external_marks(
    batch: str,
    semester: int,
    file: UploadFile,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    upload_external_marks_excel(db, file, batch, semester, user["sub"])
    return {"message": "External marks Excel uploaded successfully"}

@router.post("/hostel/rooms/upload")
def upload_hostel_rooms(
    file: UploadFile,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin allowed")

    upload_hostel_rooms_excel(db, file)

    return {"message": "Hostel rooms uploaded successfully"}


@router.post("/hostel/allocate")
def allocate(req: HostelAllocateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    allocate_student_hostel(db, req, user["sub"])
    return {"message": "Student allocated"}
@router.post("/hostel/room/vacate")
def vacate_room(req: HostelAllocateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin allowed")

    vacate_hostel_room(db, req, user["sub"])
    return {"message": "Student vacated"}
@router.get("/students")
def get_all_students(
    search: str = None,
    branch: str = None,
    year: str = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403)

    query = db.query(Student, Academic).join(Academic, Academic.sid == Student.id)

    if search:
        query = query.filter(
            (Student.roll_no.contains(search)) | 
            (Student.first_name.contains(search))
        )
    if branch and branch != "All":
        query = query.filter(Academic.branch == branch)
    if year and year != "All": # Assuming year comes as string "All" from FE sometimes
        query = query.filter(Academic.year == int(year))

    results = query.limit(100).all() # Limit to prevent overload

    return [
        {
            "roll_no": s.roll_no,
            "name": f"{s.first_name} {s.last_name}",
            "branch": a.branch,
            "year": a.year,
            "semester": a.semester,
            "mobile": s.mobile_no,
            "status": a.status
        }
        for s, a in results
    ]
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only Admin allowed")

    # 1. Total Students
    total_students = db.query(Student).count()

    # 2. Active Faculty
    active_faculty = db.query(Faculty).count()

    # 3. Fees Collected (Sum of all successful payments)
    total_fees = db.query(func.sum(Payment.amount_paid)).filter(Payment.status == "PAID").scalar() or 0

    # 4. Pending Admissions (Logic: Students without Academic records or explicit 'Pending' status)
    # Assuming 'Academic' record creation marks a completed admission
    admitted_ids = db.query(Academic.sid).distinct()
    pending_admissions = db.query(Student).filter(Student.id.notin_(admitted_ids)).count()

    return {
        "total_students": total_students,
        "active_faculty": active_faculty,
        "fees_collected": total_fees,
        "pending_admissions": pending_admissions
    }

@router.get("/dashboard/activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only Admin allowed")

    activity_log = []

    # Get last 3 new students
    recent_students = db.query(Student).order_by(Student.id.desc()).limit(3).all()
    for s in recent_students:
        activity_log.append({
            "action": "New Student Joined",
            "user": f"{s.first_name} {s.last_name}",
            "time": "Recently" # You can use created_at if added to model
        })

    # Get last 3 payments
    recent_payments = db.query(Payment).order_by(Payment.id.desc()).limit(3).all()
    for p in recent_payments:
        activity_log.append({
            "action": f"Fee Payment ({p.fee_type})",
            "user": p.srno, # Roll No
            "time": str(p.payment_date)
        })

    return activity_log