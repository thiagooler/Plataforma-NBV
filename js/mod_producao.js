// --- MÓDULO DE PRODUÇÃO E ORÇAMENTO INTELIGENTE ---

function RenderProducao() {
    const container = document.getElementById('app-container');
    const aprovadas = AppState.fotos.filter(f => f.status === 'aprovada').length;
    
    // Configurações Globais
    const db = AppState.config;
    const markup = db.financeiro.markup;
    const custoFixo = db.financeiro.custoFixoDiagramacao;
    const minFotos = db.fluxo.minimoFotosLivro || 20;

    let html = `
        <div class="container fade-in">
            <div class="card">
                <h2>💎 Personalize seu Pacote</h2>
                <p>Você selecionou <strong>${aprovadas} fotos</strong> incríveis.</p>
    `;

    // --- LÓGICA DO FOTOLIVRO ---
    
    // 1. Verifica se atingiu o mínimo para álbum
    if (aprovadas >= minFotos) {
        
        let bookOptionsHTML = '';
        
        // Verifica se tem contrato prévio
        const temContrato = db.cliente.incluirAlbum;
        const contrato = db.cliente.contrato || {}; 
        // contrato = { tamanho: '20x30', qtdFotos: 30, valorCredito: 800 }

        // Filtra opções viáveis na tabela (Preço Custo)
        // Precisamos encontrar opções que comportem a quantidade de fotos aprovadas
        const tabela = db.tabelaFotolivros;
        const regras = db.regrasDiagramacao; // { '20x30': 4 } (fotos por página)

        // Vamos agrupar por tamanho (15x20, 20x30, 30x40)
        const tamanhos = [...new Set(tabela.map(t => t.size))];

        tamanhos.forEach(tamanho => {
            const fotosPorPagina = regras[tamanho] || 4;
            const paginasNecessarias = Math.ceil(aprovadas / fotosPorPagina);

            // Busca na tabela a opção que tenha paginas >= paginasNecessarias
            const opcoesTamanho = tabela.filter(t => t.size === tamanho).sort((a,b) => a.pages - b.pages);
            const opcaoViavel = opcoesTamanho.find(t => t.pages >= paginasNecessarias);

            if (opcaoViavel) {
                // CALCULA PREÇO DE VENDA (Custo Base + Custo Diagramação) * Markup
                const custoTotal = opcaoViavel.priceBox + custoFixo; // Considerando COM CAIXA como padrão luxo
                const precoVendaFull = custoTotal * markup;
                
                let precoFinal = precoVendaFull;
                let textoDestaque = "";
                let textoExplica = `Álbum ${tamanho} com ${opcaoViavel.pages} páginas (para suas ${aprovadas} fotos).`;
                let checked = false;

                // LÓGICA DE CONTRATO E DIFERENÇA
                if (temContrato) {
                    // Valor a pagar = Preço Novo - Crédito do Contrato
                    let diferenca = precoVendaFull - contrato.valorCredito;
                    
                    // Se a diferença for negativa (o contrato era mais caro), é R$ 0,00 (não devolvemos dinheiro, fica incluso)
                    if (diferenca < 0) diferenca = 0;

                    precoFinal = diferenca;

                    if (tamanho === contrato.tamanho) {
                        // É o tamanho contratado
                        textoDestaque = "SEU PLANO ATUAL";
                        checked = true; // Pré-seleciona o contratado
                        
                        if (diferenca > 0) {
                            textoExplica += `<br><span style="color:#e67e22">Inclui valor das fotos extras selecionadas.</span>`;
                        } else {
                            textoExplica += `<br><span style="color:green">Totalmente coberto pelo seu contrato.</span>`;
                        }
                    } else {
                        // É um tamanho diferente (Upgrade ou Downgrade)
                        // Só mostra tamanhos maiores ou iguais, ou todos? Vamos mostrar todos como opção.
                        if (precoVendaFull > contrato.valorCredito) {
                             textoDestaque = "OPÇÃO DE UPGRADE";
                             textoExplica += `<br>Faça um upgrade pagando apenas a diferença.`;
                        }
                    }
                } else {
                    // Sem contrato, venda cheia
                    if (tamanho === '30x40') checked = true; // Sugere o maior se não tiver contrato
                }

                // Renderiza o Card
                bookOptionsHTML += `
                    <label class="product-card option-box ${checked ? 'selected-plan' : ''}" style="cursor:pointer; display:block">
                        <div style="display:flex; justify-content:space-between; align-items:center">
                            <div>
                                <input type="radio" name="fotolivro_choice" value="${tamanho}" 
                                    data-price="${precoFinal}" 
                                    data-name="Fotolivro ${tamanho} (${opcaoViavel.pages} págs)"
                                    ${checked ? 'checked' : ''}
                                    onchange="atualizarTotalProducao()">
                                <strong style="font-size:1.1rem">Fotolivro ${tamanho}</strong>
                                ${textoDestaque ? `<span class="badge">${textoDestaque}</span>` : ''}
                            </div>
                            <div style="text-align:right">
                                <div style="font-size:1.2rem; font-weight:bold; color:var(--primary)">
                                    ${precoFinal === 0 ? 'INCLUSO' : '+ ' + formatMoney(precoFinal)}
                                </div>
                                ${temContrato && precoFinal > 0 ? `<small style="color:#999; text-decoration:line-through">${formatMoney(precoVendaFull)}</small>` : ''}
                            </div>
                        </div>
                        <p style="margin:5px 0 0 25px; font-size:0.9rem; color:#666">${textoExplica}</p>
                    </label>
                `;
            }
        });

        html += `
            <div style="margin-top:20px">
                <h3>📚 Opções de Fotolivro</h3>
                <p style="font-size:0.9rem; color:#666; margin-bottom:15px">Calculado baseada na quantidade de fotos selecionadas (${aprovadas}).</p>
                <div class="book-options-list">
                    ${bookOptionsHTML}
                </div>
            </div>
        `;

    } else {
        html += `
            <div class="alert-box">
                <i class="fas fa-info-circle"></i>
                Você selecionou ${aprovadas} fotos. O mínimo para produção de Fotolivro são ${minFotos} fotos.
                <br>Por favor, selecione mais fotos na etapa anterior ou escolha produtos avulsos abaixo.
            </div>
        `;
    }

    // --- PRODUTOS AVULSOS / EXTRAS ---
    html += `
            <div style="margin-top:30px; border-top:1px dashed #ccc; padding-top:20px">
                <h3>🖼️ Produtos Adicionais</h3>
                <div class="showroom-grid">
    `;

    if (db.produtosAvulsos) {
        db.produtosAvulsos.forEach((prod, idx) => {
            // Verifica se o cliente tem crédito deste item
            let creditoQtd = 0;
            if (db.cliente.creditos) {
                const cred = db.cliente.creditos.find(c => c.item === prod.nome);
                if (cred) creditoQtd = cred.qtd;
            }

            html += `
                <div class="product-card">
                    <div class="prod-img-area" style="height:120px">
                        <i class="${prod.icone}" style="font-size:40px; color:#ccc"></i>
                    </div>
                    <div class="prod-info" style="padding:15px">
                        <h4 style="margin:0">${prod.nome}</h4>
                        <p style="font-weight:bold; color:var(--primary); margin:5px 0">
                            ${formatMoney(prod.preco)}
                        </p>
                        
                        ${creditoQtd > 0 ? `<p style="color:var(--success); font-size:0.8rem">Você tem <b>${creditoQtd}</b> un. inclusas!</p>` : ''}

                        <div class="stepper" style="display:flex; align-items:center; gap:10px; margin-top:10px">
                            <button type="button" class="btn-sec" style="width:30px; padding:5px" onclick="mudarQtd('extra_${idx}', -1)">-</button>
                            <input type="number" id="extra_${idx}" 
                                data-name="${prod.nome}" 
                                data-price="${prod.preco}" 
                                data-credit="${creditoQtd}"
                                value="0" readonly style="width:40px; text-align:center; margin:0">
                            <button type="button" class="btn-sec" style="width:30px; padding:5px" onclick="mudarQtd('extra_${idx}', 1)">+</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `
                </div>
            </div>

            <div class="card" style="margin-top:20px; text-align:right; border-top: 4px solid var(--primary); background:#f8f9fa">
                <h3>Total a Pagar: <span id="total-prod-display" style="color:var(--primary)">R$ 0,00</span></h3>
                <button class="btn btn-primary" style="width:auto; padding:15px 30px" onclick="finalizarProducao()">
                    Avançar <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Adicione um pouco de CSS extra dinamicamente para os Badges
    const style = document.createElement('style');
    style.innerHTML = `
        .badge { background:#0066cc; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:8px; text-transform:uppercase; vertical-align:middle; }
        .selected-plan { border: 2px solid var(--primary); background: #f0f7ff; }
        .alert-box { background: #fff3cd; color: #856404; padding: 15px; border-radius: 6px; border: 1px solid #ffeeba; }
        .book-options-list { display: flex; flex-direction: column; gap: 10px; }
    `;
    document.head.appendChild(style);

    atualizarTotalProducao();
}

function mudarQtd(id, delta) {
    const input = document.getElementById(id);
    let val = parseInt(input.value) + delta;
    if (val < 0) val = 0;
    input.value = val;
    atualizarTotalProducao();
}

function atualizarTotalProducao() {
    let total = 0;
    
    // 1. Soma Álbum Selecionado
    const albumChoice = document.querySelector('input[name="fotolivro_choice"]:checked');
    if (albumChoice) {
        total += parseFloat(albumChoice.dataset.price);
        
        // Visual: destaca o selecionado
        document.querySelectorAll('input[name="fotolivro_choice"]').forEach(r => {
            r.closest('.option-box').classList.remove('selected-plan');
        });
        albumChoice.closest('.option-box').classList.add('selected-plan');
    }

    // 2. Soma Extras (Considerando Créditos)
    const extras = document.querySelectorAll('input[id^="extra_"]');
    extras.forEach(inp => {
        const qtd = parseInt(inp.value);
        const creditos = parseInt(inp.dataset.credit);
        const preco = parseFloat(inp.dataset.price);
        
        // Cobra apenas o que exceder os créditos
        const pagavel = Math.max(0, qtd - creditos);
        total += pagavel * preco;
    });
    
    document.getElementById('total-prod-display').innerText = formatMoney(total);
    AppState.totalFinanceiro = total;
}

function finalizarProducao() {
    AppState.carrinho = [];
    
    // Adiciona Álbum
    const albumChoice = document.querySelector('input[name="fotolivro_choice"]:checked');
    if (albumChoice) {
        AppState.carrinho.push({ 
            item: albumChoice.dataset.name, 
            valor: parseFloat(albumChoice.dataset.price) 
        });
    }

    // Adiciona Extras
    const extras = document.querySelectorAll('input[id^="extra_"]');
    extras.forEach(inp => {
        const qtd = parseInt(inp.value);
        if (qtd > 0) {
            const creditos = parseInt(inp.dataset.credit);
            const pagavel = Math.max(0, qtd - creditos);
            const valorTotalItem = pagavel * parseFloat(inp.dataset.price);
            
            let nomeItem = inp.dataset.name;
            if (creditos > 0 && qtd <= creditos) nomeItem += " (Incluso nos Créditos)";
            else if (creditos > 0) nomeItem += ` (${creditos} inclusas + ${pagavel} extras)`;
            
            AppState.carrinho.push({ item: `${qtd}x ${nomeItem}`, valor: valorTotalItem });
        }
    });
    
    carregarModulo('entrega');
}
