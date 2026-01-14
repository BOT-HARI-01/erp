// --- 1. Dashboard Logic ---
async function loadFacultyDashboard() {
    // Set Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("current-date").innerText = new Date().toLocaleDateString("en-US", options);

    try {
        const token = localStorage.getItem('token');
        
        // 1. Fetch Profile
        const resProfile = await fetch('http://127.0.0.1::8000/faculty/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if(resProfile.ok) {
            const profile = await resProfile.json();
            document.getElementById("fac-name").innerText = profile.last_name;
            document.getElementById("p-name").innerText = `${profile.first_name} ${profile.last_name}`;
            document.getElementById("p-qual").innerText = profile.qualification;
            document.getElementById("p-exp").innerText = `${profile.experience} Years`;
        }

        // 2. Fetch Timetable
        const resTT = await fetch('http://127.0.0.1::8000/faculty/timetable', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const ttData = await resTT.json();
        
        if (ttData.image_url) {
            document.getElementById('tt-image').src = "/" + ttData.image_url; // Adjust path if needed
            document.getElementById('tt-image').style.display = 'block';
            document.getElementById('tt-msg').style.display = 'none';
        } else {
            document.getElementById('tt-msg').innerText = "No timetable uploaded yet.";
        }

    } catch (error) {
        console.error("Dashboard Load Error", error);
    }
}

// --- 2. Attendance Logic ---
function fetchStudentListForAttendance() {
    // In real backend, you'd fetch students of this specific class.
    // Since 'get_all_students_in_class' API is missing, we use Mock Data for UI demo.
    
    const tableBody = document.getElementById("att-list");
    tableBody.innerHTML = "";
    document.getElementById("att-table-container").style.display = 'block';

    const mockStudents = [
        { roll: "21B81A0501", name: "Amit Kumar" },
        { roll: "21B81A0502", name: "Priya Singh" },
        { roll: "21B81A0503", name: "Rahul Das" }
    ];

    mockStudents.forEach(stu => {
        const row = `
            <tr>
                <td>${stu.roll}</td>
                <td>${stu.name}</td>
                <td class="att-options">
                    <label><input type="radio" name="att_${stu.roll}" value="PRESENT" checked> <span class="radio-present">P</span></label>
                    <label><input type="radio" name="att_${stu.roll}" value="ABSENT"> <span class="radio-absent">A</span></label>
                    <label><input type="radio" name="att_${stu.roll}" value="LEAVE"> L</label>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

async function submitAttendance() {
    const payload = {
        subject_code: document.getElementById('att-sub').value,
        subject_name: document.getElementById('att-sub').options[document.getElementById('att-sub').selectedIndex].text,
        year: parseInt(document.getElementById('att-year').value),
        semester: parseInt(document.getElementById('att-sem').value),
        date: document.getElementById('att-date').value,
        period: parseInt(document.getElementById('att-period').value),
        attendance: [] // Populated below
    };

    // Collect data
    const rows = document.querySelectorAll('#att-list tr');
    rows.forEach(row => {
        const roll = row.cells[0].innerText;
        const status = row.querySelector(`input[name="att_${roll}"]:checked`).value;
        payload.attendance.push({ roll_no: roll, status: status });
    });

    try {
        const res = await fetch('http://127.0.0.1::8000/faculty/attendance/mark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message || data.detail);
    } catch (e) {
        alert("Error marking attendance");
    }
}

// --- 3. Marks Logic ---
// ... [Keep existing Dashboard & Attendance Logic] ...

// --- 3. Marks Logic ---
function fetchStudentListForMarks() {
    // MOCK DATA for List (Simulating backend fetch)
    const tableBody = document.getElementById("mk-list");
    tableBody.innerHTML = "";
    document.getElementById("mk-table-container").style.display = 'block';

    const mockStudents = [
        { roll: "21B81A0501", name: "Amit Kumar" },
        { roll: "21B81A0502", name: "Priya Singh" },
        { roll: "21B81A0503", name: "Rahul Das" }
    ];

    mockStudents.forEach(stu => {
        const row = `
            <tr data-roll="${stu.roll}">
                <td>${stu.roll}</td>
                <td>${stu.name}</td>
                <td><input type="number" class="mk-open" placeholder="0" oninput="calculateRowTotal(this)"></td>
                <td><input type="number" class="mk-desc" placeholder="0" oninput="calculateRowTotal(this)"></td>
                <td><input type="number" class="mk-sem" placeholder="0" oninput="calculateRowTotal(this)"></td>
                <td><input type="number" class="mk-obj" placeholder="0" oninput="calculateRowTotal(this)"></td>
                <td class="total-score" style="font-weight:bold;">0</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Simple Helper to auto-calc total in UI
function calculateRowTotal(input) {
    const row = input.closest('tr');
    const open = parseInt(row.querySelector('.mk-open').value) || 0;
    const desc = parseInt(row.querySelector('.mk-desc').value) || 0;
    const sem = parseInt(row.querySelector('.mk-sem').value) || 0;
    const obj = parseInt(row.querySelector('.mk-obj').value) || 0;
    row.querySelector('.total-score').innerText = open + desc + sem + obj;
}

// --- NEW: Download Excel Function ---
function downloadMarksExcel() {
    const rows = document.querySelectorAll('#mk-list tr');
    if (rows.length === 0) {
        alert("No data available to download.");
        return;
    }

    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Roll Number,Student Name,Open Book,Descriptive,Seminar,Objective,Total Marks\n";

    // Iterate Rows
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        const roll = cols[0].innerText;
        const name = cols[1].innerText;
        
        // Get values from inputs
        const open = row.querySelector('.mk-open').value || 0;
        const desc = row.querySelector('.mk-desc').value || 0;
        const sem = row.querySelector('.mk-sem').value || 0;
        const obj = row.querySelector('.mk-obj').value || 0;
        const total = row.querySelector('.total-score').innerText;

        // Create CSV Row
        csvContent += `${roll},${name},${open},${desc},${sem},${obj},${total}\n`;
    });

    // Create Download Link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    // Dynamic Filename
    const sub = document.getElementById("mk-sub").value;
    const type = document.getElementById("mk-exam").options[document.getElementById("mk-exam").selectedIndex].text;
    link.setAttribute("download", `Marks_${sub}_${type}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function submitMarks() {
    const rows = document.querySelectorAll('#mk-list tr');
    const examType = parseInt(document.getElementById('mk-exam').value); // 1 or 2
    
    for (const row of rows) {
        const roll = row.getAttribute('data-roll');
        
        const payload = {
            roll_no: roll,
            subject_name: document.getElementById('mk-sub').value,
            year: parseInt(document.getElementById('mk-year').value),
            semester: parseInt(document.getElementById('mk-sem').value),
            
            // Mid 1 Logic
            openbook1: examType === 1 ? parseInt(row.querySelector('.mk-open').value) || 0 : 0,
            descriptive1: examType === 1 ? parseInt(row.querySelector('.mk-desc').value) || 0 : 0,
            seminar1: examType === 1 ? parseInt(row.querySelector('.mk-sem').value) || 0 : 0,
            objective1: examType === 1 ? parseInt(row.querySelector('.mk-obj').value) || 0 : 0,

            // Mid 2 Logic
            openbook2: examType === 2 ? parseInt(row.querySelector('.mk-open').value) || 0 : 0,
            descriptive2: examType === 2 ? parseInt(row.querySelector('.mk-desc').value) || 0 : 0,
            seminar2: examType === 2 ? parseInt(row.querySelector('.mk-sem').value) || 0 : 0,
            objective2: examType === 2 ? parseInt(row.querySelector('.mk-obj').value) || 0 : 0
        };

        // Note: Using await in loop is slow for many records, but safe for this demo.
        // In production, Promise.all() is better.
        await fetch('http://127.0.0.1:8000/faculty/internal-marks/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(payload)
        });
    }
    alert("Marks updated successfully!");
}

// ... [Keep Student Lookup Logic] ...

// --- 4. Student Lookup Logic ---
async function lookupStudent() {
    const roll = document.getElementById('lookup-roll').value;
    if(!roll) { alert("Enter Roll No"); return; }

    try {
        const res = await fetch(`http://127.0.0.1::8000/faculty/student/${roll}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        
        const data = await res.json();
        
        const tableBody = document.getElementById("lookup-body");
        tableBody.innerHTML = "";
        
        if (!res.ok) {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">${data.detail}</td></tr>`;
            document.getElementById("lookup-result").style.display = 'block';
            return;
        }

        // Mocking Marks/Attendance for display as they aren't in the basic profile API
        const row = `
            <tr>
                <td>${data.roll_no}</td>
                <td>${data.first_name} ${data.last_name}</td>
                <td>${data.email}</td>
                <td>${data.mobile_no}</td>
                <td>22/25</td> <td>24/25</td> <td style="color:red; font-weight:bold;">68%</td> <td>${data.parent_mobile_no || 'N/A'}</td>
                <td>
                    <button class="alert-btn" onclick="sendAlert('${data.roll_no}')">
                        <i class="fas fa-bell"></i> Alert
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML = row;
        document.getElementById("lookup-result").style.display = 'block';

    } catch (error) {
        console.error(error);
        alert("Network Error");
    }
}

function sendAlert(roll) {
    // In a real app, this calls an SMS/Email API
    if(confirm(`Send Low Attendance Alert to ${roll}?`)) {
        alert(`Alert sent successfully to ${roll} and parent.`);
    }
}