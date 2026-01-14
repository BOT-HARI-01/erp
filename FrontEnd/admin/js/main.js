// Function to load HTML components
function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            
            // Re-highlight current page in sidebar
            if(elementId === 'sidebar-container') {
                highlightCurrentPage();
            }
        })
        .catch(error => console.error('Error loading component:', error));
}

// Highlight the link matching the current page URL
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// Sidebar Toggle for Mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    
    // Adjust main content margin on mobile if needed
    const mainContent = document.querySelector('.main-content');
    if (window.innerWidth <= 768) {
        if (sidebar.classList.contains('active')) {
            mainContent.style.marginLeft = "250px";
        } else {
            mainContent.style.marginLeft = "0";
        }
    }
}

// Initialize components when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Note the path: ../components/ because this script runs from admin/html/
    loadComponent('sidebar-container', '../components/sidebar.html');
    loadComponent('header-container', '../components/header.html');
});