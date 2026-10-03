window.salesModule = {
  activeItems: [],
  render() {
    const orders = window.store.getOrders();
    const container = document.getElementById("view-container");
    container.innerHTML = `<div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 class="text-2xl font-bold text-slate-800">Vendas & Pre-Vendas</h1>
        <p class="text-slate-500 text-sm">Emissao de orcamentos, vendas, layouts e protocolos</p></div>
        <button onclick="salesModule.openModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm">Novo Orcamento / Venda</button>
      </div>
      <div id="orders-list">${this.renderOrdersTable(orders)}</div>
    </div>`;
  },
  renderOrdersTable(orders) {
    if (orders.length === 0) {
      return `<div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Nenhum pedido ou orcamento</div>`;
    }
    const clients = window.store.getClients();
    return `<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto"><table class="w-full text-left text-sm text-slate-600"><thead class="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b"><tr><th class="p-3">Codigo</th><th class="p-3">Cliente</th><th class="p-3">Valor</th><th class="p-3">Fase</th><th class="p-3 text-right">Acoes</th></tr></thead><tbody>` +
    orders.map(o => {
      const cl = clients.find(c => c.id === o.cliente_id) || { nome: "Consumidor" };
      return `<tr class="border-b hover:bg-slate-50"><td class="p-3 font-mono font-bold text-blue-600">#${o.numero}</td><td class="p-3 font-semibold">${cl.nome}</td><td class="p-3 font-bold">R$ ${Number(o.valor_final||0).toFixed(2)}</td><td class="p-3">${this.getPhaseBadge(o.status_fase)}</td><td class="p-3 text-right"><button onclick="salesModule.openProtocolModal(\x27${o.id}\x27)" class="text-emerald-600 px-2 font-bold">OS/Protocolo</button><button onclick="financeModule.openCashierModal(\x27${o.id}\x27)" class="text-blue-600 px-2 font-bold bg-blue-50 border border-blue-200 rounded mx-1 hover:bg-blue-100">💰 Caixa</button><button onclick="salesModule.sendWhatsAppOrder(\x27${o.id}\x27)" class="text-green-600 px-2 font-bold">WhatsApp</button><button onclick="salesModule.delete(\x27${o.id}\x27)" class="text-red-500 px-2 font-bold">Excluir</button></td></tr>`;
    }).join("") + `</tbody></table></div>`;
  },
  getPhaseBadge(phase) {
    const labels = { orcamento: "0. OrÃ§amento", prevenda: "1. PrÃ©-Venda (Arte)", venda: "2. Venda/ProduÃ§Ã£o", entregue: "3. Entregue" };
    return `<span class="px-2 py-0.5 rounded text-[11px] uppercase font-bold badge-${phase}">${labels[phase] || phase}</span>`;
  },
  search(term) {
    const orders = window.store.getOrders();
    const t = term.toLowerCase().trim();
    const clients = window.store.getClients();
    const filtered = orders.filter(o => {
      const client = clients.find(c => c.id === o.cliente_id) || {};
      return String(o.numero).includes(t) || (client.nome && client.nome.toLowerCase().includes(t));
    });
    document.getElementById("orders-list").innerHTML = this.renderOrdersTable(filtered);
  },
  filterPhase(phase) {
    const orders = window.store.getOrders();
    if (!phase) { document.getElementById("orders-list").innerHTML = this.renderOrdersTable(orders); return; }
    document.getElementById("orders-list").innerHTML = this.renderOrdersTable(orders.filter(o => o.status_fase === phase));
  },
  createOrderForClient(clientId) { this.openModal({ clientId }); },
}
  openModal(params = {}) {
    const clients = window.store.getClients();
    const products = window.store.getProducts();
    const isEdit = params.orderId ? true : false;
    const order = isEdit ? window.store.getOrders().find(o => o.id === params.orderId) : null;
    this.activeItems = order ? JSON.parse(JSON.stringify(order.itens || [])) : [];
    if (params.preItem) { this.activeItems.push(params.preItem); }

    const modalHtml = `
      <div id="order-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
          <div class="flex justify-between items-center pb-4 border-b">
            <div>
              <h2 class="text-xl font-bold text-slate-800">${isEdit ? 'Editar Pedido #' + order.numero : 'Novo Orcamento / Pedido de Venda'}</h2>
              <p class="text-[10px] text-blue-600 font-bold uppercase mt-1">Vendedor: ${window.app?.currentUser?.nome || "Vendedor"}</p>
              <p class="text-xs text-slate-500">Calculo fracionado de m2 (Largura X x Comprimento Y) e metro linear</p>
            </div>
            <button onclick="document.getElementById('order-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
          </div>

          <form id="order-form" onsubmit="salesModule.saveOrder(event, '${order ? order.id : ''}')" class="mt-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label class="block text-xs font-semibold mb-1">Cliente *</label>
                <select name="cliente_id" required class="w-full p-2 border rounded-lg text-sm bg-white">
                  <option value="">Selecione...</option>
                  ${clients.map(c => `<option value="${c.id}" ${(order && order.cliente_id === c.id) || params.clientId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">Fase da Producao</label>
                <select name="status_fase" class="w-full p-2 border rounded-lg text-sm bg-white">
                  <option value="orcamento" ${order && order.status_fase === 'orcamento' ? 'selected' : ''}>0. OrÃ§amento</option>
                  <option value="prevenda" ${order && order.status_fase === 'prevenda' ? 'selected' : ''}>1. PrÃ©-venda (Arte em AprovaÃ§Ã£o)</option>
                  <option value="venda" ${order && order.status_fase === 'venda' ? 'selected' : ''}>2. Venda / ProduÃ§Ã£o</option>
                  <option value="entregue" ${order && order.status_fase === 'entregue' ? 'selected' : ''}>3. Entregue / ConcluÃ­do</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">Tipo de Operação</label>
                <select name="tipo_operacao" class="w-full p-2 border rounded-lg text-sm bg-white">
                  <option value="venda" ${order && order.tipo_operacao === 'venda' ? 'selected' : ''}>Venda</option>
                  <option value="pre-venda" ${order && order.tipo_operacao === 'pre-venda' ? 'selected' : ''}>Pré-Venda</option>
                  <option value="orcamento" ${order && order.tipo_operacao === 'orcamento' ? 'selected' : ''}>Orçamento</option>
                  <option value="patrocinio" ${order && order.tipo_operacao === 'patrocinio' ? 'selected' : ''}>Patrocínio (100% Desc)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">Previsão Entrega</label>
                <input type="date" name="previsao_entrega" value="${order ? (order.previsao_entrega || '') : ''}" class="w-full p-2 border rounded-lg text-sm bg-white">
              </div>
            </div>

            <!-- Adicionar Item Fracionado -->
            <div class="border rounded-xl p-3 bg-white">
              <h3 class="text-xs font-bold text-slate-700 uppercase mb-2">Adicionar Item Fracionado (m2 ou linear)</h3>
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2 rounded-lg text-xs">
                <div class="sm:col-span-4">
                  <label class="block font-semibold mb-0.5">Produto Base</label>
                  <select id="item-prod-select" onchange="salesModule.handleProdSelect(this)" class="w-full p-1.5 border rounded bg-white">
                    <option value="">Selecione...</option>
                    ${products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (R$ ${p.preco_base}/${p.unidade_medida})</option>`).join('')}
                  </select>
                </div>
                <div class="sm:col-span-8">
                  <label class="block font-semibold mb-0.5">Descricao / Acabamentos</label>
                  <input type="text" id="item-desc" placeholder="Ex: Banner com bainha e ilhos" class="w-full p-1.5 border rounded bg-white">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-0.5">Tipo</label>
                  <select id="item-type" onchange="salesModule.toggleDimensionInputs()" class="w-full p-1.5 border rounded bg-white">
                    <option value="m2">m2 (X x Y)</option>
                    <option value="linear">Linear</option>
                    <option value="unidade">Unitario</option>
                  </select>
                </div>
                <div class="sm:col-span-2" id="div-width">
                  <label class="block font-semibold mb-0.5">Largura X (m)</label>
                  <input type="number" step="0.01" id="item-width" value="1.00" class="w-full p-1.5 border rounded bg-white">
                </div>
                <div class="sm:col-span-2" id="div-height">
                  <label class="block font-semibold mb-0.5">Compr. Y (m)</label>
                  <input type="number" step="0.01" id="item-height" value="1.00" class="w-full p-1.5 border rounded bg-white">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-0.5">Qtd</label>
                  <input type="number" step="1" id="item-qty" value="1" min="1" class="w-full p-1.5 border rounded bg-white">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-0.5">Preco Unit.</label>
                  <input type="number" step="0.01" id="item-price" value="0.00" class="w-full p-1.5 border rounded bg-white">
                </div>
                <div class="sm:col-span-2 flex items-end">
                  <button type="button" onclick="salesModule.addItemToOrder()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded">+ Inserir</button>
                </div>
              </div>

              <div class="mt-3 overflow-x-auto">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-100 text-slate-500 uppercase">
                    <tr><th class="p-2">Item</th><th class="p-2">Dimensoes</th><th class="p-2">Qtd</th><th class="p-2">Area (m2)</th><th class="p-2">Preco</th><th class="p-2">Total</th><th class="p-2 text-right">Acao</th></tr>
                  </thead>
                  <tbody id="order-items-tbody">${this.renderActiveItemsHtml()}</tbody>
                </table>
              </div>
            </div>

            <!-- Fotos e Totais -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="bg-slate-50 p-3 rounded-xl border">
                <label class="block text-xs font-semibold mb-1">Foto da Arte / Layout (URL ou Arquivo)</label>
                <input type="text" name="foto_arte_url" id="order-arte-url" value="${order ? (order.foto_arte_url || '') : ''}" placeholder="Link da imagem da arte" class="w-full p-1.5 border rounded text-xs bg-white mb-2">
                <input type="file" accept="image/*" onchange="salesModule.handleArteUpload(this)" class="text-xs">
                <label class="block text-xs font-semibold mt-3 mb-1">Observacoes Tecnicas</label>
                <textarea name="observacoes" rows="2" placeholder="Sangria, tipo de impressao, tintas..." class="w-full p-1.5 border rounded text-xs bg-white">${order ? (order.observacoes || '') : ''}</textarea>
              </div>

              <div class="bg-blue-50/70 p-3 rounded-xl border border-blue-200 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between text-xs py-1"><span>Subtotal:</span><strong id="order-subtotal">R$ 0,00</strong></div>
                  <div class="flex justify-between items-center text-xs py-1">
                    <span>Desconto (R$):</span>
                    <input type="number" step="0.01" name="desconto" id="order-discount" oninput="salesModule.recalcTotals()" value="${order ? (order.desconto || 0) : 0}" class="w-24 p-1 border rounded text-right bg-white">
                  </div>
                  <div class="flex justify-between items-center text-sm font-black text-blue-900 border-t pt-2 mt-2">
                    <span>Total Final:</span>
                    <span id="order-total-final" class="text-xl text-blue-700">R$ 0,00</span>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs mt-3">
                  <div>
                    <label class="block font-semibold mb-0.5">Forma Pagto</label>
                    <select name="forma_pagamento" class="w-full p-1 border rounded bg-white">
                      <option value="Pix">Pix</option>
                      <option value="Cartao de Credito">Cartao Credito</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Boleto Faturado">Boleto</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-semibold mb-0.5">Status Pagto</label>
                    <select name="status_pagamento" class="w-full p-1 border rounded bg-white">
                      <option value="pendente">Pendente</option>
                      <option value="parcial">Sinal 50%</option>
                      <option value="pago">Quitado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t flex justify-end gap-2">
              <button type="button" onclick="document.getElementById('order-modal').remove()" class="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
              <button type="submit" class="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow">${isEdit ? 'Atualizar Pedido' : 'Finalizar Pedido'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.recalcTotals();
  },
}
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
    const type = document.getElementById('item-type').value;
    const w = parseFloat(document.getElementById('item-width').value) || 1;
    const h = parseFloat(document.getElementById('item-height').value) || 1;
    const qty = parseFloat(document.getElementById('item-qty').value) || 1;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const area = type === 'm2' ? (w * h) : (type === 'linear' ? w : 1);
    const total = area * qty * price;

    this.activeItems.push({
      produto_id: prodSelect.value, produto_nome: prodNome, descricao: desc, tipo_calculo: type, largura_x: w, comprimento_y: h,
      quantidade: qty, preco_unitario: price, area_m2: area, valor_total: total
    });
    document.getElementById('order-items-tbody').innerHTML = this.renderActiveItemsHtml();
    document.getElementById('item-desc').value = '';
    this.recalcTotals();
  },
  removeItem(idx) {
    this.activeItems.splice(idx, 1);
    document.getElementById('order-items-tbody').innerHTML = this.renderActiveItemsHtml();
    this.recalcTotals();
  },
  renderActiveItemsHtml() {
    if (this.activeItems.length === 0) return `<tr><td colspan="7" class="p-2 text-center text-slate-400">Nenhum item</td></tr>`;
    return this.activeItems.map((it, idx) => `
      <tr class="border-b">
        <td class="p-2 font-medium">${it.descricao}</td>
        <td class="p-2 font-mono">${it.tipo_calculo === 'm2' ? it.largura_x + 'm x ' + it.comprimento_y + 'm' : (it.tipo_calculo === 'linear' ? it.largura_x + 'm' : '-')}</td>
        <td class="p-2 font-bold">${it.quantidade}</td>
        <td class="p-2 font-mono text-purple-700">${it.tipo_calculo === 'm2' ? (it.largura_x * it.comprimento_y * it.quantidade).toFixed(2) + ' m2' : '-'}</td>
        <td class="p-2 font-mono">R$ ${Number(it.preco_unitario).toFixed(2)}</td>
        <td class="p-2 font-bold text-blue-700">R$ ${Number(it.valor_total).toFixed(2)}</td>
        <td class="p-2 text-right"><button type="button" onclick="salesModule.removeItem(${idx})" class="text-red-500 font-bold">&times;</button></td>
      </tr>
    `).join('');
  },
  recalcTotals() {
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
  saveOrder(e, id) {
    e.preventDefault();
    if (this.activeItems.length === 0) { alert('Adicione pelo menos um item'); return; }
    const form = e.target;
    const { subtotal, discount, finalTotal } = this.recalcTotals();
    const orderData = {
      id: id || undefined,
      cliente_id: form.cliente_id.value,
      tipo_operacao: form.tipo_operacao ? form.tipo_operacao.value : 'venda',
      vendedor: window.app?.currentUser?.nome || "Vendedor",
      status_fase: form.status_fase.value,
      previsao_entrega: form.previsao_entrega.value,
      foto_arte_url: form.foto_arte_url.value,
      observacoes: form.observacoes.value,
      forma_pagamento: form.forma_pagamento.value,
      status_pagamento: form.status_pagamento.value,
      valor_total: subtotal,
      desconto: discount,
      valor_final: finalTotal,
      itens: this.activeItems
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
    document.getElementById('order-modal').remove();
    this.render();
  },
  editModal(id) { this.openModal({ orderId: id }); },
  delete(id) {
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
              <button onclick="window.print()" class="px-4 py-2 text-xs bg-blue-600 text-white rounded font-bold">Imprimir OS/Protocolo</button><button onclick="financeModule.openCashierModal(\x27${o.id}\x27)" class="text-blue-600 px-2 font-bold bg-blue-50 border border-blue-200 rounded mx-1 hover:bg-blue-100">💰 Caixa</button>
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
  },;







