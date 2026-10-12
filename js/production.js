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
  searchTerm: '',
  filterUrgency: 'all',

  setSearchTerm(term) {
    this.searchTerm = term.toLowerCase();
    this.render();
  },

  setUrgencyFilter(filter) {
    this.filterUrgency = filter;
    this.render();
  },

  render() {
    const orders = window.store.getOrders();
    const clients = window.store.getClients();
    const container = document.getElementById('view-container');

    if (!this.mobileOpenPhases) {
      this.mobileOpenPhases = {};
      this.mobileOpenPhases[this.currentTab] = true;
    }

    // 1. Cálculos de KPIs em Tempo Real do Chão de Fábrica
    const today = new Date();
    today.setHours(0,0,0,0);

    let countAtrasados = 0;
    let countHoje = 0;
    let totalM2EmProducao = 0;

    orders.forEach(o => {
      if (o.status_fase !== 'entregue' && o.previsao_entrega) {
        const parts = o.previsao_entrega.split('-');
        const dLine = new Date(parts[0], parts[1]-1, parts[2]);
        dLine.setHours(0,0,0,0);
        const diffDays = Math.ceil((dLine - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) countAtrasados++;
        else if (diffDays === 0) countHoje++;
      }

      if (o.status_fase !== 'entregue') {
        (o.itens || []).forEach(it => {
          if (it.tipo_calculo === 'm2') {
            totalM2EmProducao += (Number(it.largura_x || 0) * Number(it.comprimento_y || 0) * Number(it.quantidade || 1));
          }
        });
      }
    });

    const countProducao = orders.filter(o => o.status_fase === 'producao').length;
    const countAcabamento = orders.filter(o => o.status_fase === 'acabamento' || o.status_fase === 'embalagem').length;
    const countLiberados = orders.filter(o => o.status_fase === 'liberado').length;

    // 2. Filtros e Busca Aplicados
    let filteredOrders = orders.filter(o => {
      // Filtro de Busca
      if (this.searchTerm) {
        const cli = clients.find(c => c.id === o.cliente_id);
        const cliNome = cli ? cli.nome.toLowerCase() : '';
        const numStr = String(o.numero || '');
        const itemDesc = (o.itens || []).map(it => (it.produto_nome || it.descricao || '').toLowerCase()).join(' ');
        if (!cliNome.includes(this.searchTerm) && !numStr.includes(this.searchTerm) && !itemDesc.includes(this.searchTerm)) {
          return false;
        }
      }

      // Filtro de Urgência
      if (this.filterUrgency !== 'all' && o.status_fase !== 'entregue') {
        if (!o.previsao_entrega) return false;
        const parts = o.previsao_entrega.split('-');
        const dLine = new Date(parts[0], parts[1]-1, parts[2]);
        dLine.setHours(0,0,0,0);
        const diffDays = Math.ceil((dLine - today) / (1000 * 60 * 60 * 24));
        if (this.filterUrgency === 'atrasado' && diffDays >= 0) return false;
        if (this.filterUrgency === 'hoje' && diffDays !== 0) return false;
        if (this.filterUrgency === 'noprazo' && diffDays <= 0) return false;
      }

      return true;
    });

    // Abas do Cabeçalho Superior
    const tabsHtml = this.phases.map(p => {
      const isActive = this.currentTab === p.id;
      const phaseOrders = filteredOrders.filter(o => o.status_fase === p.id);
      const baseClass = isActive 
        ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-lg transform -translate-y-0.5 z-10 border-b-2 border-white' 
        : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800';
      const counterClass = isActive ? 'bg-white text-blue-700 dark:bg-slate-900 dark:text-cyan-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      
      return `
        <button 
          onclick="productionModule.currentTab = '${p.id}'; productionModule.render()"
          ondragover="productionModule.allowDrop(event); event.currentTarget.classList.add('ring-4', 'ring-cyan-400', 'z-20');"
          ondragleave="event.currentTarget.classList.remove('ring-4', 'ring-cyan-400', 'z-20');"
          ondrop="event.currentTarget.classList.remove('ring-4', 'ring-cyan-400', 'z-20'); productionModule.handleDrop(event, '${p.id}')"
          class="flex-1 min-w-[110px] py-2.5 px-1.5 rounded-t-xl font-black text-[11px] uppercase transition-all duration-200 ${baseClass} flex flex-col items-center justify-center gap-1 relative overflow-hidden select-none">
          <div class="absolute top-1 right-2 ${counterClass} px-2 py-0.5 rounded-full text-[10px] font-mono font-black shadow-sm">${phaseOrders.length}</div>
          <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${p.icon}"></path></svg>
          <span class="text-center line-clamp-1 leading-tight px-1 font-bold">${p.name}</span>
        </button>
      `;
    }).join('');

    const activePhase = this.phases.find(p => p.id === this.currentTab) || this.phases[0];
    const activeOrders = filteredOrders.filter(o => o.status_fase === activePhase.id);

    // Layout Vertical Sanfona (Mobile)
    const mobileAccordionHtml = this.phases.map(p => {
      const isOpen = !!this.mobileOpenPhases[p.id];
      const isSelected = this.currentTab === p.id;
      const phaseOrders = filteredOrders.filter(o => o.status_fase === p.id);
      
      return `
        <div class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 transition-all">
          <button 
            type="button" 
            onclick="productionModule.toggleMobilePhase('${p.id}')"
            class="w-full p-4 flex items-center justify-between text-left transition select-none ${isSelected ? 'bg-blue-50/90 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900' : 'bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800'}">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${p.icon}"></path></svg>
              </div>
              <div>
                <div class="font-extrabold text-xs ${isSelected ? 'text-blue-900 dark:text-cyan-300' : 'text-slate-800 dark:text-slate-200'} uppercase tracking-wide flex items-center gap-2">
                  ${p.name}
                </div>
                <div class="text-[11px] text-slate-500 font-medium">${phaseOrders.length} pedido(s) nesta etapa</div>
              </div>
            </div>
            
            <div class="flex items-center gap-2.5">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${phaseOrders.length > 0 ? (isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 dark:bg-slate-700 text-white') : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
                ${phaseOrders.length}
              </span>
              <div class="w-6 h-6 rounded-full flex items-center justify-center bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                <svg class="w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </button>

          <div class="${isOpen ? 'block' : 'hidden'} p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
            ${phaseOrders.length === 0 ? `
              <div class="py-6 text-center text-slate-400 font-medium text-xs">
                Nenhum pedido nesta fase.
              </div>
            ` : `
              <div class="space-y-3">
                ${phaseOrders.map(o => this.renderCard(o, clients)).join('')}
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- 1. Barra de KPIs Operacionais do Chão de Fábrica (Estilo Profissional Imagem 1) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div class="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase block">Fila Geral</span>
              <strong class="text-base font-black text-slate-900 dark:text-white font-mono">${orders.length} pedidos</strong>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase block">Em Impressão</span>
              <strong class="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">${countProducao} em curso</strong>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase block">Acabamento</span>
              <strong class="text-base font-black text-purple-600 dark:text-purple-400 font-mono">${countAcabamento} peças</strong>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase block">Vence Hoje</span>
              <strong class="text-base font-black text-amber-600 dark:text-amber-400 font-mono">${countHoje} p/ hoje</strong>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border ${countAtrasados > 0 ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/40' : 'border-slate-200 dark:border-slate-800/80'} shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl ${countAtrasados > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'} flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold ${countAtrasados > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'} uppercase block">Atrasados</span>
              <strong class="text-base font-black ${countAtrasados > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'} font-mono">${countAtrasados} crítico</strong>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase block">Metros Produção</span>
              <strong class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">${totalM2EmProducao.toFixed(1)} m²</strong>
            </div>
          </div>
        </div>

        <!-- 2. Barra de Busca, Filtros Rápidos & Ações da Fábrica -->
        <div class="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          
          <!-- Campo de Busca em Tempo Real -->
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Buscar por O.S., Cliente ou Material..." 
              value="${this.searchTerm}" 
              oninput="productionModule.setSearchTerm(this.value)" 
              class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
          </div>

          <!-- Filtros de Urgência -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button onclick="productionModule.setUrgencyFilter('all')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${this.filterUrgency === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
              Todos
            </button>
            <button onclick="productionModule.setUrgencyFilter('atrasado')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${this.filterUrgency === 'atrasado' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'}">
              🚨 Atrasados (${countAtrasados})
            </button>
            <button onclick="productionModule.setUrgencyFilter('hoje')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${this.filterUrgency === 'hoje' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'}">
              ⏰ Vence Hoje (${countHoje})
            </button>
            <button onclick="productionModule.setUrgencyFilter('noprazo')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${this.filterUrgency === 'noprazo' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'}">
              ✅ No Prazo
            </button>
          </div>

          <!-- Botões de Ação -->
          <div class="flex items-center gap-2">
            <button onclick="salesModule.openCrmModal()" class="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5" title="Painel ARP / CRM de Clientes e Pós-Venda">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span>CRM & Pós-Venda</span>
            </button>
            <button onclick="salesModule.openModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5">
              <span>+ Novo Pedido</span>
            </button>
          </div>

        </div>

        <!-- 3. Versão Desktop: Abas Horizontais com Drag & Drop -->
        <div class="hidden md:flex flex-nowrap w-full gap-1 border-b-2 border-blue-600 dark:border-blue-500 pt-1 overflow-x-auto">
          ${tabsHtml}
        </div>

        <!-- 4. Versão Desktop: Grid de Cards Responsivo preenchendo a tela de forma harmoniosa -->
        <div class="hidden md:block bg-slate-50/70 dark:bg-[#080e1a] border border-slate-200 dark:border-slate-800 rounded-b-2xl p-4 sm:p-5 min-h-[50vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" ondragover="productionModule.allowDrop(event)" ondrop="productionModule.handleDrop(event, '${activePhase.id}')">
            ${activeOrders.length === 0 ? `
              <div class="col-span-full py-16 text-center text-slate-400 dark:text-slate-500">
                <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                <p class="font-extrabold text-sm">Nenhum pedido nesta fase com os filtros atuais.</p>
                <p class="text-xs text-slate-400 mt-1">Arraste pedidos para cá ou clique em "+ Novo Pedido" para alimentar a esteira.</p>
              </div>
            ` : activeOrders.map(o => this.renderCard(o, clients)).join('')}
          </div>
        </div>

        <!-- 5. Versão Mobile: Fases na Vertical Sanfona com 'Mostre e Esconde' -->
        <div class="md:hidden space-y-3 pb-8">
          <div class="flex justify-between items-center px-1 pt-1">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fases de Produção</span>
            <div class="flex items-center gap-2">
              <button type="button" onclick="productionModule.toggleAllMobilePhases(true)" class="text-[11px] font-bold text-blue-600 hover:underline">Expandir todas</button>
              <span class="text-slate-300">|</span>
              <button type="button" onclick="productionModule.toggleAllMobilePhases(false)" class="text-[11px] font-bold text-slate-500 hover:underline">Recolher</button>
            </div>
          </div>
          ${mobileAccordionHtml}
        </div>

      </div>
    `;
  },
  
  renderCard(order, clients) {
    const client = clients.find(c => c.id === order.cliente_id) || { nome: 'Cliente não vinculado' };
    const totalArea = (order.itens || []).reduce((acc, it) => acc + (it.tipo_calculo === 'm2' ? (Number(it.largura_x || 0) * Number(it.comprimento_y || 0) * Number(it.quantidade || 1)) : 0), 0);

    // Indicador visual de Prazo de Entrega
    let deadlineBadge = '';
    let borderAccent = 'border-slate-200 dark:border-slate-800';

    if (order.previsao_entrega) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const dParts = order.previsao_entrega.split('-');
      const deadline = new Date(dParts[0], dParts[1]-1, dParts[2]);
      deadline.setHours(0,0,0,0);
      const diffTime = deadline - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0 && order.status_fase !== 'entregue') {
        borderAccent = 'border-rose-500 dark:border-rose-500 shadow-rose-500/20';
        deadlineBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white shadow-sm animate-pulse">Atrasado (${Math.abs(diffDays)}d)</span>`;
      } else if (diffDays === 0 && order.status_fase !== 'entregue') {
        borderAccent = 'border-amber-400 dark:border-amber-500 shadow-amber-500/20';
        deadlineBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-900 shadow-sm">Hoje</span>`;
      } else {
        deadlineBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">${order.previsao_entrega.split('-').reverse().slice(0, 2).join('/')}</span>`;
      }
    } else {
      deadlineBadge = `<span class="text-[10px] text-slate-400 font-mono">Sem prazo</span>`;
    }

    const opBadge = order.tipo_operacao === 'permuta' 
      ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Permuta</span>'
      : (order.tipo_operacao === 'prevenda' 
        ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Pré-Venda</span>'
        : (order.tipo_operacao === 'orcamento'
          ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Orçamento</span>'
          : '<span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-cyan-300">Venda</span>'));

    return `
      <div 
        id="kanban-card-${order.id}" 
        class="kanban-card bg-white dark:bg-[#0c1527] p-3.5 rounded-2xl border ${borderAccent} shadow-sm hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1" 
        draggable="true" 
        ondragstart="productionModule.handleDragStart(event, '${order.id}')" 
        ondblclick="salesModule.openProductionWorkOrder('${order.id}')" 
        title="Duplo clique para abrir a Ordem de Serviço de Produção (Sem Valores Financeiros)"
        style="cursor: pointer;">
        
        <!-- Topo do Card: Número do Pedido + Badges de Urgência & Operação -->
        <div class="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-black text-sm text-blue-600 dark:text-cyan-400">#${order.numero}</span>
            ${opBadge}
          </div>
          <div>${deadlineBadge}</div>
        </div>

        <!-- Nome do Cliente em Destaque e Fonte Maior -->
        <h4 class="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm mt-2 truncate" title="${client.nome}">
          ${client.nome}
        </h4>
        
        <!-- Descrição Técnica dos Materiais -->
        <div class="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
          <p class="font-medium line-clamp-1 text-slate-800 dark:text-slate-200">
            ${order.itens && order.itens[0] ? (order.itens[0].produto_nome || order.itens[0].descricao) : 'Comunicação Visual'}
          </p>
          
          <div class="flex items-center gap-2 pt-0.5">
            ${totalArea > 0 ? `
              <span class="font-mono font-black text-indigo-600 dark:text-cyan-300 text-xs bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                ${totalArea.toFixed(2)} m²
              </span>
            ` : `
              <span class="font-mono font-bold text-slate-600 dark:text-slate-400 text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                ${order.itens ? order.itens.length : 1} item(ns)
              </span>
            `}
            ${order.itens && order.itens.length > 1 ? `<span class="text-[10px] text-slate-400">+ ${order.itens.length - 1} item(ns)</span>` : ''}
          </div>

          <!-- Acabamento Técnico -->
          ${order.itens && order.itens[0] && order.itens[0].acabamento ? `
            <p class="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate mt-1">
              ⚙️ ${order.itens[0].acabamento}
            </p>
          ` : ''}
        </div>

        <!-- Miniatura da Imagem da Arte (Com Visualização Rápida) -->
        ${order.foto_arte_url ? `
          <div class="mt-2.5 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 group relative" onclick="event.stopPropagation(); salesModule.openProductionWorkOrder('${order.id}')">
            <img src="${order.foto_arte_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Arte">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              🔍 Ver O.S. Técnica
            </div>
          </div>
        ` : ''}

        <!-- Responsável & Histórico -->
        <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
          <span class="truncate">👤 ${order.operador || 'Oficina'}</span>
          <span class="font-mono">${order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : ''}</span>
        </div>

        <!-- Rodapé do Card: SEM VALORES FINANCEIROS (R$) + Navegação de Fase -->
        <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <button 
            type="button" 
            onclick="event.stopPropagation(); salesModule.openProductionWorkOrder('${order.id}')" 
            class="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1" 
            title="Abrir Ordem de Serviço de Produção">
            <span>📋 Abrir O.S.</span>
          </button>
          
          <div class="flex gap-1.5 items-center">
            <button onclick="event.stopPropagation(); productionModule.returnPhase('${order.id}')" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 font-bold" title="Retornar Fase Anterior">
              &larr;
            </button>
            <button onclick="event.stopPropagation(); salesModule.openProtocolModal('${order.id}')" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200" title="Protocolo de Entrega">
              Prot.
            </button>
            <button onclick="event.stopPropagation(); productionModule.advancePhase('${order.id}')" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 font-bold" title="Avançar Próxima Fase">
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

