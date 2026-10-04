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
          <td class="p-4 font-bold text-slate-800">R$ ${Number(o.valor_final).toFixed(2)}</td>
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
      'orcamento': '<span class="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">1. Orcamento</span>',
      'aguardando_arte': '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-[10px] font-bold uppercase">2. Aguardando Arte</span>',
      'aprovacao': '<span class="px-2 py-1 bg-orange-100 text-orange-800 rounded text-[10px] font-bold uppercase">3. Aprovacao</span>',
      'liberado': '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-[10px] font-bold uppercase">4. Liberado Producao</span>',
      'impressao': '<span class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold uppercase">5. Impressao</span>',
      'acabamento': '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-[10px] font-bold uppercase">6. Acabamento</span>',
      'qualidade': '<span class="px-2 py-1 bg-pink-100 text-pink-800 rounded text-[10px] font-bold uppercase">7. Qualidade</span>',
      'entregue': '<span class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase">8. Expedicao</span>'
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
        <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <button onclick="salesModule.render()" class="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 mb-2">
              &larr; Voltar para Lista
            </button>
            <h2 class="text-2xl font-black text-slate-800">${isEdit ? 'Editar Pedido' : 'Nova Venda / Orcamento'}</h2>
            <p class="text-[10px] text-blue-600 font-bold uppercase mt-1">Vendedor: ${window.app?.currentUser?.nome || "Vendedor"}</p>
          </div>
          <div class="text-right">
            <span class="block text-xs font-bold text-slate-500 uppercase">ID DA VENDA</span>
            <span class="text-3xl font-black text-slate-900">#${displayId}</span><input type="hidden" id="current-display-id" value="${displayId}">
          </div>
        </div>

        <div class="bg-white rounded-xl w-full p-6 shadow-sm border border-slate-200">
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
                <label class="block text-xs font-semibold mb-1">Fase da Producao</label>
                <select name="status_fase" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold text-slate-700">
                  <option value="orcamento" ${order && order.status_fase === 'orcamento' ? 'selected' : ''}>0. Orcamento</option>
                  <option value="prevenda" ${order && order.status_fase === 'prevenda' ? 'selected' : ''}>1. Pre-venda (Arte)</option>
                  <option value="venda" ${order && order.status_fase === 'venda' ? 'selected' : ''}>2. Venda / Producao</option>
                  <option value="entregue" ${order && order.status_fase === 'entregue' ? 'selected' : ''}>3. Entregue / Concluido</option>
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
              <div class="md:col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold mb-1 text-slate-700">Prazo (Dias)</label>
                  <input type="number" id="dias-entrega" min="0" oninput="salesModule.updateDateFromDays()" placeholder="Ex: 5" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1">Previsao Entrega</label>
                  <input type="date" name="previsao_entrega" value="${order ? (order.previsao_entrega || '') : new Date().toISOString().split('T')[0]}" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                </div>
              </div>
            </div>

            <div class="border border-slate-300 rounded-xl p-4 bg-white mt-4">
              <h3 class="text-sm font-bold text-slate-800 uppercase mb-3 border-b pb-2">Itens do Pedido</h3>
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-blue-50/50 p-3 rounded-lg text-xs border border-blue-100">
                <div class="sm:col-span-4">
                  <label class="block font-semibold mb-1 text-slate-700">Produto Base *</label>
                  <select id="item-prod-select" onchange="salesModule.handleProdSelect(this)" class="w-full p-2 border border-slate-300 rounded bg-white font-semibold">
                    <option value="">Selecione o Produto...</option>
                    ${products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (R$ ${p.preco_base}/${p.unidade_medida})</option>`).join('')}
                  </select>
                </div>
                <div class="sm:col-span-8">
                  <label class="block font-semibold mb-1 text-slate-700">Descricao / Detalhes *</label>
                  <input type="text" id="item-desc" placeholder="Ex: Adesivo com recorte" class="w-full p-2 border border-slate-300 rounded bg-white">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1 text-slate-700">Calculo</label>
                  <select id="item-type" onchange="salesModule.toggleDimensionInputs()" class="w-full p-2 border border-slate-300 rounded bg-slate-100 font-semibold" disabled>
                    <option value="m2">m2 (X x Y)</option>
                    <option value="linear">Linear</option>
                    <option value="unidade">Unitario</option>
                  </select>
                </div>
                <div class="sm:col-span-2" id="div-width">
                  <label class="block font-semibold mb-1 text-slate-700">Largura X (m)</label>
                  <input type="number" step="0.01" id="item-width" value="1.00" class="w-full p-2 border border-slate-300 rounded bg-white font-mono">
                </div>
                <div class="sm:col-span-2" id="div-height">
                  <label class="block font-semibold mb-1 text-slate-700">Compr. Y (m)</label>
                  <input type="number" step="0.01" id="item-height" value="1.00" class="w-full p-2 border border-slate-300 rounded bg-white font-mono">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1 text-slate-700">Qtd</label>
                  <input type="number" step="1" id="item-qty" value="1" min="1" class="w-full p-2 border border-slate-300 rounded bg-white font-bold text-center">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1 text-slate-700">Preco Unit.</label>
                  <input type="number" step="0.01" id="item-price" value="0.00" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-blue-700 font-bold">
                </div>
                <div class="sm:col-span-2 flex items-end">
                  <button type="button" onclick="salesModule.addItemToOrder()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-sm text-sm">+ INSERIR</button>
                </div>
              </div>
              <div class="mt-4 border border-slate-200 rounded-lg overflow-hidden">
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
                  <label class="block text-xs font-semibold mb-1 text-slate-700">Foto da Arte / Link do Drive</label>
                  <input type="text" name="foto_arte_url" value="${order ? (order.foto_arte_url || '') : ''}" placeholder="Link da imagem" class="w-full p-2 border rounded-lg text-sm mb-1 bg-white">
                  <input type="file" accept="image/*" onchange="salesModule.handleArteUpload(this)" class="text-xs">
                  <input type="hidden" id="order-arte-url" name="foto_arte_url" value="${order ? (order.foto_arte_url || '') : ''}">
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1 text-slate-700">Observacoes Tecnicas</label>
                  <textarea name="observacoes" rows="2" class="w-full p-2 border rounded-lg text-sm bg-white">${order ? (order.observacoes || '') : ''}</textarea>
                </div>
              </div>
              <div class="space-y-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                <h3 class="text-sm font-bold text-slate-800 uppercase border-b pb-2">Fechamento Financeiro</h3>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Subtotal:</span>
                  <span class="text-sm font-mono font-bold text-slate-800" id="order-subtotal">R$ 0.00</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Desconto (R$):</span>
                  <input type="number" step="0.01" id="order-discount" value="${order ? (order.desconto || 0) : 0}" oninput="salesModule.recalcTotals()" class="w-24 p-1.5 border rounded-lg text-right font-mono text-sm bg-white">
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span class="text-lg font-black text-blue-900">Total Final:</span>
                  <span class="text-2xl font-black text-blue-700 font-mono" id="order-total-final">R$ 0.00</span>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-blue-100">
                  <div>
                    <label class="block text-xs font-bold mb-1 text-slate-700">Forma Pagto Inicial</label>
                    <select name="forma_pagamento" class="w-full p-2 border rounded-lg text-sm font-semibold">
                      <option value="Pix" ${order && order.forma_pagamento === 'Pix' ? 'selected' : ''}>Pix</option>
                      <option value="Dinheiro" ${order && order.forma_pagamento === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
                      <option value="Cartao de Credito" ${order && order.forma_pagamento === 'Cartao de Credito' ? 'selected' : ''}>Cartao</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold mb-1 text-slate-700">Status Recebimento</label>
                    <select name="status_pagamento" class="w-full p-2 border rounded-lg text-sm font-semibold">
                      <option value="pendente" ${order && order.status_pagamento === 'pendente' ? 'selected' : ''}>Pendente (0%)</option>
                      <option value="parcial" ${order && order.status_pagamento === 'parcial' ? 'selected' : ''}>Sinal (50%)</option>
                      <option value="pago" ${order && order.status_pagamento === 'pago' ? 'selected' : ''}>Pago (100%)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="pt-6 mt-4 border-t flex justify-end gap-3">
              <button type="button" onclick="salesModule.render()" class="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
              <button type="submit" class="px-8 py-3 text-sm bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md uppercase transition">${isEdit ? 'Atualizar Pedido' : 'Finalizar Pedido'}</button>
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
    }
  },
  toggleDimensionInputs() {
    const type = document.getElementById('item-type').value;
    document.getElementById('div-width').style.display = (type === 'm2' || type === 'linear') ? 'block' : 'none';
    document.getElementById('div-height').style.display = (type === 'm2') ? 'block' : 'none';
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
    if(itemArteInput) itemArteInput.value = '';
    this.recalcTotals();
  },
  removeItem(idx) {
    this.activeItems.splice(idx, 1);
    document.getElementById('order-items-tbody').innerHTML = this.renderActiveItemsHtml();
    this.recalcTotals();
  },
  renderActiveItemsHtml() {
    if (this.activeItems.length === 0) return `<tr><td colspan="8" class="p-2 text-center text-slate-400">Nenhum item</td></tr>`;
    return this.activeItems.map((it, idx) => `
      <tr class="border-b hover:bg-slate-50 transition">
        <td class="p-2">
          ${it.arte_url ? `<a href="${it.arte_url}" target="_blank" class="block w-8 h-8 rounded bg-slate-200 float-left mr-2 bg-cover bg-center border border-slate-300" style="background-image: url('${it.arte_url}')" title="Ver Layout"></a>` : `<div class="block w-8 h-8 rounded bg-slate-100 float-left mr-2 border border-slate-200 flex items-center justify-center text-[8px] text-slate-400">N/A</div>`}
          <div class="font-bold text-xs text-slate-800"><span class="text-[10px] font-mono bg-blue-100 text-blue-800 px-1 rounded mr-1">#${it.item_id || '----'}</span>${it.produto_nome || ''}</div>
          <div class="text-[10px] text-slate-500">${it.descricao}</div>
        </td>
        <td class="p-2 font-mono text-[11px]">${it.tipo_calculo === 'm2' ? it.largura_x + 'm x ' + it.comprimento_y + 'm' : (it.tipo_calculo === 'linear' ? it.largura_x + 'm linear' : 'UNID')}</td>
        <td class="p-2 font-bold text-center">${it.quantidade}</td>
        <td class="p-2 font-mono text-[11px] text-purple-700">${it.tipo_calculo !== 'unidade' ? (it.area_m2 * it.quantidade).toFixed(2) + (it.tipo_calculo === 'm2' ? ' m2' : ' m') : '-'}</td>
        <td class="p-2 font-mono text-[11px]">Base: R$ ${Number(it.preco_base || 0).toFixed(2)}<br>Peca: R$ ${Number(it.preco_unitario).toFixed(2)}</td>
        <td class="p-2 font-bold text-blue-700">R$ ${Number(it.valor_total).toFixed(2)}</td>
        <td class="p-2 text-right"><button type="button" onclick="salesModule.removeItem(${idx})" class="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded">&times;</button></td>
      </tr>
    `).join('');
  },  recalcTotals() {
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const discount = parseFloat(document.getElementById('order-discount')?.value) || 0;
    const finalTotal = Math.max(0, subtotal - discount);
    if (document.getElementById('order-subtotal')) {
      document.getElementById('order-subtotal').innerText = 'R$ ' + subtotal.toFixed(2);
      document.getElementById('order-total-final').innerText = 'R$ ' + finalTotal.toFixed(2);
    }
    return { subtotal, discount, finalTotal };
  },
  handleArteUpload(input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { document.getElementById('order-arte-url').value = e.target.result; };
      reader.readAsDataURL(file);
    }
  },
  saveOrder(e, id, geradoNumero) {
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
      forma_pagamento: form.forma_pagamento.value,
      status_pagamento: form.status_pagamento.value,
      valor_total: subtotal,
      desconto: discount,
      valor_final: finalTotal,
      itens: this.activeItems,
      historico: historico
    };
    const saved = window.store.saveOrder(orderData);
    if (orderData.status_pagamento !== 'pago') {
      window.store.saveFinanceEntry({
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
      'orcamento': '1. Orcamento',
      'aguardando_arte': '2. Aguardando Arte',
      'aprovacao': '3. Aprovacao',
      'liberado': '4. Liberado Producao',
      'impressao': '5. Impressao',
      'acabamento': '6. Acabamento',
      'qualidade': '7. Qualidade',
      'entregue': '8. Expedicao'
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
                  <strong class="text-blue-700 font-mono">R$ ${Number(it.valor_total).toFixed(2)}</strong>
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
      msg += (i+1) + '. ' + it.descricao + ' | R$ ' + Number(it.valor_total).toFixed(2) + '%0A';
    });
    msg += '%0A*Total: R$ ' + Number(order.valor_final).toFixed(2) + '*%0A';
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
                ${order.itens.map(it => `<tr><td class="p-2">${it.descricao}</td><td class="p-2 font-mono">${it.tipo_calculo === 'm2' ? it.largura_x + 'm x ' + it.comprimento_y + 'm' : '-'}</td><td class="p-2 text-center">${it.quantidade}</td><td class="p-2 text-right font-mono">R$ ${Number(it.valor_total).toFixed(2)}</td></tr>`).join('')}
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









