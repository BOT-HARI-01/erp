from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base
class HostelRoom(Base):
    __tablename__ = "hostel_rooms"

    id = Column(Integer, primary_key=True)

    room_number = Column(String(10), unique=True, nullable=False)
    sharing = Column(Integer)          # 2 / 3 / 4
    room_type = Column(String(10))     # AC / NON_AC
    capacity = Column(Integer)         # no. of beds
    occupied = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
