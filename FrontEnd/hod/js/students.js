let marksChartInstance = null;
let attChartInstance = null;

async function lookupStudent() {
    const roll = document.getElementById("lookup-roll").value.trim().toUpperCase();
    if (!roll) { alert("Please enter a roll number"); return; }

    const container = document.getElementById("student-details-card");
    const content = document.getElementById("lookup-result-content");
    const token = localStorage.getItem("token");

    content.innerHTML = "Loading...";
    container.style.display = "block";

    try {
        const res = await fetch(`http://127.0.0.1:8000/hod/student/${roll}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            const data = await res.json();
            content.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div><strong>Name:</strong> ${data.first_name} ${data.last_name}</div>
                    <div><strong>Roll No:</strong> ${data.roll_no}</div>
                    <div><strong>Email:</strong> ${data.email}</div>
                    <div><strong>Mobile:</strong> ${data.mobile_no}</div>
                    <div><strong>Parent Mobile:</strong> ${data.parent_mobile_no}</div>
                    <div><strong>Batch:</strong> ${data.batch} (${data.branch})</div>
                </div>
            `;
        } else {
            content.innerHTML = `<span style="color:red;">Student not found.</span>`;
        }
    } catch (e) {
        console.error(e);
        content.innerHTML = `<span style="color:red;">Network Error.</span>`;
    }
}

// --- 2. Batch Analytics (Table + Charts) ---
async function fetchStudentAnalytics() {
    const year = document.getElementById("st-year").value;
    const sem = document.getElementById("st-sem").value;
    const sec = document.getElementById("st-sec").value;
    const token = localStorage.getItem('token');

    const table = document.getElementById("st-results");
    const chartContainer = document.getElementById("analytics-charts");
    const tbody = document.getElementById("student-list");
    
    // Show sections
    table.style.display = "block";
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Fetching Data...</td></tr>";

    try {
        const res = await fetch(`http://127.0.0.1:8000/hod/students-analytics?year=${year}&semester=${sem}&section=${sec}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            tbody.innerHTML = "";

            if(data.length === 0) {
                tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No data found for this batch.</td></tr>";
                chartContainer.style.display = "none";
                return;
            }

            // A. Populate Table
            data.forEach(s => {
                const row = `
                    <tr>
                        <td style="font-weight:600;">${s.roll}</td>
                        <td>${s.name}</td>
                        <td>${s.m1}</td>
                        <td>${s.m2}</td>
                        <td>${s.att}</td>
                        <td>${s.ph || '-'}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            // B. Render Charts
            chartContainer.style.display = "grid";
            renderCharts(data);

        } else {
            tbody.innerHTML = "<tr><td colspan='6' style='color:red; text-align:center;'>Failed to fetch data</td></tr>";
            chartContainer.style.display = "none";
        }
    } catch (error) {
        console.error(error);
        tbody.innerHTML = "<tr><td colspan='6' style='color:red; text-align:center;'>Network Error</td></tr>";
        chartContainer.style.display = "none";
    }
}


function renderCharts(students) {
    // Sorting by Roll No for consistency
    students.sort((a, b) => a.roll.localeCompare(b.roll));

    const labels = students.map(s => s.roll); 
    const marksM1 = students.map(s => s.m1);
    const marksM2 = students.map(s => s.m2);

    const attendance = students.map(s => parseFloat(s.att.replace('%', '')) || 0);

    if (marksChartInstance) marksChartInstance.destroy();
    if (attChartInstance) attChartInstance.destroy();

    const ctx1 = document.getElementById('marksChart').getContext('2d');
    marksChartInstance = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Mid 1',
                    data: marksM1,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Mid 2',
                    data: marksM2,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Mid Exam Performance Comparison' },
            },
            scales: {
                y: { beginAtZero: true, max: 30 } // Assuming max marks approx 25-30
            }
        }
    });

    const ctx2 = document.getElementById('attendanceChart').getContext('2d');
    attChartInstance = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Attendance %',
                data: attendance,
                borderColor: 'rgba(75, 192, 192, 1)', // Green
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.3, // Smooth curves
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Attendance Overview' }
            },
            scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage' } }
            }
        }
    });
}