import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [activeMode, setActiveMode] = useState<'text' | 'voice' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [voiceTestMessage, setVoiceTestMessage] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // URL do Microsoft Copilot Studio
  const copilotUrl = "https://defaultdb1a52f532674ea6aaea85cf6f15e6.c7.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/cref1_agente1/conversations?api-version=2022-03-01-preview";

  // Referência para o objeto de reconhecimento de voz
  const recognitionRef = useRef<any>(null);
  // Referência para o objeto de síntese de voz
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  // Referência para controlar se o componente está montado
  const isMountedRef = useRef(true);

  // Inicializar a API de reconhecimento de voz e síntese de voz
  useEffect(() => {
    // Definir o componente como montado
    isMountedRef.current = true;

    // Verificar se o navegador suporta a Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // @ts-ignore - TypeScript não reconhece webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      // Configurar eventos de reconhecimento de voz
      recognitionRef.current.onresult = (event: any) => {
        if (!isMountedRef.current) return;
        
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        setTranscript(transcript);
        
        // Se o resultado for final e não estiver falando, enviar para o iframe
        if (result.isFinal && !isAiSpeaking && iframeRef.current) {
          // Em um cenário real, aqui seria implementada a comunicação com o iframe
          // para enviar o texto reconhecido para a IA
          console.log('Enviando para IA:', transcript);
          
          // Simulação de resposta da IA (em um cenário real, isso viria do iframe)
          setTimeout(() => {
            if (isMountedRef.current) {
              speakAiResponse("Olá, eu sou a IA do seu TCC. Como posso ajudar?");
            }
          }, 1000);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (!isMountedRef.current) return;
        
        console.error('Erro no reconhecimento de voz:', event.error);
        setErrorMessage(`Erro no reconhecimento de voz: ${event.error}`);
        setIsListening(false);
        
        // Tentar reiniciar o reconhecimento após um erro, se estiver no modo de voz
        if (activeMode === 'voice') {
          setTimeout(() => {
            if (isMountedRef.current && activeMode === 'voice') {
              startListening();
            }
          }, 1000);
        }
      };
      
      recognitionRef.current.onend = () => {
        if (!isMountedRef.current) return;
        
        // Se ainda estiver no modo de voz e não estiver falando, reiniciar o reconhecimento
        if (activeMode === 'voice' && !isAiSpeaking && isMountedRef.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Erro ao reiniciar reconhecimento:', error);
            setIsListening(false);
          }
        }
      };
    } else {
      setErrorMessage('Reconhecimento de voz não suportado neste navegador');
    }

    // Inicializar a síntese de voz
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Carregar vozes disponíveis
      const loadVoices = () => {
        if (speechSynthesisRef.current && isMountedRef.current) {
          const voices = speechSynthesisRef.current.getVoices();
          
          // Filtrar vozes para priorizar português, mas incluir todas
          const ptVoices = voices.filter(voice => 
            voice.lang.includes('pt') || 
            voice.name.toLowerCase().includes('pt') ||
            voice.name.toLowerCase().includes('portuguese') ||
            voice.name.includes('Maria') ||
            voice.name.includes('Daniel')
          );
          
          // Se encontrar vozes em português, colocá-las no início da lista
          let sortedVoices = [...voices];
          if (ptVoices.length > 0) {
            // Remover as vozes em português da lista completa
            sortedVoices = voices.filter(voice => !ptVoices.includes(voice));
            // Adicionar as vozes em português no início
            sortedVoices = [...ptVoices, ...sortedVoices];
          }
          
          setAvailableVoices(sortedVoices);
          
          // Se não houver voz selecionada e houver vozes disponíveis, selecionar a primeira
          if (!selectedVoice && sortedVoices.length > 0) {
            setSelectedVoice(sortedVoices[0].name);
          }
        }
      };
      
      // Carregar vozes imediatamente e também quando o evento onvoiceschanged for disparado
      loadVoices();
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    } else {
      setErrorMessage('Síntese de voz não suportada neste navegador');
    }

    // Limpar recursos ao desmontar o componente
    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Erro ao parar reconhecimento:', error);
        }
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Efeito para monitorar mudanças no modo ativo
  useEffect(() => {
    if (activeMode === 'voice') {
      startListening();
    } else {
      stopListening();
    }
  }, [activeMode]);

  // Função para iniciar o modo de voz
  const handleVoiceMode = () => {
    setActiveMode('voice');
  };

  // Função para iniciar o modo de texto
  const handleTextMode = () => {
    setActiveMode('text');
  };

  // Função para iniciar o reconhecimento de voz
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setErrorMessage('');
      } catch (error) {
        console.error('Erro ao iniciar reconhecimento de voz:', error);
        setErrorMessage('Erro ao iniciar reconhecimento de voz. Tente novamente.');
        setIsListening(false);
      }
    }
  };

  // Função para parar o reconhecimento de voz
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Erro ao parar reconhecimento:', error);
      }
    }
  };

  // Função para parar a conversa por voz
  const stopVoiceConversation = () => {
    stopListening();
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsAiSpeaking(false);
    }
    setTranscript('');
  };

  // Função para fazer a IA falar
  const speakAiResponse = (text: string) => {
    if (speechSynthesisRef.current) {
      // Parar qualquer fala em andamento
      speechSynthesisRef.current.cancel();
      
      // Criar um novo objeto de fala
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configurar a voz selecionada
      if (availableVoices.length > 0) {
        const selectedVoiceObj = availableVoices.find(voice => voice.name === selectedVoice);
        
        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
        } else {
          // Se não encontrar a voz selecionada, usar a primeira voz disponível
          utterance.voice = availableVoices[0];
        }
      }
      
      // Configurar propriedades adicionais
      utterance.rate = 1.0; // Velocidade normal
      utterance.pitch = 1.0; // Tom normal
      utterance.volume = 1.0; // Volume máximo
      
      // Configurar eventos de fala
      utterance.onstart = () => {
        if (isMountedRef.current) {
          setIsAiSpeaking(true);
          // Pausar o reconhecimento enquanto a IA está falando
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.stop();
            } catch (error) {
              console.error('Erro ao pausar reconhecimento:', error);
            }
          }
        }
      };
      
      utterance.onend = () => {
        if (isMountedRef.current) {
          setIsAiSpeaking(false);
          setVoiceTestMessage('');
          
          // Retomar o reconhecimento após a IA terminar de falar
          if (recognitionRef.current && activeMode === 'voice') {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (error) {
              console.error('Erro ao retomar reconhecimento:', error);
              // Tentar novamente após um breve intervalo
              setTimeout(() => {
                if (isMountedRef.current && activeMode === 'voice') {
                  try {
                    recognitionRef.current.start();
                    setIsListening(true);
                  } catch (innerError) {
                    console.error('Erro ao retomar reconhecimento (segunda tentativa):', innerError);
                  }
                }
              }, 500);
            }
          }
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Erro na síntese de voz:', event);
        if (isMountedRef.current) {
          setIsAiSpeaking(false);
          setVoiceTestMessage('');
          setErrorMessage('Erro na síntese de voz. Tente novamente.');
          
          // Retomar o reconhecimento após erro
          if (recognitionRef.current && activeMode === 'voice') {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (error) {
              console.error('Erro ao retomar reconhecimento após erro de síntese:', error);
            }
          }
        }
      };
      
      // Iniciar a fala
      speechSynthesisRef.current.speak(utterance);
    }
  };

  // Função para lidar com a mudança de voz selecionada
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoice = e.target.value;
    setSelectedVoice(newVoice);
    
    // Mostrar mensagem de teste
    setVoiceTestMessage('Testando voz selecionada...');
    
    // Testar a voz selecionada com uma mensagem
    setTimeout(() => {
      speakAiResponse("Olá, esta é a voz selecionada para a IA do seu TCC.");
    }, 300);
  };

  // Função para testar a voz atual
  const testCurrentVoice = () => {
    setVoiceTestMessage('Testando voz selecionada...');
    speakAiResponse("Olá, esta é a voz selecionada para a IA do seu TCC.");
  };

  // Função para comunicar com o iframe (em um cenário real)
  // Esta função será utilizada quando a integração com o iframe for implementada
  // Comentada para evitar erros de build
  /*
  const communicateWithIframe = (message: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Enviar mensagem para o iframe
      // Nota: Isso é um exemplo e pode precisar ser adaptado para a API específica do Copilot Studio
      iframeRef.current.contentWindow.postMessage({
        type: 'userMessage',
        content: message
      }, '*');
    }
  };
  */

  // Ouvir mensagens do iframe (em um cenário real)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar a origem da mensagem para segurança
      // Nota: Isso é um exemplo e deve ser adaptado para a origem correta do Copilot Studio
      if (event.origin.includes('powerplatform.com')) {
        // Processar a mensagem recebida
        if (event.data && event.data.type === 'aiResponse') {
          const aiResponse = event.data.content;
          
          // Se estiver no modo de voz, fazer a IA falar a resposta
          if (activeMode === 'voice' && isMountedRef.current) {
            speakAiResponse(aiResponse);
          }
        }
      }
    };

    // Adicionar o listener de mensagens
    window.addEventListener('message', handleMessage);

    // Remover o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [activeMode]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-700">
            Assistente IA - TCC
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Mode Selection Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={handleTextMode}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
              activeMode === 'text'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-600 hover:bg-indigo-50'
            }`}
            aria-label="Ativar modo de escrita"
          >
            Modo Escrita
          </button>
          <button
            onClick={handleVoiceMode}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
              activeMode === 'voice'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-600 hover:bg-indigo-50'
            }`}
            aria-label="Ativar modo de voz"
          >
            Modo Voz
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg max-w-md mx-auto">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Voice Controls (only visible in voice mode) */}
        {activeMode === 'voice' && (
          <div className="mb-6 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4">
              <div className={`relative ${isListening ? 'animate-pulse' : ''}`}>
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                {isListening && (
                  <div className="absolute -inset-1 bg-red-500 rounded-full opacity-30 animate-ping"></div>
                )}
              </div>
              <span className="text-gray-700">
                {isAiSpeaking 
                  ? 'IA falando...' 
                  : isListening 
                    ? 'IA ouvindo...' 
                    : 'IA em espera'}
              </span>
            </div>
            {transcript && (
              <div className="mb-4 p-3 bg-white rounded-lg shadow w-full max-w-lg">
                <p className="text-gray-700 italic">"{transcript}"</p>
              </div>
            )}
            <button
              onClick={stopVoiceConversation}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors"
              aria-label="Parar conversa por voz"
            >
              Parar Conversa por Voz
            </button>
          </div>
        )}

        {/* Voice Selection Dropdown */}
        <div className="mb-8 max-w-md mx-auto">
          <label htmlFor="voice-select" className="block text-gray-700 mb-2 font-medium">
            Selecionar Voz da IA:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={handleVoiceChange}
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="Selecionar voz da IA"
            >
              {availableVoices.length > 0 ? (
                availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              ) : (
                <>
                  <option value="pt-BR-Female">Google Portuguese Female</option>
                  <option value="pt-BR-Male">Google Portuguese Male</option>
                  <option value="Microsoft-Maria">Microsoft Maria</option>
                  <option value="Microsoft-Daniel">Microsoft Daniel</option>
                </>
              )}
            </select>
            <button
              onClick={testCurrentVoice}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors whitespace-nowrap"
              aria-label="Testar voz selecionada"
            >
              Testar Voz
            </button>
          </div>
          {voiceTestMessage && (
            <p className="mt-2 text-sm text-indigo-600">{voiceTestMessage}</p>
          )}
        </div>

        {/* IA Container with iframe */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 h-[500px] max-w-4xl mx-auto">
          {activeMode ? (
            <iframe
              ref={iframeRef}
              src={copilotUrl}
              className="w-full h-full border-0"
              title="Microsoft Copilot Studio"
              allow="microphone; camera"
              aria-label="Interface da IA do Microsoft Copilot Studio"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500 text-center px-4">
                Selecione um modo de interação acima
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2">TCC - Assistente IA</h2>
              <p className="text-indigo-200">Integração de IA conversacional com interface de voz</p>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-2">© 2025 - Trabalho de Conclusão de Curso</p>
              <p className="text-indigo-200">
                Desenvolvido por <span className="font-medium">Seu Nome</span>
              </p>
              <div className="mt-2 flex justify-center md:justify-end space-x-4">
                <a 
                  href="https://github.com/seu-usuario/tcc-ia" 
                  className="text-white hover:text-indigo-200 transition-colors flex items-center"
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Repositório no GitHub"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  GitHub
                </a>
                <a 
                  href="mailto:seu-email@exemplo.com" 
                  className="text-white hover:text-indigo-200 transition-colors flex items-center"
                  aria-label="Enviar e-mail"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
