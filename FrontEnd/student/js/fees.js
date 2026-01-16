document.addEventListener("DOMContentLoaded", () => {
  updateFeeView(); // Load default view
});
function getAuthHeaders() {
    return {
        "Accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
}
async function updateFeeView() {
  const semester = document.getElementById("semesterSelect").value;

  const structureBody = document.getElementById("structureBody");
  const txnBody = document.getElementById("transactionBody");

  // Clear Tables
  structureBody.innerHTML = "";
  txnBody.innerHTML = "";

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/student/payments?semester=${semester}`,{
        headers:getAuthHeaders(),
      }
    );

    if (!res.ok) throw new Error("Failed to fetch payment data");

    const currentData = await res.json();

    if (!currentData || !currentData.structure || !currentData.transactions) {
      structureBody.innerHTML = `<tr><td colspan="5">No data available for Semester ${semester}</td></tr>`;
      txnBody.innerHTML = `<tr><td colspan="6">No records found.</td></tr>`;
      return;
    }

    // --- 1. POPULATE FEE STRUCTURE ---
    let totalFee = 0;
    let totalPaid = 0;
    let totalBal = 0;

    currentData.structure.forEach(item => {
      totalFee += item.total;
      totalPaid += item.paid;
      totalBal += item.balance;

      let statusBadge = "";
      if (item.balance === 0) {
        statusBadge = '<span class="status-paid">Paid</span>';
      } else if (item.paid === 0) {
        statusBadge = '<span class="status-due">Unpaid</span>';
      } else {
        statusBadge = '<span class="status-partial">Partial</span>';
      }

      structureBody.innerHTML += `
        <tr>
          <td><strong>${item.type}</strong></td>
          <td>₹ ${item.total.toLocaleString()}</td>
          <td style="color:#28a745">₹ ${item.paid.toLocaleString()}</td>
          <td style="color:#dc3545">₹ ${item.balance.toLocaleString()}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    });

    structureBody.innerHTML += `
      <tr style="background:#f9f9f9; font-weight:bold;">
        <td>Total</td>
        <td>₹ ${totalFee.toLocaleString()}</td>
        <td style="color:#28a745">₹ ${totalPaid.toLocaleString()}</td>
        <td style="color:#dc3545">₹ ${totalBal.toLocaleString()}</td>
        <td>-</td>
      </tr>
    `;

    // --- 2. POPULATE TRANSACTIONS ---
    currentData.transactions.forEach(txn => {
      txnBody.innerHTML += `
        <tr>
          <td>${txn.date}</td>
          <td style="text-align:left">${txn.type}</td>
          <td>${txn.ref}</td>
          <td style="color:#28a745; font-weight:bold;">
            ₹ ${txn.amount.toLocaleString()}
          </td>
          <td>₹ ${txn.remBalance.toLocaleString()}</td>
          <td>
            <a href="#" class="download-icon-btn"
               onclick="alert('Downloading Receipt ${txn.ref}...')">
              Download ⬇
            </a>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error(err);
    structureBody.innerHTML = `<tr><td colspan="5">Error loading fee data</td></tr>`;
    txnBody.innerHTML = `<tr><td colspan="6">Try again later</td></tr>`;
  }
}
