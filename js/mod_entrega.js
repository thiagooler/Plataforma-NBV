function RenderEntrega() {
    const container = document.getElementById('app-container');
    const locais = AppState.config.logistica.locais;
    const valorEnvio = AppState.config.logistica.envio;

    let locaisHtml = locais.map(l => `<option value="${l}">${l}</option>`).join('');

    let html = `
        <div class="container fade-in">
            <div class="card">
                <h2>📦 Como você quer receber?</h2>
                
                <label class="option-box">
                    <input type="radio" name="entrega" value="retirada" checked onchange="toggleEntrega()">
                    <strong>Retirada Grátis</strong>
                    <select id="select-local" style="margin-top:10px">
                        ${locaisHtml}
                    </select>
                </label>

                <label class="option-box" style="margin-top:15px; display:block">
                    <input type="radio" name="entrega" value="envio" onchange="toggleEntrega()">
                    <strong>Envio / Transportadora</strong> (+ ${formatMoney(valorEnvio)})
                    <p style="font-size:0.9rem; color:#aaa">Entrega no seu endereço.</p>
                </label>
            </div>

            <div id="area-pagamento"></div> 
            </div>
    `;

    container.innerHTML = html;
    
    // Carrega o Pagamento automaticamente abaixo da entrega
    RenderPagamento();
}

function toggleEntrega() {
    const tipo = document.querySelector('input[name="entrega"]:checked').value;
    const custoEnvio = AppState.config.logistica.envio;
    
    // Atualiza o total global
    if (tipo === 'envio') {
        AppState.custoFrete = custoEnvio;
    } else {
        AppState.custoFrete = 0;
    }
    
    // Chama a atualização do módulo de pagamento
    atualizarResumoPagamento();
}
