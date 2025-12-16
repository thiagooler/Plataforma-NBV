// --- MÓDULO DE PRODUÇÃO INTELIGENTE (V5.4 - Capacidade & Upgrade) ---

function RenderProducao() {
    const container = document.getElementById('app-container');
    const aprovadas = AppState.fotos.filter(f => f.status === 'aprovada').length;
    
    // Configurações
    const db = AppState.config;
    const markup = db.financeiro.markup;
    const custoFixo = db.financeiro.custoFixoDiagramacao;
    const minFotos = db.fluxo.minimoFotosLivro || 20;

    let html = `
        <div class="container fade-in">
            <div class="card">
                <h2>💎 Personalize seu Pacote</h2>
                <p>Você selecionou <strong>${aprovadas} fotos</strong>.</p>
    `;

    // --- LÓGICA DO FOTOLIVRO ---
    if (aprovadas >= minFotos) {
        
        const temContrato = db.cliente.incluirAlbum;
        let valorCreditoContrato = 0;
        let tamanhoContratado = '';
        
        // 1. DESCOBRE O VALOR DO CRÉDITO (O valor do álbum "base")
        if (temContrato && db.cliente.contrato) {
            const ctr = db.cliente.contrato;
            tamanhoContratado = ctr.tamanho;

            // Se digitou manual no admin, usa o manual. 
            // Se não, calcula quanto vale esse álbum contratado HOJE.
            if (ctr.valorCredito && ctr.valorCredito > 0) {
                valorCreditoContrato = ctr.valorCredito;
            } else {
                const regrasPagina = db.regrasDiagramacao[ctr.tamanho] || 4;
                const pagsCtr = Math.ceil(ctr.qtdFotos / regrasPagina);
                const opcoesCtr = db.tabelaFotolivros.filter(t => t.size === ctr.tamanho).sort((a,b) => a.pages - b.pages);
                // Pega a opção que cabe as fotos OU a maior disponivel
                const opcaoCtr = opcoesCtr.find(t => t.pages >= pagsCtr) || opcoesCtr[opcoesCtr.length-1];

                if (opcaoCtr) {
                    valorCreditoContrato = (opcaoCtr.priceBox + custoFixo) * markup;
                }
            }
        }

        let bookOptionsHTML = '';
        const tamanhos = [...new Set(db.tabelaFotolivros.map(t => t.size))];
        let preSelectionMade = false;

        tamanhos.forEach(tamanho => {
            // --- VERIFICAÇÃO DE CAPACIDADE FÍSICA ---
            const fotosPorPagina = db.regrasDiagramacao[tamanho] || 4;
            const opcoesTamanho = db.tabelaFotolivros.filter(t => t.size === tamanho).sort((a,b) => a.pages - b.pages);
            
            // Qual o máximo de fotos que esse tamanho aguenta?
            const maxPaginasTabela = opcoesTamanho[opcoesTamanho.length - 1].pages;
            const capacidadeMaximaFotos = maxPaginasTabela * fotosPorPagina;
            
            const paginasNecessarias = Math.ceil(aprovadas / fotosPorPagina);
            const opcaoViavel = opcoesTamanho.find(t => t.pages >= paginasNecessarias);

            // Variáveis de Estado da Opção
            let bloqueado = false;
            let motivoBloqueio = "";
            let precoFinal = 0;
            let precoCheio = 0;
            let textoDestaque = "";
            let textoExplica = "";
            let checked = false;

            // Se não tem opção viável (estourou limite de páginas), bloqueia
            if (!opcaoViavel) {
                bloqueado = true;
                motivoBloqueio = `Capacidade máx. excedida (${capacidadeMaximaFotos} fotos).`;
            } else {
                // Cálculo Financeiro
                const custoTotal = opcaoViavel.priceBox + custoFixo;
                precoCheio = custoTotal * markup;
                precoFinal = precoCheio;
                textoExplica = `Álbum ${tamanho} - ${opcaoViavel.pages} páginas.`;

                if (temContrato) {
                    // Aqui está a mágica: Valor Novo - Valor Contrato (R$ 700)
                    let diferenca = precoCheio - valorCreditoContrato;
                    if (diferenca < 0) diferenca = 0;
                    precoFinal = diferenca;

                    if (tamanho === tamanhoContratado) {
                        textoDestaque = "SEU PLANO";
                        // Se não estiver bloqueado, tenta selecionar
                        if (!preSelectionMade) { checked = true; preSelectionMade = true; }
                        
                        if (diferenca > 0) textoExplica += `<br><span style="color:#e67e22">Valor adicional pelas fotos extras.</span>`;
                        else textoExplica += `<br><span style="color:green">Incluso no pacote.</span>`;
                    } else {
                        if (precoCheio > valorCreditoContrato) {
                             textoDestaque = "UPGRADE";
                             textoExplica += `<br>Faça upgrade pagando a diferença.`;
                        }
                    }
                } else {
                    // Sem contrato, sugere o maior ou o primeiro viável
                    if (!preSelectionMade && tamanho === '30x40') { checked = true; preSelectionMade = true; }
                }
            }

            // Se for o contratado, mas estiver bloqueado (ex: escolheu 500 fotos num 20x30), 
            // precisamos forçar a seleção do próximo viável (ex: 30x40).
            if (bloqueado && tamanho === tamanhoContratado) {
                textoExplica = `<span style="color:red">A quantidade selecionada (${aprovadas}) excede o limite deste tamanho. Por favor, escolha um tamanho maior.</span>`;
            }

            // Renderiza HTML
            if (bloqueado) {
                bookOptionsHTML += `
                    <div class="product-card option-box disabled-plan">
                        <div style="display:flex; justify-content:space-between; align-items:center; opacity:0.6">
                            <div>
                                <input type="radio" disabled>
                                <strong style="font-size:1.1rem">Fotolivro ${tamanho}</strong>
                                <span class="badge badge-error">Indisponível</span>
                            </div>
                            <div style="text-align:right; font-size:0.9rem">${motivoBloqueio}</div>
                        </div>
                        <p style="margin:5px 0 0 25px; font-size:0.8rem; color:#999">${textoExplica}</p>
                    </div>
                `;
            } else {
                // Se nenhum foi selecionado ainda (ex: o contratado estourou), seleciona este se for viável
                if (!preSelectionMade) { checked = true; preSelectionMade = true; }

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
                                ${textoDestaque ? `<span class="badge ${textoDestaque==='UPGRADE'?'badge-up':''}">${textoDestaque}</span>` : ''}
                            </div>
                            <div style="text-align:right">
                                <div style="font-size:1.2rem; font-weight:bold; color:${precoFinal===0 ? 'green' : 'var(--primary)'}">
                                    ${precoFinal === 0 ? 'INCLUSO' : '+ ' + formatMoney(precoFinal)}
                                </div>
                                ${temContrato && precoFinal > 0 ? `<small style="color:#999; text-decoration:line-through; font-size:0.8rem">Total: ${formatMoney(precoCheio)}</small>` : ''}
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
                ${temContrato ? `<div class="info-contrato"><b>Seu Crédito:</b> ${formatMoney(valorCreditoContrato)} (abatido automaticamente)</div>` : ''}
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
            </div>
        `;
    }

    // --- PRODUTOS AVULSOS ---
    html += `<div style="margin-top:30px; border-top:1px dashed #ccc; padding-top:20px"><h3>🖼️ Produtos Adicionais</h3><div class="showroom-grid">`;

    if (db.produtosAvulsos) {
        db.produtosAvulsos.forEach((prod, idx) => {
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
                        <p style="font-weight:bold; color:var(--primary); margin:5px 0">${formatMoney(prod.preco)}</p>
                        ${creditoQtd > 0 ? `<p style="color:var(--success); font-size:0.8rem"><b>${creditoQtd}</b> inclusas!</p>` : ''}
                        <div class="stepper" style="display:flex; align-items:center; gap:10px; margin-top:10px">
                            <button type="button" class="btn-sec" style="width:30px; padding:5px" onclick="mudarQtd('extra_${idx}', -1)">-</button>
                            <input type="number" id="extra_${idx}" data-name="${prod.nome}" data-price="${prod.preco}" data-credit="${creditoQtd}" value="0" readonly style="width:40px; text-align:center; margin:0">
                            <button type="button" class="btn-sec" style="width:30px; padding:5px" onclick="mudarQtd('extra_${idx}', 1)">+</button>
                        </div>
                    </div>
                </div>`;
        });
    }

    html += `</div></div><div class="card" style="margin-top:20px; text-align:right; border-top: 4px solid var(--primary); background:#f8f9fa"><h3>Total a Pagar: <span id="total-prod-display" style="color:var(--primary)">R$ 0,00</span></h3><button class="btn btn-primary" style="width:auto; padding:15px 30px" onclick="finalizarProducao()">Avançar <i class="fas fa-arrow-right"></i></button></div></div>`;
    
    container.innerHTML = html;
    
    const style = document.createElement('style');
    style.innerHTML = `
        .badge { background:#0066cc; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:8px; text-transform:uppercase; vertical-align:middle; }
        .badge-up { background: #e67e22; }
        .badge-error { background: #dc2626; }
        .selected-plan { border: 2px solid var(--primary); background: #f0f7ff; }
        .disabled-plan { background: #f3f4f6; border: 1px solid #ddd; cursor: not-allowed; }
        .alert-box { background: #fff3cd; color: #856404; padding: 15px; border-radius: 6px; border: 1px solid #ffeeba; }
        .info-contrato { background:#e0f2fe; padding:10px; border-radius:6px; font-size:0.9rem; color:#004c99; margin-bottom:10px; border:1px solid #bae6fd; }
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
    
    const albumChoice = document.querySelector('input[name="fotolivro_choice"]:checked');
    if (albumChoice) {
        total += parseFloat(albumChoice.dataset.price);
        document.querySelectorAll('input[name="fotolivro_choice"]').forEach(r => r.closest('.option-box').classList.remove('selected-plan'));
        albumChoice.closest('.option-box').classList.add('selected-plan');
    }

    const extras = document.querySelectorAll('input[id^="extra_"]');
    extras.forEach(inp => {
        const qtd = parseInt(inp.value);
        const creditos = parseInt(inp.dataset.credit);
        const preco = parseFloat(inp.dataset.price);
        const pagavel = Math.max(0, qtd - creditos);
        total += pagavel * preco;
    });
    
    document.getElementById('total-prod-display').innerText = formatMoney(total);
    AppState.totalFinanceiro = total;
}

function finalizarProducao() {
    AppState.carrinho = [];
    const albumChoice = document.querySelector('input[name="fotolivro_choice"]:checked');
    if (albumChoice) {
        AppState.carrinho.push({ item: albumChoice.dataset.name, valor: parseFloat(albumChoice.dataset.price) });
    }

    const extras = document.querySelectorAll('input[id^="extra_"]');
    extras.forEach(inp => {
        const qtd = parseInt(inp.value);
        if (qtd > 0) {
            const creditos = parseInt(inp.dataset.credit);
            const pagavel = Math.max(0, qtd - creditos);
            const valorTotalItem = pagavel * parseFloat(inp.dataset.price);
            let nomeItem = inp.dataset.name;
            if (creditos > 0 && qtd <= creditos) nomeItem += " (Incluso)";
            else if (creditos > 0) nomeItem += ` (${creditos} inclusas + ${pagavel} extras)`;
            AppState.carrinho.push({ item: `${qtd}x ${nomeItem}`, valor: valorTotalItem });
        }
    });
    
    carregarModulo('entrega');
}
