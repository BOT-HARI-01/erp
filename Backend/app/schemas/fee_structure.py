from pydantic import BaseModel
from typing import List

class FeeStructureCreate(BaseModel):
    quota: str                 # CONVENER | MANAGEMENT
    residence_type: str        # DAY_SCHOLAR | HOSTELER
    tuition_fee: float
    bus_fee: float
    hostel_fee: float
    year: int
    


class FeeStructureBulkCreate(BaseModel):
    items: List[FeeStructureCreate]
