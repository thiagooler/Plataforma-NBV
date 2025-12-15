function RenderProducao() {
    const container = document.getElementById('app-container');
    const qtdAprovadas = AppState.fotos.filter(f => f.status === 'aprovada').length;
    
    // --- Lógica do Álbum (Pacote) ---
    const configPacote = AppState.config.pacote;
    const incluso = configPacote.fotosInclusas;
    const extraPrice = configPacote.valorFotoExtra;
    
    let custoFotosExtras = 0;
    let textoPacote = `Pacote base com ${incluso} fotos.`;

    if (qtdAprovadas > incluso && incluso > 0) {
        custoFotosExtras = (qtdAprovadas - incluso) * extraPrice;
        textoPacote = `Pacote (${incluso} fotos) + ${qtdAprovadas - incluso} extras selecionadas.`;
    }

    // --- Monta HTML do Álbum Principal ---
    let html = `
        <div class="container fade-in">
            <div class="card">
                <h2>💎 Escolha os Produtos</h2>
                <p>Você selecionou <strong>${qtdAprovadas} fotos</strong>.</p>
            </div>

            <div class="showroom-grid">
                <div class="product-card">
                    <div class="prod-img-area">
                        <i class="fas fa-book-open" style="font-size:50px; color:#ccc"></i>
                    </div>
                    <div class="prod-info">
                        <h3>${configPacote.tituloAlbum}</h3>
                        <p>${configPacote.descricaoAlbum}</p>
                        <hr style="border-color:#eee">
                        <p style="font-size:0.9rem; color:var(--text-muted)">${textoPacote}</p>
                        <p style="color:var(--primary); font-weight:bold; font-size:1.2rem">
                            ${custoFotosExtras > 0 ? '+ ' + formatMoney(custoFotosExtras) : 'Valor Incluso'}
                        </p>
                        <label class="option-box" style="margin-top:10px">
                            <input type="checkbox" id="check-fotolivro" checked onchange="atualizarTotalProducao()"> 
                            Incluir Fotolivro no Pedido
                        </label>
                    </div>
                </div>
    `;

    // --- Monta HTML dos Produtos Extras (Dinâmico) ---
    // Aqui é a mágica: ele varre o que você colocou no JS e cria os cards
    if (AppState.config.produtosExtras && AppState.config.produtosExtras.length > 0) {
        AppState.config.produtosExtras.forEach((prod, index) => {
            html += `
                <div class="product-card">
                    <div class="prod-img-area">
                        <i class="${prod.icone || 'fas fa-box'}" style="font-size:50px; color:#ccc"></i>
                    </div>
                    <div class="prod-info">
                        <h3>${prod.titulo}</h3>
                        <p>${prod.descricao}</p>
                        <p style="color:var(--text-main); font-weight:bold; font-size:1.1rem; margin-top:10px">
                            ${formatMoney(prod.precoFixo)}
                        </p>
                        <label class="option-box" style="margin-top:10px">
                            <input type="checkbox" class="check-extra" 
                                data-price="${prod.precoFixo}" 
                                data-name="${prod.titulo}"
                                onchange="atualizarTotalProducao()"> 
                            Adicionar ao pedido
                        </label>
                    </div>
                </div>
            `;
        });
    }

    html += `
            </div> <div class="card" style="margin-top:20px; text-align:right; border-top: 4px solid var(--primary)">
                <h3>Total dos Produtos: <span id="total-prod-display" style="color:var(--primary)">R$ 0,00</span></h3>
                <button class="btn btn-primary" style="width:auto" onclick="finalizarProducao()">
                    Ir para Entrega e Pagamento <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    AppState.custoFotosExtras = custoFotosExtras; // Salva para cálculo
    atualizarTotalProducao();
}

function atualizarTotalProducao() {
    let total = 0;
    
    // 1. Soma Álbum
    const querAlbum = document.getElementById('check-fotolivro').checked;
    if (querAlbum) {
        total += AppState.custoFotosExtras;
    }

    // 2. Soma Extras Dinâmicos
    const extras = document.querySelectorAll('.check-extra');
    extras.forEach(chk => {
        if (chk.checked) {
            total += parseFloat(chk.dataset.price);
        }
    });
    
    document.getElementById('total-prod-display').innerText = formatMoney(total);
    AppState.totalFinanceiro = total;
}

function finalizarProducao() {
    AppState.carrinho = [];
    
    // Adiciona Álbum
    if (document.getElementById('check-fotolivro').checked) {
        const nome = AppState.config.pacote.tituloAlbum;
        AppState.carrinho.push({ item: nome, valor: AppState.custoFotosExtras });
    }

    // Adiciona Extras
    const extras = document.querySelectorAll('.check-extra');
    extras.forEach(chk => {
        if (chk.checked) {
            AppState.carrinho.push({ item: chk.dataset.name, valor: parseFloat(chk.dataset.price) });
        }
    });
    
    carregarModulo('entrega');
}
