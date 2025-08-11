/**
 * GitProject Universal - Gestão de Sprints e Kanban
 * Versão: 2.0 | Data: 11/08/2025
 * Adaptável para qualquer projeto
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class GitProjectUniversal {
    constructor(configPath = '../config/projeto-config.json') {
        this.config = this.carregarConfig(configPath);
        this.cronograma = null;
        this.sprints = [];
        this.quadrosKanban = [];
        this.configurarAPI();
    }

    /**
     * Carrega configuração do projeto
     */
    carregarConfig(configPath) {
        try {
            const caminhoCompleto = path.resolve(__dirname, configPath);
            const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
            return JSON.parse(conteudo);
        } catch (erro) {
            console.error('❌ Erro ao carregar configuração:', erro.message);
            throw erro;
        }
    }

    /**
     * Configura API do GitProject
     */
    configurarAPI() {
        this.headers = {
            'Authorization': `Bearer ${process.env.GITPROJECT_TOKEN}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Lê cronograma da documentação
     */
    async lerCronograma() {
        console.log('📖 Lendo cronograma...');
        
        const caminhoArquivo = path.resolve(__dirname, this.config.cronograma.arquivo);
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
        
        this.cronograma = this.extrairTarefas(conteudo);
        console.log(`✅ ${this.cronograma.total_tarefas} tarefas carregadas`);
        
        return this.cronograma;
    }

    /**
     * Extrai tarefas do markdown
     */
    extrairTarefas(conteudo) {
        const cronograma = { semanas: [], total_tarefas: 0 };
        
        // Regex para tabelas de cronograma
        const regexTabela = /\|\s*Dia\s*\|\s*Atividade\s*\|\s*Duração\s*\|\s*Entregável\s*\|\s*Prioridade\s*\|([\s\S]*?)(?=\n\n|\n###|\n##|$)/gi;
        const regexLinha = /\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;

        let matchTabela;
        let semanaAtual = 1;

        while ((matchTabela = regexTabela.exec(conteudo)) !== null) {
            const tarefasSemana = [];
            let matchLinha;

            while ((matchLinha = regexLinha.exec(matchTabela[1])) !== null) {
                const [, dia, atividade, duracao, entregavel, prioridade] = matchLinha;
                
                const tarefa = {
                    id: `T${String(cronograma.total_tarefas + 1).padStart(3, '0')}`,
                    atividade: atividade.trim(),
                    duracao: duracao.trim(),
                    entregavel: entregavel.trim(),
                    prioridade: this.processarPrioridade(prioridade.trim()),
                    pontos: this.calcularPontos(duracao.trim(), prioridade.trim()),
                    semana: semanaAtual,
                    dia: parseInt(dia.trim())
                };

                tarefasSemana.push(tarefa);
                cronograma.total_tarefas++;
            }

            if (tarefasSemana.length > 0) {
                cronograma.semanas.push({
                    numero: semanaAtual,
                    tarefas: tarefasSemana
                });
                semanaAtual++;
            }
        }

        return cronograma;
    }

    /**
     * Processa prioridade
     */
    processarPrioridade(prioridade) {
        if (prioridade.includes('🔴') || prioridade.includes('Alta')) return 'alta';
        if (prioridade.includes('🟡') || prioridade.includes('Média')) return 'media';
        if (prioridade.includes('🟢') || prioridade.includes('Baixa')) return 'baixa';
        return 'media';
    }

    /**
     * Calcula pontos de story
     */
    calcularPontos(duracao, prioridade) {
        const horas = parseInt(duracao.match(/(\d+)h/)?.[1] || '4');
        let pontos = Math.ceil(horas / this.config.pontuacao.horas_por_ponto);
        
        // Ajustar por prioridade
        const ajuste = this.config.pontuacao.ajuste_prioridade[this.processarPrioridade(prioridade)];
        pontos = Math.max(1, pontos + ajuste);
        
        // Usar Fibonacci
        const fibonacci = this.config.pontuacao.fibonacci;
        return fibonacci.find(f => f >= pontos) || fibonacci[fibonacci.length - 1];
    }

    /**
     * Organiza tarefas em sprints
     */
    organizarSprints() {
        console.log('🏃‍♂️ Organizando sprints...');
        
        const todasTarefas = [];
        this.cronograma.semanas.forEach(semana => {
            todasTarefas.push(...semana.tarefas);
        });

        this.sprints = [];
        let sprintAtual = 1;
        let indiceTarefa = 0;

        while (indiceTarefa < todasTarefas.length) {
            const tarefasSprint = [];
            let pontosAcumulados = 0;
            const capacidade = this.config.sprints.capacidade_pontos;

            // Adicionar tarefas ao sprint
            while (indiceTarefa < todasTarefas.length && pontosAcumulados < capacidade) {
                const tarefa = todasTarefas[indiceTarefa];
                
                if (pontosAcumulados + tarefa.pontos <= capacidade) {
                    tarefa.sprint = sprintAtual;
                    tarefasSprint.push(tarefa);
                    pontosAcumulados += tarefa.pontos;
                }
                indiceTarefa++;
            }

            const sprint = {
                numero: sprintAtual,
                nome: `${this.config.sprints.prefixo} ${sprintAtual}`,
                tarefas: tarefasSprint,
                pontos: pontosAcumulados,
                data_inicio: this.calcularDataSprint(sprintAtual, 'inicio'),
                data_fim: this.calcularDataSprint(sprintAtual, 'fim'),
                objetivo: this.gerarObjetivo(tarefasSprint)
            };

            this.sprints.push(sprint);
            sprintAtual++;
        }

        console.log(`✅ ${this.sprints.length} sprints organizados`);
        return this.sprints;
    }

    /**
     * Calcula datas do sprint
     */
    calcularDataSprint(numeroSprint, tipo) {
        const inicioBase = new Date(this.config.sprints.inicio_projeto);
        const diasOffset = (numeroSprint - 1) * this.config.sprints.duracao_dias;
        
        const data = new Date(inicioBase);
        data.setDate(data.getDate() + diasOffset);
        
        if (tipo === 'fim') {
            data.setDate(data.getDate() + this.config.sprints.duracao_dias - 1);
        }
        
        return data.toISOString().split('T')[0];
    }

    /**
     * Gera objetivo do sprint
     */
    gerarObjetivo(tarefas) {
        const atividades = tarefas.map(t => t.atividade.toLowerCase());
        const palavrasChave = this.extrairPalavrasChave(atividades);
        
        return this.config.templates.objetivo_sprint
            .replace('{principais_funcionalidades}', palavrasChave.slice(0, 3).join(', '));
    }

    /**
     * Extrai palavras-chave
     */
    extrairPalavrasChave(textos) {
        const palavras = textos.join(' ').split(/\s+/);
        const frequencia = {};
        
        palavras.forEach(palavra => {
            if (palavra.length > 4) {
                frequencia[palavra] = (frequencia[palavra] || 0) + 1;
            }
        });

        return Object.entries(frequencia)
            .sort(([,a], [,b]) => b - a)
            .map(([palavra]) => palavra)
            .slice(0, 5);
    }

    /**
     * Cria quadros Kanban
     */
    criarQuadrosKanban() {
        console.log('📋 Criando quadros Kanban...');
        
        this.quadrosKanban = this.sprints.map(sprint => {
            const quadro = {
                id: `KB_${sprint.numero.toString().padStart(2, '0')}`,
                nome: `${sprint.nome} - Kanban`,
                sprint_id: sprint.numero,
                colunas: this.config.kanban.colunas.map(col => ({
                    ...col,
                    id: `COL_${col.nome.replace(/\s+/g, '_').toUpperCase()}`,
                    cards: [] // Inicializar array vazio
                }))
            };

            // Adicionar cards à coluna Backlog
            const colunaBacklog = quadro.colunas.find(c => c.nome === 'Backlog' || c.nome === '📋 Backlog');
            if (colunaBacklog && sprint.tarefas) {
                sprint.tarefas.forEach(tarefa => {
                    const card = {
                        id: `CARD_${tarefa.id}`,
                        titulo: tarefa.atividade,
                        descricao: this.config.templates.descricao_card
                            .replace('{entregavel}', tarefa.entregavel)
                            .replace('{sprint}', sprint.nome)
                            .replace('{pontos}', tarefa.pontos),
                        pontos: tarefa.pontos,
                        prioridade: tarefa.prioridade,
                        checklist: [...this.config.templates.checklist_padrao]
                    };
                    
                    colunaBacklog.cards.push(card);
                });
            }

            return quadro;
        });

        console.log(`✅ ${this.quadrosKanban.length} quadros Kanban criados`);
        return this.quadrosKanban;
    }

    /**
     * Sincroniza com GitProject
     */
    async sincronizarGitProject() {
        console.log('🚀 Sincronizando com GitProject...');
        
        try {
            // 1. Criar projeto
            const projeto = await this.criarProjeto();
            console.log(`✅ Projeto criado: ${projeto.id}`);

            // 2. Criar sprints
            for (const sprint of this.sprints) {
                await this.criarSprint(sprint, projeto.id);
                console.log(`🏃‍♂️ ${sprint.nome} criado`);
            }

            // 3. Criar quadros Kanban
            for (const quadro of this.quadrosKanban) {
                await this.criarQuadroKanban(quadro, projeto.id);
                console.log(`📋 ${quadro.nome} criado`);
            }

            const relatorio = this.gerarRelatorio(projeto.id);
            await this.salvarRelatorio(relatorio);

            console.log('🎉 Sincronização concluída!');
            return relatorio;

        } catch (erro) {
            console.error('❌ Erro na sincronização:', erro.message);
            throw erro;
        }
    }

    /**
     * Cria projeto no GitProject
     */
    async criarProjeto() {
        const payload = {
            name: this.config.projeto.nome,
            description: this.config.projeto.descricao,
            workspace_id: process.env.GITPROJECT_WORKSPACE_ID,
            settings: {
                methodology: this.config.gitproject.metodologia,
                sprint_duration: this.config.sprints.duracao_dias
            }
        };

        const resposta = await axios.post(
            `${this.config.gitproject.url_base}/projects`,
            payload,
            { headers: this.headers }
        );

        return resposta.data;
    }

    /**
     * Cria sprint no GitProject
     */
    async criarSprint(sprint, projetoId) {
        const payload = {
            project_id: projetoId,
            name: sprint.nome,
            goal: sprint.objetivo,
            start_date: sprint.data_inicio,
            end_date: sprint.data_fim,
            planned_points: sprint.pontos
        };

        return await axios.post(
            `${this.config.gitproject.url_base}/sprints`,
            payload,
            { headers: this.headers }
        );
    }

    /**
     * Cria quadro Kanban no GitProject
     */
    async criarQuadroKanban(quadro, projetoId) {
        const payload = {
            project_id: projetoId,
            name: quadro.nome,
            columns: quadro.colunas.map(col => ({
                name: col.nome,
                color: col.cor,
                wip_limit: col.limite_wip
            })),
            cards: quadro.colunas.flatMap(col => 
                col.cards.map(card => ({
                    title: card.titulo,
                    description: card.descricao,
                    story_points: card.pontos,
                    priority: card.prioridade,
                    column_name: col.nome
                }))
            )
        };

        return await axios.post(
            `${this.config.gitproject.url_base}/kanban-boards`,
            payload,
            { headers: this.headers }
        );
    }

    /**
     * Gera relatório final
     */
    gerarRelatorio(projetoId) {
        const totalCards = this.quadrosKanban.reduce((total, quadro) => 
            total + quadro.colunas.reduce((subtotal, coluna) => 
                subtotal + coluna.cards.length, 0), 0);

        return {
            data: new Date().toISOString(),
            projeto: {
                id: projetoId,
                nome: this.config.projeto.nome
            },
            estatisticas: {
                sprints: this.sprints.length,
                quadros_kanban: this.quadrosKanban.length,
                total_cards: totalCards,
                pontos_totais: this.sprints.reduce((total, s) => total + s.pontos, 0)
            },
            sprints: this.sprints.map(s => ({
                nome: s.nome,
                pontos: s.pontos,
                tarefas: s.tarefas.length,
                periodo: `${s.data_inicio} a ${s.data_fim}`
            }))
        };
    }

    /**
     * Salva relatório
     */
    async salvarRelatorio(relatorio) {
        const nomeArquivo = `relatorio-${Date.now()}.json`;
        const caminho = path.join(__dirname, '..', 'relatorios', nomeArquivo);
        
        const dir = path.dirname(caminho);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(caminho, JSON.stringify(relatorio, null, 2));
        console.log(`📊 Relatório salvo: ${caminho}`);
    }

    /**
     * Executa processo completo
     */
    async executarCompleto() {
        console.log('🚀 Iniciando GitProject Universal...\n');
        
        await this.lerCronograma();
        this.organizarSprints();
        this.criarQuadrosKanban();
        const relatorio = await this.sincronizarGitProject();
        
        console.log('\n✅ Processo concluído!');
        return relatorio;
    }
}

// Exportar para uso
module.exports = GitProjectUniversal;

// Executar se chamado diretamente
if (require.main === module) {
    const gerenciador = new GitProjectUniversal();
    gerenciador.executarCompleto().catch(console.error);
}
