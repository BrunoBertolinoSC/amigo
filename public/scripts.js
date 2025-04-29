const falaBtn = document.getElementById('falaBtn');

falaBtn.addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Seu navegador não suporta reconhecimento de voz.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const texto = event.results[0][0].transcript;
    console.log('Você disse:', texto);
    alert('Você disse: ' + texto + '\nCopie e cole no chat da IA.');
  };

  recognition.onerror = (event) => {
    console.error('Erro:', event.error);
    alert('Erro ao reconhecer voz: ' + event.error);
  };

  recognition.start();
});
