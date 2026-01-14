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
from app.services.hostel_service import allocate_student_hostel, upload_hostel_rooms_excel
router = APIRouter(prefix="/admin")

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
