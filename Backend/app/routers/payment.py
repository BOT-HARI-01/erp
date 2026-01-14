from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.payment_service import get_payment_details_by_roll, update_student_payment
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.payment import PaymentUpdateRequest
router = APIRouter(prefix="/payments")

@router.get("/my")
def my_payments(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "STUDENT":
        raise HTTPException(status_code=403)

    return get_payment_details_by_roll(db, user["sub"])
@router.get("/payment/{roll_no}")
def get_student_payment_info(
    roll_no: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403)

    data = get_payment_details_by_roll(db, roll_no)
    if not data:
        raise HTTPException(status_code=404, detail="Student not found")

    return data
@router.post("/payment/update")
def update_payment(
    req: PaymentUpdateRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403)

    update_student_payment(db, req, user["sub"])
    return {"message": "Payment updated successfully"}
