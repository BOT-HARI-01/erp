async function lookupStudent() {
    const roll = document.getElementById('lookup-roll').value.trim();
    if (!roll) {
        alert("Please enter a Roll Number");
        return;
    }

    const token = localStorage.getItem('token');
    const tableBody = document.getElementById("lookup-body");
    const resultCard = document.getElementById("lookup-result");
    
    tableBody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
    resultCard.style.display = 'block';

    try {
        // Backend: router.get("/student/{roll_no}")
        const response = await fetch(`http://127.0.0.1:8000/faculty/student/${roll}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Note: The API returns student profile + academic info.
            // Marks and Attendance % are NOT in this specific endpoint response based on your service code.
            // We display what is available.
            const row = `
                <tr>
                    <td>${data.roll_no}</td>
                    <td>${data.first_name} ${data.last_name}</td>
                    <td>${data.email}</td>
                    <td>${data.mobile_no}</td>
                    <td>${data.batch || '-'}</td>
                    <td>${data.parent_mobile_no || 'N/A'}</td>
                    <td>
                        <button class="alert-btn" onclick="sendAlert('${data.roll_no}')">Alert</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML = row;
        } else {
            tableBody.innerHTML = `<tr><td colspan='7' style="color:red">${data.detail || "Student not found"}</td></tr>`;
        }
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan='7' style="color:red">Network Error</td></tr>`;
    }
}

function sendAlert(roll) {
    if(confirm(`Send attendance alert to parent of ${roll}?`)) {
        // Placeholder for SMS/Email logic
        alert("Alert sent successfully.");
    }
}