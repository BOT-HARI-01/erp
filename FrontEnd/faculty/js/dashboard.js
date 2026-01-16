document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadTimetable();
}); 

// 1. Load Profile
async function loadProfile() {
    try {
        const token = localStorage.getItem('token');
        // Backend: router.get("/profile") in faculty.py
        const response = await fetch('http://127.0.0.1:8000/faculty/get-profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data)
            // Update UI elements
            document.getElementById('fac-name').textContent = data.last_name || "Professor";
            document.getElementById('p-name').textContent = `${data.first_name} ${data.last_name}`;
            document.getElementById('p-qual').textContent = data.qualification;
            document.getElementById('p-exp').textContent = `${data.experience} Years`;
            document.getElementById('p-phone').textContent = data.mobile_no;
        } else {
            console.error("Failed to load profile");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// 2. Load Timetable
async function loadTimetable() {
    try {
        const token = localStorage.getItem('token');
        // Backend: router.get("/timetable") in faculty.py
        const response = await fetch('http://127.0.0.1:8000/faculty/timetable', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        const imgElement = document.getElementById('tt-image');
        const msgElement = document.getElementById('tt-msg');

        if (data.image_url) {
            // Backend returns relative path like "uploads/...", add leading slash
            imgElement.src = "/" + data.image_url;
            imgElement.style.display = 'block';
            msgElement.style.display = 'none';
        } else {
            msgElement.textContent = "No timetable uploaded yet.";
        }
    } catch (error) {
        console.error("Error loading timetable:", error);
    }
}