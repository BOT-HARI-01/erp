document.addEventListener("DOMContentLoaded", () => {
  fetchNotifications();
});

let notifications = [];

async function fetchNotifications() {
  const token = localStorage.getItem("token");
  const listContainer = document.getElementById("notification-list");

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/student/notifications",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.ok) {
      const data = await response.json();

      // Process Data
      notifications = data.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        category: item.category, // e.g., 'FEES', 'ACADEMIC'
        priority: item.priority, // e.g., 'CRITICAL', 'NORMAL'
        time: formatTimeAgo(item.created_at),
        icon: getIconForCategory(item.category),
      }));

      renderNotifications("ALL");
    }
  } catch (error) {
    console.error("Error:", error);
    listContainer.innerHTML = `<div class="error-msg">Failed to load notifications</div>`;
  }
}

// Map Category to FontAwesome Icon
function getIconForCategory(category) {
  const map = {
    ACADEMIC: "fa-graduation-cap",
    FEES: "fa-money-bill-wave",
    HOSTEL: "fa-bed",
    LIBRARY: "fa-book",
    EVENT: "fa-calendar-alt",
    GENERAL: "fa-bullhorn",
  };
  return map[category] || "fa-bell";
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function renderNotifications(filter) {
  const container = document.getElementById("notification-list");
  container.innerHTML = "";

  const filtered =
    filter === "ALL"
      ? notifications
      : notifications.filter((n) => n.category === filter);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">No notifications found.</div>`;
    return;
  }

  filtered.forEach((item) => {
    // CSS classes based on Priority and Category
    const priorityClass = `priority-${item.priority.toLowerCase()}`;
    const typeClass = `type-${item.category.toLowerCase()}`;

    const card = `
        <div class="notif-card ${priorityClass}">
            <div class="notif-icon ${typeClass}">
                <i class="fas ${item.icon}"></i>
            </div>
            <div class="notif-content">
                <div class="notif-header">
                    <span class="notif-title">${item.title}</span>
                    <span class="notif-tag">${item.category}</span>
                </div>
                <div class="notif-msg">${item.message}</div>
                <div class="notif-footer">
                    <span class="notif-time">${item.time}</span>
                </div>
            </div>
        </div>
    `;
    container.innerHTML += card;
  });
}

// Tab Filter Logic
function filterNotifications(category, btn) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderNotifications(category);
}
