function RenderProducao() {
    const container = document.getElementById('app-container');
    const qtdAprovadas = AppState.fotos.filter(f => f.status === 'aprovada').length;
    
    // Calcula custo do fotolivro base (Lógica simplificada do seu código anterior)
    const incluso = AppState.config.pacote.incluso;
    const extraPrice = AppState.config.pacote.extra;
    let custoFotosExtras = 0;
    let textoPacote = "Pacote Padrão";

    if (qtdAprovadas > incluso && incluso > 0) {
        custoFotosExtras = (qtdAprovadas - incluso) * extraPrice;
        textoPacote = `Pacote (${incluso} fotos) + ${qtdAprovadas - incluso} extras`;
    }

    let html = `
        <div class="container fade-in">
            <div class="card">
                <h2>💎 Escolha a Produção</h2>
                <p>Você aprovou <strong>${qtdAprovadas} fotos</strong>.</p>
            </div>

            <div class="showroom-grid">
                <div class="product-card">
                    <div class="prod-img-area">
                        <i class="fas fa-book-open" style="font-size:50px; color:#555"></i>
                    </div>
                    <div class="prod-info">
                        <h3>Fotolivro Premium</h3>
                        <p>Suas fotos diagramadas em álbum de luxo.</p>
                        <hr style="border-color:#333">
                        <p style="font-size:0.9rem">${textoPacote}</p>
                        <p style="color:var(--primary); font-weight:bold; font-size:1.2rem">
                            ${custoFotosExtras > 0 ? '+ ' + formatMoney(custoFotosExtras) : 'Incluso'}
                        </p>
                        <label>
                            <input type="checkbox" id="check-fotolivro" checked onchange="atualizarTotalProducao()"> 
                            Quero produzir o Fotolivro
                        </label>
                    </div>
                </div>

                <div class="product-card">
                    <div class="prod-img-area">
                        <i class="fas fa-images" style="font-size:50px; color:#555"></i>
                    </div>
                    <div class="prod-info">
                        <h3>Caixa de Revelações</h3>
                        <p>Apenas as fotos reveladas (10x15 ou 15x21).</p>
                        <p style="color:#aaa; font-size:0.8rem">Selecione esta opção se não quiser o álbum.</p>
                        <label>
                            <input type="checkbox" id="check-revelacao" onchange="atualizarTotalProducao()"> 
                            Quero apenas revelações soltas
                        </label>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:20px; text-align:right">
                <h3>Total Estimado: <span id="total-prod-display">R$ 0,00</span></h3>
                <button class="btn btn-primary" style="width:auto" onclick="finalizarProducao()">
                    Ir para Entrega e Pagamento <i class="fas fa-truck"></i>
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    // Salva o valor extra no estado para usar depois
    AppState.custoFotosExtras = custoFotosExtras;
    atualizarTotalProducao();
}

function atualizarTotalProducao() {
    let total = 0;
    const querAlbum = document.getElementById('check-fotolivro').checked;
    
    if (querAlbum) {
        total += AppState.custoFotosExtras;
    }
    
    document.getElementById('total-prod-display').innerText = formatMoney(total);
    AppState.totalFinanceiro = total;
}

function finalizarProducao() {
    // Salva opções
    AppState.carrinho = [];
    if (document.getElementById('check-fotolivro').checked) {
        AppState.carrinho.push({ item: 'Fotolivro Premium', valor: AppState.totalFinanceiro });
    }
    // (Pode adicionar mais lógica aqui se tiver mais produtos)
    
    carregarModulo('entrega');
}
