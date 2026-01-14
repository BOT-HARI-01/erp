if (!localStorage.getItem('token')) window.location.href = '../../index.html'
function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        });
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

document.addEventListener("DOMContentLoaded", () => {
    loadComponent('sidebar-container', '../components/sidebar.html');
    loadComponent('header-container', '../components/header.html');
});