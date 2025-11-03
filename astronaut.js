// Astronaut Research Assistant - AI-powered research support

const ASTRONAUT_CONFIG = {
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    timeout: 10000,
    maxTokens: 500
};

let astronautState = {
    apiKey: localStorage.getItem('astronaut_api_key') || '',
    chatHistory: JSON.parse(localStorage.getItem('astronaut_chat_history') || '[]'),
    theme: localStorage.getItem('astronaut_theme') || 'default'
};

function astronautToast(message, type = 'info') {
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

async function sendAstronautMessage(message) {
    if (!astronautState.apiKey) {
        astronautToast('Astronaut Assistant API key not configured. Please set your Gemini API key.', 'error');
        return 'API key required for Astronaut Assistant.';
    }

    const chatDiv = document.getElementById('astronaut-chat');
    const timestamp = new Date().toLocaleTimeString();

    // Add user message
    chatDiv.innerHTML += `<div><strong>[${timestamp} RESEARCHER]</strong> ${message}</div>`;
    chatDiv.scrollTop = chatDiv.scrollHeight;

    try {
        const response = await fetch(`${ASTRONAUT_CONFIG.apiEndpoint}?key=${astronautState.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are an Astronaut Research Assistant on a Martian habitat mission. You help crew members with research tasks, data analysis, scientific queries, and mission-related questions. Respond as a knowledgeable astronaut scientist - be helpful, professional, and maintain scientific accuracy. Keep responses concise and focused on research assistance. User query: ${message}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: ASTRONAUT_CONFIG.maxTokens,
                }
            }),
            timeout: ASTRONAUT_CONFIG.timeout
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const astronautResponse = data.candidates[0].content.parts[0].text;

        // Add Astronaut response with typing animation
        const responseDiv = document.createElement('div');
        const responseTimestamp = new Date().toLocaleTimeString();
        responseDiv.innerHTML = `<strong>[${responseTimestamp} ASTRONAUT]</strong> `;
        chatDiv.appendChild(responseDiv);

        // Create a span for the typing text
        const textSpan = document.createElement('span');
        responseDiv.appendChild(textSpan);

        // Type out the response
        typeAstronautText(textSpan, astronautResponse, 20);

        chatDiv.scrollTop = chatDiv.scrollHeight;

        // Save to history
        astronautState.chatHistory.push({ user: message, astronaut: astronautResponse, timestamp: Date.now() });
        localStorage.setItem('astronaut_chat_history', JSON.stringify(astronautState.chatHistory));

        return astronautResponse;

    } catch (error) {
        console.error('Astronaut Assistant error:', error);
        const errorMsg = 'Communication with Astronaut Assistant disrupted. Please check connection and API key.';
        chatDiv.innerHTML += `<div><strong>[${new Date().toLocaleTimeString()} SYSTEM]</strong> ${errorMsg}</div>`;
        astronautToast(errorMsg, 'error');
        return errorMsg;
    }
}

// Typing animation function for Astronaut
function typeAstronautText(element, text, speed = 20) {
    let index = 0;
    element.textContent = '';

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            const chatDiv = document.getElementById('astronaut-chat');
            chatDiv.scrollTop = chatDiv.scrollHeight;
            setTimeout(type, speed);
        }
    }

    type();
}

function showAstronautApiKeyModal() {
    const modal = document.getElementById('astronaut-modal');
    const apiKeyInput = document.getElementById('astronaut-api-key-input');
    modal.classList.add('active');
    apiKeyInput.focus();
}

function hideAstronautApiKeyModal() {
    const modal = document.getElementById('astronaut-modal');
    modal.classList.remove('active');
}

function initAstronautAssistant() {
    const astronautInput = document.getElementById('astronaut-input');
    const astronautSend = document.getElementById('astronaut-send');
    const chatDiv = document.getElementById('astronaut-chat');
    const modal = document.getElementById('astronaut-modal');
    const apiKeyInput = document.getElementById('astronaut-api-key-input');
    const saveApiKey = document.getElementById('save-astronaut-api-key');
    const cancelApiKey = document.getElementById('cancel-astronaut-api-key');

    // Load chat history
    astronautState.chatHistory.forEach(entry => {
        const timestamp = new Date(entry.timestamp).toLocaleTimeString();
        chatDiv.innerHTML += `<div><strong>[${timestamp} RESEARCHER]</strong> ${entry.user}</div>`;
        chatDiv.innerHTML += `<div><strong>[${timestamp} ASTRONAUT]</strong> ${entry.astronaut}</div>`;
    });

    // Send message function
    async function sendMessage() {
        const message = astronautInput.value.trim();
        if (message) {
            await sendAstronautMessage(message);
            astronautInput.value = '';
        }
    }

    astronautSend.addEventListener('click', sendMessage);
    astronautInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    // API Key Modal handlers
    saveApiKey.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            astronautState.apiKey = key;
            localStorage.setItem('astronaut_api_key', key);
            astronautToast('Astronaut Assistant API key configured successfully.');
            hideAstronautApiKeyModal();
            apiKeyInput.value = '';
        } else {
            astronautToast('Please enter a valid API key.', 'error');
        }
    });

    cancelApiKey.addEventListener('click', hideAstronautApiKeyModal);

    apiKeyInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            saveApiKey.click();
        }
    });

    // Close modal on outside click
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            hideAstronautApiKeyModal();
        }
    });

    // Show modal if no API key
    if (!astronautState.apiKey) {
        showAstronautApiKeyModal();
    }
}

// Initialize Astronaut Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', initAstronautAssistant);