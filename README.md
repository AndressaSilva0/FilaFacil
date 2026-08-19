# 🏥 FilaFácil UBS

**Sistema de Gerenciamento de Filas para Unidades Básicas de Saúde**

> Tornando o atendimento em UBS mais organizado, transparente e eficiente.

---

## 📋 Sobre o Projeto

Em muitas Unidades Básicas de Saúde (UBS), pacientes aguardam atendimento sem informações claras sobre a ordem da fila, o tempo estimado de espera ou o andamento dos atendimentos. O controle costuma ser realizado de forma manual, dificultando a organização da recepção, aumentando a percepção do tempo de espera e reduzindo a transparência do processo.

O **FilaFácil UBS** é um sistema que visa tornar o processo de atendimento mais organizado e transparente, permitindo que pacientes e recepcionistas acompanhem a fila em tempo real, reduzindo dúvidas e melhorando a experiência durante a espera.

### Pessoas Afetadas / Usuárias

- Pacientes que aguardam atendimento nas UBS
- Recepcionistas responsáveis pela organização da fila
- Profissionais de saúde que realizam os atendimentos
- Gestores da unidade

---

## ⚙️ Stack Tecnológica

| Camada                    | Tecnologia         |
| ------------------------- | ------------------ |
| **Front-end**             | React + Vite       |
| **Back-end**              | Node.js + Express  |
| **Banco de Dados**        | Supabase           |
| **ORM**                   | Prisma             |
| **Tempo Real**            | Socket.IO          |
| **Versionamento**         | Git & GitHub       |
| **Gestão do Projeto**     | Trello             |

### Justificativa

A equipe possui conhecimento prévio em React, Node.js e Prisma, reduzindo a curva de aprendizado e permitindo maior produtividade. O React possibilita o desenvolvimento de uma interface intuitiva para recepcionistas e pacientes, enquanto o Node.js e o Supabase oferecem uma base robusta para o gerenciamento das filas. O Socket.IO permitirá a atualização em tempo real da fila, e o Jira foi escolhido para organizar as atividades da equipe por meio de um fluxo simples e visual, atendendo aos requisitos da disciplina.

---

## 🚀 Funcionalidades (Escopo Inicial)

- ✅ Cadastro dos pacientes do dia
- ✅ Gerenciamento da fila de atendimento
- ✅ Chamada do próximo paciente
- ✅ Atualização do status do atendimento
- ✅ Visualização da fila em tempo real
- ✅ Registro básico dos atendimentos realizados

### Jornada Crítica

1. O recepcionista registra a chegada do paciente
2. O sistema adiciona o paciente à fila
3. Os profissionais chamam os pacientes conforme a ordem definida
4. A fila é atualizada em tempo real até a conclusão do atendimento

### Fora do Escopo

- Prontuário eletrônico
- Integração com o e-SUS APS
- Agendamento de consultas
- Emissão de receitas
- Controle de estoque de medicamentos
- Integração com sistemas governamentais
- Funcionalidades financeiras

---

## 👥 Equipe — Alpha Company

| Integrante                  | Responsabilidades na Sprint 1                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Hiago de Lima Zavarize**  | Organização do repositório, definição da stack, configuração inicial do projeto e apoio ao levantamento dos requisitos. |
| **Andressa Silva Pereira**  | Pesquisa com usuários, levantamento dos requisitos e documentação das evidências.                                      |
| **Leonardo Leal Moraes**    | Configuração do quadro no Trello, organização das tarefas da Sprint 1 e acompanhamento das atividades.                |
| **Sérgio Alves Coutinho**   | Pesquisa técnica, análise de viabilidade, revisão da documentação e apoio na elicitação dos requisitos.                |

---

## 📜 Acordo de Trabalho

- **Canal oficial:** Grupo no Slack
- **Disponibilidade comum:** Sábado e Domingo das 9h às 21h
- **Prazo de resposta:** Até 24 horas
- **Horário-limite da daily assíncrona (dias úteis sem aula):** 20h00
- **Registro de decisões:** Todas as decisões importantes serão registradas em um documento no repositório GitHub e referenciadas nos cartões do Trello quando necessário
- **Atualização do quadro:** O quadro do Jira será atualizado antes de cada aula e antes da publicação das dailies assíncronas
- **Tratamento de bloqueios:** O integrante deverá informar o bloqueio imediatamente no grupo oficial. Caso não seja resolvido pela equipe, será registrado no Trello e levado ao professor

---

## 🛠️ Ferramentas

| Finalidade              | Ferramenta   | Observação                                                                                                      |
| ------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------- |
| Gestão do projeto        | Jira         | https://andressasp68.atlassian.net/jira/software/projects/AC/boards/1/backlog?atlOrigin=eyJpIjoiZDRmNzc4NmRiYzc4NGI4YThlOTI0NTJjNTBhNjI2YTAiLCJwIjoiaiJ9                                                             |
| Repositório/documentação | GitHub       | [FilaFácil](https://github.com/AndressaSilva0/FilaFacil)                                                       |
| Comunicação              | Slack        | Grupo da equipe                                                                                                 |

---

## 🔍 Investigação e Evidências

### Indício Inicial

A equipe observou que diversas UBS ainda utilizam métodos manuais para organizar o atendimento. Além disso, são comuns relatos de usuários sobre demora, dificuldade para saber a ordem de atendimento e falta de informações durante a espera.

### Acesso à Evidência

A equipe pretende entrevistar pacientes, recepcionistas e profissionais de saúde de UBS da região, além de consultar documentos oficiais sobre o funcionamento da Atenção Primária e observar, quando possível, o fluxo de atendimento.

---

## 📊 Análise de Viabilidade

### Premissas

Pressupõe-se que um sistema simples para gerenciamento de filas pode melhorar a organização e a transparência do atendimento sem alterar os procedimentos clínicos já existentes.

### Restrições

- Tempo limitado ao semestre letivo
- Acesso restrito às UBS para observação do funcionamento
- Necessidade de validar as hipóteses com usuários reais
- Disponibilidade dos integrantes da equipe

### Riscos

- Dificuldade para entrevistar profissionais da saúde
- Necessidade de autorização para observar o atendimento
- Mudanças de escopo caso a investigação revele necessidades diferentes das hipóteses iniciais

### Maior Incerteza Técnica

Garantir que a atualização da fila ocorra em tempo real de forma estável quando houver várias alterações simultâneas.

### Primeiro Experimento Técnico

Desenvolver um protótipo simples utilizando Socket.IO para validar a atualização em tempo real entre duas telas (recepção e painel da fila).

---

## 🏃 Sprint 1

**Objetivo:** Validar a existência do problema com usuários reais, levantar os requisitos iniciais, definir a jornada crítica, configurar o ambiente de desenvolvimento, criar o quadro no Jira, organizar a documentação do projeto e validar a viabilidade técnica da atualização da fila em tempo real.

**Link do quadro:** https://andressasp68.atlassian.net/jira/software/projects/AC/boards/1/backlog?atlOrigin=eyJpIjoiZDRmNzc4NmRiYzc4NGI4YThlOTI0NTJjNTBhNjI2YTAiLCJwIjoiaiJ9

**Principal bloqueio atual:** Obter acesso a profissionais e usuários de uma Unidade Básica de Saúde para validar as hipóteses levantadas pela equipe.

**Decisão necessária:** Confirmar se o problema identificado representa uma necessidade relevante para os usuários e definir quais funcionalidades farão parte do Produto Mínimo Viável (MVP).

---

## ✅ Confirmação da Equipe

Todos os integrantes revisaram e concordaram com o conteúdo deste documento.

---

## 📄 Licença

Este projeto foi desenvolvido como parte de uma disciplina acadêmica do IFMA.
