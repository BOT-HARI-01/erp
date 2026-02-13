import os
from pathlib import Path
from bs4 import BeautifulSoup

# Path to your FrontEnd folder
FRONTEND_DIR = Path(r"D:\CODEPRACTICE\ERP\FrontEnd")

# Folders inside FrontEnd that contain CSS/JS/images
STATIC_FOLDERS = ["admin", "faculty", "hod", "student", "shared"]

def process_html_file(html_path):
    print(f"\nProcessing HTML file: {html_path}")  # <-- track file
    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Fix <link> tags
    for link in soup.find_all("link", href=True):
        href = link["href"]
        print(f"  Link found: {href}")  # <-- track href
        if href.startswith("http") or href.startswith("//"):
            continue
        try:
            parts = Path(html_path).parent.joinpath(href).resolve().relative_to(FRONTEND_DIR)
            link["href"] = f"/static/{parts.as_posix()}"
        except Exception as e:
            print(f"    ERROR processing href: {href} in {html_path} -> {e}")

    # Fix <script> tags
    for script in soup.find_all("script", src=True):
        src = script["src"]
        print(f"  Script found: {src}")  # <-- track src
        if src.startswith("http") or src.startswith("//"):
            continue
        try:
            parts = Path(html_path).parent.joinpath(src).resolve().relative_to(FRONTEND_DIR)
            script["src"] = f"/static/{parts.as_posix()}"
        except Exception as e:
            print(f"    ERROR processing src: {src} in {html_path} -> {e}")

    # Fix <img> tags
    for img in soup.find_all("img", src=True):
        src = img["src"]
        print(f"  Image found: {src}")  # <-- track src
        if src.startswith("http") or src.startswith("//"):
            continue
        try:
            parts = Path(html_path).parent.joinpath(src).resolve().relative_to(FRONTEND_DIR)
            img["src"] = f"/static/{parts.as_posix()}"
        except Exception as e:
            print(f"    ERROR processing image src: {src} in {html_path} -> {e}")

    # Save modified HTML
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(str(soup))


# Walk through all HTML files
for root, dirs, files in os.walk(FRONTEND_DIR):
    for file in files:
        if file.endswith(".html"):
            html_path = Path(root) / file
            process_html_file(html_path)
