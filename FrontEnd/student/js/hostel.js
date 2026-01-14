document.addEventListener("DOMContentLoaded", () => {
    loadHostelData();
});

// --- MOCK DATA ---
const hostelData = {
    isAllocated: true, // Change to 'false' to test "Not Allocated" view
    block: "Block A (Boys)",
    roomNo: "304",
    roomType: "4-Seater Non-AC",
    myBed: "Bed A",
    fees: {
        total: 30000,
        paid: 30000,
        due: 0
    },
    roommates: [
        { bed: "Bed B", name: "Vikram Singh", roll: "CS21046", branch: "CSE" },
        { bed: "Bed C", name: "Amit Kumar", roll: "ME21012", branch: "MECH" },
        { bed: "Bed D", name: "Rohan Das", roll: "EE21055", branch: "EEE" }
    ]
};

function loadHostelData() {
    const statusBadge = document.getElementById("status-badge");
    const detailsGrid = document.getElementById("allocation-details");
    const roommateSection = document.getElementById("roommate-section");

    // 1. Check Allocation Status
    if (hostelData.isAllocated) {
        // --- ALLOCATED VIEW ---
        statusBadge.innerText = "Allocated";
        statusBadge.classList.add("allocated");

        // Populate Details
        document.getElementById("h-block").innerText = hostelData.block;
        document.getElementById("h-room").innerText = hostelData.roomNo;
        document.getElementById("h-type").innerText = hostelData.roomType;
        document.getElementById("h-bed").innerText = hostelData.myBed;

        // Populate Roommates
        const roommateList = document.getElementById("roommate-list");
        hostelData.roommates.forEach(mate => {
            const row = `
                <tr>
                    <td><strong>${mate.bed}</strong></td>
                    <td>${mate.name}</td>
                    <td>${mate.roll}</td>
                    <td>${mate.branch}</td>
                </tr>
            `;
            roommateList.innerHTML += row;
        });

    } else {
        // --- NOT ALLOCATED VIEW ---
        statusBadge.innerText = "Not Allocated";
        statusBadge.classList.add("not-allocated");

        detailsGrid.innerHTML = `<p style="color: #666; grid-column: 1/-1;">You have not been allocated a room yet. Please contact the Hostel Warden.</p>`;
        roommateSection.style.display = "none"; // Hide roommate section
    }

    // 2. Populate Fees (Always visible)
    document.getElementById("fee-total").innerText = `₹ ${hostelData.fees.total.toLocaleString()}`;
    document.getElementById("fee-paid").innerText = `₹ ${hostelData.fees.paid.toLocaleString()}`;
    document.getElementById("fee-due").innerText = `₹ ${hostelData.fees.due.toLocaleString()}`;
}