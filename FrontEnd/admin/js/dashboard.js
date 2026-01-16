document.addEventListener('DOMContentLoaded', () => {
  // 1. Set Date
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  document.getElementById('current-date').innerText =
    new Date().toLocaleDateString('en-US', options);

  // 2. Load Real Data
  loadDashboardStats();
  loadRecentActivity();
});

// --- FETCH STATISTICS ---
async function loadDashboardStats() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://127.0.0.1:8000/admin/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      // Inside loadDashboardStats()
      document.getElementById('stat-students').innerText =
        data.total_students.toLocaleString();
      document.getElementById('stat-pending').innerText =
        data.pending_admissions.toLocaleString();
      document.getElementById('stat-fees').innerText =
        '₹ ' + data.fees_collected.toLocaleString();
      document.getElementById('stat-faculty').innerText =
        data.active_faculty.toLocaleString();
      const cards = document.querySelectorAll('.stat-info h3');
      if (cards.length >= 4) {
        cards[0].innerText = data.total_students.toLocaleString(); // Total Students
        cards[1].innerText = data.pending_admissions.toLocaleString(); // Pending Admissions
        cards[2].innerText =
          '₹ ' + (data.fees_collected / 100000).toFixed(2) + ' L'; // Fees (in Lakhs)
        cards[3].innerText = data.active_faculty.toLocaleString(); // Active Faculty
      }
    }
  } catch (error) {
    console.error('Stats Error:', error);
  }
}

// --- FETCH RECENT ACTIVITY ---
async function loadRecentActivity() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://127.0.0.1:8000/admin/dashboard/activity', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const activities = await res.json();
      const tableBody = document.getElementById('activity-table');
      tableBody.innerHTML = '';

      if (activities.length === 0) {
        tableBody.innerHTML =
          "<tr><td colspan='3'>No recent activity found.</td></tr>";
        return;
      }

      activities.forEach((item) => {
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
  } catch (error) {
    console.error('Activity Error:', error);
  }
}
