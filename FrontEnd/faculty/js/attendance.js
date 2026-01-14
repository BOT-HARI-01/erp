// A. Fetch List (Mocked due to missing API)
function fetchStudentListForAttendance() {
    const section = document.getElementById('att-sec').value;
    const tableBody = document.getElementById("att-list");
    tableBody.innerHTML = "";
    document.getElementById("att-table-container").style.display = 'block';

    // Mock Data for demo - You would replace this fetch if you add a get_students API
    const mockStudents = [
        { roll: "21B81A0501", name: "Amit Kumar" },
        { roll: "21B81A0502", name: "Priya Singh" },
        { roll: "21B81A0503", name: "Rahul Das" }
    ];

    mockStudents.forEach(stu => {
        const row = `
            <tr>
                <td class="roll-cell">${stu.roll}</td>
                <td>${stu.name}</td>
                <td class="att-options">
                    <label><input type="radio" name="att_${stu.roll}" value="PRESENT" checked> <span style="color:green">P</span></label>
                    <label><input type="radio" name="att_${stu.roll}" value="ABSENT"> <span style="color:red">A</span></label>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
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
        const response = await fetch('/faculty/attendance/mark', {
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