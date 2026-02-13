from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI()

# Current folder is FrontEnd
FRONTEND_DIR = Path(__file__).parent

# ---- Mount main static folders ----
# This allows /static/admin/css/... /static/admin/js/... etc.
for folder in ["admin", "faculty", "hod", "student", "shared"]:
    folder_path = FRONTEND_DIR / folder
    if folder_path.exists():
        app.mount(f"/static/{folder}", StaticFiles(directory=folder_path), name=folder)

# Also mount root files (like index.html, style.css, script.js)
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="root_static")

# ---- Serve HTML files dynamically ----
@app.get("/{full_path:path}")
def serve_html(full_path: str):
    # block static paths explicitly
    if full_path.startswith("static/"):
        return {"detail": "Not Found"}

    file_path = FRONTEND_DIR / full_path

    if file_path.exists() and file_path.suffix == ".html":
        return FileResponse(file_path)

    return FileResponse(FRONTEND_DIR / "index.html")
