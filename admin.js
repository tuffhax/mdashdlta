// Admin page script - handles user management, alert overrides, and logging

// Get crew data from localStorage or use defaults
let crewMembers = JSON.parse(localStorage.getItem('crewMembers') || JSON.stringify([
    {
        name: "Dheeraj Chennaboina",
        role: "Commander",
        privileges: ["read", "write", "admin"],
        alerts: ["Mission briefing at 0800", "Hydration reminder"],
        stats: { loginCount: 0, totalLoginTime: 0, commandsExecuted: 0, lastLogin: null }
    },
    {
        name: "Tarushv Kosgi",
        role: "Engineer",
        privileges: ["read", "write", "research", "admin"],
        alerts: ["System maintenance check", "Sleep cycle alert"],
        stats: { loginCount: 0, totalLoginTime: 0, commandsExecuted: 0, lastLogin: null }
    },
    {
        name: "Abhinav Boora",
        role: "Scientist",
        privileges: ["read", "research", "medical"],
        alerts: ["Sample collection due", "Data analysis pending"],
        stats: { loginCount: 0, totalLoginTime: 0, commandsExecuted: 0, lastLogin: null }
    },
    {
        name: "Lalith Dasa",
        role: "Medic",
        privileges: ["read", "medical", "admin"],
        alerts: ["Health check scheduled", "Medication reminder"],
        stats: { loginCount: 0, totalLoginTime: 0, commandsExecuted: 0, lastLogin: null }
    }
]));

// Get current user from localStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Admin state
let alertOverrides = JSON.parse(localStorage.getItem('alertOverrides') || '{}');
let alertLog = JSON.parse(localStorage.getItem('alertLog') || '[]');
let commandLog = JSON.parse(localStorage.getItem('commandLog') || '[]');
let editingUserIndex = -1;

// Check admin access
function checkAdminAccess() {
    const accessDenied = document.getElementById('access-denied');
    const adminContent = document.getElementById('admin-content');

    if (currentUser && currentUser.privileges.includes('admin')) {
        accessDenied.style.display = 'none';
        adminContent.style.display = 'block';
        return true;
    } else {
        accessDenied.style.display = 'block';
        adminContent.style.display = 'none';
        return false;
    }
}

// Render user list
function renderUserList() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    crewMembers.forEach((member, index) => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <h4>${member.name}</h4>
            <p><strong>Role:</strong> ${member.role}</p>
            <p><strong>Privileges:</strong> ${member.privileges.join(', ')}</p>
        `;
        userCard.addEventListener('click', () => editUser(index));
        userList.appendChild(userCard);
    });
}

// Edit user
function editUser(index) {
    editingUserIndex = index;
    const member = crewMembers[index];
    const modal = document.getElementById('user-edit-modal');

    document.getElementById('user-modal-title').textContent = 'Edit User';
    document.getElementById('user-name-input').value = member.name;
    document.getElementById('user-role-input').value = member.role;
    document.getElementById('user-alerts-input').value = member.alerts.join('\n');

    // Set privilege checkboxes
    document.querySelectorAll('.privilege-check').forEach(checkbox => {
        checkbox.checked = member.privileges.includes(checkbox.value);
    });

    document.getElementById('delete-user-btn').style.display = 'inline-block';
    modal.classList.add('active');
}

// Add new user
function addNewUser() {
    editingUserIndex = -1;
    const modal = document.getElementById('user-edit-modal');

    document.getElementById('user-modal-title').textContent = 'Add New User';
    document.getElementById('user-name-input').value = '';
    document.getElementById('user-role-input').value = '';
    document.getElementById('user-alerts-input').value = '';

    document.querySelectorAll('.privilege-check').forEach(checkbox => {
        checkbox.checked = false;
    });

    document.getElementById('delete-user-btn').style.display = 'none';
    modal.classList.add('active');
}

// Save user
function saveUser() {
    const name = document.getElementById('user-name-input').value.trim();
    const role = document.getElementById('user-role-input').value.trim();
    const alerts = document.getElementById('user-alerts-input').value
        .split('\n')
        .map(a => a.trim())
        .filter(a => a);

    const privileges = Array.from(document.querySelectorAll('.privilege-check:checked'))
        .map(cb => cb.value);

    if (!name || !role) {
        alert('Name and role are required');
        return;
    }

    const userData = {
        name,
        role,
        privileges,
        alerts,
        stats: { loginCount: 0, totalLoginTime: 0, commandsExecuted: 0, lastLogin: null }
    };

    if (editingUserIndex >= 0) {
        // Preserve stats when editing
        userData.stats = crewMembers[editingUserIndex].stats;
        crewMembers[editingUserIndex] = userData;
    } else {
        crewMembers.push(userData);
    }

    // Save to localStorage
    localStorage.setItem('crewMembers', JSON.stringify(crewMembers));

    renderUserList();
    hideUserModal();
}

// Delete user
function deleteUser() {
    if (editingUserIndex >= 0 && confirm('Are you sure you want to delete this user?')) {
        crewMembers.splice(editingUserIndex, 1);
        localStorage.setItem('crewMembers', JSON.stringify(crewMembers));
        renderUserList();
        hideUserModal();
    }
}

// Hide user modal
function hideUserModal() {
    document.getElementById('user-edit-modal').classList.remove('active');
}

// Update log previews
function updateLogPreviews() {
    // Alert log preview
    const alertLogPreview = document.getElementById('alert-log-preview');
    const recentAlerts = alertLog.slice(-10).reverse();
    alertLogPreview.innerHTML = recentAlerts.map(log =>
        `[${new Date(log.timestamp).toLocaleString()}] ${log.severity.toUpperCase()}: ${log.message}`
    ).join('\n');

    // Command log preview
    const commandLogPreview = document.getElementById('command-log-preview');
    const recentCommands = commandLog.slice(-10).reverse();
    commandLogPreview.innerHTML = recentCommands.map(log =>
        `[${new Date(log.timestamp).toLocaleString()}] ${log.user}: ${log.command}`
    ).join('\n');
}

// Download log
function downloadLog(type) {
    let content, filename;

    if (type === 'alert') {
        content = '=== MARTIAN HABITAT ALERT LOG ===\n\n';
        content += alertLog.map(log =>
            `[${new Date(log.timestamp).toLocaleString()}]\n` +
            `Type: ${log.type}\n` +
            `Severity: ${log.severity}\n` +
            `Message: ${log.message}\n` +
            `User: ${log.user}\n` +
            `${'='.repeat(50)}\n`
        ).join('\n');
        filename = `alert-log-${new Date().toISOString().split('T')[0]}.txt`;
    } else {
        content = '=== MARTIAN HABITAT COMMAND LOG ===\n\n';
        content += commandLog.map(log =>
            `[${new Date(log.timestamp).toLocaleString()}]\n` +
            `User: ${log.user}\n` +
            `Command: ${log.command}\n` +
            `Response: ${log.response}\n` +
            `${'='.repeat(50)}\n`
        ).join('\n');
        filename = `command-log-${new Date().toISOString().split('T')[0]}.txt`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Clear logs
function clearLogs() {
    if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
        alertLog = [];
        commandLog = [];
        localStorage.setItem('alertLog', '[]');
        localStorage.setItem('commandLog', '[]');
        updateLogPreviews();
        alert('All logs cleared successfully.');
    }
}

// Initialize admin page
function initAdminPage() {
    // Check access
    if (!checkAdminAccess()) {
        return;
    }

    // User management
    renderUserList();
    document.getElementById('add-user-btn').addEventListener('click', addNewUser);
    document.getElementById('save-user-btn').addEventListener('click', saveUser);
    document.getElementById('cancel-user-btn').addEventListener('click', hideUserModal);
    document.getElementById('delete-user-btn').addEventListener('click', deleteUser);

    // Alert overrides
    ['oxygen', 'temperature', 'food', 'power', 'sleep', 'wellness'].forEach(type => {
        const checkbox = document.getElementById(`override-${type}`);
        checkbox.checked = alertOverrides[type] || false;
        checkbox.addEventListener('change', () => {
            alertOverrides[type] = checkbox.checked;
            localStorage.setItem('alertOverrides', JSON.stringify(alertOverrides));
        });
    });

    // Logging
    updateLogPreviews();
    document.getElementById('download-alert-log').addEventListener('click', () => downloadLog('alert'));
    document.getElementById('download-command-log').addEventListener('click', () => downloadLog('command'));
    document.getElementById('clear-logs-btn').addEventListener('click', clearLogs);

    // Modal outside click
    document.getElementById('user-edit-modal').addEventListener('click', e => {
        if (e.target.id === 'user-edit-modal') hideUserModal();
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminPage);
