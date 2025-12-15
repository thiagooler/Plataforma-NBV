// --- SISTEMA NBV CORE ---

// Estado Global da Aplicação
const AppState = {
    config: {},      // Carregado do config_cliente.js
    fotos: [],       // Lista de fotos com status
    carrinho: [],    // Itens de produção selecionados
    totalFinanceiro: 0,
    etapaAtual: 1
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se a configuração existe
    if (typeof window.NBV_CONFIG === 'undefined') {
        document.body.innerHTML = '<h1 style="color:white;text-align:center;margin-top:50px">⚠️ Arquivo de configuração não encontrado.</h1>';
        return;
    }

    // 2. Inicializa o App
    AppState.config = window.NBV_CONFIG;
    initApp();
});

function initApp() {
    // Carrega fotos na memória
    AppState.fotos = AppState.config.fotos.map((url, index) => ({
        id: index,
        url: url,
        status: 'pendente', // pendente, aprovada, rejeitada
        obs: ''
    }));

    // Atualiza nome do cliente no título (opcional)
    document.title = `Seleção - ${AppState.config.cliente}`;

    // Carrega Módulo 1: Aprovação
    carregarModulo('aprovacao');
    
    // Remove loading
    document.querySelector('.loading-screen').classList.add('hidden');
}

// Sistema de Navegação entre Módulos
function carregarModulo(nome) {
    // Esconde tudo
    document.getElementById('app-container').innerHTML = '';
    
    // Atualiza Header
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    
    if (nome === 'aprovacao') {
        document.getElementById('step-1').classList.add('active');
        RenderAprovacao(); // Função do mod_aprovacao.js
    } 
    else if (nome === 'producao') {
        document.getElementById('step-2').classList.add('active');
        RenderProducao(); // Função do mod_producao.js
    }
    else if (nome === 'entrega') {
        document.getElementById('step-3').classList.add('active');
        RenderEntrega(); // Função do mod_entrega.js
    }
}

// Formatador de Moeda
function formatMoney(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
