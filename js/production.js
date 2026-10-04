window.productionModule = {
  phases: [
    { id: 'orcamento', name: 'FASE 1<br>ORCAMENTO / PEDIDO', badge: 'bg-yellow-400 text-yellow-900', inactive: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
    { id: 'prevenda', name: 'FASE 2<br>PRE-VENDA', badge: 'bg-emerald-500 text-white', inactive: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    { id: 'aprovacao', name: 'FASE 3<br>APROVACAO', badge: 'bg-pink-400 text-white', inactive: 'bg-pink-50 text-pink-700 border-pink-300' },
    { id: 'liberado', name: 'FASE 4<br>LIBERADO O.S.', badge: 'bg-blue-500 text-white', inactive: 'bg-blue-50 text-blue-700 border-blue-300' },
    { id: 'producao', name: 'FASE 5<br>EM PRODUCAO', badge: 'bg-indigo-500 text-white', inactive: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
    { id: 'acabamento', name: 'FASE 6<br>ACABAMENTO', badge: 'bg-purple-500 text-white', inactive: 'bg-purple-50 text-purple-700 border-purple-300' },
    { id: 'embalagem', name: 'FASE 7<br>EMBALAGEM', badge: 'bg-orange-500 text-white', inactive: 'bg-orange-50 text-orange-700 border-orange-300' },
    { id: 'entregue', name: 'FASE 8<br>EXPEDICAO / ENTREGA', badge: 'bg-slate-800 text-white', inactive: 'bg-slate-100 text-slate-700 border-slate-300' }
  ],
  currentTab: 'orcamento',
  
  render() {
    const orders = window.store.getOrders();
    const clients = window.store.getClients();
    const container = document.getElementById('view-container');

    // Create the tabs
    const tabsHtml = this.phases.map(p => {
      const isActive = this.currentTab === p.id;
      const baseClass = isActive ? `${p.badge} shadow-md transform -translate-y-1 scale-105 z-10` : `${p.inactive} hover:bg-opacity-80 border-t-4 border-x`;
      const phaseOrders = orders.filter(o => o.status_fase === p.id);
      
      return `
        <button 
          onclick="productionModule.currentTab = '${p.id}'; productionModule.render()"
          ondragover="productionModule.allowDrop(event); event.currentTarget.classList.add('ring-4', 'ring-blue-400', 'z-20');"
          ondragleave="event.currentTarget.classList.remove('ring-4', 'ring-blue-400', 'z-20');"
          ondrop="event.currentTarget.classList.remove('ring-4', 'ring-blue-400', 'z-20'); productionModule.handleDrop(event, '${p.id}')"
          class="flex-1 min-w-[120px] py-2 px-1 rounded-t-2xl font-black text-[10px] uppercase transition-all duration-200 border-b-0 ${baseClass} flex flex-col items-center justify-center gap-1">
          <span class="text-center line-clamp-2 leading-tight">${p.name}</span>
          <span class="bg-white/90 text-slate-800 px-2 py-0.5 rounded-full text-[10px] shadow-sm">${phaseOrders.length}</span>
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

    return `
      <div class="kanban-card" draggable="true" ondragstart="productionModule.handleDragStart(event, '${order.id}')">
        <div class="flex justify-between items-start">
          <span class="font-mono font-bold text-blue-600 text-xs">#${order.numero}</span>
          ${(order.historico && order.historico.length > 0) ? `
          <div class="text-[9px] text-slate-500 font-mono text-right bg-slate-50 border border-slate-100 px-2 py-1 rounded shadow-sm">
            <div>${new Date(order.historico[order.historico.length - 1].data).toLocaleDateString('pt-BR')}</div>
            <div>${new Date(order.historico[order.historico.length - 1].data).toLocaleTimeString('pt-BR')}</div>
            <div class="font-black text-blue-600 uppercase mt-0.5">${order.historico[order.historico.length - 1].usuario}</div>
          </div>
          ` : `
          <span class="text-[10px] text-slate-400 font-mono">${order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'Sem prazo'}</span>
          `}
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
      
      const order = window.store.getOrders().find(o => o.id === orderId);
      if (newPhaseId === 'entregue' && order && !order.estoque_baixado) {
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
        
        // Deduct Ink
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
      }
      this.render();
    }
  },

  advancePhase(orderId) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const currentIndex = this.phases.findIndex(p => p.id === order.status_fase);
    if (currentIndex < this.phases.length - 1) {
      const nextPhase = this.phases[currentIndex + 1].id;
      
      order.historico = order.historico || [];
      order.historico.push({
        fase: nextPhase,
        data: new Date().toISOString(),
        usuario: window.app?.currentUser?.nome || 'Sistema'
      });
      order.status_fase = nextPhase;

      if (nextPhase === 'entregue' && !order.estoque_baixado) {
        this.deductStock(order);
      }
      
      window.store.save('grafsis_orders', orders);
      this.render();
    }
  }
};






