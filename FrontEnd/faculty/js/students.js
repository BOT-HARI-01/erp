async function lookupStudent() {
  const roll = document
    .getElementById("lookup-roll")
    .value.trim()
    .toUpperCase();
  if (!roll) {
    alert("Please enter a Roll Number");
    return;
  }

  const token = localStorage.getItem("token");
  const tableBody = document.getElementById("lookup-body");
  const resultCard = document.getElementById("lookup-result");

  tableBody.innerHTML =
    "<tr><td colspan='9' style='text-align:center; padding:15px;'>Searching...</td></tr>";
  resultCard.style.display = "block";

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/faculty/student/${roll}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await response.json();

    if (response.ok) {
      const name =
        `${data.first_name || ""} ${data.last_name || ""}`.trim() || "-";
      const branch = data.branch || "-";
      const yearSem =
        data.year && data.semester ? `${data.year} / ${data.semester}` : "-";
      const section = data.section || "-";
      const phone = data.mobile_no || "-";
      const status = data.status || "Active";

      let feeStatusHTML =
        '<span style="color:#757575; font-size:0.9rem;">No Info</span>';

      if (data.payment_records && data.payment_records.length > 0) {
        const pendingDues = data.payment_records.filter(
          (p) => p.status === "PENDING",
        );
        const hasDues = pendingDues.length > 0;

        const tooltipText = data.payment_records
          .map((p) => `${p.fee_type}: ${p.status} (₹${p.amount_paid})`)
          .join("\n");

        if (hasDues) {
          feeStatusHTML = `
                        <span style="padding: 4px 8px; border-radius: 4px; background: #ffebee; color: #c62828; font-weight: 600; cursor: help;" title="${tooltipText}">
                            ${pendingDues.length} Due
                        </span>
                    `;
        } else {
          feeStatusHTML = `
                        <span style="padding: 4px 8px; border-radius: 4px; background: #e8f5e9; color: #2e7d32; font-weight: 600; cursor: help;" title="${tooltipText}">
                            Cleared
                        </span>
                    `;
        }
      }

      const row = `
                <tr>
                    <td style="font-weight:bold;">${data.roll_no}</td>
                    <td>${name}</td>
                    <td>${branch}</td>
                    <td>${yearSem}</td>
                    <td>${section}</td>
                    <td>${phone}</td>
                    <td>
                        <span style="padding: 4px 8px; border-radius: 4px; background: #e3f2fd; color: #1565c0; font-size: 0.85rem; font-weight: 600;">
                            ${status}
                        </span>
                    </td>
                    <td>${feeStatusHTML}</td>
                    </tr>
                    `;
                    // <td>
                    //     <button class="alert-btn" onclick="sendAlert('${data.roll_no}')" title="Notify Parent">
                    //         <i class="fas fa-bell"></i> Alert
                    //     </button>
                    // </td>
      tableBody.innerHTML = row;
    } else {
      tableBody.innerHTML = `<tr><td colspan='9' style="color:red; text-align:center; padding:15px;">${data.detail || "Student not found"}</td></tr>`;
    }
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `<tr><td colspan='9' style="color:red; text-align:center;">Network Error</td></tr>`;
  }
}

function sendAlert(roll) {
  if (confirm(`Send attendance/performance alert to parent of ${roll}?`)) {
    alert(`Alert triggered for ${roll}. Notification sent.`);
  }
}
