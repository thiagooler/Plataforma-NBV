// --- NBV SYSTEM CORE (V7.0) ---
// Gerencia o estado global e a navegação entre módulos.

// Estado Global da Aplicação
window.AppState = {
    config: {},          // Configuração mesclada (DB + Cliente)
    fotos: [],           // Lista de fotos com status (aprovada/rejeitada)
    carrinho: [],        // Itens finais para o pedido
    dadosEntrega: {},    // Detalhes da entrega
    totalFinanceiro: 0,  // Valor total a pagar
    custoFrete: 0,       // Valor do frete
    podePagarNaEntrega: true // Controle de regra de negócio
};

function StartApp() {
    console.log("🚀 Iniciando Studio NBV System...");

    // 1. Verifica se as configurações existem
    if (!window.NBV_DB || !window.NBV_CONFIG) {
        document.body.innerHTML = "<h2 style='text-align:center; padding:50px'>Erro Fatal: Configuração ou Banco de Dados não encontrado.</h2>";
        return;
    }

    // 2. Mescla DB Global com Config do Cliente
    // A config do cliente tem preferência em campos específicos
    AppState.config = { ...window.NBV_DB, ...window.NBV_CONFIG };
    
    // Garante que objetos aninhados foram mesclados corretamente
    AppState.config.financeiro = { ...window.NBV_DB.financeiro, ...window.NBV_CONFIG.financeiro };
    AppState.config.fluxo = { ...window.NBV_DB.fluxo, ...window.NBV_CONFIG.fluxo };

    // 3. Inicializa as Fotos
    if (window.NBV_CONFIG.fotos) {
        AppState.fotos = window.NBV_CONFIG.fotos.map(url => ({
            url: url,
            status: 'pendente' // pendente, aprovada, rejeitada
        }));
    }

    // 4. Define rota inicial baseado no fluxo
    if (AppState.config.fluxo.pedirAprovacao) {
        carregarModulo('aprovacao');
    } else {
        // Se não tiver aprovação, marca todas como aprovadas e vai pra produção
        AppState.fotos.forEach(f => f.status = 'aprovada');
        carregarModulo('producao');
    }
}

// Navegação entre Módulos
function carregarModulo(nome) {
    // Remove classe ativa de todos os passos
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    
    // Atualiza stepper visual
    const stepMap = {
        'aprovacao': 'step-aprovacao',
        'producao': 'step-producao',
        'entrega': 'step-entrega'
    };
    if (stepMap[nome]) {
        document.getElementById(stepMap[nome]).classList.add('active');
    }

    // Renderiza o módulo específico
    switch(nome) {
        case 'aprovacao':
            if (typeof RenderAprovacao === 'function') RenderAprovacao();
            break;
        case 'producao':
            if (typeof RenderProducao === 'function') RenderProducao();
            break;
        case 'entrega':
            if (typeof RenderEntrega === 'function') RenderEntrega();
            break;
        default:
            console.error("Módulo desconhecido:", nome);
    }

    // Scroll para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Formatador de Moeda Global
function formatMoney(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
