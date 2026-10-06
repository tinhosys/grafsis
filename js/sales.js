window.salesModule = {
  activeItems: [],
  render() {
    const orders = window.store.getOrders();
    const clients = window.store.getClients();
    const container = document.getElementById('view-container');
    let html = `
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-black text-slate-800">Vendas & Pre-Vendas</h1>
          <p class="text-slate-500 text-sm">Emissao de orcamentos, vendas, layouts e protocolos</p>
        </div>
        <button onclick="salesModule.openModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">Novo Orcamento / Venda</button>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
            <tr><th class="p-4">Codigo</th><th class="p-4">Cliente</th><th class="p-4">Valor</th><th class="p-4">Fase</th><th class="p-4 text-right">Acoes</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
    `;
    if (orders.length === 0) { html += `<tr><td colspan="5" class="p-8 text-center text-slate-500">Nenhum pedido encontrado.</td></tr>`; }
    
    orders.forEach(o => {
      const c = clients.find(cl => cl.id === o.cliente_id);
      const cName = c ? c.nome : 'Desconhecido';
      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-4 font-mono font-bold text-blue-600">#${o.numero || o.id.substring(0,6)}</td>
          <td class="p-4 font-bold text-slate-800 uppercase">${cName}</td>
          <td class="p-4 font-bold text-slate-800">R$ ${Number(o.valor_final).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="p-4">${this.getPhaseBadge(o.status_fase)}</td>
          <td class="p-4 text-right space-x-2">
            <button onclick="salesModule.quickView('${o.id}')" class="text-slate-600 font-bold hover:underline">Ver</button>
            <button onclick="salesModule.openModal({orderId: '${o.id}'})" class="text-blue-600 font-bold hover:underline">Editar</button>
            <button onclick="salesModule.openProtocolModal('${o.id}')" class="text-emerald-600 font-bold hover:underline">OS/Protocolo</button>
            <button onclick="financeModule.openCashierModal('${o.id}')" class="text-yellow-600 font-bold hover:underline bg-yellow-50 px-2 py-1 rounded">💰 Caixa</button>
            <button onclick="salesModule.delete('${o.id}')" class="text-red-500 font-bold hover:underline">Excluir</button>
          </td>
        </tr>
      `;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
  },
  getPhaseBadge(phase) {
    const badges = {
      'orcamento': '<span class="px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-[10px] font-black uppercase">1. ORCAMENTO</span>',
      'prevenda': '<span class="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-black uppercase">2. PRE-VENDA</span>',
      'aprovacao': '<span class="px-2 py-1 bg-pink-400 text-white rounded text-[10px] font-black uppercase">3. APROVACAO</span>',
      'liberado': '<span class="px-2 py-1 bg-blue-500 text-white rounded text-[10px] font-black uppercase">4. LIBERADO O.S.</span>',
      'producao': '<span class="px-2 py-1 bg-indigo-500 text-white rounded text-[10px] font-black uppercase">5. EM PRODUCAO</span>',
      'acabamento': '<span class="px-2 py-1 bg-purple-500 text-white rounded text-[10px] font-black uppercase">6. ACABAMENTO</span>',
      'embalagem': '<span class="px-2 py-1 bg-orange-500 text-white rounded text-[10px] font-black uppercase">7. EMBALAGEM</span>',
      'entregue': '<span class="px-2 py-1 bg-slate-800 text-white rounded text-[10px] font-black uppercase">8. EXPEDICAO</span>'
    };
    return badges[phase] || badges['orcamento'];
  },  createOrderForClient(clientId) { this.openModal({ clientId }); },
    getNextOrderId() {
    const orders = window.store.getOrders();
    const yy = new Date().getFullYear().toString().slice(-2);
    let maxSeq = 0;
    orders.forEach(o => {
      if (o.numero && String(o.numero).startsWith(yy)) {
        const seq = parseInt(String(o.numero).slice(2), 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });
    return yy + String(maxSeq + 1).padStart(4, '0');
  },
  updateDateFromDays() {
    const days = parseInt(document.getElementById('dias-entrega').value) || 0;
    const date = new Date();
    date.setDate(date.getDate() + days);
    document.getElementsByName('previsao_entrega')[0].value = date.toISOString().split('T')[0];
  },
    editItem(idx) {
    const it = this.activeItems[idx];
    const prodSelect = document.getElementById('item-prod-select');
    prodSelect.value = it.produto_id || '';
    if (prodSelect.value) { this.handleProdSelect(prodSelect); }
    
    document.getElementById('item-desc').value = it.descricao || '';
    document.getElementById('item-type').value = it.tipo_calculo || 'm2';
    document.getElementById('item-price').value = it.preco_base || '0.00';
    document.getElementById('item-width').value = it.largura_x || '0.00';
    document.getElementById('item-height').value = it.comprimento_y || '0.00';
    document.getElementById('item-qty').value = it.quantidade || '1';
    
    const itemArteInput = document.getElementById('item-arte-url');
    if(itemArteInput) itemArteInput.value = it.arte_url || '';
    const arteBtn = document.getElementById('item-arte-btn');
    if(arteBtn) {
      if(it.arte_url) {
        arteBtn.className = 'w-full h-full bg-blue-100 border border-blue-400 rounded flex items-center justify-center text-blue-600';
      } else {
        arteBtn.className = 'w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors';
      }
    }
    this.toggleDimensionInputs();
    this.calcPiecePrice();
    this.removeItem(idx);
    
    let cancelBtn = document.getElementById('cancel-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.type = 'button';
        cancelBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-sm text-[11px] h-[38px] uppercase whitespace-nowrap ml-2';
        cancelBtn.innerHTML = 'CANCELAR';
        cancelBtn.onclick = () => {
            if(confirm('Cancelar edição e limpar formulário?')) {
                salesModule.activeItems.splice(idx, 0, it);
                document.getElementById('order-items-tbody').innerHTML = salesModule.renderActiveItemsHtml();
                document.getElementById('item-desc').value = '';
                document.getElementById('item-prod-select').value = '';
                document.getElementById('item-price').value = '0.00';
                document.getElementById('item-width').value = '0.00';
                document.getElementById('item-height').value = '0.00';
                document.getElementById('item-qty').value = '1';
                cancelBtn.remove();
                salesModule.recalcTotals('val');
            }
        };
        const insertBtn = document.querySelector('button[onclick="salesModule.addItemToOrder()"]');
        if (insertBtn) insertBtn.parentNode.appendChild(cancelBtn);
    }
  },
    openModal(params = {}) {
    const clients = window.store.getClients();
    const products = window.store.getProducts();
    const isEdit = params.orderId ? true : false;
    const order = isEdit ? window.store.getOrders().find(o => o.id === params.orderId) : null;
    this.activeItems = order ? JSON.parse(JSON.stringify(order.itens || [])) : [];
    if (params.preItem) { this.activeItems.push(params.preItem); }
    
    const displayId = isEdit ? order.numero : this.getNextOrderId();

    const formHtml = `
      <div class="space-y-4 max-w-6xl mx-auto pb-10">
                <div class="sticky top-0 z-40 bg-white/95 backdrop-blur rounded-xl w-full p-4 mb-4 shadow-sm border border-slate-200">
          <div class="flex justify-between items-center mb-4">
            <div>
              <button type="button" onclick="salesModule.render()" class="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 mb-1">
                &larr; Voltar para Lista
              </button>
              <h2 class="text-2xl font-black text-slate-800">${isEdit ? 'Editar Pedido' : 'Nova Venda / Orcamento'}</h2>
            </div>
            <div class="text-right">
              <span class="block text-xs font-bold text-slate-500 uppercase">ID DA VENDA</span>
              <span class="text-2xl font-black text-slate-900">#${displayId}</span><input type="hidden" id="current-display-id" value="${displayId}">
            </div>
          </div>
          
          <form id="order-form" onsubmit="salesModule.saveOrder(event, '${order ? order.id : ''}', '${displayId}')" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="md:col-span-2">
                <label class="block text-xs font-semibold mb-1">Cliente *</label>
                <select name="cliente_id" required class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold text-slate-800">
                  <option value="">Selecione o Cliente...</option>
                  ${clients.map(c => `<option value="${c.id}" ${(order && order.cliente_id === c.id) || params.clientId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">Tipo de Operacao</label>
                <select name="tipo_operacao" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white">
                  <option value="venda" ${order && order.tipo_operacao === 'venda' ? 'selected' : ''}>Venda</option>
                  <option value="pre-venda" ${order && order.tipo_operacao === 'pre-venda' ? 'selected' : ''}>Pre-Venda</option>
                  <option value="orcamento" ${order && order.tipo_operacao === 'orcamento' ? 'selected' : ''}>Orcamento</option>
                  <option value="patrocinio" ${order && order.tipo_operacao === 'patrocinio' ? 'selected' : ''}>Patrocinio</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold mb-1 text-slate-700">Prazo (Dias)</label>
                  <input type="number" id="dias-entrega" min="0" oninput="salesModule.updateDateFromDays()" placeholder="Ex: 5" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1">Previsao</label>
                  <input type="date" name="previsao_entrega" id="previsao_entrega" oninput="salesModule.updateDaysFromDate()" onchange="salesModule.updateDaysFromDate()" value="${order ? (order.previsao_entrega || '') : new Date().toISOString().split('T')[0]}" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                </div>
              </div>
            </div>
          <div class="bg-white rounded-xl w-full p-6 shadow-sm border border-slate-200 mt-4">

            <div class="border border-slate-300 rounded-xl p-4 bg-white mt-4">
              <h3 class="text-sm font-bold text-slate-800 uppercase mb-3 border-b pb-2">Itens do Pedido</h3>
                            <div class="grid grid-cols-1 gap-3 bg-blue-50/50 p-3 rounded-lg text-xs border border-blue-100">
                <div class="grid grid-cols-12 gap-2">
                  <div class="col-span-12 sm:col-span-6 flex items-end gap-1">
                    <div class="flex-1">
                      <label class="block font-semibold mb-1 text-slate-700">Produto Base *</label>
                      <select id="item-prod-select" onchange="salesModule.handleProdSelect(this)" class="w-full p-2 border border-slate-300 rounded bg-white font-semibold">
                        <option value="">Selecione...</option>
                        ${products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (R$ ${p.preco_base}/${p.unidade_medida})</option>`).join('')}
                      </select>
                    </div>
                    <button type="button" onclick="salesModule.openNewProductModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-2 rounded shadow-sm text-xs h-[38px]" title="Cadastrar Novo Produto RÃ¡pido">+ NOVO</button>
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label class="block font-semibold mb-1 text-slate-700">Calculo</label>
                    <select id="item-type" onchange="salesModule.toggleDimensionInputs()" class="w-full p-2 border border-slate-300 rounded bg-slate-100 font-semibold" disabled>
                      <option value="m2">m2 (X x Y)</option>
                      <option value="linear">Linear</option>
                      <option value="unidade">Unitario</option>
                    </select>
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label class="block font-semibold mb-1 text-slate-700">Base mÂ² / un</label>
                    <input type="number" step="0.01" id="item-price" value="0.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-transparent focus:text-blue-700 transition-colors font-bold selection:text-transparent focus:selection:text-white" title="PreÃ§o base - Fica invisÃ­vel ao perder o foco">
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-slate-700">Descricao / Detalhes *</label>
                  <input type="text" id="item-desc" placeholder="Ex: Adesivo com recorte" class="w-full p-2 border border-slate-300 rounded bg-white">
                </div>
                <div class="grid grid-cols-12 gap-2 items-end">
                  <div class="col-span-2" id="div-width">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-slate-700">Largura X (m)</label>
                    <input type="number" step="0.01" id="item-width" value="0.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-xs">
                  </div>
                  <div class="col-span-2" id="div-height">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-slate-700">Compr. Y (m)</label>
                    <input type="number" step="0.01" id="item-height" value="0.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-xs">
                  </div>
                  <div class="col-span-2 sm:col-span-1">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-slate-700">Qtd</label>
                    <input type="number" step="1" id="item-qty" value="1" min="1" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-bold text-center text-xs">
                  </div>
                  <div class="col-span-3 sm:col-span-2">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-red-600">V. Unit. (R$)</label>
                    <div id="item-piece-price" class="w-full p-2 font-mono text-red-600 font-bold bg-red-50 border border-red-100 rounded flex items-center h-[38px] text-[11px] truncate">0.00</div>
                  </div>
                  <div class="col-span-3 sm:col-span-2">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-green-600">Sub Total</label>
                    <div id="item-subtotal-price" class="w-full p-2 font-mono text-green-700 font-bold bg-green-50 border border-green-100 rounded flex items-center h-[38px] text-[11px] truncate">0.00</div>
                  </div>
                  <div class="col-span-12 sm:col-span-3 mt-2 sm:mt-0 flex gap-2">
                    <div class="relative w-10 h-[38px] flex-shrink-0" title="Anexar Arte (Max 2MB)">
                      <input type="file" id="item-arte-upload" accept="image/png, image/jpeg, image/jpg" class="absolute inset-0 opacity-0 cursor-pointer z-10" onchange="salesModule.handleItemArteUpload(this)">
                      <div id="item-arte-btn" class="w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      </div>
                      <input type="hidden" id="item-arte-url" value="">
                    </div>
                    <button type="button" onclick="salesModule.addItemToOrder()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-sm text-[11px] h-[38px] uppercase whitespace-nowrap">+ INSERIR ITEM</button>
                  </div>
                </div>
              </div>
              <div class="mt-4 border border-slate-200 rounded-lg overflow-hidden">'
                <table class="w-full text-sm text-left">
                  <thead class="bg-slate-100 text-slate-500 uppercase text-xs font-bold">
                    <tr><th class="p-3">Produto & Item</th><th class="p-3">Dimensoes</th><th class="p-3 text-center">Qtd</th><th class="p-3">Area</th><th class="p-3">Preco</th><th class="p-3 text-right">Total</th><th class="p-3 text-center">Acao</th></tr>
                  </thead>
                  <tbody id="order-items-tbody">${this.renderActiveItemsHtml()}</tbody>
                </table>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 class="text-sm font-bold text-slate-800 uppercase border-b pb-2">Dados da Producao</h3>
                
                <div>
                  <label class="block text-xs font-semibold mb-1 text-slate-700">Observacoes Tecnicas</label>
                  <textarea name="observacoes" rows="2" class="w-full p-2 border rounded-lg text-sm bg-white">${order ? (order.observacoes || '') : ''}</textarea>
                </div>
              </div>
              <div class="space-y-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                <h3 class="text-sm font-bold text-slate-800 uppercase border-b pb-2">Fechamento Financeiro</h3>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Subtotal:</span>
                  <span class="text-sm font-mono font-bold text-slate-800" id="order-subtotal">R$ 0,00</span>
                </div>
                                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Desconto (%):</span>
                  <input type="number" step="0.01" id="order-discount-perc" value="0" oninput="salesModule.recalcTotals('perc')" class="w-20 p-1.5 border rounded-lg text-center font-mono text-sm bg-white text-purple-700 font-bold">
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Desconto (R$):</span>
                  <input type="number" step="0.01" id="order-discount" value="${order ? (order.desconto || 0) : 0}" oninput="salesModule.recalcTotals('val')" class="w-24 p-1.5 border rounded-lg text-right font-mono text-sm bg-white">
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span class="text-lg font-black text-blue-900">Total Final:</span>
                  <span class="text-2xl font-black text-blue-700 font-mono" id="order-total-final">R$ 0,00</span>
                </div>
                <div class="mt-4 pt-4 border-t border-blue-100">
                  <button type="button" onclick="salesModule.openFinanceModal()" class="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-lg shadow-sm flex justify-center items-center gap-2 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    RECEBER / FINANCEIRO
                  </button>
                  <div class="text-center mt-3 bg-green-50 p-2 rounded border border-green-100 hidden" id="finance-summary">
                    <span class="text-xs font-bold text-slate-600">Total Recebido:</span>
                    <span class="text-sm font-black text-green-700" id="finance-received-text">R$ 0,00 (0%)</span>
                    <input type="hidden" id="order-valor-recebido" value="${order ? (order.valor_recebido || 0) : 0}">
<input type="hidden" id="order-metodo-pagto" name="forma_pagamento" value="${order ? (order.forma_pagamento || '') : ''}">
<input type="hidden" id="order-obs-pagto" name="obs_pagto" value="${order ? (order.obs_pagto || '') : ''}">
</div>
                </div>
              </div>
            </div>
            <div class="pt-6 mt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="w-full sm:w-1/3">
                <label class="block text-xs font-bold text-slate-700 mb-1">Fase da Producao / Status Inicial</label>
                <select name="status_fase" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-black text-blue-700 shadow-sm border-blue-300">
                  ${(window.productionModule ? window.productionModule.phases : [
                      {id:'orcamento', name:'1. ORÃ‡AMENTO'},
                      {id:'prevenda', name:'2. PRÃ‰-VENDA'},
                      {id:'aprovacao', name:'3. APROVAÃ‡ÃƒO'},
                      {id:'liberado', name:'4. LIBERADO'},
                      {id:'producao', name:'5. PRODUÃ‡ÃƒO'},
                      {id:'acabamento', name:'6. ACABAMENTO'},
                      {id:'embalagem', name:'7. EMBALAGEM'},
                      {id:'entregue', name:'8. ENTREGA'}
                  ]).map(p => `<option value="${p.id}" ${order && order.status_fase === p.id ? 'selected' : (!order && p.id === 'orcamento' ? 'selected' : '')}>${p.name}</option>`).join('')}
                </select>
              </div>
              <div class="flex gap-3 w-full sm:w-auto justify-end">
                <button type="button" onclick="salesModule.render()" class="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
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
            </div>
          </form>
        </div>
      </div>
    `;
    document.getElementById("view-container").innerHTML = formHtml;
    this.recalcTotals();
  },
    handleProdSelect(select) {
    const opt = select.options[select.selectedIndex];
    if (opt.value) {
      document.getElementById('item-desc').value = ""; document.getElementById('item-prod-select').setAttribute("data-nome", opt.text.split(" (R$")[0]);
      const type = opt.getAttribute('data-type');
      document.getElementById('item-type').value = type;
      document.getElementById('item-price').value = opt.getAttribute('data-price');
      this.toggleDimensionInputs();
      this.calcPiecePrice();
    }
  },
      toggleDimensionInputs() {
      const type = document.getElementById('item-type').value;
      document.getElementById('div-width').style.display = (type === 'm2' || type === 'linear') ? 'block' : 'none';
      document.getElementById('div-height').style.display = (type === 'm2') ? 'block' : 'none';
      this.calcPiecePrice();
    },
    handleItemArteUpload(input) {
      if(!input.files || input.files.length === 0) return;
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no mÃ¡ximo 2MB.");
        input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('item-arte-url').value = e.target.result;
        const btn = document.getElementById('item-arte-btn');
        btn.className = 'w-full h-full bg-green-100 border border-green-300 rounded flex items-center justify-center text-green-600';
        btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
      };
      reader.readAsDataURL(file);
    },
      calcPiecePrice() {
    const type = document.getElementById('item-type').value;
    const w = parseFloat(document.getElementById('item-width').value) || 1;
    const h = parseFloat(document.getElementById('item-height').value) || 1;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const area = type === 'm2' ? (w * h) : (type === 'linear' ? w : 1);
    const piecePrice = type === 'unidade' ? price : (area * price);
          const displayEl = document.getElementById('item-piece-price');
      if(displayEl) displayEl.innerText = `R$ ${piecePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      const subtotalEl = document.getElementById('item-subtotal-price');
      if(subtotalEl) {
         const qty = parseInt(document.getElementById('item-qty').value) || 1;
         subtotalEl.innerText = `R$ ${(piecePrice * qty).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      }
  },
      numeroPorExtenso(v) {
    const unidades = ["", "um", "dois", "trÃªs", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
    const milhares = ["", "mil", "milhÃµes", "bilhÃµes"];
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
    const type = document.getElementById('item-type').value;
    const w = parseFloat(document.getElementById('item-width').value) || 1;
    const h = parseFloat(document.getElementById('item-height').value) || 1;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const area = type === 'm2' ? (w * h) : (type === 'linear' ? w : 1);
    const piecePrice = type === 'unidade' ? price : (area * price);
    const displayEl = document.getElementById('item-piece-price');
    if(displayEl) displayEl.innerText = `PeÃ§a: R$ ${piecePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  },
  openNewProductModal() {
    const modalHtml = `
      <div id="quick-product-modal" class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl">
          <h3 class="font-black text-lg text-slate-800 mb-4 border-b pb-2">Cadastrar Produto RÃ¡pido</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold mb-1">Nome do Produto</label>
              <input type="text" id="qp-nome" class="w-full p-2 border rounded text-sm bg-slate-50" placeholder="Ex: Lona Frontlight 440g">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">CÃ¡lculo</label>
              <select id="qp-tipo" class="w-full p-2 border rounded text-sm bg-slate-50">
                <option value="m2">Por mÂ²</option>
                <option value="linear">Metro Linear</option>
                <option value="unidade">Por Unidade</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">PreÃ§o Base (R$)</label>
              <input type="number" id="qp-preco" step="0.01" class="w-full p-2 border rounded text-sm bg-slate-50" placeholder="0.00">
            </div>
          </div>
          <div class="mt-5 pt-3 border-t flex justify-end gap-2">
            <button onclick="document.getElementById('quick-product-modal').remove()" class="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
            <button onclick="salesModule.saveQuickProduct()" class="px-4 py-2 text-sm bg-blue-600 text-white font-bold rounded shadow">Salvar</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },
  saveQuickProduct() {
    const nome = document.getElementById('qp-nome').value.trim();
    const tipo = document.getElementById('qp-tipo').value;
    const preco = parseFloat(document.getElementById('qp-preco').value) || 0;
    if(!nome) return alert('Informe o nome do produto');
    
    const newProd = {
      id: Date.now().toString(),
      nome, categoria: 'Outros', tipo_cobranca: tipo,
      unidade_medida: tipo === 'm2' ? 'm2' : (tipo === 'linear' ? 'm' : 'un'),
      preco_base: preco, custo_base: 0, estoque_atual: 100, estoque_minimo: 10
    };
    const products = window.store.getProducts();
    products.push(newProd);
    window.store.save('grafsis_products', products);
    document.getElementById('quick-product-modal').remove();
    
    const sel = document.getElementById('item-prod-select');
    sel.innerHTML = `<option value="">Selecione...</option>` + products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (R$ ${p.preco_base}/${p.unidade_medida})</option>`).join('');
    sel.value = newProd.id;
    this.handleProdSelect(sel);
    alert('Produto cadastrado com sucesso!');
  },
  addItemToOrder() {
    const desc = document.getElementById('item-desc').value.trim();
    if (!desc) { alert('Informe a descricao do item'); return; }
    const prodSelect = document.getElementById('item-prod-select');
    if (!prodSelect.value) { alert('Selecione um Produto Base'); return; }
    const opt = prodSelect.options[prodSelect.selectedIndex];
    const prodNome = opt.text.split(' (R$')[0];
    const type = document.getElementById('item-type').value;
    const w = parseFloat(document.getElementById('item-width').value) || 1;
    const h = parseFloat(document.getElementById('item-height').value) || 1;
    const qty = parseInt(document.getElementById('item-qty').value) || 1;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    
    const itemArteInput = document.getElementById('item-arte-url');
    const arteUrl = itemArteInput ? itemArteInput.value.trim() : '';

    const orderIdStr = document.getElementById('current-display-id')?.value || '000000';
    const seq = String(this.activeItems.length + 1).padStart(2, '0');
    const generatedItemId = orderIdStr + seq;

    const area = type === 'm2' ? (w * h) : (type === 'linear' ? w : 1);
    const piecePrice = type === 'unidade' ? price : (area * price);
    const total = piecePrice * qty;

    this.activeItems.push({
      item_id: generatedItemId,
      produto_id: prodSelect.value, 
      produto_nome: prodNome, 
      descricao: desc, 
      tipo_calculo: type, 
      largura_x: w, 
      comprimento_y: h,
      quantidade: qty, 
      preco_base: price,
      preco_unitario: piecePrice,
      area_m2: area, 
      valor_total: total,
      arte_url: arteUrl
    });
        document.getElementById('order-items-tbody').innerHTML = this.renderActiveItemsHtml();
          document.getElementById('item-desc').value = '';
      document.getElementById('item-prod-select').value = '';
      document.getElementById('item-price').value = '0.00';
      document.getElementById('item-width').value = '1.00';
      document.getElementById('item-height').value = '1.00';
      document.getElementById('item-qty').value = '1';
          if(itemArteInput) itemArteInput.value = '';
      const arteBtn = document.getElementById('item-arte-btn');
      if(arteBtn) {
        arteBtn.className = 'w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors';
        arteBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>`;
      }
      const arteUpload = document.getElementById('item-arte-upload');
      if(arteUpload) arteUpload.value = '';
      this.calcPiecePrice();
    this.recalcTotals('val');
    document.getElementById('item-prod-select').focus();
  },
  removeItem(idx) {
    this.activeItems.splice(idx, 1);
        document.getElementById('order-items-tbody').innerHTML = this.renderActiveItemsHtml();
          document.getElementById('item-desc').value = '';
      document.getElementById('item-prod-select').value = '';
      document.getElementById('item-price').value = '0.00';
      document.getElementById('item-width').value = '1.00';
      document.getElementById('item-height').value = '1.00';
      document.getElementById('item-qty').value = '1';
          if(itemArteInput) itemArteInput.value = '';
      const arteBtn = document.getElementById('item-arte-btn');
      if(arteBtn) {
        arteBtn.className = 'w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors';
        arteBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>`;
      }
      const arteUpload = document.getElementById('item-arte-upload');
      if(arteUpload) arteUpload.value = '';
      this.calcPiecePrice();
    this.recalcTotals('val');
    document.getElementById('item-prod-select').focus();
  },
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
          <td class="p-2 text-right flex justify-end gap-2"><button type="button" onclick="salesModule.editItem(${idx})" class="text-blue-500 font-bold hover:bg-blue-50 px-2 py-1 rounded" title="Editar">&#9998;</button><button type="button" onclick="salesModule.removeItem(${idx})" class="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded" title="Remover">&times;</button></td>
        </tr>
      `).join('');
    },
    recalcTotals(source = 'val') {
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    let descVal = parseFloat(document.getElementById('order-discount')?.value) || 0;
    let descPerc = parseFloat(document.getElementById('order-discount-perc')?.value) || 0;
    
    if (source === 'perc') {
      descVal = subtotal * (descPerc / 100);
      const valEl = document.getElementById('order-discount');
      if (valEl) valEl.value = descVal.toFixed(2);
    } else if (source === 'val' && subtotal > 0) {
      descPerc = (descVal / subtotal) * 100;
      const percEl = document.getElementById('order-discount-perc');
      if (percEl) percEl.value = descPerc.toFixed(2);
    }

    const finalTotal = Math.max(0, subtotal - descVal);
    if (document.getElementById('order-subtotal')) {
      document.getElementById('order-subtotal').innerText = 'R$ ' + subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      document.getElementById('order-total-final').innerText = 'R$ ' + finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
    
    const valorRecebido = parseFloat(document.getElementById('order-valor-recebido')?.value) || 0;
    if (valorRecebido > 0 || finalTotal > 0) {
      if (this.updateFinanceSummary) this.updateFinanceSummary(valorRecebido, finalTotal);
    }
    
    return { subtotal, discount: descVal, finalTotal };
  },
      handleArteUpload(input) {
    if(!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 1.5 * 1024 * 1024) {
      alert("A imagem da arte deve ter no mÃ¡ximo 1.5MB.");
      input.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      document.querySelector('input[name="foto_arte_url"]').value = "Imagem salva no banco de dados";
      document.getElementById('order-arte-url').value = e.target.result;
      alert("Imagem da arte anexada com sucesso e pronta para salvar!");
    };
    reader.readAsDataURL(file);
  },
  async saveOrder(e, id, geradoNumero) {
    e.preventDefault();
    if (this.activeItems.length === 0) { alert('Adicione pelo menos um item'); return; }
    const form = e.target;
    const { subtotal, discount, finalTotal } = this.recalcTotals();
    
    let historico = [];
    const oldOrder = id ? window.store.getOrders().find(o => o.id === id) : null;
    if (oldOrder && oldOrder.historico) {
      historico = JSON.parse(JSON.stringify(oldOrder.historico));
    }
    const newPhase = form.status_fase.value;
    const oldPhase = oldOrder ? oldOrder.status_fase : null;
    
    if (newPhase !== oldPhase) {
      historico.push({
        fase: newPhase,
        data: new Date().toISOString(),
        usuario: window.app?.currentUser?.nome || 'Sistema'
      });
    }

    const orderData = {
      id: id || undefined,
      numero: geradoNumero,
      cliente_id: form.cliente_id.value,
      tipo_operacao: form.tipo_operacao ? form.tipo_operacao.value : 'venda',
      vendedor: window.app?.currentUser?.nome || "Vendedor",
      status_fase: newPhase,
      previsao_entrega: form.previsao_entrega.value,
      foto_arte_url: form.foto_arte_url?.value || '',
      observacoes: form.observacoes.value,
              forma_pagamento: document.getElementById('order-metodo-pagto')?.value || 'Dinheiro',
        obs_pagto: document.getElementById('order-obs-pagto')?.value || '',
        valor_recebido: parseFloat(document.getElementById("order-valor-recebido")?.value) || 0,
        status_pagamento: (parseFloat(document.getElementById("order-valor-recebido")?.value) || 0) > 0 ? 'parcial' : 'pendente',
      valor_total: subtotal,
      desconto: discount,
      valor_final: finalTotal,
      itens: this.activeItems,
      historico: historico
    };
    const saved = await window.store.saveOrder(orderData);
    if (orderData.status_pagamento !== 'pago') {
      await window.store.saveFinanceEntry({
        tipo: 'receber',
        descricao: 'Pedido #' + saved.numero + ' - ' + (orderData.itens[0]?.descricao || 'Comunicacao Visual'),
        valor: finalTotal,
        data_vencimento: orderData.previsao_entrega || new Date().toISOString().slice(0, 10),
        status: orderData.status_pagamento === 'parcial' ? 'parcial' : 'pendente',
        pedido_id: saved.id,
        cliente_id: orderData.cliente_id
      });
    }
    this.render();
  },
  editModal(id) { this.renderOrderForm({ orderId: id }); },
  quickView(orderId) {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Desconhecido' };
    
    const phaseNames = {
      'orcamento': '1. ORCAMENTO / PEDIDO',
      'prevenda': '2. PRE-VENDA',
      'aprovacao': '3. APROVACAO DO CLIENTE',
      'liberado': '4. LIBERADO ORDEM DE SERVICO',
      'producao': '5. EM PRODUCAO',
      'acabamento': '6. ACABAMENTO',
      'embalagem': '7. EMBALAGEM',
      'entregue': '8. EXPEDICAO / ENTREGA'
    };

    const histHtml = (order.historico || []).map(h => `
      <div class="flex items-start mb-2">
        <div class="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
        <div>
          <p class="text-xs font-bold text-slate-800 uppercase">${phaseNames[h.fase] || h.fase}</p>
          <p class="text-[10px] text-slate-500">${new Date(h.data).toLocaleString()} - por ${h.usuario}</p>
        </div>
      </div>
    `).join('');

    const modalHtml = `
      <div id="quick-view-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 class="font-black text-lg text-slate-800">Pedido #${order.numero}</h3>
            <button onclick="document.getElementById('quick-view-modal').remove()" class="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
          </div>
          <div class="p-4 overflow-y-auto flex-1">
            <p class="text-xs font-bold text-slate-500 uppercase">Cliente</p>
            <p class="text-sm font-bold text-slate-800 mb-4">${client.nome}</p>
            
            <p class="text-xs font-bold text-slate-500 uppercase mb-2">Itens (${order.itens?.length || 0})</p>
            <div class="space-y-2 mb-4">
              ${(order.itens || []).map(it => `
                <div class="bg-slate-50 p-2 rounded border text-xs flex justify-between items-center">
                  <div>
                    <span class="font-mono bg-blue-100 text-blue-800 px-1 rounded mr-1">#${it.item_id || '----'}</span>
                    <strong>${it.produto_nome}</strong> - ${it.quantidade}x
                  </div>
                  <strong class="text-blue-700 font-mono">R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                </div>
              `).join('')}
            </div>

            <p class="text-xs font-bold text-slate-500 uppercase mb-2">Historico de Fases</p>
            <div class="bg-slate-50 p-3 rounded border">
              ${histHtml || '<p class="text-xs text-slate-400">Sem historico registrado.</p>'}
            </div>
          </div>
          <div class="p-4 border-t bg-slate-50 text-right">
            <button onclick="document.getElementById('quick-view-modal').remove()" class="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 text-sm">Fechar</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },  delete(id) {
    if (confirm('Excluir este pedido?')) { window.store.deleteOrder(id); this.render(); }
  },
  sendWhatsAppOrder(orderId) {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id);
    if (!client || !client.telefone_whatsapp) { alert('Cliente sem WhatsApp'); return; }
    let msg = '*GRAFSIS - Pedido #' + order.numero + '*%0AOlÃ¡ ' + client.nome + '!%0A';
    order.itens.forEach((it, i) => {
      msg += (i+1) + '. ' + it.descricao + ' | R$ ' + Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '%0A';
    });
    msg += '%0A*Total: R$ ' + Number(order.valor_final).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '*%0A';
    const phone = client.telefone_whatsapp.replace(/\D/g, '');
    window.open('https://wa.me/55' + phone + '?text=' + msg, '_blank');
  },
  openProtocolModal(orderId) {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Consumidor' };

    const modalHtml = `
      <div id="protocol-modal-wrap" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl" id="modal-protocolo">
          <div class="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-black text-slate-900">GRAFSIS</h1>
              <p class="text-xs uppercase text-slate-500 font-bold">Protocolo de Entrega de Materiais</p>
            </div>
            <div class="text-right">
              <span class="bg-slate-900 text-white font-mono text-sm px-3 py-1 rounded font-bold">PROTOCOLO #${order.numero}</span>
              <p class="text-xs text-slate-400 mt-1">Data: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div class="mt-4 bg-slate-50 p-3 rounded-lg border text-xs grid grid-cols-2 gap-2">
            <div>
              <strong class="text-slate-500">CLIENTE:</strong>
              <p class="font-bold text-slate-800">${client.nome}</p>
              <p>${client.telefone_whatsapp || ''}</p>
            </div>
            <div>
              <strong class="text-slate-500">LOCAL:</strong>
              <p>${client.endereco || 'Balcao'}</p>
              ${client.plus_code ? '<p class="font-mono text-blue-600">Plus Code: ' + client.plus_code + '</p>' : ''}
            </div>
          </div>
          <div class="mt-4">
            <table class="w-full text-xs text-left border rounded overflow-hidden">
              <thead class="bg-slate-100"><tr><th class="p-2">Item</th><th class="p-2">Medidas</th><th class="p-2 text-center">Qtd</th><th class="p-2 text-right">Total</th></tr></thead>
              <tbody>
                ${order.itens.map(it => `<tr><td class="p-2">${it.descricao}</td><td class="p-2 font-mono">${it.tipo_calculo === 'm2' ? it.largura_x + 'm x ' + it.comprimento_y + 'm' : '-'}</td><td class="p-2 text-center">${it.quantidade}</td><td class="p-2 text-right font-mono">R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="mt-6 pt-4 border-t text-xs space-y-4">
            <p>Declaro que recebi os materiais e servicos acima relacionados em perfeito estado.</p>
            ${window.store.getSettings().companyFooterMsg ? `<p class="text-[10px] text-slate-400 italic mb-2">${window.store.getSettings().companyFooterMsg}</p>` : ''}
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-[11px] text-slate-500 no-print">Nome recebedor:</label><input type="text" id="prot-nome-rec" value="${order.protocolo_recebedor_nome||''}" placeholder="Nome legivel" class="w-full border-b pb-1 text-xs bg-transparent"></div>
              <div><label class="block text-[11px] text-slate-500 no-print">Documento (RG/CPF):</label><input type="text" id="prot-doc-rec" value="${order.protocolo_recebedor_doc||''}" placeholder="Doc" class="w-full border-b pb-1 text-xs bg-transparent"></div>
            </div>
            <div class="pt-8 text-center"><div class="w-48 border-t mx-auto"></div><p class="text-[11px] mt-1 font-semibold text-slate-600">Assinatura do Recebedor</p></div>
          </div>
          <div class="mt-6 pt-3 border-t flex justify-between items-center no-print">
            <button onclick="document.getElementById('protocol-modal-wrap').remove()" class="px-4 py-2 text-xs text-slate-600">Fechar</button>
            <div class="flex gap-2">
              <button onclick="salesModule.confirmDelivery('${order.id}')" class="px-4 py-2 text-xs bg-emerald-600 text-white rounded font-bold">Marcar Entregue</button>
              <button onclick="window.print()" class="px-4 py-2 text-xs bg-blue-600 text-white rounded font-bold">Imprimir OS/Protocolo</button><button onclick="financeModule.openCashierModal(\x27${order.id}\x27)" class="text-blue-600 px-2 font-bold bg-blue-50 border border-blue-200 rounded mx-1 hover:bg-blue-100">💰 Caixa</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },
  confirmDelivery(orderId) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.protocolo_recebedor_nome = document.getElementById('prot-nome-rec').value;
      order.protocolo_recebedor_doc = document.getElementById('prot-doc-rec').value;
      order.status_fase = 'entregue';
      order.data_entrega = new Date().toISOString();
      window.store.save('grafsis_orders', orders);
      alert('Entrega confirmada!');
      document.getElementById('protocol-modal-wrap').remove();
      this.render();
    }
  }


};














