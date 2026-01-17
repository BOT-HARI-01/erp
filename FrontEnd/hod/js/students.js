async function lookupStudent() {
  const roll = document
    .getElementById("lookup-roll")
    .value.trim()
    .toUpperCase();
  if (!roll) {
    alert("Please enter a roll number");
    return;
  }

  const container = document.getElementById("student-details-card");
  const content = document.getElementById("lookup-result-content");
  const token = localStorage.getItem("token");

  content.innerHTML = "Loading...";
  container.style.display = "block";

  try {
    const res = await fetch(`http://127.0.0.1:8000/hod/student/${roll}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      content.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div><strong>Name:</strong> ${data.first_name} ${data.last_name}</div>
                    <div><strong>Roll No:</strong> ${data.roll_no}</div>
                    <div><strong>Email:</strong> ${data.email}</div>
                    <div><strong>Mobile:</strong> ${data.mobile_no}</div>
                    <div><strong>Parent Mobile:</strong> ${data.parent_mobile_no}</div>
                    <div><strong>Batch:</strong> ${data.batch} (${data.branch})</div>
                </div>
            `;
    } else {
      content.innerHTML = `<span style="color:red;">Student not found.</span>`;
    }
  } catch (e) {
    console.error(e);
    content.innerHTML = `<span style="color:red;">Network Error.</span>`;
  }
}

function fetchStudentAnalytics() {
  document.getElementById("st-results").style.display = "block";
  const list = document.getElementById("student-list");
  list.innerHTML = "";

  const students = [
    {
      roll: "21B81A0501",
      name: "Amit Kumar",
      m1: 22,
      m2: 24,
      att: "88%",
      ph: "9876543210",
    },
    {
      roll: "21B81A0502",
      name: "Priya Singh",
      m1: 20,
      m2: 21,
      att: "92%",
      ph: "9988776655",
    },
  ];

  students.forEach((s) => {
    list.innerHTML += `
            <tr>
                <td>${s.roll}</td>
                <td>${s.name}</td>
                <td>${s.m1}</td>
                <td>${s.m2}</td>
                <td>${s.att}</td>
                <td>${s.ph}</td>
            </tr>
        `;
  });
}
