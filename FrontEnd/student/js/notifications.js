document.addEventListener("DOMContentLoaded", () => {
  renderNotifications("all");
});

let notifications = [
  {
    id: 1,
    type: "fee",
    priority: "critical",
    title: "Tuition Fee Overdue",
    message:
      "Your Semester 6 tuition fee payment of ₹25,000 is pending. Please pay immediately to avoid late charges.",
    time: "2 hours ago",
    read: false,
    icon: "fa-money-bill-wave",
  },
  {
    id: 2,
    type: "academic",
    priority: "critical",
    title: "Low Attendance Warning",
    message:
      'Your attendance in "Compiler Design" has dropped to 68%. You need 75% to appear for exams.',
    time: "5 hours ago",
    read: false,
    icon: "fa-exclamation-triangle",
  },
  {
    id: 3,
    type: "library",
    priority: "info",
    title: "Book Returned Successfully",
    message:
      'You have successfully returned "Intro to Algorithms". No fines applicable.',
    time: "1 day ago",
    read: true,
    icon: "fa-book",
  },
  {
    id: 4,
    type: "academic",
    priority: "info",
    title: "Mid-Sem Dates Announced",
    message:
      "The schedule for Mid-Semester Exams has been published. Check the dashboard for details.",
    time: "2 days ago",
    read: true,
    icon: "fa-calendar-alt",
  },
  {
    id: 5,
    type: "fee",
    priority: "success",
    title: "Hostel Fee Payment Received",
    message:
      "Payment of ₹30,000 for Hostel Block A received via Transaction ID #998877.",
    time: "3 days ago",
    read: true,
    icon: "fa-check-circle",
  },
];

function renderNotifications(filterType) {
  const listContainer = document.getElementById("notification-list");
  listContainer.innerHTML = "";

  const filteredData =
    filterType === "all"
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  if (filteredData.length === 0) {
    listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color:#999;">No notifications found.</div>`;
    return;
  }

  filteredData.forEach((item) => {
    const unreadBadge = item.read ? "" : '<span class="unread-dot"></span>';

    const priorityClass = `priority-${item.priority}`;
    const typeClass = `type-${item.type}`;

    const card = `
            <div class="notif-card ${priorityClass}">
                <div class="notif-icon ${typeClass}">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title">
                        ${item.title}
                        ${unreadBadge}
                    </div>
                    <div class="notif-msg">${item.message}</div>
                    <span class="notif-time">${item.time}</span>
                </div>
            </div>
        `;
    listContainer.innerHTML += card;
  });
}

function filterNotifications(type, btnElement) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  btnElement.classList.add("active");

  renderNotifications(type);
}

function markAllAsRead() {
  notifications.forEach((n) => (n.read = true));

  const activeTab = document.querySelector(".tab-btn.active");

  let type = "all";
  if (activeTab.innerText === "Fees") type = "fee";
  if (activeTab.innerText === "Academic") type = "academic";
  if (activeTab.innerText === "Library") type = "library";

  renderNotifications(type);
  alert("All notifications marked as read.");
}
