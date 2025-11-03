// Martian Habitat Dashboard Script

// Crew members data
const crewMembers = [
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
];

// Simulation state
let simulationTime = 0;
let currentUser = null;
let loginTime = null;
let chatMessages = JSON.parse(localStorage.getItem('crewChat') || '[]');

// Charts
let oxygenChart, temperatureChart, foodChart, powerChart, sleepChart, wellnessChart;

// Initialize charts
function initCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        },
        transitions: {
            active: {
                animation: {
                    duration: 0
                }
            }
        },
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { display: false },
            y: {
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: '#e0e0e0' },
                beginAtZero: false
            }
        },
        elements: {
            point: { radius: 0 },
            line: { borderWidth: 2 }
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        }
    };

    oxygenChart = new Chart(document.getElementById('oxygenChart'), {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.1)' }] },
        options: chartOptions
    });

    temperatureChart = new Chart(document.getElementById('temperatureChart'), {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#4ecdc4', backgroundColor: 'rgba(78,205,196,0.1)' }] },
        options: chartOptions
    });

    foodChart = new Chart(document.getElementById('foodChart'), {
        type: 'bar',
        data: { labels: ['Food Inventory'], datasets: [{ data: [100], backgroundColor: '#4ecdc4' }] },
        options: {
            ...chartOptions,
            scales: {
                x: { display: true },
                y: {
                    ...chartOptions.scales.y,
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    ticks: {
                        ...chartOptions.scales.y.ticks,
                        stepSize: 20
                    }
                }
            }
        }
    });

    powerChart = new Chart(document.getElementById('powerChart'), {
        type: 'doughnut',
        data: { labels: ['Used', 'Available'], datasets: [{ data: [30, 70], backgroundColor: ['#ff6b6b', '#4ecdc4'] }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });

    sleepChart = new Chart(document.getElementById('sleepChart'), {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.1)' }] },
        options: chartOptions
    });

    // Initialize wellness chart with multi-user support
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');
    const datasets = [];
    const colors = ['#4ecdc4', '#00d4ff', '#ffa500', '#ff6b6b'];

    crewMembers.forEach((member, index) => {
        const userData = wellnessData[member.name];
        const data = userData?.current
            ? [userData.current.stress, userData.current.mood, userData.current.energy, userData.current.focus, userData.current.health]
            : [5, 7, 6, 8, 7]; // Default values

        datasets.push({
            label: member.name,
            data: data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace(')', ', 0.2)').replace('rgb', 'rgba').replace('#', 'rgba('),
            borderWidth: 2
        });
    });

    wellnessChart = new Chart(document.getElementById('wellnessChart'), {
        type: 'radar',
        data: {
            labels: ['Stress', 'Mood', 'Energy', 'Focus', 'Health'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: { line: { borderWidth: 2 } },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            family: 'Atkinson Hyperlegible'
                        }
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 2,
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    },
                    pointLabels: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

// Generate simulated data
function randomNormal(mean = 0, std = 1) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateData() {
    simulationTime += 0.1;

    const oxygen = Math.max(18, Math.min(22, 20 + 2 * Math.sin(simulationTime * 0.5) + randomNormal(0, 0.3)));
    const temperature = Math.max(-10, Math.min(25, 10 + 5 * Math.sin(simulationTime * 0.3) + randomNormal(0, 1)));
    const food = Math.max(0, Math.min(100, 80 + 10 * Math.sin(simulationTime * 0.2) + randomNormal(0, 2)));
    const powerUsed = Math.max(0, Math.min(100, 40 + 20 * Math.sin(simulationTime * 0.4) + randomNormal(0, 5)));
    const sleep = Math.max(6, Math.min(9, 7.5 + 1.5 * Math.sin(simulationTime * 0.6) + randomNormal(0, 0.2)));
    const wellness = {
        stress: Math.max(1, Math.min(10, 5 + 2 * Math.sin(simulationTime * 0.7) + randomNormal(0, 0.5))),
        mood: Math.max(1, Math.min(10, 7 + 1 * Math.sin(simulationTime * 0.8) + randomNormal(0, 0.3))),
        energy: Math.max(1, Math.min(10, 6 + 2 * Math.sin(simulationTime * 0.9) + randomNormal(0, 0.4))),
        focus: Math.max(1, Math.min(10, 8 + 1 * Math.sin(simulationTime * 1.0) + randomNormal(0, 0.3))),
        health: Math.max(1, Math.min(10, 7 + 1.5 * Math.sin(simulationTime * 0.5) + randomNormal(0, 0.4)))
    };

    return { oxygen, temperature, food, powerUsed, sleep, wellness };
}

// Update charts
function updateCharts(data) {
    const timeLabel = new Date().toLocaleTimeString();

    // Oxygen
    oxygenChart.data.labels.push(timeLabel);
    oxygenChart.data.datasets[0].data.push(data.oxygen);
    if (oxygenChart.data.labels.length > 25) {
        oxygenChart.data.labels.shift();
        oxygenChart.data.datasets[0].data.shift();
    }
    oxygenChart.update('none');

    // Temperature
    temperatureChart.data.labels.push(timeLabel);
    temperatureChart.data.datasets[0].data.push(data.temperature);
    if (temperatureChart.data.labels.length > 25) {
        temperatureChart.data.labels.shift();
        temperatureChart.data.datasets[0].data.shift();
    }
    temperatureChart.update('none');

    // Food
    foodChart.data.datasets[0].data = [data.food];
    foodChart.update('active');

    // Power
    powerChart.data.datasets[0].data = [data.powerUsed, 100 - data.powerUsed];
    powerChart.update('active');

    // Sleep
    sleepChart.data.labels.push(timeLabel);
    sleepChart.data.datasets[0].data.push(data.sleep);
    if (sleepChart.data.labels.length > 25) {
        sleepChart.data.labels.shift();
        sleepChart.data.datasets[0].data.shift();
    }
    sleepChart.update('none');

    // Wellness - only update when explicitly triggered (don't auto-refresh)
    // This will be updated by the updateWellnessChart() function when check-ins are submitted
}

// Function to update wellness chart from stored check-in data
function updateWellnessChart() {
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');
    const colors = ['#4ecdc4', '#00d4ff', '#ffa500', '#ff6b6b'];

    wellnessChart.data.datasets = [];
    crewMembers.forEach((member, index) => {
        const userData = wellnessData[member.name];
        const chartData = userData?.current
            ? [userData.current.stress, userData.current.mood, userData.current.energy, userData.current.focus, userData.current.health]
            : [5, 7, 6, 8, 7]; // Default values if no check-in exists

        wellnessChart.data.datasets.push({
            label: member.name,
            data: chartData,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace(')', ', 0.2)').replace('rgb', 'rgba').replace('#', 'rgba('),
            borderWidth: 2
        });
    });
    wellnessChart.update('active');
}

// Listen for wellness updates from check-in page (cross-tab updates)
window.addEventListener('storage', (e) => {
    if (e.key === 'wellnessUpdateTrigger') {
        updateWellnessChart();
    }
});

// Listen for wellness updates in the same page/tab
window.addEventListener('wellnessUpdated', () => {
    updateWellnessChart();
});

// Update alerts
function updateAlerts(data) {
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = '';

    const alerts = [];

    // Check overrides and add alerts
    if (!alertOverrides.oxygen && data.oxygen < 19) {
        const msg = `Oxygen levels critical: ${data.oxygen.toFixed(1)}%`;
        alerts.push({ message: msg, type: 'critical', alertType: 'oxygen' });
        logAlert('oxygen', msg, 'critical');
    }
    if (!alertOverrides.temperature && (data.temperature > 25 || data.temperature < 0)) {
        const msg = `Temperature out of range: ${data.temperature.toFixed(1)}°C`;
        alerts.push({ message: msg, type: 'critical', alertType: 'temperature' });
        logAlert('temperature', msg, 'critical');
    }
    if (!alertOverrides.food && data.food < 20) {
        const msg = `Food inventory low: ${data.food.toFixed(1)}%`;
        alerts.push({ message: msg, type: 'warning', alertType: 'food' });
        logAlert('food', msg, 'warning');
    }
    if (!alertOverrides.power && data.powerUsed > 90) {
        const msg = `Power usage high: ${data.powerUsed.toFixed(1)}%`;
        alerts.push({ message: msg, type: 'warning', alertType: 'power' });
        logAlert('power', msg, 'warning');
    }
    if (!alertOverrides.sleep && data.sleep < 6) {
        const msg = `Sleep cycles insufficient: ${data.sleep.toFixed(1)}h`;
        alerts.push({ message: msg, type: 'warning', alertType: 'sleep' });
        logAlert('sleep', msg, 'warning');
    }
    const avgWellness = Object.values(data.wellness).reduce((a, b) => a + b) / 5;
    if (!alertOverrides.wellness && avgWellness < 5) {
        const msg = `Crew wellness low: ${avgWellness.toFixed(1)}/10`;
        alerts.push({ message: msg, type: 'warning', alertType: 'wellness' });
        logAlert('wellness', msg, 'warning');
    }

    if (alerts.length === 0) {
        alerts.push({ message: 'All systems nominal', type: 'normal' });
    }

    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alert.type === 'normal' ? 'normal' : ''}`;
        alertDiv.textContent = alert.message;
        if (alert.alertType && alertOverrides[alert.alertType]) {
            alertDiv.style.opacity = '0.5';
            alertDiv.title = 'Alert overridden by admin';
        }
        alertsContainer.appendChild(alertDiv);
    });
}

// Update bay occupancy
function updateBayOccupancy() {
    const bays = document.querySelectorAll('.bay');
    bays.forEach((bay, index) => {
        const occupied = Math.random() > 0.5;
        bay.classList.toggle('occupied', occupied);
        bay.title = occupied ? `Occupied by ${crewMembers[index % crewMembers.length].name}` : 'Vacant';
    });
}

// Render crew profiles
function renderCrew() {
    const crewContainer = document.getElementById('crew-container');
    crewContainer.innerHTML = '';

    crewMembers.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'crew-member';
        memberDiv.innerHTML = `
            <h3>${member.name}</h3>
            <p><strong>Role:</strong> ${member.role}</p>
            <p><strong>Privileges:</strong> ${member.privileges.join(', ')}</p>
            <p><strong>Alerts:</strong></p>
            <ul>${member.alerts.map(alert => `<li>${alert}</li>`).join('')}</ul>
            <p><strong>Stats:</strong></p>
            <p>Login Count: ${member.stats.loginCount}</p>
            <p>Total Login Time: ${Math.floor(member.stats.totalLoginTime / 1000)}s</p>
            <p>Commands Executed: ${member.stats.commandsExecuted}</p>
            <p>Last Login: ${member.stats.lastLogin ? new Date(member.stats.lastLogin).toLocaleString() : 'Never'}</p>
        `;
        crewContainer.appendChild(memberDiv);
    });
}

// Terminal commands
function processCommand(command) {
    const output = document.getElementById('terminal-output');
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();

    let response = '';

    switch (cmd) {
        case 'login':
            if (parts[1]) {
                const user = crewMembers.find(m => m.name.toLowerCase().includes(parts[1].toLowerCase()));
                if (user) {
                    currentUser = user;
                    loginTime = Date.now();
                    user.stats.loginCount++;
                    user.stats.lastLogin = Date.now();
                    // Save current user to localStorage for admin page
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    localStorage.setItem('crewMembers', JSON.stringify(crewMembers));
                    response = `Logged in as ${user.name} (${user.role})`;
                } else {
                    response = 'User not found';
                }
            } else {
                response = 'Usage: login [username]';
            }
            break;
        case 'whoami':
            response = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Not logged in';
            break;
        case 'oxygen':
        case 'temperature':
        case 'food':
        case 'power':
        case 'sleep':
        case 'wellness':
            if (currentUser && currentUser.privileges.includes('read')) {
                const data = generateData();
                response = `${cmd.toUpperCase()}: ${cmd === 'wellness' ? 'See radar chart' : cmd === 'power' ? `${data.powerUsed.toFixed(1)}% used` : cmd === 'food' ? `${data.food.toFixed(1)}%` : cmd === 'sleep' ? `${data.sleep.toFixed(1)}h` : cmd === 'oxygen' ? `${data.oxygen.toFixed(1)}%` : `${data.temperature.toFixed(1)}°C`}`;
            } else {
                response = 'Access denied. Login required.';
            }
            break;
        case 'set':
            if (parts[1] && parts[2] && currentUser && currentUser.privileges.includes('admin')) {
                response = `Set ${parts[1]} to ${parts[2]} (simulated)`;
            } else if (!currentUser) {
                response = 'Access denied. Login required.';
            } else if (!currentUser.privileges.includes('admin')) {
                response = 'Access denied. Admin privilege required.';
            } else {
                response = 'Invalid syntax. Usage: set [parameter] [value]';
            }
            break;
        case 'analytics':
            if (currentUser && currentUser.privileges.includes('research')) {
                response = 'Analytics: All systems within acceptable parameters. Crew wellness stable.';
            } else {
                response = 'Access denied.';
            }
            break;
        case 'logout':
            if (currentUser && loginTime) {
                currentUser.stats.totalLoginTime += Date.now() - loginTime;
                localStorage.setItem('crewMembers', JSON.stringify(crewMembers));
            }
            currentUser = null;
            loginTime = null;
            // Clear current user from localStorage
            localStorage.removeItem('currentUser');
            response = 'Logged out';
            break;
        case 'alerts':
            const alerts = document.querySelectorAll('.alert');
            response = Array.from(alerts).map(a => a.textContent).join('\n');
            break;
        case 'users':
            response = crewMembers.map(m => `${m.name} - ${m.role} (${m.privileges.join(', ')})`).join('\n');
            break;
        case 'help':
            response = `Available commands:
login [username] - Logs in as a crew member
whoami - Displays current logged-in user
oxygen, temperature, food, power, sleep, wellness - Shows live metric data
set [parameter] [value] - Adjusts simulated parameter (requires admin privilege)
analytics - Displays simulated analytics summary (requires research privilege)
logout - Logs out of current session
alerts - Lists all current system alerts
users - Lists crew roles and privileges
help - Shows this help message`;
            break;
        default:
            response = 'Unknown command. Type "help" for available commands.';
    }

    if (currentUser) currentUser.stats.commandsExecuted++;

    // Log the command
    logCommand(command, response, currentUser);

    // Display command immediately
    output.innerHTML += `<div>&gt; ${command}</div>`;

    // Create response div and animate typing
    const responseDiv = document.createElement('div');
    output.appendChild(responseDiv);
    output.scrollTop = output.scrollHeight;

    // Type out the response
    typeText(responseDiv, response, 15);
}

// Typing animation function
function typeText(element, text, speed = 20) {
    let index = 0;
    element.textContent = '';

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            const output = document.getElementById('terminal-output');
            output.scrollTop = output.scrollHeight;
            setTimeout(type, speed);
        }
    }

    type();
}

// Crew chat
function initCrewChat() {
    const chatMessagesDiv = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');

    function renderChat() {
        chatMessagesDiv.innerHTML = chatMessages.map(msg => `<div><strong>${msg.user}:</strong> ${msg.message}</div>`).join('');
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }

    renderChat();

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message && currentUser) {
            chatMessages.push({ user: currentUser.name, message, timestamp: Date.now() });
            localStorage.setItem('crewChat', JSON.stringify(chatMessages));
            chatInput.value = '';
            renderChat();
        } else if (!currentUser) {
            alert('Please login to send messages');
        }
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Crew radar
function initCrewRadar() {
    const canvas = document.getElementById('radarCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;

    function drawRadar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw circles
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * i / 3, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
            ctx.stroke();
        }

        // Draw crew positions
        crewMembers.forEach((member, index) => {
            const angle = (index / crewMembers.length) * 2 * Math.PI;
            const distance = 50 + Math.random() * 100;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#4ecdc4';
            ctx.fill();

            ctx.fillStyle = '#e0e0e0';
            ctx.font = '12px Atkinson Hyperlegible';
            ctx.fillText(member.name.split(' ')[0], x + 10, y);
        });
    }

    setInterval(drawRadar, 2000);
    drawRadar();
}

// Logging and Admin State
let alertOverrides = JSON.parse(localStorage.getItem('alertOverrides') || '{}');
let alertLog = JSON.parse(localStorage.getItem('alertLog') || '[]');
let commandLog = JSON.parse(localStorage.getItem('commandLog') || '[]');

// Log an alert
function logAlert(alertType, message, severity) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        type: alertType,
        message: message,
        severity: severity,
        user: currentUser ? currentUser.name : 'System'
    };
    alertLog.push(logEntry);
    localStorage.setItem('alertLog', JSON.stringify(alertLog));
}

// Log a command
function logCommand(command, response, user) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        command: command,
        response: response,
        user: user ? user.name : 'Anonymous'
    };
    commandLog.push(logEntry);
    localStorage.setItem('commandLog', JSON.stringify(commandLog));
}

// Main update loop
function updateData() {
    const data = generateData();
    updateCharts(data);
    updateAlerts(data);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    renderCrew();
    initCrewChat();
    initCrewRadar();

    // Load wellness data on initial page load
    updateWellnessChart();

    // Terminal input
    const terminalInput = document.getElementById('terminal-input');
    terminalInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            processCommand(terminalInput.value);
            terminalInput.value = '';
        }
    });

    // Start simulation
    setInterval(updateData, 1000);
    setInterval(updateBayOccupancy, 30000);
    updateBayOccupancy(); // Initial call
});