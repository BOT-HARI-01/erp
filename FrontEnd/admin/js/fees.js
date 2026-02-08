async function createFeeStructure() {
  const payload = {
    year: parseInt(document.getElementById('fs-year').value),
    quota: document.getElementById('fs-quota').value,
    residence_type: document.getElementById('fs-residence').value,
    tuition_fee: parseFloat(document.getElementById('fs-tuition').value),
    bus_fee: parseFloat(document.getElementById('fs-bus').value),
    hostel_fee: parseFloat(document.getElementById('fs-hostel').value),
  };

  if (!payload.year || isNaN(payload.tuition_fee)) {
    alert('Please fill all fields correctly.');
    return;
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/admin/fee-structure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      closeModal('structureModal');
    } else {
      alert('Error: ' + (data.detail || 'Failed to create structure'));
    }
  } catch (error) {
    console.error(error);
    alert('Network Error');
  }
}

async function fetchPaymentDetails() {
  const roll = document.getElementById('rollSearch').value.trim();
  if (!roll) {
    alert('Please enter a Roll Number');
    return;
  }

  const resultsDiv = document.getElementById('fee-results');
  resultsDiv.innerHTML = '<p>Loading...</p>';

  try {
    const res = await fetch(`http://127.0.0.1:8000/payments/payment/${roll}`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    });

    const data = await res.json();

    if (!res.ok) {
      resultsDiv.innerHTML = `<p style="color:red; text-align:center;">${data.detail || 'Student Not Found'}</p>`;
      return;
    }

    let html = `
  <h3>${data.name}</h3>
  <table class="fee-table">
    <thead>
      <tr>
        <th>Fee Category</th>
        <th>Total Fee</th>
        <th>Paid Amount</th>
        <th>Balance Due</th>
      </tr>
    </thead>
    <tbody>
`;

    data.fees.forEach((f) => {
      html += `
                <tr>
                    <td><strong>${f.fee_type}</strong></td>
                    <td>₹ ${f.total_fee.toLocaleString()}</td>
                    <td class="text-green">₹ ${f.paid.toLocaleString()}</td>
                    <td class="text-red">₹ ${f.balance.toLocaleString()}</td>
                </tr>
            `;
    });

    html += `</tbody></table>`;
    resultsDiv.innerHTML = html;
  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML =
      "<p style='color:red'>Network Error connecting to server.</p>";
  }
}

async function updatePayment() {
  const payload = {
    roll_no: document.getElementById('pay-roll').value,
    fee_type: document.getElementById('pay-type').value,
    amount: parseFloat(document.getElementById('pay-amount').value),
    payment_mode: document.getElementById('pay-mode').value,
  };

  if (!payload.roll_no || isNaN(payload.amount)) {
    alert('Please enter Roll No and Amount.');
    return;
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/payments/payment/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      closeModal('paymentModal');

      if (document.getElementById('rollSearch').value === payload.roll_no) {
        fetchPaymentDetails();
      }
    } else {
      alert('Error: ' + (data.detail || 'Update Failed'));
    }
  } catch (error) {
    console.error(error);
    alert('Network Error');
  }
}

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
};
