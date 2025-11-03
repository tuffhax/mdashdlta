// Daily Check-In System

let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');

// Initialize page
function init() {
    if (!currentUser) {
        document.getElementById('login-required').style.display = 'block';
        document.getElementById('checkin-form').style.display = 'none';
        return;
    }

    document.getElementById('login-required').style.display = 'none';
    document.getElementById('checkin-form').style.display = 'block';

    // Display current user
    document.getElementById('current-user-display').innerHTML = `
        <p><strong>Logged in as:</strong> ${currentUser.name} (${currentUser.role})</p>
    `;

    // Initialize wellness data for user if not exists
    if (!wellnessData[currentUser.name]) {
        wellnessData[currentUser.name] = {
            history: [],
            current: { stress: 5, mood: 5, energy: 5, focus: 5, health: 5 }
        };
    }

    // Setup sliders
    setupSliders();

    // Load last check-in if exists
    loadLastCheckIn();

    // Render history
    renderHistory();

    // Submit button
    document.getElementById('submit-checkin').addEventListener('click', submitCheckIn);
}

function setupSliders() {
    const sliders = ['stress', 'mood', 'energy', 'focus', 'health'];

    sliders.forEach(metric => {
        const slider = document.getElementById(`${metric}-slider`);
        const valueDisplay = document.getElementById(`${metric}-value`);

        // Load current value if exists
        if (wellnessData[currentUser.name]?.current[metric]) {
            slider.value = wellnessData[currentUser.name].current[metric];
            valueDisplay.textContent = slider.value;
        }

        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
        });
    });
}

function loadLastCheckIn() {
    const userData = wellnessData[currentUser.name];
    if (!userData || userData.history.length === 0) {
        document.getElementById('last-checkin-info').innerHTML = `
            <p class="info-message">No previous check-ins found. Complete your first wellness assessment!</p>
        `;
        return;
    }

    const lastCheckIn = userData.history[userData.history.length - 1];
    const date = new Date(lastCheckIn.timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    document.getElementById('last-checkin-info').innerHTML = `
        <p class="info-message">
            <strong>Last check-in:</strong> ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
            ${isToday ? '<span class="today-badge">Completed Today</span>' : ''}
        </p>
    `;
}

function submitCheckIn() {
    const stress = parseInt(document.getElementById('stress-slider').value);
    const mood = parseInt(document.getElementById('mood-slider').value);
    const energy = parseInt(document.getElementById('energy-slider').value);
    const focus = parseInt(document.getElementById('focus-slider').value);
    const health = parseInt(document.getElementById('health-slider').value);

    const checkInData = {
        stress,
        mood,
        energy,
        focus,
        health,
        timestamp: new Date().toISOString(),
        user: currentUser.name
    };

    // Update user's wellness data
    wellnessData[currentUser.name].current = { stress, mood, energy, focus, health };
    wellnessData[currentUser.name].history.push(checkInData);

    // Save to localStorage
    localStorage.setItem('wellnessData', JSON.stringify(wellnessData));

    // Trigger a custom event to update wellness chart
    window.dispatchEvent(new CustomEvent('wellnessUpdated', { detail: wellnessData }));

    // Store a timestamp to trigger updates in other tabs
    localStorage.setItem('wellnessUpdateTrigger', Date.now().toString());

    // Show success message
    showToast('Check-in submitted successfully! Your wellness data has been updated on the dashboard.');

    // Refresh the page data
    loadLastCheckIn();
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-container');
    const userData = wellnessData[currentUser.name];

    if (!userData || userData.history.length === 0) {
        container.innerHTML = '<p class="empty-message">No check-in history yet.</p>';
        return;
    }

    // Show last 10 check-ins, most recent first
    const recentHistory = [...userData.history].reverse().slice(0, 10);

    container.innerHTML = recentHistory.map(entry => {
        const date = new Date(entry.timestamp);
        const avg = ((entry.stress + entry.mood + entry.energy + entry.focus + entry.health) / 5).toFixed(1);

        return `
            <div class="history-card">
                <div class="history-header">
                    <h4>${date.toLocaleDateString()}</h4>
                    <span class="history-time">${date.toLocaleTimeString()}</span>
                </div>
                <div class="history-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Stress:</span>
                        <span class="metric-value">${entry.stress}/10</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Mood:</span>
                        <span class="metric-value">${entry.mood}/10</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Energy:</span>
                        <span class="metric-value">${entry.energy}/10</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Focus:</span>
                        <span class="metric-value">${entry.focus}/10</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Health:</span>
                        <span class="metric-value">${entry.health}/10</span>
                    </div>
                </div>
                <div class="history-avg">Average: ${avg}/10</div>
            </div>
        `;
    }).join('');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
