// --- MÓDULO DE APROVAÇÃO E SELEÇÃO DE FOTOS ---

function RenderAprovacao() {
    const container = document.getElementById('app-container');
    const fotos = AppState.fotos;
    const config = AppState.config.assets || {};
    
    // Configurações da Marca D'água
    const texto = config.watermarkText || "NBV - PROIBIDO TIRAR PRINT";
    const opacidade = config.opacity || 0.2;

    // Gerador de SVG Inline (Padrão Repetido)
    const svgPattern = `
        <svg width='400' height='200' xmlns='http://www.w3.org/2000/svg'>
            <text x='50%' y='50%' transform='rotate(-20 200 100)' dominant-baseline='middle' text-anchor='middle' 
                font-family='Arial' font-weight='bold' font-size='24' fill='%23808080' fill-opacity='${opacidade}'>
                ${texto}
            </text>
        </svg>
    `;
    const bgImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgPattern)}`;

    let html = `
        <div class="container fade-in">
            <div class="card sticky-header">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <div>
                        <h2>📸 Seleção de Fotos</h2>
                        <p>Toque nas fotos para selecionar/desmarcar.</p>
                    </div>
                    <div style="text-align:right">
                        <span style="font-size:0.9rem">Selecionadas:</span><br>
                        <strong style="font-size:1.5rem; color:var(--primary)" id="contador-topo">0</strong>
                    </div>
                </div>
            </div>

            <div class="gallery-grid">
    `;

    fotos.forEach((foto, index) => {
        const isSelected = foto.status === 'aprovada';
        
        html += `
            <div class="photo-item ${isSelected ? 'selected' : ''}" onclick="toggleFoto(${index})">
                <div class="img-wrapper">
                    <img src="${foto.url}" loading="lazy" oncontextmenu="return false;">
                    
                    <div class="watermark-overlay" style="background-image: url('${bgImage}');"></div>
                    
                    <div class="selection-indicator">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>

            <div class="floating-action-bar">
                <div style="display:flex; justify-content:space-between; align-items:center; max-width:800px; margin:0 auto">
                    <div>
                        <span id="contador-flutuante">0</span> fotos selecionadas
                    </div>
                    <button class="btn btn-primary" style="width:auto; padding:10px 25px" onclick="finalizarSelecao()">
                        Concluir <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // CSS Injetado
    const style = document.createElement('style');
    style.innerHTML = `
        .sticky-header { position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; padding-bottom: 80px; }
        
        .photo-item { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; background: #eee; }
        .photo-item:active { transform: scale(0.95); }
        
        .img-wrapper { position: relative; width: 100%; height: 100%; }
        .img-wrapper img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; user-select: none; }
        
        /* Proteção Visual */
        .watermark-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-repeat: repeat;
            background-position: center;
            pointer-events: none;
            z-index: 5;
        }

        .selection-indicator {
            position: absolute; top: 10px; right: 10px;
            font-size: 24px; color: rgba(255,255,255,0.7);
            z-index: 10; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .photo-item.selected { border: 4px solid var(--primary); }
        .photo-item.selected .selection-indicator { color: var(--success); opacity: 1; transform: scale(1.1); }
        .photo-item.selected img { filter: brightness(0.9); }

        .floating-action-bar {
            position: fixed; bottom: 0; left: 0; width: 100%;
            background: white; padding: 15px;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            z-index: 200;
        }
    `;
    document.head.appendChild(style);

    container.innerHTML = html;
    atualizarContadores();
}

function toggleFoto(index) {
    const estadoAtual = AppState.fotos[index].status;
    AppState.fotos[index].status = (estadoAtual === 'aprovada') ? 'rejeitada' : 'aprovada';
    
    // Atualização Visual Otimizada
    const itens = document.querySelectorAll('.photo-item');
    if (AppState.fotos[index].status === 'aprovada') {
        itens[index].classList.add('selected');
    } else {
        itens[index].classList.remove('selected');
    }
    atualizarContadores();
}

function atualizarContadores() {
    const count = AppState.fotos.filter(f => f.status === 'aprovada').length;
    document.getElementById('contador-topo').innerText = count;
    document.getElementById('contador-flutuante').innerText = count;
}

function finalizarSelecao() {
    const count = AppState.fotos.filter(f => f.status === 'aprovada').length;
    if (count === 0) return alert("Selecione pelo menos uma foto!");
    
    if (AppState.config.fluxo.pedirEdicao) {
        // Modal nativo simplificado
        if (confirm("Deseja solicitar EDIÇÃO ARTÍSTICA nas fotos?\n(O prazo será maior)\n\nOK = Sim\nCancelar = Não (Apenas produção)")) {
            AppState.dadosEntrega = AppState.dadosEntrega || {};
            AppState.dadosEntrega.querEdicao = true;
        } else {
            AppState.dadosEntrega = AppState.dadosEntrega || {};
            AppState.dadosEntrega.querEdicao = false;
        }
    }
    carregarModulo('producao');
}
