# 🏥 FilaFácil UBS

**Sistema Moderno de Gerenciamento e Triagem de Filas para Unidades Básicas de Saúde**

> *Tornando o acolhimento e o atendimento na Atenção Primária à Saúde mais organizado, transparente, humanizado e eficiente.*

---

## 📋 Sobre o Projeto

Em muitas Unidades Básicas de Saúde (UBS), pacientes aguardam atendimento sem informações claras sobre a ordem da fila, o tempo estimado de espera ou o andamento dos consultórios. O controle tradicional realizado de forma manual sobrecarrega a recepção, eleva o estresse na sala de espera e reduz a transparência do fluxo ambulatorial.

O **FilaFácil UBS** é uma solução web moderna desenvolvida para transformar essa realidade. O sistema conecta recepcionistas, triagem e consultórios em tempo real, fornecendo controle visual das filas, alertas sonoros de chamada, conformidade com legislações de prioridade e exibição dedicada para TVs na recepção.

### Pessoas Usuárias e Beneficiadas

- **Pacientes e Acompanhantes**: Acompanham a fila em tempo real com previsão de espera e chamadas claras por voz e painel TV.
- **Recepcionistas e Agentes de Saúde**: Cadastram pacientes de forma rápida, emitem senhas com QR Code e gerenciam a fila sem papelada.
- **Profissionais de Saúde (Médicos, Enfermeiros, Dentistas)**: Chamam o próximo paciente com 1 clique diretamente de sua sala.
- **Gestores da UBS**: Monitoram tempos médios de espera, fluxo de horários de pico e taxas de absenteísmo.

---

## 🧭 Rotas da Aplicação (SPA Hash Navigation)

O projeto utiliza roteamento baseado em *hash routing* no client-side para compatibilidade imediata com servidores estáticos e fácil navegação sem recarregamento de página:

| Rota | Tela / Módulo | Descrição |
| :--- | :--- | :--- |
| `/` *(sem hash)* | **Landing Page Institucional** | Apresentação do FilaFácil, impacto no SUS, jornada do paciente, métricas públicas e botão de entrada no sistema. |
| `#/dashboard` | **Início / Dashboard Operacional** | Visão geral em tempo real com 4 StatCards, abas de fila (*Todos*, *Aguardando*, *Em Triagem*), chamada rápida em 1 clique com sinal sonoro e TV da recepção. |
| `#/add-queue` | **Adicionar na Fila (Triagem)** | Cadastro de paciente com busca simulada no CADSUS, seleção das 5 prioridades legais, especialidades ativas, **calendário interativo de dia/mês/ano** e emissão de senha térmica com QR Code. |
| `#/queue` | **Consultar Fila / Gestão** | Tabela operacional de pacientes, banner de *Próximo Imediato*, filtros combinados (status, especialidade, consultório, data) e rechamada de senhas. |
| `#/tv` | **Painel TV de Chamada** | Modo sala de espera em tela cheia com alto contraste, exibição de senha e consultório atual, histórico das últimas senhas chamadas e **locução por voz sintetizada**. |
| `#/stats` | **Estatísticas e Relatórios** | Painel analítico com tempo médio de atendimento, comparativo por turno, distribuição por especialidade e conformidade de metas do SUS. |
| `#/history` | **Histórico de Atendimentos** | Auditoria e histórico de pacientes atendidos, ausentes ou cancelados, com busca instantânea e filtros por período, sala e data. |
| `#/profile` | **Editar Meu Perfil do Operador** | Gestão de dados cadastrais (CPF, telefone, cargo, UBS, matrícula e senha), **Crachá Funcional Digital do SUS**, upload de foto e galeria de avatares rápidos da saúde. |

---

## ✨ Principais Funcionalidades e Diferenciais de UX/UI

### 1. Dashboard com Fila e Chamada em Tempo Real
- **StatCards Dinâmicos**: Pessoas na Fila (com variação temporal), Tempo Médio de Espera (com indicador de meta legal), Atendidos Hoje e Taxa de Ausências.
- **Card "Próximo da Fila"**: Permite chamar o próximo paciente prioritário imediatamente com acionamento sonoro e atualização simultânea da TV.
- **Abas Segmentadas**: Alternância fluida entre *Todos*, *Aguardando* e *Em Triagem*.

### 2. Triagem Rápida e Calendário Dinâmico
- **5 Níveis de Prioridade Legal**: *Comum*, *Idoso 60+*, *Idoso 80+* (superprioridade pelo Estatuto do Idoso), *Gestante* e *PCD*.
- **Calendário 100% Interativo**: Permite selecionar qualquer dia, trocar mês e ano via seletores ou setas de navegação, com botão de atalho `Hoje` para retorno imediato à data corrente.
- **Emissão de Senha**: Geração automática de código alfanumérico prioritário (ex: `P-038`, `C-077`) e modal de comprovante térmico para impressão.

### 3. Síntese Sonora e Locução por Voz
- **Sinal Sonoro de Chamada**: Implementado via **Web Audio API** nativa (`soundService.ts`), tocando um tom harmônico de dois acordes (hospitalar/aeroporto) sem necessidade de arquivos de áudio externos.
- **Locução Vocal**: Utiliza a **Web Speech API** nativa para sintetizar em português: *"Senha P042, favor dirigir-se ao Consultório 02"*.

### 4. Menu Retrátil e Modo Tela Cheia
- **Menu Lateral com Recolhimento Inteligente**: O operador pode recolher a barra lateral para ganhar espaço em telas menores ou tablets de triagem. A logo se transforma de forma suave entre a versão completa (`FilaFácil UBS`) e o ícone compacto com cruz de saúde (`FF`).
- **Botão de Tela Cheia (F11)**: Integrado diretamente no cabeçalho com detecção de eventos e suporte a monitores de recepção e TVs.

### 5. Perfil do Operador com Crachá Digital e Avatares
- **Menu Dropdown na Bolinha do Cabeçalho**: Acesso rápido às opções do perfil e logout em qualquer tela.
- **Crachá Funcional Digital SUS**: Card visual profissional com efeito glassmorphism, matrícula do operador e selo *Verificado*.
- **5 Avatares Rápidos Temáticos da Saúde**:
  1. *Agente Comunitário de Saúde (Hiago)* — polo azul oficial com crachá do SUS.
  2. *Dra. Mariana (Médica de Família)* — jaleco branco e estetoscópio.
  3. *Dr. Roberto (Clínico Geral)* — médico experiente em consultório.
  4. *Enfermeira Chefe da Equipe* — ilustração vetorial com scrub verde esmeralda.
  5. *Recepção / Triagem Humanizada* — ilustração com headset de atendimento e crachá do SUS.
- **Upload de Imagem Própria**: Leitor `FileReader` local integrado para carregar qualquer foto do computador.

---

## ⚙️ Stack Tecnológica

| Camada | Tecnologia | Detalhes / Versão |
| :--- | :--- | :--- |
| **Linguagem** | TypeScript | Tipagem estática rigorosa para dados de pacientes, filas e operadores |
| **Front-end Library** | React 19 | Hooks modernos (`useState`, `useEffect`, `useRef`), componentes funcionais |
| **Build Tool & Bundler** | Vite 8 | Transpilação instantânea e Hot Module Replacement (HMR) ultrarrápido |
| **Ícones** | Lucide React | Biblioteca de ícones SVG limpos e padronizados |
| **Estilização** | Vanilla CSS Moderno | Design System com variáveis CSS, responsividade flex/grid, paleta Gov.br / SUS |
| **Áudio e Voz** | Web Audio API + Web Speech API | Sons sintetizados em tempo de execução e fala natural em português |
| **Linter** | Oxlint | Análise estática de código de alto desempenho |
| **Back-end (Planejado)** | Node.js + Express | API REST e controle de sessões |
| **Banco de Dados (Planejado)** | Supabase (PostgreSQL) | Persistência relacional de pacientes, filas e atendimentos |
| **ORM (Planejado)** | Prisma | Modelagem e migrações do banco de dados |
| **Comunicação Realtime (Planejado)** | Socket.IO | Sincronização bidirecional entre guichês e TVs |

---

## 💻 Como Rodar e Configurar o Projeto

### Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **Node.js** (versão 18.0.0 ou superior recomendada) — [Download Node.js](https://nodejs.org/)
- **npm** (versão 9.0 ou superior, incluído com o Node.js) ou **pnpm** / **yarn**
- Um navegador moderno (Chrome, Edge, Firefox ou Safari)

---

### Passo a Passo de Instalação

#### 1. Clonar o Repositório
```bash
git clone https://github.com/AndressaSilva0/FilaFacil.git
cd FilaFacil
```
*(Caso esteja clonando diretamente na pasta do frontend, acerte o diretório `cd filafacil-frontend`)*

#### 2. Instalar as Dependências
Execute o comando abaixo para instalar todos os pacotes necessários:
```bash
npm install
```

#### 3. Iniciar o Servidor de Desenvolvimento
Para rodar a aplicação em modo de desenvolvimento com Hot Reload:
```bash
npm run dev
```

O terminal exibirá o endereço local de acesso, tipicamente:
```text
  VITE v8.3.0  ready in 180 ms

  ➜  Local:   http://localhost:5173/  (ou http://localhost:5174/)
  ➜  Network: use --host to expose
```
Abra o link exibido no seu navegador para utilizar o sistema.

---

### Scripts Disponíveis no `package.json`

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Vite em modo de desenvolvimento local com recarregamento instantâneo. |
| `npm run build` | Compila o TypeScript (`tsc -b`) e gera o bundle minificado de produção na pasta `dist/`. |
| `npm run preview` | Executa um servidor HTTP local servindo os arquivos gerados em `dist/` para testes pré-deploy. |
| `npm run lint` | Executa o linter Oxlint para verificar padrões e qualidade do código. |

---

## 📁 Estrutura de Diretórios do Front-end

```text
filafacil-frontend/
├── public/
│   ├── images/
│   │   ├── avatars/                  # Avatares temáticos (médicos, agentes, enfermeiros, recepcionistas)
│   │   ├── doctor-banner.png         # Ilustrações institucionais
│   │   ├── doctor-ubs-portrait.jpg   # Fotos de profissionais
│   │   └── hero-tablet-nurse.png
│   └── vite.svg
├── src/
│   ├── assets/                       # Ícones e logos vetoriais
│   ├── components/                   # Componentes reutilizáveis
│   │   ├── AppLayout.tsx             # Layout mestre (cabeçalho, barra lateral retrátil, dropdown de perfil)
│   │   ├── Logo.tsx                  # Logo dinâmica adaptável (expandida vs. ícone compacto)
│   │   └── StatCard.tsx              # Card de estatísticas com badges e tendências
│   ├── pages/                        # Telas completas da aplicação
│   │   ├── AddToQueuePage.tsx        # Recepção, triagem, CADSUS e calendário dinâmico
│   │   ├── DashboardPage.tsx         # Painel principal operacional em tempo real
│   │   ├── HistoryPage.tsx           # Histórico e auditoria de atendimentos
│   │   ├── LandingPage.tsx           # Página pública de apresentação
│   │   ├── ProfilePage.tsx           # Edição de perfil do operador e crachá SUS
│   │   ├── QueueListPage.tsx         # Consulta completa e gestão de fila
│   │   ├── StatisticsPage.tsx        # Métricas e relatórios da UBS
│   │   └── TVQueuePage.tsx           # Painel de chamada para TV da recepção
│   ├── services/
│   │   └── soundService.ts           # Sintetizador Web Audio API e Web Speech API
│   ├── styles/                       # Folhas de estilo modulares em Vanilla CSS
│   │   ├── add-queue.css             # Estilos de triagem, prioridades e calendário
│   │   ├── dashboard.css             # Estilos do dashboard e cards de atendimento
│   │   ├── history.css               # Estilos da tabela histórica e filtros
│   │   ├── landing.css               # Estilos da landing page
│   │   ├── layout.css                # Estilos do cabeçalho, sidebar retrátil e navegação
│   │   ├── profile.css               # Estilos da edição de perfil, crachá e avatares
│   │   ├── queue.css                 # Estilos da listagem de fila e banner imediato
│   │   ├── statistics.css            # Estilos dos gráficos e métricas
│   │   └── tv-queue.css              # Estilos de alto contraste para TV de recepção
│   ├── types/
│   │   └── queue.ts                  # Definições de tipos TypeScript (Paciente, Fila, Perfil, etc.)
│   ├── App.tsx                       # Roteamento SPA, estado global do operador e sincronização
│   ├── index.css                     # Variáveis globais do Design System (cores SUS, tipografia, resets)
│   └── main.tsx                      # Ponto de entrada React 19
├── index.html                        # HTML principal com fontes Inter e metadados
├── package.json                      # Dependências e scripts do projeto
├── tsconfig.json                     # Configuração do TypeScript
└── vite.config.ts                    # Configurações do Vite
```

---

## 👥 Equipe — Alpha Company

| Integrante | Responsabilidades no Projeto |
| :--- | :--- |
| **Hiago de Lima Zavarize** | Organização do repositório, definição da stack, desenvolvimento do layout/dashboard, configuração inicial e apoio técnico aos requisitos. |
| **Andressa Silva Pereira** | Pesquisa com usuários, levantamento dos requisitos funcionais, validação das jornadas e documentação de evidências. |
| **Leonardo Leal Moraes** | Gestão ágil, configuração dos quadros no Jira/Trello, organização de tarefas e acompanhamento dos prazos de entrega. |
| **Sérgio Alves Coutinho** | Pesquisa técnica, análise de viabilidade arquitetural, revisão da documentação e apoio na elicitação dos requisitos do SUS. |

---

## 📜 Acordo de Trabalho da Equipe

- **Canal oficial:** Grupo de comunicação no Slack
- **Disponibilidade comum:** Sábado e Domingo das 9h às 21h
- **Prazo de resposta:** Até 24 horas
- **Horário-limite da daily assíncrona (dias úteis sem aula):** 20h00
- **Registro de decisões:** Todas as decisões importantes serão registradas em documentos no repositório GitHub e referenciadas nos cartões de tarefas.
- **Atualização do quadro:** O quadro no Jira/Trello será atualizado antes de cada aula e antes da publicação das dailies assíncronas.
- **Tratamento de bloqueios:** O integrante deverá informar o bloqueio imediatamente no canal oficial. Caso não seja resolvido pela equipe, será levado ao orientador/professor.

---

## 🛠️ Ferramentas de Apoio

| Finalidade | Ferramenta | Link / Observação |
| :--- | :--- | :--- |
| **Gestão do Projeto** | Jira / Trello | [Quadro Jira da Alpha Company](https://andressasp68.atlassian.net/jira/software/projects/AC/boards/1/backlog?atlOrigin=eyJpIjoiZDRmNzc4NmRiYzc4NGI4YThlOTI0NTJjNTBhNjI2YTAiLCJwIjoiaiJ9) |
| **Repositório de Código** | GitHub | [Repositório FilaFácil](https://github.com/AndressaSilva0/FilaFacil) |
| **Comunicação Interna** | Slack | Grupo da equipe de desenvolvimento |

---

## 🔍 Investigação e Evidências

### Indício Inicial
A equipe observou que diversas UBS ainda utilizam métodos manuais para organizar o atendimento. Além disso, são comuns relatos de usuários sobre demora, dificuldade para saber a ordem de atendimento e falta de informações claras durante a espera na recepção.

### Acesso à Evidência
A equipe realizou entrevistas com pacientes, recepcionistas e profissionais de saúde de UBS da região, além de consultar documentos oficiais sobre o funcionamento da Atenção Primária à Saúde (APS) para mapear os gargalos do fluxo de acolhimento.

---

## 📊 Análise de Viabilidade

### Premissas
Pressupõe-se que um sistema simples e intuitivo de gerenciamento de filas pode melhorar significativamente a organização e a transparência do atendimento sem alterar os procedimentos clínicos já consolidados.

### Restrições
- Tempo limitado ao semestre letivo acadêmico.
- Acesso restrito a instalações internas de UBS durante horários de atendimento restrito.
- Necessidade de validar protótipos com operadores reais de saúde pública.

### Riscos e Mitigações
- **Dificuldade de adesão por recepcionistas**: Interface simplificada com preenchimento em 3 etapas e botões de chamada em 1 clique.
- **Ambientes sem internet estável**: Frontend leve em SPA com armazenamento local e baixo consumo de dados.

---

## 🏃 Sprint 1

- **Objetivo:** Validar a existência do problema com usuários reais, levantar os requisitos essenciais, definir a jornada crítica do paciente, configurar o ambiente de desenvolvimento, criar o quadro no Jira, organizar a documentação e validar a interface web de ponta a ponta.
- **Link do quadro:** [Backlog no Jira](https://andressasp68.atlassian.net/jira/software/projects/AC/boards/1/backlog?atlOrigin=eyJpIjoiZDRmNzc4NmRiYzc4NGI4YThlOTI0NTJjNTBhNjI2YTAiLCJwIjoiaiJ9)
- **Principal entrega realizada:** Protótipo funcional completo com todas as telas operacionais, roteamento SPA, sons de chamada, calendário interativo, gestão de perfil do operador e documentação técnica atualizada.

---

## ✅ Confirmação da Equipe

Todos os integrantes da equipe revisaram e concordaram com o conteúdo deste documento.

---

## 📄 Licença

Este projeto foi desenvolvido com finalidade acadêmica e de impacto social para a disciplina do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão (**IFMA**).
