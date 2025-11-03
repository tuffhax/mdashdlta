// Ship 67 Communications - Direct Crew Communications

const SHIP67_CONFIG = {
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    timeout: 10000,
    maxTokens: 500
};

let ship67State = {
    apiKey: localStorage.getItem('ship67_api_key') || '',
    chatHistory: JSON.parse(localStorage.getItem('ship67_chat_history') || '[]'),
    theme: localStorage.getItem('ship67_theme') || 'default'
};

function ship67Toast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff6b6b' : '#4ecdc4'};
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

async function sendShip67Message(message) {
    if (!ship67State.apiKey) {
        ship67Toast('Ship 67 API key not configured. Please set your Gemini API key.', 'error');
        return 'API key required for Ship 67 communication.';
    }

    const chatDiv = document.getElementById('ship67-chat');
    const timestamp = new Date().toLocaleTimeString();

    // Add user message
    chatDiv.innerHTML += `<div><strong>[${timestamp} HABITAT]</strong> ${message}</div>`;
    chatDiv.scrollTop = chatDiv.scrollHeight;

    try {
        const response = await fetch(`${SHIP67_CONFIG.apiEndpoint}?key=${ship67State.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a crew member on Ship 67, a spacecraft in orbit around Mars. You are communicating directly with the Martian habitat crew. Respond as a fellow astronaut - be professional, helpful, and maintain mission protocol. Keep responses concise and in character as a ship crew member. User message from habitat: ${message}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: SHIP67_CONFIG.maxTokens,
                }
            }),
            timeout: SHIP67_CONFIG.timeout
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const ship67Response = data.candidates[0].content.parts[0].text;

        // Add Ship 67 response
        chatDiv.innerHTML += `<div><strong>[${new Date().toLocaleTimeString()} SHIP67]</strong> ${ship67Response}</div>`;
        chatDiv.scrollTop = chatDiv.scrollHeight;

        // Save to history
        ship67State.chatHistory.push({ user: message, ship67: ship67Response, timestamp: Date.now() });
        localStorage.setItem('ship67_chat_history', JSON.stringify(ship67State.chatHistory));

        return ship67Response;

    } catch (error) {
        console.error('Ship 67 communication error:', error);
        const errorMsg = 'Communication with Ship 67 disrupted. Please check connection and API key.';
        chatDiv.innerHTML += `<div><strong>[${new Date().toLocaleTimeString()} SYSTEM]</strong> ${errorMsg}</div>`;
        ship67Toast(errorMsg, 'error');
        return errorMsg;
    }
}

function showApiKeyModal() {
    const modal = document.getElementById('ship67-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    modal.classList.add('active');
    apiKeyInput.focus();
}

function hideApiKeyModal() {
    const modal = document.getElementById('ship67-modal');
    modal.classList.remove('active');
}

function initShip67Comms() {
    const ship67Input = document.getElementById('ship67-input');
    const ship67Send = document.getElementById('ship67-send');
    const chatDiv = document.getElementById('ship67-chat');
    const modal = document.getElementById('ship67-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKey = document.getElementById('save-api-key');
    const cancelApiKey = document.getElementById('cancel-api-key');

    // Load chat history
    ship67State.chatHistory.forEach(entry => {
        const timestamp = new Date(entry.timestamp).toLocaleTimeString();
        chatDiv.innerHTML += `<div><strong>[${timestamp} HABITAT]</strong> ${entry.user}</div>`;
        chatDiv.innerHTML += `<div><strong>[${timestamp} SHIP67]</strong> ${entry.ship67}</div>`;
    });

    // Send message function
    async function sendMessage() {
        const message = ship67Input.value.trim();
        if (message) {
            await sendShip67Message(message);
            ship67Input.value = '';
        }
    }

    ship67Send.addEventListener('click', sendMessage);
    ship67Input.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    // API Key Modal handlers
    saveApiKey.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            ship67State.apiKey = key;
            localStorage.setItem('ship67_api_key', key);
            ship67Toast('Ship 67 API key configured successfully.');
            hideApiKeyModal();
            apiKeyInput.value = '';
        } else {
            ship67Toast('Please enter a valid API key.', 'error');
        }
    });

    cancelApiKey.addEventListener('click', hideApiKeyModal);

    apiKeyInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            saveApiKey.click();
        }
    });

    // Close modal on outside click
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            hideApiKeyModal();
        }
    });

    // Show modal if no API key
    if (!ship67State.apiKey) {
        showApiKeyModal();
    }
}

// Initialize Ship 67 when DOM is loaded
document.addEventListener('DOMContentLoaded', initShip67Comms);