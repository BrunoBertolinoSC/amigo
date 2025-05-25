# TCC - Assistente IA com Interação por Voz

Este projeto implementa um site moderno e responsivo para TCC, integrando uma IA do Microsoft Copilot Studio com modos de interação por texto e voz.

## Funcionalidades

- **Modo Escrita**: Interface tradicional de chat para interação por texto
- **Modo Voz**: Conversação por voz contínua com a IA
- **Personalização de Voz**: Seletor de vozes para escolher qual voz a IA usará
- **Design Responsivo**: Funciona em dispositivos móveis e desktop
- **Indicadores Visuais**: Mostra quando a IA está ouvindo ou falando

## Tecnologias Utilizadas

- React com TypeScript
- TailwindCSS para estilização
- Web Speech API para reconhecimento e síntese de voz
- iframe para integração com Microsoft Copilot Studio

## Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 16 ou superior)
- pnpm (gerenciador de pacotes)

### Instalação

1. Extraia o arquivo zip em uma pasta de sua preferência
2. Abra um terminal na pasta extraída
3. Instale as dependências:

```bash
pnpm install
```

### Execução em Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
pnpm run dev
```

O site estará disponível em `http://localhost:5173`

### Build para Produção

O projeto já inclui uma versão compilada na pasta `dist`. Se desejar gerar uma nova build:

```bash
pnpm run build
```

Os arquivos serão gerados na pasta `dist` e podem ser hospedados em qualquer servidor web.

## Personalização

- Edite o arquivo `src/App.tsx` para modificar o layout, comportamento ou integração
- Personalize o rodapé com suas informações no mesmo arquivo
- Ajuste o URL do iframe do Microsoft Copilot Studio conforme necessário

## Observações Importantes

- A integração com o Microsoft Copilot Studio é feita via iframe
- A funcionalidade de voz depende do suporte do navegador à Web Speech API
- Para melhor experiência, use navegadores modernos como Chrome ou Edge
