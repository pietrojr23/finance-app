# 💰 Gerenciador Financeiro

Aplicativo web (PWA) para gerenciar entradas, saídas e pagamentos recorrentes de forma pessoal e privada, com login por e-mail/senha.

## Stack

- React 19 + Vite
- Firebase (Authentication + Firestore)
- PWA offline-first (`vite-plugin-pwa`)
- Deploy automático no GitHub Pages via GitHub Actions

## Funcionalidades

- **Autenticação** — cadastro e login por e-mail/senha (Firebase Auth). Cada usuário vê apenas os próprios dados.
- **Transações** — registrar entradas (receita) e saídas (despesa), editar e excluir.
- **Resumo** — cartões de **Entradas**, **Saídas** e **Saldo**.
- **Pagamentos recorrentes** — agendar pagamentos com frequência semanal, mensal, trimestral ou anual, e gerar a transação correspondente com um clique.
  - Para a categoria **Aluguel**, é possível informar também os valores de **IPTU** e **Condomínio**: as Entradas somam o valor do aluguel, e o **Saldo** desconta `IPTU + Condomínio`.
- **Categorias por usuário** — cada usuário pode criar e excluir suas próprias categorias de entrada e saída.

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` baseado no `.env.example` e preencha com as credenciais do seu projeto Firebase (Auth + Firestore):

   ```bash
   cp .env.example .env
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

## Deploy no GitHub Pages

O repositório inclui um workflow (`deploy.yml`) que, a cada push na branch `main`, executa `npm run build` e publica a pasta `dist/` no GitHub Pages.

Para o build de produção, as variáveis de ambiente do Firebase são lidas do arquivo `.env.production` (commitado, pois contém apenas chaves públicas do projeto Firebase — as regras de segurança no Firestore protegem os dados).

## Regras do Firestore

O repositório inclui o arquivo `firestore.rules`, que garante que cada usuário só possa ler/escrever nos próprios sub-caminhos (`users/{uid}/...`). Ao criar um projeto novo, publique as regras no console do Firebase (ou com `firebase deploy --only firestore:rules`).