$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

# 1. Replace the entire openFinanceModal up to calcPiecePriceOLD
$oldModal = '(?s)openFinanceModal\(\) \{.*?calcPiecePriceOLD\(\) \{'

$newModal = @'
  numeroPorExtenso(v) {
    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
    const milhares = ["", "mil", "milhões", "bilhões"];
    if (v === 0) return "zero reais";
    let reais = Math.floor(v);
    let centavos = Math.round((v - reais) * 100);
    function converteGrupo(n) {
        if (n === 100) return "cem";
        let c = Math.floor(n / 100); let d = Math.floor((n % 100) / 10); let u = n % 10;
        let res = [];
        if (c > 0) res.push(centenas[c]);
        if (d === 1) res.push(unidades[n % 100]);
        else {
            if (d > 1) res.push(dezenas[d]);
            if (u > 0) res.push(unidades[u]);
        }
        return res.join(" e ");
    }
    let partes = [];
    if (reais > 0) {
        let rStr = reais.toString(); let grupos = [];
        while (rStr.length > 0) { grupos.push(parseInt(rStr.slice(-3))); rStr = rStr.slice(0, -3); }
        for (let i = 0; i < grupos.length; i++) {
            if (grupos[i] > 0) {
                let gStr = converteGrupo(grupos[i]);
                if (i === 1 && grupos[i] === 1) gStr = "mil";
                else if (i > 0) gStr += " " + milhares[i];
                partes.unshift(gStr);
            }
        }
        let reaisStr = partes.join(" e ") + (reais === 1 ? " real" : " reais");
        partes = [reaisStr];
    }
    if (centavos > 0) partes.push(converteGrupo(centavos) + (centavos === 1 ? " centavo" : " centavos"));
    return partes.join(" e ");
  },
  openFinanceModal() {
    const orderIdStr = document.getElementById('current-display-id')?.value || 'NOVO PEDIDO';
    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientName = clientSelect && clientSelect.selectedIndex > 0 ? clientSelect.options[clientSelect.selectedIndex].text : 'Consumidor Final';
    
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const discount = parseFloat(document.getElementById('order-discount')?.value) || 0;
    const finalTotal = Math.max(0, subtotal - discount);

    const recebido = parseFloat(document.getElementById('order-valor-recebido')?.value) || 0;
    const restante = Math.max(0, finalTotal - recebido);
    
    const dateStr = new Date().toLocaleString('pt-BR');
    const metodoAtual = document.getElementById('order-metodo-pagto')?.value || 'Dinheiro / Cash';
    const obsAtual = document.getElementById('order-obs-pagto')?.value || '';
    
    const modalHtml = `
      <div id="finance-modal" class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <h3 class="font-black text-xl text-slate-800 mb-4 border-b pb-2 text-center text-yellow-600">Recebimento Financeiro</h3>
          
          <div class="space-y-3 mb-4 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div class="flex justify-between"><strong>ID do Pedido:</strong> <span class="font-mono bg-white px-2 rounded border border-slate-300 shadow-sm">${orderIdStr}</span></div>
            <div class="flex justify-between"><strong>Cliente:</strong> <span class="font-bold text-blue-800">${clientName}</span></div>
            <div class="flex justify-between"><strong>Data:</strong> <span>${dateStr}</span></div>
          </div>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center font-black text-lg text-slate-800 bg-blue-50 p-3 rounded border border-blue-100">
              <span>Valor do Pedido:</span> <span>R$ ${finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1 text-slate-600">Meio de Pagto</label>
                <select id="fm-metodo" class="w-full p-3 border border-slate-300 rounded-lg font-bold text-sm bg-white">
                  <option value="Dinheiro / Cash" ${metodoAtual === 'Dinheiro / Cash' ? 'selected' : ''}>Dinheiro / Cash</option>
                  <option value="Cartão de crédito / A vista" ${metodoAtual === 'Cartão de crédito / A vista' ? 'selected' : ''}>Cartão de crédito / A vista</option>
                  <option value="Cartão de crédito / Parcelado" ${metodoAtual === 'Cartão de crédito / Parcelado' ? 'selected' : ''}>Cartão de crédito / Parcelado</option>
                  <option value="Débito" ${metodoAtual === 'Débito' ? 'selected' : ''}>Débito</option>
                  <option value="Pix" ${metodoAtual === 'Pix' ? 'selected' : ''}>Pix</option>
                  <option value="Permuta" ${metodoAtual === 'Permuta' ? 'selected' : ''}>Permuta</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-1 text-slate-600">Valor Recebido R$</label>
                <input type="number" id="fm-recebido" step="0.01" class="w-full p-3 border-2 border-yellow-400 rounded-lg font-black text-green-700 text-lg text-center bg-yellow-50 focus:outline-none focus:ring-4 focus:ring-yellow-200" value="${recebido.toFixed(2)}" oninput="salesModule.updateModalRestante(${finalTotal})">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 text-slate-600">Observação</label>
              <input type="text" id="fm-obs" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Detalhes do pagamento..." value="${obsAtual}">
            </div>
            
            <div class="flex justify-between items-center font-bold text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
              <span>Valor a Receber (Restante):</span> <span id="fm-restante">R$ ${restante.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
          
          <div class="mt-6 pt-4 border-t flex flex-col gap-2">
            <button onclick="salesModule.confirmFinance()" class="w-full py-3 text-sm bg-green-600 text-white font-black rounded-lg shadow hover:bg-green-700 uppercase transition-colors">Confirmar Recebimento</button>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <button onclick="salesModule.printReceipt()" class="py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Gerar Recibo
              </button>
              <button onclick="document.getElementById('finance-modal').remove()" class="py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Voltar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },
  updateModalRestante(total) {
    const rec = parseFloat(document.getElementById('fm-recebido').value) || 0;
    const rest = Math.max(0, total - rec);
    document.getElementById('fm-restante').innerText = `R$ ${rest.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  },
  confirmFinance() {
    const recebido = parseFloat(document.getElementById('fm-recebido').value) || 0;
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const discount = parseFloat(document.getElementById('order-discount')?.value) || 0;
    const finalTotal = Math.max(0, subtotal - discount);

    const metodo = document.getElementById('fm-metodo').value;
    const obs = document.getElementById('fm-obs').value;
    
    const inputRec = document.getElementById('order-valor-recebido');
    if(inputRec) inputRec.value = recebido;
    
    let inputMetodo = document.getElementById('order-metodo-pagto');
    if(inputMetodo) inputMetodo.value = metodo;

    let inputObs = document.getElementById('order-obs-pagto');
    if(inputObs) inputObs.value = obs;
    
    this.updateFinanceSummary(recebido, finalTotal);
    document.getElementById('finance-modal').remove();
  },
  updateFinanceSummary(recebido, total) {
    const summaryEl = document.getElementById('finance-summary');
    const textEl = document.getElementById('finance-received-text');
    if (!summaryEl || !textEl) return;
    
    if (recebido > 0) {
      summaryEl.classList.remove('hidden');
      const perc = total > 0 ? ((recebido / total) * 100).toFixed(1) : 0;
      textEl.innerText = `R$ ${recebido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${perc}%)`;
    } else {
      summaryEl.classList.add('hidden');
    }
  },
  printReceipt() {
    const orderIdStr = document.getElementById('current-display-id')?.value || 'NOVO PEDIDO';
    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientName = clientSelect && clientSelect.selectedIndex > 0 ? clientSelect.options[clientSelect.selectedIndex].text : 'Consumidor Final';
    
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const discount = parseFloat(document.getElementById('order-discount')?.value) || 0;
    const total = Math.max(0, subtotal - discount);

    const recebido = parseFloat(document.getElementById('fm-recebido')?.value || document.getElementById('order-valor-recebido')?.value || 0);
    const restante = Math.max(0, total - recebido);
    const method = document.getElementById('fm-metodo')?.value || 'Dinheiro / Cash';
    const obs = document.getElementById('fm-obs')?.value || '';
    const dateStr = new Date().toLocaleString('pt-BR');
    const valExtenso = this.numeroPorExtenso(recebido);
    const codValidacao = btoa(orderIdStr + '-' + Date.now()).substring(0, 12).toUpperCase();

    const conf = window.store?.getSettings ? window.store.getSettings() : {};
    const companyName = conf.empresa_nome || 'Sua Empresa';
    const companyCNPJ = conf.empresa_cnpj || '00.000.000/0001-00';
    const companyAddress = conf.empresa_endereco || 'Endereço não informado';
    const companyPhone = conf.empresa_telefone || '(00) 0000-0000';
    const city = conf.empresa_cidade || 'Sua Cidade';
    const companyLogo = conf.empresa_logo || '';
    
    const logoHtml = companyLogo ? `<img src="${companyLogo}" style="max-width: 150px; margin: 0 auto 10px auto; display: block;">` : '';

    const receiptHtml = `
      <html><head><title>Recibo - ${orderIdStr}</title>
      <style>
        body { font-family: monospace; padding: 20px; text-align: center; color: #000; }
        .receipt { max-width: 350px; margin: 0 auto; border: 1px dashed #000; padding: 20px; }
        .line { border-bottom: 1px dashed #000; margin: 12px 0; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .flex { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .bold { font-weight: bold; }
        h2 { margin: 0 0 10px 0; font-size: 20px; }
        p { margin: 4px 0; font-size: 14px; }
        @media print {
            body { padding: 0; }
            .receipt { border: none; padding: 0; max-width: 100%; width: 300px; }
        }
      </style>
      </head><body>
      <div class="receipt">
        ${logoHtml}
        <h2>RECIBO</h2>
        <div class="bold" style="font-size:16px;">${companyName}</div>
        <div style="font-size: 12px;">CNPJ: ${companyCNPJ}</div>
        <div style="font-size: 12px;">${companyAddress} - ${city}</div>
        <div style="font-size: 12px;">Tel: ${companyPhone}</div>
        <div class="line"></div>
        <div class="text-left">
          <p><strong>Pedido ID:</strong> ${orderIdStr}</p>
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Data:</strong> ${dateStr}</p>
        </div>
        <div class="line"></div>
        <div class="text-left">
          <p>Recebemos de ${clientName} a quantia de:</p>
          <h2 style="text-align:center; margin: 15px 0;">R$ ${recebido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
          <p style="text-align:center; font-style: italic; font-size: 12px;">(${valExtenso})</p>
          <p><strong>Forma Pagto:</strong> ${method}</p>
          ${obs ? `<p><strong>Obs:</strong> ${obs}</p>` : ''}
        </div>
        <div class="line"></div>
        <div class="flex"><span class="bold">Valor Total:</span> <span>R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        <div class="flex"><span class="bold">Valor Recebido:</span> <span>R$ ${recebido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        <div class="flex"><span class="bold">Restante:</span> <span>R$ ${restante.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        <div class="line"></div>
        <p style="font-size: 11px; margin-top: 10px;">Cód. de Validação: ${codValidacao}</p>
        <br><br><br>
        <p style="font-size: 12px;">_________________________________</p>
        <p style="font-size: 12px; margin-top: 5px;">Assinatura do Recebedor</p>
      </div>
      <script>window.print();</script>
      </body></html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  },
  calcPiecePriceOLD() {
'@

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldModal, $newModal)

# 2. Format Currency Fixes elsewhere
$content = $content.Replace("innerText = 'R$ ' + subtotal.toFixed(2)", "innerText = 'R$ ' + subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})")
$content = $content.Replace("innerText = 'R$ ' + finalTotal.toFixed(2)", "innerText = 'R$ ' + finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})")
$content = $content.Replace("R$ `${(piecePrice * qty).toFixed(2)}", "R$ `${(piecePrice * qty).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${piecePrice.toFixed(2)}", "R$ `${piecePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${Number(it.preco_unitario).toFixed(2)}", "R$ `${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${Number(it.valor_total).toFixed(2)}", "R$ `${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ ' + Number(it.valor_total).toFixed(2)", "R$ ' + Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})")
$content = $content.Replace("R$ ' + Number(order.valor_final).toFixed(2)", "R$ ' + Number(order.valor_final).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})")
$content = $content.Replace("R$ `${Number(o.valor_final).toFixed(2)}", "R$ `${Number(o.valor_final).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ 0.00", "R$ 0,00")

# Write file using UTF8 No BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, $utf8NoBom)
