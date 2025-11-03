// Research Log - Video and Todo Management

// Get current user
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Storage
let videoLogs = JSON.parse(localStorage.getItem('videoLogs') || '[]');
let todoItems = JSON.parse(localStorage.getItem('researchTodos') || '[]');

// Recording state
let mediaRecorder = null;
let recordedChunks = [];
let stream = null;

// Initialize page
function init() {
    setupVideoUpload();
    setupRecording();
    setupTodos();
    renderVideoLog();
    renderTodoList();
}

// === VIDEO UPLOAD ===
function setupVideoUpload() {
    const uploadArea = document.getElementById('video-upload-area');
    const fileInput = document.getElementById('video-file-input');

    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    if (!currentUser) {
        alert('Please login to upload videos');
        return;
    }

    Array.from(files).forEach(file => {
        if (file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addVideoLog({
                    id: Date.now() + Math.random(),
                    user: currentUser.name,
                    date: new Date().toISOString(),
                    videoData: e.target.result,
                    fileName: file.name,
                    notes: ''
                });
            };
            reader.readAsDataURL(file);
        }
    });
}

// === VIDEO RECORDING ===
function setupRecording() {
    const recordBtn = document.getElementById('record-video-btn');
    const stopBtn = document.getElementById('stop-record-btn');
    const preview = document.getElementById('preview-video');

    recordBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
}

async function startRecording() {
    if (!currentUser) {
        alert('Please login to record videos');
        return;
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const preview = document.getElementById('preview-video');
        preview.srcObject = stream;
        preview.style.display = 'block';

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const reader = new FileReader();
            reader.onload = (e) => {
                addVideoLog({
                    id: Date.now() + Math.random(),
                    user: currentUser.name,
                    date: new Date().toISOString(),
                    videoData: e.target.result,
                    fileName: `Recording_${new Date().toLocaleString()}.webm`,
                    notes: ''
                });
            };
            reader.readAsDataURL(blob);

            // Cleanup
            stream.getTracks().forEach(track => track.stop());
            preview.style.display = 'none';
            preview.srcObject = null;
        };

        mediaRecorder.start();

        document.getElementById('record-video-btn').style.display = 'none';
        document.getElementById('stop-record-btn').style.display = 'inline-flex';
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Could not access camera. Please check permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    document.getElementById('record-video-btn').style.display = 'inline-flex';
    document.getElementById('stop-record-btn').style.display = 'none';
}

// === VIDEO LOG MANAGEMENT ===
function addVideoLog(videoLog) {
    videoLogs.unshift(videoLog); // Add to beginning
    localStorage.setItem('videoLogs', JSON.stringify(videoLogs));
    renderVideoLog();
}

function renderVideoLog() {
    const container = document.getElementById('video-entries');
    container.innerHTML = '';

    if (videoLogs.length === 0) {
        container.innerHTML = '<p class="empty-message">No video logs yet. Upload or record your first research video!</p>';
        return;
    }

    videoLogs.forEach(log => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';

        const date = new Date(log.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        videoCard.innerHTML = `
            <video src="${log.videoData}" class="video-thumbnail"></video>
            <div class="video-info">
                <h4>${log.fileName}</h4>
                <p class="video-user"><strong>${log.user}</strong></p>
                <p class="video-date">${formattedDate}</p>
                ${log.notes ? `<p class="video-notes-preview">${log.notes.substring(0, 50)}${log.notes.length > 50 ? '...' : ''}</p>` : ''}
            </div>
        `;

        videoCard.addEventListener('click', () => openVideoModal(log));
        container.appendChild(videoCard);
    });
}

function openVideoModal(log) {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    const title = document.getElementById('modal-video-title');
    const user = document.getElementById('modal-video-user');
    const dateEl = document.getElementById('modal-video-date');
    const notes = document.getElementById('modal-video-notes');

    video.src = log.videoData;
    title.textContent = log.fileName;
    user.textContent = `Logged by: ${log.user}`;
    dateEl.textContent = new Date(log.date).toLocaleString();
    notes.value = log.notes || '';

    modal.classList.add('active');
    modal.dataset.videoId = log.id;
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    video.pause();
    modal.classList.remove('active');
}

function saveVideoNotes() {
    const modal = document.getElementById('video-modal');
    const videoId = parseFloat(modal.dataset.videoId);
    const notes = document.getElementById('modal-video-notes').value;

    const video = videoLogs.find(v => v.id === videoId);
    if (video) {
        video.notes = notes;
        localStorage.setItem('videoLogs', JSON.stringify(videoLogs));
        renderVideoLog();
        alert('Notes saved successfully!');
    }
}

function deleteVideo() {
    if (!confirm('Are you sure you want to delete this video log?')) {
        return;
    }

    const modal = document.getElementById('video-modal');
    const videoId = parseFloat(modal.dataset.videoId);

    videoLogs = videoLogs.filter(v => v.id !== videoId);
    localStorage.setItem('videoLogs', JSON.stringify(videoLogs));

    closeVideoModal();
    renderVideoLog();
}

// === TODO LIST ===
function setupTodos() {
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-todo-btn');

    addBtn.addEventListener('click', addTodo);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
}

function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();

    if (!text) return;

    if (!currentUser) {
        alert('Please login to add tasks');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        user: currentUser.name,
        completed: false,
        date: new Date().toISOString()
    };

    todoItems.push(todo);
    localStorage.setItem('researchTodos', JSON.stringify(todoItems));

    input.value = '';
    renderTodoList();
}

function toggleTodo(id) {
    const todo = todoItems.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        localStorage.setItem('researchTodos', JSON.stringify(todoItems));
        renderTodoList();
    }
}

function deleteTodo(id) {
    if (confirm('Delete this task?')) {
        todoItems = todoItems.filter(t => t.id !== id);
        localStorage.setItem('researchTodos', JSON.stringify(todoItems));
        renderTodoList();
    }
}

function renderTodoList() {
    const container = document.getElementById('todo-list');
    container.innerHTML = '';

    if (todoItems.length === 0) {
        container.innerHTML = '<p class="empty-message">No research tasks yet. Add your first task!</p>';
        return;
    }

    // Sort: incomplete first, then by date
    const sorted = [...todoItems].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(b.date) - new Date(a.date);
    });

    sorted.forEach(todo => {
        const todoCard = document.createElement('div');
        todoCard.className = `todo-card ${todo.completed ? 'completed' : ''}`;

        const date = new Date(todo.date).toLocaleDateString();

        todoCard.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <div class="todo-content">
                <p class="todo-text">${todo.text}</p>
                <p class="todo-meta">
                    <span class="todo-user">${todo.user}</span> •
                    <span class="todo-date">${date}</span>
                </p>
            </div>
            <button class="delete-todo-btn" onclick="deleteTodo(${todo.id})">✕</button>
        `;

        container.appendChild(todoCard);
    });
}

// Event listeners
document.getElementById('close-video-modal').addEventListener('click', closeVideoModal);
document.getElementById('save-video-notes').addEventListener('click', saveVideoNotes);
document.getElementById('delete-video-btn').addEventListener('click', deleteVideo);

document.getElementById('video-modal').addEventListener('click', (e) => {
    if (e.target.id === 'video-modal') {
        closeVideoModal();
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
