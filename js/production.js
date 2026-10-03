window.productionModule = {
  phases: [
    { id: 'orcamento', name: '0. Orçamento', badge: 'bg-indigo-100 text-indigo-800' },
    { id: 'prevenda', name: '1. Pré-Venda (Arte em Aprovação)', badge: 'bg-amber-100 text-amber-800' },
    { id: 'venda', name: '2. Venda / Produção', badge: 'bg-blue-100 text-blue-800' },
    { id: 'entregue', name: '3. Entregue / Concluído', badge: 'bg-emerald-100 text-emerald-800' }
  ],

  render() {
    const orders = window.store.getOrders();
    const clients = window.store.getClients();
    const container = document.getElementById('view-container');

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Fases da Produção (Kanban)</h1>
            <p class="text-slate-500 text-sm">Esteira de produção visual para comunicação visual, gráficas e estamparia</p>
          </div>
          <div class="flex gap-2">
            <button onclick="salesModule.openModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm">
              + Novo Pedido na Fila
            </button>
          </div>
        </div>

        <div class="kanban-board">
          ${this.phases.map(phase => {
            const phaseOrders = orders.filter(o => o.status_fase === phase.id);
            return `
              <div class="kanban-col" ondragover="productionModule.allowDrop(event)" ondrop="productionModule.handleDrop(event, '${phase.id}')">
                <div class="kanban-header ${phase.badge}">
                  <span>${phase.name}</span>
                  <span class="bg-white/80 px-2 py-0.5 rounded-full text-xs font-bold text-slate-700 shadow-sm">${phaseOrders.length}</span>
                </div>
                <div class="kanban-cards">
                  ${phaseOrders.map(o => this.renderCard(o, clients)).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  renderCard(order, clients) {
    const client = clients.find(c => c.id === order.cliente_id) || { nome: 'Cliente não vinculado' };
    const totalArea = (order.itens || []).reduce((acc, it) => acc + (it.tipo_calculo === 'm2' ? (it.largura_x * it.comprimento_y * it.quantidade) : 0), 0);

    return `
      <div class="kanban-card" draggable="true" ondragstart="productionModule.handleDragStart(event, '${order.id}')">
        <div class="flex justify-between items-start">
          <span class="font-mono font-bold text-blue-600 text-xs">#${order.numero}</span>
          <span class="text-[10px] text-slate-400 font-mono">${order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'Sem prazo'}</span>
        </div>

        <h4 class="font-bold text-slate-800 text-xs mt-1 truncate">${client.nome}</h4>
        
        <div class="mt-2 space-y-1 text-[11px] text-slate-600">
          <p class="font-medium text-slate-700 line-clamp-1">${order.itens && order.itens[0] ? order.itens[0].descricao : 'Serviço'}</p>
          ${totalArea > 0 ? `<p class="font-mono text-purple-700 font-semibold">${totalArea.toFixed(2)} m² no total</p>` : ''}
          ${order.itens && order.itens.length > 1 ? `<p class="text-slate-400">+ ${order.itens.length - 1} item(ns) adicionais</p>` : ''}
        </div>

        ${order.foto_arte_url ? `
          <div class="mt-2 h-16 rounded overflow-hidden border border-slate-200">
            <img src="${order.foto_arte_url}" class="w-full h-full object-cover">
          </div>
        ` : ''}

        <div class="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
          <span class="font-bold text-slate-800">R$ ${Number(order.valor_final||0).toFixed(2)}</span>
          <div class="flex gap-1">
            <button onclick="salesModule.openProtocolModal('${order.id}')" class="text-emerald-600 hover:text-emerald-700 font-semibold" title="Protocolo de Entrega">
              Protocolo
            </button>
            <span class="text-slate-300">|</span>
            <button onclick="productionModule.advancePhase('${order.id}')" class="text-blue-600 hover:text-blue-700 font-semibold" title="Avançar Fase">
              Avançar &rarr;
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

  handleDrop(e, newPhaseId) {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      window.store.updateOrderStatus(orderId, newPhaseId);
      this.render();
    }
  },

  advancePhase(orderId) {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const currentIndex = this.phases.findIndex(p => p.id === order.status_fase);
    if (currentIndex < this.phases.length - 1) {
      const nextPhase = this.phases[currentIndex + 1].id;
      window.store.updateOrderStatus(orderId, nextPhase);
      this.render();
    }
  }
};