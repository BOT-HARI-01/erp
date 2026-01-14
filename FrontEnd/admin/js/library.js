// Set Default Dates
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('issue-date').value = today;
    document.getElementById('actual-return-date').value = today;
    
    // Set Return Due date to 15 days from now
    const due = new Date();
    due.setDate(due.getDate() + 15);
    document.getElementById('return-due-date').value = due.toISOString().split('T')[0];
});

// --- 1. Upload Books (Bulk) ---
async function uploadBooks() {
    const fileInput = document.getElementById('bookFile');
    if (!fileInput.files[0]) {
        alert("Please select an Excel file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        const res = await fetch('http://127.0.0.1:8000/library/books/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            body: formData
        });
        const data = await res.json();
        
        if(res.ok) alert(data.message);
        else alert("Error: " + (data.detail || "Upload failed"));
    } catch (error) {
        console.error(error);
        alert("Network Error");
    }
}

// --- 2. Issue Books ---
async function issueBooks() {
    const srno = document.getElementById('issue-roll').value.trim();
    const codes = document.getElementById('issue-codes').value.trim();
    
    if(!srno || !codes) {
        alert("Please fill Roll No and Book Codes");
        return;
    }

    // Convert "B1, B2" -> ["B1", "B2"]
    const codeList = codes.split(',').map(c => c.trim()).filter(c => c !== "");

    const payload = {
        srno: srno,
        semester: parseInt(document.getElementById('issue-sem').value),
        book_codes: codeList,
        issued_date: document.getElementById('issue-date').value,
        expected_return_date: document.getElementById('return-due-date').value
    };

    try {
        const res = await fetch('http://127.0.0.1:8000/library/library/issue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if(res.ok) {
            alert(data.message);
            // Clear Codes input only
            document.getElementById('issue-codes').value = "";
        } else {
            alert("Error: " + (data.detail || "Issue failed"));
        }
    } catch (error) {
        console.error(error);
        alert("Network Error");
    }
}

// --- 3. Return Books Flow ---

// Step A: Fetch Pending Books
async function fetchPendingBooks() {
    const srno = document.getElementById('return-roll').value.trim();
    const sem = document.getElementById('return-sem').value;

    if(!srno) {
        alert("Enter Roll Number");
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8000/library/pending?srno=${srno}&semester=${sem}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        const data = await res.json();

        const container = document.getElementById('pending-books-container');
        const list = document.getElementById('pending-list');
        list.innerHTML = "";

        if(data.length === 0) {
            list.innerHTML = "<p style='color:grey; text-align:center;'>No pending books found.</p>";
            container.style.display = 'block';
            return;
        }

        data.forEach(issue => {
            const item = `
                <div class="pending-item">
                    <input type="checkbox" class="return-checkbox" value="${issue.book_code}">
                    <div class="book-info">
                        <span class="book-code">${issue.book_code}</span>
                        <span>Issued: ${issue.issued_date} (Due: ${issue.expected_return_date})</span>
                    </div>
                </div>
            `;
            list.innerHTML += item;
        });

        container.style.display = 'block';

    } catch (error) {
        console.error(error);
        alert("Error fetching pending books");
    }
}

// Step B: Mark Selected as Returned
async function returnBooks() {
    const checkboxes = document.querySelectorAll('.return-checkbox:checked');
    const selectedCodes = Array.from(checkboxes).map(cb => cb.value);

    if(selectedCodes.length === 0) {
        alert("Select at least one book to return.");
        return;
    }

    const payload = {
        srno: document.getElementById('return-roll').value,
        semester: parseInt(document.getElementById('return-sem').value),
        year: 3, // Ideally this should be dynamic or fetched
        book_codes: selectedCodes,
        return_date: document.getElementById('actual-return-date').value
    };

    try {
        const res = await fetch('http://127.0.0.1:8000/library/library/return', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if(res.ok) {
            alert(data.message);
            fetchPendingBooks(); // Refresh list
        } else {
            alert("Error: " + (data.detail || "Return failed"));
        }
    } catch (error) {
        console.error(error);
        alert("Network Error");
    }
}