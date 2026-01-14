// A. Fetch List (Mocked)
function fetchStudentListForMarks() {
    const tableBody = document.getElementById("mk-list");
    tableBody.innerHTML = "";
    document.getElementById("mk-table-container").style.display = 'block';

    const mockStudents = [
        { roll: "21B81A0501", name: "Amit Kumar" },
        { roll: "21B81A0502", name: "Priya Singh" }
    ];

    mockStudents.forEach(stu => {
        const row = `
            <tr data-roll="${stu.roll}">
                <td>${stu.roll}</td>
                <td>${stu.name}</td>
                <td><input type="number" class="mk-open" placeholder="0" max="5"></td>
                <td><input type="number" class="mk-desc" placeholder="0" max="10"></td>
                <td><input type="number" class="mk-sem" placeholder="0" max="5"></td>
                <td><input type="number" class="mk-obj" placeholder="0" max="5"></td>
                <td><span class="total-score">0</span></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// B. Submit Marks (Real API)
async function submitMarks() {
    const token = localStorage.getItem('token');
    const rows = document.querySelectorAll('#mk-list tr');
    const examType = parseInt(document.getElementById('mk-exam').value); // 1 for Mid-1, 2 for Mid-2
    
    // Iterate rows and update each student
    for (const row of rows) {
        const roll = row.getAttribute('data-roll');
        const open = parseInt(row.querySelector('.mk-open').value) || 0;
        const desc = parseInt(row.querySelector('.mk-desc').value) || 0;
        const sem = parseInt(row.querySelector('.mk-sem').value) || 0;
        const obj = parseInt(row.querySelector('.mk-obj').value) || 0;

        // Construct Payload matching 'InternalMarksUpdate' schema
        const payload = {
            roll_no: roll,
            subject_name: document.getElementById('mk-sub').value,
            year: parseInt(document.getElementById('mk-year').value),
            semester: parseInt(document.getElementById('mk-sem').value),
            
            // If Exam 1, populate 1 fields, else 0 (or keep existing ideally)
            openbook1: examType === 1 ? open : 0,
            descriptive1: examType === 1 ? desc : 0,
            seminar1: examType === 1 ? sem : 0,
            objective1: examType === 1 ? obj : 0,

            openbook2: examType === 2 ? open : 0,
            descriptive2: examType === 2 ? desc : 0,
            seminar2: examType === 2 ? sem : 0,
            objective2: examType === 2 ? obj : 0
        };

        try {
            // Backend: router.put("/internal-marks/update")
            await fetch('/faculty/internal-marks/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error(`Failed to update ${roll}`, error);
        }
    }
    alert("Marks update process completed!");
}