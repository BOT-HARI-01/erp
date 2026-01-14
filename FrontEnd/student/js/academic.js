document.addEventListener("DOMContentLoaded", () => {
    updateTable();
});

function getAuthHeaders() {
    return {
        "Accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
}

/* ------------------ MID AGGREGATION ------------------ */

function mid1Total(m) {
    return m.openbook1 + m.descriptive1 + m.seminar1 + m.objective1;
}

function mid2Total(m) {
    return m.openbook2 + m.descriptive2 + m.seminar2 + m.objective2;
}

/* ------------------ MAIN DRIVER ------------------ */

async function updateTable() {
    const semester = document.getElementById("semesterSelect").value;
    const type = document.getElementById("examTypeSelect").value;

    const thead = document.querySelector("#marksTable thead");
    const tbody = document.querySelector("#marksTable tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    try {
        if (type === "mid1" || type === "mid2") {
            await loadInternalMarks(semester, type);
        } else {
            await loadSemesterMarks(semester);
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="6">Error loading marks</td></tr>`;
    }
}

/* ------------------ MID 1 / MID 2 ------------------ */

async function loadInternalMarks(semester, type) {
    const res = await fetch(
        `http://127.0.0.1:8000/student/internal-marks/1/${semester}`,
        { headers: getAuthHeaders() }
    );

    const data = await res.json();

    const thead = document.querySelector("#marksTable thead");
    const tbody = document.querySelector("#marksTable tbody");

    thead.innerHTML = `
        <tr>
            <th>Subject Code</th>
            <th>Subject Name</th>
            <th>${type === "mid1" ? "Mid-1" : "Mid-2"} (30)</th>
            <th>Status</th>
        </tr>
    `;

    data.forEach(s => {
        const total = type === "mid1" ? mid1Total(s) : mid2Total(s);
        const pass = total >= 12;

        tbody.innerHTML += `
            <tr>
                <td>${s.subject_code}</td>
                <td>${s.subject_name}</td>
                <td>${total}</td>
                <td class="${pass ? "status-pass" : "status-fail"}">
                    ${pass ? "Pass" : "Fail"}
                </td>
            </tr>
        `;
    });
}

/* ------------------ SEMESTER (EXTERNAL ONLY) ------------------ */

async function loadSemesterMarks(semester) {
    const res = await fetch(
        `http://127.0.0.1:8000/student/external-marks/2/${semester}`,
        { headers: getAuthHeaders() }
    );

    const data = await res.json();

    const thead = document.querySelector("#marksTable thead");
    const tbody = document.querySelector("#marksTable tbody");

    thead.innerHTML = `
        <tr>
            <th>Subject Code</th>
            <th>Subject Name</th>
            <th>Credits</th>
            <th>Grade</th>
            <th>GPA</th>
        </tr>
    `;

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center">No semester records</td>
            </tr>
        `;
        return;
    }

    data.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.subject_code}</td>
                <td>${s.subject_name}</td>
                <td>${s.credits}</td>
                <td class="status-pass">${s.grade}</td>
                <td><strong>${s.gpa}</strong></td>
            </tr>
        `;
    });
}
