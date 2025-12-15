function RenderAprovacao() {
    const container = document.getElementById('app-container');
    
    let html = `
        <div class="container fade-in">
            <div class="card">
                <h2>👋 Olá, ${AppState.config.cliente}!</h2>
                <p>Por favor, selecione as fotos que você deseja aprovar. Clique na foto para ver detalhes.</p>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button class="btn btn-secondary" onclick="filtrarFotos('todas')">Todas</button>
                    <button class="btn btn-secondary" onclick="filtrarFotos('aprovadas')">Aprovadas ✅</button>
                </div>
            </div>
            
            <div class="gallery-grid" id="grid-fotos">
                </div>

            <div class="card" style="position:sticky; bottom:20px; z-index:100; display:flex; justify-content:space-between; align-items:center">
                <span id="contador-aprovadas">0 fotos aprovadas</span>
                <button class="btn btn-primary" style="width:auto" onclick="finalizarAprovacao()">
                    Próxima Etapa: Escolher Produtos <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    renderizarGridFotos();
}

function renderizarGridFotos() {
    const grid = document.getElementById('grid-fotos');
    grid.innerHTML = '';
    
    AppState.fotos.forEach(foto => {
        const div = document.createElement('div');
        div.className = `photo-item ${foto.status === 'aprovada' ? 'selected' : ''}`;
        div.onclick = () => toggleAprovacao(foto.id);
        
        div.innerHTML = `
            <img src="${foto.url}" loading="lazy">
            ${foto.status === 'aprovada' ? '<span class="status-badge" style="background:var(--primary)">Aprovada</span>' : ''}
        `;
        grid.appendChild(div);
    });
    
    atualizarContador();
}

function toggleAprovacao(id) {
    const foto = AppState.fotos.find(f => f.id === id);
    if (foto.status === 'aprovada') foto.status = 'pendente';
    else foto.status = 'aprovada';
    
    renderizarGridFotos(); // Re-renderiza para atualizar visual
}

function atualizarContador() {
    const total = AppState.fotos.filter(f => f.status === 'aprovada').length;
    document.getElementById('contador-aprovadas').innerText = `${total} fotos aprovadas`;
}

function finalizarAprovacao() {
    const aprovadas = AppState.fotos.filter(f => f.status === 'aprovada');
    if (aprovadas.length === 0) {
        if(!confirm("Nenhuma foto foi aprovada. Deseja continuar mesmo assim?")) return;
    }
    carregarModulo('producao');
}
