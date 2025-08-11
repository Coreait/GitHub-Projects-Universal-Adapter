# 🚀 GitHub Projects Universal Adapter

**Adaptador universal para sincronização automática de projetos com GitHub Projects**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![GitHub](https://img.shields.io/badge/GitHub-Projects%20v2-blue.svg)](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

## 📋 **Visão Geral**

Este script permite sincronizar automaticamente qualquer projeto com GitHub Projects, criando:
- **Milestones** (representando sprints)
- **Issues** (representando tarefas)
- **Kanban boards** (com colunas customizáveis)
- **Relatórios** detalhados

### ✨ **Características Principais**
- 🔄 **Universal**: Funciona com qualquer projeto
- ⚙️ **Configurável**: JSON simples para customização
- 📊 **Inteligente**: Organização automática por pontos/capacidade
- 🎯 **Flexível**: Suporte a múltiplos formatos de cronograma
- 📈 **Relatórios**: Geração automática de métricas

---

## 🚀 **Instalação Rápida**

### **1. Pré-requisitos**
```bash
# Node.js 16+ obrigatório
node --version

# Instalar dependências
npm install axios
```

### **2. Configuração GitHub**
```bash
# Variáveis de ambiente obrigatórias
set GITHUB_TOKEN=seu_token_aqui
set GITHUB_OWNER=seu_usuario_ou_organizacao
set GITHUB_REPO=nome_do_repositorio
```

### **3. Execução**
```bash
# Teste em modo DEMO
node scripts/github-projects-adapter.js

# Integração real (com variáveis configuradas)
node scripts/github-projects-adapter.js
```

---

## 🔧 **Configuração Detalhada**

### **Personal Access Token GitHub**

1. **Acesse:** https://github.com/settings/tokens
2. **Clique:** "Generate new token (classic)"
3. **Permissões obrigatórias:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `project` (Full control of projects)
4. **Copie o token** gerado

### **Arquivo de Configuração**

Crie/edite `config/projeto-config.json`:

```json
{
  "projeto": {
    "nome": "Seu Projeto Aqui",
    "versao": "1.0",
    "descricao": "Descrição do seu projeto"
  },
  "cronograma": {
    "arquivo": "../DOCUMENTACAO_TECNICA.md",
    "formato": "markdown"
  },
  "sprints": {
    "duracao_dias": 14,
    "capacidade_pontos": 25,
    "inicio_projeto": "2025-08-12"
  },
  "kanban": {
    "colunas": [
      {
        "nome": "📋 Backlog",
        "cor": "#f1f3f4",
        "limite_wip": null
      },
      {
        "nome": "🎯 Sprint Ready",
        "cor": "#e8f0fe",
        "limite_wip": 5
      },
      {
        "nome": "⚡ Desenvolvimento",
        "cor": "#fff3e0",
        "limite_wip": 3
      },
      {
        "nome": "✅ Concluído",
        "cor": "#e8f5e8",
        "limite_wip": null
      }
    ]
  }
}
```

---

## 📊 **Formatos de Cronograma Suportados**

### **Formato Markdown (Recomendado)**
```markdown
| Dia | Atividade | Duração | Entregável | Prioridade |
|-----|-----------|---------|------------|------------|
| 1 | Configuração inicial | 4h | Sistema configurado | 🔴 Alta |
| 2 | Desenvolvimento API | 6h | Endpoints funcionando | 🔴 Alta |
| 3 | Testes unitários | 3h | Cobertura 80%+ | 🟡 Média |
```

### **Mapeamento Automático**
- **Dia** → Sequência da tarefa
- **Atividade** → Título da issue
- **Duração** → Story points
- **Entregável** → Descrição da issue
- **Prioridade** → Label da issue

---

## 🎯 **Exemplos de Uso**

### **Projeto Web App**
```json
{
  "projeto": {
    "nome": "E-commerce Platform",
    "versao": "2.0"
  },
  "sprints": {
    "duracao_dias": 7,
    "capacidade_pontos": 30
  }
}
```

### **Projeto Mobile**
```json
{
  "projeto": {
    "nome": "Mobile Banking App",
    "versao": "1.5"
  },
  "sprints": {
    "duracao_dias": 21,
    "capacidade_pontos": 50
  }
}
```

### **Projeto DevOps**
```json
{
  "projeto": {
    "nome": "Infrastructure Automation",
    "versao": "3.0"
  },
  "kanban": {
    "colunas": [
      {"nome": "📋 Backlog"},
      {"nome": "🔧 Config"},
      {"nome": "🧪 Testing"},
      {"nome": "🚀 Deploy"},
      {"nome": "✅ Done"}
    ]
  }
}
```

---

## 📈 **Relatórios e Métricas**

### **Relatório Automático**
O script gera automaticamente:
```json
{
  "projeto": "Nome do Projeto",
  "data_execucao": "2025-08-11T14:39:39.914Z",
  "resumo": {
    "total_tarefas": 20,
    "total_sprints": 3,
    "total_pontos": 59
  },
  "sprints": [...],
  "configuracao": {...}
}
```

### **Métricas Incluídas**
- 📊 **Distribuição de pontos** por sprint
- 🎯 **Balanceamento de carga** automático
- 📅 **Cronograma** detalhado
- 🏷️ **Priorização** inteligente

---

## 🔧 **Customizações Avançadas**

### **Colunas Kanban Personalizadas**
```json
{
  "kanban": {
    "colunas": [
      {
        "nome": "🎨 Design",
        "cor": "#ff6b6b",
        "limite_wip": 2,
        "descricao": "Tarefas de design e UX"
      },
      {
        "nome": "💻 Frontend",
        "cor": "#4ecdc4",
        "limite_wip": 3,
        "descricao": "Desenvolvimento frontend"
      },
      {
        "nome": "⚙️ Backend",
        "cor": "#45b7d1",
        "limite_wip": 3,
        "descricao": "Desenvolvimento backend"
      }
    ]
  }
}
```

### **Templates de Issues**
```json
{
  "templates": {
    "descricao_card": "**Entregável:** {entregavel}\n**Sprint:** {sprint}\n**Pontos:** {pontos}",
    "checklist_padrao": [
      "[ ] Análise de requisitos",
      "[ ] Desenvolvimento",
      "[ ] Testes unitários",
      "[ ] Code review",
      "[ ] Deploy"
    ]
  }
}
```

---

## 🚨 **Troubleshooting**

### **Erro 404 - Repository not found**
```bash
# Verifique se o repositório existe
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO
```

### **Erro 401 - Unauthorized**
```bash
# Verifique o token
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/user
```

### **Erro de parsing do cronograma**
- ✅ Verifique se o arquivo existe no caminho especificado
- ✅ Confirme o formato da tabela markdown
- ✅ Verifique se há caracteres especiais

### **Milestones já existem**
```bash
# Normal - o script detecta e reutiliza milestones existentes
⚠️  Milestone já existe: Projeto Sprint 1
```

---

## 🤝 **Contribuindo**

### **Como Contribuir**
1. **Fork** este repositório
2. **Crie** uma branch para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra** um Pull Request

### **Reportar Issues**
- 🐛 **Bugs**: Use o template de bug report
- 💡 **Features**: Use o template de feature request
- 📖 **Documentação**: Melhorias na documentação

---

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 **Agradecimentos**

- **GitHub** pela excelente API
- **Comunidade Node.js** pelas bibliotecas
- **Contribuidores** que tornaram este projeto possível

---

## 📞 **Suporte**

- 📧 **Email**: suporte@coreait.com.br
- 💬 **Discord**: [CoreAIT Community](https://discord.gg/coreait)
- 📖 **Docs**: [Documentação Completa](https://docs.coreait.com.br)

---

**Desenvolvido com ❤️ pela equipe [CoreAIT](https://github.com/Coreait)**
