document.addEventListener("DOMContentLoaded", () => {
    updateLibraryView();
});

const libraryData = {
    "6": [ // Current Semester
        { id: "LIB-CS-601", name: "Deep Learning (Adaptive Comp)", subject: "AI/ML", issueDate: "10-Jan-2025", returnDate: "25-Jan-2025", status: "Issued" },
        { id: "LIB-CS-602", name: "Compiler Principles", subject: "Compiler Design", issueDate: "12-Jan-2025", returnDate: "-", status: "Issued" },
        { id: "LIB-REF-099", name: "Cracking the Coding Interview", subject: "Placement", issueDate: "05-Jan-2025", returnDate: "10-Jan-2025", status: "Returned" }
    ],
    "5": [ // Past Semester
        { id: "LIB-CS-501", name: "Database System Concepts", subject: "DBMS", issueDate: "15-Aug-2024", returnDate: "30-Nov-2024", status: "Returned" },
        { id: "LIB-CS-502", name: "Operating System Internals", subject: "OS", issueDate: "20-Aug-2024", returnDate: "30-Nov-2024", status: "Returned" },
        { id: "LIB-LIT-101", name: "The Alchemist", subject: "Literature", issueDate: "10-Sep-2024", returnDate: "20-Sep-2024", status: "Overdue" } // Example of old overdue record
    ],
    "4": [],
    "3": [],
    "2": [],
    "1": []
};

function updateLibraryView() {
    const semester = document.getElementById("semesterSelect").value;
    const searchText = document.getElementById("searchInput").value.toLowerCase();
    
    const tableBody = document.getElementById("book-list");
    const countIssued = document.getElementById("count-issued");
    const countReturned = document.getElementById("count-returned");
    const countOverdue = document.getElementById("count-overdue");

    // Clear Table
    tableBody.innerHTML = "";

    const books = libraryData[semester] || [];
    
    // Counters
    let issued = 0;
    let returned = 0;
    let overdue = 0;

    if (books.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No books borrowed in Semester ${semester}.</td></tr>`;
        updateCounts(0, 0, 0);
        return;
    }

    books.forEach(book => {
        // Filter Logic (Search by Name or ID)
        if (book.name.toLowerCase().includes(searchText) || book.id.toLowerCase().includes(searchText)) {
            
            // Determine Status CSS Class
            let statusClass = "";
            if (book.status === "Returned") {
                statusClass = "status-returned";
                returned++;
            } else if (book.status === "Issued") {
                statusClass = "status-issued";
                issued++;
            } else {
                statusClass = "status-overdue";
                overdue++;
            }

            const row = `
                <tr>
                    <td><strong>${book.id}</strong></td>
                    <td>${book.name}</td>
                    <td>${book.subject}</td>
                    <td>${book.issueDate}</td>
                    <td>${book.returnDate}</td>
                    <td><span class="status-badge ${statusClass}">${book.status}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        }
    });

    updateCounts(issued, returned, overdue);
}

function updateCounts(i, r, o) {
    document.getElementById("count-issued").innerText = i;
    document.getElementById("count-returned").innerText = r;
    document.getElementById("count-overdue").innerText = o;
}