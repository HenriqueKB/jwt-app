# Biblioteca UNIPAR — Aplicação Web (`jwt-app`)

Interface web do **Sistema de Gestão de Biblioteca** desenvolvida com **Next.js (App Router)**, **TypeScript** e **Tailwind CSS**, integrada à API REST (`jwt-api`) com renovação automática de sessão via **Refresh Token**.

---

## 1. Tecnologias Utilizadas

- **Next.js** (App Router) e **React**
- **TypeScript**
- **Tailwind CSS**
- **Fetch API** com wrapper customizado (`apiFetch`) para interceptação de `401` e fila de refresh token

---

## 2. Instalação e Execução

### 2.1 Instalar dependências

```bash
npm install
```

### 2.2 Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto `jwt-app` apontando para a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

### 2.3 Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse a aplicação no navegador (por padrão em `http://localhost:3001` ou `http://localhost:3000`, conforme exibido no terminal).

---

## 3. Acesso ao Sistema

Para acessar como **Administrador** (utilizando o usuário criado pelo seed da API):

- **E-mail:** `admin@biblioteca.com`
- **Senha:** `123456`

### Perfis de Acesso na Interface

- **Administrador (`isAdmin = true`):** Acesso completo ao Dashboard, Empréstimos, Leitores, cadastro/edição/exclusão de Livros, Categorias, Autores e gerenciamento de Atendentes.
- **Atendente (`isAdmin = false`):** Acesso ao Dashboard, registro e devolução de Empréstimos, cadastro/edição de Leitores e consulta ao acervo. Menus e ações restritas a administradores ficam ocultos na interface (além do bloqueio na API).

---

## 4. Telas Implementadas

1. **Login (`/login`):** Autenticação com validação de formulário e exibição de mensagens de erro (credenciais inválidas ou usuário inativo).
2. **Dashboard (`/`):** Cards com indicadores em tempo real (Total de Livros, Empréstimos Ativos, Empréstimos Atrasados e Total em Multas).
3. **Empréstimos (`/loans`):** Registro de novos empréstimos (seleção de leitor e livro disponível), filtro rápido por status (`Todos`, `Ativos`, `Atrasados`, `Devolvidos`) e botão de devolução com exibição da multa calculada.
4. **Livros (`/books`):** Listagem com filtros combinados (título, categoria, autor e disponibilidade), cadastro/edição com seleção de categoria e múltiplos autores, e indicador visual de exemplares disponíveis.
5. **Leitores (`/readers`):** Cadastro, edição e modal/painel de histórico de empréstimos por leitor.
6. **Categorias (`/categories`) e Autores (`/authors`):** CRUD completo com tratamento de bloqueio caso existam livros vinculados.
7. **Atendentes (`/users`):** Tela exclusiva de administrador para cadastrar, editar e ativar/desativar operadores do sistema.

---

## 5. Interceptor HTTP e Decisões de Segurança

### 5.1 Renovação Automática de Token (`apiFetch`)

Todas as requisições autenticadas passam pelo wrapper `apiFetch` (`lib/api.ts`), que:

1. Anexa automaticamente o cabeçalho `Authorization: Bearer <accessToken>`.
2. Ao receber resposta **`401 Unauthorized`**, intercepta a falha e dispara uma chamada para `POST /v1/auth/refresh` enviando o `refreshToken`.
3. **Fila de requisições simultâneas:** Caso múltiplas requisições falhem com `401` ao mesmo tempo (por exemplo, ao carregar o Dashboard ou a tela de Livros), apenas **uma** chamada de refresh é enviada à API enquanto as demais aguardam em fila para serem reexecutadas com o novo `accessToken`.
4. Se o refresh falhar (token expirado ou revogado), os dados da sessão são limpos e o usuário é redirecionado para `/login`.

### 5.2 Riscos do Armazenamento de Tokens no Navegador (`localStorage`)

Nesta aplicação web, o `accessToken` e o `refreshToken` são armazenados no **`localStorage`** do navegador para persistência da sessão entre recarregamentos de página.

- **Riscos da escolha:** Diferente de cookies configurados com as flags `HttpOnly` e `Secure`, dados salvos no `localStorage` ficam acessíveis via JavaScript na origem da página. Isso significa que, caso a aplicação sofra uma vulnerabilidade de **XSS (Cross-Site Scripting)**, um script malicioso injetado poderia ler os tokens armazenados. Por outro lado, o uso de `localStorage` com envio explícito via header `Authorization: Bearer` evita ataques de **CSRF (Cross-Site Request Forgery)**, pois o navegador não envia o token automaticamente em requisições cross-site.
- **Mitigações adotadas:** Para reduzir a janela de exposição em caso de comprometimento, o `accessToken` possui vida útil curta (**15 minutos**) e o `refreshToken` utiliza **rotação no back-end** com detecção de reutilização (revogando todas as sessões do usuário caso um token antigo seja reenviado).