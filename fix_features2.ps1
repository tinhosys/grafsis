$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

# 1. viewItemDetails + renderActiveItemsHtml
$oldViewItem = '(?s)viewItemDetails\(idx\)\s*\{.*?\}\s*,\s*recalcTotals\(source'
$newViewItem = @'
    viewItemDetails(idx) {
      const it = this.activeItems[idx];
      if(!it) return;
      const modalHtml = `
        <div id="item-details-modal" class="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onclick="document.getElementById('item-details-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 class="font-black text-xl text-slate-800 mb-4 border-b pb-2">Detalhes do Item <span class="text-blue-600">#${it.item_id || 'N/A'}</span></h3>
            
            <div class="flex flex-col md:flex-row gap-4 mb-4">
              <div class="w-full md:w-1/3 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-2 min-h-[150px]">
                ${it.arte_url ? `<img src="${it.arte_url}" class="max-w-full max-h-[200px] object-contain rounded shadow-sm">` : `<span class="text-slate-400 text-sm text-center">Nenhuma arte<br>anexada</span>`}
              </div>
              <div class="w-full md:w-2/3 space-y-2 text-sm text-slate-700">
                <p><strong class="text-slate-900">Produto:</strong> ${it.produto_nome}</p>
                <p><strong class="text-slate-900">Detalhes:</strong> ${it.descricao}</p>
                <p><strong class="text-slate-900">C\u00E1lculo:</strong> <span class="uppercase">${it.tipo_calculo}</span></p>
                <p><strong class="text-slate-900">Dimens\u00F5es:</strong> ${it.largura_x}m x ${it.comprimento_y}m</p>
                <p><strong class="text-slate-900">Quantidade:</strong> ${it.quantidade}</p>
                <p><strong class="text-slate-900">\u00C1rea Total:</strong> ${it.tipo_calculo !== 'unidade' ? (it.area_m2 * it.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + (it.tipo_calculo === 'm2' ? ' m\u00B2' : ' m') : '-'}</p>
                <p><strong class="text-slate-900">Valor Unit\u00E1rio:</strong> R$ ${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <div class="font-black text-green-700 text-lg border-t pt-2 mt-2 flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 flex justify-between gap-2">
                <button onclick="salesModule.printItemPDF(${idx})" class="px-4 py-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 font-bold text-slate-700 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Gerar Relat\u00F3rio PDF A4
                </button>
                <button onclick="document.getElementById('item-details-modal').remove()" class="px-6 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-lg transition-colors">Fechar</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    },
    renderActiveItemsHtml() {
      if (!this.activeItems || this.activeItems.length === 0) {
        return `<tr><td colspan="7" class="p-4 text-center text-slate-400 font-semibold bg-slate-50">Nenhum item adicionado ao pedido.</td></tr>`;
      }
      return this.activeItems.map((it, idx) => `
        <tr class="border-b hover:bg-slate-50 transition">
          <td class="p-2">
            ${it.arte_url ? `<a href="${it.arte_url}" target="_blank" class="block w-8 h-8 rounded bg-slate-200 float-left mr-2 bg-cover bg-center border border-slate-300" style="background-image: url('${it.arte_url}')" title="Ver Layout"></a>` : `<div class="block w-8 h-8 rounded bg-slate-100 float-left mr-2 border border-slate-200 flex items-center justify-center text-[8px] text-slate-400">N/A</div>`}
            <div class="font-bold text-xs text-slate-800"><span class="text-[10px] font-mono bg-blue-100 text-blue-800 px-1 rounded mr-1 cursor-pointer hover:bg-blue-200" onclick="salesModule.viewItemDetails(${idx})" title="Ver Detalhes do Item e Arte">#${it.item_id || '----'}</span>${it.produto_nome || ''}</div>
            <div class="text-[10px] text-slate-500">${it.descricao}</div>
          </td>
          <td class="p-2 font-mono text-[11px]">${it.tipo_calculo === 'm2' ? it.largura_x + 'm x ' + it.comprimento_y + 'm' : (it.tipo_calculo === 'linear' ? it.largura_x + 'm linear' : 'UNID')}</td>
          <td class="p-2 font-bold text-center">${it.quantidade}</td>
          <td class="p-2 font-mono text-[11px] text-purple-700">${it.tipo_calculo !== 'unidade' ? (it.area_m2 * it.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + (it.tipo_calculo === 'm2' ? ' m\u00B2' : ' m') : '-'}</td>
          <td class="p-2 font-mono text-[11px]">R$ ${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="p-2 font-bold text-blue-700">R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="p-2 text-right"><button type="button" onclick="salesModule.removeItem(${idx})" class="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded">&times;</button></td>
        </tr>
      `).join('');
    },
    recalcTotals(source
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldViewItem, $newViewItem)

# 2. openFinanceModal + confirmFinance
$oldFinance = '(?s)openFinanceModal\(\) \{.*?updateFinanceSummary\(recebido, total\) \{'
$newFinance = @'
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
    const parcelasAtual = document.getElementById('order-parcelas')?.value || '1';
    const obsAtual = document.getElementById('order-obs-pagto')?.value || '';
    
    const parcelasOptions = [2,3,4,5,6,7,8,9,10,11,12].map(p => `<option value="${p}" ${parseInt(parcelasAtual)===p ? 'selected':''}>${p}x parcelas</option>`).join('');

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
                <select id="fm-metodo" class="w-full p-3 border border-slate-300 rounded-lg font-bold text-sm bg-white" onchange="document.getElementById('fm-parcelas-div').style.display = this.value === 'Cart\\u00E3o de cr\\u00E9dito / Parcelado' ? 'block' : 'none'">
                  <option value="Dinheiro / Cash" ${metodoAtual === 'Dinheiro / Cash' ? 'selected' : ''}>Dinheiro / Cash</option>
                  <option value="Cart\u00E3o de cr\u00E9dito / A vista" ${metodoAtual === 'Cart\u00E3o de cr\u00E9dito / A vista' ? 'selected' : ''}>Cart\u00E3o de cr\u00E9dito / A vista</option>
                  <option value="Cart\u00E3o de cr\u00E9dito / Parcelado" ${metodoAtual === 'Cart\u00E3o de cr\u00E9dito / Parcelado' ? 'selected' : ''}>Cart\u00E3o de cr\u00E9dito / Parcelado</option>
                  <option value="D\u00E9bito" ${metodoAtual === 'D\u00E9bito' ? 'selected' : ''}>D\u00E9bito</option>
                  <option value="Pix" ${metodoAtual === 'Pix' ? 'selected' : ''}>Pix</option>
                  <option value="Permuta" ${metodoAtual === 'Permuta' ? 'selected' : ''}>Permuta</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-1 text-slate-600">Valor Recebido R$</label>
                <input type="number" id="fm-recebido" step="0.01" class="w-full p-3 border-2 border-yellow-400 rounded-lg font-black text-green-700 text-lg text-center bg-yellow-50 focus:outline-none focus:ring-4 focus:ring-yellow-200" value="${recebido.toFixed(2)}" oninput="salesModule.updateModalRestante(${finalTotal})">
              </div>
            </div>

            <div id="fm-parcelas-div" style="display: ${metodoAtual === 'Cart\u00E3o de cr\u00E9dito / Parcelado' ? 'block' : 'none'};">
              <label class="block text-xs font-bold mb-1 text-slate-600">Parcelas</label>
              <select id="fm-parcelas" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold text-blue-700">
                ${parcelasOptions}
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 text-slate-600">Observa\u00E7\u00E3o</label>
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
    
    let parcelas = '1';
    const fmParcelas = document.getElementById('fm-parcelas');
    if (fmParcelas) parcelas = fmParcelas.value;
    
    const inputRec = document.getElementById('order-valor-recebido');
    if(inputRec) inputRec.value = recebido;
    
    let inputMetodo = document.getElementById('order-metodo-pagto');
    if(inputMetodo) inputMetodo.value = metodo;

    let inputParcelas = document.getElementById('order-parcelas');
    if (!inputParcelas && document.getElementById('order-form')) {
      inputParcelas = document.createElement('input');
      inputParcelas.type = 'hidden';
      inputParcelas.id = 'order-parcelas';
      inputParcelas.name = 'parcelas';
      document.getElementById('order-form').appendChild(inputParcelas);
    }
    if(inputParcelas) inputParcelas.value = metodo.includes('Parcelado') ? parcelas : '1';

    let inputObs = document.getElementById('order-obs-pagto');
    if(inputObs) inputObs.value = obs;
    
    this.updateFinanceSummary(recebido, finalTotal);
    document.getElementById('finance-modal').remove();
  },
  updateFinanceSummary(recebido, total) {
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldFinance, $newFinance)

# 3. Add printOrder before calcPiecePriceOLD
$oldPrintReceipt = '(?s)printReceipt\(\) \{.*?calcPiecePriceOLD\(\) \{'
$newPrintReceipt = @'
  printItemPDF(idx) {
    const it = this.activeItems[idx];
    if(!it) return;
    const conf = window.store?.getSettings ? window.store.getSettings() : {};
    const companyName = conf.empresa_nome || 'Sua Empresa';
    const companyLogo = conf.empresa_logo || '';
    const logoHtml = companyLogo ? `<img src="${companyLogo}" style="max-height: 60px;">` : `<h2>${companyName}</h2>`;
    const orderIdStr = document.getElementById('current-display-id')?.value || '----';
    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientName = clientSelect && clientSelect.selectedIndex > 0 ? clientSelect.options[clientSelect.selectedIndex].text : 'Consumidor Final';

    const pdfHtml = `
      <html><head><title>Ficha de Item - #${it.item_id || '----'}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; color: #1e40af; }
        .grid { display: flex; gap: 40px; }
        .col-img { flex: 0 0 300px; }
        .col-img img { max-width: 100%; max-height: 400px; border: 1px solid #ddd; padding: 5px; border-radius: 8px; }
        .col-details { flex: 1; font-size: 16px; }
        .row { margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
        .label { font-weight: bold; color: #555; width: 140px; display: inline-block; }
        .val { color: #000; font-weight: 500; }
        .total { font-size: 22px; font-weight: bold; color: #15803d; margin-top: 20px; border-top: 2px solid #15803d; padding-top: 10px; display: inline-block; }
        @media print { body { padding: 0; } }
      </style>
      </head><body>
        <div class="header">
          ${logoHtml}
          <div class="title">Relat\u00F3rio de Item #${it.item_id || '----'}</div>
        </div>
        <div style="margin-bottom: 20px; font-size: 18px;">
          <strong>Pedido:</strong> ${orderIdStr} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Cliente:</strong> ${clientName}
        </div>
        <div class="grid">
          <div class="col-img">
            ${it.arte_url ? `<img src="${it.arte_url}">` : `<div style="padding: 100px 20px; text-align: center; border: 1px dashed #ccc; color: #999;">Sem Arte Anexada</div>`}
          </div>
          <div class="col-details">
            <div class="row"><span class="label">Produto:</span><span class="val">${it.produto_nome}</span></div>
            <div class="row"><span class="label">Detalhes:</span><span class="val">${it.descricao}</span></div>
            <div class="row"><span class="label">C\u00E1lculo:</span><span class="val uppercase">${it.tipo_calculo}</span></div>
            <div class="row"><span class="label">Dimens\u00F5es:</span><span class="val">${it.largura_x}m x ${it.comprimento_y}m</span></div>
            <div class="row"><span class="label">Quantidade:</span><span class="val">${it.quantidade}</span></div>
            <div class="row"><span class="label">\u00C1rea Total:</span><span class="val">${it.tipo_calculo !== 'unidade' ? (it.area_m2 * it.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + (it.tipo_calculo === 'm2' ? ' m\u00B2' : ' m') : '-'}</span></div>
            <div class="row"><span class="label">Valor Unit\u00E1rio:</span><span class="val">R$ ${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
            <div class="total">Subtotal do Item: R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
        </div>
        <script>window.print();</script>
      </body></html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfHtml);
    printWindow.document.close();
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
    const companyAddress = conf.empresa_endereco || 'Endere\u00E7o n\u00E3o informado';
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
        <p style="font-size: 11px; margin-top: 10px;">C\u00F3d. de Valida\u00E7\u00E3o: ${codValidacao}</p>
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
  printOrder(type) {
    const orderIdStr = document.getElementById('current-display-id')?.value || 'NOVO PEDIDO';
    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientName = clientSelect && clientSelect.selectedIndex > 0 ? clientSelect.options[clientSelect.selectedIndex].text : 'Consumidor Final';
    const dateStr = new Date().toLocaleString('pt-BR');
    
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const discount = parseFloat(document.getElementById('order-discount')?.value) || 0;
    const finalTotal = Math.max(0, subtotal - discount);

    const conf = window.store?.getSettings ? window.store.getSettings() : {};
    const companyName = conf.empresa_nome || 'Sua Empresa';
    const companyLogo = conf.empresa_logo || '';
    const logoHtml = companyLogo ? `<img src="${companyLogo}" style="max-height: 60px;">` : `<h2>${companyName}</h2>`;

    const title = type === 'os' ? 'Ordem de Servi\u00E7o' : 'Pedido de Venda / Or\u00E7amento';

    const itemsHtml = this.activeItems.map((it, idx) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px;">${idx+1}</td>
        <td style="padding: 8px;"><strong>${it.produto_nome}</strong><br><span style="font-size: 12px; color: #555;">${it.descricao}</span></td>
        <td style="padding: 8px;">${it.largura_x}m x ${it.comprimento_y}m</td>
        <td style="padding: 8px; text-align: center;">${it.quantidade}</td>
        <td style="padding: 8px; text-align: right;">R$ ${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      </tr>
    `).join('');

    const pdfHtml = `
      <html><head><title>${title} - ${orderIdStr}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #1e40af; text-transform: uppercase; }
        .info-grid { display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
        table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
        th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1; font-size: 14px; }
        .totals { margin-left: auto; width: 300px; text-align: right; font-size: 16px; }
        .totals .row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 4px; }
        .totals .final { font-size: 20px; font-weight: bold; color: #15803d; border-bottom: none; }
        @media print { body { padding: 0; } }
      </style>
      </head><body>
        <div class="header">
          ${logoHtml}
          <div class="title">${title} #${orderIdStr}</div>
        </div>
        <div class="info-grid">
          <div><strong>Cliente:</strong> ${clientName}</div>
          <div><strong>Data:</strong> ${dateStr}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Produto / Descri\u00E7\u00E3o</th>
              <th>Dimens\u00F5es</th>
              <th style="text-align: center;">Qtd</th>
              <th style="text-align: right;">V. Unit</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="totals">
          <div class="row"><span>Subtotal:</span> <span>R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
          <div class="row"><span>Desconto:</span> <span>R$ ${discount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
          <div class="row final"><span>Total Geral:</span> <span>R$ ${finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        </div>
        <script>window.print();</script>
      </body></html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfHtml);
    printWindow.document.close();
  },
  calcPiecePriceOLD() {
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldPrintReceipt, $newPrintReceipt)

# 4. Modify FINALIZAR PEDIDO block
$oldButtons = '(?s)<button type="submit" class="px-8 py-3 text-sm bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md uppercase transition">\$\{isEdit \? .Atualizar Pedido. : .Finalizar Pedido.\}</button>\s*</div>'
$newButtons = @'
                  <button type="submit" class="px-8 py-3 text-sm bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md uppercase transition">${isEdit ? 'Atualizar Pedido' : 'Finalizar Pedido'}</button>
                  <button type="button" onclick="salesModule.printOrder('pedido')" class="px-6 py-3 text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition shadow-sm flex items-center gap-2" title="Emitir Pedido de Venda A4">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Emitir Pedido
                  </button>
                  <button type="button" onclick="salesModule.printOrder('os')" class="px-6 py-3 text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold rounded-xl transition shadow-sm flex items-center gap-2" title="Emitir Ordem de Servi\u00E7o A4">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Emitir O.S.
                  </button>
                </div>
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldButtons, $newButtons)

# Clean up other generic zombie characters safely using exact JS replacements where they leak
$content = $content.Replace("Cartǟo", "Cart\u00E3o")
$content = $content.Replace("crǟdito", "cr\u00E9dito")
$content = $content.Replace("Dǟbito", "D\u00E9bito")
$content = $content.Replace("Cǟlculo", "C\u00E1lculo")
$content = $content.Replace("Dimensǟes", "Dimens\u00F5es")
$content = $content.Replace("ǟ?rea Total", "\u00C1rea Total")
$content = $content.Replace("Unitǟrio", "Unit\u00E1rio")
$content = $content.Replace("Carto", "Cart\u00E3o")
$content = $content.Replace("crdito", "cr\u00E9dito")
$content = $content.Replace("Dbito", "D\u00E9bito")
$content = $content.Replace("Peǟa", "Pe\u00E7a")
$content = $content.Replace("Pe.a:", "Pe\u00E7a:")

# Important! Make sure the file is written with UTF8 NO BOM!
$utf8NoBom = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, $utf8NoBom)
