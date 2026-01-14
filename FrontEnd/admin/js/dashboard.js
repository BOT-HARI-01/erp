document.addEventListener("DOMContentLoaded", () => {
    // 1. Set Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("current-date").innerText = new Date().toLocaleDateString("en-US", options);

    // 2. Load Recent Activity (Mock Data)
    loadRecentActivity();
});

const recentActivities = [
    { action: "New Admission Application", user: "Rahul S. (Student)", time: "10 mins ago" },
    { action: "Fee Structure Updated", user: "Admin", time: "1 hour ago" },
    { action: "Library Book Added (x50)", user: "Librarian", time: "2 hours ago" },
    { action: "Faculty User Created", user: "Admin", time: "4 hours ago" },
    { action: "Attendance Alert Sent", user: "System", time: "Yesterday" }
];

function loadRecentActivity() {
    const tableBody = document.getElementById("activity-table");
    tableBody.innerHTML = "";

    recentActivities.forEach(item => {
        const row = `
            <tr>
                <td><strong>${item.action}</strong></td>
                <td>${item.user}</td>
                <td style="color:#666; font-size:0.85rem;">${item.time}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}