function RenderPagamento() {
    const area = document.getElementById('area-pagamento');
    const juros = AppState.config.financeiro.juros;
    
    let html = `
        <div class="card" style="border-top: 3px solid var(--primary)">
            <h2>💳 Pagamento</h2>
            
            <div class="resumo-final" style="background:#000; padding:15px; border-radius:6px; margin-bottom:20px">
                <div style="display:flex; justify-content:space-between">
                    <span>Produtos:</span> <span id="res-prod">...</span>
                </div>
                <div style="display:flex; justify-content:space-between">
                    <span>Frete:</span> <span id="res-frete">...</span>
                </div>
                <hr style="border-color:#333">
                <div style="display:flex; justify-content:space-between; font-size:1.2rem; font-weight:bold; color:var(--text-bright)">
                    <span>TOTAL:</span> <span id="res-total">...</span>
                </div>
            </div>

            <label>Forma de Pagamento:</label>
            <select id="pagamento-tipo" onchange="atualizarOpcoesPagamento()">
                <option value="pix">Pix (Desconto de ${AppState.config.financeiro.pixDesc}%)</option>
                <option value="cartao">Cartão de Crédito</option>
            </select>
            
            <div id="detalhes-pagamento" style="margin-top:15px; padding:10px; background:rgba(35,134,54,0.1); border-radius:6px;">
                </div>

            <button class="btn btn-primary" style="margin-top:20px; font-size:1.1rem; height:50px" onclick="enviarPedidoZap()">
                <i class="fab fa-whatsapp"></i> Finalizar Pedido no WhatsApp
            </button>
        </div>
    `;
    
    area.innerHTML = html;
    atualizarResumoPagamento();
}

function atualizarResumoPagamento() {
    const totalProd = AppState.totalFinanceiro || 0;
    const frete = AppState.custoFrete || 0;
    const total = totalProd + frete;
    
    document.getElementById('res-prod').innerText = formatMoney(totalProd);
    document.getElementById('res-frete').innerText = formatMoney(frete);
    document.getElementById('res-total').innerText = formatMoney(total);
    
    atualizarOpcoesPagamento();
}

function atualizarOpcoesPagamento() {
    const tipo = document.getElementById('pagamento-tipo').value;
    const total = (AppState.totalFinanceiro || 0) + (AppState.custoFrete || 0);
    const div = document.getElementById('detalhes-pagamento');
    
    if (tipo === 'pix') {
        const desc = AppState.config.financeiro.pixDesc;
        const valorComDesconto = total * (1 - desc/100);
        div.innerHTML = `
            <p style="color:var(--primary); font-weight:bold">
                Pague apenas ${formatMoney(valorComDesconto)} no Pix!
            </p>
            <small>Chave será enviada no WhatsApp.</small>
        `;
    } else {
        // Lógica simples de parcelas (exemplo)
        div.innerHTML = `<p>Até 12x no cartão (Taxas da máquina aplicáveis).</p>`;
    }
}

function enviarPedidoZap() {
    const cliente = AppState.config.cliente;
    const total = (AppState.totalFinanceiro || 0) + (AppState.custoFrete || 0);
    const tipoPag = document.getElementById('pagamento-tipo').value;
    
    // Mensagem Formatada
    let msg = `*NOVO PEDIDO - ${cliente}*\n\n`;
    msg += `✅ Fotos Aprovadas: ${AppState.fotos.filter(f=>f.status==='aprovada').length}\n`;
    msg += `📦 Entrega: ${AppState.custoFrete > 0 ? 'Envio' : 'Retirada'}\n`;
    msg += `💰 Total Base: ${formatMoney(total)}\n`;
    msg += `💳 Pagamento: ${tipoPag.toUpperCase()}\n`;
    msg += `\nAguardo o link para pagamento!`;

    const zapLink = `https://wa.me/5542998370150?text=${encodeURIComponent(msg)}`;
    window.open(zapLink, '_blank');
}
