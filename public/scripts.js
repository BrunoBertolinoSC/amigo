// DOM Elements
const modeButtons = document.querySelectorAll('.mode-button');
const modes = document.querySelectorAll('.mode');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const toggleVoiceButton = document.getElementById('toggle-voice');
const statusElement = document.getElementById('status');

// Voice settings elements
const voiceSelect = document.getElementById('voice-select');
const pitchRange = document.getElementById('pitch-range');
const rateRange = document.getElementById('rate-range');
const volumeRange = document.getElementById('volume-range');
const pitchValue = document.getElementById('pitch-value');
const rateValue = document.getElementById('rate-value');
const volumeValue = document.getElementById('volume-value');

// Copilot Studio Configuration
const COPILOT_STUDIO_URL = 'https://copilotstudio.microsoft.com/environments/Default-db1a52f5-3267-4ea6-aaea-85cf6f15e6c7/bots/cref1_amigo/webchat?__version__=2';

// State
let isListening = false;
let recognition = null;
let synthesis = null;

// Initialize speech recognition and synthesis
function initializeSpeech() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = async (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            if (event.results[0].isFinal) {
                addMessage(transcript, true);
                try {
                    const response = await sendToCopilotStudio(transcript);
                    addMessage(response, false);
                    speakText(response);
                } catch (error) {
                    console.error('Error getting response from Copilot Studio:', error);
                    addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', false);
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            statusElement.textContent = 'Erro no reconhecimento de voz';
            isListening = false;
            toggleVoiceButton.textContent = 'Iniciar Conversa';
        };
    }

    if ('speechSynthesis' in window) {
        synthesis = window.speechSynthesis;
    }
}

// Mode switching
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const mode = button.dataset.mode;
        
        // Update buttons
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update modes
        modes.forEach(m => m.classList.remove('active'));
        document.getElementById(`${mode}-mode`).classList.add('active');
        
        // Stop voice recognition if switching modes
        if (isListening) {
            stopListening();
        }
    });
});

// Text mode functionality
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user' : 'ai');
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

sendButton.addEventListener('click', handleSend);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSend();
    }
});

async function handleSend() {
    const text = messageInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    messageInput.value = '';

    try {
        const response = await sendToCopilotStudio(text);
        addMessage(response, false);
    } catch (error) {
        console.error('Error getting response from Copilot Studio:', error);
        addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', false);
    }
}

// Copilot Studio Integration
async function sendToCopilotStudio(message) {
    try {
        const response = await fetch(COPILOT_STUDIO_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.response || 'Desculpe, não consegui processar sua mensagem.';
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Voice mode functionality
function updateVoiceSettings() {
    pitchValue.textContent = pitchRange.value;
    rateValue.textContent = rateRange.value;
    volumeValue.textContent = volumeRange.value;
}

pitchRange.addEventListener('input', updateVoiceSettings);
rateRange.addEventListener('input', updateVoiceSettings);
volumeRange.addEventListener('input', updateVoiceSettings);

function speakText(text) {
    if (!synthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synthesis.getVoices().find(voice => voice.name === voiceSelect.value);
    utterance.pitch = parseFloat(pitchRange.value);
    utterance.rate = parseFloat(rateRange.value);
    utterance.volume = parseFloat(volumeRange.value);

    synthesis.speak(utterance);
}

function startListening() {
    if (!recognition) {
        initializeSpeech();
    }

    try {
        recognition.start();
        isListening = true;
        toggleVoiceButton.textContent = 'Parar';
        statusElement.textContent = 'Ouvindo...';
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        statusElement.textContent = 'Erro ao iniciar reconhecimento de voz';
    }
}

function stopListening() {
    if (recognition) {
        recognition.stop();
    }
    isListening = false;
    toggleVoiceButton.textContent = 'Iniciar Conversa';
    statusElement.textContent = 'Pronto para conversar';
}

toggleVoiceButton.addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

// Initialize speech capabilities when the page loads
window.addEventListener('load', () => {
    initializeSpeech();
}); 
