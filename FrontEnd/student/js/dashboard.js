document.addEventListener("DOMContentLoaded", () => {
    // --- MOCK DATA (This mimics what Python will send later) ---
        const studentData = {
            name: "Rahul Sharma",
            year: "3rd Year",
            semester: "6th Sem",
            branch: "Computer Science",
            classTeacher: "Prof. Anjali Gupta",
            attendanceAvg: 72, // Risk!
            cgpa: 8.4,
            attendanceRisk: true, // Boolean to trigger alert
            notifications: [
                { type: "fee", title: "Fee Pending", msg: "Semester 6 tuition fee due." },
                { type: "library", title: "Book Return", msg: "'Intro to Algorithms' due tomorrow." }
            ]
        };

    // --- FUNCTION TO POPULATE UI ---
    function loadDashboard() {
        // 1. Fill Profile Data
        document.getElementById("welcome-name").innerText = studentData.name.split(" ")[0]; // First name only
        document.getElementById("profile-name").innerText = studentData.name;
        document.getElementById("profile-year").innerText = `${studentData.year} / ${studentData.semester}`;
        document.getElementById("profile-branch").innerText = studentData.branch;
        document.getElementById("profile-teacher").innerText = studentData.classTeacher;

        // 2. Handle Attendance Risk Alert
        const alertBox = document.querySelector(".alert-box");
        if (studentData.attendanceRisk) {
            alertBox.style.display = "flex"; // Show it
        } else {
            alertBox.style.display = "none"; // Hide it
        }

        // 3. Update Charts (Optional simple text update for now)
        document.querySelector(".gpa-score").innerText = studentData.cgpa;
    }

    // Run the function
    loadDashboard();
});