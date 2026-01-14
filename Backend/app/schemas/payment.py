from pydantic import BaseModel
from datetime import date

# --- Used for admin search validation ---
class StudentPaymentLookupResponse(BaseModel):
    srno: str
    name: str
    branch: str
    year: int
    email: str



class PaymentCreateRequest(BaseModel):
    receipt_id: str
    fee_type: str
    amount_paid: float
    payment_mode: str
    status: str
    year: int
    semester: int
    payment_date: date


class PaymentUpdateRequest(BaseModel):
    roll_no: str
    fee_type: str        # TUITION | BUS | HOSTEL
    amount: float
    payment_mode: str   # CASH | UPI | BANK
    
    