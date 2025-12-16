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
                                <span style="color:var(--success); font-size:0.8rem"><i class="fas fa-check"></i> Produção imediata (fotos simples)</span>
                            </p>
                        </div>
                    </div>
                    <div id="info-sede" class="sub-info hidden" style="margin-top:10px; padding:10px; background:#f0f9ff; border-radius:6px; font-size:0.85rem; border-left: 4px solid var(--primary)">
                        ⚠️ <b>Informações de Retirada:</b><br>
                        • Fotos simples: Feitas na hora.<br>
                        • Fotolivros/Quadros (>40x60): Prazo de ~30 dias.<br>
                        • <b>Pagamento:</b> Pode pagar na retirada (agendada) ou antecipado.
                    </div>
                </label>

                <label class="option-box delivery-opt">
                    <div style="display:flex; gap:15px; align-items:center">
                        <input type="radio" name="entrega" value="cidade" onchange="tratarEntrega()">
                        <div>
                            <strong style="font-size:1.1rem">Entrega/Retirada na Cidade</strong>
                            <p style="margin:5px 0 0; font-size:0.9rem; color:#666">Frete Grátis (Turvo, Boa Ventura, Pitanga, Sta. Maria)</p>
                        </div>
                    </div>
                    
                    <div id="sub-cidades" class="sub-info hidden" style="margin-top:15px; border-top:1px solid #eee; padding-top:15px">
                        <label>Selecione sua cidade:</label>
                        <select id="sel-cidade" onchange="tratarCidadeEspecifica()">
                            <option value="">-- Selecione --</option>
                            ${cidadesOpts}
                        </select>

                        <div id="detalhes-cidade" class="hidden" style="margin-top:15px;"></div>
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
                    <div id="info-envio" class="sub-info hidden" style="margin-top:10px">
                        <label>Endereço Completo para Envio:</label>
                        <textarea id="endereco-envio" rows="3" placeholder="Rua, Número, Bairro, Cidade, CEP..." oninput="salvarEnderecoEnvio(this.value)"></textarea>
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
        AppState.podePagarNaEntrega = true; 
        RenderPagamento();
    } 
    else if (tipo === 'cidade') {
        document.getElementById('sub-cidades').classList.remove('hidden');
        AppState.podePagarNaEntrega = false; 
        document.getElementById('area-pagamento').innerHTML = ''; // Espera selecionar cidade
    } 
    else if (tipo === 'envio') {
        document.getElementById('info-envio').classList.remove('hidden');
        AppState.custoFrete = AppState.config.logistica.taxaEnvio;
        AppState.dadosEntrega.detalhe = "Transportadora";
        AppState.podePagarNaEntrega = false;
        RenderPagamento();
    }
}

function tratarCidadeEspecifica() {
    const cidade = document.getElementById('sel-cidade').value;
    const divDetalhes = document.getElementById('detalhes-cidade');
    divDetalhes.classList.remove('hidden');
    divDetalhes.innerHTML = ''; 

    AppState.dadosEntrega.cidade = cidade;
    
    // --- LÓGICA DE CADA CIDADE ---

    if (cidade === 'Turvo') {
        divDetalhes.innerHTML = `
            <div style="background:#f9fafb; padding:15px; border-radius:8px; border:1px solid #ddd">
                <label>Onde em Turvo?</label>
                
                <label class="list-item" style="cursor:pointer">
                    <input type="radio" name="local_turvo" value="ibema" onchange="selecionarPontoFixo('Distrito de Ibema - Restaurante do Boneco')"> 
                    <b>Distrito de Ibema</b> (Retirada no Restaurante do Boneco)
                </label>
                
                <label class="list-item" style="cursor:pointer">
                    <input type="radio" name="local_turvo" value="centro" onchange="mostrarFormularioEndereco()"> 
                    <b>Cidade / Centro</b> (Receber em casa ou comércio)
                </label>
                
                <div id="form-endereco-dinamico" class="hidden" style="margin-top:15px"></div>
            </div>
        `;
    } 
    else if (cidade === 'Boa Ventura de São Roque') {
        divDetalhes.innerHTML = `
            <div style="background:#f9fafb; padding:15px; border-radius:8px; border:1px solid #ddd">
                <label>Onde em Boa Ventura?</label>
                
                <label class="list-item" style="cursor:pointer">
                    <input type="radio" name="local_bv" value="coworking" onchange="selecionarPontoFixo('Boa Ventura - Coworking (Quarta-feira)', false)"> 
                    <b>Coworking (Quarta-feira)</b>
                    <div style="font-size:0.8rem; color:#d97706; margin-left:20px">⚠️ Requer pagamento antecipado.</div>
                </label>
                
                <label class="list-item" style="cursor:pointer">
                    <input type="radio" name="local_bv" value="centro" onchange="mostrarFormularioEndereco()"> 
                    <b>Outro local na Cidade</b> (Receber em casa/comércio)
                </label>
                
                <div id="form-endereco-dinamico" class="hidden" style="margin-top:15px"></div>
            </div>
        `;
    }
    else {
        // Pitanga, Santa Maria, etc. (Padrão: Pede endereço na cidade)
        divDetalhes.innerHTML = `<div id="form-endereco-dinamico"></div>`;
        mostrarFormularioEndereco();
    }
}

// Quando o cliente escolhe um ponto fixo (Ibema ou Coworking)
function selecionarPontoFixo(nomeLocal, permitePagarNaHora = true) {
    document.getElementById('form-endereco-dinamico').classList.add('hidden');
    AppState.dadosEntrega.detalhe = nomeLocal;
    AppState.podePagarNaEntrega = permitePagarNaHora;
    RenderPagamento();
}

// Quando o cliente escolhe receber na cidade (Exige endereço)
function mostrarFormularioEndereco() {
    const div = document.getElementById('form-endereco-dinamico');
    div.classList.remove('hidden');
    
    div.innerHTML = `
        <div class="alert-box" style="background:#fff3cd; color:#856404; border:1px solid #ffeeba; padding:10px; border-radius:6px; font-size:0.85rem; margin-bottom:10px">
            <i class="fas fa-exclamation-triangle"></i> <b>Atenção:</b> Entregas apenas no <b>Perímetro Urbano</b>. 
            Se você mora no sítio, indique um comércio ou casa de conhecido na cidade.
        </div>

        <label>Local de Entrega / Referência:</label>
        <div style="display:flex; gap:5px; margin-bottom:5px">
            <button class="btn btn-secondary" style="font-size:0.8rem; padding:8px" onclick="usarGeolocalizacao()">
                📍 Usar minha localização atual
            </button>
            <a href="https://www.google.com.br/maps" target="_blank" class="btn btn-secondary" style="font-size:0.8rem; padding:8px; text-decoration:none; color:inherit">
                🗺️ Abrir Mapa
            </a>
        </div>
        
        <textarea id="input-endereco-cidade" rows="3" 
            placeholder="Ex: Deixar na Loja X, Rua Principal... (Ou cole o link do mapa aqui)"
            oninput="salvarEnderecoManual(this.value)"></textarea>
    `;
    
    AppState.podePagarNaEntrega = true; // Entrega em mãos geralmente permite pagamento
    AppState.dadosEntrega.detalhe = "Endereço a definir"; // Placeholder até digitar
    RenderPagamento();
}

// Função de GPS
function usarGeolocalizacao() {
    const txtArea = document.getElementById('input-endereco-cidade');
    
    if (!navigator.geolocation) {
        alert("Seu navegador não suporta geolocalização.");
        return;
    }

    txtArea.value = "📍 Buscando localização...";
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const link = `https://www.google.com/maps?q=${lat},${lng}`;
            
            txtArea.value = `Minha Localização: ${link}\n(Ponto de referência: ...)`;
            salvarEnderecoManual(txtArea.value);
        },
        (error) => {
            let msg = "Erro ao obter localização.";
            if(error.code === 1) msg = "Permissão de localização negada. Digite o endereço manualmente.";
            alert(msg);
            txtArea.value = "";
        }
    );
}

function salvarEnderecoManual(texto) {
    const cidade = AppState.dadosEntrega.cidade;
    AppState.dadosEntrega.detalhe = `${cidade} - Local: ${texto}`;
    // Atualiza o resumo do pagamento se já estiver renderizado
    if(document.querySelector('.resumo-final')) RenderPagamento(); 
}

function salvarEnderecoEnvio(texto) {
    AppState.dadosEntrega.detalhe = `Transportadora - Endereço: ${texto}`;
}
