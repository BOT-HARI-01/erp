document.addEventListener("DOMContentLoaded", () => {
    // Set default month/year to current date
    const today = new Date();
    document.getElementById("att-month").value = today.getMonth() + 1; // 1-12
    document.getElementById("att-year").value = today.getFullYear();

    loadAttendance(); 
});

async function loadAttendance() {
    const month = document.getElementById("att-month").value;
    const year = document.getElementById("att-year").value;
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = "../../index.html";
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/student/attendance/monthly?month=${month}&year=${year}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch attendance data");
        }

        const apiData = await response.json();
        
        // Convert API format to Mock Data format
        const formattedData = transformData(apiData, month, year);
        
        renderTable(formattedData);

    } catch (error) {
        console.error("Attendance Load Error:", error);
        document.getElementById("tableBody").innerHTML = `<tr><td colspan="35" style="text-align:center; color:red;">Could not find data</td></tr>`;
    }
}

// --- DATA TRANSFORMATION LOGIC ---
function transformData(apiData, month, year) {
    // 1. Calculate days in the selected month
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);

    // 2. Prepare Subject Map
    // We need to pivot from { Date: [Classes] } -> { Subject: { Day: Status } }
    const subjectMap = {};

    // apiData.attendance keys are dates like "2023-10-05"
    Object.keys(apiData.attendance).forEach(dateStr => {
        const day = parseInt(dateStr.split('-')[2]); // Extract day part
        const dayRecords = apiData.attendance[dateStr];

        dayRecords.forEach(record => {
            const subjectName = record.subject;
            const status = record.status; // "PRESENT", "ABSENT"
            
            // Initialize subject if new
            if (!subjectMap[subjectName]) {
                subjectMap[subjectName] = {};
            }

            // Map Status to Single Char (P/A/L)
            let char = "-";
            if (status === "PRESENT") char = "P";
            else if (status === "ABSENT") char = "A";
            else if (status === "LEAVE") char = "L"; // If backend supports it
            
            // Assign to day map
            subjectMap[subjectName][day] = char;
        });
    });

    // 3. Convert Map to Array for renderTable
    const subjectsArray = Object.keys(subjectMap).map(subName => {
        return {
            name: subName,
            records: subjectMap[subName]
        };
    });

    return {
        days: daysArray,
        subjects: subjectsArray
    };
}

// --- RENDER TABLE (Your existing logic, mostly unchanged) ---
function renderTable(data) {
    const tableHead = document.getElementById("tableHead");
    const tableBody = document.getElementById("tableBody");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (data.subjects.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="35" style="text-align:center; padding:20px;">No attendance records found for this month.</td></tr>`;
        return;
    }

    // --- 1. BUILD HEADER ROW ---
    let headRow = `<tr><th style="min-width: 180px;">Subject</th>`;
    
    // Add Day Columns
    data.days.forEach(d => {
        headRow += `<th style="min-width: 30px; padding: 5px;">${String(d).padStart(2, "0")}</th>`;
    });
    
    // Add Summary Columns
    headRow += `<th>P</th><th>A</th><th>%</th></tr>`;
    tableHead.innerHTML = headRow;

    // --- 2. BUILD SUBJECT ROWS ---
    data.subjects.forEach(sub => {
        let p = 0, a = 0; // l = 0, h = 0 removed for simplicity unless backend sends them
        let totalClasses = 0;

        let row = `<tr><td class="subject">${sub.name}</td>`;

        data.days.forEach(d => {
            const val = sub.records[d] || "-"; // Default to dash if no data
            
            // Count stats
            if (val === "P") { p++; totalClasses++; }
            if (val === "A") { a++; totalClasses++; }
            // If you add Leave logic later: if (val === "L") { l++; totalClasses++; }

            // Determine CSS class (lowercase)
            const cls = val !== "-" ? val.toLowerCase() : "";
            row += `<td class="${cls}">${val}</td>`;
        });

        // Calculate Percentage (Present / Total Classes held)
        const percent = totalClasses ? ((p / totalClasses) * 100).toFixed(1) : "0.0";
        
        // Color code the percentage
        let percentColor = "#28a745"; // Green
        if(percent < 75) percentColor = "#dc3545"; // Red

        row += `
            <td style="font-weight:bold; color:#007bff">${p}</td>
            <td style="font-weight:bold; color:#dc3545">${a}</td>
            <td style="font-weight:bold; color:${percentColor}">${percent}%</td>
        `;
        row += `</tr>`;

        tableBody.innerHTML += row;
    });
}