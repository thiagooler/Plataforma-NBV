// --- MÓDULO DE PRODUÇÃO (V7.0 - Com Resumo Protegido) ---

function RenderProducao() {
    const container = document.getElementById('app-container');
    
    // Filtra apenas as fotos aprovadas
    const fotosAprovadas = AppState.fotos.filter(f => f.status === 'aprovada');
    const qtdAprovadas = fotosAprovadas.length;
    
    // Configurações
    const db = AppState.config;
    const markup = db.financeiro.markup;
    const custoFixo = db.financeiro.custoFixoDiagramacao;
    const minFotos = db.fluxo.minimoFotosLivro || 20;

    // --- 1. GERAÇÃO DA MARCA D'ÁGUA (Igual à Aprovação) ---
    const assets = db.assets || {};
    const textoWm = assets.watermarkText || "PROIBIDO PRINT";
    const opacidade = assets.opacity || 0.2;
    
    const svgPattern = `
        <svg width='300' height='150' xmlns='http://www.w3.org/2000/svg'>
            <text x='50%' y='50%' transform='rotate(-20 150 75)' dominant-baseline='middle' text-anchor='middle' 
                font-family='Arial' font-weight='bold' font-size='18' fill='%23808080' fill-opacity='${opacidade}'>
                ${textoWm}
            </text>
        </svg>
    `;
    const bgImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgPattern)}`;

    // --- 2. HTML DO RESUMO VISUAL (Filmstrip) ---
    let filmStripHTML = `<div class="film-strip-container">`;
    fotosAprovadas.forEach(foto => {
        filmStripHTML += `
            <div class="thumb-protected">
                <img src="${foto.url}" loading="lazy" oncontextmenu="return false;">
                <div class="wm-overlay" style="background-image: url('${bgImage}')"></div>
            </div>
        `;
    });
    filmStripHTML += `</div>`;

    // --- 3. INÍCIO DO LAYOUT ---
    let html = `
        <div class="container fade-in">
            <div class="card">
                <h2>💎 Personalize seu Pacote</h2>
                <p>Você selecionou <strong>${qtdAprovadas} fotos</strong>. Confira abaixo:</p>
                
                ${filmStripHTML}
    `;

    // --- 4. LÓGICA DO FOTOLIVRO (Contrato & Upgrade) ---
    if (qtdAprovadas >= minFotos) {
        
        const temContrato = db.cliente.incluirAlbum;
        let valorBaseDoAlbumContratado = 0;
        let tamanhoContratado = '';
        let fotosContratadas = 0;

        // Descobre valor do contrato base
        if (temContrato && db.cliente.contrato) {
            const ctr = db.cliente.contrato;
            tamanhoContratado = ctr.tamanho;
            fotosContratadas = ctr.qtdFotos;

            if (ctr.valorCredito && ctr.valorCredito > 0) {
                valorBaseDoAlbumContratado = ctr.valorCredito;
            } else {
                const regrasPagina = db.regrasDiagramacao[ctr.tamanho] || 4;
                const pagsCtr = Math.ceil(ctr.qtdFotos / regrasPagina);
                const opcoesCtr = db.tabelaFotolivros.filter(t => t.size === ctr.tamanho).sort((a,b) => a.pages - b.pages);
                const opcaoCtr = opcoesCtr.find(t => t.pages >= pagsCtr) || opcoesCtr[opcoesCtr.length-1];

                if (opcaoCtr) {
                    valorBaseDoAlbumContratado = (opcaoCtr.priceBox + custoFixo) * markup;
                }
            }
        }

        let bookOptionsHTML = '';
        const tamanhos = [...new Set(db.tabelaFotolivros.map(t => t.size))];
        let preSelectionMade = false;

        tamanhos.forEach(tamanho => {
            const fotosPorPagina = db.regrasDiagramacao[tamanho] || 4;
            const opcoesTamanho = db.tabelaFotolivros.filter(t => t.size === tamanho).sort((a,b) => a.pages - b.pages);
            const maxPaginas = opcoesTamanho[opcoesTamanho.length - 1].pages;
            const maxFotos = maxPaginas * fotosPorPagina;
            
            const fotosParaCalculo = Math.max(qtdAprovadas, fotosContratadas);
            const paginasNecessarias = Math.ceil(fotosParaCalculo / fotosPorPagina);
            const opcaoViavel = opcoesTamanho.find(t => t.pages >= paginasNecessarias);

            let bloqueado = false;
            let upgradeCost = 0;
            let textoDestaque = "";
            let textoExplica = "";
            let checked = false;

            if (!opcaoViavel) {
                bloqueado = true;
                textoExplica = `Capacidade excedida (${maxFotos} fotos máx).`;
            } else {
                const custoTotal = opcaoViavel.priceBox + custoFixo;
                const precoCheioNovo = custoTotal * markup;
                
                textoExplica = `Álbum ${tamanho} - ${opcaoViavel.pages} págs.`;

                if (temContrato) {
                    let diferenca = precoCheioNovo - valorBaseDoAlbumContratado;
                    if (diferenca < 1) diferenca = 0;
                    upgradeCost = diferenca;

                    if (tamanho === tamanhoContratado) {
                        textoDestaque = "SEU PLANO";
                        if (!preSelectionMade) { checked = true; preSelectionMade = true; }
                        
                        if (diferenca > 0) textoExplica += `<br><span style="color:#e67e22">Adicional por fotos extras.</span>`;
                        else textoExplica += `<br><span style="color:green">Incluso no pacote.</span>`;
                    } else {
                        if (diferenca > 0) {
                             textoDestaque = "UPGRADE";
                             textoExplica += `<br>Valor adicional de upgrade.`;
                        }
                    }
                } else {
                    upgradeCost = precoCheioNovo;
                    if (!preSelectionMade && tamanho === '30x40') { checked = true; preSelectionMade = true; }
                }
            }

            if (bloqueado && tamanho === tamanhoContratado) {
                textoExplica = `<span style="color:red">Limite excedido. Escolha um maior.</span>`;
            }

            if (bloqueado) {
                bookOptionsHTML += `<div class="product-card option-box disabled-plan" style="opacity:0.6"><div style="display:flex; justify-content:space-between"><div><strong style="font-size:1.1rem">Fotolivro ${tamanho}</strong> <span class="badge badge-error">Indisponível</span></div></div><p style="margin:5px 0 0; font-size:0.8rem">${textoExplica}</p></div>`;
            } else {
                if (!preSelectionMade) { checked = true; preSelectionMade = true; }
                
                bookOptionsHTML += `
                    <label class="product-card option-box ${checked ? 'selected-plan' : ''}" style="cursor:pointer; display:block">
                        <div style="display:flex; justify-content:space-between; align-items:center">
                            <div>
                                <input type="radio" name="fotolivro_choice" value="${tamanho}" 
                                    data-upgrade="${upgradeCost}" 
                                    data-name="Fotolivro ${tamanho} (${opcaoViavel.pages} págs)"
                                    ${checked ? 'checked' : ''}
                                    onchange="atualizarTotalProducao()">
                                <strong style="font-size:1.1rem">Fotolivro ${tamanho}</strong>
                                ${textoDestaque ? `<span class="badge ${textoDestaque==='UPGRADE'?'badge-up':''}">${textoDestaque}</span>` : ''}
                            </div>
                            <div style="text-align:right">
                                <div style="font-size:1.2rem; font-weight:bold; color:${upgradeCost===0 ? 'green' : 'var(--primary)'}">
                                    ${upgradeCost === 0 ? 'INCLUSO' : '+ ' + formatMoney(upgradeCost)}
                                </div>
                            </div>
                        </div>
                        <p style="margin:5px 0 0 25px; font-size:0.9rem; color:#666">${textoExplica}</p>
                    </label>
                `;
            }
        });

        html += `<div style="margin-top:20px"><h3>📚 Opções de Fotolivro</h3><div class="book-options-list">${bookOptionsHTML}</div></div>`;

    } else {
        html += `<div class="alert-box"><i class="fas fa-info-circle"></i> Mínimo de ${minFotos} fotos para álbum.</div>`;
    }

    // --- 5. PRODUTOS AVULSOS ---
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
                    <div class="prod-img-area" style="height:120px"><i class="${prod.icone}" style="font-size:40px; color:#ccc"></i></div>
                    <div class="prod-info" style="padding:15px">
                        <h4 style="margin:0">${prod.nome}</h4>
                        <p style="font-weight:bold; color:var(--primary); margin:5px 0">${formatMoney(prod.preco)}</p>
                        ${creditoQtd > 0 ? `<p style="color:var(--success); font-size:0.8rem"><b>${creditoQtd}</b> inclusas!</p>` : ''}
                        <div class="stepper" style="display:flex; align-items:center; gap:10px; margin-top:10px">
                            <button type="button" class="btn-sec" style="width:30px" onclick="mudarQtd('extra_${idx}', -1)">-</button>
                            <input type="number" id="extra_${idx}" data-name="${prod.nome}" data-price="${prod.preco}" data-credit="${creditoQtd}" value="0" readonly style="width:40px; text-align:center">
                            <button type="button" class="btn-sec" style="width:30px" onclick="mudarQtd('extra_${idx}', 1)">+</button>
                        </div>
                    </div>
                </div>`;
        });
    }

    html += `</div></div><div class="card" style="margin-top:20px; text-align:right; border-top: 4px solid var(--primary); background:#f8f9fa">
        <div style="font-size:0.9rem; color:#666; margin-bottom:5px">
            ${db.cliente.incluirAlbum ? `Contrato Base: ${formatMoney(db.cliente.contrato.valorTotal)} <br>` : ''}
            ${db.cliente.entrada > 0 ? `Entrada Paga: - ${formatMoney(db.cliente.entrada)} <br>` : ''}
        </div>
        <h3>Restante a Pagar: <span id="total-prod-display" style="color:var(--primary)">R$ 0,00</span></h3>
        <button class="btn btn-primary" style="width:auto; padding:15px 30px" onclick="finalizarProducao()">Avançar <i class="fas fa-arrow-right"></i></button>
    </div></div>`;
    
    container.innerHTML = html;
    
    // --- 6. CSS INJETADO (FILMSTRIP + MARCA D'ÁGUA) ---
    const style = document.createElement('style');
    style.innerHTML = `
        .film-strip-container { 
            display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; margin-bottom: 20px; 
            border-bottom: 1px solid #eee; scrollbar-width: thin;
        }
        .thumb-protected { 
            position: relative; flex: 0 0 80px; height: 80px; border-radius: 6px; overflow: hidden; border: 1px solid #ddd; 
        }
        .thumb-protected img { width: 100%; height: 100%; object-fit: cover; }
        .wm-overlay { 
            position: absolute; top:0; left:0; width:100%; height:100%; 
            background-repeat: repeat; background-size: 100px 50px; pointer-events: none; 
        }
        .badge { background:#0066cc; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:8px; text-transform:uppercase; vertical-align:middle; } 
        .badge-up { background: #e67e22; } .badge-error { background: #dc2626; } 
        .selected-plan { border: 2px solid var(--primary); background: #f0f7ff; } 
        .disabled-plan { background: #f3f4f6; border: 1px solid #ddd; cursor: not-allowed; } 
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
    let totalAdicional = 0;
    
    // Soma Upgrade Álbum
    const albumChoice = document.querySelector('input[name="fotolivro_choice"]:checked');
    if (albumChoice) {
        totalAdicional += parseFloat(albumChoice.dataset.upgrade);
        document.querySelectorAll('input[name="fotolivro_choice"]').forEach(r => r.closest('.option-box').classList.remove('selected-plan'));
        albumChoice.closest('.option-box').classList.add('selected-plan');
    }

    // Soma Extras
    const extras = document.querySelectorAll('input[id^="extra_"]');
    extras.forEach(inp => {
        const qtd = parseInt(inp.value);
        const creditos = parseInt(inp.dataset.credit);
        const preco = parseFloat(inp.dataset.price);
        const pagavel = Math.max(0, qtd - creditos);
        totalAdicional += pagavel * preco;
    });
    
    // Cálculo Final do Saldo
    const config = AppState.config.cliente;
    let saldoDevedor = totalAdicional;

    if (config.incluirAlbum) {
        // Contrato: (ValorContratoBase + Adicionais) - Entrada
        const valorContrato = config.contrato.valorTotal || 0;
        const entrada = config.entrada || 0;
        saldoDevedor = (valorContrato + totalAdicional) - entrada;
    } else {
        // Avulso: Adicionais - Entrada
        const entrada = config.entrada || 0;
        saldoDevedor = totalAdicional - entrada;
    }

    if (saldoDevedor < 0) saldoDevedor = 0;

    document.getElementById('total-prod-display').innerText = formatMoney(saldoDevedor);
    AppState.totalFinanceiro = saldoDevedor;
}

function finalizarProducao() {
    AppState.carrinho = [];
    const albumChoice = document.querySelector('input[name="fotolivro_choice"]:checked');
    
    if (albumChoice) {
        let desc = albumChoice.dataset.name;
        const upg = parseFloat(albumChoice.dataset.upgrade);
        if (AppState.config.cliente.incluirAlbum) {
            desc += upg > 0 ? ` (Upgrade: +${formatMoney(upg)})` : " (Incluso no Contrato)";
        }
        AppState.carrinho.push({ item: desc, valor: upg }); 
    }

    const extras = document.querySelectorAll('input[id^="extra_"]');
    extras.forEach(inp => {
        const qtd = parseInt(inp.value);
        if (qtd > 0) {
            const creditos = parseInt(inp.dataset.credit);
            const pagavel = Math.max(0, qtd - creditos);
            const valorTotalItem = pagavel * parseFloat(inp.dataset.price);
            let nomeItem = inp.dataset.name;
            if (creditos > 0) {
                if (qtd <= creditos) nomeItem += " (Incluso nos Créditos)";
                else nomeItem += ` (${creditos} inclusas + ${pagavel} pagas)`;
            }
            AppState.carrinho.push({ item: `${qtd}x ${nomeItem}`, valor: valorTotalItem });
        }
    });
    
    carregarModulo('entrega');
}
