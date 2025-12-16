function RenderEntrega() {
    const container = document.getElementById('app-container');
    const db = AppState.config.logistica;
    
    // Lista de Cidades Grátis
    const cidadesOpts = db.cidadesGratis.map(c => `<option value="${c}">${c}</option>`).join('');

    let html = `
        <div class="container fade-in">
            <div class="card">
                <h2>📦 Como você prefere receber?</h2>
                
                <label class="option-box delivery-opt">
                    <div style="display:flex; gap:15px; align-items:center">
                        <input type="radio" name="entrega" value="sede" onchange="tratarEntrega()">
                        <div>
                            <strong style="font-size:1.1rem">Retirar na Sede NBV (Sítio Boa Ventura)</strong>
                            <p style="margin:5px 0 0; font-size:0.9rem; color:#666">
                                ${db.enderecoSede}<br>
                                <span style="color:var(--success); font-size:0.8rem"><i class="fas fa-check"></i> Produção na hora (fotos simples)</span>
                            </p>
                        </div>
                    </div>
                    <div id="info-sede" class="sub-info hidden" style="margin-top:10px; padding:10px; background:#f0f9ff; border-radius:6px; font-size:0.85rem">
                        ⚠️ <b>Atenção aos Prazos:</b><br>
                        • Fotos simples: Produção na hora.<br>
                        • Fotolivros/Quadros (>40x60): Prazo de 30 dias.<br>
                        • Pagamento: Pode ser na retirada (agendada) ou antecipado (retirada livre no Mercado JL).
                    </div>
                </label>

                <label class="option-box delivery-opt">
                    <div style="display:flex; gap:15px; align-items:center">
                        <input type="radio" name="entrega" value="cidade" onchange="tratarEntrega()">
                        <div>
                            <strong style="font-size:1.1rem">Entrega/Retirada em Cidades Parceiras</strong>
                            <p style="margin:5px 0 0; font-size:0.9rem; color:#666">Frete Grátis (Turvo, Boa Ventura, Pitanga, Santa Maria)</p>
                        </div>
                    </div>
                    
                    <div id="sub-cidades" class="sub-info hidden" style="margin-top:15px; border-top:1px solid #eee; padding-top:10px">
                        <label>Selecione sua cidade:</label>
                        <select id="sel-cidade" onchange="tratarCidadeEspecifica()">
                            <option value="">-- Selecione --</option>
                            ${cidadesOpts}
                        </select>

                        <div id="detalhes-cidade" class="hidden" style="margin-top:10px;"></div>
                    </div>
                </label>

                <label class="option-box delivery-opt">
                    <div style="display:flex; gap:15px; align-items:center">
                        <input type="radio" name="entrega" value="envio" onchange="tratarEntrega()">
                        <div>
                            <strong style="font-size:1.1rem">Envio por Transportadora</strong>
                            <span style="display:block; font-weight:bold; color:var(--primary)">+ ${formatMoney(db.taxaEnvio)}</span>
                            <p style="margin:5px 0 0; font-size:0.9rem; color:#666">Para outras regiões.</p>
                        </div>
                    </div>
                </label>

            </div>

            <div id="area-pagamento"></div>
        </div>
    `;

    container.innerHTML = html;
}

function tratarEntrega() {
    const tipo = document.querySelector('input[name="entrega"]:checked').value;
    
    // Reset visual
    document.querySelectorAll('.sub-info').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.delivery-opt').forEach(el => el.style.borderColor = '#e5e7eb');
    
    // Highlight selected
    document.querySelector(`input[value="${tipo}"]`).closest('.option-box').style.borderColor = 'var(--primary)';

    AppState.custoFrete = 0;
    AppState.dadosEntrega = { tipo: tipo };

    if (tipo === 'sede') {
        document.getElementById('info-sede').classList.remove('hidden');
        AppState.dadosEntrega.detalhe = "Retirada Sede NBV (Sítio Boa Ventura)";
        AppState.podePagarNaEntrega = true; // Sede permite pagar na hora
    } 
    else if (tipo === 'cidade') {
        document.getElementById('sub-cidades').classList.remove('hidden');
        AppState.podePagarNaEntrega = false; // Default false, muda conforme cidade
    } 
    else if (tipo === 'envio') {
        AppState.custoFrete = AppState.config.logistica.taxaEnvio;
        AppState.dadosEntrega.detalhe = "Transportadora";
        AppState.podePagarNaEntrega = false;
    }

    // Se mudou para cidade, não carrega pagamento ainda até escolher a cidade
    if (tipo !== 'cidade') {
        RenderPagamento();
    } else {
        document.getElementById('area-pagamento').innerHTML = ''; // Limpa
    }
}

function tratarCidadeEspecifica() {
    const cidade = document.getElementById('sel-cidade').value;
    const divDetalhes = document.getElementById('detalhes-cidade');
    divDetalhes.classList.remove('hidden');
    divDetalhes.innerHTML = ''; // Limpa anterior

    AppState.dadosEntrega.cidade = cidade;
    AppState.podePagarNaEntrega = true; // Reset

    // LÓGICA ESPECÍFICA POR CIDADE
    if (cidade === 'Turvo') {
        divDetalhes.innerHTML = `
            <div style="background:#f8f9fa; padding:10px; border-radius:6px; border:1px solid #ddd">
                <label>Local de Retirada em Turvo:</label>
                <div style="margin-top:5px">
                    <label style="display:block; margin-bottom:5px; font-weight:normal">
                        <input type="radio" name="local_turvo" value="ibema" onchange="setDetalheCidade('Distrito de Ibema - Restaurante do Boneco')"> 
                        Distrito de Ibema (Restaurante do Boneco)
                    </label>
                    <label style="display:block; font-weight:normal">
                        <input type="radio" name="local_turvo" value="centro" onchange="setDetalheCidade('Turvo - Centro (Combinar Local)')"> 
                        Turvo - Cidade/Centro
                    </label>
                </div>
            </div>
        `;
    } 
    else if (cidade === 'Boa Ventura de São Roque') {
        AppState.podePagarNaEntrega = false; // REGRA: Boa Ventura só antecipado
        divDetalhes.innerHTML = `
            <div style="background:#fff3cd; color:#856404; padding:10px; border-radius:6px; border:1px solid #ffeeba">
                <i class="fas fa-exclamation-circle"></i> <b>Retirada no Coworking (Quartas-feiras)</b><br>
                Para retirada neste local com a recepcionista, o <b>pagamento deve ser antecipado</b> via Pix ou Link.
            </div>
        `;
        AppState.dadosEntrega.detalhe = "Boa Ventura - Coworking (Quarta-feira)";
        RenderPagamento(); // Já carrega pois não tem sub-opção
    }
    else {
        // Pitanga, Santa Maria, etc.
        divDetalhes.innerHTML = `<p style="font-size:0.9rem; color:#666">Entraremos em contato para combinar o ponto de encontro em ${cidade}.</p>`;
        AppState.dadosEntrega.detalhe = "Entrega em " + cidade;
        RenderPagamento();
    }
}

function setDetalheCidade(local) {
    AppState.dadosEntrega.detalhe = local;
    RenderPagamento();
}
