# SIGE - Sistema de Gestão Empresarial

Este repositório contém a estrutura completa da aplicação **SIGE**, organizada como um monorepositório contendo o backend e o frontend da aplicação, além de suporte para desenvolvimento isolado via Dev Containers.

---

## 📁 Estrutura do Repositório

```text
teste_tecnico/
├── .devcontainer/     # Configuração de containers para desenvolvimento
├── backend/            # API REST construída com NestJS e Prisma (banco Postgres/Supabase)
├── frontend/           # Aplicação web SPA construída com React, Vite e TailwindCSS
└── readme.md           # Documentação principal do projeto (este arquivo)
```

---

## 🛠️ Tecnologias Principais

### **Backend** (`/backend`)
* **Framework**: NestJS (TypeScript)
* **Banco de Dados & ORM**: PostgreSQL (hospedado no Supabase) com Prisma ORM
* **Testes**: Jest e Supertest para testes unitários e de integração (E2E)

### **Frontend** (`/frontend`)
* **Ferramenta de Build**: Vite
* **Biblioteca UI**: React (TypeScript)
* **Estilização**: TailwindCSS (v4), Radix UI (Shadcn) e Material UI (MUI)
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
* **Testes Unitários em tempo real (Watch Mode)**:
  ```bash
  npm run test:watch
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

## 📝 Scripts Disponíveis

### Backend (`/backend`)
* `npm run build` - Compila o projeto NestJS para produção (`/dist`)
* `npm run start` - Inicializa a aplicação
* `npm run start:dev` - Inicializa a aplicação em modo observador (recarrega a cada mudança)
* `npm run test` - Roda testes unitários
* `npm run test:e2e` - Roda testes end-to-end com mocks do banco
* `npm run lint` - Executa a verificação de lint (ESLint) para garantir a consistência do código

### Frontend (`/frontend`)
* `npm run dev` - Roda o servidor local de desenvolvimento do Vite
* `npm run build` - Gera os arquivos otimizados de produção na pasta `/dist`