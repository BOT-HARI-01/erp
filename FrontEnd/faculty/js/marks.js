// --- 1. Fetch Student List (Real API Integration) ---
async function fetchStudentListForMarks() {
    const year = document.getElementById('mk-year').value;
    const sem = document.getElementById('mk-sem').value;
    const sec = document.getElementById('mk-sec').value;
    const branch = "CSE"; // Hardcoded for demo, or fetch from profile

    const tableBody = document.getElementById("mk-list");
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';
    document.getElementById("mk-table-container").style.display = 'block';

    try {
        // Calls: GET /faculty/class-students
        const res = await fetch(`http://127.0.0.1:8000/faculty/class-students?year=${year}&semester=${sem}&section=${sec}&branch=${branch}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch students");
        }

        const students = await res.json();
        tableBody.innerHTML = ""; // Clear loading message

        if (students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students found for this class.</td></tr>';
            return;
        }

        students.forEach(stu => {
            const row = `
                <tr data-roll="${stu.roll_no}">
                    <td>${stu.roll_no}</td>
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

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">Error loading class list.</td></tr>';
    }
}

// Helper to auto-calculate total in UI
function calculateRowTotal(input) {
    const row = input.closest('tr');
    const open = parseInt(row.querySelector('.mk-open').value) || 0;
    const desc = parseInt(row.querySelector('.mk-desc').value) || 0;
    const sem = parseInt(row.querySelector('.mk-sem').value) || 0;
    const obj = parseInt(row.querySelector('.mk-obj').value) || 0;
    row.querySelector('.total-score').innerText = open + desc + sem + obj;
}

// --- 2. Download Excel (Client-Side) ---
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
        // Handle case where row might be loading or empty message
        if (cols.length < 2) return; 

        const roll = cols[0].innerText;
        const name = cols[1].innerText;
        
        // Get values from inputs
        const open = row.querySelector('.mk-open')?.value || 0;
        const desc = row.querySelector('.mk-desc')?.value || 0;
        const sem = row.querySelector('.mk-sem')?.value || 0;
        const obj = row.querySelector('.mk-obj')?.value || 0;
        const total = row.querySelector('.total-score')?.innerText || 0;

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

// --- 3. Submit Marks (Efficient Bulk Update) ---
async function submitMarks() {
    const rows = document.querySelectorAll('#mk-list tr');
    const examType = parseInt(document.getElementById('mk-exam').value); // 1 or 2
    const subject = document.getElementById('mk-sub').value;
    const year = parseInt(document.getElementById('mk-year').value);
    const sem = parseInt(document.getElementById('mk-sem').value);
    const token = localStorage.getItem('token');

    // Create an array of fetch promises
    const updatePromises = [];

    rows.forEach(row => {
        const roll = row.getAttribute('data-roll');
        if(!roll) return; // Skip invalid rows

        const open = parseInt(row.querySelector('.mk-open').value) || 0;
        const desc = parseInt(row.querySelector('.mk-desc').value) || 0;
        const semMarks = parseInt(row.querySelector('.mk-sem').value) || 0;
        const obj = parseInt(row.querySelector('.mk-obj').value) || 0;

        const payload = {
            roll_no: roll,
            subject_name: subject,
            year: year,
            semester: sem,
            
            // Map based on Exam Type selection
            openbook1: examType === 1 ? open : 0,
            descriptive1: examType === 1 ? desc : 0,
            seminar1: examType === 1 ? semMarks : 0,
            objective1: examType === 1 ? obj : 0,

            openbook2: examType === 2 ? open : 0,
            descriptive2: examType === 2 ? desc : 0,
            seminar2: examType === 2 ? semMarks : 0,
            objective2: examType === 2 ? obj : 0
        };

        // Push the fetch request to array
        const request = fetch('http://127.0.0.1:8000/faculty/internal-marks/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        updatePromises.push(request);
    });

    if (updatePromises.length === 0) {
        alert("No student data to update.");
        return;
    }

    try {
        // Execute all requests in parallel
        await Promise.all(updatePromises);
        alert("Marks updated successfully for all students!");
    } catch (error) {
        console.error("Bulk Update Error:", error);
        alert("Some updates might have failed. Check console for details.");
    }
}