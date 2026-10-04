window.productionModule = {
  phases: [
    { id: 'orcamento', name: '1. ORÇAMENTO', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'prevenda', name: '2. PRÉ-VENDA', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'aprovacao', name: '3. APROVAÇÃO', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'liberado', name: '4. LIBERADO', icon: 'M5 13l4 4L19 7' },
    { id: 'producao', name: '5. PRODUÇÃO', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'acabamento', name: '6. ACABAMENTO', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z' },
    { id: 'embalagem', name: '7. EMBALAGEM', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'entregue', name: '8. ENTREGA', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' }
  ],
  currentTab: 'orcamento',
  
  render() {
    const orders = window.store.getOrders();
    const clients = window.store.getClients();
    const container = document.getElementById('view-container');

    const tabsHtml = this.phases.map((p, index) => {
      const isActive = this.currentTab === p.id;
      const baseClass = isActive ? 'bg-blue-700 text-white shadow-md transform -translate-y-1 scale-105 z-10' : 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200 hover:text-sky-900 border-t-4 border-x';
      const phaseOrders = orders.filter(o => o.status_fase === p.id);
      const counterClass = isActive ? 'bg-white text-blue-700' : 'bg-sky-600 text-white';
      
      return `
        <button 
          onclick="productionModule.currentTab = '${p.id}'; productionModule.render()"
          ondragover="productionModule.allowDrop(event); event.currentTarget.classList.add('ring-4', 'ring-blue-400', 'z-20');"
          ondragleave="event.currentTarget.classList.remove('ring-4', 'ring-blue-400', 'z-20');"
          ondrop="event.currentTarget.classList.remove('ring-4', 'ring-blue-400', 'z-20'); productionModule.handleDrop(event, '${p.id}')"
          class="flex-1 min-w-[120px] py-2 px-1 rounded-t-2xl font-black text-[10px] uppercase transition-all duration-200 border-b-0 ${baseClass} flex flex-col items-center justify-center gap-1 relative overflow-hidden">
          <div class="absolute top-1 right-2 ${counterClass} px-2 py-0.5 rounded-full text-[11px] font-serif font-bold shadow-sm">${phaseOrders.length}</div>
          <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${p.icon}"></path></svg>
          <span class="text-center line-clamp-1 leading-tight px-2">${p.name}</span>
        </button>
      `;
    }).join('');

    const activePhase = this.phases.find(p => p.id === this.currentTab) || this.phases[0];
    const activeOrders = orders.filter(o => o.status_fase === activePhase.id);

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Fases da Producao</h1>
            <p class="text-slate-500 text-sm">Arraste os cards para as abas acima para trocar de fase</p>
          </div>
          <div class="flex gap-2">
            <button onclick="salesModule.openModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm">
              + Novo Pedido na Fila
            </button>
          </div>
        </div>

        <div class="flex flex-wrap md:flex-nowrap w-full gap-1 border-b-2 border-blue-600">
          ${tabsHtml}
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-b-xl p-4 min-h-[60vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" ondragover="productionModule.allowDrop(event)" ondrop="productionModule.handleDrop(event, '${activePhase.id}')">
            ${activeOrders.length === 0 ? `<div class="col-span-full py-12 text-center text-slate-400 font-bold">Nenhum pedido nesta fase.</div>` : activeOrders.map(o => this.renderCard(o, clients)).join('')}
          </div>
        </div>
      </div>
    `;
  },
  
  renderCard(order, clients) {
    const client = clients.find(c => c.id === order.cliente_id) || { nome: 'Cliente não vinculado' };
    const totalArea = (order.itens || []).reduce((acc, it) => acc + (it.tipo_calculo === 'm2' ? (it.largura_x * it.comprimento_y * it.quantidade) : 0), 0);

    let cardColor = 'bg-white border-slate-200';
    let textColor = 'text-slate-800';
    let labelColor = 'text-slate-500';
    let valueColor = 'text-blue-600';
    let amtColor = 'text-purple-700';
    let dividerColor = 'border-slate-100';
    
    if (order.previsao_entrega) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const dParts = order.previsao_entrega.split('-');
      const deadline = new Date(dParts[0], dParts[1]-1, dParts[2]);
      deadline.setHours(0,0,0,0);
      const diffTime = deadline - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0 && order.status_fase !== 'entregue') {
        cardColor = 'bg-red-600 border-red-700 shadow-md';
        textColor = 'text-white font-bold';
        labelColor = 'text-red-100';
        valueColor = 'text-white';
        amtColor = 'text-red-100';
        dividerColor = 'border-red-500';
      } else if (diffDays === 0 && order.status_fase !== 'entregue') {
        cardColor = 'bg-yellow-400 border-yellow-500 shadow-md';
        textColor = 'text-yellow-900 font-bold';
        labelColor = 'text-yellow-700';
        valueColor = 'text-yellow-900';
        amtColor = 'text-yellow-800';
        dividerColor = 'border-yellow-500';
      } else if (diffDays > 0 && order.status_fase !== 'entregue') {
        cardColor = 'bg-emerald-500 border-emerald-600 shadow-md';
        textColor = 'text-white font-bold';
        labelColor = 'text-emerald-100';
        valueColor = 'text-white';
        amtColor = 'text-emerald-100';
        dividerColor = 'border-emerald-400';
      }
    }

    return `
      <div id="kanban-card-${order.id}" class="kanban-card ${cardColor} p-3 rounded-lg border transition-all duration-300 transform" draggable="true" ondragstart="productionModule.handleDragStart(event, '${order.id}')" ondblclick="salesModule.editOrder('${order.id}')" style="cursor: pointer;">
        <div class="flex justify-between items-start">
          <span class="font-mono font-bold ${valueColor} text-xs">#${order.numero}</span>
          ${(order.historico && order.historico.length > 0) ? `
          <div class="text-[9px] ${labelColor} font-mono text-right bg-black/5 px-2 py-1 rounded shadow-sm">
            <div>${new Date(order.historico[order.historico.length - 1].data).toLocaleDateString('pt-BR')}</div>
            <div>${new Date(order.historico[order.historico.length - 1].data).toLocaleTimeString('pt-BR')}</div>
            <div class="font-black ${valueColor} uppercase mt-0.5">${order.historico[order.historico.length - 1].usuario}</div>
          </div>
          ` : `
          <span class="text-[10px] ${labelColor} font-mono">${order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'Sem prazo'}</span>
          `}
        </div>

        <h4 class="font-bold ${textColor} text-xs mt-1 truncate">${client.nome}</h4>
        
        <div class="mt-2 space-y-1 text-[11px] ${labelColor}">
          <p class="font-medium ${textColor} line-clamp-1">${order.itens && order.itens[0] ? order.itens[0].descricao : 'Serviço'}</p>
          ${totalArea > 0 ? `<p class="font-mono ${amtColor} font-semibold">${totalArea.toFixed(2)} m² no total</p>` : ''}
          ${order.itens && order.itens.length > 1 ? `<p class="opacity-80">+ ${order.itens.length - 1} item(ns) adicionais</p>` : ''}
        </div>

        ${order.foto_arte_url ? `
          <div class="mt-2 h-16 rounded overflow-hidden border ${dividerColor}">
            <img src="${order.foto_arte_url}" class="w-full h-full object-cover">
          </div>
        ` : ''}

        <div class="mt-3 pt-2 border-t ${dividerColor} flex justify-between items-center text-[11px]">
          <span class="font-bold ${textColor}">R$ ${Number(order.valor_final||0).toFixed(2)}</span>
          <div class="flex gap-1 items-center">
            <button onclick="event.stopPropagation(); productionModule.returnPhase('${order.id}')" class="${valueColor} hover:opacity-70 font-bold flex items-center" title="Retornar Fase">
              &larr;
            </button>
            <span class="${labelColor} opacity-50">|</span>
            <button onclick="event.stopPropagation(); salesModule.openProtocolModal('${order.id}')" class="${valueColor} hover:opacity-70 font-bold" title="Protocolo de Entrega">
              Prot.
            </button>
            <span class="${labelColor} opacity-50">|</span>
            <button onclick="event.stopPropagation(); productionModule.advancePhase('${order.id}')" class="${valueColor} hover:opacity-70 font-bold flex items-center" title="Avançar Fase">
              &rarr;
            </button>
          </div>
        </div>
      </div>
    `;
  },

  handleDragStart(e, orderId) {
    e.dataTransfer.setData('text/plain', orderId);
    e.target.classList.add('dragging');
  },

  allowDrop(e) {
    e.preventDefault();
  },

  async confirmPhaseChange(orderId, newPhaseId, sourceEl) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const client = window.store.getClients().find(c => c.id === order.cliente_id);
    const clientName = client ? client.nome : 'Cliente não vinculado';
    const oldPhaseObj = this.phases.find(p => p.id === order.status_fase);
    const newPhaseObj = this.phases.find(p => p.id === newPhaseId);
    
    const dataPedido = order.data_venda ? new Date(order.data_venda).toLocaleDateString('pt-BR') : 'Sem data';
    const prazo = order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'Sem prazo';

    const msg = `MUDANÇA DE FASE\n\nID: #${order.numero}\nCliente: ${clientName}\nData do Pedido: ${dataPedido}\nPrazo de Entrega: ${prazo}\n\nConfirma a mudança de fase de "${oldPhaseObj.name}" para "${newPhaseObj.name}"?`;
    
    if (confirm(msg)) {
      if (sourceEl) {
        sourceEl.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        sourceEl.style.transform = 'scale(0.5) translateY(-50px)';
        sourceEl.style.opacity = '0';
        await new Promise(r => setTimeout(r, 400));
      }
      
      await window.store.updateOrderStatus(orderId, newPhaseId);
      
      if (newPhaseId === 'entregue' && !order.estoque_baixado) {
        this.deductStock(order);
      }
      
      this.currentTab = newPhaseId;
      this.render();
    }
  },

  async handleDrop(e, newPhaseId) {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      const el = document.getElementById(`kanban-card-${orderId}`);
      await this.confirmPhaseChange(orderId, newPhaseId, el);
    }
  },

  deductStock(order) {
    const products = window.store.getProducts();
    order.itens.forEach(it => {
      if(it.produto_id) {
        const p = products.find(prod => prod.id === it.produto_id);
        if(p) {
          if (p.tipo_cobranca === 'm2') p.estoque_atual = (parseFloat(p.estoque_atual) || 0) - (parseFloat(it.area_m2) * parseFloat(it.quantidade));
          else if (p.tipo_cobranca === 'linear') p.estoque_atual = (parseFloat(p.estoque_atual) || 0) - (parseFloat(it.largura_x) * parseFloat(it.quantidade));
          else p.estoque_atual = (parseFloat(p.estoque_atual) || 0) - parseFloat(it.quantidade);
          window.store.saveProduct(p);
        }
      }
    });
    order.estoque_baixado = true;
    
    const s = window.store.getSettings();
    const yieldM2 = parseFloat(s.inkEcoYield) || 1200;
    let totalArea = 0;
    order.itens.forEach(it => { if(it.tipo_calculo === 'm2') totalArea += (parseFloat(it.area_m2) * parseFloat(it.quantidade)); });
    if(totalArea > 0 && s.inkEcoStock !== undefined) {
      s.inkEcoStock = Math.max(0, parseFloat(s.inkEcoStock) - (totalArea / yieldM2));
      window.store.save('grafsis_settings', s);
    }
    const allOrders = window.store.getOrders();
    const oIdx = allOrders.findIndex(o => o.id === order.id);
    if(oIdx > -1) { allOrders[oIdx] = order; window.store.save('grafsis_orders', allOrders); }
  },

  async advancePhase(orderId) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const currentIndex = this.phases.findIndex(p => p.id === order.status_fase);
    if (currentIndex < this.phases.length - 1) {
      const nextPhase = this.phases[currentIndex + 1].id;
      const el = document.getElementById(`kanban-card-${orderId}`);
      await this.confirmPhaseChange(orderId, nextPhase, el);
    }
  },

  async returnPhase(orderId) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const currentIndex = this.phases.findIndex(p => p.id === order.status_fase);
    if (currentIndex > 0) {
      const prevPhase = this.phases[currentIndex - 1].id;
      const el = document.getElementById(`kanban-card-${orderId}`);
      await this.confirmPhaseChange(orderId, prevPhase, el);
    }
  }
};

