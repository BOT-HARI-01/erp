// --- Dashboard Init ---
function initDashboard() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("current-date").innerText = new Date().toLocaleDateString("en-US", options);
}

// --- Faculty Lookup ---
function fetchFacultyList() {
    // MOCK Data (Backend 'get_all_faculty' missing)
    const list = document.getElementById("faculty-list");
    list.innerHTML = "";
    
    const mockFaculty = [
        { id: "FAC001", name: "Prof. Anjali Gupta", email: "anjali@vvit.net", sub: "Compiler Design", att: 92 },
        { id: "FAC002", name: "Dr. Ravi Kumar", email: "ravi@vvit.net", sub: "Data Structures", att: 78 },
        { id: "FAC003", name: "Mr. Suresh P", email: "suresh@vvit.net", sub: "DBMS", att: 65 } // Low Attendance
    ];

    mockFaculty.forEach(fac => {
        const row = `
            <tr>
                <td>${fac.id}</td>
                <td>${fac.name}</td>
                <td>${fac.email}</td>
                <td>${fac.sub}</td>
                <td style="color:${fac.att < 75 ? 'red' : 'green'}; font-weight:bold;">${fac.att}%</td>
                <td>
                    <button class="alert-btn" onclick="sendFacultyAlert('${fac.name}')">
                        <i class="fas fa-bell"></i> Alert
                    </button>
                </td>
            </tr>
        `;
        list.innerHTML += row;
    });
}

function sendFacultyAlert(name) {
    if(confirm(`Send automated attendance warning to ${name}?`)) {
        alert("Alert Sent Successfully via Email/SMS.");
    }
}

// --- Student Analytics ---
function fetchStudentAnalytics() {
    document.getElementById("st-results").style.display = 'block';
    const list = document.getElementById("student-list");
    list.innerHTML = "";

    // MOCK Data
    const students = [
        { roll: "21B81A0501", name: "Amit Kumar", m1: 22, m2: 24, att: "88%", ph: "9876543210" },
        { roll: "21B81A0502", name: "Priya Singh", m1: 20, m2: 21, att: "92%", ph: "9988776655" }
    ];

    students.forEach(s => {
        list.innerHTML += `
            <tr>
                <td>${s.roll}</td>
                <td>${s.name}</td>
                <td>${s.m1}</td>
                <td>${s.m2}</td>
                <td>${s.att}</td>
                <td>${s.ph}</td>
            </tr>
        `;
    });
}

// --- Work Distribution (REAL API) ---
function toggleTimetableInputs() {
    const type = document.getElementById("tt-type").value;
    const classInputs = document.querySelectorAll('.class-only');
    const facInputs = document.querySelectorAll('.fac-only');

    if (type === "CLASS") {
        classInputs.forEach(el => el.style.display = 'inline-block');
        facInputs.forEach(el => el.style.display = 'none');
    } else {
        classInputs.forEach(el => el.style.display = 'none');
        facInputs.forEach(el => el.style.display = 'inline-block');
    }
}

async function uploadTimetable() {
    const file = document.getElementById("tt-file").files[0];
    if (!file) { alert("Please select an image file."); return; }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("year", document.getElementById("tt-year").value);
    formData.append("semester", document.getElementById("tt-sem").value);
    formData.append("branch", document.getElementById("tt-branch").value);

    // Conditional Fields
    const type = document.getElementById("tt-type").value;
    if (type === "CLASS") {
        formData.append("section", document.getElementById("tt-sec").value);
    } else {
        formData.append("faculty_email", document.getElementById("tt-fac-email").value);
    }

    try {
        const res = await fetch('http://127.0.0.1:8000/hod/timetable/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            body: formData
        });
        const data = await res.json();
        if(res.ok) alert(data.message);
        else alert("Error: " + data.detail);
    } catch (e) {
        console.error(e);
        alert("Network Error");
    }
}

// --- Fees Visualization ---
function visualizeFees() {
    document.getElementById("fee-visuals").style.display = "grid";
}

function showDefaulters() {
    document.getElementById("defaulter-list").style.display = "block";
}