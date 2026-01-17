function initDashboard() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateEl = document.getElementById("current-date");
  if (dateEl)
    dateEl.innerText = new Date().toLocaleDateString("en-US", options);
}

async function fetchFacultyList() {
  const list = document.getElementById("faculty-list");
  const searchInput = document.getElementById("fac-search")
    ? document.getElementById("fac-search").value.toLowerCase()
    : "";
  const token = localStorage.getItem("token");

  list.innerHTML =
    "<tr><td colspan='6' style='text-align:center;'>Loading...</td></tr>";

  try {
    const res = await fetch("http://127.0.0.1:8000/hod/faculty", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch faculty list");

    const data = await res.json();
    list.innerHTML = "";

    if (data.length === 0) {
      list.innerHTML =
        "<tr><td colspan='6' style='text-align:center;'>No faculty found.</td></tr>";
      return;
    }

    data.forEach((fac) => {
      if (
        searchInput &&
        !fac.name.toLowerCase().includes(searchInput) &&
        !fac.email.toLowerCase().includes(searchInput)
      ) {
        return;
      }

      const row = `
                <tr>
                    <td>${fac.id}</td>
                    <td>${fac.name}</td>
                    <td>${fac.email}</td>
                    <td>${fac.sub || "-"}</td> <td style="color:${fac.att < 75 ? "red" : "green"}; font-weight:bold;">${fac.att}%</td>
                    <td>
                        <button class="alert-btn" onclick="viewFacultyDetails('${fac.email}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="alert-btn" onclick="sendFacultyAlert('${fac.name}')" title="Send Alert">
                            <i class="fas fa-bell"></i>
                        </button>
                    </td>
                </tr>
            `;
      list.innerHTML += row;
    });
  } catch (error) {
    console.error(error);
    list.innerHTML =
      "<tr><td colspan='6' style='color:red; text-align:center;'>Error loading data</td></tr>";
  }
}

async function viewFacultyDetails(email) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://127.0.0.1:8000/hod/view/faculty/${email}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      alert(
        `Faculty Details:\n\nName: ${data.first_name} ${data.last_name}\nEmail: ${data.user_email}\nMobile: ${data.mobile_no}\nQualification: ${data.qualification}\nExperience: ${data.experience} Years`,
      );
    } else {
      alert("Faculty details not found.");
    }
  } catch (e) {
    console.error(e);
    alert("Error fetching details.");
  }
}

function sendFacultyAlert(name) {
  if (confirm(`Send automated attendance warning to ${name}?`)) {
    alert("Alert Sent Successfully via Email/SMS.");
  }
}

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

function toggleTimetableInputs() {
  const type = document.getElementById("tt-type").value;
  const classInputs = document.querySelectorAll(".class-only");
  const facInputs = document.querySelectorAll(".fac-only");

  if (type === "CLASS") {
    classInputs.forEach((el) => (el.style.display = "inline-block"));
    facInputs.forEach((el) => (el.style.display = "none"));
  } else {
    classInputs.forEach((el) => (el.style.display = "none"));
    facInputs.forEach((el) => (el.style.display = "inline-block"));
  }
}

async function uploadTimetable() {
  const file = document.getElementById("tt-file").files[0];
  if (!file) {
    alert("Please select an image file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("year", document.getElementById("tt-year").value);
  formData.append("semester", document.getElementById("tt-sem").value);
  formData.append("branch", document.getElementById("tt-branch").value);

  const type = document.getElementById("tt-type").value;

  if (type === "CLASS") {
    formData.append("section", document.getElementById("tt-sec").value);
    formData.append("faculty_email", "");
  } else {
    formData.append("section", "");
    formData.append(
      "faculty_email",
      document.getElementById("tt-fac-email").value,
    );
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/hod/timetable/upload", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });
    const data = await res.json();

    if (res.ok) alert("✅ " + data.message);
    else alert("❌ Error: " + (data.detail || "Upload failed"));
  } catch (e) {
    console.error(e);
    alert("Network Error");
  }
}

function visualizeFees() {
  document.getElementById("fee-visuals").style.display = "grid";
}

function showDefaulters() {
  document.getElementById("defaulter-list").style.display = "block";
}
