# Instruções para Corrigir o Deploy no AWS Amplify

## Problema Identificado
O erro no deploy ocorreu porque o AWS Amplify estava tentando executar um comando inválido (`3337`) durante a fase de build. Este comando não existe e causou a falha do processo de deploy.

## Solução
Adicione o arquivo `amplify.yml` na raiz do seu projeto com a configuração correta para projetos Next.js.

## Como Implementar a Correção

1. Baixe o arquivo `amplify.yml` fornecido
2. Coloque-o na raiz do seu projeto (mesmo nível do package.json)
3. Faça commit e push para o seu repositório:
   ```bash
   git add amplify.yml
   git commit -m "Adicionar configuração correta do Amplify"
   git push
   ```
4. No console do AWS Amplify, inicie um novo deploy

## Detalhes da Configuração

O arquivo `amplify.yml` contém:
- Fase de pré-build: instalação de dependências com `npm install`
- Fase de build: compilação do projeto com `npm run build`
- Configuração de artefatos: diretório `.next` como base para deploy
- Configuração de cache: para otimizar builds futuros

Esta configuração é específica para projetos Next.js e garante que o AWS Amplify execute os comandos corretos durante o processo de deploy.
