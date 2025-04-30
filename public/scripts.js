let recognition;
const output = document.getElementById('output');

function falarTexto(texto) {
  const sintese = new SpeechSynthesisUtterance();
  sintese.text = texto;
  sintese.lang = 'pt-BR';
  sintese.rate = 1;
  sintese.pitch = 1;
  window.speechSynthesis.speak(sintese);
}

document.getElementById('startBtn').addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Seu navegador não suporta reconhecimento de voz.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const resultado = event.results[event.results.length - 1][0].transcript;
    output.textContent = `Você disse: "${resultado}"`;
    falarTexto(resultado); // IA responde falando o que entendeu
  };

  recognition.onerror = (event) => {
    console.error('Erro no reconhecimento:', event.error);
    output.textContent = `Erro: ${event.error}`;
  };

  recognition.onend = () => {
    output.textContent += ' (Reconhecimento parado)';
  };

  recognition.start();
  output.textContent = '🎤 Escutando...';
});

document.getElementById('stopBtn').addEventListener('click', () => {
  if (recognition) {
    recognition.stop();
    output.textContent = 'Conversa finalizada.';
  }
});
