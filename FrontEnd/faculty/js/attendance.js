// --- Update in faculty/js/attendance.js ---

async function fetchStudentListForAttendance() {
    const year = document.getElementById('att-year').value;
    const sem = document.getElementById('att-sem').value;
    const sec = document.getElementById('att-sec').value;
    // Assuming branch is fixed or fetched from profile, hardcoding CSE for demo
    const branch = "CSE"; 

    const tableBody = document.getElementById("att-list");
    tableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
    document.getElementById("att-table-container").style.display = 'block';

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://127.0.0.1:8000/faculty/class-students?year=${year}&semester=${sem}&section=${sec}&branch=${branch}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const students = await res.json();
        tableBody.innerHTML = ""; // Clear loading

        if (students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">No students found for this selection.</td></tr>';
            return;
        }

        students.forEach(stu => {
            const row = `
                <tr>
                    <td class="roll-cell">${stu.roll_no}</td>
                    <td>${stu.name}</td>
                    <td class="att-options">
                        <label><input type="radio" name="att_${stu.roll_no}" value="PRESENT" checked> <span class="radio-present">P</span></label>
                        <label><input type="radio" name="att_${stu.roll_no}" value="ABSENT"> <span class="radio-absent">A</span></label>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="3" style="color:red">Error fetching class list.</td></tr>';
    }
}

// B. Submit Attendance (Real API)
async function submitAttendance() {
    const token = localStorage.getItem('token');
    
    // Construct Payload matching 'AttendanceCreate' schema in app/schemas/attendance.py
    const payload = {
        subject_code: document.getElementById('att-sub').value,
        subject_name: document.getElementById('att-sub').options[document.getElementById('att-sub').selectedIndex].text,
        year: parseInt(document.getElementById('att-year').value),
        semester: parseInt(document.getElementById('att-sem').value),
        date: document.getElementById('att-date').value,
        period: parseInt(document.getElementById('att-period').value),
        attendance: [] 
    };

    if (!payload.date) { alert("Please select a date"); return; }

    // Gather data from table
    const rows = document.querySelectorAll('#att-list tr');
    rows.forEach(row => {
        const roll = row.querySelector('.roll-cell').innerText;
        const status = row.querySelector(`input[name="att_${roll}"]:checked`).value;
        payload.attendance.push({ roll_no: roll, status: status });
    });

    try {
        // Backend: router.post("/attendance/mark")
        const response = await fetch('http://127.0.0.1:8000/faculty/attendance/mark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
        } else {
            alert("Error: " + (result.detail || "Failed to mark attendance"));
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("Network Error");
    }
}