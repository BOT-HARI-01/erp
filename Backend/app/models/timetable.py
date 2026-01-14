from sqlalchemy import Column, Integer, String
from app.core.database import Base

class TimeTable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, index=True)

    # COMMON
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    branch = Column(String(10), nullable=False)

    # FOR STUDENTS
    section = Column(String(10), nullable=True)

    # FOR FACULTY
    faculty_email = Column(String(100), nullable=True)

    # IMAGE
    image_path = Column(String(255), nullable=False)

    uploaded_by = Column(String(100), nullable=False)
