window.productionModule = {
  phases: [
    { id: 'orcamento', name: 'Orçamento', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'prevenda', name: 'Pré-Venda', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'aprovacao', name: 'Aprovação', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'liberado', name: 'Liberação', icon: 'M5 13l4 4L19 7' },
    { id: 'producao', name: 'Produção', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'acabamento', name: 'Acabamento', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z' },
    { id: 'embalagem', name: 'Expedição', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'entregue', name: 'Entrega', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' }
  ],
  currentTab: 'orcamento',
  searchTerm: '',
  filterUrgency: 'all',

  setSearchTerm(term) {
    this.searchTerm = term.toLowerCase();
    this.render();
  },

  clearSearch() {
    this.searchTerm = '';
    this.render();
  },

  setUrgencyFilter(filter) {
    this.filterUrgency = filter;
    this.render();
  },

  render() {
    try {
      const orders = window.store.getOrders();
      const clients = window.store.getClients();
      const container = document.getElementById('view-container');
      if (!container) return;

      if (!this.currentTab) {
        this.currentTab = 'orcamento';
      }

      if (!this.mobileOpenPhases) {
        this.mobileOpenPhases = {};
        this.mobileOpenPhases[this.currentTab] = true;
      }

    // 1. Cálculos de KPIs e Filtros de Gestão Semanal
    const today = new Date();
    today.setHours(0,0,0,0);

    // Gestão Semanal: Segunda a Domingo desta semana e da próxima semana
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ... 6 = Sábado
    const diffMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    const mondayThisWeek = new Date(today);
    mondayThisWeek.setDate(diffMonday);
    mondayThisWeek.setHours(0, 0, 0, 0);

    const sundayThisWeek = new Date(mondayThisWeek);
    sundayThisWeek.setDate(mondayThisWeek.getDate() + 6);
    sundayThisWeek.setHours(23, 59, 59, 999);

    const mondayNextWeek = new Date(mondayThisWeek);
    mondayNextWeek.setDate(mondayThisWeek.getDate() + 7);
    mondayNextWeek.setHours(0, 0, 0, 0);

    const sundayNextWeek = new Date(mondayNextWeek);
    sundayNextWeek.setDate(mondayNextWeek.getDate() + 6);
    sundayNextWeek.setHours(23, 59, 59, 999);

    let countAtrasados = 0;
    let countHoje = 0;
    let countEstaSemana = 0;
    let countSemanaQueVem = 0;
    let totalM2EmProducao = 0;

    orders.forEach(o => {
      if (o.status_fase !== 'entregue' && o.previsao_entrega) {
        const parts = o.previsao_entrega.split('-');
        const dLine = new Date(parts[0], parts[1]-1, parts[2]);
        dLine.setHours(12, 0, 0, 0);
        const diffDays = Math.ceil((dLine - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) countAtrasados++;
        else if (diffDays === 0) countHoje++;

        if (dLine >= mondayThisWeek && dLine <= sundayThisWeek) {
          countEstaSemana++;
        } else if (dLine >= mondayNextWeek && dLine <= sundayNextWeek) {
          countSemanaQueVem++;
        }
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

      // Filtro de Urgência e Gestão Semanal
      if (this.filterUrgency !== 'all' && o.status_fase !== 'entregue') {
        if (!o.previsao_entrega) return false;
        const parts = o.previsao_entrega.split('-');
        const dLine = new Date(parts[0], parts[1]-1, parts[2]);
        dLine.setHours(12, 0, 0, 0);
        const diffDays = Math.ceil((dLine - today) / (1000 * 60 * 60 * 24));
        if (this.filterUrgency === 'atrasado' && diffDays >= 0) return false;
        if (this.filterUrgency === 'hoje' && diffDays !== 0) return false;
        if (this.filterUrgency === 'noprazo' && diffDays <= 0) return false;
        if (this.filterUrgency === 'esta_semana') {
          if (dLine < mondayThisWeek || dLine > sundayThisWeek) return false;
        }
        if (this.filterUrgency === 'semana_que_vem') {
          if (dLine < mondayNextWeek || dLine > sundayNextWeek) return false;
        }
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
      const counterClass = isActive 
        ? 'bg-amber-300 text-slate-900 border-2 border-amber-400 shadow-md ring-2 ring-white/60' 
        : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs';
      
      return `
        <button 
          onclick="productionModule.currentTab = '${p.id}'; productionModule.render()"
          ondragover="productionModule.allowDrop(event); event.currentTarget.classList.add('ring-4', 'ring-cyan-400', 'z-20');"
          ondragleave="event.currentTarget.classList.remove('ring-4', 'ring-cyan-400', 'z-20');"
          ondrop="event.currentTarget.classList.remove('ring-4', 'ring-cyan-400', 'z-20'); productionModule.handleDrop(event, '${p.id}')"
          class="flex-1 min-w-[110px] py-2.5 px-1.5 rounded-t-xl font-black text-[11px] uppercase transition-all duration-200 ${baseClass} flex flex-col items-center justify-center gap-1 relative overflow-hidden select-none">
          <!-- Números de processos aumentados e em destaque (amarelo) -->
          <div class="absolute top-1 right-2 ${counterClass} px-2.5 py-0.5 rounded-full text-xs font-mono font-black scale-110 tracking-tight" title="${phaseOrders.length} processos nesta fase">${phaseOrders.length}</div>
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
              <!-- Destaque amarelo aumentado para o número de processos no mobile -->
              <span class="px-3 py-1 rounded-full text-xs font-mono font-black shadow-sm ${phaseOrders.length > 0 ? 'bg-amber-300 text-slate-900 border border-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
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

    // HTML da Barra de KPIs Operacionais (Totalmente ancorada na parte inferior, extensão 100% da página, cor em destaque e diferenciada)
    const kpisHtml = `
      <!-- BARRA DE KPIS OPERACIONAIS ANCORADA NA PARTE INFERIOR (100% DA EXTENSÃO DA PÁGINA) -->
      <div id="mural-kpis-bottom-bar" class="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 dark:from-[#050b14] dark:via-[#09152b] dark:to-[#081329] p-3.5 rounded-2xl border-2 border-indigo-400/60 shadow-2xl mt-4">
        <div class="flex items-center justify-between px-1 mb-2 text-white/90">
          <span class="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Painel Geral da Fábrica & Indicadores Operacionais
          </span>
          <span class="text-[10px] font-mono text-cyan-300 font-bold">Atualização em Tempo Real</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-sm flex items-center gap-3 text-white">
            <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-300 uppercase block">Fila Geral</span>
              <strong class="text-base font-black text-white font-mono">${orders.length} pedidos</strong>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-sm flex items-center gap-3 text-white">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-300 uppercase block">Em Impressão</span>
              <strong class="text-base font-black text-indigo-200 font-mono">${countProducao} em curso</strong>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-sm flex items-center gap-3 text-white">
            <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-300 uppercase block">Acabamento</span>
              <strong class="text-base font-black text-purple-200 font-mono">${countAcabamento} peças</strong>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-sm flex items-center gap-3 text-white">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-300 uppercase block">Vence Hoje</span>
              <strong class="text-base font-black text-amber-300 font-mono">${countHoje} p/ hoje</strong>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border ${countAtrasados > 0 ? 'border-rose-400 bg-rose-950/40' : 'border-white/15'} shadow-sm flex items-center gap-3 text-white">
            <div class="w-10 h-10 rounded-xl ${countAtrasados > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'} flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold ${countAtrasados > 0 ? 'text-rose-300' : 'text-slate-300'} uppercase block">Atrasados</span>
              <strong class="text-base font-black ${countAtrasados > 0 ? 'text-rose-400' : 'text-white'} font-mono">${countAtrasados} crítico</strong>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-sm flex items-center gap-3 text-white">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-300 uppercase block">Metros Produção</span>
              <strong class="text-base font-black text-emerald-300 font-mono">${totalM2EmProducao.toFixed(1)} m²</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- 1. Barra de Busca Ampliada x3 & Botões Padronizados (Mesma Altura h-10 e Mesma Largura) -->
        <div class="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3">
          
          <!-- Localização / Busca Aumentada x3 com a Lupa em Destaque -->
          <div class="flex items-center gap-2 flex-1 w-full xl:max-w-2xl">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600 dark:text-cyan-400">
                <!-- Ícone da Lupa aumentado x3 (de w-4 h-4 para w-7 h-7) -->
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por O.S., Cliente ou Material..." 
                value="${this.searchTerm}" 
                oninput="productionModule.setSearchTerm(this.value)" 
                class="w-full h-10 pl-14 pr-4 bg-slate-50 dark:bg-slate-800/80 border-2 border-blue-200 dark:border-blue-900/60 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition">
            </div>
          </div>

          <!-- Grade de Botões Alinhados, Mesma Altura (h-10) e Mesma Largura (w-36) com a Grafia Solicitada -->
          <div class="flex items-center gap-2 flex-wrap">
            <button 
              type="button" 
              onclick="productionModule.clearSearch()" 
              title="Limpar busca"
              class="h-10 w-24 sm:w-28 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer shrink-0">
              <span>✕ limpar</span>
            </button>

            <button onclick="productionModule.setUrgencyFilter('all')" class="h-10 w-24 sm:w-28 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${this.filterUrgency === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}">
              todos
            </button>

            <button onclick="productionModule.setUrgencyFilter('atrasado')" class="h-10 min-w-[140px] px-3 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${this.filterUrgency === 'atrasado' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'}">
              entregas atrasadas
            </button>

            <button onclick="productionModule.setUrgencyFilter('hoje')" class="h-10 min-w-[130px] px-3 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${this.filterUrgency === 'hoje' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'}">
              entregas de hoje
            </button>

            <button onclick="productionModule.setUrgencyFilter('esta_semana')" class="h-10 min-w-[160px] px-3 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${this.filterUrgency === 'esta_semana' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100'}" title="Pedidos com entrega prevista da semana atual">
              entregas da semana atual
            </button>

            <button onclick="productionModule.setUrgencyFilter('semana_que_vem')" class="h-10 min-w-[170px] px-3 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${this.filterUrgency === 'semana_que_vem' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'}" title="Pedidos com entrega prevista da próxima semana">
              entregas da proxima semana
            </button>

            ${(window.authModule && window.authModule.can('canViewSaleValues')) ? `
              <button onclick="salesModule.openCrmModal()" class="h-10 min-w-[120px] px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer" title="Painel de Pós-Venda e CRM">
                <span>pós vendas</span>
              </button>
            ` : ''}

            ${(window.authModule && window.authModule.can('canCreateOrders')) ? `
              <button onclick="app.openNewOrderModal()" class="h-10 min-w-[130px] px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                <span>+ novo pedido</span>
              </button>
            ` : ''}
          </div>

        </div>

        <!-- 2. Versão Desktop: Abas Horizontais com Drag & Drop -->
        <div class="hidden md:flex flex-nowrap w-full gap-1 border-b-2 border-blue-600 dark:border-blue-500 pt-1 overflow-x-auto">
          ${tabsHtml}
        </div>

        <!-- 3. Versão Desktop: Grid de Cards Responsivo preenchendo a tela de forma harmoniosa -->
        <div class="hidden md:block bg-slate-50/70 dark:bg-[#080e1a] border border-slate-200 dark:border-slate-800 rounded-b-2xl p-4 sm:p-5 min-h-[50vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" ondragover="productionModule.allowDrop(event)" ondrop="productionModule.handleDrop(event, '${activePhase.id}')">
            ${activeOrders.length === 0 ? `
              <div class="col-span-full py-16 text-center text-slate-400 dark:text-slate-500">
                <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                <p class="font-extrabold text-sm">Nenhum pedido nesta fase com os filtros atuais.</p>
                <p class="text-xs text-slate-400 mt-1">Arraste pedidos para cá ou clique em "+ novo pedido" para alimentar a esteira.</p>
              </div>
            ` : activeOrders.map(o => this.renderCard(o, clients)).join('')}
          </div>
        </div>

        <!-- 4. Versão Mobile: Fases na Vertical Sanfona com 'Mostre e Esconde' -->
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

        <!-- 5. Barra de KPIs Ancorada na Parte Inferior com Destaque e 100% de Largura (Imagem 2) -->
        ${kpisHtml}

      </div>
    `;
    } catch (err) {
      console.error('[GRAFSIS] Erro ao renderizar Mural de Serviços:', err);
      const container = document.getElementById('view-container');
      if (container) {
        container.innerHTML = `
          <div class="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200">
            <h3 class="font-black text-base mb-1">Mural de Serviços</h3>
            <p class="text-xs">Ocorreu uma falha ao carregar as ordens de produção: ${err.message || err}</p>
            <button onclick="productionModule.render()" class="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition">Tentar Novamente</button>
          </div>
        `;
      }
    }
  },
  
  renderCard(order, clients) {
    let client = clients.find(c => c.id === order.cliente_id);
    if (!client && order.cliente_nome) {
      client = clients.find(c => c.nome && c.nome.toLowerCase().trim() === String(order.cliente_nome).toLowerCase().trim());
      if (client) {
        order.cliente_id = client.id;
      }
    }
    const hasValidClient = !!(client && client.id);
    const clientObj = client || { nome: order.cliente_nome || 'Cliente não vinculado' };
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

    let lastMovText = 'Recente';
    if (order.historico && order.historico.length > 0) {
      const lastH = order.historico[order.historico.length - 1];
      const d = new Date(lastH.data);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const hor = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      lastMovText = `🕒 ${dia}/${mes} ${hor}:${min} • ${lastH.usuario || 'Operador'}`;
    } else {
      const d = order.data_venda ? new Date(order.data_venda) : new Date();
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const hor = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      lastMovText = `🕒 ${dia}/${mes} ${hor}:${min} • ${order.operador || 'Operador'}`;
    }

    const safeClientNome = clientObj.nome || 'Cliente';

    return `
      <div 
        id="kanban-card-${order.id}" 
        class="kanban-card bg-white dark:bg-[#0c1527] p-3.5 rounded-2xl border ${borderAccent} shadow-sm hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1" 
        draggable="true" 
        ondragstart="productionModule.handleDragStart(event, '${order.id}')" 
        ondblclick="salesModule.openProductionWorkOrder('${order.id}')" 
        title="Duplo clique para abrir a Ordem de Serviço de Produção (Sem Valores Financeiros)"
        style="cursor: pointer;">
        
        <!-- Carimbo de Última Movimentação (Marcação Amarela Imagem 1) -->
        <div class="flex items-center justify-between text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/60 mb-2 truncate" title="Última movimentação registrada">
          <span class="truncate">${lastMovText}</span>
        </div>

        <!-- Topo do Card: Número do Pedido + Badges de Urgência & Operação -->
        <div class="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-black text-sm text-blue-600 dark:text-cyan-400">#${order.numero}</span>
            ${opBadge}
          </div>
          <div>${deadlineBadge}</div>
        </div>

        <!-- Nome do Cliente em Destaque e Fonte Maior -->
        <div class="mt-2 flex items-center justify-between gap-1">
          <h4 class="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate" title="${safeClientNome}">
            ${window.escapeHtml ? window.escapeHtml(safeClientNome) : safeClientNome}
          </h4>
          ${!hasValidClient ? `<span class="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700" title="Cliente sem vínculo cadastral formal no banco de dados">⚠️ Cadastro Pendente</span>` : ''}
        </div>
        
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
            onclick="event.stopPropagation(); ${order.status_fase === 'entregue' ? `salesModule.openProtocolModal('${order.id}')` : `salesModule.openProductionWorkOrder('${order.id}')`}" 
            class="text-[11px] font-black ${order.status_fase === 'entregue' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-cyan-400'} hover:underline flex items-center gap-1" 
            title="${order.status_fase === 'entregue' ? 'Emitir Protocolo de Entrega' : 'Abrir Ordem de Serviço de Produção'}">
            <span>${order.status_fase === 'entregue' ? '📦 Emitir Protocolo de Entrega' : '📋 Abrir O.S.'}</span>
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
    
    const allClients = window.store.getClients();
    let client = allClients.find(c => c.id === order.cliente_id);
    if (!client && order.cliente_nome) {
      client = allClients.find(c => c.nome && c.nome.toLowerCase().trim() === String(order.cliente_nome).toLowerCase().trim());
      if (client) {
        order.cliente_id = client.id;
      }
    }
    const clientName = client ? client.nome : (order.cliente_nome || 'Cliente não vinculado');
    const oldPhaseObj = this.phases.find(p => p.id === order.status_fase);
    const newPhaseObj = this.phases.find(p => p.id === newPhaseId);
    
    // Regra de Negócio: Orçamento e Pré-Venda só tramitam até Aprovação
    const advancedPhases = ['liberado', 'producao', 'acabamento', 'embalagem', 'entregue'];
    const currentOp = (order.tipo_operacao || order.tipo || 'venda').toLowerCase();
    if (advancedPhases.includes(newPhaseId) && (currentOp === 'orcamento' || currentOp === 'prevenda')) {
      const opLabel = currentOp === 'orcamento' ? 'ORÇAMENTO' : 'PRÉ-VENDA';
      const shouldConvert = await window.grafsisConfirm({
        title: 'GRAFSIS',
        message: `⚠️ REGRA DE TRAMITAÇÃO:\n\nPropostas registradas como ${opLabel} só podem tramitar até a fase de Aprovação.\n\nPara avançar para "${newPhaseObj.name}" e liberar a O.S. na fábrica, esta proposta precisa ser convertida em VENDA.\n\nDeseja converter este pedido em VENDA agora para autorizar a liberação?`,
        confirmText: 'Converter em Venda',
        cancelText: 'Cancelar'
      });
      if (!shouldConvert) {
        return;
      }
      order.tipo_operacao = 'venda';
      if (typeof window.store.saveOrder === 'function') {
        await window.store.saveOrder(order);
      } else {
        const allO = window.store.getOrders();
        const idx = allO.findIndex(o => o.id === order.id);
        if (idx !== -1) allO[idx].tipo_operacao = 'venda';
        window.store.save('grafsis_orders', allO);
      }
    }

    const dataPedido = order.data_venda ? new Date(order.data_venda).toLocaleDateString('pt-BR') : 'Sem data';
    const prazo = order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'Sem prazo';

    const oldPhaseName = oldPhaseObj ? oldPhaseObj.name : (order.status_fase || 'Fase Atual');
    const newPhaseName = newPhaseObj ? newPhaseObj.name : newPhaseId;

    const msg = `MUDANÇA DE FASE\n\nID: #${order.numero}\nCliente: ${clientName}\nData do Pedido: ${dataPedido}\nPrazo de Entrega: ${prazo}\n\nConfirma a mudança de fase:\nDe: "${oldPhaseName}"\nPara: "${newPhaseName}"?`;
    
    const isConfirmed = await window.grafsisConfirm({
      title: 'GRAFSIS',
      message: msg,
      confirmText: 'Confirmar Mudança',
      cancelText: 'Cancelar'
    });

    if (isConfirmed) {
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

