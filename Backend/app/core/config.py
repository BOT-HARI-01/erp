
import os

JWT_SECRET = "supersecretkey"   # move to .env 
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60

DATABASE_URL = "mysql+pymysql://root:toni@127.0.0.1:3306/erp_db"
