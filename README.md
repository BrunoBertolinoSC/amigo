# TCC - Assistente IA com Next.js

Este projeto implementa um site moderno e responsivo para TCC, integrando uma IA do Microsoft Copilot Studio com modos de interação por texto e voz, desenvolvido com Next.js para compatibilidade com AWS Amplify.

## Funcionalidades

- **Modo Escrita**: Interface tradicional de chat para interação por texto
- **Modo Voz**: Conversação por voz contínua com a IA
- **Personalização de Voz**: Seletor de vozes para escolher qual voz a IA usará
- **Design Responsivo**: Funciona em dispositivos móveis e desktop
- **Indicadores Visuais**: Mostra quando a IA está ouvindo ou falando

## Tecnologias Utilizadas

- Next.js com TypeScript (SSR framework compatível com AWS Amplify)
- TailwindCSS para estilização
- Web Speech API para reconhecimento e síntese de voz
- iframe para integração com Microsoft Copilot Studio

## Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm (gerenciador de pacotes)

### Instalação

1. Extraia o arquivo zip em uma pasta de sua preferência
2. Abra um terminal na pasta extraída
3. Instale as dependências:

```bash
npm install
```

### Execução em Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O site estará disponível em `http://localhost:3000`

### Build para Produção

O projeto já inclui uma versão compilada na pasta `.next`. Se desejar gerar uma nova build:

```bash
npm run build
```

## Implantação na AWS Amplify

Este projeto foi desenvolvido para ser compatível com AWS Amplify. Para implantar:

1. Faça upload do código para um repositório Git (GitHub, GitLab, BitBucket)
2. No console da AWS Amplify, selecione "Hospedar aplicação web"
3. Conecte o repositório Git
4. Selecione a branch para implantação
5. Confirme as configurações de build (o Amplify detectará automaticamente que é um projeto Next.js)
6. Clique em "Salvar e implantar"

## Personalização

- Edite os arquivos em `src/app` para modificar o layout, comportamento ou integração
- Personalize o rodapé com suas informações no arquivo `src/app/page.tsx`
- Ajuste o URL do iframe do Microsoft Copilot Studio conforme necessário

## Observações Importantes

- A integração com o Microsoft Copilot Studio é feita via iframe
- A funcionalidade de voz depende do suporte do navegador à Web Speech API
- Para melhor experiência, use navegadores modernos como Chrome ou Edge
