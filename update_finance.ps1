$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

# 1. Update the hidden fields in the render function HTML
$oldSummaryHtml = '<input type="hidden" id="order-valor-recebido" value="\$\{order \? \(order.valor_recebido \|\| 0\) : 0\}">\s*<\/div>'
$newSummaryHtml = @'
<input type="hidden" id="order-valor-recebido" value="${order ? (order.valor_recebido || 0) : 0}">
<input type="hidden" id="order-metodo-pagto" name="forma_pagamento" value="${order ? (order.forma_pagamento || '') : ''}">
<input type="hidden" id="order-obs-pagto" name="obs_pagto" value="${order ? (order.obs_pagto || '') : ''}">
</div>
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldSummaryHtml, $newSummaryHtml)

# 2. Replace the old duplicated openFinanceModal block
$oldBlock = '(?s)openFinanceModal\(\) \{.*?calcPiecePriceOLD\(\) \{'

$newBlock = @'
  openFinanceModal() {
    const orderIdStr = document.getElementById('current-display-id')?.value || 'NOVO PEDIDO';
    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientName = clientSelect && clientSelect.selectedIndex > 0 ? clientSelect.options[clientSelect.selectedIndex].text : 'Consumidor Final';
    
    const total = parseFloat(document.getElementById('order-total-final').innerText.replace('R$ ', '')) || 0;
    const recebido = parseFloat(document.getElementById('order-valor-recebido')?.value) || 0;
    const restante = Math.max(0, total - recebido);
    
    const dateStr = new Date().toLocaleString('pt-BR');
    const metodoAtual = document.getElementById('order-metodo-pagto')?.value || 'Dinheiro';
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
              <span>Valor do Pedido:</span> <span>R$ ${total.toFixed(2)}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1 text-slate-600">Meio de Pagto</label>
                <select id="fm-metodo" class="w-full p-3 border border-slate-300 rounded-lg font-bold text-sm bg-white">
                  <option value="Dinheiro" ${metodoAtual === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
                  <option value="Pix" ${metodoAtual === 'Pix' ? 'selected' : ''}>Pix</option>
                  <option value="Cartão de Crédito" ${metodoAtual === 'Cartão de Crédito' ? 'selected' : ''}>Cartão de Crédito</option>
                  <option value="Cartão de Débito" ${metodoAtual === 'Cartão de Débito' ? 'selected' : ''}>Cartão de Débito</option>
                  <option value="Transferência" ${metodoAtual === 'Transferência' ? 'selected' : ''}>Transferência</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-1 text-slate-600">Valor Recebido R$</label>
                <input type="number" id="fm-recebido" step="0.01" class="w-full p-3 border-2 border-yellow-400 rounded-lg font-black text-green-700 text-lg text-center bg-yellow-50 focus:outline-none focus:ring-4 focus:ring-yellow-200" value="${recebido.toFixed(2)}" oninput="salesModule.updateModalRestante(${total})">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 text-slate-600">Observação / NSU</label>
              <input type="text" id="fm-obs" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Detalhes do pagamento..." value="${obsAtual}">
            </div>
            
            <div class="flex justify-between items-center font-bold text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
              <span>Valor a Receber (Restante):</span> <span id="fm-restante">R$ ${restante.toFixed(2)}</span>
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
    document.getElementById('fm-restante').innerText = `R$ ${rest.toFixed(2)}`;
  },
  confirmFinance() {
    const recebido = parseFloat(document.getElementById('fm-recebido').value) || 0;
    const total = parseFloat(document.getElementById('order-total-final').innerText.replace('R$ ', '')) || 0;
    const metodo = document.getElementById('fm-metodo').value;
    const obs = document.getElementById('fm-obs').value;
    
    const inputRec = document.getElementById('order-valor-recebido');
    if(inputRec) inputRec.value = recebido;
    
    let inputMetodo = document.getElementById('order-metodo-pagto');
    if(inputMetodo) inputMetodo.value = metodo;

    let inputObs = document.getElementById('order-obs-pagto');
    if(inputObs) inputObs.value = obs;
    
    this.updateFinanceSummary(recebido, total);
    document.getElementById('finance-modal').remove();
  },
  updateFinanceSummary(recebido, total) {
    const summaryEl = document.getElementById('finance-summary');
    const textEl = document.getElementById('finance-received-text');
    if (!summaryEl || !textEl) return;
    
    if (recebido > 0) {
      summaryEl.classList.remove('hidden');
      const perc = total > 0 ? ((recebido / total) * 100).toFixed(1) : 0;
      textEl.innerText = `R$ ${recebido.toFixed(2)} (${perc}%)`;
    } else {
      summaryEl.classList.add('hidden');
    }
  },
  printReceipt() {
    const orderIdStr = document.getElementById('current-display-id')?.value || 'NOVO PEDIDO';
    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientName = clientSelect && clientSelect.selectedIndex > 0 ? clientSelect.options[clientSelect.selectedIndex].text : 'Consumidor Final';
    const total = parseFloat(document.getElementById('order-total-final').innerText.replace('R$ ', '')) || 0;
    const recebido = parseFloat(document.getElementById('fm-recebido')?.value || document.getElementById('order-valor-recebido')?.value || 0);
    const restante = Math.max(0, total - recebido);
    const method = document.getElementById('fm-metodo')?.value || 'Dinheiro';
    const obs = document.getElementById('fm-obs')?.value || '';
    const dateStr = new Date().toLocaleString('pt-BR');
    const companyName = window.store?.getSettings()?.companyName || 'Sua Empresa';
    
    const receiptHtml = `
      <html><head><title>Recibo</title>
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
        <h2>RECIBO</h2>
        <div class="bold" style="font-size:16px; margin-bottom: 10px;">${companyName}</div>
        <div class="line"></div>
        <div class="text-left">
          <p><strong>Pedido ID:</strong> ${orderIdStr}</p>
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Data:</strong> ${dateStr}</p>
        </div>
        <div class="line"></div>
        <div class="text-left">
          <p>Recebemos a quantia de:</p>
          <h2 style="text-align:center; margin: 15px 0;">R$ ${recebido.toFixed(2)}</h2>
          <p><strong>Forma Pagto:</strong> ${method}</p>
          ${obs ? `<p><strong>Obs:</strong> ${obs}</p>` : ''}
        </div>
        <div class="line"></div>
        <div class="flex"><span class="bold">Valor Total:</span> <span>R$ ${total.toFixed(2)}</span></div>
        <div class="flex"><span class="bold">Valor Recebido:</span> <span>R$ ${recebido.toFixed(2)}</span></div>
        <div class="flex"><span class="bold">Restante:</span> <span>R$ ${restante.toFixed(2)}</span></div>
        <div class="line"></div>
        <br><br><br>
        <p style="font-size: 12px;">_________________________________</p>
        <p style="font-size: 12px;">Assinatura do Recebedor</p>
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

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldBlock, $newBlock)

# Need to make sure saveOrder captures obs_pagto. Currently saveOrder creates orderData.
$oldSaveData = '(?s)forma_pagamento:\s*formData.get\(''forma_pagamento''\) \|\| ''Pix'',\s*status_pagamento:\s*formData.get\(''status_pagamento''\) \|\| ''pendente'',\s*valor_recebido:\s*parseFloat\(document.getElementById\("order-valor-recebido"\)\?.value\) \|\| 0\,'

$newSaveData = @'
        forma_pagamento: formData.get('forma_pagamento') || 'Dinheiro',
        obs_pagto: formData.get('obs_pagto') || '',
        status_pagamento: parseFloat(document.getElementById("order-valor-recebido")?.value) > 0 ? 'parcial' : 'pendente',
        valor_recebido: parseFloat(document.getElementById("order-valor-recebido")?.value) || 0,
'@

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldSaveData, $newSaveData)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, [System.Text.Encoding]::UTF8)

