// sidebar 
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
}

document.querySelector('.iconbar-btn').addEventListener('click', toggleSidebar);
document.getElementById('overlay').addEventListener('click', toggleSidebar);

// action menu
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.action-menu').forEach(m => m.remove());
        const menu = document.createElement('div');
        menu.className = 'action-menu';
        menu.innerHTML = `
            <a href="Edit-Book.html">✏️ Edit</a>
            <a href="Books-management.html">🗑️ Delete</a>
            <a href="BookDetails.html">👁️ View</a>
        `;
        btn.style.position = 'relative';
        btn.appendChild(menu);
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.action-menu').forEach(m => m.remove());
});