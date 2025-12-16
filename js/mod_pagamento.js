function RenderPagamento() {
    const area = document.getElementById('area-pagamento');
    // ... cálculos de total ...
    const totalProd = AppState.totalFinanceiro || 0;
    const frete = AppState.custoFrete || 0;
    const totalFinal = totalProd + frete;

    let html = `
        <div class="card" style="border-top: 3px solid var(--primary); margin-top:20px; animation: fadeIn 0.5s">
            <h2>💳 Pagamento</h2>
            
            <div class="resumo-final" style="background:#f8f9fa; padding:15px; border-radius:6px; margin-bottom:20px; border:1px solid #eee">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px">
                    <span>Produtos/Upgrade:</span> <span>${formatMoney(totalProd)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px">
                    <span>Frete:</span> <span>${formatMoney(frete)}</span>
                </div>
                <hr style="border-color:#ddd; margin:10px 0">
                <div style="display:flex; justify-content:space-between; font-size:1.3rem; font-weight:800; color:#333">
                    <span>TOTAL:</span> <span style="color:var(--primary)">${formatMoney(totalFinal)}</span>
                </div>
            </div>

            <label>Forma de Pagamento:</label>
            <select id="pagamento-tipo" onchange="atualizarOpcoesPagamento(${totalFinal})">
                <option value="pix">Pix (Desconto de ${AppState.config.financeiro.descontoPix}%)</option>
                <option value="cartao">Cartão de Crédito (Link)</option>
    `;

    // SÓ MOSTRA PAGAR NA RETIRADA SE FOR PERMITIDO PELO LOCAL ESCOLHIDO
    if (AppState.podePagarNaEntrega) {
        html += `<option value="retirada">Pagar na Retirada / Agendamento</option>`;
    }

    html += `
            </select>
            
            <div id="detalhes-pagamento" style="margin-top:15px; padding:15px; background:#e0f2fe; border-radius:6px; border:1px solid #bae6fd; font-size:0.9rem">
                </div>

            <button class="btn btn-whatsapp" style="margin-top:25px; height:55px; font-size:1.1rem; width:100%" onclick="enviarPedidoZap()">
                <i class="fab fa-whatsapp"></i> Finalizar Pedido no WhatsApp
            </button>
        </div>
    `;
    
    area.innerHTML = html;
    atualizarOpcoesPagamento(totalFinal);
}

function atualizarOpcoesPagamento(total) {
    const tipo = document.getElementById('pagamento-tipo').value;
    const div = document.getElementById('detalhes-pagamento');
    const conf = AppState.config.financeiro;

    if (tipo === 'pix') {
        const desc = conf.descontoPix;
        const valorComDesconto = total * (1 - desc/100);
        div.innerHTML = `
            <div style="color:#004c99; font-weight:bold; font-size:1rem; margin-bottom:5px">
                Valor no Pix: ${formatMoney(valorComDesconto)}
            </div>
            <small>Chave Pix será enviada no WhatsApp.</small>
        `;
    } 
    else if (tipo === 'cartao') {
        div.innerHTML = `Link de pagamento será enviado. Parcelamento em até ${conf.parcelasSemJuros}x sem juros ou até 12x (taxas da operadora).`;
    }
    else if (tipo === 'retirada') {
        div.innerHTML = `<b>Agendamento Necessário:</b> O pagamento será feito no balcão ao retirar. Se houver fotolivro ou quadros grandes, entraremos em contato para sinal.`;
        div.style.background = "#fff3cd";
        div.style.borderColor = "#ffeeba";
        div.style.color = "#856404";
    }
}

function enviarPedidoZap() {
    const cli = AppState.config.cliente;
    const frete = AppState.custoFrete || 0;
    const totalProd = AppState.totalFinanceiro || 0;
    const total = totalProd + frete;
    const tipoPag = document.getElementById('pagamento-tipo').value;
    const localEntrega = AppState.dadosEntrega.detalhe || "A combinar";

    // Textos bonitos para o pagamento
    const nomesPag = { pix: "Pix", cartao: "Cartão (Link)", retirada: "Na Retirada" };

    let msg = `*NOVO PEDIDO - ${cli.nome}*\n`;
    msg += `--------------------------------\n`;
    
    // Itens
    if (AppState.carrinho.length > 0) {
        msg += `🛒 *RESUMO DO PEDIDO:*\n`;
        AppState.carrinho.forEach(c => {
            msg += `• ${c.item}\n`;
        });
        msg += `\n`;
    }

    msg += `📍 *ENTREGA:* ${localEntrega}\n`;
    
    if (cli.incluirAlbum && cli.contrato) {
        msg += `📄 *CONTRATO:* Valor Base R$ ${cli.contrato.valorTotal.toFixed(2)}\n`;
        if(cli.entrada > 0) msg += `💰 *ENTRADA PAGA:* R$ ${cli.entrada.toFixed(2)}\n`;
    }

    msg += `--------------------------------\n`;
    msg += `💳 *PAGAMENTO:* ${nomesPag[tipoPag]}\n`;
    msg += `💰 *TOTAL A PAGAR:* ${formatMoney(total)}\n`;
    msg += `--------------------------------\n`;
    msg += `Aguardo a confirmação!`;

    const zapLink = `https://wa.me/${AppState.config.financeiro.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(zapLink, '_blank');
}
