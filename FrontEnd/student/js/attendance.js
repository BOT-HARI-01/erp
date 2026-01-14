document.addEventListener("DOMContentLoaded", () => {
    loadAttendance(); // Load default view
});

// --- MOCK DATA ---
const mockAttendanceData = {
    days: Array.from({length: 31}, (_, i) => i + 1), // [1, 2, ... 31]
    subjects: [
        {
            name: "Machine Learning",
            records: { 1: "P", 2: "P", 3: "A", 4: "P", 5: "P", 6: "H", 7: "H", 8: "P", 9: "P", 10: "P", 12: "L" }
        },
        {
            name: "Compiler Design",
            records: { 1: "P", 2: "A", 3: "P", 4: "P", 5: "P", 6: "H", 7: "H", 8: "P", 9: "A", 10: "P" }
        },
        {
            name: "Web Technologies",
            records: { 1: "P", 2: "P", 3: "P", 4: "P", 5: "P", 6: "H", 7: "H", 8: "P", 9: "P", 10: "P" }
        }
    ]
};

function loadAttendance() {
    // In a real app, this would get values from document.getElementById('month').value
    // and fetch from server. For now, we use mockData.
    renderTable(mockAttendanceData);
}

function renderTable(data) {
    const tableHead = document.getElementById("tableHead");
    const tableBody = document.getElementById("tableBody");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    // --- 1. BUILD HEADER ROW ---
    let headRow = `<tr><th style="min-width: 180px;">Subject</th>`;
    
    // Add Day Columns (1-31)
    data.days.forEach(d => {
        headRow += `<th style="min-width: 30px;">${String(d).padStart(2, "0")}</th>`;
    });
    
    // Add Summary Columns
    headRow += `<th>P</th><th>A</th><th>L</th><th>%</th></tr>`;
    tableHead.innerHTML = headRow;

    // --- 2. BUILD SUBJECT ROWS ---
    data.subjects.forEach(sub => {
        let p = 0, a = 0, l = 0, h = 0;
        let totalClasses = 0;

        let row = `<tr><td class="subject">${sub.name}</td>`;

        data.days.forEach(d => {
            const val = sub.records[d] || "-"; // Default to dash if no data
            
            // Count stats
            if (val === "P") { p++; totalClasses++; }
            if (val === "A") { a++; totalClasses++; }
            if (val === "L") { l++; totalClasses++; }
            if (val === "H") h++; // Holidays don't count for attendance %

            // Determine CSS class (lowercase)
            const cls = val !== "-" ? val.toLowerCase() : "";
            row += `<td class="${cls}">${val}</td>`;
        });

        // Calculate Percentage (Present / Total Classes held)
        // Note: Leaves usually don't count against %, but Absents do.
        // Formula: (Present / (Present + Absent + Leave)) * 100
        const total = p + a + l; 
        const percent = total ? ((p / total) * 100).toFixed(1) : "0";
        
        // Color code the percentage
        let percentColor = "#28a745"; // Green
        if(percent < 75) percentColor = "#dc3545"; // Red

        row += `
            <td style="font-weight:bold; color:#007bff">${p}</td>
            <td style="font-weight:bold; color:#dc3545">${a}</td>
            <td style="font-weight:bold; color:#28a745">${l}</td>
            <td style="font-weight:bold; color:${percentColor}">${percent}%</td>
        </tr>`;

        tableBody.innerHTML += row;
    });
}