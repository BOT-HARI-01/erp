document.addEventListener("DOMContentLoaded", () => {
    filterStudents();
});

// Mock Data
let students = [
    { roll: "CS21101", name: "Rahul Sharma", dept: "CSE", year: "3", contact: "9876543210", status: "Active" },
    { roll: "EC21105", name: "Priya Singh", dept: "ECE", year: "3", contact: "9876543211", status: "Active" },
    { roll: "ME22102", name: "Amit Kumar", dept: "MECH", year: "2", contact: "9876543212", status: "Suspended" },
    { roll: "CS23109", name: "Sneha Gupta", dept: "CSE", year: "1", contact: "9876543213", status: "Active" }
];

let currentEditRoll = null;

function filterStudents() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const dept = document.getElementById("deptFilter").value;
    const year = document.getElementById("yearFilter").value;
    
    const tableBody = document.getElementById("student-list");
    tableBody.innerHTML = "";

    students.forEach(std => {
        const matchesSearch = std.name.toLowerCase().includes(search) || std.roll.toLowerCase().includes(search);
        const matchesDept = dept === "All" || std.dept === dept;
        const matchesYear = year === "All" || std.year === year;

        if (matchesSearch && matchesDept && matchesYear) {
            const statusClass = std.status === "Active" ? "status-active" : "status-suspended";
            
            const row = `
                <tr>
                    <td><strong>${std.roll}</strong></td>
                    <td>${std.name}</td>
                    <td>${std.dept}</td>
                    <td>Year ${std.year}</td>
                    <td>${std.contact}</td>
                    <td><span class="${statusClass}">${std.status}</span></td>
                    <td>
                        <button class="action-btn" onclick="openEditModal('${std.roll}')"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteStudent('${std.roll}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        }
    });
}

// Modal Functions
const modal = document.getElementById("editModal");

function openEditModal(roll) {
    const std = students.find(s => s.roll === roll);
    if(std) {
        currentEditRoll = roll;
        document.getElementById("e-name").value = std.name;
        document.getElementById("e-dept").value = std.dept;
        document.getElementById("e-status").value = std.status;
        modal.style.display = "flex";
    }
}

function closeModal() {
    modal.style.display = "none";
}

function saveStudent() {
    const std = students.find(s => s.roll === currentEditRoll);
    if(std) {
        std.name = document.getElementById("e-name").value;
        std.dept = document.getElementById("e-dept").value;
        std.status = document.getElementById("e-status").value;
        alert("Student details updated!");
        closeModal();
        filterStudents();
    }
}

function deleteStudent(roll) {
    if(confirm("Are you sure you want to delete this record?")) {
        students = students.filter(s => s.roll !== roll);
        filterStudents();
    }
}

window.onclick = function(event) {
    if (event.target == modal) closeModal();
}