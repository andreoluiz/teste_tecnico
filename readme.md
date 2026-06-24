# SIGE - Sistema de Gestão Empresarial

Este repositório contém a estrutura completa da aplicação **SIGE**, organizada como um monorepositório contendo o backend e o frontend da aplicação, além de suporte para desenvolvimento isolado via Dev Containers e pipeline automatizada de CI/CD.

---

## 📁 Estrutura do Repositório

```text
teste_tecnico/
├── .devcontainer/     # Configuração de containers para desenvolvimento
├── .github/            # Workflows do GitHub Actions (CI/CD)
├── backend/            # API REST construída com NestJS e Prisma (PostgreSQL no Supabase)
├── frontend/           # Aplicação web SPA construída com React, Vite e TailwindCSS (v4)
└── readme.md           # Documentação principal do projeto (este arquivo)
```
...
---

## 🛠️ Tecnologias Principais

### **Backend** (`/backend`)
* **Framework**: NestJS (TypeScript)
* **Banco de Dados & ORM**: PostgreSQL (Supabase) com Prisma ORM
* **Segurança**: Autenticação via JWT com proteção integrada
* **Testes**: Jest e Supertest para testes unitários e de integração (E2E)

### **Frontend** (`/frontend`)
* **Ferramenta de Build**: Vite
* **Biblioteca UI**: React (TypeScript)
* **Estilização**: TailwindCSS (v4), Radix UI (Shadcn) e Material UI (MUI)
* **Navegação**: Header responsivo unificado com suporte a menu hambúrguer para dispositivos móveis
* **Animações**: Framer Motion
* **Roteamento**: React Router Dom

---

## 🐳 Desenvolvimento com Dev Container (Recomendado)

O projeto inclui suporte completo a **Dev Containers**, permitindo que você inicie todo o ambiente configurado com apenas um clique, sem necessidade de instalar Node.js ou banco de dados localmente.

### Como rodar:
1. Certifique-se de ter o **Docker** e a extensão **Dev Containers** instalados no seu VS Code.
2. Abra a pasta raiz `teste_tecnico` no VS Code.
3. Quando surgir o pop-up no canto inferior direito, clique em **Reopen in Container** (ou pressione `F1` e escolha `Dev Containers: Reopen in Container`).
4. O container irá baixar todas as dependências do Node.js e expor as portas automaticamente:
   * **Backend**: Porta `3000`
   * **Frontend**: Porta `5173`

---

## 🚀 Como Executar Localmente

Caso prefira rodar fora de um container, certifique-se de ter o **Node.js (versão >= 20)** instalado e execute os passos abaixo.

### 1. Configurar e rodar o Backend

Acesse o diretório do backend:
```bash
cd backend
```

Instale as dependências:
```bash
npm install
```

Configure as variáveis de ambiente criando um arquivo `.env` na raiz do diretório `backend/` (use o `.env.example` como base):
```env
DATABASE_URL="sua-url-de-conexao-do-supabase"
DIRECT_URL="sua-url-de-conexao-direta-do-supabase"
JWT_SECRET="sua-chave-secreta-jwt"
PORT=3000
```

Gere o Prisma Client e execute as migrações:
```bash
npx prisma generate
```

Inicie o servidor de desenvolvimento:
```bash
npm run start:dev
```
A API estará rodando em: `http://localhost:3000`

---

### 2. Configurar e rodar o Frontend

Abra outro terminal na raiz do projeto e acesse a pasta do frontend:
```bash
cd frontend
```

Instale as dependências:
```bash
npm install
```

Configure as variáveis de ambiente criando um arquivo `.env` na raiz do diretório `frontend/` (use o `.env.example` como base):
```env
VITE_SUPABASE_URL="sua-url-do-supabase"
VITE_SUPABASE_ANON_KEY="sua-chave-anonima-do-supabase"
VITE_API_URL="http://localhost:3000" # URL do Backend
```

Inicie o servidor de desenvolvimento do Vite:
```bash
npm run dev
```
O painel do frontend estará acessível em: `http://localhost:5173`

---

## 🧪 Rodando os Testes do Backend

O backend conta com uma suíte de testes configurada com o **Jest** para execução de testes unitários locais e de ponta a ponta (e2e).

Acesse a pasta `backend/` e execute:

* **Testes Unitários**:
  ```bash
  npm run test
  ```
* **Testes de Integração / E2E**:
  ```bash
  npm run test:e2e
  ```
* **Cobertura de Testes (Coverage)**:
  ```bash
  npm run test:cov
  ```

---

## ⚙️ Pipeline de Integração e Entrega Contínua (CI/CD)

O projeto conta com automação via **GitHub Actions** dividida em duas etapas principais:

### 1. Integração Contínua (CI) — `ci.yml`
Disparado a cada Push ou Pull Request enviado para as branches `main` e `dev`. Ele executa:
* Instalação de dependências e geração do Prisma Client.
* Validação do Linter (ESLint).
* Checagem de tipagem do TypeScript (`tsc --noEmit`).
* Execução da suíte completa de testes unitários e testes E2E do Backend.

### 2. Entrega Contínua (CD) — `cd.yml`
Disparado automaticamente ao realizar push direto ou aceitar um merge na branch `main`. Realiza o deploy nos ambientes de produção:
* **Deploy do Backend (Render)**: Aciona o deploy via webhook do serviço configurado no Render.
* **Deploy do Frontend (Vercel)**: Compila e publica a aplicação estática do frontend na Vercel.

#### Configuração de Secrets no GitHub:
Para que a esteira de CD funcione corretamente, você deve cadastrar as seguintes chaves em **Settings > Secrets and variables > Actions > Repository secrets** no GitHub:
* `RENDER_DEPLOY_WEBHOOK`: URL privada do Deploy Hook gerada no painel do Render.
* `VERCEL_TOKEN`: Token pessoal de acesso gerado no painel da Vercel.
* `VERCEL_ORG_ID`: ID da sua organização ou conta pessoal da Vercel.
* `VERCEL_PROJECT_ID`: ID do projeto do frontend gerado na Vercel.
