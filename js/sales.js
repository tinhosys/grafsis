window.salesModule = {
  isFormOpen: false,
  activeItems: [],
  filters: { cliente: '', produto: '', status: '', dataInicio: '', dataFim: '', pagamento: '' },
  
  render() {
    this.isFormOpen = false;
    this.currentEditingOrderId = null;
    this.editingItemIdx = null;
    const container = document.getElementById('view-container');
    if (!this.filters) this.filters = { cliente: '', produto: '', status: '', dataInicio: '', dataFim: '', pagamento: '' };
    
    let html = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-black text-slate-800">Vendas & Pré-Vendas</h1>
          <p class="text-slate-500 text-sm">Emissão de orçamentos, vendas, layouts e protocolos</p>
        </div>
        
        <!-- BUSCADOR RÁPIDO POR ID (IMAGEM 5) -->
        <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div class="relative flex items-center">
            <span class="absolute left-3 text-blue-500 font-mono font-black text-sm">#</span>
            <input type="text" id="quick-order-search-id" placeholder="Buscar ID (ex: 260001)..." 
              class="pl-7 pr-3 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-sm font-mono font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm w-44 sm:w-56"
              onkeydown="if(event.key==='Enter'){ salesModule.searchAndOpenOrderById(this.value); }">
          </div>
          <button type="button" onclick="salesModule.searchAndOpenOrderById(document.getElementById('quick-order-search-id')?.value)" 
            class="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer" title="Buscar Pedido com todos os itens pelo ID">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <span>Buscar</span>
          </button>
          <button onclick="salesModule.openModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm text-sm flex items-center gap-2 whitespace-nowrap cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Novo Orçamento / Venda
          </button>
        </div>
      </div>
      
      <!-- CONTROLE DE BUSCA -->
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <h3 class="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          Filtro Avançado de Pedidos
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Cliente</label>
            <input type="text" id="filter-cliente" oninput="salesModule.updateFilters()" placeholder="Nome ou Documento" class="w-full text-sm px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" value="${this.filters.cliente}">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Produto (Itens)</label>
            <input type="text" id="filter-produto" oninput="salesModule.updateFilters()" placeholder="Lona, Adesivo..." class="w-full text-sm px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" value="${this.filters.produto}">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Status / Fase</label>
            <select id="filter-status" onchange="salesModule.updateFilters()" class="w-full text-sm px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="">Todas as fases</option>
              <option value="orcamento" ${this.filters.status==='orcamento'?'selected':''}>1. Orçamento</option>
              <option value="prevenda" ${this.filters.status==='prevenda'?'selected':''}>2. Pré-Venda</option>
              <option value="aprovacao" ${this.filters.status==='aprovacao'?'selected':''}>3. Aprovação</option>
              <option value="liberado" ${this.filters.status==='liberado'?'selected':''}>4. Liberado O.S.</option>
              <option value="producao" ${this.filters.status==='producao'?'selected':''}>5. Em Produção</option>
              <option value="acabamento" ${this.filters.status==='acabamento'?'selected':''}>6. Acabamento</option>
              <option value="embalagem" ${this.filters.status==='embalagem'?'selected':''}>7. Embalagem</option>
              <option value="entregue" ${this.filters.status==='entregue'?'selected':''}>8. Expedição / Entregue</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Saldo Financeiro</label>
            <select id="filter-pagamento" onchange="salesModule.updateFilters()" class="w-full text-sm px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="">Todos</option>
              <option value="devedor" ${this.filters.pagamento==='devedor'?'selected':''}>Apenas c/ Saldo Devedor</option>
              <option value="pago" ${this.filters.pagamento==='pago'?'selected':''}>Totalmente Pagos</option>
            </select>
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Data Início</label>
              <input type="date" id="filter-data-inicio" onchange="salesModule.updateFilters()" class="w-full text-sm px-2 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" value="${this.filters.dataInicio}">
            </div>
            <div class="flex-1">
              <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Data Fim</label>
              <input type="date" id="filter-data-fim" onchange="salesModule.updateFilters()" class="w-full text-sm px-2 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" value="${this.filters.dataFim}">
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="p-4">Data</th>
                <th class="p-4">Código</th>
                <th class="p-4">Cliente</th>
                <th class="p-4">Valor & Saldo</th>
                <th class="p-4">Fase Atual</th>
                <th class="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="sales-tbody" class="divide-y divide-slate-100">
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.innerHTML = html;
    this.renderTable();
  },

  updateFilters() {
    this.filters.cliente = document.getElementById('filter-cliente').value.toLowerCase();
    this.filters.produto = document.getElementById('filter-produto').value.toLowerCase();
    this.filters.status = document.getElementById('filter-status').value;
    this.filters.dataInicio = document.getElementById('filter-data-inicio').value;
    this.filters.dataFim = document.getElementById('filter-data-fim').value;
    this.filters.pagamento = document.getElementById('filter-pagamento').value;
    this.renderTable();
  },

  renderTable() {
    const tbody = document.getElementById('sales-tbody');
    if (!tbody) return;
    
    let orders = window.store.getOrders();
    const clients = window.store.getClients();
    const allFinance = window.store.getFinance();

    // ORDENAÇÃO: Mais recentes primeiro
    orders.sort((a, b) => new Date(b.data_criacao || 0) - new Date(a.data_criacao || 0));

    // APLICAR FILTROS
    const f = this.filters;
    orders = orders.filter(o => {
      const client = clients.find(cl => cl.id === o.cliente_id) || { nome: 'Desconhecido', cpf_cnpj: '' };
      
      // Filtro Cliente (nome ou documento)
      if (f.cliente) {
        const term = f.cliente;
        if (!client.nome.toLowerCase().includes(term) && !(client.cpf_cnpj && client.cpf_cnpj.includes(term))) {
          return false;
        }
      }
      
      // Filtro Status / Fase
      if (f.status && o.status_fase !== f.status) return false;
      
      // Filtro Data Início e Fim (Baseado na data de criação)
      if (f.dataInicio || f.dataFim) {
        const orderDate = new Date(o.data_criacao);
        if (f.dataInicio) {
           const dInicio = new Date(f.dataInicio + 'T00:00:00');
           if (orderDate < dInicio) return false;
        }
        if (f.dataFim) {
           const dFim = new Date(f.dataFim + 'T23:59:59');
           if (orderDate > dFim) return false;
        }
      }
      
      // Filtro Produto (buscando nos itens)
      if (f.produto) {
         const hasProd = (o.itens || []).some(item => (item.descricao || '').toLowerCase().includes(f.produto));
         if (!hasProd) return false;
      }
      
      // Filtro Saldo Devedor
      if (f.pagamento) {
         const entradaCadastrada = parseFloat(o.valor_entrada) || parseFloat(o.valor_recebido) || 0;
         const payments = allFinance.filter(fin => fin.pedido_id === o.id && fin.tipo === 'recebimento');
         const totalPaid = Math.max(payments.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0), entradaCadastrada);
         const balance = Math.max(0, parseFloat(o.valor_final) - totalPaid);
         
         if (f.pagamento === 'devedor' && balance <= 0.01) return false;
         if (f.pagamento === 'pago' && balance > 0.01) return false;
      }
      
      return true;
    });

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-12 text-center text-slate-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Nenhum pedido encontrado com estes filtros.
      </td></tr>`;
      return;
    }

    let html = '';
    orders.forEach(o => {
      let c = clients.find(cl => cl.id === o.cliente_id);
      if (!c && o.cliente_nome) {
        c = clients.find(cl => cl.nome && cl.nome.toLowerCase().trim() === String(o.cliente_nome).toLowerCase().trim());
      }
      const cName = c ? c.nome : (o.cliente_nome || 'Desconhecido');
      
      const entradaCadastrada = parseFloat(o.valor_entrada) || parseFloat(o.valor_recebido) || 0;
      const payments = allFinance.filter(fin => fin.pedido_id === o.id && fin.tipo === 'recebimento');
      const paymentsSum = payments.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
      const totalPaid = Math.max(paymentsSum, entradaCadastrada);
      const balance = Math.max(0, parseFloat(o.valor_final) - totalPaid);
      
      let balanceBadge = '';
      if (balance > 0.01) {
         balanceBadge = `
           <span class="block text-[10px] font-bold text-rose-600 uppercase mt-1">Falta: R$ ${balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
           ${totalPaid > 0 ? `<span class="block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded inline-block mt-0.5">Entrada: R$ ${totalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>` : ''}
         `;
      } else {
         balanceBadge = `<span class="block text-[10px] font-bold text-emerald-600 uppercase mt-1">Quitado (100%)</span>`;
      }
      
      let orderDateStr = '--';
      if (o.data_criacao) {
         const d = new Date(o.data_criacao);
         orderDateStr = ('0'+d.getDate()).slice(-2) + '/' + ('0'+(d.getMonth()+1)).slice(-2) + '/' + d.getFullYear() + ' ' + ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2);
      }

      html += `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 last:border-0 group">
          <td class="p-4 text-xs font-bold text-slate-500">${orderDateStr}</td>
          <td class="p-4 font-mono font-black text-blue-600">
            <button type="button" onclick="salesModule.openModal({orderId: '${o.id}'})" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border border-blue-200 transition font-mono font-black text-xs shadow-2xs group cursor-pointer" title="Clique para abrir e carregar este Pedido #${o.numero}">
              <span>#${o.numero || o.id.substring(0,6)}</span>
              <svg class="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </button>
          </td>
          <td class="p-4 font-bold text-slate-800 uppercase truncate max-w-[200px]" title="${cName}">${cName}</td>
          <td class="p-4">
            <span class="font-black text-slate-800">R$ ${Number(o.valor_final).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            ${balanceBadge}
          </td>
          <td class="p-4">${this.getPhaseBadge(o.status_fase)}</td>
          <td class="p-4 text-right space-x-1 opacity-80 group-hover:opacity-100 transition">
            <button onclick="salesModule.openApprovalShareModal('${o.id}')" class="text-teal-600 font-bold hover:text-teal-800 px-2 py-1 rounded hover:bg-teal-50 transition" title="Encaminhar Prova / WhatsApp com Registro">
              <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            </button>
            <button onclick="salesModule.quickView('${o.id}')" class="text-slate-600 font-bold hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100 transition" title="Visualizar Detalhes">
              <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
            <button onclick="salesModule.openModal({orderId: '${o.id}'})" class="text-blue-600 font-bold hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition" title="Editar Pedido">
              <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button onclick="salesModule.openProtocolModal('${o.id}')" class="text-emerald-600 font-bold hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-50 transition" title="O.S e Protocolo">
              <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            </button>
            <button onclick="financeModule.openCashierModal('${o.id}')" class="text-yellow-600 font-bold hover:text-yellow-800 px-2 py-1 rounded hover:bg-yellow-50 transition" title="Caixa e Pagamentos">
              <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </button>
            <button onclick="salesModule.delete('${o.id}')" class="text-rose-500 font-bold hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition" title="Excluir">
              <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  },  getPhaseBadge(phase) {
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
  },
  createOrderForClient(clientId) { this.openModal({ clientId }); },

  getUserRole() {
    const user = window.authModule ? window.authModule.getCurrentUser() : null;
    return (user?.role || user?.nivel || '').toUpperCase();
  },

  canManagePermutaPatrocinio() {
    const role = this.getUserRole();
    return ['ADMIN', 'PROPRIETARIO', 'GERENTE'].includes(role);
  },

  async checkClientStatusAndAge(selectElement) {
    const clientId = selectElement.value;
    if (!clientId) {
      if (!this.currentEditingOrderId) {
        this.currentAssignedOrderId = null;
        const labelEl = document.getElementById('display-order-id-label');
        if (labelEl) labelEl.innerText = '#NOVO (Gerado ao salvar)';
        const hiddenId = document.getElementById('current-display-id');
        if (hiddenId) hiddenId.value = '#NOVO';
      }
      this.updateFormState();
      return;
    }

    // Regra Imagens 1, 2 e 3: Se cliente <> null, atribui último ID + 1 logo no começo da operação
    if (!this.currentEditingOrderId || !this.currentAssignedOrderId || this.currentAssignedOrderId === '#NOVO') {
      const nextId = this.getNextOrderId();
      this.currentAssignedOrderId = nextId;
      const labelEl = document.getElementById('display-order-id-label');
      if (labelEl) labelEl.innerText = '#' + nextId;
      const hiddenId = document.getElementById('current-display-id');
      if (hiddenId) hiddenId.value = nextId;

      // Vincula e atualiza imediatamente os itens da memória com o ID oficial para evitar itens sem vínculo
      if (this.activeItems && this.activeItems.length > 0) {
        this.activeItems.forEach((it, idx) => {
          const seq = String(idx + 1).padStart(2, '0');
          it.item_id = `${nextId}${seq}`;
        });
        const tbody = document.getElementById('order-items-tbody');
        if (tbody) tbody.innerHTML = this.renderActiveItemsHtml();
      }
    }

    const client = window.store.getClients().find(c => c.id === clientId);
    if (!client) {
      this.updateFormState();
      return;
    }
    
    // Bloqueio de venda para cliente inativo/bloqueado
    if (client.status === 'bloqueado') {
      alert(`Operação negada: O cliente ${client.nome} encontra-se BLOQUEADO. Atualize o cadastro do cliente para liberar vendas.`);
      selectElement.value = '';
      this.updateFormState();
      return;
    }

    // Check if updated_at or created_at is older than 1 year (365 days)
    const refDate = client.updated_at || client.created_at;
    if (refDate) {
      const msDiff = new Date() - new Date(refDate);
      const daysDiff = msDiff / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        const atualizar = await window.grafsisConfirm({
          title: 'GRAFSIS',
          message: `Atenção: Os dados do cliente ${client.nome} não são atualizados há mais de 1 ano.\n\nDeseja atualizar o cadastro do cliente agora?`,
          confirmText: 'Atualizar Cadastro',
          cancelText: 'Continuar no Pedido'
        });
        if (atualizar) {
          if (window.clientsModule && typeof window.clientsModule.editModal === 'function') {
            window.clientsModule.editModal(clientId);
          } else {
            await window.grafsisAlert('Acesse a aba Clientes para atualizar os dados.', 'GRAFSIS');
          }
        }
      }
    }
    this.updateFormState();
  },

  getPhaseLabel(op) {
    const map = {
      'venda': 'Venda',
      'pre-venda': 'Pré-Venda',
      'prevenda': 'Pré-Venda',
      'orcamento': 'Orçamento',
      'permuta': 'Permuta',
      'patrocinio': 'Patrocínio'
    };
    return map[op] || (op ? String(op).toUpperCase() : 'ORÇAMENTO');
  },

  getPhaseBadgeClass(op) {
    switch (op) {
      case 'venda':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pre-venda':
      case 'prevenda':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'permuta':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'patrocinio':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'orcamento':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  },

  updatePhaseBadge(op) {
    const badge = document.getElementById('badge-fase-atual');
    if (!badge) return;
    const label = this.getPhaseLabel(op);
    badge.innerText = label.toUpperCase();
    badge.className = `text-xs font-black px-2.5 py-1 ${this.getPhaseBadgeClass(op)} rounded-lg border uppercase transition-colors`;
  },

  getPhaseChangeTimeFormatted(order) {
    if (!order) return 'Novo (ao salvar)';
    if (order.historico && Array.isArray(order.historico) && order.historico.length > 0) {
      const last = order.historico[order.historico.length - 1];
      if (last && last.data) {
        const d = new Date(last.data);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
      }
    }
    const fallbackDate = order.data_modificacao || order.updated_at || order.data_venda || order.created_at;
    if (fallbackDate) {
      const d = new Date(fallbackDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    return new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  },

  showInlineProgress(title, percent, isComplete = false) {
    const container = document.getElementById('inline-action-progress-container');
    if (!container) return;
    container.classList.remove('hidden');
    const titleEl = document.getElementById('inline-progress-title');
    if (titleEl) titleEl.innerText = title;
    const pctEl = document.getElementById('inline-progress-percent');
    if (pctEl) pctEl.innerText = Math.round(percent) + '%';
    const barEl = document.getElementById('inline-progress-bar');
    if (barEl) barEl.style.width = Math.min(100, Math.max(0, percent)) + '%';
    const spinner = document.getElementById('inline-progress-spinner');
    const check = document.getElementById('inline-progress-check');
    if (isComplete) {
      if (spinner) spinner.classList.add('hidden');
      if (check) check.classList.remove('hidden');
      setTimeout(() => {
        if (container) {
          container.classList.add('opacity-0');
          setTimeout(() => {
            container.classList.add('hidden');
            container.classList.remove('opacity-0');
            if (barEl) barEl.style.width = '0%';
            if (spinner) spinner.classList.remove('hidden');
            if (check) check.classList.add('hidden');
          }, 300);
        }
      }, 3500);
    } else {
      if (spinner) spinner.classList.remove('hidden');
      if (check) check.classList.add('hidden');
    }
  },

  handleOperationTypeChange(select) {
    const op = select.value;
    if ((op === 'permuta' || op === 'patrocinio') && !this.canManagePermutaPatrocinio()) {
      alert('Operação restrita: Permuta e Patrocínio só podem ser autorizados pelos perfis Gerente ou Proprietário.');
      select.value = 'venda';
    }
    this.updatePhaseBadge(select.value);
    const phaseTimeEl = document.getElementById('display-order-phase-time-val');
    if (phaseTimeEl) {
      phaseTimeEl.innerText = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    this.updateFormState();
  },

  updateDateFromDays() {
    const days = parseInt(document.getElementById('dias-entrega')?.value) || 0;
    const date = new Date();
    date.setDate(date.getDate() + days);
    const dataInput = document.getElementById('previsao_entrega');
    if (dataInput) dataInput.value = date.toISOString().split('T')[0];
  },

  updateDaysFromDate() {
    const dataInput = document.getElementById('previsao_entrega');
    if (!dataInput || !dataInput.value) return;
    const targetDate = new Date(dataInput.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysInput = document.getElementById('dias-entrega');
    if (daysInput) daysInput.value = Math.max(0, diffDays);
  },

  updateValidadeDateFromDays() {
    const days = parseInt(document.getElementById('dias-validade')?.value) || 0;
    const date = new Date();
    date.setDate(date.getDate() + days);
    const dataInput = document.getElementById('data-validade');
    if (dataInput) dataInput.value = date.toISOString().split('T')[0];
  },

  updateValidadeDaysFromDate() {
    const dataInput = document.getElementById('data-validade');
    if (!dataInput || !dataInput.value) return;
    const targetDate = new Date(dataInput.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysInput = document.getElementById('dias-validade');
    if (daysInput) daysInput.value = Math.max(0, diffDays);
  },

  updateFormState() {
    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientId = clientSelect ? clientSelect.value : '';
    const opSelect = document.querySelector('select[name="tipo_operacao"]');
    const op = opSelect ? opSelect.value : 'venda';
    this.updatePhaseBadge(op);

    const hasClient = Boolean(clientId);

    // 1. Mensagem de aviso e opacidade dos blocos
    const clientNotice = document.getElementById('client-required-notice');
    if (clientNotice) {
      clientNotice.style.display = hasClient ? 'none' : 'block';
    }

    const itemsContainer = document.getElementById('secao-itens-pedido');
    const entregaContainer = document.getElementById('secao-entrega-pedido');
    const prodContainer = document.getElementById('secao-producao-validacoes');
    const finContainer = document.getElementById('secao-fechamento-financeiro');
    const botoesContainer = document.getElementById('secao-botoes-acoes');

    if (itemsContainer) itemsContainer.style.opacity = hasClient ? '1' : '0.45';
    if (entregaContainer) entregaContainer.style.opacity = hasClient ? '1' : '0.45';
    if (prodContainer) prodContainer.style.opacity = hasClient ? '1' : '0.45';
    if (finContainer) finContainer.style.opacity = hasClient ? '1' : '0.45';
    if (botoesContainer) botoesContainer.style.opacity = hasClient ? '1' : '0.45';

    // 2. Se NÃO houver cliente selecionado, desabilita todos os inputs e botões (exceto o próprio select de cliente)
    if (!hasClient) {
      if (opSelect) opSelect.disabled = true;
      const allFormElements = document.querySelectorAll('#order-form input:not([name="cliente_id"]), #order-form select:not([name="cliente_id"]), #order-form textarea, #order-form button:not([onclick*="render"])');
      allFormElements.forEach(el => {
        el.disabled = true;
      });
      return;
    }

    // 3. Se TEM cliente, habilita os elementos gerais
    if (opSelect) opSelect.disabled = false;
    const itemElements = document.querySelectorAll('#secao-itens-pedido input, #secao-itens-pedido select, #secao-itens-pedido button');
    itemElements.forEach(el => {
      if (el.id !== 'item-type' && el.id !== 'item-type-display') el.disabled = false;
    });

    const prodElements = document.querySelectorAll('#secao-producao-validacoes input, #secao-producao-validacoes textarea');
    prodElements.forEach(el => el.disabled = false);

    const finElements = document.querySelectorAll('#secao-fechamento-financeiro input');
    finElements.forEach(el => el.disabled = false);

    // 4. Colunas dinâmicas no cabeçalho superior conforme o Tipo de Operação
    const topValidade = document.getElementById('top-col-validade');
    const topPercentual = document.getElementById('top-col-percentual');
    const topVenda = document.getElementById('top-col-venda');

    if (op === 'orcamento' || op === 'pre-venda') {
      if (topValidade) topValidade.classList.remove('hidden');
      if (topPercentual) topPercentual.classList.add('hidden');
      if (topVenda) topVenda.classList.add('hidden');
      const valInputs = document.querySelectorAll('#top-col-validade input');
      valInputs.forEach(i => i.disabled = false);
    } else if (op === 'permuta' || op === 'patrocinio') {
      if (topValidade) topValidade.classList.add('hidden');
      if (topPercentual) topPercentual.classList.remove('hidden');
      if (topVenda) topVenda.classList.add('hidden');
      const percInput = document.getElementById('operacao-percentual');
      if (percInput) percInput.disabled = false;
    } else {
      if (topValidade) topValidade.classList.add('hidden');
      if (topPercentual) topPercentual.classList.add('hidden');
      if (topVenda) topVenda.classList.remove('hidden');
    }

    // 5. Entrega do Pedido: "SÓ SE HABILITA EM VENDA, PERMUTA, PATROCINIO"
    const canEntrega = (op === 'venda' || op === 'permuta' || op === 'patrocinio');
    const diasEntrega = document.getElementById('dias-entrega');
    const prevEntrega = document.getElementById('previsao_entrega');
    const entregaBadge = document.getElementById('entrega-badge-info');

    if (diasEntrega) {
      diasEntrega.disabled = !canEntrega;
      diasEntrega.className = canEntrega 
        ? "w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold" 
        : "w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-100 font-bold text-slate-400 cursor-not-allowed";
    }
    if (prevEntrega) {
      prevEntrega.disabled = !canEntrega;
      prevEntrega.className = canEntrega 
        ? "w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold" 
        : "w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-100 font-bold text-slate-400 cursor-not-allowed";
    }
    if (entregaBadge) {
      if (canEntrega) {
        entregaBadge.innerText = '● Habilitado para Produção';
        entregaBadge.className = 'text-xs font-bold text-emerald-600';
      } else {
        entregaBadge.innerText = 'Desabilitado (Definido após aprovação da proposta)';
        entregaBadge.className = 'text-xs font-bold text-slate-400 italic';
      }
    }

    // 6. Fase da Produção / Status Inicial: "SÓ SE HABITA EM VENDAS, PERMUTA, PATROCINIO"
    const statusFaseSelect = document.querySelector('select[name="status_fase"]');
    if (statusFaseSelect) {
      if (canEntrega) {
        statusFaseSelect.disabled = false;
        statusFaseSelect.className = 'w-full p-2 border border-blue-300 rounded-lg text-sm bg-white font-black text-blue-700 shadow-sm';
      } else if (op === 'pre-venda') {
        statusFaseSelect.value = 'prevenda';
        statusFaseSelect.disabled = true;
        statusFaseSelect.className = 'w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-100 font-black text-slate-500 shadow-sm cursor-not-allowed';
      } else {
        statusFaseSelect.value = 'orcamento';
        statusFaseSelect.disabled = true;
        statusFaseSelect.className = 'w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-100 font-black text-slate-500 shadow-sm cursor-not-allowed';
      }
    }

    // 7. Botão Caixa: sempre habitado e habilitado
    const btnRecibo = document.getElementById('btn-detalhes-recibo');
    if (btnRecibo) {
      btnRecibo.disabled = false;
      btnRecibo.className = 'w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-lg shadow-sm flex justify-center items-center gap-2 transition cursor-pointer';
      btnRecibo.title = 'Lançar recebimento, entrada, pagamentos e emitir recibo no Caixa';
    }

    // 8. Governança de Edição e Bloqueio de Registro (Diretrizes Mestras e Solicitação do Usuário)
    const orders = (window.store && window.store.getOrders()) || [];
    const activeDisplayId = document.getElementById('current-display-id')?.value;
    const currentOrder = (this.currentEditingOrderId && orders.find(o => o.id === this.currentEditingOrderId)) ||
                         (activeDisplayId && orders.find(o => String(o.numero) === String(activeDisplayId)));
    const isSavedOrder = !!currentOrder;
    const isRegistered = this.isOrderRegistered || (currentOrder && (currentOrder.status_registro === 'registrado' || currentOrder.registrado === true || currentOrder.registrado === 'sim'));
    this.isOrderRegistered = isRegistered;

    const user = window.authModule ? window.authModule.getCurrentUser() : null;
    const userRole = user ? (user.tipo || user.perfil || user.role || '').toUpperCase() : '';
    const isGerente = ['GERENTE', 'PROPRIETARIO', 'ADMIN'].includes(userRole);
    const isEditingUnlocked = isRegistered ? (this.isEditingActive && isGerente) : (this.isEditingActive || !isSavedOrder);

    const clientSel = document.querySelector('select[name="cliente_id"]');
    const valElements = document.querySelectorAll('#top-col-validade input, #top-col-percentual input');
    const descPctInput = document.getElementById('order-discount-perc');
    const descValInput = document.getElementById('order-discount');
    const obsTextarea = document.querySelector('textarea[name="observacoes"]') || document.getElementById('order-obs');

    if (isRegistered && !isEditingUnlocked) {
      // APÓS O REGISTRO:
      // Locais imunes ao bloqueio (marcações laranjadas e circundados de rosa da Imagem 4):
      // 1. Prazo de Entrega (Dias) & Previsão de Entrega
      if (diasEntrega) {
        diasEntrega.disabled = false;
        diasEntrega.className = "w-full p-2 border border-slate-300 rounded bg-white font-bold text-center text-sm";
      }
      if (prevEntrega) {
        prevEntrega.disabled = false;
        prevEntrega.className = "w-full p-2 border border-slate-300 rounded bg-white font-mono text-sm";
      }
      // 2. Observações Técnicas
      if (obsTextarea) {
        obsTextarea.disabled = false;
        obsTextarea.className = "w-full p-2 border border-slate-300 rounded text-sm bg-white";
      }
      // 3. Valor de Entrada (R$)
      const entradaInput = document.getElementById('order-valor-entrada') || document.getElementById('order-entrada');
      if (entradaInput) {
        entradaInput.disabled = false;
      }
      // 4. Botão Caixa
      const btnCaixa = document.getElementById('btn-detalhes-recibo');
      if (btnCaixa) {
        btnCaixa.disabled = false;
        btnCaixa.className = 'w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-lg shadow-sm flex justify-center items-center gap-2 transition cursor-pointer';
      }
      // 5. Repositório da Operação
      const repoBtns = document.querySelectorAll('#secao-producao-validacoes button, [onclick*="openRepositoryModal"], [onclick*="promptRepositoryDriveLink"]');
      repoBtns.forEach(b => b.disabled = false);

      // TODOS OS OUTROS CAMPOS SEGUEM BLOQUEADOS APÓS O REGISTRO:
      if (clientSel) {
        clientSel.disabled = true;
        clientSel.classList.add('bg-slate-100', 'cursor-not-allowed');
      }
      if (opSelect) {
        opSelect.disabled = true;
        opSelect.classList.add('bg-slate-100', 'cursor-not-allowed');
      }
      valElements.forEach(el => {
        el.disabled = true;
        el.classList.add('bg-slate-100', 'cursor-not-allowed');
      });
      // Desabilita campos de inserção/edição do item, mas MANTÉM HABILITADOS os checks de liberação de O.S. e botões de isolamento (Imagem 2)
      itemElements.forEach(el => {
        const isOsCheckOrControl = el.classList.contains('item-os-check') || 
                                   el.id === 'check-all-os' || 
                                   el.id === 'filter-item-code-os' || 
                                   (el.getAttribute('onclick') && (el.getAttribute('onclick').includes('isolateTypedItemOs') || el.getAttribute('onclick').includes('resetItemsOsFilter')));
        if (isOsCheckOrControl) {
          el.disabled = false;
        } else {
          el.disabled = true;
        }
      });
      if (descPctInput) descPctInput.disabled = true;
      if (descValInput) descValInput.disabled = true;

      // A seção do link de aprovação e seus botões (Copiar Link, Enviar WhatsApp, Visualizar) SEMPRE ficam habilitados (Marcação Verde Imagem 1)
      const linkSectionElements = document.querySelectorAll('#secao-link-aprovacao-padrao input, #secao-link-aprovacao-padrao button, #secao-link-aprovacao-padrao a');
      linkSectionElements.forEach(el => {
        el.disabled = false;
      });
    } else {
      // ANTES DE REGISTRAR (OU LIBERADO PELO GERENTE):
      if (opSelect) {
        opSelect.disabled = false;
        opSelect.classList.remove('bg-slate-100', 'cursor-not-allowed');
      }
      if (clientSel) {
        clientSel.disabled = false;
        clientSel.classList.remove('bg-slate-100', 'cursor-not-allowed');
      }
      itemElements.forEach(el => {
        if (el.id !== 'item-type' && el.id !== 'item-type-display') el.disabled = false;
      });
      finElements.forEach(el => el.disabled = false);
      valElements.forEach(el => {
        el.disabled = false;
        el.classList.remove('bg-slate-100', 'cursor-not-allowed');
      });
      if (diasEntrega) {
        diasEntrega.disabled = false;
        diasEntrega.className = "w-full p-2 border border-slate-300 rounded bg-white font-bold text-center text-sm";
      }
      if (prevEntrega) {
        prevEntrega.disabled = false;
        prevEntrega.className = "w-full p-2 border border-slate-300 rounded bg-white font-mono text-sm";
      }
      if (obsTextarea) {
        obsTextarea.disabled = false;
        obsTextarea.className = "w-full p-2 border border-slate-300 rounded text-sm bg-white";
      }
      const btnCaixa = document.getElementById('btn-detalhes-recibo');
      if (btnCaixa) {
        btnCaixa.disabled = false;
        btnCaixa.className = 'w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-lg shadow-sm flex justify-center items-center gap-2 transition cursor-pointer';
      }
    }

    // 9. Chave de ON/OFF para Edição de Gerente
    const wrapperChaveGerente = document.getElementById('wrapper-chave-edicao-gerente');
    if (wrapperChaveGerente) {
      wrapperChaveGerente.style.display = 'none';
    }

    // 10. Governança e Paleta dos 6 Botões de Ação Inferiores
    // 1. cancela = 'Cancelar Edição', deixe enable true quando tiver editando
    // 2. edita = 'Editar Operação' (Marcação Laranja - Imune)
    // 3. Gravar Operação (Marcação Laranja - Imune)
    // 4. 'Registrar Operação' (Amarelo, fonte preto) / 'Operação Registrada' (Verde bandeira, fonte branca)
    // 5. Botão cinza: 'Emitir Orçamento', 'Emitir Pré-Venda', 'Emitir Venda', 'Emitir Patrocínio', 'Emitir Permuta'
    // 6. Botão laranja: Emitir O.S. (desabilitado para Orçamento e Pré-Venda; habilitado para Venda, Patrocínio, Permuta)
    const btnCancelar = document.getElementById('btn-cancel-action') || document.querySelector('#secao-botoes-acoes button[onclick*="handleCancelEdit"]') || document.querySelector('#secao-botoes-acoes button[onclick*="render"]');
    const btnEdita = document.getElementById('btn-edit-order');
    const btnSalvaOperacao = document.getElementById('btn-save-draft');
    const btnSubmit = document.getElementById('btn-submit-order');
    const btnEmitirPedido = document.getElementById('btn-emitir-pedido');
    const btnEmitirOS = document.getElementById('btn-emitir-os');

    // 1. Botão Cancelar: cancela = 'Cancelar Edição'
    if (btnCancelar) {
      btnCancelar.innerHTML = `<svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Cancelar Edição`;
      if (this.isEditingActive) {
        btnCancelar.disabled = false;
        btnCancelar.className = "w-full h-12 text-sm font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer";
        btnCancelar.title = "Cancelar alterações e restaurar dados originais";
      } else {
        btnCancelar.disabled = true;
        btnCancelar.className = "w-full h-12 text-sm font-bold text-rose-400 bg-rose-50/60 border border-rose-200 rounded-xl transition shadow-none flex items-center justify-center gap-2 cursor-not-allowed opacity-60";
        btnCancelar.title = "Botão Cancelar Edição fica ativo somente durante a edição de dados";
      }
    }

    // 2. Botão Edita: edita = 'Editar Operação' (Marcação Laranja - Sempre Imune)
    if (btnEdita) {
      btnEdita.innerHTML = `<svg class="w-4 h-4 text-amber-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Editar Operação`;
      btnEdita.disabled = false;
      btnEdita.className = "w-full h-12 text-sm font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 border border-amber-500 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer";
      btnEdita.title = isRegistered ? "Editar dados e itens da operação registrada (Requer Gerente)" : "Editar dados e itens da operação";
    }

    // 3. Botão Gravar Operação: 'Gravar Operação' (Marcação Laranja - Sempre Imune)
    if (btnSalvaOperacao) {
      btnSalvaOperacao.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> Gravar Operação`;
      btnSalvaOperacao.disabled = false;
      btnSalvaOperacao.className = "w-full h-12 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer";
      btnSalvaOperacao.title = "Gravar alterações da operação no sistema";
    }

    // 4. Botão Registrar Operação / Operação Registrada (Imagem 4)
    // Antes de registrar: 'Registrar Operação', amarelo, fonte preto.
    // Depois de registrar: 'Operação Registrada', botão verde bandeira, fonte branca.
    if (btnSubmit) {
      btnSubmit.disabled = false;
      if (isRegistered) {
        btnSubmit.innerHTML = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg> Operação Registrada`;
        btnSubmit.className = 'w-full h-12 text-sm font-bold text-white bg-[#009b3a] hover:bg-[#008230] rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer';
        btnSubmit.title = "Operação já registrada no sistema";
      } else {
        btnSubmit.innerHTML = `<svg class="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Registrar Operação`;
        btnSubmit.className = 'w-full h-12 text-sm font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer';
        btnSubmit.title = "Registrar operação oficial no sistema";
      }
    }

    // 5. Botão Cinza: 'Emitir Orçamento', 'Emitir Pré-Venda', 'Emitir Venda', 'Emitir Patrocínio', 'Emitir Permuta'
    if (btnEmitirPedido) {
      btnEmitirPedido.disabled = false;
      let emitirLabel = 'Emitir Pedido';
      if (op === 'orcamento') emitirLabel = 'Emitir Orçamento';
      else if (op === 'pre-venda') emitirLabel = 'Emitir Pré-Venda';
      else if (op === 'venda') emitirLabel = 'Emitir Venda';
      else if (op === 'patrocinio') emitirLabel = 'Emitir Patrocínio';
      else if (op === 'permuta') emitirLabel = 'Emitir Permuta';

      btnEmitirPedido.innerHTML = `<svg class="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> ${emitirLabel}`;
      btnEmitirPedido.className = "w-full h-12 text-sm font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer";
    }

    // 6. Botão Emitir O.S. (Laranja)
    // REGRA CLARA:
    // Orçamento: NÃO emite O.S. (desabilitado)
    // Pré-Venda: NÃO emite O.S. (desabilitado)
    // A O.S. só fica liberada se a operação for: 'venda', 'patrocinio', 'permuta'
    if (btnEmitirOS) {
      const isLiberadaOS = (op === 'venda' || op === 'patrocinio' || op === 'permuta');
      if (isLiberadaOS) {
        btnEmitirOS.disabled = false;
        btnEmitirOS.className = "w-full h-12 text-sm font-bold text-orange-950 bg-orange-200 hover:bg-orange-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer";
        btnEmitirOS.title = "Emitir Ordem de Serviço Técnica em A4 Paisagem";
      } else {
        btnEmitirOS.disabled = true;
        btnEmitirOS.className = "w-full h-12 text-sm font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl transition shadow-none flex items-center justify-center gap-2 cursor-not-allowed opacity-60";
        btnEmitirOS.title = "Emissão de O.S. liberada exclusivamente para Venda, Patrocínio ou Permuta (Orçamento e Pré-Venda não emitem O.S.)";
      }
    }
  },

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

  getTypeDisplayName(type, unitSigla = '') {
    const units = (window.store && window.store.getUnits) ? window.store.getUnits() : [];
    const found = units.find(u => u.id === type || u.tipo_calculo === type);
    if (found) {
      return `${found.nome}${found.sigla ? ' [' + found.sigla + ']' : ''}`;
    }
    const defaultLabels = {
      'm2': 'm² (X x Y)',
      'unidade': 'Unidade',
      'servico': 'Serviço',
      'diaria': 'Diária',
      'hora': 'Hora',
      'L': 'L (Litro)',
      'linear': 'Linear'
    };
    return defaultLabels[type] || (unitSigla ? `${type} (${unitSigla})` : type);
  },

  handleProdSelect(selectEl) {
    if (!selectEl) return;
    const prodId = selectEl.value;
    if (!prodId) return;
    const products = window.store.getProducts();
    const prod = products.find(p => String(p.id) === String(prodId));
    const opt = selectEl.options[selectEl.selectedIndex];
    const price = prod ? (prod.preco_base ?? 0) : parseFloat(opt?.getAttribute('data-price') || 0);
    const type = prod ? (prod.tipo_cobranca || 'm2') : (opt?.getAttribute('data-type') || 'm2');
    const unit = prod ? (prod.unidade_medida || '') : (opt?.getAttribute('data-unit') || '');

    const priceInput = document.getElementById('item-price');
    if (priceInput) {
      priceInput.value = parseFloat(price).toFixed(2);
    }
    const typeHidden = document.getElementById('item-type');
    if (typeHidden) {
      typeHidden.value = type;
    }
    const typeDisplay = document.getElementById('item-type-display');
    if (typeDisplay) {
      typeDisplay.value = this.getTypeDisplayName(type, unit);
    }
    const descInput = document.getElementById('item-desc');
    if (descInput) {
      // Imagem 2: Detalhes em branco para o operador digitar a arte (ex: Homem-Aranha, Superman...)
      if (this.editingItemIdx === undefined || this.editingItemIdx === null) {
        descInput.value = '';
      }
      descInput.placeholder = 'Ex: Homem-Aranha, Superman, Candidato Fulano...';
    }
    this.toggleDimensionInputs();
    this.calcPiecePrice();
  },

  toggleDimensionInputs() {
    const type = document.getElementById('item-type')?.value || 'm2';
    const widthInput = document.getElementById('item-width');
    const heightInput = document.getElementById('item-height');
    const qtyInput = document.getElementById('item-qty');
    const priceRefText = document.getElementById('item-price-ref-text');

    if (widthInput) {
      if (type === 'm2' || type === 'linear') {
        widthInput.disabled = false;
        widthInput.classList.remove('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
        widthInput.classList.add('bg-white');
      } else {
        widthInput.disabled = true;
        widthInput.value = '0.00';
        widthInput.classList.remove('bg-white');
        widthInput.classList.add('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
      }
    }

    if (heightInput) {
      if (type === 'm2') {
        heightInput.disabled = false;
        heightInput.classList.remove('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
        heightInput.classList.add('bg-white');
      } else {
        heightInput.disabled = true;
        heightInput.value = '0.00';
        heightInput.classList.remove('bg-white');
        heightInput.classList.add('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
      }
    }

    if (qtyInput) {
      if (type === 'hora') {
        qtyInput.step = '0.5';
        qtyInput.min = '0.5';
      } else if (type === 'L') {
        qtyInput.step = '0.1';
        qtyInput.min = '0.1';
      } else {
        qtyInput.step = '1';
        qtyInput.min = '1';
      }
    }

    if (priceRefText) {
      const labels = {
        'm2': 'Base m²',
        'unidade': 'Base Unidade',
        'servico': 'Base Serviço',
        'diaria': 'Base Diária',
        'hora': 'Base Hora',
        'L': 'Base Litro (L)',
        'linear': 'Base Metro Linear'
      };
      priceRefText.innerText = labels[type] || 'Base m² / un';
    }
  },

  openQuickProductModal() {
    if (window.productsModule && typeof window.productsModule.openModal === 'function') {
      window.productsModule.openModal();
    }
  },

  refreshProductOptions(selectedId = null) {
    const sel = document.getElementById('item-prod-select');
    if (!sel) return;
    const products = window.store.getProducts() || [];
    sel.innerHTML = `
      <option value="">Selecione...</option>
      ${products.map(p => {
        const paramLabel = p.tipo_cobranca === 'm2' ? 'm²' : (p.unidade_medida || p.tipo_cobranca);
        return `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (${paramLabel})</option>`;
      }).join('')}
    `;
    if (selectedId) {
      sel.value = selectedId;
      this.handleProdSelect(sel);
    }
  },

  editItem(idx) {
    const it = this.activeItems[idx];
    const prodSelect = document.getElementById('item-prod-select');
    prodSelect.value = it.produto_id || '';
    if (prodSelect.value) { this.handleProdSelect(prodSelect); }
    
    document.getElementById('item-desc').value = it.descricao || '';
    document.getElementById('item-type').value = it.tipo_calculo || 'm2';
    const typeDisplay = document.getElementById('item-type-display');
    if (typeDisplay) {
      typeDisplay.value = this.getTypeDisplayName(it.tipo_calculo || 'm2', it.unidade_medida);
    }
    document.getElementById('item-price').value = it.preco_base || '0.00';
    document.getElementById('item-width').value = it.largura_x || '0.00';
    document.getElementById('item-height').value = it.comprimento_y || '0.00';
    document.getElementById('item-qty').value = it.quantidade || '1';
    
    const itemArteInput = document.getElementById('item-arte-url');
    if (itemArteInput) itemArteInput.value = it.arte_url || '';
    
    const prevContainer = document.getElementById('item-arte-preview-container');
    const prevImg = document.getElementById('item-arte-img');
    const arteBtn = document.getElementById('item-arte-btn');
    if (it.arte_url) {
      if (prevContainer && prevImg) {
        prevImg.src = it.arte_url;
        prevContainer.classList.remove('hidden');
      }
      if (arteBtn) {
        arteBtn.className = 'w-full h-full bg-emerald-100 border border-emerald-400 rounded flex items-center justify-center text-emerald-600';
      }
    } else {
      if (prevContainer) prevContainer.classList.add('hidden');
      if (arteBtn) {
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
      cancelBtn.onclick = async () => {
        const confirmar = await window.grafsisConfirm({
          title: 'GRAFSIS',
          message: 'Cancelar edição e limpar formulário do item?',
          confirmText: 'Sim, Cancelar',
          cancelText: 'Continuar Editando'
        });
        if (confirmar) {
          salesModule.activeItems.splice(idx, 0, it);
          document.getElementById('order-items-tbody').innerHTML = salesModule.renderActiveItemsHtml();
          document.getElementById('item-desc').value = '';
          document.getElementById('item-prod-select').value = '';
          document.getElementById('item-price').value = '0.00';
          document.getElementById('item-width').value = '0.00';
          document.getElementById('item-height').value = '0.00';
          document.getElementById('item-qty').value = '1';
          salesModule.removeItemArte();
          salesModule.toggleDimensionInputs();
          salesModule.calcPiecePrice();
          cancelBtn.remove();
          salesModule.recalcTotals('val');
        }
      };
      const insertBtn = document.querySelector('button[onclick="salesModule.addItemToOrder()"]');
      if (insertBtn) insertBtn.parentNode.appendChild(cancelBtn);
    }
  },

  openModal(params = {}) {
    if (window.authModule && !window.authModule.can('canCreateOrders')) {
      const user = window.authModule.getCurrentUser();
      const roleName = user ? (user.role || user.perfil || 'PRODUÇÃO') : 'PRODUÇÃO';
      alert(`Acesso Restrito: O perfil ${roleName} não possui permissão para emitir vendas ou orçamentos.\n\nA emissão e precificação de pedidos é restrita aos perfis Vendas, Gerente e Proprietário.`);
      return;
    }
    this.isFormOpen = true;
    this.currentEditingOrderId = params.orderId || null;
    this.editingItemIdx = null;
    const clients = window.store.getClients();
    const products = window.store.getProducts();
    const isEdit = params.orderId ? true : false;
    const order = isEdit ? window.store.getOrders().find(o => String(o.id) === String(params.orderId) || String(o.numero) === String(params.orderId)) : null;
    
    this.isReadOnlyFinancial = false;
    if (isEdit && order) {
      const userRole = window.authModule ? (window.authModule.getCurrentUser().tipo || window.authModule.getCurrentUser().perfil || window.authModule.getCurrentUser().role || '').toUpperCase() : '';
      const isManagerOrOwner = ['GERENTE', 'PROPRIETARIO', 'ADMIN'].includes(userRole);
      const op = (order.tipo_operacao || order.tipo || 'venda').toLowerCase();
      const isAdvancedSale = op === 'venda' && ['liberado', 'producao', 'acabamento', 'embalagem', 'entregue'].includes(order.status_fase);
      if (isAdvancedSale && !isManagerOrOwner) {
        this.isReadOnlyFinancial = true;
      }
    }

    this.activeItems = order ? JSON.parse(JSON.stringify(order.itens || [])).map(it => ({
      ...it,
      liberado_os: it.liberado_os !== undefined ? it.liberado_os : true
    })) : [];
    this.activeRepositoryItems = order ? JSON.parse(JSON.stringify(order.repositorio_arquivos || [])) : [];
    if (params.preItem) {
      this.activeItems.push({
        ...params.preItem,
        liberado_os: params.preItem.liberado_os !== undefined ? params.preItem.liberado_os : true
      });
    }
    
    // Resolução Relacional Ultra-Resiliente do Cliente (1 Cliente -> Muitos Pedidos)
    let foundClient = null;
    if (order) {
      if (order.cliente_id) {
        foundClient = clients.find(c => String(c.id) === String(order.cliente_id));
      }
      if (!foundClient && order.cliente_nome) {
        foundClient = clients.find(c => c.nome && c.nome.toLowerCase().trim() === String(order.cliente_nome).toLowerCase().trim());
      }
      if (!foundClient && order.cliente_cpf) {
        foundClient = clients.find(c => c.cpf_cnpj && String(c.cpf_cnpj).replace(/\D/g, '') === String(order.cliente_cpf).replace(/\D/g, ''));
      }
      if (!foundClient && order.cliente_telefone) {
        foundClient = clients.find(c => c.telefone_whatsapp && String(c.telefone_whatsapp).replace(/\D/g, '') === String(order.cliente_telefone).replace(/\D/g, ''));
      }
    }
    const initialClientId = foundClient ? foundClient.id : (params.clientId || (order && order.cliente_id) || '');
    const hasKnownClientInList = clients.some(c => String(c.id) === String(initialClientId));

    const isRegistered = !!(order && (order.status_registro === 'registrado' || order.registrado === true || order.registrado === 'sim'));
    this.isOrderRegistered = isRegistered;

    // Regra Imagens 1, 2 e 3: Se cliente <> null, atribui último ID + 1 logo no começo da operação
    if (isEdit && order && order.numero) {
      this.currentAssignedOrderId = String(order.numero);
    } else if (!isEdit && initialClientId) {
      this.currentAssignedOrderId = this.getNextOrderId();
    } else {
      this.currentAssignedOrderId = null;
    }

    const displayId = isEdit ? order.numero : (this.currentAssignedOrderId || '#NOVO');
    this.activeItems.forEach((it, idx) => {
      if (!it.item_id || !it.item_id.startsWith(String(displayId))) {
        it.item_id = (displayId && displayId !== '#NOVO')
          ? (String(displayId) + String(idx + 1).padStart(2, '0'))
          : ('ITEM' + String(idx + 1).padStart(2, '0'));
      }
    });
    const canPermutaPatrocinio = this.canManagePermutaPatrocinio();
    
    const defValidadeDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const initialOp = (order && (order.tipo_operacao || order.tipo)) || 'venda';
    const isBudgetOrPre = (initialOp === 'orcamento' || initialOp === 'pre-venda');
    const isPermutaPatrocinio = (initialOp === 'permuta' || initialOp === 'patrocinio');
    const hasClientAcceptance = order && (order.data_aceite || order.aprovado_cliente);

    this.isOrderLockedByApproval = isEdit && !!hasClientAcceptance;
    this.isEditingActive = !isRegistered && !isEdit;

    const approvalLinkValue = (order && (order.id || order.numero))
      ? `${window.location.origin}${window.location.pathname}#aprovacao?id=${order.id || order.numero}`
      : ((displayId && displayId !== '#NOVO')
        ? `${window.location.origin}${window.location.pathname}#aprovacao?id=${displayId}`
        : '');

    const formHtml = `
      <div class="space-y-4 max-w-6xl mx-auto pb-10">
        <div class="sticky top-0 z-40 bg-white/95 backdrop-blur rounded-xl w-full p-4 mb-4 shadow-sm border border-slate-200">
          <div class="flex justify-between items-center mb-3">
            <div>
              <button type="button" onclick="salesModule.render()" class="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 mb-1">
                &larr; Voltar para Lista
              </button>
              <h2 class="text-2xl font-black text-slate-800">${isEdit ? 'Editar Pedido' : 'Nova Venda / Orçamento'}</h2>
            </div>
            <div class="text-right flex flex-col items-end">
              <span class="block text-xs font-bold text-slate-500 uppercase tracking-wider">ID OPERAÇÃO</span>
              <span class="text-2xl font-black text-blue-700 dark:text-cyan-400 font-mono tracking-tight" id="display-order-id-label">${(displayId && displayId !== '#NOVO') ? '#' + displayId : '#NOVO (Gerado ao salvar)'}</span>
              <input type="hidden" id="current-display-id" value="${displayId}">
              ${order ? `
                <button type="button" onclick="salesModule.openApprovalShareModal('${order.id}')" class="mt-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer" title="Visualizar proposta e encaminhar link de liberação via WhatsApp">
                  <span>📱 Link de Liberação / WhatsApp</span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- TARJA VERDE OFICIAL DE ACEITE (Quando Cliente Aprovou o Pedido) -->
          ${hasClientAcceptance ? `
            <div class="p-3.5 bg-emerald-600 text-white rounded-xl shadow-md border-2 border-emerald-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2 animate-fadeIn">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black text-2xl shrink-0 shadow-inner">✓</div>
                <div>
                  <h4 class="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                    ARTE E PROPOSTA APROVADA PELO CLIENTE
                    <span class="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-full font-mono">CAMPOS TRAVADOS (EXCETO ENTREGA E OBS)</span>
                  </h4>
                  <p class="text-xs text-emerald-100">Layout conferido, valores financeiros de acordo, prazo confirmado e liberação de produção autorizada.</p>
                  <div class="flex items-center gap-2 mt-1.5 flex-wrap text-[11px]">
                    <span class="bg-emerald-700 px-2.5 py-0.5 rounded font-mono font-bold">🔑 Senha Validada: ${order.aprovado_cliente?.codigo_validado || order.codigo_autorizacao || 'OK'}</span>
                    ${order.aprovado_cliente?.geo ? `<span class="bg-emerald-700 px-2.5 py-0.5 rounded font-mono">📍 GPS: Lat ${order.aprovado_cliente.geo.latitude?.toFixed(4)}, Long ${order.aprovado_cliente.geo.longitude?.toFixed(4)}</span>` : ''}
                    ${order.aprovado_cliente?.hora_segundos ? `<span class="bg-emerald-700 px-2.5 py-0.5 rounded font-mono">⏱️ Carimbo: ${order.aprovado_cliente.hora_segundos}</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="text-right text-xs font-mono bg-emerald-700/90 px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-100 shrink-0">
                <strong>${order.aprovado_cliente?.aprovador || order.cliente_nome || 'Cliente'}</strong>
                <span class="block text-[11px] opacity-90">${order.aprovado_cliente?.data_formatada || (order.aprovado_cliente?.data ? new Date(order.aprovado_cliente.data).toLocaleString('pt-BR') : (order.data_aceite ? new Date(order.data_aceite).toLocaleDateString('pt-BR') : 'Aceite Confirmado'))}</span>
              </div>
            </div>
          ` : ''}

          <!-- AVISO DE VENDA FINALIZADA (QUANDO VENDEDOR EDITA DETALHES) -->
          ${this.isReadOnlyFinancial ? `
            <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold mb-2 flex items-center gap-2">
              <span class="text-base">🔒</span>
              <span><strong>Venda Finalizada:</strong> Valores financeiros e itens estão protegidos contra alteração (Reabertura restrita a Gerente/Proprietário). Detalhes de entrega, prazos e observações liberados para edição.</span>
            </div>
          ` : ''}
          
          <form id="order-form" onsubmit="salesModule.saveOrder(event, '${order ? order.id : ''}', '${displayId}')" class="space-y-4">
            
            <!-- GRID SUPERIOR: CLIENTE, TIPO DE OPERAÇÃO E CONTROLES ESPECÍFICOS (IMAGEM 1) -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="md:col-span-2">
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-slate-800">Cliente *</label>
                  ${!this.isReadOnlyFinancial ? `
                    <button type="button" onclick="clientsModule.openModal()" class="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer" title="Cadastrar cliente rápido sem sair">
                      + Novo Cliente
                    </button>
                  ` : ''}
                </div>
                <select name="cliente_id" id="order-cliente-select" required class="w-full p-2.5 border-2 border-blue-400 rounded-lg text-sm bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" onchange="salesModule.checkClientStatusAndAge(this)" ${this.isReadOnlyFinancial ? 'disabled' : ''}>
                  <option value="">Selecione o Cliente...</option>
                  ${(!hasKnownClientInList && order && (order.cliente_nome || initialClientId)) ? `
                    <option value="${initialClientId || 'vinculado'}" selected>${order.cliente_nome || 'Cliente do Pedido'} (Vinculado)</option>
                  ` : ''}
                  ${clients.map(c => `<option value="${c.id}" ${String(initialClientId) === String(c.id) ? 'selected' : ''}>${c.nome} ${c.cpf_cnpj ? '('+c.cpf_cnpj+')' : ''}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold mb-1 text-slate-700">Tipo de Operação</label>
                <select name="tipo_operacao" id="order-tipo-operacao" onchange="salesModule.handleOperationTypeChange(this)" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white font-bold text-slate-800 shadow-sm">
                  <option value="venda" ${initialOp === 'venda' ? 'selected' : ''}>Venda</option>
                  <option value="pre-venda" ${initialOp === 'pre-venda' ? 'selected' : ''}>Pré-Venda</option>
                  <option value="orcamento" ${initialOp === 'orcamento' ? 'selected' : ''}>Orçamento</option>
                  <option value="permuta" ${initialOp === 'permuta' ? 'selected' : ''} ${!canPermutaPatrocinio ? 'disabled' : ''}>Permuta ${!canPermutaPatrocinio ? '(Requer Gerente)' : ''}</option>
                  <option value="patrocinio" ${initialOp === 'patrocinio' ? 'selected' : ''} ${!canPermutaPatrocinio ? 'disabled' : ''}>Patrocínio ${!canPermutaPatrocinio ? '(Requer Gerente)' : ''}</option>
                </select>
              </div>

              <!-- 1. Coluna Dinâmica: Validade da Proposta (Orçamento e Pré-Venda) -->
              <div id="top-col-validade" class="${isBudgetOrPre ? '' : 'hidden'} grid grid-cols-2 gap-2 bg-indigo-50/60 p-2 rounded-lg border border-indigo-200">
                <div>
                  <label class="block text-[11px] font-bold text-indigo-900 mb-1">Validade (Dias)</label>
                  <input type="number" name="validade_proposta_dias" id="dias-validade" min="1" value="${order && order.validade_proposta_dias ? order.validade_proposta_dias : 10}" oninput="salesModule.updateValidadeDateFromDays()" class="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white font-bold text-center">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-indigo-900 mb-1">Válido Até</label>
                  <input type="date" name="data_validade" id="data-validade" oninput="salesModule.updateValidadeDaysFromDate()" onchange="salesModule.updateValidadeDaysFromDate()" value="${order && order.data_validade ? order.data_validade : defValidadeDate}" class="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white font-bold">
                </div>
              </div>

              <!-- 2. Coluna Dinâmica: Percentual Permuta / Patrocínio -->
              <div id="top-col-percentual" class="${isPermutaPatrocinio ? '' : 'hidden'} bg-teal-50/60 p-2 rounded-lg border border-teal-200">
                <label class="block text-[11px] font-bold text-teal-900 mb-1">Percentual Operação (%)</label>
                <div class="flex items-center gap-1">
                  <input type="number" name="percentual_operacao" id="operacao-percentual" min="1" max="100" value="${order && order.percentual_operacao ? order.percentual_operacao : 100}" class="w-full p-1.5 border border-teal-300 rounded text-xs bg-white font-black text-teal-800 text-center">
                  <span class="text-xs font-bold text-teal-700">%</span>
                </div>
              </div>

              <!-- 3. Coluna Informativa: Venda Padrão -->
              <div id="top-col-venda" class="${(!isBudgetOrPre && !isPermutaPatrocinio) ? '' : 'hidden'} flex items-center p-2 rounded-lg bg-blue-50/40 border border-blue-200">
                <span class="text-xs font-semibold text-blue-800">Venda Direta / Faturamento Padrão</span>
              </div>
            </div>

            <!-- AVISO VISUAL QUANDO CLIENTE NÃO SELECIONADO -->
            <div id="client-required-notice" class="${initialClientId ? 'hidden' : ''} p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl text-center text-amber-900 font-bold text-sm shadow-sm">
              ⚠️ <span class="underline">Selecione primeiro o Cliente</span> acima para liberar o preenchimento dos itens e opções do pedido.
            </div>

            <!-- SEÇÃO DE ITENS DO PEDIDO -->
            <div class="bg-white rounded-xl w-full p-4 sm:p-6 shadow-sm border border-slate-200 mt-4 transition-all" id="secao-itens-pedido">
              <div class="border border-slate-300 rounded-xl p-4 bg-white">
                <h3 class="text-sm font-bold text-slate-800 uppercase mb-3 border-b pb-2">Itens do Pedido</h3>
                
                <div class="grid grid-cols-1 gap-3 bg-blue-50/50 p-3 rounded-lg text-xs border border-blue-100">
                  <div class="grid grid-cols-12 gap-2">
                    <div class="col-span-12 sm:col-span-4">
                      <label class="block font-semibold mb-1 text-slate-700">Produto Base *</label>
                      <select id="item-prod-select" onchange="salesModule.handleProdSelect(this)" class="w-full p-2 border border-slate-300 rounded bg-white font-semibold">
                        <option value="">Selecione...</option>
                        ${products.map(p => {
                          const paramLabel = p.tipo_cobranca === 'm2' ? 'm²' : (p.unidade_medida || p.tipo_cobranca);
                          return `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (${paramLabel})</option>`;
                        }).join('')}
                      </select>
                    </div>
                    <!-- Parâmetro de Cálculo aumentado em mais de 30% (de col-span-3 para col-span-4) -->
                    <div class="col-span-12 sm:col-span-4">
                      <label class="block font-semibold mb-1 text-slate-700">Parâmetro de Cálculo</label>
                      <input type="text" id="item-type-display" readonly disabled value="m² (X x Y)" class="w-full p-2 border border-slate-300 rounded bg-slate-100 font-semibold text-slate-700 cursor-not-allowed select-none shadow-inner" title="Pré-definido no cadastro do produto (não editável aqui)">
                      <input type="hidden" id="item-type" value="m2">
                    </div>
                    <!-- Base m² / un fica com a sobra (col-span-2) -->
                    <div class="col-span-6 sm:col-span-2">
                      <label class="block font-semibold mb-1 text-slate-700 flex items-center justify-between" id="item-price-label">
                        <span id="item-price-ref-text">Base m² / un</span>
                        <span class="text-[9px] text-slate-400 font-normal">2x clique (4s)</span>
                      </label>
                      <input type="number" step="0.01" id="item-price" value="0.00" oninput="salesModule.calcPiecePrice()" onmouseenter="salesModule.handlePriceHover(this, true)" onmouseleave="salesModule.handlePriceHover(this, false)" ondblclick="salesModule.revealPrice4s(this)" style="color: transparent; text-shadow: none;" class="w-full p-2 border border-slate-300 rounded bg-white font-mono font-bold transition-all duration-200 cursor-pointer selection:text-transparent" title="Preço base - Passe o mouse ou dê duplo clique para visualizar por 4 segundos">
                    </div>
                    <div class="col-span-6 sm:col-span-2 flex items-end">
                      <button type="button" onclick="salesModule.openQuickProductModal()" class="w-full h-[38px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer" title="Adicionar Novo Produto no Catálogo">
                        <span class="text-sm font-black">+</span>
                        <span>Novo Produto</span>
                      </button>
                    </div>
                  </div>

                  <!-- LINHA DE MEDIDAS, QUANTIDADE, PREÇOS E BOTÃO INSERIR ITEM -->
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
                      <!-- Imagem 1: Ícone de Upload (Nuvem com Seta para Cima) -->
                      <div class="relative w-10 h-[38px] flex-shrink-0" title="Upload de Arte / Imagem do Item (Clique para anexar)">
                        <input type="file" id="item-arte-upload" accept="image/png, image/jpeg, image/jpg, image/webp" class="absolute inset-0 opacity-0 cursor-pointer z-10" onchange="salesModule.handleItemArteUpload(this)" title="Fazer Upload da Imagem ou Arte do Item">
                        <div id="item-arte-btn" class="w-full h-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center justify-center text-blue-600 transition-colors shadow-xs">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        </div>
                        <input type="hidden" id="item-arte-url" value="">
                      </div>
                      <button type="button" onclick="salesModule.addItemToOrder()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-sm text-[11px] h-[38px] uppercase whitespace-nowrap">+ INSERIR ITEM</button>
                    </div>
                  </div>

                  <!-- Imagem 1: Descrição / Detalhes * (abaixo da linha de medidas e inserção) -->
                  <div>
                    <label class="block font-semibold mb-1 text-slate-700">Descricao / Detalhes *</label>
                    <input type="text" id="item-desc" placeholder="Ex: Homem-Aranha, Superman, Candidato Fulano..." class="w-full p-2 border border-slate-300 rounded bg-white">
                  </div>

                  <!-- PREVIEW DA IMAGEM SUBIDA NO ITEM (IMAGEM QUE FOI SUBIDA) -->
                  <div id="item-arte-preview-container" class="hidden mt-2 p-2.5 bg-white border border-blue-200 rounded-lg flex items-center justify-between shadow-sm">
                    <div class="flex items-center gap-3">
                      <img id="item-arte-img" src="" class="w-12 h-12 object-cover rounded-md border-2 border-blue-400 shadow cursor-pointer" onclick="window.open(this.src, '_blank')" title="Clique para ver imagem original">
                      <div>
                        <span class="text-xs font-black text-blue-900 block">Arte / Imagem Anexada</span>
                        <span class="text-[10px] text-slate-500">Pronta para inserção com o item</span>
                      </div>
                    </div>
                    <button type="button" onclick="salesModule.removeItemArte()" class="text-red-600 hover:text-red-800 text-xs font-bold px-2.5 py-1 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition">Remover Imagem</button>
                  </div>
                </div>

                <!-- BARRA DE ISOLAMENTO E FILTRO DE ITENS P/ ORDEM DE SERVIÇO (IMAGEM 1) -->
                <div class="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-slate-700 flex items-center gap-1">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                      Liberação O.S.:
                    </span>
                    <input type="text" id="filter-item-code-os" placeholder="Isolar item (ex: #${displayId}01 ou 01)..." onkeydown="if(event.key==='Enter'){event.preventDefault(); salesModule.isolateTypedItemOs();}" class="p-1.5 border border-slate-300 rounded text-xs font-mono w-44 bg-white focus:ring-1 focus:ring-blue-500">
                    <button type="button" onclick="salesModule.isolateTypedItemOs()" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px] transition shadow-sm cursor-pointer">Isolar Item</button>
                    <button type="button" onclick="salesModule.resetItemsOsFilter()" class="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold text-[11px] transition cursor-pointer">Liberar Todos</button>
                  </div>
                  <div id="os-items-status-info" class="text-[11px] text-emerald-600 font-bold">
                    ● Todos os itens liberados para O.S.
                  </div>
                </div>

                <div class="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                  <table class="w-full text-sm text-left">
                    <thead class="bg-slate-100 text-slate-500 uppercase text-xs font-bold">
                      <tr>
                        <th class="p-3 text-center w-12" title="Liberar para O.S. (Padrão: Marcado)">
                          <div class="flex flex-col items-center gap-0.5">
                            <span class="text-[9px] text-blue-700 font-black">O.S.</span>
                            <input type="checkbox" id="check-all-os" checked onchange="salesModule.toggleAllItemsOs(this.checked)" title="Marcar / Desmarcar todos para O.S." class="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600">
                          </div>
                        </th>
                        <th class="p-3">Produto & Item</th>
                        <th class="p-3">Dimensoes</th>
                        <th class="p-3 text-center">Qtd</th>
                        <th class="p-3">Area</th>
                        <th class="p-3">Preco</th>
                        <th class="p-3 text-right">Total</th>
                        <th class="p-3 text-center">Acao</th>
                      </tr>
                    </thead>
                    <tbody id="order-items-tbody">${this.renderActiveItemsHtml()}</tbody>
                  </table>
                </div>
              </div>

              <!-- LINHA AMARELA: ENTREGA DO PEDIDO & PRAZOS DE PRODUÇÃO (IMAGEM 2) -->
              <div class="border-t-4 border-yellow-400 bg-amber-50/40 p-4 rounded-xl border border-slate-200 mt-4 transition-all" id="secao-entrega-pedido">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <h3 class="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                    Entrega do Pedido & Prazos de Produção
                  </h3>
                  <span id="entrega-badge-info" class="text-xs font-bold text-emerald-600">● Habilitado para Produção</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Prazo de Entrega (Dias)</label>
                    <input type="number" id="dias-entrega" min="0" oninput="salesModule.updateDateFromDays()" placeholder="Ex: 5" value="${order && order.dias_entrega ? order.dias_entrega : ''}" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Previsão de Entrega</label>
                    <input type="date" name="previsao_entrega" id="previsao_entrega" oninput="salesModule.updateDaysFromDate()" onchange="salesModule.updateDaysFromDate()" value="${order ? (order.previsao_entrega || '') : new Date().toISOString().split('T')[0]}" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                  </div>
                  <div class="sm:col-span-2 flex items-center text-xs text-slate-500 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                    Previsão repassada ao cliente e sincronizada com as fases do Kanban da Produção. Só se habilita em Venda, Permuta e Patrocínio.
                  </div>
                </div>
              </div>

              <!-- DADOS DA PRODUÇÃO & FECHAMENTO FINANCEIRO -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200" id="secao-producao-validacoes">
                  <h3 class="text-sm font-bold text-slate-800 uppercase border-b pb-2">Dados da Produção & Validações</h3>
                  
                  <div>
                    <label class="block text-xs font-semibold mb-1 text-slate-700">Observações Técnicas</label>
                    <textarea name="observacoes" rows="2" class="w-full p-2 border rounded-lg text-sm bg-white">${order ? (order.observacoes || '') : ''}</textarea>
                  </div>

                  <!-- IDENTIFICAÇÃO E STATUS DA OPERAÇÃO (MUDADO CONFORME IMAGEM 4) -->
                  <div class="pt-2 border-t border-slate-200" id="secao-status-producao">
                    <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                      <div class="flex items-center gap-2.5">
                        <span class="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></span>
                        <div>
                          <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Identificação & Status</div>
                          <div class="text-sm font-black text-slate-800 flex items-center gap-1.5">
                            <span>Operação <strong id="display-order-numero-tag" class="font-mono text-blue-700">#${displayId}</strong></span>
                          </div>
                          <!-- Data e hora da mudança de fase colocada abaixo da Operação (Imagem 4) -->
                          <div id="display-order-phase-time" class="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>Fase alterada em: <strong id="display-order-phase-time-val" class="text-slate-700">${this.getPhaseChangeTimeFormatted(order)}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="text-[10px] font-bold uppercase text-slate-400 block">Fase Atual</span>
                        <span id="badge-fase-atual" class="text-xs font-black px-2.5 py-1 ${this.getPhaseBadgeClass(initialOp)} rounded-lg border uppercase">${this.getPhaseLabel(initialOp).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <!-- REPOSITÓRIO DA OPERAÇÃO / FOTOS DO LOCAL, PRINTS & GOOGLE DRIVE (MARCAÇÃO VERDE IMAGEM 1) -->
                  <div class="pt-2" id="secao-repositorio-operacao">
                    <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
                      <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                        </div>
                        <div>
                          <div class="text-[11px] text-emerald-950 font-black uppercase tracking-wide flex items-center gap-1.5">
                            Repositório da Operação
                            <span id="repo-count-badge" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900">${(this.activeRepositoryItems && this.activeRepositoryItems.length) ? this.activeRepositoryItems.length + ' arquivo(s)' : '0 arquivos'}</span>
                          </div>
                          <div class="text-[11px] text-emerald-800 font-medium leading-tight">
                            Fotos do local, fachada, prints, câmera do celular e Google Drive
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onclick="salesModule.openRepositoryModal('${order ? order.id : ''}', '${displayId}')" 
                        class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        <span>Abrir Repositório</span>
                      </button>
                    </div>
                  </div>

                  <!-- CAMPOS OCULTOS PARA COMPATIBILIDADE -->
                  <input type="hidden" name="foto_arte_url" id="order-arte-url" value="${order ? (order.foto_arte_url || '') : ''}">
                  <input type="hidden" name="data_aceite" id="order-data-aceite" value="${order && order.data_aceite ? order.data_aceite.slice(0,10) : ''}">
                  <input type="hidden" name="autorizo_producao" id="order-autorizo-producao" value="${order ? (order.autorizo_producao || '') : ''}">
                  <input type="hidden" name="conferencia_arte" id="order-conferencia-arte" value="${order ? (order.conferencia_arte || '') : ''}">
                </div>

                <div class="space-y-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100" id="secao-fechamento-financeiro">
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
                    <input type="text" id="order-discount" value="${Number(order ? (order.desconto || 0) : 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}" placeholder="0,00" oninput="salesModule.recalcTotals('val')" onblur="salesModule.formatCurrencyInput(this, 'val')" class="w-28 p-1.5 border rounded-lg text-right font-mono text-sm bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-400">
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span class="text-base font-black text-blue-900">Total Final:</span>
                    <span class="text-xl font-black text-blue-700 font-mono" id="order-total-final">R$ 0,00</span>
                  </div>
                  
                  <!-- ENTRADA DIRETA NO FORMULÁRIO (Imagem 3: Padrão ###.###,00 Sempre com 2 Casas Decimais) -->
                  <div class="bg-white p-3 rounded-xl border border-blue-200 space-y-2 mt-2">
                    <div class="flex justify-between items-center">
                      <div>
                        <span class="text-xs font-black text-emerald-800 uppercase block">Valor de Entrada (R$):</span>
                        <span class="text-[10px] text-slate-400">Sinal pago no ato</span>
                      </div>
                      <input type="text" id="order-valor-entrada" value="${Number(order ? (order.valor_entrada || order.valor_recebido || 0) : 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}" placeholder="0,00" oninput="salesModule.recalcTotals('entrada')" onblur="salesModule.formatCurrencyInput(this, 'entrada')" class="w-28 p-1.5 border-2 border-emerald-400 rounded-lg text-right font-mono text-sm bg-emerald-50 text-emerald-800 font-black focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    </div>
                    <div class="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span class="text-xs font-bold text-slate-600 uppercase">Saldo a Pagar (Falta):</span>
                      <span class="text-base font-black text-rose-600 font-mono" id="order-saldo-restante">R$ 0,00</span>
                    </div>
                  </div>

                  <div class="mt-2 pt-2 border-t border-blue-100">
                    <button type="button" id="btn-detalhes-recibo" onclick="salesModule.openFinanceModal()" class="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-lg shadow-sm flex justify-center items-center gap-2 transition cursor-pointer" title="Lançar recebimento, entrada, pagamentos e emitir recibo no Caixa">
                      <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <!-- Baú de Moedas -->
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" fill="#FEF08A"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10c0-3 3-5 8-5s8 2 8 5"/>
                        <circle cx="12" cy="13" r="1.5" fill="#854D0E" stroke="none"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14.5V16.5"/>
                        <circle cx="8" cy="5" r="2.5" fill="#FACC15" stroke="#CA8A04" stroke-width="1"/>
                        <circle cx="16" cy="5" r="2.5" fill="#FACC15" stroke="#CA8A04" stroke-width="1"/>
                      </svg>
                      Caixa
                    </button>
                    <div class="text-center mt-3 bg-green-50 p-2 rounded border border-green-100 hidden" id="finance-summary">
                      <span class="text-xs font-bold text-slate-600">Total Recebido:</span>
                      <span class="text-sm font-black text-green-700" id="finance-received-text">R$ 0,00 (0%)</span>
                      <input type="hidden" id="order-valor-recebido" value="${order ? (order.valor_recebido || order.valor_entrada || 0) : 0}">
                      <input type="hidden" id="order-metodo-pagto" name="forma_pagamento" value="${order ? (order.forma_pagamento || '') : ''}">
                      <input type="hidden" id="order-obs-pagto" name="obs_pagto" value="${order ? (order.obs_pagto || '') : ''}">
                    </div>
                  </div>
                </div>
              </div>

              <!-- BARRA DE BOTÕES & CONTROLE OPERACIONAL (Grid de 6 Botões Padronizados) -->
              <input type="hidden" name="status_fase" value="${order ? (order.status_fase || 'orcamento') : 'orcamento'}">
              <div class="pt-6 mt-4 border-t bg-slate-50 p-4 rounded-xl border border-slate-200" id="secao-botoes-acoes">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  <!-- LINHA SUPERIOR (3 BOTÕES) -->
                  <!-- 1. Cancelar Edição (Com cor Rose/Vinho bem definida conforme Imagem 5) -->
                  <button type="button" id="btn-cancel-action" onclick="salesModule.handleCancelEdit()" class="w-full h-12 text-sm font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Cancelar alterações e voltar">
                    <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Cancelar Edição
                  </button>

                  <!-- 2. Editar Operação (Amarelo) -->
                  <button type="button" id="btn-edit-order" onclick="salesModule.handleEditAction('${order ? order.id : ''}')" class="w-full h-12 text-sm font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 border border-amber-500 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Editar dados e itens da operação">
                    <svg class="w-4 h-4 text-amber-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Editar Operação
                  </button>

                  <!-- 3. Gravar Operação (Verde) -->
                  <button type="button" id="btn-save-draft" onclick="salesModule.saveOrderQuick(event, '${order ? order.id : ''}', '${displayId}')" class="w-full h-12 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Gravar a operação no sistema">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    Gravar Operação
                  </button>

                  <!-- LINHA INFERIOR (3 BOTÕES) -->
                  <!-- 4. Registrar Operação / Operação Registrada (Imagem 4) -->
                  <button type="button" id="btn-submit-order" onclick="salesModule.saveOrder(event, '${order ? order.id : ''}', '${displayId}')" class="w-full h-12 text-sm font-bold ${isRegistered ? 'text-white bg-[#009b3a] hover:bg-[#008230]' : 'text-slate-900 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500'} rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer" title="${isRegistered ? 'Operação já registrada no sistema' : 'Registrar operação oficial no sistema'}">
                    <svg class="w-4 h-4 ${isRegistered ? 'text-white' : 'text-slate-900'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    ${isRegistered ? 'Operação Registrada' : 'Registrar Operação'}
                  </button>

                  <!-- 5. Emitir Operação (Cinza) + Chave ON/OFF Edição Gerente -->
                  <div class="flex flex-col gap-1 w-full" id="col-emitir-operacao">
                    <button type="button" id="btn-emitir-pedido" onclick="salesModule.printOrder('pedido')" class="w-full h-12 text-sm font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Emitir Operação em A4">
                      <svg class="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                      Emitir Pedido
                    </button>
                    <!-- Chave ON/OFF Edição Gerente -->
                    <div id="wrapper-chave-edicao-gerente" class="flex items-center justify-between px-3 py-1 bg-amber-100 border border-amber-300 rounded-lg text-xs" style="display: none;">
                      <span class="text-[11px] font-black text-amber-900 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Edição Gerente:
                      </span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="toggle-gerente-edicao" onchange="salesModule.handleGerenteToggle(this.checked)" class="sr-only peer">
                        <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span id="label-gerente-toggle" class="ml-1.5 text-[10px] font-black text-slate-700 uppercase">OFF</span>
                      </label>
                    </div>
                  </div>

                  <!-- 6. Emitir O.S. (Laranja) -->
                  <button type="button" id="btn-emitir-os" onclick="salesModule.printOrder('os')" class="w-full h-12 text-sm font-bold text-orange-950 bg-orange-200 hover:bg-orange-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Emitir Ordem de Serviço Técnica em A4 Paisagem">
                    <svg class="w-4 h-4 text-orange-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    Emitir O.S.
                  </button>

                  <!-- BARRA DE PROGRESSO OPERACIONAL (MARCAÇÃO ROSA IMAGEM 5) -->
                  <div id="inline-action-progress-container" class="hidden col-span-1 sm:col-span-3 mt-2 pt-3 border-t border-slate-200 transition-all duration-300">
                    <div class="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span id="inline-progress-label" class="flex items-center gap-2 text-slate-800">
                        <svg id="inline-progress-spinner" class="w-4 h-4 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg id="inline-progress-check" class="w-4 h-4 text-emerald-600 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span id="inline-progress-title" class="font-bold">Gravando operação no sistema...</span>
                      </span>
                      <span id="inline-progress-percent" class="font-mono text-emerald-700 font-black text-xs">0%</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden shadow-inner">
                      <div id="inline-progress-bar" class="h-full bg-gradient-to-r from-blue-600 via-emerald-500 to-emerald-600 rounded-full transition-all duration-300" style="width: 0%;"></div>
                    </div>
                  </div>

                  <!-- PADRÃO OFICIAL: ÁREA DO LINK DE APROVAÇÃO DO CLIENTE (MARCAÇÃO VERMELHA IMAGEM 5) -->
                  <div id="secao-link-aprovacao-padrao" class="${isRegistered ? '' : 'hidden'} col-span-1 sm:col-span-3 mt-3 pt-3 border-t border-slate-200">
                    <div class="p-3 bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl shadow-xs transition-all">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-200 dark:border-emerald-800">
                        <div class="flex items-center gap-2">
                          <span class="text-lg">📱</span>
                          <div>
                            <h4 class="font-black text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
                              Link de Aprovação Online do Cliente
                            </h4>
                            <p class="text-[11px] text-emerald-700 dark:text-emerald-400">
                              Link gerado para conferência de arte, medidas e aceite digital do cliente sem senha de acesso.
                            </p>
                          </div>
                        </div>
                        <span class="text-[10px] font-mono font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded self-start sm:self-auto">
                          Liberado para Envio
                        </span>
                      </div>
                      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div class="relative flex-1">
                          <input type="text" id="padrao-approval-link-input" value="${approvalLinkValue}" class="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-100 select-all shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-text" onclick="this.select()" onfocus="this.select()">
                        </div>
                        <button type="button" onclick="salesModule.copyStandardApprovalLink()" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                          Copiar Link
                        </button>
                        <button type="button" onclick="salesModule.sendStandardApprovalWhatsApp()" class="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                          Enviar WhatsApp
                        </button>
                        <a href="${approvalLinkValue}" target="_blank" rel="noopener noreferrer" id="padrao-approval-link-open" class="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap">
                          Visualizar ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    `;
    document.getElementById("view-container").innerHTML = formHtml;
    this.recalcTotals();
    this.updateFormState();
    this.updateOsStatusInfo();
    this.toggleDimensionInputs();
  },

  // Helpers de Compressão de Imagens via Canvas (reduz de 2MB para ~40KB - 70KB, protegendo o localStorage de QuotaExceededError)
  compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.72) {
    return new Promise((resolve) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawData = e.target.result;
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth || h > maxHeight) {
            if (w > h) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            } else {
              w = Math.round((w * maxHeight) / h);
              h = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          try {
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } catch (err) {
            resolve(rawData);
          }
        };
        img.onerror = () => resolve(rawData);
        img.src = rawData;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  },

  compressDataUrl(dataUrl, maxWidth = 900, maxHeight = 900, quality = 0.70) {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith('data:image/')) return resolve(dataUrl || '');
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          if (w > h) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          } else {
            w = Math.round((w * maxHeight) / h);
            h = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  },

  async handleOrderArteUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      const dataUrl = await this.compressImage(file, 1000, 1000, 0.72);
      document.getElementById('order-arte-url').value = dataUrl;
      const prevContainer = document.getElementById('order-arte-preview-container');
      const prevImg = document.getElementById('order-arte-preview-img');
      if (prevContainer && prevImg) {
        prevImg.src = dataUrl;
        prevContainer.classList.remove('hidden');
      }
    } catch (err) {
      console.error('[GRAFSIS] Erro ao carregar arte do pedido:', err);
    }
  },

  removeOrderArte() {
    const urlInput = document.getElementById('order-arte-url');
    if (urlInput) urlInput.value = '';
    const fileInput = document.getElementById('order-arte-upload');
    if (fileInput) fileInput.value = '';
    const prevContainer = document.getElementById('order-arte-preview-container');
    if (prevContainer) prevContainer.classList.add('hidden');
  },

  // ==============================================================================
  // REPOSITÓRIO DA OPERAÇÃO / FOTOS DO LOCAL, PRINTS & GOOGLE DRIVE
  // ==============================================================================
  updateRepositoryCountBadge() {
    const badge = document.getElementById('repo-count-badge');
    if (badge) {
      const count = (this.activeRepositoryItems && this.activeRepositoryItems.length) ? this.activeRepositoryItems.length : 0;
      badge.textContent = `${count} arquivo(s)`;
    }
  },

  openRepositoryModal(orderId, displayNumero) {
    const modalId = 'modal-order-repository';
    document.getElementById(modalId)?.remove();

    if (!this.activeRepositoryItems) {
      this.activeRepositoryItems = [];
      if (orderId) {
        const order = window.store.getOrders().find(o => String(o.id) === String(orderId) || String(o.numero) === String(orderId));
        if (order && order.repositorio_arquivos) {
          this.activeRepositoryItems = JSON.parse(JSON.stringify(order.repositorio_arquivos));
        }
      }
    }

    const currentDisplay = displayNumero || (document.getElementById('current-display-id')?.value) || '#NOVO';

    const modalHtml = `
      <div id="${modalId}" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          
          <!-- Cabeçalho do Repositório -->
          <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-600/20">
                📁
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Repositório da Operação</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">#${currentDisplay}</span>
                </div>
                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">Fotos do Local, Rascunhos & Google Drive</h3>
              </div>
            </div>
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Barra de Ações: Upload, Câmera e Google Drive -->
          <div class="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <!-- 1. Upload de Arquivos / Prints (Compactação Automática) -->
              <label class="relative flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-2 border-dashed border-emerald-400 dark:border-emerald-600 rounded-2xl text-xs font-black text-emerald-700 dark:text-emerald-300 cursor-pointer shadow-sm transition">
                <input type="file" multiple accept="image/*,application/pdf" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange="salesModule.handleRepositoryUpload(this, '${orderId}')">
                <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <span>Upload Fotos / Prints</span>
              </label>

              <!-- 2. Câmera Direta do Celular (Fotos no Local da Fachada/Instalação) -->
              <label class="relative flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-2xl text-xs font-black text-blue-700 dark:text-cyan-300 cursor-pointer shadow-sm transition">
                <input type="file" accept="image/*" capture="environment" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onchange="salesModule.handleRepositoryUpload(this, '${orderId}')">
                <svg class="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>Tirar Foto no Local (Câmera)</span>
              </label>

              <!-- 3. Adicionar Link do Google Drive (Para Arquivos Pesados) -->
              <button type="button" onclick="salesModule.promptRepositoryDriveLink('${orderId}')" class="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-2 border-dashed border-amber-400 dark:border-amber-600 rounded-2xl text-xs font-black text-amber-700 dark:text-amber-300 cursor-pointer shadow-sm transition">
                <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                <span>Vincular Pasta Google Drive</span>
              </button>

            </div>

            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              💡 <strong>Dica de Armazenamento:</strong> Fotos capturadas são compactadas preventivamente em resolução ideal para manter a navegação instantânea. Para vídeos ou arquivos pesados de edição (CDR/AI/PSD), utilize o botão do <strong>Google Drive</strong>.
            </p>
          </div>

          <!-- Conteúdo: Grid de Arquivos / Fotos -->
          <div class="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div id="repo-items-container">
              ${this.renderRepositoryGrid(orderId)}
            </div>
          </div>

          <!-- Rodapé do Modal -->
          <div class="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex justify-between items-center">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              Itens disponíveis para Consulta no Comercial e na Produção
            </span>
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm">
              Concluir & Fechar
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  renderRepositoryGrid(orderId) {
    if (!this.activeRepositoryItems || this.activeRepositoryItems.length === 0) {
      return `
        <div class="py-12 text-center text-slate-400 dark:text-slate-500">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
          <p class="font-extrabold text-sm">Nenhum anexo no repositório desta operação.</p>
          <p class="text-xs text-slate-400 mt-1">Utilize os botões acima para subir fotos do local, prints ou link do Google Drive.</p>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        ${this.activeRepositoryItems.map((item, idx) => {
          const isDrive = item.tipo === 'drive';
          const safeNome = window.escapeHtml ? window.escapeHtml(item.nome || 'Arquivo') : (item.nome || 'Arquivo');
          const safeData = window.escapeHtml ? window.escapeHtml(item.data || 'Hoje') : (item.data || 'Hoje');
          const safeTamanho = window.escapeHtml ? window.escapeHtml(item.tamanho || 'Compactada') : (item.tamanho || 'Compactada');
          const safeUrl = window.escapeHtml ? window.escapeHtml(item.url || '') : (item.url || '');
          return `
            <div class="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-2.5 flex flex-col justify-between shadow-sm hover:shadow-md transition group relative overflow-hidden">
              <div class="h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                ${isDrive ? `
                  <div class="flex flex-col items-center justify-center text-amber-600 p-2 text-center">
                    <svg class="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    <span class="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">Google Drive</span>
                  </div>
                ` : `
                  <img src="${safeUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="${safeNome}">
                `}
                
                <!-- Overlay de Ações Rápidas -->
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onclick="salesModule.viewRepositoryItem(${idx})" class="p-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-100 transition shadow cursor-pointer" title="Visualizar ampliado">
                    🔍
                  </button>
                  <button type="button" onclick="salesModule.deleteRepositoryItem(${idx}, '${orderId}')" class="p-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition shadow cursor-pointer" title="Excluir arquivo">
                    🗑️
                  </button>
                </div>
              </div>

              <div class="mt-2 space-y-0.5">
                <span class="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate block" title="${safeNome}">${safeNome}</span>
                <div class="flex items-center justify-between text-[10px] text-slate-400">
                  <span>${safeData}</span>
                  ${isDrive ? `
                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-cyan-400 font-bold hover:underline">Abrir Link &rarr;</a>
                  ` : `
                    <span class="font-mono">${safeTamanho}</span>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  async handleRepositoryUpload(input, orderId) {
    if (!input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    input.value = '';

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'application/pdf'];
    const blockedExtensions = ['exe', 'bat', 'cmd', 'sh', 'vbs', 'js', 'html', 'htm', 'php', 'ps1', 'scr', 'jar', 'msi', 'com'];
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB

    const rejectedFiles = [];

    for (const file of files) {
      const ext = (file.name || '').split('.').pop().toLowerCase();
      if (blockedExtensions.includes(ext) || (!allowedMimes.includes(file.type) && !file.type.startsWith('image/'))) {
        rejectedFiles.push(`"${file.name}" (formato/extensão não permitida para preservação de segurança)`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        rejectedFiles.push(`"${file.name}" (tamanho excede o limite máximo de 15MB)`);
        continue;
      }

      try {
        let finalUrl = '';
        if (file.type.startsWith('image/')) {
          finalUrl = await this.compressImage(file, 1200, 1200, 0.75);
        } else {
          finalUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        }

        if (finalUrl) {
          if (!this.activeRepositoryItems) this.activeRepositoryItems = [];
          const cleanName = (file.name || 'Anexo').replace(/[^\w\s\.-]/gi, '_');
          this.activeRepositoryItems.push({
            id: 'repo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            nome: cleanName,
            tipo: file.type.startsWith('image/') ? 'imagem' : 'documento',
            data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            url: finalUrl,
            tamanho: (file.size ? (file.size / 1024).toFixed(0) + 'KB' : 'OK')
          });
        }
      } catch (err) {
        console.error('[GRAFSIS] Erro ao adicionar anexo ao repositório:', err);
      }
    }

    if (rejectedFiles.length > 0) {
      alert(`⚠️ Upload Inválido / Limite Excedido:\n\nOs seguintes arquivos foram rejeitados:\n• ${rejectedFiles.join('\n• ')}\n\nOs demais anexos válidos foram processados e mantidos íntegros.`);
    }

    const container = document.getElementById('repo-items-container');
    if (container) {
      container.innerHTML = this.renderRepositoryGrid(orderId);
    }
    this.updateRepositoryCountBadge();

    // Se a ordem já existir no store, persiste de imediato
    if (orderId) {
      const orders = window.store.getOrders();
      const order = orders.find(o => String(o.id) === String(orderId) || String(o.numero) === String(orderId));
      if (order) {
        order.repositorio_arquivos = JSON.parse(JSON.stringify(this.activeRepositoryItems));
        await window.store.saveOrder(order);
      }
    }
  },

  async promptRepositoryDriveLink(orderId) {
    const rawUrl = prompt('Cole o link da pasta ou arquivo no Google Drive:');
    if (!rawUrl || !rawUrl.trim()) return;
    const url = rawUrl.trim();

    if (!window.isValidWebUrl(url)) {
      await window.grafsisAlert('Link inválido: O endereço deve ser uma URL web válida iniciando com "https://" ou "http://".', 'GRAFSIS');
      return;
    }

    if (!window.isGoogleDriveUrl(url)) {
      const proceed = await window.grafsisConfirm({
        title: 'GRAFSIS',
        message: `⚠️ Atenção: O link informado não parece pertencer ao Google Drive (drive.google.com).\n\nCertifique-se de que este link possui permissões de acesso compartilhadas.\n\nDeseja vincular este link mesmo assim?`,
        confirmText: 'Vincular Mesmo Assim',
        cancelText: 'Cancelar'
      });
      if (!proceed) return;
    }

    const rawNome = prompt('Identificação do link (ex: Pasta Fotos Fachada / Arquivos CDR):', 'Google Drive - Pasta do Pedido') || 'Google Drive';
    const nome = (rawNome.trim() || 'Google Drive').slice(0, 80);

    if (!this.activeRepositoryItems) this.activeRepositoryItems = [];
    this.activeRepositoryItems.push({
      id: 'repo_drive_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nome,
      tipo: 'drive',
      data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      url: url,
      tamanho: 'Nuvem'
    });

    const container = document.getElementById('repo-items-container');
    if (container) {
      container.innerHTML = this.renderRepositoryGrid(orderId);
    }
    this.updateRepositoryCountBadge();

    if (orderId) {
      const orders = window.store.getOrders();
      const order = orders.find(o => String(o.id) === String(orderId) || String(o.numero) === String(orderId));
      if (order) {
        order.repositorio_arquivos = JSON.parse(JSON.stringify(this.activeRepositoryItems));
        window.store.saveOrder(order);
      }
    }
  },

  async deleteRepositoryItem(idx, orderId) {
    const confirmar = await window.grafsisConfirm({
      title: 'GRAFSIS',
      message: 'Deseja realmente remover este arquivo do repositório?',
      confirmText: 'Remover',
      cancelText: 'Cancelar'
    });
    if (!confirmar) return;
    if (this.activeRepositoryItems && this.activeRepositoryItems[idx]) {
      this.activeRepositoryItems.splice(idx, 1);
      const container = document.getElementById('repo-items-container');
      if (container) {
        container.innerHTML = this.renderRepositoryGrid(orderId);
      }
      this.updateRepositoryCountBadge();

      if (orderId) {
        const orders = window.store.getOrders();
        const order = orders.find(o => String(o.id) === String(orderId) || String(o.numero) === String(orderId));
        if (order) {
          order.repositorio_arquivos = JSON.parse(JSON.stringify(this.activeRepositoryItems));
          await window.store.saveOrder(order);
        }
      }
    }
  },

  viewRepositoryItem(idx) {
    if (!this.activeRepositoryItems || !this.activeRepositoryItems[idx]) return;
    const item = this.activeRepositoryItems[idx];
    if (item.tipo === 'drive' || !item.url.startsWith('data:image/')) {
      window.open(item.url, '_blank');
      return;
    }

    const previewId = 'modal-repo-image-preview';
    document.getElementById(previewId)?.remove();

    const previewHtml = `
      <div id="${previewId}" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onclick="this.remove()">
        <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onclick="event.stopPropagation()">
          <img src="${item.url}" class="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/20">
          <div class="mt-3 flex items-center justify-between w-full px-2 text-white">
            <span class="text-xs font-bold">${item.nome} • ${item.data}</span>
            <div class="flex items-center gap-2">
              <a href="${item.url}" download="${item.nome || 'arquivo'}" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition">⬇ Baixar</a>
              <button type="button" onclick="document.getElementById('${previewId}').remove()" class="px-3 py-1 bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-bold transition">✕ Fechar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', previewHtml);
  },

  handlePriceHover(el, isHover) {
    if (!el) return;
    if (el.dataset.lockedVisible === 'true') return;
    const activeColor = document.documentElement.classList.contains('dark') ? '#38bdf8' : '#1e293b';
    el.style.color = isHover ? activeColor : 'transparent';
  },

  revealPrice4s(el) {
    if (!el) return;
    el.dataset.lockedVisible = 'true';
    const activeColor = document.documentElement.classList.contains('dark') ? '#38bdf8' : '#1e293b';
    el.style.color = activeColor;
    if (el._revealTimer) clearTimeout(el._revealTimer);
    el._revealTimer = setTimeout(() => {
      el.dataset.lockedVisible = 'false';
      el.style.color = 'transparent';
    }, 4000);
  },

  removeItemArte() {
    const itemArteInput = document.getElementById('item-arte-url');
    if (itemArteInput) itemArteInput.value = '';
    const uploadInput = document.getElementById('item-arte-upload');
    if (uploadInput) uploadInput.value = '';
    const btn = document.getElementById('item-arte-btn');
    if (btn) {
      btn.className = 'w-full h-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center justify-center text-blue-600 transition-colors shadow-xs';
      btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>`;
    }
    const prevContainer = document.getElementById('item-arte-preview-container');
    if (prevContainer) prevContainer.classList.add('hidden');
    const prevImg = document.getElementById('item-arte-img');
    if (prevImg) prevImg.src = '';
  },

  async handleItemArteUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const btn = document.getElementById('item-arte-btn');
    if (btn) btn.innerHTML = `<span class="text-[10px] font-bold text-blue-600 animate-pulse">Compactando...</span>`;
    try {
      const dataUrl = await this.compressImage(file, 900, 900, 0.72);
      document.getElementById('item-arte-url').value = dataUrl;
      if (btn) {
        btn.className = 'w-full h-full bg-emerald-100 border border-emerald-400 rounded flex items-center justify-center text-emerald-600';
        btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
      }
      const prevContainer = document.getElementById('item-arte-preview-container');
      const prevImg = document.getElementById('item-arte-img');
      if (prevContainer && prevImg) {
        prevImg.src = dataUrl;
        prevContainer.classList.remove('hidden');
      }
    } catch (err) {
      console.error('[GRAFSIS] Erro ao carregar imagem do item:', err);
      alert('Falha ao processar imagem: ' + err.message);
    }
  },
  calcPiecePrice() {
    const type = document.getElementById('item-type')?.value || 'm2';
    let w = parseFloat(document.getElementById('item-width')?.value); if(isNaN(w)) w = 0;
    let h = parseFloat(document.getElementById('item-height')?.value); if(isNaN(h)) h = 0;
    const price = parseFloat(document.getElementById('item-price')?.value) || 0;
    
    let piecePrice = 0;
    if (type === 'm2') {
      piecePrice = (w * h) * price;
    } else if (type === 'linear') {
      piecePrice = w * price;
    } else {
      // unidade, servico, diaria, hora, L
      piecePrice = price;
    }

    const displayEl = document.getElementById('item-piece-price');
    if (displayEl) displayEl.innerText = `R$ ${piecePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    const subtotalEl = document.getElementById('item-subtotal-price');
    if (subtotalEl) {
      const qty = parseFloat(document.getElementById('item-qty')?.value) || 1;
      subtotalEl.innerText = `R$ ${(piecePrice * qty).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
  },
      numeroPorExtenso(v) {
    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
    const milhares = ["", "mil", "milhões", "bilhões"];
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
    const orderIdStr = document.getElementById('current-display-id')?.value || document.getElementById('display-order-id-label')?.innerText?.replace('#', '') || 'NOVO';
    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientName = clientSelect && clientSelect.selectedIndex > 0 ? clientSelect.options[clientSelect.selectedIndex].text : 'Consumidor Final';
    
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const discount = parseFloat(document.getElementById('order-discount')?.value) || 0;
    const finalTotal = Math.max(0, subtotal - discount);
    this.currentFinanceFinalTotal = finalTotal;

    const rawEntrada = document.getElementById('order-valor-recebido')?.value || document.getElementById('order-valor-entrada')?.value?.replace(/\./g, '')?.replace(',', '.') || '0';
    const recebido = parseFloat(rawEntrada) || 0;
    const restante = Math.max(0, finalTotal - recebido);
    
    const dateStr = new Date().toLocaleString('pt-BR');
    const metodoAtual = document.getElementById('order-metodo-pagto')?.value || 'Dinheiro / Cash';
    let parcelasAtual = parseInt(document.getElementById('order-parcelas')?.value || '1') || 1;
    if (parcelasAtual < 1) parcelasAtual = 1;
    if (parcelasAtual > 6) parcelasAtual = 6;
    const obsAtual = document.getElementById('order-obs-pagto')?.value || '';
    
    // Verde bandeira: Quantidade de parcelas máximo 6x (1x a 6x)
    const parcelasOptions = [1, 2, 3, 4, 5, 6].map(p => `<option value="${p}" ${parcelasAtual === p ? 'selected' : ''}>${p}x parcela${p > 1 ? 's' : ''}</option>`).join('');

    // Verde limão: Data da primeira parcela (+30 dias por padrão)
    const d1 = new Date();
    d1.setDate(d1.getDate() + 30);
    const defaultDataPrimeiraParcela = d1.toISOString().split('T')[0];

    this.installmentsState = {};

    const modalHtml = `
      <div id="finance-modal" class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
          <h3 class="font-black text-xl text-yellow-600 dark:text-yellow-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-center uppercase tracking-wide">Recebimento Financeiro</h3>
          
          <div class="space-y-2 mb-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="flex justify-between"><strong>ID do Pedido:</strong> <span class="font-mono bg-white dark:bg-slate-900 px-2 rounded border border-slate-300 dark:border-slate-700 shadow-sm">${orderIdStr}</span></div>
            <div class="flex justify-between"><strong>Cliente:</strong> <span class="font-bold text-blue-800 dark:text-blue-300">${clientName}</span></div>
            <div class="flex justify-between"><strong>Data:</strong> <span>${dateStr}</span></div>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center font-black text-base sm:text-lg text-slate-800 dark:text-white bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
              <span>Valor do Pedido:</span> <span>R$ ${finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1 text-slate-600 dark:text-slate-300">Meio de Pagto</label>
                <select id="fm-metodo" class="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" onchange="const isParc = this.value.includes('Parcelado'); document.getElementById('fm-parcelas-div').style.display = isParc ? 'block' : 'none'; if(isParc) salesModule.recalcInstallmentsGrid();">
                  <option value="Dinheiro / Cash" ${metodoAtual === 'Dinheiro / Cash' ? 'selected' : ''}>Dinheiro / Cash</option>
                  <option value="Cartão de crédito / A vista" ${metodoAtual === 'Cartão de crédito / A vista' ? 'selected' : ''}>Cartão de crédito / A vista</option>
                  <option value="Cartão de crédito / Parcelado" ${metodoAtual === 'Cartão de crédito / Parcelado' ? 'selected' : ''}>Cartão de crédito / Parcelado</option>
                  <option value="Débito" ${metodoAtual === 'Débito' ? 'selected' : ''}>Débito</option>
                  <option value="Pix" ${metodoAtual === 'Pix' ? 'selected' : ''}>Pix</option>
                  <option value="Permuta" ${metodoAtual === 'Permuta' ? 'selected' : ''}>Permuta</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-1 text-slate-600 dark:text-slate-300">Valor Recebido R$</label>
                <input type="number" id="fm-recebido" step="0.01" class="w-full p-2.5 border-2 border-yellow-400 rounded-xl font-black text-emerald-700 dark:text-emerald-400 text-base sm:text-lg text-center bg-yellow-50/70 dark:bg-yellow-950/20 focus:outline-none focus:ring-4 focus:ring-yellow-200" value="${recebido.toFixed(2)}" oninput="salesModule.updateModalRestante()">
              </div>
            </div>

            <!-- Bloco de Parcelamento com as 4 Cores Solicitadas -->
            <div id="fm-parcelas-div" class="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-700" style="display: ${metodoAtual.includes('Parcelado') ? 'block' : 'none'};">
              <!-- Linha Verde Bandeira, Amarelo e Verde Limão -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <!-- Verde Bandeira: Quantidade de Parcelas (Máximo 6x) -->
                <div>
                  <label class="block text-[11px] font-black mb-1 text-emerald-700 dark:text-emerald-400 uppercase tracking-tight flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                    Parcelas (Máx 6x)
                  </label>
                  <select id="fm-parcelas" class="w-full p-2 border-2 border-emerald-600 rounded-lg text-xs bg-white dark:bg-slate-800 font-black text-emerald-800 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" onchange="salesModule.recalcInstallmentsGrid()">
                    ${parcelasOptions}
                  </select>
                </div>

                <!-- Amarelo: Taxa de Juros Mensal ('0,0%' a 9,9% - padrão '0,0%') -->
                <div>
                  <label class="block text-[11px] font-black mb-1 text-amber-700 dark:text-amber-400 uppercase tracking-tight flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                    Juros (% a.m.)
                  </label>
                  <div class="relative">
                    <input type="number" id="fm-juros" step="0.1" min="0.0" max="9.9" value="0.0" class="w-full p-2 pr-6 border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 dark:text-white rounded-lg font-black text-xs text-center focus:outline-none focus:ring-2 focus:ring-yellow-400" oninput="salesModule.recalcInstallmentsGrid()">
                    <span class="absolute right-2 top-2 text-xs font-bold text-slate-500 pointer-events-none">%</span>
                  </div>
                </div>

                <!-- Verde Limão: Data da Primeira Parcela -->
                <div>
                  <label class="block text-[11px] font-black mb-1 text-lime-700 dark:text-lime-400 uppercase tracking-tight flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-lime-500 inline-block"></span>
                    1ª Parcela
                  </label>
                  <input type="date" id="fm-data-primeira-parcela" value="${defaultDataPrimeiraParcela}" class="w-full p-1.5 border-2 border-lime-500 bg-lime-50/50 dark:bg-lime-950/20 dark:text-white rounded-lg font-bold text-xs focus:outline-none focus:ring-2 focus:ring-lime-400" onchange="salesModule.recalcInstallmentsGrid()">
                </div>
              </div>

              <!-- Azul Royal: A Grid das Parcelas -->
              <div class="border-2 border-blue-600 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-800">
                <div class="bg-blue-600 text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider flex justify-between items-center">
                  <span>Demonstrativo das Parcelas</span>
                  <span id="fm-grid-resumo" class="font-mono text-[11px] font-bold"></span>
                </div>
                <div class="max-h-40 overflow-y-auto">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold border-b border-blue-200 dark:border-blue-800 sticky top-0">
                      <tr>
                        <th class="px-2.5 py-1.5 text-center w-16">Parcela</th>
                        <th class="px-2.5 py-1.5 text-center">Data Vencimento</th>
                        <th class="px-2.5 py-1.5 text-right">Valor Parcela</th>
                        <th class="px-2.5 py-1.5 text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody id="fm-parcelas-tbody" class="divide-y divide-slate-100 dark:divide-slate-700">
                      <!-- Gerado dinamicamente -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 text-slate-600 dark:text-slate-300">Observação</label>
              <input type="text" id="fm-obs" class="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="Detalhes do pagamento..." value="${obsAtual}">
            </div>
            
            <div class="flex justify-between items-center font-bold text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-800">
              <span>Valor a Receber (Restante):</span>
              <span id="fm-restante" class="font-mono font-black">R$ ${restante.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
          
          <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button type="button" onclick="salesModule.confirmFinance()" class="w-full py-3 text-sm bg-emerald-600 text-white font-black rounded-xl shadow-md hover:bg-emerald-700 uppercase transition-colors cursor-pointer flex items-center justify-center gap-2">
              <span>CONFIRMAR RECEBIMENTO</span>
            </button>
            <div class="grid grid-cols-2 gap-2 mt-1">
              <button type="button" onclick="salesModule.printReceipt()" class="py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Gerar Recibo
              </button>
              <button type="button" onclick="document.getElementById('finance-modal')?.remove()" class="py-2 text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">Voltar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('finance-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.recalcInstallmentsGrid();
  },

  recalcInstallmentsGrid() {
    const finalTotal = this.currentFinanceFinalTotal != null ? this.currentFinanceFinalTotal : (this.recalcTotals().finalTotal || 0);
    const recInput = document.getElementById('fm-recebido');
    const valorRecebido = parseFloat(recInput ? recInput.value : 0) || 0;
    
    // O saldo da dívida é: valor do pedido - valor recebido
    const saldoDivida = Math.max(0, finalTotal - valorRecebido);
    
    // Atualiza saldo restante na tela
    const restEl = document.getElementById('fm-restante');
    if (restEl) {
      restEl.innerText = `R$ ${saldoDivida.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    const fmParcelas = document.getElementById('fm-parcelas');
    let qtde = parseInt(fmParcelas ? fmParcelas.value : 1) || 1;
    if (qtde < 1) qtde = 1;
    if (qtde > 6) qtde = 6;

    const jurosInput = document.getElementById('fm-juros');
    let jurosMensal = parseFloat(jurosInput ? jurosInput.value : 0) || 0;
    if (jurosMensal < 0) jurosMensal = 0;
    if (jurosMensal > 9.9) {
      jurosMensal = 9.9;
      if (jurosInput) jurosInput.value = '9.9';
    }

    const data1Input = document.getElementById('fm-data-primeira-parcela');
    let data1Str = data1Input ? data1Input.value : '';
    if (!data1Str) {
      const dInit = new Date();
      dInit.setDate(dInit.getDate() + 30);
      data1Str = dInit.toISOString().split('T')[0];
      if (data1Input) data1Input.value = data1Str;
    }

    // Cálculo das parcelas com juros compostos mês a mês e parcelas iguais (Tabela Price)
    // saldo da dívida = valor do pedido - valor recebido
    // valor de cada parcela = saldo da dívida / qtde de parcelas (se juros 0)
    // valor de cada parcela no grid = juro composto mês a mês (amarelo) com parcelas iguais
    let valorParcela = 0;
    if (saldoDivida > 0 && qtde > 0) {
      if (jurosMensal <= 0) {
        valorParcela = saldoDivida / qtde;
      } else {
        const i = jurosMensal / 100;
        valorParcela = saldoDivida * (i * Math.pow(1 + i, qtde)) / (Math.pow(1 + i, qtde) - 1);
      }
    }

    const tbody = document.getElementById('fm-parcelas-tbody');
    const resumoEl = document.getElementById('fm-grid-resumo');
    if (!tbody) return;

    tbody.innerHTML = '';
    this.installmentsState = this.installmentsState || {};
    this.currentGeneratedInstallments = [];

    const [y1, m1, d1] = data1Str.split('-').map(Number);
    const totalFinanciado = valorParcela * qtde;

    if (resumoEl) {
      resumoEl.innerText = jurosMensal > 0 
        ? `${qtde}x de R$ ${valorParcela.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (Total: R$ ${totalFinanciado.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})})`
        : `${qtde}x de R$ ${valorParcela.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    for (let k = 1; k <= qtde; k++) {
      // Vencimento da parcela k
      const dVenc = new Date(y1, m1 - 1 + (k - 1), d1);
      if (dVenc.getDate() !== d1) {
        dVenc.setDate(0);
      }
      const vencStr = dVenc.toLocaleDateString('pt-BR');

      // Status: pago (verde) ou pendente (vermelho)
      const parcelaKey = `p_${k}`;
      let isPago = this.installmentsState[parcelaKey] === 'pago';
      if (saldoDivida <= 0.001) isPago = true;

      this.currentGeneratedInstallments.push({
        numero: k,
        vencimento: vencStr,
        valor: valorParcela,
        status: isPago ? 'pago' : 'pendente'
      });

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors';
      tr.innerHTML = `
        <td class="px-2.5 py-1.5 text-center font-bold text-slate-700 dark:text-slate-300">${k}ª</td>
        <td class="px-2.5 py-1.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">${vencStr}</td>
        <td class="px-2.5 py-1.5 text-right font-mono font-black text-slate-900 dark:text-white">R$ ${valorParcela.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td class="px-2.5 py-1.5 text-center">
          <button type="button" onclick="salesModule.toggleInstallmentStatus(${k})" class="cursor-pointer px-2.5 py-0.5 rounded-full text-[10px] font-black border transition ${
            isPago 
              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700' 
              : 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700'
          }" title="Clique para alternar o status da parcela">
            ${isPago ? '● Pago' : '● Pendente'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  },

  toggleInstallmentStatus(k) {
    this.installmentsState = this.installmentsState || {};
    const parcelaKey = `p_${k}`;
    this.installmentsState[parcelaKey] = this.installmentsState[parcelaKey] === 'pago' ? 'pendente' : 'pago';
    this.recalcInstallmentsGrid();
  },

  updateModalRestante(total) {
    this.recalcInstallmentsGrid();
  },

  confirmFinance() {
    const recebido = parseFloat(document.getElementById('fm-recebido')?.value) || 0;
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const discount = parseFloat(document.getElementById('order-discount')?.value) || 0;
    const finalTotal = Math.max(0, subtotal - discount);

    const metodo = document.getElementById('fm-metodo')?.value || 'Dinheiro / Cash';
    const obs = document.getElementById('fm-obs')?.value || '';
    
    let parcelas = '1';
    const fmParcelas = document.getElementById('fm-parcelas');
    if (fmParcelas) parcelas = String(fmParcelas.value || '1');
    
    const inputRec = document.getElementById('order-valor-recebido');
    if (inputRec) inputRec.value = recebido;

    const inputEntrada = document.getElementById('order-valor-entrada');
    if (inputEntrada) {
      inputEntrada.value = recebido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
    
    let inputMetodo = document.getElementById('order-metodo-pagto');
    if (inputMetodo) inputMetodo.value = metodo;

    let inputParcelas = document.getElementById('order-parcelas');
    if (!inputParcelas && document.getElementById('order-form')) {
      inputParcelas = document.createElement('input');
      inputParcelas.type = 'hidden';
      inputParcelas.id = 'order-parcelas';
      inputParcelas.name = 'parcelas';
      document.getElementById('order-form').appendChild(inputParcelas);
    }
    if (inputParcelas) inputParcelas.value = metodo.includes('Parcelado') ? parcelas : '1';

    let inputObs = document.getElementById('order-obs-pagto');
    if (inputObs) inputObs.value = obs;
    
    if (this.currentGeneratedInstallments && this.currentGeneratedInstallments.length > 0) {
      this.lastConfirmedInstallments = JSON.parse(JSON.stringify(this.currentGeneratedInstallments));
    }

    this.recalcTotals('entrada');
    if (this.updateFinanceSummary) this.updateFinanceSummary(recebido, finalTotal);
    document.getElementById('finance-modal')?.remove();
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

  openPrintDocument(htmlContent, docTitle = '') {
    if (!htmlContent) return;
    try {
      const printWin = window.open('', '_blank');
      if (printWin && !printWin.closed && typeof printWin.document !== 'undefined') {
        printWin.document.open();
        printWin.document.write(htmlContent);
        if (docTitle) {
          printWin.document.title = docTitle;
        }
        printWin.document.close();
        return;
      }
    } catch (e) {
      console.warn('[GRAFSIS Print] Pop-up bloqueado, utilizando fallback de iframe:', e);
    }

    // Fallback à prova de bloqueador de pop-ups: usa iframe oculto na mesma página
    try {
      let printFrame = document.getElementById('grafsis-print-frame');
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'grafsis-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        printFrame.style.visibility = 'hidden';
        document.body.appendChild(printFrame);
      }
      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        if (docTitle) {
          try { frameDoc.title = docTitle; } catch (e) {}
        }
        frameDoc.close();
        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch (err) {
            console.warn('[GRAFSIS Print] Erro no print via iframe:', err);
          }
        }, 350);
      }
    } catch (err) {
      console.error('[GRAFSIS Print] Erro crítico ao imprimir documento:', err);
      alert('Aviso: O navegador bloqueou a abertura da impressão. Por favor, permita pop-ups para este site.');
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
          <div class="title">Relatório de Item #${it.item_id || '----'}</div>
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
            <div class="row"><span class="label">Cálculo:</span><span class="val uppercase">${it.tipo_calculo}</span></div>
            <div class="row"><span class="label">Dimensões:</span><span class="val">${it.largura_x}m x ${it.comprimento_y}m</span></div>
            <div class="row"><span class="label">Quantidade:</span><span class="val">${it.quantidade}</span></div>
            <div class="row"><span class="label">Área Total:</span><span class="val">${it.tipo_calculo !== 'unidade' ? (it.area_m2 * it.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + (it.tipo_calculo === 'm2' ? ' m²' : ' m') : '-'}</span></div>
            <div class="row"><span class="label">Valor Unitário:</span><span class="val">R$ ${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
            <div class="total">Subtotal do Item: R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
        </div>
        <script>window.print();</script>
      </body></html>
    `;
    this.openPrintDocument(pdfHtml);
  },
  async printReceipt() {
    const orderIdStr = document.getElementById('current-display-id')?.value;
    const orders = window.store?.getOrders ? window.store.getOrders() : [];
    const savedOrder = (this.currentEditingOrderId && orders.find(o => o.id === this.currentEditingOrderId)) || (orderIdStr && orders.find(o => String(o.numero) === String(orderIdStr)));
    
    // BLOQUEIO DE IMPRESSÃO SEM ID VÁLIDO REGISTRADO (Imagem 3 & 5)
    if (!savedOrder) {
      const confirmar = await window.grafsisConfirm({
        title: 'GRAFSIS',
        message: `O Pedido #${orderIdStr || ''} ainda não foi registrado no sistema.\n\nDeseja salvar e registrar a operação agora para emitir o recibo imediatamente?`,
        confirmText: 'Registrar Agora',
        cancelText: 'Cancelar'
      });
      if (confirmar) {
        const formEl = document.getElementById('order-form');
        if (formEl) {
          this.saveOrder(null, this.currentEditingOrderId, orderIdStr, { autoPrintAfter: 'recibo' });
          return;
        }
      }
      await window.grafsisAlert(`Operação negada: O Pedido #${orderIdStr || ''} ainda não foi registrado no sistema. É necessário salvar e registrar antes de emitir recibos.`, 'GRAFSIS');
      return;
    }

    const tenant = (window.store && window.store.getActiveTenant ? window.store.getActiveTenant() : null) || {};
    const conf = (window.store?.getSettings ? window.store.getSettings() : {}) || {};
    const companyName = tenant.razao_social || tenant.nome_fantasia || conf.empresa_nome || 'GRAFSIS';
    const companyCNPJ = tenant.cnpj || conf.empresa_cnpj || '00.000.000/0001-00';
    const companyAddress = window.formatCleanAddress ? window.formatCleanAddress(tenant) : ([tenant.endereco || tenant.logradouro, tenant.numero, tenant.bairro].filter(Boolean).join(', ') || conf.empresa_endereco || 'Endereço não informado');
    const companyCityUf = [tenant.cidade || conf.empresa_cidade || 'Ji-Paraná', tenant.uf || 'RO'].filter(Boolean).join(' - ');
    const companyPhone = window.formatCanonicalPhone ? window.formatCanonicalPhone(tenant.celular_whatsapp || tenant.telefone_fixo || conf.empresa_telefone || '(69) 99922-1336') : (tenant.celular_whatsapp || tenant.telefone_fixo || '(69) 99922-1336');
    const companyLogo = tenant.logo_url || conf.empresa_logo || '';
    const logoHtml = companyLogo ? `<img src="${companyLogo}" style="max-width: 140px; max-height: 70px; margin: 0 auto 8px auto; display: block; object-fit: contain;" alt="Logo">` : '';

    const clientId = savedOrder.cliente_id || document.querySelector('select[name="cliente_id"]')?.value;
    const client = (window.store && window.store.getClients().find(c => c.id === clientId)) || null;
    const hasValidClient = !!(client && client.id);
    const clientName = client ? client.nome : (savedOrder.cliente_nome || 'Consumidor Final');
    const clientDoc = client ? (client.cpf_cnpj || '') : '';
    const clientPhone = client ? (client.telefone_whatsapp || client.telefone || '') : '';
    const safeClientName = window.escapeHtml ? window.escapeHtml(clientName) : clientName;
    const formattedClientDoc = clientDoc ? (window.formatCpfCnpj ? window.formatCpfCnpj(clientDoc) : clientDoc) : '';
    const formattedClientPhone = clientPhone ? (window.formatCanonicalPhone ? window.formatCanonicalPhone(clientPhone) : clientPhone) : '';

    const total = parseFloat(savedOrder.valor_final || savedOrder.valor_total || 0);
    const subtotal = parseFloat(savedOrder.valor_total || total);
    const discount = parseFloat(savedOrder.desconto || 0);
    const recebido = parseFloat(document.getElementById('fm-recebido')?.value || savedOrder.valor_entrada || savedOrder.valor_recebido || 0);
    const restante = Math.max(0, total - recebido);
    const method = document.getElementById('fm-metodo')?.value || savedOrder.forma_pagamento || 'Dinheiro / Cash';
    const obs = document.getElementById('fm-obs')?.value || savedOrder.obs_pagto || '';
    const dateStr = new Date(savedOrder.created_at || Date.now()).toLocaleString('pt-BR');
    const valExtenso = this.numeroPorExtenso(recebido);
    const codValidacao = btoa((savedOrder.numero || orderIdStr) + '-' + Date.now()).substring(0, 12).toUpperCase();

    let tipoPagtoTexto = 'pagamento parcial / sinal';
    if (restante <= 0.01 && total > 0) {
      tipoPagtoTexto = 'pagamento total / quitação';
    } else if (recebido > 0 && restante > 0) {
      tipoPagtoTexto = 'pagamento parcial / acerto';
    }

    const items = (savedOrder.itens && savedOrder.itens.length) ? savedOrder.itens : this.activeItems;
    const itemsListHtml = items.map((it, idx) => {
      const qtd = it.quantidade || 1;
      const desc = it.descricao || it.produto_nome || 'Produto/Serviço';
      const safeDesc = window.escapeHtml ? window.escapeHtml(desc) : desc;
      const tam = it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` : (it.tipo_calculo === 'linear' ? `${it.comprimento_y}m linear` : 'Unidade');
      const vUnit = Number(it.preco_unitario || it.preco_base || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      const subTot = Number(it.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      return `<div style="margin-bottom: 4px; padding-bottom: 3px; border-bottom: 1px dotted #ccc; text-align: left; font-size: 11px;">
        <strong>${idx + 1} - </strong>Qtde: ${qtd}, ${safeDesc}, Tam: ${tam}, V. Unit: R$ ${vUnit}, Subtotal: R$ ${subTot}
      </div>`;
    }).join('');

    const currentUser = (window.authModule && window.authModule.getCurrentUser ? window.authModule.getCurrentUser() : null) || { nome: 'Operador', role: 'Vendas' };
    const colaboradorStr = `${currentUser.nome || currentUser.login || 'Colaborador'} (${currentUser.role || currentUser.cargo || 'Atendimento'})`;

    const receiptHtml = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Recibo - #${savedOrder.numero || orderIdStr}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; padding: 15px; text-align: center; color: #111; background: #fff; }
        .receipt { max-width: 380px; margin: 0 auto; border: 1px dashed #999; padding: 16px; border-radius: 8px; box-sizing: border-box; }
        .line { border-bottom: 1px dashed #777; margin: 10px 0; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .flex { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px; }
        .bold { font-weight: bold; }
        h2 { margin: 4px 0 8px 0; font-size: 18px; letter-spacing: 1px; }
        p { margin: 3px 0; font-size: 12px; }
        .pending-client-badge { display: inline-block; font-size: 10px; font-weight: bold; color: #b45309; background: #fef3c7; border: 1px solid #f59e0b; padding: 1px 6px; border-radius: 4px; margin-top: 2px; }
        @media print {
            body { padding: 0; }
            .receipt { border: none; padding: 0; max-width: 100%; width: 320px; }
        }
      </style>
      </head><body>
      <div class="receipt">
        ${logoHtml}
        <h2>RECIBO</h2>
        <div class="bold" style="font-size:14px; text-transform: uppercase;">${window.escapeHtml ? window.escapeHtml(companyName) : companyName}</div>
        <div style="font-size: 11px;">CNPJ: ${companyCNPJ}</div>
        <div style="font-size: 11px;">${companyAddress}</div>
        <div style="font-size: 11px;">${companyCityUf}</div>
        <div style="font-size: 11px;">Tel: ${companyPhone}</div>
        <div class="line"></div>
        <div class="text-left">
          <p><strong>Pedido ID:</strong> <span class="bold" style="font-size:13px; font-family: monospace;">#${savedOrder.numero || orderIdStr}</span></p>
          <p><strong>Cliente:</strong> ${safeClientName}${formattedClientDoc ? ' (' + formattedClientDoc + ')' : ''}</p>
          ${!hasValidClient ? `<div class="pending-client-badge">⚠️ Cadastro Pendente (Consumidor Final)</div>` : ''}
          ${formattedClientPhone ? `<p><strong>Telefone:</strong> ${formattedClientPhone}</p>` : ''}
          <p><strong>Data:</strong> ${dateStr}</p>
        </div>
        <div class="line"></div>
        <div class="text-left">
          <div class="bold" style="font-size: 11px; margin-bottom: 5px; text-transform: uppercase;">Itens do Pedido:</div>
          ${itemsListHtml}
        </div>
        <div class="line"></div>
        <div class="text-left">
          <p style="line-height: 1.4;">Recebemos de <strong>${safeClientName}</strong>${formattedClientDoc ? ' (' + formattedClientDoc + ')' : ''}, a importância de:</p>
          <h2 style="text-align:center; margin: 10px 0; color: #1e3a8a;">R$ ${recebido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
          <p style="text-align:center; font-style: italic; font-size: 11px; margin-bottom: 8px;">(${valExtenso})</p>
          <p><strong>Referente:</strong> ${tipoPagtoTexto} do pedido ID <strong>#${savedOrder.numero || orderIdStr}</strong>.</p>
          <p><strong>Forma Pagto:</strong> ${window.escapeHtml ? window.escapeHtml(method) : method}</p>
          ${obs ? `<p><strong>Obs:</strong> ${window.escapeHtml ? window.escapeHtml(obs) : obs}</p>` : ''}
        </div>
        <div class="line"></div>
        <div class="flex"><span class="bold">Subtotal:</span> <span>R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        ${discount > 0 ? `<div class="flex"><span class="bold">Desconto:</span> <span>R$ ${discount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>` : ''}
        <div class="flex"><span class="bold">Valor Total:</span> <span class="bold">R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        <div class="flex"><span class="bold">Valor Recebido:</span> <span class="bold" style="color: #047857;">R$ ${recebido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        <div class="flex"><span class="bold">Saldo Restante:</span> <span class="bold" style="color: ${restante > 0 ? '#b91c1c' : '#047857'};">R$ ${restante.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        <div class="line"></div>
        <p style="font-size: 10px; margin-top: 8px; color: #555;">Cód. de Validação: ${codValidacao}</p>
        <div style="margin-top: 25px;">
          <p style="font-size: 11px; margin: 0;">_________________________________________</p>
          <p style="font-size: 12px; font-weight: bold; margin: 3px 0;">${window.escapeHtml ? window.escapeHtml(companyName) : companyName}</p>
          <p style="font-size: 11px; color: #444; margin: 2px 0;">Colaborador: ${window.escapeHtml ? window.escapeHtml(colaboradorStr) : colaboradorStr}</p>
        </div>
      </div>
      <script>window.print();</script>
      </body></html>
    `;
    this.openPrintDocument(receiptHtml);
  },

  // MOTOR DE CABEÇALHO PADRONIZADO (MANUAL MESTRE GRAFSIS - SEÇÃO 04)
  buildReportHeaderHtml(config = {}) {
    const tenant = (window.store && window.store.getActiveTenant ? window.store.getActiveTenant() : null) || {};
    const conf = (window.store?.getSettings ? window.store.getSettings() : {}) || {};
    const companyName = config.companyName || tenant.nome_fantasia || tenant.razao_social || conf.empresa_nome || 'GRAFSIS COMUNICAÇÃO VISUAL';
    const companyDoc = config.companyCnpj || tenant.cnpj || conf.empresa_cnpj || '';
    const companyPhone = config.companyPhone || tenant.celular_whatsapp || tenant.telefone_fixo || conf.empresa_telefone || '';
    const companyAddress = config.companyAddress || (window.formatCleanAddress ? window.formatCleanAddress(tenant) : ([tenant.endereco, tenant.numero, tenant.bairro, tenant.cidade, tenant.uf].filter(Boolean).join(', ')));
    const companyLogo = config.companyLogo || tenant.logo_url || conf.empresa_logo || '';

    const title = config.title || 'DOCUMENTO COMERCIAL';
    const subtitle = config.subtitle || '';
    const docNumber = config.docNumber ? `#${config.docNumber}` : '';
    const statusBadge = config.statusBadge || '';
    const emissionDate = config.emissionDate || new Date().toLocaleString('pt-BR');

    const safeCompanyName = window.escapeHtml ? window.escapeHtml(companyName) : companyName;
    const safeDoc = companyDoc ? (window.formatCpfCnpj ? window.formatCpfCnpj(companyDoc) : companyDoc) : '';
    const safePhone = companyPhone ? (window.formatCanonicalPhone ? window.formatCanonicalPhone(companyPhone) : companyPhone) : '';
    const safeAddr = window.escapeHtml ? window.escapeHtml(companyAddress) : companyAddress;
    const safeTitle = window.escapeHtml ? window.escapeHtml(title) : title;
    const safeSubtitle = window.escapeHtml ? window.escapeHtml(subtitle) : subtitle;
    const safeDocNum = window.escapeHtml ? window.escapeHtml(docNumber) : docNumber;

    return `
      <div class="report-header-standard" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2.5px solid #0284c7; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; max-width: 58%;">
          ${companyLogo 
            ? `<img src="${companyLogo}" style="max-height: 55px; max-width: 120px; object-fit: contain; border-radius: 6px; padding: 2px; border: 1px solid #cbd5e1;" alt="Logo Emissor">` 
            : `<div style="width: 48px; height: 48px; border-radius: 8px; background: #0284c7; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 17px; flex-shrink: 0;">${(safeCompanyName || 'GS').slice(0,2).toUpperCase()}</div>`
          }
          <div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: -0.3px;">${safeCompanyName}</div>
            ${safeDoc ? `<div style="font-size: 10px; color: #475569; font-weight: 600;">CNPJ: ${safeDoc}</div>` : ''}
            ${safeAddr ? `<div style="font-size: 9.5px; color: #64748b;">${safeAddr}</div>` : ''}
            ${safePhone ? `<div style="font-size: 9.5px; color: #0284c7; font-weight: 600;">Suporte / Comercial: ${safePhone}</div>` : ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 17px; font-weight: 900; color: #0284c7; text-transform: uppercase; letter-spacing: -0.5px;">${safeTitle}</div>
          ${safeSubtitle ? `<div style="font-size: 10px; color: #64748b; font-weight: bold;">${safeSubtitle}</div>` : ''}
          ${safeDocNum ? `<div style="font-size: 18px; font-weight: 900; color: #0f172a; font-family: monospace; margin-top: 2px;">${safeDocNum}</div>` : ''}
          ${statusBadge ? `<div style="margin-top: 3px;">${statusBadge}</div>` : ''}
          <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;"><strong>Emissão:</strong> ${emissionDate}</div>
        </div>
      </div>
    `;
  },

  // MOTOR DE RODAPÉ PADRONIZADO (MANUAL MESTRE GRAFSIS - SEÇÃO 04)
  buildReportFooterHtml(config = {}) {
    const emissionTimestamp = config.timestamp || new Date().toLocaleString('pt-BR');
    const tenant = (window.store && window.store.getActiveTenant ? window.store.getActiveTenant() : null) || {};
    const companyName = tenant.nome_fantasia || tenant.razao_social || 'GRAFSIS';
    const customNotes = config.notes || '';
    
    return `
      <div class="report-footer-standard" style="margin-top: 16px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 9.5px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${window.escapeHtml ? window.escapeHtml(companyName) : companyName}</strong> &bull; Sistema Grafsis &bull; Fuso: Horário de Brasília (BRT)
          ${customNotes ? `<div style="margin-top: 2px; font-style: italic;">${window.escapeHtml ? window.escapeHtml(customNotes) : customNotes}</div>` : ''}
        </div>
        <div style="text-align: right; font-family: monospace;">
          <span>Emitido em: ${emissionTimestamp}</span> &bull; <span>Via Oficial</span>
        </div>
      </div>
    `;
  },

  async printOrder(type) {
    const orderIdStr = document.getElementById('current-display-id')?.value;
    const orders = window.store?.getOrders ? window.store.getOrders() : [];
    const savedOrder = (this.currentEditingOrderId && orders.find(o => o.id === this.currentEditingOrderId)) || (orderIdStr && orders.find(o => String(o.numero) === String(orderIdStr)));
    
    // BLOQUEIO DE IMPRESSÃO SEM ID VÁLIDO REGISTRADO
    if (!savedOrder) {
      const querSalvar = await window.grafsisConfirm({
        title: 'GRAFSIS',
        message: `A Operação #${orderIdStr || ''} ainda não foi registrada no sistema.\n\nDeseja registrar a operação agora para emitir a ${type === 'os' ? 'O.S. Técnica' : 'impressão'} imediatamente?`,
        confirmText: 'Registrar Agora',
        cancelText: 'Cancelar'
      });
      if (querSalvar) {
        const formEl = document.getElementById('order-form');
        if (formEl) {
          this.saveOrder(null, this.currentEditingOrderId, orderIdStr, { autoPrintAfter: type });
          return;
        }
      }
      await window.grafsisAlert(`Operação negada: A Operação #${orderIdStr || ''} ainda não foi registrada no sistema. É necessário clicar em "Registrar Operação" para salvar antes de emitir impressões ou O.S.`, 'GRAFSIS');
      return;
    }

    // Se for Ordem de Serviço, emite no formato A4 Paisagem Técnico sem valores financeiros
    // REGRA CLARA: Orçamento e Pré-Venda NÃO emitem O.S. Liberada exclusivamente para Venda, Patrocínio ou Permuta.
    if (type === 'os') {
      const opLower = (savedOrder.tipo_operacao || savedOrder.tipo || '').toLowerCase();
      const isLiberadaOS = (opLower === 'venda' || opLower === 'patrocinio' || opLower === 'permuta');
      if (!isLiberadaOS) {
        await window.grafsisAlert(
          `A Ordem de Serviço (O.S.) não pode ser emitida para Orçamento ou Pré-Venda (somente gravação).\n\nA emissão de O.S. só fica liberada se a operação for: Venda, Patrocínio ou Permuta.`,
          'GRAFSIS'
        );
        return;
      }
      this.printTechnicalWorkOrder(savedOrder.id, { includeImages: true });
      return;
    }

    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientId = savedOrder.cliente_id || (clientSelect ? clientSelect.value : null);
    const client = (window.store && window.store.getClients().find(c => c.id === clientId)) || null;
    const hasValidClient = !!(client && client.id);
    const clientName = client ? client.nome : (savedOrder.cliente_nome || 'Consumidor Final');
    const clientDoc = client ? (client.cpf_cnpj || '') : '';
    const clientPhone = client ? (client.telefone_whatsapp || client.telefone || '') : '';
    const clientEmail = client ? (client.email || '') : '';
    const clientAddress = client ? (window.formatCleanAddress ? window.formatCleanAddress(client) : [client.endereco, client.numero, client.bairro, client.cidade, client.uf].filter(Boolean).join(', ')) : '';

    const dateStr = new Date(savedOrder.created_at || Date.now()).toLocaleString('pt-BR');
    const previsaoInput = document.getElementById('previsao_entrega')?.value || savedOrder.previsao_entrega || '';
    const previsaoFormatada = previsaoInput ? new Date(previsaoInput + 'T12:00:00').toLocaleDateString('pt-BR') : 'A Combinar';
    const dataAceiteInput = document.getElementById('order-data-aceite')?.value || savedOrder.data_aceite || '';
    const dataAceiteFormatada = dataAceiteInput ? new Date(dataAceiteInput + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    const autorizoProd = document.getElementById('order-autorizo-producao')?.value || savedOrder.autorizo_producao || '';
    const confArte = document.getElementById('order-conferencia-arte')?.value || savedOrder.conferencia_arte || '';

    const items = (savedOrder.itens && savedOrder.itens.length) ? savedOrder.itens : this.activeItems;
    const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const discount = parseFloat(savedOrder.desconto || document.getElementById('order-discount')?.value || 0);
    const finalTotal = Math.max(0, subtotal - discount);
    const entrada = parseFloat(savedOrder.valor_entrada || savedOrder.valor_recebido || 0);
    const restante = Math.max(0, finalTotal - entrada);
    const metodoPagto = savedOrder.forma_pagamento || document.getElementById('order-metodo-pagto')?.value || 'A Combinar';

    const opVal = (savedOrder.tipo_operacao || savedOrder.tipo || 'venda').toLowerCase();
    let title = 'Pedido de Venda';
    if (opVal === 'orcamento') title = 'Orçamento Comercial';
    else if (opVal === 'prevenda' || opVal === 'pre-venda') title = 'Proposta de Pré-Venda';
    else if (opVal === 'permuta') title = 'Pedido de Venda (Permuta)';
    else if (opVal === 'patrocinio') title = 'Pedido de Venda (Patrocínio)';

    const diasValidade = document.getElementById('dias-validade')?.value || '10';
    const dataValidadeInput = document.getElementById('data-validade')?.value || '';
    const validadeFormatada = dataValidadeInput ? new Date(dataValidadeInput + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    const percentualOp = document.getElementById('operacao-percentual')?.value || '100';

    const itemsHtml = items.map((it, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 9px 8px; vertical-align: top;">${idx+1}</td>
        <td style="padding: 9px 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${it.arte_url ? `<img src="${it.arte_url}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; flex-shrink: 0;" alt="Arte">` : ''}
            <div>
              <div style="font-weight: bold; color: #0f172a; font-size: 13px;">${window.escapeHtml ? window.escapeHtml(it.produto_nome || 'Produto') : (it.produto_nome || 'Produto')}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${window.escapeHtml ? window.escapeHtml(it.descricao || '') : (it.descricao || '')}</div>
            </div>
          </div>
        </td>
        <td style="padding: 9px 8px; vertical-align: top; font-family: monospace; font-size: 12px;">${it.largura_x || 0}m x ${it.comprimento_y || 0}m</td>
        <td style="padding: 9px 8px; text-align: center; vertical-align: top; font-weight: bold;">${it.quantidade || 1}</td>
        <td style="padding: 9px 8px; text-align: right; vertical-align: top; font-family: monospace;">R$ ${Number(it.preco_unitario || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="padding: 9px 8px; text-align: right; vertical-align: top; font-weight: bold; font-family: monospace; color: #0f172a;">R$ ${Number(it.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      </tr>
    `).join('');

    const phaseTag = `<span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${savedOrder.status_fase || 'Registrado'}</span>`;

    const reportHeaderHtml = this.buildReportHeaderHtml({
      title,
      docNumber: savedOrder.numero || orderIdStr,
      statusBadge: phaseTag,
      emissionDate: dateStr
    });

    const reportFooterHtml = this.buildReportFooterHtml({
      timestamp: dateStr,
      notes: (opVal === 'orcamento' || opVal === 'prevenda' || opVal === 'pre-venda') ? 'Proposta comercial sujeita a confirmação de disponibilidade de estoque e insumos.' : 'Documento gerado e validado operacionalmente no sistema Grafsis.'
    });

    const formattedClientDoc = clientDoc ? (window.formatCpfCnpj ? window.formatCpfCnpj(clientDoc) : clientDoc) : '';
    const formattedClientPhone = clientPhone ? (window.formatCanonicalPhone ? window.formatCanonicalPhone(clientPhone) : clientPhone) : '';

    const pdfHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>OP-${savedOrder.numero || orderIdStr}</title>
        <style>
          @page { size: A4; margin: 12mm 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 10px; font-size: 12px; }
          
          /* Bloco Padronizado do Destinatário (Cliente) */
          .client-box-standard { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; }
          .client-header-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center; }
          .client-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 8px; font-size: 11px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
          th { background: #f1f5f9; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          
          .totals-bar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
          .totals-table { width: 290px; font-size: 12px; }
          .totals-table tr td { padding: 4px 6px; }
          .totals-table tr.final-row td { font-size: 16px; font-weight: 900; color: #15803d; border-top: 2px solid #15803d; padding-top: 6px; }

          /* Bloco Inferior: Informações do Pedido e Vistos de Produção / Aceite */
          .validation-section { border-top: 2px dashed #cbd5e1; padding-top: 14px; margin-top: 14px; }
          .order-info-strip { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11px; }
          
          .approval-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .approval-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background: #fff; min-height: 100px; display: flex; flex-direction: column; justify-content: space-between; }
          .approval-title { font-weight: bold; font-size: 11px; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; }
          .sig-line { border-top: 1px solid #94a3b8; margin-top: 25px; padding-top: 4px; text-align: center; font-size: 10px; color: #64748b; font-weight: 600; }

          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <!-- CABEÇALHO PADRONIZADO (EMISSOR À ESQUERDA, TÍTULO E NÚMERO À DIREITA) -->
        ${reportHeaderHtml}

        <!-- BLOCO PADRONIZADO DO DESTINATÁRIO (CLIENTE) -->
        <div class="client-box-standard">
          <div class="client-header-title">
            <span>DADOS DO DESTINATÁRIO / CLIENTE</span>
            ${!hasValidClient ? `<span style="color: #b45309; background: #fef3c7; border: 1px solid #f59e0b; padding: 1px 6px; border-radius: 4px;">⚠️ Cadastro Pendente</span>` : `<span style="color: #15803d; font-weight: bold;">Cadastro Regular</span>`}
          </div>
          <div class="client-grid">
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${window.escapeHtml ? window.escapeHtml(clientName) : clientName}</div>
              ${formattedClientDoc ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;"><strong>CPF/CNPJ:</strong> ${formattedClientDoc}</div>` : ''}
              ${clientAddress ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;"><strong>Endereço:</strong> ${clientAddress}</div>` : ''}
            </div>
            <div>
              ${formattedClientPhone ? `<div style="font-size: 11px; color: #0284c7;"><strong>WhatsApp/Tel:</strong> ${formattedClientPhone}</div>` : ''}
              ${clientEmail ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;"><strong>E-mail:</strong> ${window.escapeHtml ? window.escapeHtml(clientEmail) : clientEmail}</div>` : ''}
              <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;"><strong>Vendedor:</strong> ${window.escapeHtml ? window.escapeHtml(savedOrder.vendedor || 'Comercial') : (savedOrder.vendedor || 'Comercial')}</div>
            </div>
          </div>
        </div>

        <!-- TABELA DE ITENS -->
        <table>
          <thead>
            <tr>
              <th style="width: 35px;">Item</th>
              <th>Produto / Descrição</th>
              <th style="width: 110px;">Dimensões</th>
              <th style="text-align: center; width: 45px;">Qtd</th>
              <th style="text-align: right; width: 85px;">V. Unit</th>
              <th style="text-align: right; width: 95px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- TOTAL GERAL E CONDICOES -->
        <div class="totals-bar">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right; font-family: monospace;">R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            </tr>
            ${discount > 0 ? `
              <tr>
                <td>Desconto:</td>
                <td style="text-align: right; font-family: monospace; color: #dc2626;">- R$ ${discount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
              </tr>
            ` : ''}
            <tr class="final-row">
              <td>Total Geral:</td>
              <td style="text-align: right; font-family: monospace;">R$ ${finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            </tr>
          </table>
        </div>

        <!-- INFORMAÇÕES DO PEDIDO & VALIDAÇÕES OPERACIONAIS (Imagem 3) -->
        <div class="validation-section">
          <!-- Tira com Prazos, Entrada e Saldo Restante -->
          <div class="order-info-strip">
            <div>
              <span style="color: #64748b; text-transform: uppercase; font-size: 9px; font-weight: bold; display: block;">${(opVal === 'orcamento' || opVal === 'prevenda' || opVal === 'pre-venda') ? 'Validade da Proposta:' : 'Prazo de Entrega:'}</span>
              <strong style="color: #0f172a; font-size: 13px;">${(opVal === 'orcamento' || opVal === 'prevenda' || opVal === 'pre-venda') ? (validadeFormatada ? validadeFormatada + ' (' + diasValidade + ' dias)' : diasValidade + ' dias') : previsaoFormatada}</strong>
            </div>
            <div>
              <span style="color: #64748b; text-transform: uppercase; font-size: 9px; font-weight: bold; display: block;">${(opVal === 'permuta' || opVal === 'patrocinio') ? 'Operação / %:' : 'Forma de Pagto:'}</span>
              <strong style="color: #0f172a;">${(opVal === 'permuta' || opVal === 'patrocinio') ? opVal.toUpperCase() + ' (' + percentualOp + '%)' : window.escapeHtml ? window.escapeHtml(metodoPagto) : metodoPagto}</strong>
            </div>
            <div>
              <span style="color: #15803d; text-transform: uppercase; font-size: 9px; font-weight: bold; display: block;">Entrada / Sinal Pago:</span>
              <strong style="color: #15803d; font-size: 13px; font-family: monospace;">R$ ${entrada.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div>
              <span style="color: #dc2626; text-transform: uppercase; font-size: 9px; font-weight: bold; display: block;">Saldo Restante (Falta):</span>
              <strong style="color: ${restante <= 0.01 ? '#15803d' : '#dc2626'}; font-size: 13px; font-family: monospace;">
                ${restante <= 0.01 ? 'QUITADO' : 'R$ ' + restante.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </strong>
            </div>
          </div>

          <!-- Grade de 3 Vistos: Aceite do Cliente, Autorizo de Produção, Conferência de Arte -->
          <div class="approval-grid">
            <!-- 1. Aceite do Cliente -->
            <div class="approval-box">
              <div>
                <div class="approval-title">
                  <span>1. Aceite do Cliente</span>
                  <span style="font-size: 9px; color: #64748b;">${dataAceiteFormatada ? 'Data: ' + dataAceiteFormatada : 'Data: ___/___/___'}</span>
                </div>
                <div style="font-size: 9.5px; color: #475569; line-height: 1.3;">
                  Declaro que conferi e estou de acordo com os itens, medidas, valores e condições acima relacionados.
                </div>
              </div>
              <div class="sig-line">
                Assinatura do Cliente
              </div>
            </div>

            <!-- 2. Autorizo de Produção -->
            <div class="approval-box">
              <div>
                <div class="approval-title">
                  <span>2. Autorizo de Produção</span>
                  <span style="font-size: 9px; color: #0284c7;">${autorizoProd ? (window.escapeHtml ? window.escapeHtml(autorizoProd) : autorizoProd) : 'Visto'}</span>
                </div>
                <div style="font-size: 9.5px; color: #475569; line-height: 1.3;">
                  Liberado para fila de corte/impressão. Materiais disponíveis e ordem de execução confirmada.
                </div>
              </div>
              <div class="sig-line">
                Responsável pela Produção
              </div>
            </div>

            <!-- 3. Conferência da Arte -->
            <div class="approval-box">
              <div>
                <div class="approval-title">
                  <span>3. Conferência da Arte</span>
                  <span style="font-size: 9px; color: #16a34a;">${confArte ? (window.escapeHtml ? window.escapeHtml(confArte) : confArte) : 'OK'}</span>
                </div>
                <div style="font-size: 9.5px; color: #475569; line-height: 1.3;">
                  [ ✔ ] Arquivo em CMYK<br>
                  [ ✔ ] Proporção e sangria conferidas<br>
                  [ ✔ ] Textos em curvas e resolução alta
                </div>
              </div>
              <div class="sig-line">
                Conferente / Designer
              </div>
            </div>
          </div>
        </div>

        <!-- RODAPÉ PADRONIZADO (PAGINAÇÃO, FUSO E TIMESTAMP) -->
        ${reportFooterHtml}

        <script>window.print();</script>
      </body>
      </html>
    `;
    this.openPrintDocument(pdfHtml, 'OP-' + (savedOrder.numero || orderIdStr));
  },
  calcPiecePriceOLD() {
    const type = document.getElementById('item-type').value;
    let w = parseFloat(document.getElementById('item-width').value); if(isNaN(w)) w = 0;
    let h = parseFloat(document.getElementById('item-height').value); if(isNaN(h)) h = 0;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const area = type === 'm2' ? (w * h) : (type === 'linear' ? w : 1);
    const piecePrice = type === 'unidade' ? price : (area * price);
    const displayEl = document.getElementById('item-piece-price');
    if(displayEl) displayEl.innerText = `Peça: R$ ${piecePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  },
  openNewProductModal() {
    const modalHtml = `
      <div id="quick-product-modal" class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl">
          <h3 class="font-black text-lg text-slate-800 mb-4 border-b pb-2">Cadastrar Produto Rápido</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold mb-1">Nome do Produto</label>
              <input type="text" id="qp-nome" class="w-full p-2 border rounded text-sm bg-slate-50" placeholder="Ex: Lona Frontlight 440g">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">Cálculo</label>
              <select id="qp-tipo" class="w-full p-2 border rounded text-sm bg-slate-50">
                <option value="m2">Por m²</option>
                <option value="linear">Metro Linear</option>
                <option value="unidade">Por Unidade</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">Preço Base (R$)</label>
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
    sel.innerHTML = `<option value="">Selecione...</option>` + products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome}</option>`).join('');
    sel.value = newProd.id;
    this.handleProdSelect(sel);
    alert('Produto cadastrado com sucesso!');
  },
  addItemToOrder() {
    const desc = document.getElementById('item-desc').value.trim();
    if (!desc) { alert('Informe os detalhes/especificações do item (ex: Homem-Aranha, Superman, Candidato Fulano...)'); return; }
    const prodSelect = document.getElementById('item-prod-select');
    if (!prodSelect.value) { alert('Selecione um Produto Base'); return; }
    const opt = prodSelect.options[prodSelect.selectedIndex];
    const prodNome = opt.text.split(' (R$')[0];
    const type = document.getElementById('item-type')?.value || 'm2';
    let w = parseFloat(document.getElementById('item-width').value); if(isNaN(w)) w = 0;
    let h = parseFloat(document.getElementById('item-height').value); if(isNaN(h)) h = 0;
    const qty = parseFloat(document.getElementById('item-qty').value) || 1;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    
    const itemArteInput = document.getElementById('item-arte-url');
    const arteUrl = itemArteInput ? itemArteInput.value.trim() : '';

    const orderIdStr = document.getElementById('current-display-id')?.value;
    const finalId = (orderIdStr && orderIdStr !== '#NOVO') ? orderIdStr : (this.currentAssignedOrderId || this.getNextOrderId());
    const seq = String(this.activeItems.length + 1).padStart(2, '0');
    const generatedItemId = finalId + seq;

    let area = 0;
    let piecePrice = price;
    if (type === 'm2') {
      area = (w * h);
      piecePrice = area * price;
    } else if (type === 'linear') {
      area = w;
      piecePrice = w * price;
    } else {
      area = 0;
      piecePrice = price;
    }
    const total = piecePrice * qty;

    this.activeItems.push({
      item_id: generatedItemId,
      produto_id: prodSelect.value, 
      produto_nome: prodNome, 
      descricao: desc, 
      tipo_calculo: type, 
      largura_x: (type === 'm2' || type === 'linear') ? w : 0, 
      comprimento_y: (type === 'm2') ? h : 0,
      quantidade: qty, 
      preco_base: price,
      preco_unitario: piecePrice,
      area_m2: area, 
      valor_total: total,
      arte_url: arteUrl,
      liberado_os: true
    });

    document.getElementById('order-items-tbody').innerHTML = this.renderActiveItemsHtml();
    document.getElementById('item-desc').value = '';
    document.getElementById('item-prod-select').value = '';
    document.getElementById('item-price').value = '0.00';
    document.getElementById('item-width').value = '0.00';
    document.getElementById('item-height').value = '0.00';
    document.getElementById('item-qty').value = '1';
    const typeHidden = document.getElementById('item-type');
    if (typeHidden) typeHidden.value = 'm2';
    const typeDisplay = document.getElementById('item-type-display');
    if (typeDisplay) typeDisplay.value = 'm² (X x Y)';
    
    // LIMPA A ARTE DA MEMÓRIA E DO PREVIEW COMPLETAMENTE PARA O PRÓXIMO LAYOUT
    this.removeItemArte();

    this.toggleDimensionInputs();
    this.calcPiecePrice();
    this.recalcTotals('val');
    this.updateOsStatusInfo();
    document.getElementById('item-prod-select').focus();
  },
  removeItem(idx) {
    this.activeItems.splice(idx, 1);
    const orderIdStr = document.getElementById('current-display-id')?.value || '000000';
    this.activeItems.forEach((it, i) => {
      it.item_id = orderIdStr + String(i + 1).padStart(2, '0');
    });
    document.getElementById('order-items-tbody').innerHTML = this.renderActiveItemsHtml();
    document.getElementById('item-desc').value = '';
    document.getElementById('item-prod-select').value = '';
    document.getElementById('item-price').value = '0.00';
    document.getElementById('item-width').value = '0.00';
    document.getElementById('item-height').value = '0.00';
    document.getElementById('item-qty').value = '1';
    const typeHiddenR = document.getElementById('item-type');
    if (typeHiddenR) typeHiddenR.value = 'm2';
    const typeDisplayR = document.getElementById('item-type-display');
    if (typeDisplayR) typeDisplayR.value = 'm² (X x Y)';
    this.removeItemArte();
    this.toggleDimensionInputs();
    this.calcPiecePrice();
    this.recalcTotals('val');
    this.updateOsStatusInfo();
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
        return `<tr><td colspan="8" class="p-4 text-center text-slate-400 font-semibold bg-slate-50">Nenhum item adicionado ao pedido.</td></tr>`;
      }
      return this.activeItems.map((it, idx) => `
        <tr class="border-b hover:bg-slate-50 transition ${it.liberado_os === false ? 'bg-amber-50/50 opacity-90' : ''}">
          <td class="p-3 text-center">
            <input type="checkbox" ${it.liberado_os !== false ? 'checked' : ''} onchange="salesModule.toggleItemOs(${idx}, this.checked)" title="Liberar item para O.S. (Desmarque para reter)" class="item-os-check w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600">
          </td>
          <td class="p-3">
            <div class="flex items-center gap-3">
              ${it.arte_url 
                ? `<div class="relative group cursor-pointer flex-shrink-0" onclick="salesModule.viewItemDetails(${idx})" title="Clique para ver arte ampliada">
                     <img src="${it.arte_url}" class="w-12 h-12 object-cover rounded-lg border-2 border-blue-400 shadow-sm group-hover:scale-105 transition-transform">
                     <span class="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 text-[8px]" title="Arte Anexada">🔍</span>
                   </div>` 
                : `<div class="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-[9px] text-slate-400 flex-shrink-0 font-bold">
                     <span>SEM</span><span>ARTE</span>
                   </div>`
              }
              <div>
                <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] font-mono ${it.liberado_os !== false ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-amber-100 text-amber-800 border-amber-300'} border px-1.5 py-0.5 rounded font-black cursor-pointer hover:bg-blue-200 transition" onclick="salesModule.isolateItemForOs(${idx})" title="Clique para isolar este item na O.S. / visualização">#${String(it.item_id || '----').replace(/^#+/, '')}</span>
                  ${it.produto_nome || ''}
                  ${it.liberado_os === false ? '<span class="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Aguardando Liberação</span>' : ''}
                </div>
                <div class="text-[11px] text-slate-500 font-medium mt-0.5">${it.descricao}</div>
              </div>
            </div>
          </td>
          <td class="p-3 font-mono text-xs text-slate-700">${
            it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` :
            (it.tipo_calculo === 'linear' ? `${it.largura_x}m linear` :
            (it.tipo_calculo === 'unidade' ? 'Unidade' :
            (it.tipo_calculo === 'servico' ? 'Serviço' :
            (it.tipo_calculo === 'diaria' ? 'Diária' :
            (it.tipo_calculo === 'hora' ? 'Hora' :
            (it.tipo_calculo === 'L' ? 'Litro (L)' : 'Unidade'))))))
          }</td>
          <td class="p-3 font-bold text-center text-xs">${it.quantidade}</td>
          <td class="p-3 font-mono text-xs text-purple-700 font-bold">${
            it.tipo_calculo === 'm2' ? ((it.area_m2 || (it.largura_x * it.comprimento_y)) * it.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' m²' :
            (it.tipo_calculo === 'linear' ? ((it.largura_x || 0) * it.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' m' : '-')
          }</td>
          <td class="p-3 font-mono text-xs text-slate-700">R$ ${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="p-3 font-bold text-blue-700 text-xs">R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="p-3 text-right">
            ${((this.isOrderRegistered || this.isOrderLockedByApproval) && !this.isEditingActive) || this.isReadOnlyFinancial ? `
              <span class="text-[11px] font-bold text-slate-400 italic">Travado</span>
            ` : `
              <div class="flex justify-end gap-1">
                <button type="button" onclick="salesModule.editItem(${idx})" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded cursor-pointer" title="Editar Item">&#9998;</button>
                <button type="button" onclick="salesModule.removeItem(${idx})" class="text-rose-600 hover:bg-rose-50 p-1.5 rounded cursor-pointer" title="Remover Item">&times;</button>
              </div>
            `}
          </td>
        </tr>
      `).join('');
    },
  formatCurrencyInput(input, source = 'entrada') {
    if (!input) return;
    const clean = String(input.value || '').trim().replace(/\./g, '').replace(',', '.');
    const val = parseFloat(clean) || 0;
    input.value = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    this.recalcTotals(source);
  },
  recalcTotals(source = 'val') {
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    const rawDesc = document.getElementById('order-discount')?.value || '0';
    const cleanDesc = String(rawDesc).trim().replace(/\./g, '').replace(',', '.');
    let descVal = parseFloat(cleanDesc) || 0;
    let descPerc = parseFloat(document.getElementById('order-discount-perc')?.value) || 0;
    
    if (source === 'perc') {
      descVal = subtotal * (descPerc / 100);
      const valEl = document.getElementById('order-discount');
      if (valEl) valEl.value = descVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    // Entrada direta e cálculo de saldo restante
    let entradaInput = document.getElementById('order-valor-entrada');
    let hiddenRec = document.getElementById('order-valor-recebido');
    
    let valorEntrada = 0;
    if (source === 'entrada' && entradaInput) {
      const cleanVal = String(entradaInput.value || '').trim().replace(/\./g, '').replace(',', '.');
      valorEntrada = parseFloat(cleanVal) || 0;
      if (hiddenRec) hiddenRec.value = valorEntrada;
    } else if (hiddenRec && parseFloat(hiddenRec.value) > 0) {
      valorEntrada = parseFloat(hiddenRec.value) || 0;
      if (entradaInput && document.activeElement !== entradaInput) {
        entradaInput.value = valorEntrada.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      }
    } else if (entradaInput) {
      const cleanVal = String(entradaInput.value || '').trim().replace(/\./g, '').replace(',', '.');
      valorEntrada = parseFloat(cleanVal) || 0;
      if (hiddenRec) hiddenRec.value = valorEntrada;
    }

    const saldoRestante = Math.max(0, finalTotal - valorEntrada);
    const saldoEl = document.getElementById('order-saldo-restante');
    if (saldoEl) {
      if (saldoRestante <= 0.01 && finalTotal > 0) {
        saldoEl.innerText = 'QUITADO (R$ 0,00)';
        saldoEl.className = 'text-base font-black text-emerald-600 font-mono';
      } else {
        saldoEl.innerText = 'R$ ' + saldoRestante.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        saldoEl.className = 'text-base font-black text-rose-600 font-mono';
      }
    }
    
    if (valorEntrada > 0 || finalTotal > 0) {
      if (this.updateFinanceSummary) this.updateFinanceSummary(valorEntrada, finalTotal);
    }
    
    return { subtotal, discount: descVal, finalTotal, valorEntrada, saldoRestante };
  },
  async handleArteUpload(input) {
    if(!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      const dataUrl = await this.compressImage(file, 1000, 1000, 0.72);
      const fotoEl = document.querySelector('input[name="foto_arte_url"]');
      if (fotoEl) fotoEl.value = "Imagem salva no banco de dados";
      const arteEl = document.getElementById('order-arte-url');
      if (arteEl) arteEl.value = dataUrl;
      alert("Imagem da arte anexada e otimizada com sucesso!");
    } catch (err) {
      console.error('[GRAFSIS] Erro ao anexar arte:', err);
    }
  },

  async saveOrderQuick(e, id, geradoNumero) {
    if (e && e.preventDefault) e.preventDefault();
    const form = document.getElementById('order-form') || (e && e.target && e.target.tagName === 'FORM' ? e.target : e?.target?.closest('form'));
    if (!form) {
      alert('Erro: Formulário do pedido não localizado na tela.');
      return;
    }

    const clients = window.store.getClients();
    let clienteId = form.cliente_id ? form.cliente_id.value : document.getElementById('order-cliente-select')?.value;
    if (!clienteId) {
      if (clients && clients.length > 0) {
        clienteId = clients[0].id;
        const sel = document.getElementById('order-cliente-select');
        if (sel) sel.value = clienteId;
      } else {
        alert('Selecione ou cadastre ao menos um cliente para salvar a operação.');
        return;
      }
    }

    const saveBtn = document.getElementById('btn-save-draft');
    const originalText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `
        <svg class="w-4 h-4 animate-spin text-white shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Salvando...</span>
      `;
    }

    this.showInlineProgress('Salvando operação...', 35, false);

    // Modal com barra de progresso animada e feedback visual
    const progressModalId = 'modal-save-progress-indicator';
    document.getElementById(progressModalId)?.remove();

    const progressHtml = `
      <div id="${progressModalId}" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full p-5 text-center transform scale-100 transition-all">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center relative">
            <svg id="save-progress-spinner" class="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg id="save-progress-check" class="w-7 h-7 hidden text-emerald-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 id="save-progress-title" class="text-sm font-black text-slate-800 dark:text-white">Salvando Operação...</h3>
          <p id="save-progress-desc" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Gravando itens e atualizando dados da operação</p>
          
          <div class="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-3.5">
            <div id="save-progress-bar" class="bg-emerald-500 h-full rounded-full transition-all duration-300" style="width: 45%;"></div>
          </div>
          <span id="save-progress-percent" class="text-[10px] font-bold text-slate-400 mt-1 block">45%</span>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', progressHtml);

    try {
      const orders = window.store.getOrders();
      const activeDisplayId = document.getElementById('current-display-id')?.value;
      const targetOrderId = id || this.currentEditingOrderId;

      let oldOrder = null;
      if (targetOrderId) {
        oldOrder = orders.find(o => String(o.id) === String(targetOrderId) || String(o.numero) === String(targetOrderId));
      }
      if (!oldOrder && activeDisplayId) {
        oldOrder = orders.find(o => String(o.numero) === String(activeDisplayId));
      }

      const isExistingOrder = !!oldOrder;
      const currentId = oldOrder ? oldOrder.id : (targetOrderId || null);
      if (isExistingOrder) {
        const userRole = window.authModule ? (window.authModule.getCurrentUser().tipo || window.authModule.getCurrentUser().perfil || window.authModule.getCurrentUser().role || '').toUpperCase() : '';
        const isManagerOrOwner = ['GERENTE', 'PROPRIETARIO', 'ADMIN'].includes(userRole);
        const isAdvancedSale = oldOrder.tipo_operacao === 'venda' && (oldOrder.status_fase !== 'orcamento' && oldOrder.status_fase !== 'prevenda');
        if (isAdvancedSale && !isManagerOrOwner) {
          document.getElementById(progressModalId)?.remove();
          alert('Acesso Restrito: Vendas finalizadas com produção liberada só podem ter valores ou itens alterados por Gerente ou Proprietário.');
          return;
        }
      }
      const preAssignedQuick = document.getElementById('current-display-id')?.value;
      const finalNumber = (isExistingOrder && oldOrder && oldOrder.numero) 
        ? oldOrder.numero 
        : ((preAssignedQuick && preAssignedQuick !== '#NOVO') ? preAssignedQuick : (this.currentAssignedOrderId || this.getNextOrderId()));

      // Identifica dados cadastrais completos do cliente para integridade relacional
      const clientObj = clients.find(c => c.id === clienteId || String(c.id) === String(clienteId)) || {};
      const clienteNomeFinal = clientObj.nome || (oldOrder && oldOrder.cliente_nome) || 'Cliente';
      const clienteTelFinal = clientObj.telefone_whatsapp || clientObj.telefone || (oldOrder && oldOrder.cliente_telefone) || '';
      const clienteCpfFinal = clientObj.cpf_cnpj || clientObj.cpf || (oldOrder && oldOrder.cliente_cpf) || '';

      // Se não houver itens adicionados, cria um item provisório de orçamento
      if (!this.activeItems || this.activeItems.length === 0) {
        this.activeItems = [{
          item_id: finalNumber + '01',
          produto_id: '',
          produto_nome: 'Item Provisório (Em Definição)',
          descricao: form.observacoes?.value || 'Operação salva rapidamente em rascunho',
          tipo_calculo: 'unidade',
          largura_x: 0,
          comprimento_y: 0,
          quantidade: 1,
          preco_base: 0,
          preco_unitario: 0,
          area_m2: 1,
          valor_total: 0,
          arte_url: document.getElementById('order-arte-url')?.value || ''
        }];
      } else {
        this.activeItems.forEach((it, idx) => {
          it.item_id = finalNumber + String(idx + 1).padStart(2, '0');
        });
      }

      // Compactação preventiva de imagens nos itens para proteger quota do navegador
      for (const it of this.activeItems) {
        if (it.arte_url && it.arte_url.startsWith('data:image/') && it.arte_url.length > 100000) {
          try {
            it.arte_url = await this.compressDataUrl(it.arte_url, 800, 800, 0.70);
          } catch (ign) {}
        }
      }

      const { subtotal, discount, finalTotal } = this.recalcTotals();
      const op = form.tipo_operacao ? form.tipo_operacao.value : (oldOrder ? (oldOrder.tipo_operacao || oldOrder.tipo) : 'venda');
      const rawEntrada = document.getElementById("order-valor-entrada")?.value || document.getElementById("order-valor-recebido")?.value || '0';
      const cleanEntrada = String(rawEntrada).trim().replace(/\./g, '').replace(',', '.');
      const valorEntrada = parseFloat(cleanEntrada) || 0;
      const saldoRestante = Math.max(0, finalTotal - valorEntrada);
      const statusPagto = (saldoRestante <= 0.01 && finalTotal > 0) ? 'pago' : (valorEntrada > 0 ? 'parcial' : 'pendente');

      let historico = oldOrder?.historico ? JSON.parse(JSON.stringify(oldOrder.historico)) : [];
      historico.push({
        fase: op,
        data: new Date().toISOString(),
        usuario: window.app?.currentUser?.nome || 'Operador'
      });

      const orderData = {
        id: currentId || undefined,
        numero: finalNumber,
        cliente_id: clienteId,
        cliente_nome: clienteNomeFinal,
        cliente_telefone: clienteTelFinal,
        cliente_cpf: clienteCpfFinal,
        tipo_operacao: op,
        tipo: op,
        vendedor: window.app?.currentUser?.nome || "Vendedor",
        status_fase: (oldOrder && oldOrder.status_fase && ['liberado', 'producao', 'acabamento', 'embalagem', 'entregue'].includes(oldOrder.status_fase)) ? oldOrder.status_fase : op,
        registrado: (oldOrder && (oldOrder.registrado === true || oldOrder.registrado === 'sim')) ? true : false,
        status_registro: (oldOrder && (oldOrder.registrado === true || oldOrder.registrado === 'sim')) ? 'registrado' : 'salvo',
        previsao_entrega: form.previsao_entrega?.value || null,
        validade_proposta_dias: form.validade_proposta_dias ? (parseInt(form.validade_proposta_dias.value) || 10) : 10,
        data_validade: form.data_validade ? form.data_validade.value : null,
        percentual_operacao: form.percentual_operacao ? (parseFloat(form.percentual_operacao.value) || 100) : 100,
        data_aceite: form.data_aceite?.value || null,
        autorizo_producao: form.autorizo_producao?.value || '',
        conferencia_arte: form.conferencia_arte?.value || '',
        foto_arte_url: document.getElementById('order-arte-url')?.value || form.foto_arte_url?.value || '',
        observacoes: form.observacoes ? form.observacoes.value : '',
        forma_pagamento: document.getElementById('order-metodo-pagto')?.value || 'A Definir',
        obs_pagto: document.getElementById('order-obs-pagto')?.value || '',
        valor_entrada: valorEntrada,
        valor_recebido: valorEntrada,
        status_pagamento: statusPagto,
        valor_total: (this.isReadOnlyFinancial && oldOrder) ? oldOrder.valor_total : subtotal,
        desconto: (this.isReadOnlyFinancial && oldOrder) ? oldOrder.desconto : discount,
        valor_final: (this.isReadOnlyFinancial && oldOrder) ? oldOrder.valor_final : finalTotal,
        itens: (this.isReadOnlyFinancial && oldOrder && oldOrder.itens) ? oldOrder.itens : this.activeItems,
        repositorio_arquivos: this.activeRepositoryItems || (oldOrder ? oldOrder.repositorio_arquivos : []) || [],
        historico: historico
      };

      const saved = await window.store.saveOrder(orderData);

      // Atualiza progresso para 100%
      const bar = document.getElementById('save-progress-bar');
      if (bar) bar.style.width = '100%';
      const pctEl = document.getElementById('save-progress-percent');
      if (pctEl) pctEl.innerText = '100%';
      const titleEl = document.getElementById('save-progress-title');
      if (titleEl) titleEl.innerText = `Operação #${saved.numero} Salva!`;
      const descEl = document.getElementById('save-progress-desc');
      if (descEl) descEl.innerText = 'Alterações gravadas. Mantendo você na mesma tela...';

      const spinnerEl = document.getElementById('save-progress-spinner');
      const checkEl = document.getElementById('save-progress-check');
      if (spinnerEl) spinnerEl.classList.add('hidden');
      if (checkEl) checkEl.classList.remove('hidden');

      // MANTÉM NA MESMA TELA:
      this.currentEditingOrderId = saved.id;
      const displayIdLabel = document.getElementById('display-order-id-label');
      if (displayIdLabel) displayIdLabel.innerText = '#' + saved.numero;
      const displayNumeroTag = document.getElementById('display-order-numero-tag');
      if (displayNumeroTag) displayNumeroTag.innerText = '#' + saved.numero;
      const curDisplayInput = document.getElementById('current-display-id');
      if (curDisplayInput) curDisplayInput.value = saved.numero;

      if (saveBtn) {
        saveBtn.setAttribute('onclick', `salesModule.saveOrderQuick(event, '${saved.id}', '${saved.numero}')`);
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
          <svg class="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Salvo!</span>
        `;
        setTimeout(() => {
          if (saveBtn) saveBtn.innerHTML = originalText;
        }, 2500);
      }
      const submitBtn = document.getElementById('btn-submit-order');
      if (submitBtn) {
        submitBtn.setAttribute('onclick', `salesModule.saveOrder(event, '${saved.id}', '${saved.numero}')`);
      }

      this.currentEditingOrderId = saved.id;
      this.isEditingActive = false;

      // Sincroniza badge de Fase Atual, carimbo de data/hora e campos
      this.updatePhaseBadge(op);
      const phaseTimeEl = document.getElementById('display-order-phase-time-val');
      if (phaseTimeEl) {
        phaseTimeEl.innerText = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      this.updateFormState();
      this.updateStandardApprovalBox(saved);
      this.showInlineProgress(`Operação #${saved.numero} salva com sucesso!`, 100, true);

      setTimeout(() => {
        const modal = document.getElementById(progressModalId);
        if (modal) {
          modal.classList.add('opacity-0');
          setTimeout(() => modal.remove(), 250);
        }
      }, 1000);

    } catch (err) {
      document.getElementById(progressModalId)?.remove();
      console.error('[GRAFSIS] Erro ao salvar operação rápida:', err);
      alert('Erro ao salvar operação: ' + (err.message || err));
    } finally {
      if (saveBtn && saveBtn.disabled) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
      }
    }
  },

  async saveOrder(e, id, geradoNumero, options = {}) {
    if (e && e.preventDefault) e.preventDefault();
    const form = document.getElementById('order-form') || (e && e.target && e.target.tagName === 'FORM' ? e.target : e?.target?.closest('form'));
    if (!form) {
      alert('Erro: Formulário do pedido não localizado na tela.');
      return;
    }

    const orders = window.store.getOrders();
    const activeDisplayId = document.getElementById('current-display-id')?.value;
    const targetOrderId = id || this.currentEditingOrderId;

    let oldOrder = null;
    if (targetOrderId) {
      oldOrder = orders.find(o => String(o.id) === String(targetOrderId) || String(o.numero) === String(targetOrderId));
    }
    if (!oldOrder && activeDisplayId) {
      oldOrder = orders.find(o => String(o.numero) === String(activeDisplayId));
    }

    const isExistingOrder = !!oldOrder;
    if (isExistingOrder) {
      const userRole = window.authModule ? (window.authModule.getCurrentUser().tipo || window.authModule.getCurrentUser().perfil || window.authModule.getCurrentUser().role || '').toUpperCase() : '';
      const isManagerOrOwner = ['GERENTE', 'PROPRIETARIO', 'ADMIN'].includes(userRole);
      const isAdvancedSale = oldOrder.tipo_operacao === 'venda' && (oldOrder.status_fase !== 'orcamento' && oldOrder.status_fase !== 'prevenda');
      if (isAdvancedSale && !isManagerOrOwner) {
        alert('Acesso Restrito: Vendas finalizadas com produção liberada só podem ter valores ou itens alterados por Gerente ou Proprietário.');
        return;
      }
    }

    const clienteId = form.cliente_id ? form.cliente_id.value : document.getElementById('order-cliente-select')?.value;
    if (!clienteId) {
      alert('Crítica da Operação: É obrigatório selecionar um cliente antes de registrar a operação.');
      const clientSel = document.getElementById('order-cliente-select') || document.querySelector('select[name="cliente_id"]');
      if (clientSel) clientSel.focus();
      return;
    }
    if (!this.activeItems || this.activeItems.length === 0) { 
      alert('Crítica da Operação: Adicione pelo menos um item à operação antes de registrar.'); 
      const prodSel = document.getElementById('item-prod-select');
      if (prodSel) prodSel.focus();
      return; 
    }

    const op = form.tipo_operacao ? form.tipo_operacao.value : 'venda';
    const isVendaPatrocinioPermuta = (op === 'venda' || op === 'patrocinio' || op === 'permuta');
    const prevEntregaVal = form.previsao_entrega ? form.previsao_entrega.value : document.getElementById('previsao_entrega')?.value;
    if (isVendaPatrocinioPermuta && !prevEntregaVal) {
      alert('Crítica da Operação: Para operações de Venda, Patrocínio ou Permuta, informe a data de Previsão de Entrega antes de registrar.');
      const prevEl = document.getElementById('previsao_entrega');
      if (prevEl) prevEl.focus();
      return;
    }

    // Perfis autorizados para Permuta e Patrocínio
    if ((op === 'permuta' || op === 'patrocinio') && !this.canManagePermutaPatrocinio()) {
      alert('Operação negada: Permuta e Patrocínio só podem ser autorizados pelos perfis Gerente ou Proprietário.');
      return;
    }

    const { subtotal, discount, finalTotal } = this.recalcTotals();
    const allClients = window.store.getClients();
    const clientObj = allClients.find(c => c.id === clienteId || String(c.id) === String(clienteId)) || {};
    const clienteNomeFinal = clientObj.nome || (oldOrder && oldOrder.cliente_nome) || 'Cliente';

    // SOLICITAÇÃO EXPLÍCITA DE CONFIRMAÇÃO ANTES DE REGISTRAR
    const opNames = {
      'orcamento': 'Orçamento',
      'pre-venda': 'Pré-Venda',
      'prevenda': 'Pré-Venda',
      'venda': 'Venda',
      'patrocinio': 'Patrocínio',
      'permuta': 'Permuta'
    };
    const opLabel = opNames[op] || op.toUpperCase();
    const confirmMsg =
      `CONFIRMAÇÃO DE REGISTRO DA OPERAÇÃO\n\n` +
      `• Operação: ${opLabel}\n` +
      `• Cliente: ${clienteNomeFinal}\n` +
      `• Total de Itens: ${this.activeItems.length}\n` +
      `• Valor Final: R$ ${finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n\n` +
      `Deseja prosseguir e registrar esta operação no sistema?`;

    const confirmed = await window.grafsisConfirm({
      title: 'GRAFSIS',
      message: confirmMsg,
      confirmText: 'Registrar',
      cancelText: 'Cancelar'
    });

    if (!confirmed) {
      return;
    }

    const submitBtn = document.getElementById('btn-submit-order');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Gravando...';
    }

    this.showInlineProgress('Registrando operação oficial no sistema...', 30, false);

    try {

      let historico = [];
      const currentId = oldOrder ? oldOrder.id : (targetOrderId || null);
      if (oldOrder && oldOrder.historico) {
        historico = JSON.parse(JSON.stringify(oldOrder.historico));
      }
      
      // Status/Fase da Produção respeitando o tipo de operação
      let newPhase = form.status_fase ? form.status_fase.value : 'orcamento';
      if (op === 'orcamento') newPhase = 'orcamento';
      else if (op === 'pre-venda') newPhase = 'prevenda';

      const oldPhase = oldOrder ? oldOrder.status_fase : null;
      if (newPhase !== oldPhase) {
        historico.push({
          fase: newPhase,
          data: new Date().toISOString(),
          usuario: window.app?.currentUser?.nome || 'Sistema'
        });
      }

      const rawEntrada = document.getElementById("order-valor-entrada")?.value || document.getElementById("order-valor-recebido")?.value || '0';
      const cleanEntrada = String(rawEntrada).trim().replace(/\./g, '').replace(',', '.');
      const valorEntrada = parseFloat(cleanEntrada) || 0;
      const saldoRestante = Math.max(0, finalTotal - valorEntrada);
      const statusPagto = (saldoRestante <= 0.01 && finalTotal > 0) ? 'pago' : (valorEntrada > 0 ? 'parcial' : 'pendente');
      const preAssignedOrder = document.getElementById('current-display-id')?.value;
      const finalNumber = (isExistingOrder && oldOrder && oldOrder.numero) 
        ? oldOrder.numero 
        : ((preAssignedOrder && preAssignedOrder !== '#NOVO') ? preAssignedOrder : (this.currentAssignedOrderId || this.getNextOrderId()));

      // Identifica dados cadastrais completos do cliente para integridade relacional
      const allClients = window.store.getClients();
      const clientObj = allClients.find(c => c.id === clienteId || String(c.id) === String(clienteId)) || {};
      const clienteNomeFinal = clientObj.nome || (oldOrder && oldOrder.cliente_nome) || 'Cliente';
      const clienteTelFinal = clientObj.telefone_whatsapp || clientObj.telefone || (oldOrder && oldOrder.cliente_telefone) || '';
      const clienteCpfFinal = clientObj.cpf_cnpj || clientObj.cpf || (oldOrder && oldOrder.cliente_cpf) || '';

      // Atualiza sequencial dos itens vinculados ao numero oficial da operacao
      this.activeItems.forEach((it, idx) => {
        it.item_id = finalNumber + String(idx + 1).padStart(2, '0');
      });

      // Compactação preventiva de imagens nos itens para proteger quota do navegador e manter alta velocidade
      for (const it of this.activeItems) {
        if (it.arte_url && it.arte_url.startsWith('data:image/') && it.arte_url.length > 100000) {
          try {
            it.arte_url = await this.compressDataUrl(it.arte_url, 800, 800, 0.70);
          } catch (ign) {}
        }
      }

      const orderData = {
        id: currentId || undefined,
        numero: finalNumber,
        cliente_id: clienteId,
        cliente_nome: clienteNomeFinal,
        cliente_telefone: clienteTelFinal,
        cliente_cpf: clienteCpfFinal,
        tipo_operacao: op,
        tipo: op,
        vendedor: window.app?.currentUser?.nome || "Vendedor",
        status_fase: newPhase,
        registrado: true,
        status_registro: 'registrado',
        previsao_entrega: form.previsao_entrega?.value || null,
        validade_proposta_dias: form.validade_proposta_dias ? (parseInt(form.validade_proposta_dias.value) || 10) : null,
        data_validade: form.data_validade ? form.data_validade.value : null,
        percentual_operacao: form.percentual_operacao ? (parseFloat(form.percentual_operacao.value) || 100) : 100,
        data_aceite: form.data_aceite?.value || null,
        autorizo_producao: form.autorizo_producao?.value || '',
        conferencia_arte: form.conferencia_arte?.value || '',
        foto_arte_url: document.getElementById('order-arte-url')?.value || form.foto_arte_url?.value || '',
        observacoes: form.observacoes ? form.observacoes.value : '',
        forma_pagamento: document.getElementById('order-metodo-pagto')?.value || 'Dinheiro / Cash',
        obs_pagto: document.getElementById('order-obs-pagto')?.value || '',
        valor_entrada: valorEntrada,
        valor_recebido: valorEntrada,
        status_pagamento: statusPagto,
        valor_total: (this.isReadOnlyFinancial && oldOrder) ? oldOrder.valor_total : subtotal,
        desconto: (this.isReadOnlyFinancial && oldOrder) ? oldOrder.desconto : discount,
        valor_final: (this.isReadOnlyFinancial && oldOrder) ? oldOrder.valor_final : finalTotal,
        itens: (this.isReadOnlyFinancial && oldOrder && oldOrder.itens) ? oldOrder.itens : this.activeItems,
        repositorio_arquivos: this.activeRepositoryItems || (oldOrder ? oldOrder.repositorio_arquivos : []) || [],
        historico: historico
      };

      const saved = await window.store.saveOrder(orderData);
      this.currentEditingOrderId = null;

      // REGRA FINANCEIRA:
      // Orçamento, Pré-Venda e Patrocínio NÃO abrem caixa definitivo
      const isBudgetOrPreSale = (op === 'orcamento' || op === 'pre-venda');
      const isPatrocinio = (op === 'patrocinio');

      if (!isBudgetOrPreSale && !isPatrocinio) {
        const finPromises = [];
        if (valorEntrada > 0) {
          finPromises.push(window.store.saveFinanceEntry({
            tipo: 'recebimento',
            descricao: (op === 'permuta' ? 'Entrada Permuta #' : 'Entrada Pedido #') + saved.numero + ' - ' + (orderData.itens[0]?.descricao || 'Comunicação Visual'),
            valor: valorEntrada,
            data_pagamento: new Date().toISOString().slice(0, 10),
            data_vencimento: new Date().toISOString().slice(0, 10),
            status: 'pago',
            forma_pagamento: orderData.forma_pagamento,
            pedido_id: saved.id,
            cliente_id: orderData.cliente_id
          }));
        }

        if (saldoRestante > 0.01) {
          finPromises.push(window.store.saveFinanceEntry({
            tipo: 'receber',
            descricao: (op === 'permuta' ? 'Saldo Restante Permuta #' : 'Saldo Restante Pedido #') + saved.numero + ' - ' + (orderData.itens[0]?.descricao || 'Comunicação Visual'),
            valor: saldoRestante,
            data_vencimento: orderData.previsao_entrega || new Date().toISOString().slice(0, 10),
            status: valorEntrada > 0 ? 'parcial' : 'pendente',
            pedido_id: saved.id,
            cliente_id: orderData.cliente_id
          }));
        }
        if (finPromises.length > 0) {
          await Promise.all(finPromises);
        }
      }

      // Atualiza estado de registro da operação (Imagem 4)
      this.isOrderRegistered = true;
      this.isEditingActive = false;
      this.currentEditingOrderId = saved.id;

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg> Operação Registrada`;
        submitBtn.className = 'w-full h-12 text-sm font-bold text-white bg-[#009b3a] hover:bg-[#008230] rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer';
        submitBtn.title = "Operação já registrada no sistema";
      }

      // MANTÉM NA PÁGINA ATUAL (REQUISITO DA IMAGEM 5)
      const displayIdLabel = document.getElementById('display-order-id-label');
      if (displayIdLabel) displayIdLabel.innerText = '#' + saved.numero;
      const displayNumeroTag = document.getElementById('display-order-numero-tag');
      if (displayNumeroTag) displayNumeroTag.innerText = '#' + saved.numero;
      const curDisplayInput = document.getElementById('current-display-id');
      if (curDisplayInput) curDisplayInput.value = saved.numero;

      const saveBtn = document.getElementById('btn-save-draft');
      if (saveBtn) {
        saveBtn.setAttribute('onclick', `salesModule.saveOrderQuick(event, '${saved.id}', '${saved.numero}')`);
        saveBtn.disabled = false;
      }
      if (submitBtn) {
        submitBtn.setAttribute('onclick', `salesModule.saveOrder(event, '${saved.id}', '${saved.numero}')`);
      }

      const phaseTimeEl = document.getElementById('display-order-phase-time-val');
      if (phaseTimeEl) {
        phaseTimeEl.innerText = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }

      // Sincroniza badge de Fase Atual e trava os campos da operação registrada
      this.updatePhaseBadge(op);
      this.updateFormState();
      this.updateStandardApprovalBox(saved);

      this.showInlineProgress(`Operação #${saved.numero} registrada e oficializada com sucesso!`, 100, true);

      if (options && options.autoPrintAfter) {
        try {
          if (options.autoPrintAfter === 'os') {
            this.printTechnicalWorkOrder(saved.id, { includeImages: true });
          } else if (options.autoPrintAfter === 'recibo') {
            this.printReceipt();
          } else {
            this.printOrder(options.autoPrintAfter);
          }
        } catch (printErr) {
          console.warn('[GRAFSIS] Falha ao disparar impressão automática:', printErr);
          if (window.grafsisAlert) {
            window.grafsisAlert(`Operação #${saved.numero} registrada e gravada com sucesso no sistema!\n\n(Aviso: permita pop-ups no navegador para abrir a impressão automaticamente).`, 'GrafSiS');
          }
        }
      } else {
        if (window.grafsisAlert) {
          window.grafsisAlert(`Operação #${saved.numero} registrada e gravada com sucesso no sistema!`, 'GrafSiS');
        }
      }
    } catch (err) {
      console.error('[GRAFSIS] Erro ao salvar operação:', err);
      alert('Erro ao gravar operação no sistema: ' + (err.message || err));
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText || `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Registrar Operação`;
      }
    }
  },
  editModal(id) { this.openModal({ orderId: id }); },
  renderOrderForm(params = {}) { return this.openModal(params); },

  // MÉTODOS DE CONTROLE E LIBERAÇÃO DE O.S. POR ITEM (IMAGEM 1 & 2)
  toggleItemOs(idx, checked) {
    if (!this.activeItems || !this.activeItems[idx]) return;
    this.activeItems[idx].liberado_os = !!checked;
    this.updateOsStatusInfo();
  },

  toggleAllItemsOs(checked) {
    if (!this.activeItems || this.activeItems.length === 0) return;
    this.activeItems.forEach(it => {
      it.liberado_os = !!checked;
    });
    const tbody = document.getElementById('order-items-tbody');
    if (tbody) tbody.innerHTML = this.renderActiveItemsHtml();
    this.updateOsStatusInfo();
  },

  isolateItemForOs(targetIdx) {
    if (!this.activeItems || !this.activeItems[targetIdx]) return;
    this.activeItems.forEach((it, idx) => {
      it.liberado_os = (idx === targetIdx);
    });
    const item = this.activeItems[targetIdx];
    const filterInput = document.getElementById('filter-item-code-os');
    if (filterInput) filterInput.value = '#' + (item.item_id || '');
    const tbody = document.getElementById('order-items-tbody');
    if (tbody) tbody.innerHTML = this.renderActiveItemsHtml();
    this.updateOsStatusInfo();
  },

  isolateTypedItemOs() {
    const filterInput = document.getElementById('filter-item-code-os');
    if (!filterInput) return;
    const val = String(filterInput.value || '').replace('#', '').trim().toLowerCase();
    if (!val) {
      alert('Digite o código do item (ex: #26000801 ou 01) para isolá-lo.');
      return;
    }
    const foundIdx = this.activeItems.findIndex(it => {
      const code = String(it.item_id || '').toLowerCase();
      return code === val || code.endsWith(val) || code.includes(val);
    });
    if (foundIdx === -1) {
      alert(`Item com código '${val}' não encontrado na lista atual deste pedido.`);
      return;
    }
    this.isolateItemForOs(foundIdx);
  },

  resetItemsOsFilter() {
    const filterInput = document.getElementById('filter-item-code-os');
    if (filterInput) filterInput.value = '';
    const checkAll = document.getElementById('check-all-os');
    if (checkAll) checkAll.checked = true;
    this.toggleAllItemsOs(true);
  },

  updateOsStatusInfo() {
    if (!this.activeItems) return;
    const total = this.activeItems.length;
    const liberados = this.activeItems.filter(it => it.liberado_os !== false).length;
    const retidos = total - liberados;

    const checkAll = document.getElementById('check-all-os');
    if (checkAll) {
      checkAll.checked = (total > 0 && liberados === total);
      checkAll.indeterminate = (liberados > 0 && liberados < total);
    }

    const infoEl = document.getElementById('os-items-status-info');
    if (infoEl) {
      if (total === 0) {
        infoEl.innerHTML = `<span class="text-slate-400">Nenhum item adicionado</span>`;
      } else if (liberados === total) {
        infoEl.innerHTML = `<span class="text-emerald-600 font-bold">● Todos os ${total} item(ns) liberados para O.S.</span>`;
      } else if (liberados === 0) {
        infoEl.innerHTML = `<span class="text-rose-600 font-bold">⛔ Nenhum item liberado para O.S. (O.S. pausada)</span>`;
      } else {
        infoEl.innerHTML = `<span class="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">⚠️ ${liberados} de ${total} liberado(s) • ${retidos} aguardando liberação</span>`;
      }
    }
  },

  async handleEditAction(orderId) {
    const orders = (window.store && window.store.getOrders()) || [];
    const activeDisplayId = document.getElementById('current-display-id')?.value || '';
    const targetOrderId = orderId || this.currentEditingOrderId;
    const order = (targetOrderId && orders.find(o => String(o.id) === String(targetOrderId) || String(o.numero) === String(targetOrderId))) ||
                  (activeDisplayId && orders.find(o => String(o.numero) === String(activeDisplayId)));

    const isSaved = !!order;
    const isRegistered = this.isOrderRegistered || (order && (order.status_registro === 'registrado' || order.registrado === true || order.registrado === 'sim'));
    const op = (order?.tipo_operacao || order?.tipo || document.querySelector('select[name="tipo_operacao"]')?.value || 'venda').toLowerCase();
    const isApprovedOrAdvanced = isSaved && (!!order.data_aceite || !!order.aprovado_cliente || (order.status_fase !== 'orcamento' && order.status_fase !== 'prevenda'));

    // Regra Imagem 4: antes de registrar, sempre que for preciso editar algum registro clique no botão 'Editar Registro',
    // mas depois que a operação estiver registrada, esta ação de edição, somente pode acontecer se o perfil for 'gerente', envie um aviso com essa regra.
    if (isRegistered) {
      const user = window.authModule ? window.authModule.getCurrentUser() : null;
      const userRole = user ? (user.tipo || user.perfil || user.role || '').toUpperCase() : '';
      const isGerente = ['GERENTE', 'PROPRIETARIO', 'ADMIN'].includes(userRole);

      if (!isGerente) {
        const avisoRegra = 'Acesso Restrito: Esta operação já está registrada no sistema. Conforme as normas de controle operacional, a edição de registros após o registro oficial é permitida exclusivamente para o perfil de Gerente.';
        if (window.grafsisAlert) {
          await window.grafsisAlert(avisoRegra, 'GRAFSIS');
        } else {
          alert(avisoRegra);
        }
        return;
      }
    }

    if (isSaved) {
      this.currentEditingOrderId = order.id;
    }

    // Ativa o modo de edição no formulário
    this.isEditingActive = true;
    this.isReadOnlyFinancial = false;
    this.isOrderLockedByApproval = false;

    // Atualiza a chave toggle para ON se presente
    const toggle = document.getElementById('toggle-gerente-edicao');
    if (toggle) toggle.checked = true;
    const label = document.getElementById('label-gerente-toggle');
    if (label) {
      label.innerText = 'ON';
      label.className = 'ml-1.5 text-[10px] font-black text-emerald-700 uppercase';
    }

    // Registra ocorrência de auditoria no Livro de Ocorrências se o pedido já estava finalizado ou aprovado
    if (isApprovedOrAdvanced && window.store && typeof window.store.logOccurrence === 'function') {
      try {
        await window.store.logOccurrence({
          tipo: 'REABERTURA_GERENTE',
          pedido_id: order.id,
          pedido_numero: order.numero,
          descricao: `Reabertura de operação #${order.numero} autorizado pelo perfil ${userRole} (${user?.nome || 'Operador'}) para alteração de dados/itens.`,
          detalhes: {
            fase_anterior: order.status_fase,
            tipo_operacao: op,
            aprovado_cliente: !!order.aprovado_cliente,
            data_reabertura: new Date().toISOString()
          }
        });
      } catch (logErr) {
        console.warn('[handleEditAction] Falha ao registrar log de ocorrência:', logErr);
      }
    }

    // Atualiza o estado da tela liberando os campos e atualizando os botões
    this.updateFormState();
    const tbody = document.getElementById('order-items-tbody');
    if (tbody) tbody.innerHTML = this.renderActiveItemsHtml();

    const clientSel = document.getElementById('order-cliente-select') || document.querySelector('select[name="cliente_id"]');
    const prodSel = document.getElementById('item-prod-select');
    if (prodSel) prodSel.focus();
    else if (clientSel) clientSel.focus();

    // Feedback visual do modo de edição
    const badge = document.createElement('div');
    badge.className = 'fixed bottom-4 right-4 z-50 bg-amber-500 text-amber-950 font-black px-4 py-2.5 rounded-xl shadow-xl border-2 border-amber-600 animate-bounce text-sm flex items-center gap-2';
    badge.innerHTML = `<span>✏️ Modo de Edição Ativado: Operação #${order?.numero || activeDisplayId || ''} liberada para alterações!</span>`;
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 3500);
  },

  handleGerenteToggle(checked) {
    const user = window.authModule ? window.authModule.getCurrentUser() : null;
    const userRole = user ? (user.tipo || user.perfil || user.role || '').toUpperCase() : '';
    const isManagerOrOwner = ['GERENTE', 'PROPRIETARIO', 'ADMIN'].includes(userRole);

    if (checked && !isManagerOrOwner) {
      alert('Acesso Restrito: Apenas usuários com perfil Gerente ou Proprietário podem ativar a chave de edição desta operação.');
      const toggle = document.getElementById('toggle-gerente-edicao');
      if (toggle) toggle.checked = false;
      const label = document.getElementById('label-gerente-toggle');
      if (label) {
        label.innerText = 'OFF';
        label.className = 'ml-1.5 text-[10px] font-black text-slate-700 uppercase';
      }
      return;
    }

    this.isEditingActive = checked;
    this.isReadOnlyFinancial = !checked;
    this.isOrderLockedByApproval = !checked;

    const label = document.getElementById('label-gerente-toggle');
    if (label) {
      label.innerText = checked ? 'ON' : 'OFF';
      label.className = checked ? 'ml-1.5 text-[10px] font-black text-emerald-700 uppercase' : 'ml-1.5 text-[10px] font-black text-slate-700 uppercase';
    }

    this.updateFormState();
    const tbody = document.getElementById('order-items-tbody');
    if (tbody) tbody.innerHTML = this.renderActiveItemsHtml();

    if (checked) {
      const badge = document.createElement('div');
      badge.className = 'fixed bottom-4 right-4 z-50 bg-emerald-600 text-white font-black px-4 py-2.5 rounded-xl shadow-xl border-2 border-emerald-400 text-sm flex items-center gap-2 animate-bounce';
      badge.innerHTML = `<span>🔓 Chave de Edição Ativada: Operação liberada pelo Gerente!</span>`;
      document.body.appendChild(badge);
      setTimeout(() => badge.remove(), 3500);
    }
  },

  async handleCancelEdit() {
    if (!this.isEditingActive) {
      this.render();
      return;
    }
    const cancelar = await window.grafsisConfirm({
      title: 'GRAFSIS',
      message: 'Deseja cancelar a edição da operação e restaurar os dados originais?',
      confirmText: 'Sim, Cancelar',
      cancelText: 'Continuar Editando'
    });
    if (cancelar) {
      this.isEditingActive = false;
      this.isReadOnlyFinancial = true;
      const toggle = document.getElementById('toggle-gerente-edicao');
      if (toggle) toggle.checked = false;
      const label = document.getElementById('label-gerente-toggle');
      if (label) {
        label.innerText = 'OFF';
        label.className = 'ml-1.5 text-[10px] font-black text-slate-700 uppercase';
      }
      if (this.currentEditingOrderId) {
        this.openModal({ orderId: this.currentEditingOrderId });
      } else {
        this.render();
      }
    }
  },
  quickView(orderId) {
    if (window.authModule && !window.authModule.can('canViewSaleValues')) {
      // Perfil de Oficina/Produção: abre exclusivamente a Ordem Técnica de Produção (Sem valores R$)
      this.openProductionWorkOrder(orderId);
      return;
    }
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Desconhecido' };
    
    const phaseNames = {
      'orcamento': 'Orçamento',
      'prevenda': 'Pré-Venda',
      'aprovacao': 'Aprovação',
      'liberado': 'Liberação',
      'producao': 'Produção',
      'acabamento': 'Acabamento',
      'embalagem': 'Expedição',
      'entregue': 'Entrega'
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
  },
  async delete(id) {
    const userRole = window.authModule ? (window.authModule.getCurrentUser().tipo || window.authModule.getCurrentUser().perfil || window.authModule.getCurrentUser().role || '').toUpperCase() : '';
    const isManagerOrOwner = ['GERENTE', 'PROPRIETARIO', 'ADMIN'].includes(userRole);
    if (!isManagerOrOwner) {
      await window.grafsisAlert('Acesso Negado: Apenas usuários com perfil Gerente ou Proprietário têm permissão para excluir pedidos registrados.', 'GRAFSIS');
      return;
    }
    const confirmar = await window.grafsisConfirm({
      title: 'GRAFSIS',
      message: 'Deseja realmente excluir este pedido do sistema?',
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar'
    });
    if (confirmar) {
      window.store.deleteOrder(id);
      this.render();
    }
  },
  sendWhatsAppOrder(orderId, customType = 'geral') {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Cliente', telefone_whatsapp: '' };
    if (!client.telefone_whatsapp) { alert('Cliente sem número de WhatsApp cadastrado!'); return; }
    
    const tenant = window.store.getActiveTenant ? window.store.getActiveTenant() : {};
    const companyName = tenant.razao_social || 'GRAFSIS';
    const totalFmt = 'R$ ' + Number(order.valor_final || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const entradaFmt = 'R$ ' + Number(order.valor_entrada || order.valor_recebido || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const saldo = Math.max(0, (order.valor_final || 0) - (order.valor_entrada || order.valor_recebido || 0));
    const saldoFmt = 'R$ ' + saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const pixChave = tenant.chave_pix || tenant.cnpj || tenant.celular_whatsapp || 'Consulte no balcão';

    let msg = '';
    if (customType === 'fase') {
      const faseNome = (order.status_fase || 'Produção').toUpperCase();
      msg = `*${companyName}* - Atualização do Pedido #${order.numero}%0A%0A`;
      msg += `Olá *${client.nome}*, seu pedido avançou no nosso fluxo!%0A`;
      msg += `📌 *Fase Atual:* ${faseNome}%0A`;
      if (order.previsao_entrega) msg += `📅 *Previsão de Entrega:* ${new Date(order.previsao_entrega + 'T12:00:00').toLocaleDateString('pt-BR')}%0A`;
      msg += `%0AAgradecemos a preferência! Qualquer dúvida estamos à disposição.`;
    } else if (customType === 'cobranca_pix') {
      msg = `*${companyName}* - Cobrança / Pagamento Pedido #${order.numero}%0A%0A`;
      msg += `Olá *${client.nome}*, segue o resumo financeiro do seu pedido:%0A`;
      msg += `💰 *Valor Total:* ${totalFmt}%0A`;
      msg += `💵 *Entrada Paga:* ${entradaFmt}%0A`;
      msg += `⚠️ *Saldo a Pagar:* ${saldoFmt}%0A%0A`;
      msg += `🔑 *Chave PIX:* ${pixChave}%0A`;
      msg += `Por favor, envie o comprovante para confirmação.`;
    } else if (customType === 'retirada') {
      msg = `*${companyName}* - Pedido Pronto para Retirada! 🎉%0A%0A`;
      msg += `Olá *${client.nome}*, excelente notícia! Seu Pedido #${order.numero} está 100% finalizado e pronto para retirada ou entrega.%0A`;
      if (saldo > 0) msg += `💰 *Saldo pendente no ato da entrega:* ${saldoFmt}%0A`;
      msg += `%0ANosso endereço: ${tenant.endereco || 'Consulte nosso atendimento'}.%0AEsperamos por você!`;
    } else {
      msg = `*${companyName} - Pedido #${order.numero}*%0AOlá *${client.nome}*!%0A`;
      (order.itens || []).forEach((it, i) => {
        msg += `${i+1}. ${it.descricao} | R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%0A`;
      });
      msg += `%0A*Total: ${totalFmt}*%0A`;
      if (saldo > 0) msg += `*Saldo a Pagar: ${saldoFmt}*%0A`;
    }

    const phone = client.telefone_whatsapp.replace(/\D/g, '');
    window.open('https://wa.me/55' + phone + '?text=' + msg, '_blank');
  },

  sendEmailOrder(orderId, customType = 'geral') {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Cliente', email: '' };
    if (!client.email) { alert('Cliente sem e-mail cadastrado!'); return; }

    const tenant = window.store.getActiveTenant ? window.store.getActiveTenant() : {};
    const companyName = tenant.razao_social || 'GRAFSIS';
    const totalFmt = 'R$ ' + Number(order.valor_final || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const saldo = Math.max(0, (order.valor_final || 0) - (order.valor_entrada || order.valor_recebido || 0));
    const saldoFmt = 'R$ ' + saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    let subject = `${companyName} - Pedido #${order.numero}`;
    let body = `Olá ${client.nome},\n\n`;
    if (customType === 'fase') {
      subject = `${companyName} - Atualização de Status: Pedido #${order.numero}`;
      body += `Seu pedido está atualmente na fase: ${(order.status_fase || 'Produção').toUpperCase()}.\n`;
      if (order.previsao_entrega) body += `Previsão de Entrega: ${new Date(order.previsao_entrega + 'T12:00:00').toLocaleDateString('pt-BR')}\n`;
    } else if (customType === 'cobranca_pix') {
      subject = `${companyName} - Dados para Pagamento: Pedido #${order.numero}`;
      body += `Valor Total: ${totalFmt}\nSaldo a Pagar: ${saldoFmt}\nChave PIX: ${tenant.chave_pix || tenant.cnpj || 'Consulte nosso balcão'}\n`;
    } else if (customType === 'retirada') {
      subject = `${companyName} - Seu Pedido #${order.numero} está Pronto para Retirada!`;
      body += `Seu material já foi inspecionado e embalado, pronto para retirada.\nEndereço: ${tenant.endereco || ''}\n`;
    } else {
      body += `Segue o resumo do seu Pedido #${order.numero}:\nTotal: ${totalFmt}\n`;
    }
    body += `\nAtenciosamente,\n${companyName}`;

    window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },
  generateLocalizador() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    // Regra: exatamente 5 caracteres com (3 letras + 2 números) OU (2 letras + 3 números) em qualquer posição
    const numLetters = Math.random() < 0.5 ? 3 : 2;
    const numDigits = 5 - numLetters;
    const pool = [];
    for (let i = 0; i < numLetters; i++) {
      pool.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }
    for (let i = 0; i < numDigits; i++) {
      pool.push(digits.charAt(Math.floor(Math.random() * digits.length)));
    }
    // Embaralha as posições aleatoriamente
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.join('');
  },

  openProtocolModal(orderId) {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: order.cliente_nome || 'Consumidor', telefone_whatsapp: '' };
    const tenant = window.store.getActiveTenant ? window.store.getActiveTenant() : {};
    const localizador = this.generateLocalizador();
    const currentUser = window.authModule ? (window.authModule.getCurrentUser().nome || window.authModule.getCurrentUser().login) : 'Expedição';
    const nowStr = new Date().toLocaleString('pt-BR');

    const modalHtml = `
      <div id="protocol-modal-wrap" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[94vh] flex flex-col" id="modal-protocolo">
          
          <!-- Cabeçalho do Protocolo -->
          <div class="border-b-2 border-slate-900 dark:border-slate-700 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black tracking-wider uppercase">EXPEDIÇÃO & ENTREGA</span>
                <span class="font-mono text-xl sm:text-2xl font-black text-blue-600 dark:text-cyan-400">#${order.numero}</span>
              </div>
              <h1 class="text-base font-black text-slate-900 dark:text-white mt-1">Protocolo Oficial de Entrega de Materiais</h1>
              <p class="text-xs text-slate-500 dark:text-slate-400">${tenant.razao_social || tenant.nome_fantasia || 'GRAFSIS'} &bull; Gestão de Retiradas e Balcão</p>
            </div>
            <div class="text-left sm:text-right flex flex-col sm:items-end">
              <span class="px-3.5 py-1.5 bg-slate-900 text-yellow-300 dark:bg-yellow-400 dark:text-slate-950 font-mono text-sm rounded-xl font-black tracking-widest shadow-md">
                LOCALIZADOR: ${localizador}
              </span>
              <p class="text-[11px] text-slate-400 font-mono mt-1">Data/Hora: ${nowStr}</p>
            </div>
          </div>

          <!-- Corpo Rolável -->
          <div class="overflow-y-auto flex-1 py-4 space-y-4">
            
            <!-- Dados do Cliente e Retirada -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Cliente / Empresa:</span>
                <strong class="text-sm text-slate-900 dark:text-white">${client.nome}</strong>
                <p class="text-slate-500 mt-0.5">${client.telefone_whatsapp || 'Sem telefone registrado'}</p>
                <p class="text-slate-500">${client.endereco || 'Retirada no Balcão'}</p>
              </div>
              <div class="space-y-1.5">
                <div>
                  <label class="block text-[10px] font-black uppercase text-slate-500">Nome de quem está retirando *</label>
                  <input type="text" id="prot-nome-rec" value="${order.protocolo_recebedor_nome || client.nome || ''}" placeholder="Nome legível do portador" class="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-[10px] font-black uppercase text-slate-500">Telefone / Contato</label>
                    <input type="text" id="prot-tel-rec" value="${order.protocolo_recebedor_tel || client.telefone_whatsapp || ''}" placeholder="(XX) XXXXX-XXXX" class="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  </div>
                  <div>
                    <label class="block text-[10px] font-black uppercase text-slate-500">Quem autorizou</label>
                    <input type="text" id="prot-autorizador" value="${currentUser}" placeholder="Responsável" class="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  </div>
                </div>
              </div>
            </div>

            <!-- Imagem e Layout Aprovado -->
            ${order.foto_arte_url ? `
              <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                <div class="w-28 h-24 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
                  <img src="${order.foto_arte_url}" class="w-full h-full object-cover" alt="Layout">
                </div>
                <div class="text-xs">
                  <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Layout Aprovado</span>
                  <p class="font-bold text-slate-800 dark:text-slate-200 mt-1">Conferência Visual da Arte e Especificação</p>
                  <p class="text-slate-500 text-[11px] mt-0.5">Certifique-se de que os materiais físicos conferem exatamente com a prova virtual acima aprovada.</p>
                </div>
              </div>
            ` : ''}

            <!-- Tabela de Controle de Entregas Parciais / Totais -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  📦 Itens do Pedido & Quantidades para Liberação
                </h3>
                <span class="text-[11px] text-slate-500">Digite a quantidade sendo entregue no momento</span>
              </div>
              <div class="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th class="p-2.5"># Item</th>
                      <th class="p-2.5">Descrição</th>
                      <th class="p-2.5 text-center">Total Pedido</th>
                      <th class="p-2.5 text-center">Já Entregue</th>
                      <th class="p-2.5 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">Entregando Agora</th>
                      <th class="p-2.5 text-center">Saldo Faltante</th>
                      <th class="p-2.5 text-center">Gestão</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    ${(order.itens || []).map((it, idx) => {
                      const totalQtd = Number(it.quantidade || 1);
                      const jaEntregue = Number(it.qtd_entregue || 0);
                      const cancelada = Number(it.qtd_cancelada || 0);
                      const saldo = Math.max(0, totalQtd - jaEntregue - cancelada);
                      const itemCode = it.item_id || (String(order.numero) + String(idx + 1).padStart(2, '0'));

                      return `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td class="p-2.5 font-mono font-black text-blue-600 dark:text-cyan-400">#${itemCode}</td>
                          <td class="p-2.5">
                            <strong class="text-slate-900 dark:text-white block">${it.produto_nome || it.descricao}</strong>
                            <span class="text-[11px] text-slate-500">${it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` : ''} ${it.acabamento ? '• ' + it.acabamento : ''}</span>
                            ${cancelada > 0 ? `<span class="block text-[10px] text-red-600 font-bold mt-0.5">⚠️ ${cancelada} item(ns) cancelado(s) por gestão: ${it.motivo_cancelamento_saldo || 'Encerramento'}</span>` : ''}
                          </td>
                          <td class="p-2.5 text-center font-bold font-mono text-slate-800 dark:text-slate-200">${totalQtd}</td>
                          <td class="p-2.5 text-center font-bold font-mono text-slate-500">${jaEntregue}</td>
                          <td class="p-2.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20">
                            <input 
                              type="number" 
                              id="prot-item-qtd-${idx}" 
                              min="0" 
                              max="${saldo}" 
                              value="${saldo}" 
                              oninput="salesModule.updateDeliveryBalance(${idx}, ${totalQtd}, ${jaEntregue}, ${cancelada})" 
                              class="w-16 px-2 py-1 text-center font-black text-sm border-2 border-emerald-400 dark:border-emerald-600 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          </td>
                          <td class="p-2.5 text-center">
                            <span id="prot-saldo-span-${idx}" class="font-black font-mono text-xs text-emerald-600">0</span>
                          </td>
                          <td class="p-2.5 text-center">
                            ${saldo > 0 ? `
                              <button 
                                type="button" 
                                onclick="salesModule.cancelPendingItemBalance('${order.id}', ${idx})" 
                                class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer" 
                                title="Encerrar/cancelar saldo restante deste item com justificativa">
                                🚫 Cancelar Saldo
                              </button>
                            ` : `<span class="text-[10px] font-bold text-emerald-600">OK</span>`}
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Termo de Declaração de Recebimento -->
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <p class="font-medium text-slate-700 dark:text-slate-300">
                Declaro para os devidos fins que recebi os materiais e serviços acima especificados em perfeito estado de conservação, acabamento e conformidade técnica.
              </p>
              ${window.store.getSettings().companyFooterMsg ? `<p class="text-[10px] text-slate-400 italic">${window.store.getSettings().companyFooterMsg}</p>` : ''}
            </div>
          </div>

          <!-- Rodapé de Ações do Protocolo -->
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button onclick="document.getElementById('protocol-modal-wrap').remove()" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
              Fechar
            </button>
            <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto justify-end">
              <button 
                type="button" 
                onclick="salesModule.sendDeliveryWhatsApp('${order.id}', '${localizador}')" 
                class="px-3.5 py-2 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer">
                <span>📱 Enviar WhatsApp</span>
              </button>
              <button 
                type="button" 
                onclick="salesModule.printDeliveryProtocol('${order.id}', '${localizador}')" 
                class="px-3.5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                <span>🖨️ Imprimir Protocolo A4</span>
              </button>
              <button 
                type="button" 
                onclick="salesModule.confirmDelivery('${order.id}', '${localizador}')" 
                class="px-4 py-2 text-xs bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer">
                <span>✅ Confirmar Retirada</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  updateDeliveryBalance(idx, total, entregue, cancelado) {
    const input = document.getElementById(`prot-item-qtd-${idx}`);
    const span = document.getElementById(`prot-saldo-span-${idx}`);
    if (!input || !span) return;
    const maxSaldo = Math.max(0, total - entregue - cancelado);
    let val = parseFloat(input.value) || 0;
    if (val < 0) { val = 0; input.value = 0; }
    if (val > maxSaldo) { val = maxSaldo; input.value = maxSaldo; }
    const restante = Math.max(0, maxSaldo - val);
    span.textContent = restante;
    if (restante > 0) {
      span.className = 'font-bold text-amber-600 font-mono';
    } else {
      span.className = 'font-bold text-emerald-600 font-mono';
    }
  },

  cancelPendingItemBalance(orderId, itemIdx) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.itens || !order.itens[itemIdx]) return;
    const it = order.itens[itemIdx];
    const totalQtd = Number(it.quantidade || 1);
    const jaEntregue = Number(it.qtd_entregue || 0);
    const cancelado = Number(it.qtd_cancelada || 0);
    const saldo = Math.max(0, totalQtd - jaEntregue - cancelado);
    if (saldo <= 0) {
      alert('Não há saldo pendente para este item.');
      return;
    }

    const motivo = prompt(
      `GESTÃO DE SALDO PENDENTE\n\nItem: ${it.descricao || it.produto_nome}\nSaldo Faltante: ${saldo} item(ns)\n\nInforme a justificativa administrativa para o encerramento/cancelamento deste saldo restante:`
    );
    if (!motivo || !motivo.trim()) return;

    it.qtd_cancelada = cancelado + saldo;
    it.motivo_cancelamento_saldo = motivo.trim();
    order.historico = order.historico || [];
    order.historico.push({
      fase: order.status_fase,
      data: new Date().toISOString(),
      usuario: `${window.authModule?.getCurrentUser()?.nome || 'Gestor'}: Saldo Cancelado (${saldo} un) - Motivo: ${motivo.trim()}`
    });

    const isAllComplete = order.itens.every(i => ((Number(i.qtd_entregue) || 0) + (Number(i.qtd_cancelada) || 0)) >= (Number(i.quantidade) || 1));
    if (isAllComplete) {
      order.status_fase = 'entregue';
      order.data_entrega = new Date().toISOString();
    }

    window.store.save('grafsis_orders', orders);
    alert(`Saldo de ${saldo} item(ns) cancelado com sucesso com registro em histórico.`);
    document.getElementById('protocol-modal-wrap')?.remove();
    this.openProtocolModal(orderId);
  },

  sendDeliveryWhatsApp(orderId, localizador) {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Cliente', telefone_whatsapp: '' };
    const tel = document.getElementById('prot-tel-rec')?.value || client.telefone_whatsapp || '';
    if (!tel) { alert('Informe o telefone para envio via WhatsApp!'); return; }
    const nomeRec = document.getElementById('prot-nome-rec')?.value || client.nome;
    const autorizador = document.getElementById('prot-autorizador')?.value || 'Expedição';
    const tenant = window.store.getActiveTenant ? window.store.getActiveTenant() : {};
    const companyName = tenant.razao_social || tenant.nome_fantasia || 'GRAFSIS';

    let itensText = '';
    (order.itens || []).forEach((it, idx) => {
      const input = document.getElementById(`prot-item-qtd-${idx}`);
      const qtdAgora = input ? input.value : it.quantidade;
      itensText += `• ${it.descricao || it.produto_nome}: ${qtdAgora} un.%0A`;
    });

    const msg = `*${companyName}* - Protocolo de Entrega%0A%0A` +
      `📦 *PEDIDO #${order.numero}*%0A` +
      `🔑 *LOCALIZADOR: ${localizador}*%0A%0A` +
      `👤 *Retirado por:* ${nomeRec}%0A` +
      `👔 *Autorizado por:* ${autorizador}%0A` +
      `📅 *Data/Hora:* ${new Date().toLocaleString('pt-BR')}%0A%0A` +
      `*Materiais Entregues:*%0A${itensText}%0A` +
      `Declaro que conferi e recebi os materiais em perfeito estado.`;

    const cleanTel = tel.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?phone=55${cleanTel}&text=${msg}`;
    window.open(url, '_blank');
  },

  printDeliveryProtocol(orderId, localizador) {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Consumidor' };
    const tenant = window.store.getActiveTenant ? window.store.getActiveTenant() : {};
    const nomeRec = document.getElementById('prot-nome-rec')?.value || client.nome;
    const telRec = document.getElementById('prot-tel-rec')?.value || client.telefone_whatsapp || '';
    const autorizador = document.getElementById('prot-autorizador')?.value || 'Expedição';

    const printArea = document.createElement('div');
    printArea.id = 'print-delivery-area';
    printArea.className = 'fixed inset-0 z-[9999] bg-white p-8 overflow-y-auto text-slate-900';
    printArea.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-black">${tenant.razao_social || tenant.nome_fantasia || 'GRAFSIS'}</h1>
            <p class="text-xs uppercase text-slate-600 font-bold">Comprovante / Protocolo de Entrega de Materiais</p>
            <p class="text-xs text-slate-500">${tenant.endereco || ''} • ${tenant.celular_whatsapp || ''}</p>
          </div>
          <div class="text-right">
            <div class="inline-block bg-slate-900 text-white font-mono text-base px-3 py-1 rounded font-black tracking-widest">
              LOCALIZADOR: ${localizador}
            </div>
            <div class="text-xs font-bold text-slate-700 mt-1">Pedido #${order.numero}</div>
            <div class="text-xs text-slate-500">Emissão: ${new Date().toLocaleString('pt-BR')}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 p-3 bg-slate-50 border rounded-lg text-xs">
          <div>
            <strong class="text-slate-500 uppercase block text-[10px]">Cliente / Solicitante:</strong>
            <p class="font-bold text-sm">${client.nome}</p>
            <p>${client.telefone_whatsapp || ''}</p>
            <p>${client.endereco || ''}</p>
          </div>
          <div>
            <strong class="text-slate-500 uppercase block text-[10px]">Dados da Retirada:</strong>
            <p><strong>Retirado por:</strong> ${nomeRec}</p>
            <p><strong>Telefone:</strong> ${telRec || 'Não informado'}</p>
            <p><strong>Autorizado por:</strong> ${autorizador}</p>
          </div>
        </div>

        ${order.foto_arte_url ? `
          <div class="text-center p-2 border rounded-lg bg-slate-50">
            <span class="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Layout Técnico de Referência</span>
            <img src="${order.foto_arte_url}" class="max-h-36 mx-auto object-contain rounded" alt="Layout">
          </div>
        ` : ''}

        <div>
          <table class="w-full text-xs text-left border rounded overflow-hidden">
            <thead class="bg-slate-100 text-[10px] uppercase font-bold text-slate-700">
              <tr>
                <th class="p-2.5 border-b"># Item</th>
                <th class="p-2.5 border-b">Descrição / Material</th>
                <th class="p-2.5 border-b">Medidas</th>
                <th class="p-2.5 border-b text-center">Qtd Pedido</th>
                <th class="p-2.5 border-b text-center">Qtd Entregue</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${(order.itens || []).map((it, idx) => {
                const qtdAgora = document.getElementById(`prot-item-qtd-${idx}`)?.value || it.quantidade;
                return `
                  <tr>
                    <td class="p-2.5 font-mono font-bold">#${it.item_id || idx + 1}</td>
                    <td class="p-2.5 font-bold">${it.descricao || it.produto_nome}</td>
                    <td class="p-2.5 font-mono">${it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` : '-'}</td>
                    <td class="p-2.5 text-center">${it.quantidade}</td>
                    <td class="p-2.5 text-center font-bold font-mono text-sm">${qtdAgora}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="pt-4 text-xs space-y-2">
          <p class="font-medium">
            Declaro para os devidos fins que conferi e recebi os materiais e serviços acima relacionados em perfeito estado de acabamento e conformidade técnica.
          </p>
        </div>

        <div class="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div class="border-t border-slate-400 w-5/6 mx-auto"></div>
            <p class="font-bold mt-1">${nomeRec}</p>
            <p class="text-slate-500 text-[10px]">Assinatura de Quem Retirou</p>
          </div>
          <div>
            <div class="border-t border-slate-400 w-5/6 mx-auto"></div>
            <p class="font-bold mt-1">${autorizador}</p>
            <p class="text-slate-500 text-[10px]">Assinatura do Responsável pela Liberação</p>
          </div>
        </div>

        <div class="pt-8 text-center no-print">
          <button onclick="document.getElementById('print-delivery-area').remove()" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold mr-2">Fechar Impressão</button>
          <button onclick="window.print()" class="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow">Imprimir Agora</button>
        </div>
      </div>
    `;

    document.body.appendChild(printArea);
    window.print();
  },

  confirmDelivery(orderId, localizador) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const nomeRec = document.getElementById('prot-nome-rec')?.value.trim();
    if (!nomeRec) {
      alert('Por favor, informe o nome da pessoa que está retirando os materiais.');
      document.getElementById('prot-nome-rec')?.focus();
      return;
    }
    const telRec = document.getElementById('prot-tel-rec')?.value.trim() || '';
    const autorizador = document.getElementById('prot-autorizador')?.value.trim() || 'Expedição';

    let totalEntregueNestaSessao = 0;
    (order.itens || []).forEach((it, idx) => {
      const input = document.getElementById(`prot-item-qtd-${idx}`);
      const qtdAgora = input ? (parseFloat(input.value) || 0) : (parseFloat(it.quantidade) || 0);
      it.qtd_entregue = (parseFloat(it.qtd_entregue) || 0) + qtdAgora;
      totalEntregueNestaSessao += qtdAgora;
    });

    if (totalEntregueNestaSessao <= 0) {
      alert('Atenção: A quantidade total a entregar nesta retirada deve ser maior que zero.');
      return;
    }

    const is100Percent = order.itens.every(it => {
      const entregue = parseFloat(it.qtd_entregue) || 0;
      const cancelada = parseFloat(it.qtd_cancelada) || 0;
      const total = parseFloat(it.quantidade) || 1;
      return (entregue + cancelada) >= total;
    });

    order.entregas = order.entregas || [];
    order.entregas.push({
      localizador: localizador,
      data: new Date().toISOString(),
      retirado_por: nomeRec,
      telefone: telRec,
      autorizado_por: autorizador,
      tipo: is100Percent ? 'TOTAL (100%)' : 'PARCIAL'
    });

    order.ultimo_localizador = localizador;
    order.protocolo_recebedor_nome = nomeRec;
    order.protocolo_recebedor_tel = telRec;
    order.protocolo_autorizado_por = autorizador;

    if (is100Percent) {
      order.status_fase = 'entregue';
      order.data_entrega = new Date().toISOString();
      order.historico = order.historico || [];
      order.historico.push({
        fase: 'entregue',
        data: new Date().toISOString(),
        usuario: `${autorizador} (Entrega 100% concluída - Loc: ${localizador})`
      });
    } else {
      order.historico = order.historico || [];
      order.historico.push({
        fase: order.status_fase || 'embalagem',
        data: new Date().toISOString(),
        usuario: `${autorizador} (Entrega Parcial - Loc: ${localizador})`
      });
    }

    window.store.save('grafsis_orders', orders);
    if (typeof window.store.pushRecord === 'function' && window.store.supabaseClient) {
      window.store.pushRecord('pedidos', order).catch(() => {});
    }

    alert(
      is100Percent 
        ? `✅ ENTREGA 100% CONCLUÍDA!\n\nPedido #${order.numero} finalizado com sucesso.\nLocalizador: ${localizador}\nRetirado por: ${nomeRec}`
        : `📦 ENTREGA PARCIAL REGISTRADA!\n\nRetirada de materiais gravada com sucesso.\nLocalizador: ${localizador}\nO pedido permanece aguardando a entrega dos itens pendentes.`
    );

    document.getElementById('protocol-modal-wrap')?.remove();
    this.render();
  },

  copyClientApprovalLink(orderId) {
    const order = window.store.getOrders().find(o => o.id === orderId || String(o.numero) === String(orderId));
    if (!order) return;
    const link = `${window.location.origin}${window.location.pathname}#aprovacao?id=${order.id || order.numero}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        alert(`Link de aprovação copiado com sucesso!\n\n${link}\n\nEnvie este link para o cliente no WhatsApp para que ele possa aprovar o layout sem necessidade de login ou senha.`);
      }).catch(() => {
        prompt('Copie o link abaixo para enviar ao cliente:', link);
      });
    } else {
      prompt('Copie o link abaixo para enviar ao cliente:', link);
    }
  },

  copyStandardApprovalLink() {
    const input = document.getElementById('padrao-approval-link-input');
    const link = input ? input.value : '';
    if (!link) {
      alert('Link de aprovação indisponível no momento.');
      return;
    }

    const setButtonFeedback = () => {
      const btn = document.querySelector('#secao-link-aprovacao-padrao button[onclick*="copyStandardApprovalLink"]');
      if (btn) {
        const origHtml = btn.innerHTML;
        btn.innerHTML = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg> <span class="text-white font-black">✓ Link Copiado!</span>`;
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
        setTimeout(() => {
          btn.innerHTML = origHtml;
          btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
          btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }, 2500);
      }
    };

    if (input) {
      input.focus();
      input.select();
      if (input.setSelectionRange) {
        input.setSelectionRange(0, 99999);
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setButtonFeedback();
        if (window.grafsisAlert) {
          window.grafsisAlert('Link de aprovação copiado com sucesso!\n\nEnvie este link para o cliente no WhatsApp para que ele possa conferir arte, medidas e validar a aprovação.', 'GRAFSIS');
        } else {
          alert(`Link de aprovação copiado com sucesso!\n\n${link}`);
        }
      }).catch(() => {
        try {
          document.execCommand('copy');
          setButtonFeedback();
          if (window.grafsisAlert) {
            window.grafsisAlert('Link de aprovação copiado com sucesso!', 'GRAFSIS');
          }
        } catch (e) {
          prompt('Copie o link abaixo para enviar ao cliente:', link);
        }
      });
    } else {
      try {
        document.execCommand('copy');
        setButtonFeedback();
        if (window.grafsisAlert) {
          window.grafsisAlert('Link de aprovação copiado com sucesso!', 'GRAFSIS');
        }
      } catch (e) {
        prompt('Copie o link abaixo para enviar ao cliente:', link);
      }
    }
  },

  sendStandardApprovalWhatsApp() {
    let orderId = document.getElementById('current-display-id')?.value?.replace('#', '') || document.getElementById('display-order-id-label')?.innerText?.replace('#', '')?.trim();
    if (!orderId || orderId === 'NOVO' || orderId.includes('NOVO')) {
      const linkInput = document.getElementById('padrao-approval-link-input');
      if (linkInput && linkInput.value) {
        const match = linkInput.value.match(/id=([^&]+)/);
        if (match) orderId = match[1];
      }
    }
    if (!orderId || orderId === 'NOVO' || orderId.includes('NOVO')) {
      const orders = window.store?.getOrders() || [];
      const clientId = document.querySelector('select[name="cliente_id"]')?.value;
      const matchingOrder = orders.filter(o => o.cliente_id === clientId).sort((a,b) => (b.numero||0) - (a.numero||0))[0];
      if (matchingOrder) orderId = matchingOrder.id || matchingOrder.numero;
    }
    if (orderId && orderId !== 'NOVO' && !orderId.includes('NOVO')) {
      this.openApprovalShareModal(orderId);
    } else {
      alert('Grave ou registre a operação primeiro para poder encaminhar o link de aprovação ao cliente via WhatsApp.');
    }
  },

  updateStandardApprovalBox(order) {
    if (!order) return;
    const box = document.getElementById('secao-link-aprovacao-padrao');
    if (!box) return;
    box.classList.remove('hidden');
    const orderId = order.id || order.numero;
    const link = `${window.location.origin}${window.location.pathname}#aprovacao?id=${orderId}`;
    const input = document.getElementById('padrao-approval-link-input');
    if (input) input.value = link;
    const openBtn = document.getElementById('padrao-approval-link-open');
    if (openBtn) openBtn.href = link;
  },

  openApprovalShareModal(orderId) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId || String(o.numero) === String(orderId));
    if (!order) {
      alert('Pedido não encontrado para compartilhamento.');
      return;
    }

    const clients = window.store.getClients();
    const client = clients.find(c => c.id === order.cliente_id) || {};
    const clientName = client.nome || order.cliente_nome || 'Cliente';
    const clientPhone = order.telefone_autorizacao || client.telefone_whatsapp || client.telefone || order.cliente_telefone || '';
    const baseLink = `${window.location.origin}${window.location.pathname}#aprovacao?id=${order.id || order.numero}`;
    const linkTecnico = `${baseLink}&modo=tecnico`;
    const linkCompleto = `${baseLink}&modo=completo`;
    const tenant = window.store.getActiveTenant ? window.store.getActiveTenant() : {};
    const empresaNome = tenant.nome_fantasia || tenant.razao_social || 'GRAFSIS Comunicação Visual';

    const modalId = 'modal-approval-share-wrap';
    document.getElementById(modalId)?.remove();

    // Filtra itens liberados para O.S./Link (conforme marcações de checagem)
    const allItems = order.itens || [];
    const liberadosItems = allItems.filter(it => it.liberado_os !== false);
    const displayedItems = liberadosItems.length > 0 ? liberadosItems : allItems;

    const wrap = document.createElement('div');
    wrap.id = modalId;
    wrap.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in';
    wrap.innerHTML = `
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        <!-- Topo Estilo Folha de Encaminhamento -->
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl font-black">
              📱
            </div>
            <div>
              <span class="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Envio de Links & Recibo Digital</span>
              <h2 class="text-lg font-black text-slate-900 dark:text-white">Encaminhar Pedido #${order.numero}</h2>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            ✕
          </button>
        </div>

        <!-- Corpo do Modal -->
        <div class="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
          
          <!-- Folha de Resumo Tipo Impressão -->
          <div class="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 font-sans">
            <div class="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-[11px]">
              <span class="font-bold uppercase tracking-wider">${empresaNome}</span>
              <span class="font-mono">${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Cliente Destinatário:</span>
                <strong class="text-slate-900 dark:text-white text-sm">${clientName}</strong>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Valor Total do Pedido:</span>
                <strong class="text-emerald-600 font-black text-sm">R$ ${Number(order.valor_final || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
              </div>
            </div>

            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Itens Liberados no Link (${displayedItems.length} de ${allItems.length}):</span>
              <ul class="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                ${displayedItems.map(it => `
                  <li class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-1">
                    <span><strong>${it.quantidade}x</strong> #${String(it.item_id||'').replace(/^#+/,'')} ${it.produto_nome || it.descricao || 'Item'}</span>
                    <span class="font-mono text-[10px] text-blue-600">${it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` : 'Un'}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            ${order.observacoes ? `
              <div class="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 text-[11px]">
                <strong>Observações da Operação:</strong> ${order.observacoes}
              </div>
            ` : ''}

            <!-- Registro de Envios Anteriores -->
            ${order.link_enviado ? `
              <div class="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] space-y-1">
                <div><strong>Último envio registrado:</strong> ${new Date(order.link_enviado.data).toLocaleString('pt-BR')} para <strong>${order.link_enviado.telefone}</strong> (por ${order.link_enviado.usuario || 'Operador'})</div>
                ${order.codigo_autorizacao ? `<div><strong>Senha / Código de Autorização:</strong> <span class="font-mono font-black text-xs px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 rounded">${order.codigo_autorizacao}</span> (vinculado exclusivamente a este número)</div>` : ''}
              </div>
            ` : `
              <div class="text-[11px] text-slate-400 italic">
                Nenhum envio de link registrado anteriormente para este pedido.
              </div>
            `}
          </div>

          <!-- Configuração do Telefone e Links -->
          <div class="space-y-3">
            <div>
              <label class="block font-bold text-slate-800 dark:text-white mb-1">Telefone / WhatsApp do Destinatário (Regra de Ouro: Senha vinculada a este número) *</label>
              <input type="text" id="share-target-phone" value="${clientPhone}" placeholder="Ex: (69) 99999-9999" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
              <span class="text-[10px] text-slate-400 mt-1 block">Apenas o cliente com este número exato poderá digitar a senha e validar a conferência digital.</span>
            </div>

            <!-- Visualização dos Links Gerados -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div class="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <span class="font-black text-blue-900 dark:text-blue-200 block mb-1">1. Link Técnico (Sem Valores):</span>
                <div class="flex gap-1.5 items-center">
                  <input type="text" id="share-link-tecnico" value="${linkTecnico}" class="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded font-mono text-[10px] text-slate-700 dark:text-slate-200 select-all" onclick="this.select()">
                  <button type="button" onclick="navigator.clipboard.writeText('${linkTecnico}'); window.grafsisAlert('Link Técnico copiado!', 'GRAFSIS');" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] transition cursor-pointer">Copiar</button>
                </div>
              </div>
              <div class="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <span class="font-black text-emerald-900 dark:text-emerald-200 block mb-1">2. Link Completo (Com Financeiro):</span>
                <div class="flex gap-1.5 items-center">
                  <input type="text" id="share-link-completo" value="${linkCompleto}" class="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded font-mono text-[10px] text-slate-700 dark:text-slate-200 select-all" onclick="this.select()">
                  <button type="button" onclick="navigator.clipboard.writeText('${linkCompleto}'); window.grafsisAlert('Link Completo copiado!', 'GRAFSIS');" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition cursor-pointer">Copiar</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4 Modalidades de Envio no WhatsApp -->
        <div class="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col gap-2.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <!-- 1. Enviar Link Técnico (Sem Financeiro) -->
            <button type="button" onclick="salesModule.sendApprovalViaWhatsApp('${order.id}', 'tecnico')" class="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer" title="Envia layout, arte, medidas e descrição sem valores monetários">
              <span>📐 1. Enviar Link Técnico (Sem Valores)</span>
            </button>

            <!-- 2. Enviar Link Completo (Com Financeiro) -->
            <button type="button" onclick="salesModule.sendApprovalViaWhatsApp('${order.id}', 'completo')" class="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer" title="Envia layout completo com valores unitários, total, entrada e opções de pagamento">
              <span>💰 2. Enviar Link Completo (Com Valores)</span>
            </button>

            <!-- 3. Enviar Senha de Autorização Separada -->
            <button type="button" onclick="salesModule.sendApprovalViaWhatsApp('${order.id}', 'codigo')" class="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer" title="Envia a senha de 4 dígitos exclusivamente para o WhatsApp do cliente">
              <span>🔑 3. Enviar Senha de 4 Dígitos</span>
            </button>

            <!-- 4. Enviar Recibo de Pagamento com Código de Validação -->
            <button type="button" onclick="salesModule.sendApprovalViaWhatsApp('${order.id}', 'recibo')" class="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer" title="Envia recibo digital com código de validação único">
              <span>🧾 4. Enviar Recibo de Pagamento</span>
            </button>
          </div>
          
          <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 gap-2">
            <button type="button" onclick="salesModule.sendApprovalViaWhatsApp('${order.id}', 'full')" class="text-[11px] text-slate-600 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold underline transition cursor-pointer">
              ⚡ Enviar Proposta Completa + Senha Juntos
            </button>
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="py-1.5 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer">
              Fechar
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(wrap);
  },

  async sendApprovalViaWhatsApp(orderId, mode = 'completo') {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId || String(o.numero) === String(orderId));
    if (!order) return;

    const phoneInput = document.getElementById('share-target-phone');
    const rawPhone = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
    if (!rawPhone || rawPhone.length < 10) {
      await window.grafsisAlert('Informe um número de telefone com DDD válido para encaminhar o WhatsApp.', 'GRAFSIS');
      return;
    }

    const fullPhone = rawPhone.length === 10 || rawPhone.length === 11 ? '55' + rawPhone : rawPhone;
    const baseLink = `${window.location.origin}${window.location.pathname}#aprovacao?id=${order.id || order.numero}`;
    const linkTecnico = `${baseLink}&modo=tecnico`;
    const linkCompleto = `${baseLink}&modo=completo`;
    const clientName = order.cliente_nome || 'Cliente';
    const currentUser = window.app?.currentUser?.nome || 'Operador';
    const tenant = window.store?.getActiveTenant ? window.store.getActiveTenant() : {};
    const empresaNome = tenant.nome_fantasia || tenant.razao_social || 'GRAFSIS Comunicação Visual';
    const now = new Date();
    const nowIso = now.toISOString();

    // Gera/preserva senha aleatória de 4 dígitos para conferência do cliente
    const randomPin = order.codigo_autorizacao || String(Math.floor(1000 + Math.random() * 9000));
    order.codigo_autorizacao = randomPin;
    // Vincula explicitamente o número autorizado para conferência (Regra de Ouro)
    order.telefone_autorizacao = rawPhone;

    // Código único de validação do recibo
    const validationCode = `REC-${order.numero}-${String(Math.abs(Number(order.numero) * 31 + 1047)).slice(-4).padStart(4, '7')}`;

    // Monta itens liberados para envio
    const allItems = order.itens || [];
    const liberadosItems = allItems.filter(it => it.liberado_os !== false);
    const itemsToSend = liberadosItems.length > 0 ? liberadosItems : allItems;

    const itemsSummaryTecnico = itemsToSend.map((it, idx) => {
      const dim = it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` : (it.tipo_calculo === 'linear' ? `${it.largura_x}m linear` : 'Peça/Un');
      return `• *${it.quantidade}x* #${String(it.item_id||'').replace(/^#+/,'')} ${it.produto_nome || it.descricao || 'Item'} (${dim})${it.acabamento ? ` - Acabamento: ${it.acabamento}` : ''}`;
    }).join('\n');

    const itemsSummaryCompleto = itemsToSend.map((it, idx) => {
      const dim = it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` : (it.tipo_calculo === 'linear' ? `${it.largura_x}m linear` : 'Peça/Un');
      return `• *${it.quantidade}x* #${String(it.item_id||'').replace(/^#+/,'')} ${it.produto_nome || it.descricao || 'Item'} (${dim}) = R$ ${Number(it.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }).join('\n');

    const obsBlock = order.observacoes ? `\n📌 *Observações Técnicas:*\n${order.observacoes}\n` : '';
    const valorStr = Number(order.valor_final || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2});
    const entradaStr = Number(order.valor_entrada || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2});
    const saldoStr = Number(Math.max(0, (order.valor_final || 0) - (order.valor_entrada || 0))).toLocaleString('pt-BR', {minimumFractionDigits: 2});
    const formaPagto = order.forma_pagamento || 'Pix / Cartão / Dinheiro';

    let msg = '';
    if (mode === 'tecnico') {
      msg = `Olá, *${clientName}*! Tudo bem?\n\n` +
        `Seu pedido *#${order.numero}* na *${empresaNome}* está pronto para conferência técnica de arte, medidas e acabamentos.\n\n` +
        `📋 *ITENS DA OPERAÇÃO:*\n${itemsSummaryTecnico}\n` +
        `${obsBlock}\n` +
        `👉 *Acesse o Link Técnico para Visualizar o Layout e Artes:*\n` +
        `${linkTecnico}\n\n` +
        `🔐 *Senha de Autorização:* Enviaremos a sua senha de 4 dígitos exclusiva para este seu número para que você possa aprovar digitalmente a produção.`;
    } else if (mode === 'codigo') {
      msg = `🔐 *${empresaNome} - SENHA DE AUTORIZAÇÃO*\n\n` +
        `Olá, *${clientName}*!\n` +
        `Sua Senha de 4 Dígitos para conferência e autorização do Pedido *#${order.numero}* é:\n\n` +
        `🔑 *${randomPin}*\n\n` +
        `⚠️ *Regra de Segurança:* Esta senha só pode ser validada no portal acessando a partir deste seu número de WhatsApp (${rawPhone}). Digite-a no link para liberar a produção com segurança.`;
    } else if (mode === 'recibo') {
      msg = `🧾 *${empresaNome} - RECIBO DIGITAL DE PAGAMENTO*\n\n` +
        `*Pedido:* #${order.numero}\n` +
        `*Cliente:* ${clientName}\n` +
        `*Data/Hora:* ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}\n` +
        `*Valor do Pedido:* R$ ${valorStr}\n` +
        `*Valor Recebido / Entrada:* R$ ${entradaStr}\n` +
        `*Saldo Restante:* R$ ${saldoStr}\n` +
        `*Forma de Pagamento:* ${formaPagto}\n\n` +
        `🔒 *Código de Autenticação Digital:* *${validationCode}*\n\n` +
        `Este documento comprova o pagamento e lançamento financeiro da operação junto à ${empresaNome}.`;
    } else if (mode === 'full') {
      msg = `Olá, *${clientName}*! Tudo bem?\n\n` +
        `Seu pedido *#${order.numero}* na *${empresaNome}* está pronto para conferência e aprovação.\n\n` +
        `📋 *ITENS DA OPERAÇÃO:*\n${itemsSummaryCompleto}\n` +
        `${obsBlock}\n` +
        `💰 *RESUMO FINANCEIRO:*\n` +
        `• Total: R$ ${valorStr}\n` +
        `• Entrada: R$ ${entradaStr}\n` +
        `• Saldo: R$ ${saldoStr}\n` +
        `• Condição: ${formaPagto}\n\n` +
        `👉 *Link para Conferência e Aprovação:*\n` +
        `${linkCompleto}\n\n` +
        `🔑 *Sua Senha de Autorização:* *${randomPin}*\n` +
        `⚠️ Informe a senha *${randomPin}* no portal para validar o aceite e autorizar o início da produção gráfica!`;
    } else {
      // completo
      msg = `Olá, *${clientName}*! Tudo bem?\n\n` +
        `Seu pedido *#${order.numero}* na *${empresaNome}* está pronto para conferência completa.\n\n` +
        `📋 *ITENS DA OPERAÇÃO:*\n${itemsSummaryCompleto}\n` +
        `${obsBlock}\n` +
        `💰 *CONDIÇÕES COMERCIAIS:*\n` +
        `• Total: R$ ${valorStr}\n` +
        `• Entrada: R$ ${entradaStr}\n` +
        `• Saldo Restante: R$ ${saldoStr}\n` +
        `• Forma: ${formaPagto}\n\n` +
        `👉 *Acesse o Link Completo para Visualizar Arte, Valores e Aprovar:*\n` +
        `${linkCompleto}\n\n` +
        `🔐 *Sua Senha de Autorização:* *${randomPin}* (exclusiva para este seu WhatsApp)`;
    }

    // Registra o envio no pedido
    order.link_enviado = {
      telefone: rawPhone,
      data: nowIso,
      usuario: currentUser,
      codigo: randomPin,
      codigo_recibo: validationCode,
      modo: mode
    };

    order.historico = order.historico || [];
    order.historico.push({
      fase: order.status_fase || 'orcamento',
      data: nowIso,
      usuario: `WhatsApp enviado (${mode}) para ${rawPhone} por ${currentUser}`
    });

    // Salva no banco local e nuvem
    if (typeof window.store.saveOrder === 'function') {
      await window.store.saveOrder(order);
    } else {
      window.store.save('grafsis_orders', orders);
    }
    if (typeof window.store.pushRecord === 'function' && window.store.supabaseClient) {
      window.store.pushRecord('pedidos', order).catch(() => {});
    }

    // Abre o WhatsApp
    const waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    await window.grafsisAlert(
      `✅ Envio WhatsApp preparado com sucesso!\n\n` +
      `Destinatário: ${rawPhone}\n` +
      `Tipo de Envio: ${mode.toUpperCase()}\n` +
      `Senha de Autorização: ${randomPin}\n` +
      (mode === 'recibo' ? `Código do Recibo: ${validationCode}\n` : '') +
      `Data/Hora: ${now.toLocaleString('pt-BR')}`,
      'GRAFSIS'
    );
    this.render();
  },

  // =========================================================================
  // ORDEM DE SERVIÇO DE PRODUÇÃO (CHÃO DE FÁBRICA) - SEM VALORES FINANCEIROS
  // =========================================================================
  openProductionWorkOrder(orderId) {
    const order = window.store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Cliente Não Vinculado', telefone_whatsapp: '' };
    const tenant = window.store.getActiveTenant ? window.store.getActiveTenant() : {};

    const phaseNames = {
      'orcamento': 'Orçamento',
      'prevenda': 'Pré-Venda',
      'aprovacao': 'Aprovação',
      'liberado': 'Liberação',
      'producao': 'Produção',
      'acabamento': 'Acabamento',
      'embalagem': 'Expedição',
      'entregue': 'Entrega'
    };

    const totalAreaM2 = (order.itens || []).reduce((acc, it) => {
      return acc + (it.tipo_calculo === 'm2' ? (Number(it.largura_x || 0) * Number(it.comprimento_y || 0) * Number(it.quantidade || 1)) : 0);
    }, 0);

    const modalHtml = `
      <div id="work-order-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[92vh] flex flex-col">
          
          <!-- Cabeçalho Técnico de Chão de Fábrica -->
          <div class="border-b-2 border-slate-800 dark:border-slate-700 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-black tracking-wider uppercase">O.S. TÉCNICA</span>
                <span class="font-mono text-xl sm:text-2xl font-black text-blue-600 dark:text-cyan-400">#${order.numero}</span>
              </div>
              <h2 class="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">Ordem de Produção & Fábrica - Sem Valores Financeiros</h2>
            </div>
            <div class="text-left sm:text-right">
              <span class="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                ${phaseNames[order.status_fase] || order.status_fase}
              </span>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">📅 Prazo: <strong class="text-rose-600 dark:text-rose-400 font-black">${order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'Não definido'}</strong></p>
            </div>
          </div>

          <!-- Corpo Rolável com Especificações Técnicas -->
          <div class="overflow-y-auto flex-1 py-4 space-y-4">
            
            <!-- Dados do Cliente & Operador -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Cliente / Empresa:</span>
                <strong class="text-sm text-slate-900 dark:text-white">${client.nome}</strong>
                <span class="block text-slate-500 mt-0.5">${client.telefone_whatsapp || ''}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Operador / Vendedor:</span>
                <strong class="text-slate-800 dark:text-slate-200">${order.operador || 'Oficina Geral'}</strong>
                <span class="block text-slate-500 mt-0.5">Venda: ${order.vendedor || 'Comercial'}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Volume Total Produzido:</span>
                <strong class="text-sm font-mono text-indigo-600 dark:text-cyan-400">${totalAreaM2 > 0 ? totalAreaM2.toFixed(2) + ' m² total' : (order.itens ? order.itens.length + ' item(ns)' : '1 item')}</strong>
                <span class="block text-[10px] text-slate-400">Emissão: ${new Date(order.data_criacao || Date.now()).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <!-- Imagem da Arte / Layout do Pedido (Em Alta Resolução) -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Arte Aprovada do Pedido
                </h4>
                <div class="flex items-center gap-2">
                  <button type="button" onclick="salesModule.openRepositoryModal('${order.id}', '${order.numero}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition flex items-center gap-1 shadow-sm cursor-pointer" title="Ver fotos do local, prints e arquivos no Google Drive">
                    📁 Repositório de Fotos & Drive (${(order.repositorio_arquivos || []).length})
                  </button>
                  ${order.foto_arte_url ? `<span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300">Arquivo Conforme</span>` : ''}
                </div>
              </div>
              <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[160px] max-h-[260px] overflow-hidden group relative">
                ${order.foto_arte_url ? `
                  <img src="${order.foto_arte_url}" class="max-h-[240px] w-auto max-w-full object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                ` : `
                  <div class="text-center text-slate-400 py-6">
                    <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <p class="text-xs font-bold">Nenhum anexo de arte vinculado</p>
                  </div>
                `}
              </div>
            </div>

            <!-- Tabela Técnica de Itens de Produção (SEM VALORES R$) -->
            <div>
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                Itens a Produzir & Especificações Técnicas
              </h4>
              <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th class="p-3">#</th>
                      <th class="p-3">Produto / Material</th>
                      <th class="p-3">Medidas Técnicas</th>
                      <th class="p-3 text-center">Qtd</th>
                      <th class="p-3">Acabamento / Instruções</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    ${(order.itens || []).map((it, idx) => {
                      const itemCode = it.item_id || (String(order.numero) + String(idx + 1).padStart(2, '0'));
                      const isLiberado = it.liberado_os !== false;
                      return `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${!isLiberado ? 'bg-amber-50/40 opacity-90' : ''}">
                        <td class="p-3">
                          <span class="font-mono font-black text-xs ${isLiberado ? 'text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60' : 'text-amber-700 bg-amber-100'} px-1.5 py-0.5 rounded border ${isLiberado ? 'border-blue-200' : 'border-amber-300'}">#${itemCode}</span>
                        </td>
                        <td class="p-3">
                          <div class="flex items-center gap-1.5 flex-wrap">
                            <strong class="text-slate-900 dark:text-white block">${it.produto_nome || it.descricao}</strong>
                            ${isLiberado 
                              ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Liberado O.S.</span>` 
                              : `<span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">Aguardando Liberação</span>`
                            }
                          </div>
                          <span class="text-[11px] text-slate-500">${it.descricao || ''}</span>
                        </td>
                        <td class="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          ${it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m (${(it.largura_x * it.comprimento_y).toFixed(2)} m²)` : (it.tipo_calculo === 'linear' ? `${it.largura_x || it.quantidade} metros lineares` : 'Peça Unidade')}
                        </td>
                        <td class="p-3 text-center font-bold text-slate-900 dark:text-white">${it.quantidade}x</td>
                        <td class="p-3 text-amber-700 dark:text-amber-300 font-medium text-[11px]">
                          ${it.acabamento || 'Ilhós nas 4 pontas + Bainha vulcanizada'}
                        </td>
                      </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Checklist de Qualidade e Chão de Fábrica -->
            <div class="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block mb-2">Checklist de Liberação da Produção:</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked class="w-4 h-4 rounded text-blue-600 border-slate-300">
                  <span>Conferência de Medidas e Resolução da Arte</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked class="w-4 h-4 rounded text-blue-600 border-slate-300">
                  <span>Impressão Concluída (Perfil de Cor CMYK OK)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="w-4 h-4 rounded text-blue-600 border-slate-300">
                  <span>Acabamento, Bainha e Refile Finalizados</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="w-4 h-4 rounded text-blue-600 border-slate-300">
                  <span>Inspeção Final de Qualidade Aprovada</span>
                </label>
              </div>
            </div>

          </div>

          <!-- Rodapé com Ações & Opção de Impressão de Imagens (Imagem 2 & 3) -->
          <div class="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button type="button" onclick="document.getElementById('work-order-modal').remove()" class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-300 transition cursor-pointer">
                Fechar
              </button>
              <label class="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700" title="Marque para incluir imagens dos itens no relatório impresso">
                <input type="checkbox" id="os-modal-print-images" checked class="w-4 h-4 rounded text-blue-600 border-slate-300">
                <span>Imprimir Imagens da Arte Liberada</span>
              </label>
            </div>
            <div class="flex gap-2 w-full sm:w-auto justify-end">
              <button type="button" onclick="salesModule.printTechnicalWorkOrder('${order.id}', { includeImages: document.getElementById('os-modal-print-images')?.checked })" class="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer" title="Emitir Relatório de O.S. Técnica em A4 Paisagem">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Imprimir O.S. Técnica
              </button>
              <button type="button" onclick="productionModule.advancePhase('${order.id}'); document.getElementById('work-order-modal').remove();" class="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer">
                Avançar Fase &rarr;
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // BUSCA DIRETA DE PEDIDO PELO ID OU CÓDIGO DO ITEM (IMAGEM 5)
  searchAndOpenOrderById(term) {
    if (!term || !String(term).trim()) {
      alert('Por favor, informe o número do ID para buscar (ex: 260001 ou 26000101).');
      return;
    }
    const cleanTerm = String(term).replace('#', '').trim().toLowerCase();
    const orders = window.store?.getOrders ? window.store.getOrders() : [];
    let isolateItemIndex = null;
    let found = orders.find(o => {
      const num = String(o.numero || '').toLowerCase();
      const id = String(o.id || '').toLowerCase();
      return num === cleanTerm || id === cleanTerm || num.padStart(6, '0') === cleanTerm || id.startsWith(cleanTerm);
    });

    if (!found) {
      // Tenta localizar por código sequencial de item (ex: 26000801)
      for (const o of orders) {
        if (o.itens && o.itens.length > 0) {
          const itemIdx = o.itens.findIndex(it => {
            const code = String(it.item_id || '').toLowerCase();
            return code === cleanTerm || code.endsWith(cleanTerm);
          });
          if (itemIdx !== -1) {
            found = o;
            isolateItemIndex = itemIdx;
            break;
          }
        }
      }
    }

    if (found) {
      this.openModal({ orderId: found.id });
      if (isolateItemIndex !== null) {
        setTimeout(() => {
          this.isolateItemForOs(isolateItemIndex);
        }, 150);
      }
    } else {
      alert(`Nenhum pedido ou item encontrado com o ID #${term}. Verifique a numeração digitada.`);
    }
  },

  // EMISSÃO DE O.S. TÉCNICA EM A4 PAISAGEM - ITENS LADO A LADO E SEM VALORES FINANCEIROS (IMAGEM 2 & 3)
  printTechnicalWorkOrder(orderId, options = {}) {
    const orders = window.store?.getOrders ? window.store.getOrders() : [];
    const order = (orderId ? orders.find(o => o.id === orderId || String(o.numero) === String(orderId)) : null) || (this.currentEditingOrderId ? orders.find(o => o.id === this.currentEditingOrderId) : null);
    if (!order) {
      alert('Ordem de Serviço não localizada para impressão.');
      return;
    }

    const includeImages = options.includeImages !== undefined ? options.includeImages : true;
    const client = (window.store && window.store.getClients().find(c => c.id === order.cliente_id)) || null;
    const hasValidClient = !!(client && client.id);
    const clientObj = client || {
      nome: order.cliente_nome || 'Cliente não informado',
      telefone_whatsapp: '',
      cpf_cnpj: '',
      endereco: '',
      cidade: '',
      uf: ''
    };

    const tenant = (window.store && window.store.getActiveTenant()) || {};
    const companyName = tenant.nome_fantasia || tenant.razao_social || 'GRAFSIS COMUNICAÇÃO VISUAL';
    const companyCNPJ = tenant.cnpj ? (window.formatCpfCnpj ? window.formatCpfCnpj(tenant.cnpj) : tenant.cnpj) : '';
    const companyPhone = window.formatCanonicalPhone ? window.formatCanonicalPhone(tenant.celular_whatsapp || tenant.telefone_fixo || '(69) 99922-1336') : (tenant.celular_whatsapp || tenant.telefone_fixo || '(69) 99922-1336');
    const companyAddress = window.formatCleanAddress ? window.formatCleanAddress(tenant) : ([tenant.endereco || tenant.logradouro, tenant.numero, tenant.bairro, tenant.cidade, tenant.uf].filter(Boolean).join(', ') || 'Endereço não informado');
    const companyLogo = tenant.logo_url || '';

    const phaseNames = {
      'orcamento': 'Orçamento',
      'prevenda': 'Pré-Venda',
      'aprovacao': 'Aprovação',
      'liberado': 'Liberação',
      'producao': 'Produção',
      'acabamento': 'Acabamento',
      'embalagem': 'Expedição',
      'entregue': 'Entrega'
    };
    const faseNome = phaseNames[order.status_fase] || (order.status_fase || 'PRODUÇÃO').toUpperCase();

    const dataPedido = order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : (order.data_criacao ? new Date(order.data_criacao).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'));
    const prazoEntrega = order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'A Combinar';
    const clientAddressStr = client ? (window.formatCleanAddress ? window.formatCleanAddress(client) : [client.endereco, client.numero, client.bairro, client.cidade, client.uf].filter(Boolean).join(', ')) : '';
    const formattedClientDoc = clientObj.cpf_cnpj ? (window.formatCpfCnpj ? window.formatCpfCnpj(clientObj.cpf_cnpj) : clientObj.cpf_cnpj) : '';
    const formattedClientPhone = clientObj.telefone_whatsapp ? (window.formatCanonicalPhone ? window.formatCanonicalPhone(clientObj.telefone_whatsapp) : clientObj.telefone_whatsapp) : '';

    const allItems = (order.itens && order.itens.length > 0) ? order.itens : (this.activeItems || []);
    const items = allItems.filter(it => it.liberado_os !== false);
    const aguardandoItems = allItems.filter(it => it.liberado_os === false);

    if (items.length === 0) {
      alert(`Atenção: Nenhum item do Pedido #${order.numero} está liberado para emissão da Ordem de Serviço. Libere ao menos 1 item na lista antes de imprimir.`);
      return;
    }

    const itemsCardsHtml = items.map((it, idx) => {
      const itemImg = it.arte_url || order.foto_arte_url || '';
      const itemCode = it.item_id || (String(order.numero) + String(allItems.indexOf(it) + 1).padStart(2, '0'));
      const dimensao = it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m (${(Number(it.largura_x || 0) * Number(it.comprimento_y || 0)).toFixed(2)} m²)` : (it.tipo_calculo === 'linear' ? `${it.largura_x || it.quantidade} metros lineares` : 'Peça Unidade');
      
      return `
        <div class="item-card">
          <div class="item-header">
            <div>
              <span class="item-number">[ ] CÓD: #${itemCode}</span>
              <strong style="display: block; font-size: 11px; margin-top: 1px; color: #0f172a;">${it.produto_nome || it.descricao || 'Item de Produção'}</strong>
              ${it.descricao && it.descricao !== it.produto_nome ? `<div style="font-size: 9.5px; color: #64748b;">${it.descricao}</div>` : ''}
            </div>
            <span class="item-qty-badge">${it.quantidade}x</span>
          </div>

          <div class="tech-specs">
            <div><strong>Medidas:</strong> ${dimensao}</div>
            <div><strong>Acabamento:</strong> <span style="color: #92400e; font-weight: bold;">${it.acabamento || 'Ilhós nas 4 pontas + Bainha vulcanizada'}</span></div>
          </div>

          ${(includeImages && itemImg) ? `
            <div class="item-img-container">
              <img src="${itemImg}" class="item-img" alt="Arte Item #${itemCode}">
            </div>
          ` : `
            <div class="item-img-placeholder">
              <span>Arte sem anexo gráfico</span>
            </div>
          `}

          <div class="item-sign-box">
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 2px;">
              <label><input type="checkbox"> Impressão OK</label>
              <label><input type="checkbox"> Acabamento OK</label>
            </div>
            <div class="item-sign-line">
              <span>Data: ____/____/________</span>
              <span>Visto: ___________________</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>OS-${order.numero}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 7mm 8mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #0f172a;
            background: #fff;
            font-size: 11px;
            line-height: 1.3;
          }
          .os-container {
            width: 100%;
            max-width: 100%;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2.5px solid #0f172a;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .company-info {
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 50%;
          }
          .company-logo {
            max-height: 55px;
            max-width: 120px;
            object-fit: contain;
          }
          .title-center {
            text-align: center;
          }
          .title-center h1 {
            margin: 0;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .no-finance-badge {
            display: inline-block;
            background: #fef2f2;
            color: #991b1b;
            border: 1px solid #f87171;
            font-size: 9.5px;
            font-weight: 900;
            padding: 1px 8px;
            border-radius: 4px;
            margin-top: 2px;
            text-transform: uppercase;
          }
          .os-number-box {
            text-align: right;
          }
          .os-id-tag {
            font-family: monospace;
            font-size: 18px;
            font-weight: 900;
            color: #0369a1;
          }
          .phase-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #f59e0b;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            margin-top: 2px;
            text-transform: uppercase;
          }
          .data-bar {
            display: grid;
            grid-template-columns: 2.5fr 1fr 1fr 1.2fr;
            gap: 8px;
            background: #f8fafc;
            border: 1.5px solid #cbd5e1;
            border-radius: 6px;
            padding: 6px 10px;
            margin-bottom: 8px;
          }
          .data-bar .cell span {
            display: block;
            font-size: 9px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
          }
          .data-bar .cell strong {
            font-size: 11.5px;
            color: #0f172a;
          }
          .obs-box {
            background: #fff;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 4px 8px;
            margin-bottom: 8px;
            font-size: 10px;
          }
          .obs-box strong {
            text-transform: uppercase;
            font-size: 9px;
            color: #475569;
          }
          .items-header {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            border-bottom: 1.5px solid #334155;
            padding-bottom: 3px;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
          }
          /* GRID DOS ITENS UM AO LADO DO OUTRO (PAISAGEM A4) */
          .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 8px;
            margin-bottom: 8px;
          }
          .item-card {
            border: 1.5px solid #334155;
            border-radius: 6px;
            padding: 6px;
            background: #fff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 4px;
          }
          .item-number {
            font-family: monospace;
            font-weight: 900;
            color: #0369a1;
            font-size: 11px;
          }
          .item-qty-badge {
            background: #0f172a;
            color: #fff;
            font-weight: 900;
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 11px;
          }
          .tech-specs {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 3px 5px;
            font-size: 9.5px;
            margin-bottom: 4px;
          }
          .item-img-container {
            text-align: center;
            height: 125px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            margin-bottom: 4px;
            overflow: hidden;
          }
          .item-img {
            max-height: 120px;
            max-width: 100%;
            object-fit: contain;
          }
          .item-img-placeholder {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 4px;
            margin-bottom: 4px;
            font-size: 9px;
            color: #94a3b8;
          }
          .item-sign-box {
            border-top: 1px dashed #94a3b8;
            padding-top: 3px;
            margin-top: 2px;
            font-size: 9px;
          }
          .item-sign-line {
            display: flex;
            justify-content: space-between;
            margin-top: 3px;
          }
          .footer-signs {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            border-top: 2px solid #0f172a;
            padding-top: 6px;
            margin-top: 6px;
            page-break-inside: avoid;
          }
          .sign-col {
            text-align: center;
            font-size: 9px;
          }
          .sign-col .line {
            border-top: 1px solid #334155;
            margin-top: 20px;
            padding-top: 2px;
            font-weight: bold;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="os-container">
          <!-- CABEÇALHO OFICIAL DE PRODUÇÃO -->
          <div class="header-box">
            <div class="company-info">
              ${companyLogo ? `<img src="${companyLogo}" class="company-logo" alt="Logo">` : ''}
              <div>
                <strong style="font-size: 13px; text-transform: uppercase;">${companyName}</strong>
                ${companyCNPJ ? `<div style="font-size: 10px; color: #475569;">CNPJ: ${companyCNPJ}</div>` : ''}
                <div style="font-size: 9.5px; color: #64748b;">${companyAddress}</div>
                <div style="font-size: 9.5px; color: #64748b;">Tel: ${companyPhone}</div>
              </div>
            </div>

            <div class="title-center">
              <h1>ORDEM DE SERVIÇO TÉCNICA</h1>
              <div class="no-finance-badge">SEM VALORES FINANCEIROS - CHÃO DE FÁBRICA</div>
            </div>

            <div class="os-number-box">
              <div class="os-id-tag">#${order.numero}</div>
              <div class="phase-badge">${faseNome}</div>
              <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Emissão: ${dataPedido}</div>
            </div>
          </div>

          <!-- DADOS DO CLIENTE, PRAZO E RESPONSÁVEIS -->
          <div class="data-bar">
            <div class="cell">
              <span style="display: flex; justify-content: space-between; align-items: center;">
                <span>Cliente / Empresa</span>
                ${!hasValidClient ? `<span style="color: #b45309; background: #fef3c7; border: 1px solid #f59e0b; padding: 1px 4px; border-radius: 3px; font-size: 8.5px; font-weight: bold;">⚠️ Cadastro Pendente</span>` : ''}
              </span>
              <strong>${window.escapeHtml ? window.escapeHtml(clientObj.nome) : clientObj.nome}</strong>
              <div style="font-size: 9.5px; color: #475569;">${formattedClientDoc ? formattedClientDoc + ' &bull; ' : ''}${formattedClientPhone}</div>
              ${clientAddressStr ? `<div style="font-size: 9px; color: #64748b;">${window.escapeHtml ? window.escapeHtml(clientAddressStr) : clientAddressStr}</div>` : ''}
            </div>
            <div class="cell">
              <span>Data do Pedido</span>
              <strong>${dataPedido}</strong>
              <div style="font-size: 9px; color: #64748b;">Vendedor: ${window.escapeHtml ? window.escapeHtml(order.vendedor || 'Comercial') : (order.vendedor || 'Comercial')}</div>
            </div>
            <div class="cell">
              <span>Prazo de Entrega</span>
              <strong style="color: #b91c1c; font-size: 13px;">${prazoEntrega}</strong>
              <div style="font-size: 9px; color: #64748b;">Operador: ${window.escapeHtml ? window.escapeHtml(order.operador || 'Oficina Geral') : (order.operador || 'Oficina Geral')}</div>
            </div>
            <div class="cell">
              <span>Status & Volume</span>
              <strong style="color: #0369a1;">${items.length} de ${allItems.length} item(ns) liberado(s)</strong>
              <div style="font-size: 9px; color: #64748b;">Controle: ${faseNome}</div>
            </div>
          </div>

          <!-- OBSERVAÇÕES TÉCNICAS -->
          ${order.observacoes ? `
            <div class="obs-box">
              <strong>Observações Técnicas / Instruções de Produção:</strong> ${window.escapeHtml ? window.escapeHtml(order.observacoes) : order.observacoes}
            </div>
          ` : ''}

          <!-- ALERTA DE ITENS AGUARDANDO LIBERAÇÃO (IMAGEM 1) -->
          ${aguardandoItems.length > 0 ? `
            <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; font-size: 10px; color: #92400e;">
              <strong>⚠️ OBSERVAÇÃO TÉCNICA - EMISSÃO PARCIAL:</strong>
              Existem <strong>${aguardandoItems.length}</strong> item(ns) deste pedido aguardando liberação e que <strong>NÃO</strong> constam nesta O.S.:
              <span style="font-family: monospace; font-weight: bold; background: #fef3c7; padding: 1px 6px; border-radius: 4px;">
                ${aguardandoItems.map(it => '#' + (it.item_id || String(order.numero) + String(allItems.indexOf(it) + 1).padStart(2, '0'))).join(', ')}
              </span>
            </div>
          ` : ''}

          <!-- GRADE DE ITENS (DISPOSTOS UM AO LADO DO OUTRO) -->
          <div class="items-header">
            <span>Itens a Produzir & Especificações Técnicas (${items.length} item(ns) liberado(s)${aguardandoItems.length > 0 ? ` • ${aguardandoItems.length} aguardando` : ''})</span>
            <span style="font-size: 9px; font-weight: normal; text-transform: none; color: #64748b;">Conferência visual e liberação técnica por item</span>
          </div>

          <div class="items-grid">
            ${itemsCardsHtml}
          </div>

          <!-- ASSINATURAS FÍSICAS DE LIBERAÇÃO DA FÁBRICA -->
          <div class="footer-signs">
            <div class="sign-col">
              <div class="line">Conferência Arte / Designer</div>
              <div>Data: ____/____/________</div>
            </div>
            <div class="sign-col">
              <div class="line">Impressor / Operador Máquina</div>
              <div>Data: ____/____/________</div>
            </div>
            <div class="sign-col">
              <div class="line">Acabamento & Refile</div>
              <div>Data: ____/____/________</div>
            </div>
            <div class="sign-col">
              <div class="line">Controle de Qualidade Final</div>
              <div>Data: ____/____/________</div>
            </div>
          </div>

          <!-- RODAPÉ CANÔNICO DA O.S. (FUSO, HORA E PADRÃO DE FÁBRICA) -->
          <div style="margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 4px; font-size: 8.5px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
            <span>${window.escapeHtml ? window.escapeHtml(companyName) : companyName} &bull; O.S. Técnica de Fábrica (Sem Valores Monetários) &bull; Fuso: Horário de Brasília (BRT)</span>
            <span style="font-family: monospace;">Emitido em: ${dataPedido} &bull; Grafsis Produção</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    this.openPrintDocument(html, 'OS-' + order.numero);
  },

  // =========================================================================
  // CRM, INTELIGÊNCIA DE CLIENTES & PÓS-VENDA (ARP COMPLETO)
  // =========================================================================
  openCrmModal() {
    if (window.authModule && !window.authModule.can('canViewSaleValues')) {
      alert('Acesso Restrito: Painel comercial e histórico de faturamento disponível apenas para perfis autorizados (Vendas, Gerente, Proprietário).');
      return;
    }
    const inactiveClients = window.store.getInactiveClients(30);
    const priceStats = window.store.getPriceAverages();
    const surveys = window.store.getPostSalesSurveys();

    const modalHtml = `
      <div id="crm-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[92vh] flex flex-col">
          
          <div class="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-xs font-black uppercase">ARP / CRM</span>
                <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Inteligência de Clientes, Médias de Preços e Pós-Venda</h3>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Reativação de clientes inativos, análise de margem e pesquisa de satisfação</p>
            </div>
            <button onclick="document.getElementById('crm-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
          </div>

          <div class="overflow-y-auto flex-1 py-4 space-y-6">
            
            <!-- Cards de Médias de Preços Praticados -->
            <div>
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Médias de Preços e Margens do Catálogo
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <span class="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">M² (Metro Quadrado)</span>
                  <strong class="text-lg font-black text-slate-900 dark:text-white font-mono">R$ ${priceStats.m2.avgPrice.toFixed(2)}</strong>
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Margem: ~${priceStats.m2.avgMargin.toFixed(0)}%</span>
                </div>
                <div class="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <span class="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">Brindes / Unidades</span>
                  <strong class="text-lg font-black text-slate-900 dark:text-white font-mono">R$ ${priceStats.unidade.avgPrice.toFixed(2)}</strong>
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Margem: ~${priceStats.unidade.avgMargin.toFixed(0)}%</span>
                </div>
                <div class="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <span class="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">Hora Técnica</span>
                  <strong class="text-lg font-black text-slate-900 dark:text-white font-mono">R$ ${priceStats.hora.avgPrice.toFixed(2)}/h</strong>
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Margem: ~${priceStats.hora.avgMargin.toFixed(0)}%</span>
                </div>
                <div class="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Diária de Campo</span>
                  <strong class="text-lg font-black text-slate-900 dark:text-white font-mono">R$ ${priceStats.diaria.avgPrice.toFixed(2)}/dia</strong>
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Margem: ~${priceStats.diaria.avgMargin.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <!-- Seção de Clientes Inativos (> 30 dias sem compras) -->
            <div>
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Clientes Inativos e Sem Pedidos Recentes (${inactiveClients.length})
                </h4>
                <span class="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200">Requer Contato</span>
              </div>
              <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-extrabold text-[10px]">
                    <tr>
                      <th class="p-3">Cliente / Empresa</th>
                      <th class="p-3">Perfil</th>
                      <th class="p-3">Último Pedido</th>
                      <th class="p-3">Dias Sem Comprar</th>
                      <th class="p-3 text-right">Ação de Campanha</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    ${inactiveClients.slice(0, 8).map(cli => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="p-3">
                          <a href="javascript:void(0)" onclick="salesModule.openClientHistoryModal('${cli.id}')" class="text-blue-600 hover:text-blue-800 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold hover:underline block cursor-pointer" title="Ver Histórico de Operações e Chat de Anotações CRM">
                            ${cli.nome}
                          </a>
                          <span class="text-[11px] text-slate-500">${cli.cidade || ''} • ${cli.telefone_whatsapp}</span>
                        </td>
                        <td class="p-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${cli.perfil === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700 border border-slate-300'}">
                            ${cli.perfil || 'Recorrente'}
                          </span>
                        </td>
                        <td class="p-3 font-mono text-slate-500">${cli.lastOrderDate}</td>
                        <td class="p-3">
                          <span class="font-bold text-rose-600 dark:text-rose-400 font-mono">${cli.daysInactive} dias atrás</span>
                        </td>
                        <td class="p-3 text-right">
                          <button onclick="salesModule.sendReactivationCampaign('${cli.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition inline-flex items-center gap-1">
                            <span>📲 Oferta WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Pesquisa de Satisfação & Pós-Venda -->
            <div>
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                  Avaliações Recentes de Pós-Venda (NPS)
                </h4>
                <button onclick="salesModule.openNewPostSaleForm()" class="text-xs font-bold text-blue-600 hover:underline">+ Nova Avaliação</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                ${surveys.slice(0, 3).map(s => `
                  <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div class="flex justify-between items-start mb-1">
                      <strong class="text-slate-900 dark:text-white truncate">${s.cliente_nome}</strong>
                      <span class="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px]">NPS ${s.nps}/10</span>
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 italic text-[11px] mt-1">"${s.comentario}"</p>
                    <div class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[10px] text-slate-400">
                      <span>Qualidade: ⭐ ${s.qualidade}/5</span>
                      <span>${s.data}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <div class="border-t border-slate-200 dark:border-slate-800 pt-3 text-right">
            <button onclick="document.getElementById('crm-modal').remove()" class="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition">
              Fechar Painel
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  sendReactivationCampaign(clientId) {
    const client = window.store.getClients().find(c => c.id === clientId);
    if (!client || !client.telefone_whatsapp) {
      alert('Cliente sem número de WhatsApp cadastrado!');
      return;
    }
    const tenant = window.store.getActiveTenant ? window.store.getActiveTenant() : {};
    const company = tenant.nome_fantasia || tenant.razao_social || 'Nossa Gráfica';

    const msg = `Olá *${client.nome}*, tudo bem?%0A%0AAqui é da *${company}*! Notamos que faz um tempo que não produzimos materiais juntos e preparamos uma condição exclusiva para o seu próximo pedido:%0A%0A🎁 *15% de Desconto na renovação de fachadas, banners e adesivos!*%0A%0APodemos orçar seu projeto sem compromisso?`;
    const fone = client.telefone_whatsapp.replace(/\D/g, '');
    window.open('https://wa.me/55' + fone + '?text=' + msg, '_blank');
  },

  openNewPostSaleForm() {
    const clients = window.store.getClients();
    const modalHtml = `
      <div id="new-postsale-modal" class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          <h3 class="text-base font-black text-slate-900 dark:text-white mb-3">Registrar Pesquisa de Pós-Venda</h3>
          <form onsubmit="salesModule.submitPostSaleForm(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-bold mb-1">Cliente:</label>
              <select id="ps-client-id" class="w-full px-3 py-2 border rounded-lg text-xs" required>
                ${clients.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold mb-1">Nota NPS (0 a 10):</label>
                <input type="number" id="ps-nps" min="0" max="10" value="10" required class="w-full px-3 py-2 border rounded-lg text-xs font-bold">
              </div>
              <div>
                <label class="block text-xs font-bold mb-1">Qualidade (1 a 5):</label>
                <input type="number" id="ps-qualidade" min="1" max="5" value="5" required class="w-full px-3 py-2 border rounded-lg text-xs font-bold">
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">Feedback do Cliente:</label>
              <textarea id="ps-comentario" rows="3" placeholder="Depoimento do cliente sobre o atendimento e prazo..." required class="w-full px-3 py-2 border rounded-lg text-xs"></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onclick="document.getElementById('new-postsale-modal').remove()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">Cancelar</button>
              <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow">Salvar Avaliação</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  submitPostSaleForm(e) {
    if (e) e.preventDefault();
    const cId = document.getElementById('ps-client-id').value;
    const client = window.store.getClients().find(c => c.id === cId) || { nome: 'Cliente' };
    const nps = Number(document.getElementById('ps-nps').value);
    const qual = Number(document.getElementById('ps-qualidade').value);
    const com = document.getElementById('ps-comentario').value;

    window.store.savePostSalesSurvey({
      cliente_id: cId,
      cliente_nome: client.nome,
      nps,
      qualidade: qual,
      comentario: com
    });

    alert('Pesquisa pós-venda registrada com sucesso!');
    const m = document.getElementById('new-postsale-modal');
    if (m) m.remove();
    const crmM = document.getElementById('crm-modal');
    if (crmM) {
      crmM.remove();
      this.openCrmModal();
    }
  },

  // =========================================================================
  // HISTÓRICO 360º DO CLIENTE & REPOSITÓRIO TIPO CHAT DE ANOTAÇÕES CRM
  // =========================================================================
  openClientHistoryModal(clientId) {
    if (window.authModule && !window.authModule.can('canViewSaleValues')) {
      alert('Acesso Restrito: Histórico comercial e métricas de faturamento disponíveis apenas para perfis autorizados.');
      return;
    }
    const client = window.store.getClients().find(c => String(c.id) === String(clientId));
    if (!client) {
      alert('Cliente não encontrado.');
      return;
    }

    const allOrders = window.store.getOrders();
    const clientOrders = allOrders.filter(o => String(o.cliente_id) === String(clientId));
    
    // Métricas de Consumo
    const totalGasto = clientOrders.reduce((acc, o) => acc + (parseFloat(o.valor_final || o.valor_total || 0)), 0);
    const totalOperacoes = clientOrders.length;
    const ticketMedio = totalOperacoes > 0 ? (totalGasto / totalOperacoes) : 0;
    
    // Última Operação
    const lastOrder = clientOrders.slice().sort((a,b) => new Date(b.created_at || b.data_emissao || 0) - new Date(a.created_at || a.data_emissao || 0))[0];
    const dataUltimaCompra = lastOrder ? (lastOrder.created_at ? new Date(lastOrder.created_at).toLocaleDateString('pt-BR') : (lastOrder.data_emissao || 'Recente')) : (client.data_ultimo_pedido || 'Sem registros');

    const notas = client.anotacoes_crm || [];

    const modalHtml = `
      <div id="client-history-modal" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[94vh] flex flex-col">
          
          <!-- Cabeçalho do Perfil do Cliente -->
          <div class="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div class="flex items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-blue-500/30 shrink-0 shadow-sm flex items-center justify-center">
                ${client.foto_url ? `
                  <img src="${client.foto_url}" class="w-full h-full object-cover" alt="${client.nome}">
                ` : `
                  <span class="font-black text-lg text-blue-600 uppercase">${(client.nome || 'CL').slice(0, 2)}</span>
                `}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-black text-slate-900 dark:text-white">${client.nome}</h3>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${client.status === 'bloqueado' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}">
                    ${client.status === 'bloqueado' ? 'Bloqueado' : 'Ativo'}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    ${client.perfil || 'Recorrente'}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ${client.cpf_cnpj ? `Doc: ${client.cpf_cnpj} • ` : ''} 📞 ${client.telefone_whatsapp} • ✉️ ${client.email || 'Sem e-mail'} • 📍 ${client.cidade || ''} - ${client.uf || 'RO'}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-center">
              <a href="https://wa.me/55${(client.telefone_whatsapp || '').replace(/\D/g, '')}" target="_blank" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer">
                <span>💬 WhatsApp</span>
              </a>
              <button onclick="document.getElementById('client-history-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold px-2">&times;</button>
            </div>
          </div>

          <!-- Métricas de Consumo (Cards KPI) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div class="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
              <span class="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">Faturamento Total</span>
              <strong class="text-lg font-black text-slate-900 dark:text-white font-mono">R$ ${totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Compras acumuladas</span>
            </div>
            <div class="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Total de Operações</span>
              <strong class="text-lg font-black text-slate-900 dark:text-white font-mono">${totalOperacoes}</strong>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Pedidos / Orçamentos</span>
            </div>
            <div class="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
              <span class="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">Ticket Médio</span>
              <strong class="text-lg font-black text-slate-900 dark:text-white font-mono">R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Média por pedido</span>
            </div>
            <div class="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
              <span class="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">Última Operação</span>
              <strong class="text-sm font-black text-slate-900 dark:text-white font-mono block mt-1">${dataUltimaCompra}</strong>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">${clientOrders.length > 0 ? (clientOrders[0].status_fase || 'Registrado') : 'Sem pedidos'}</span>
            </div>
          </div>

          <!-- Grid de Duas Colunas: Histórico de Vendas (Esq) + Chat de Anotações CRM (Dir) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto flex-1 pr-1">
            
            <!-- Coluna 1 (7 cols): Histórico de Operações -->
            <div class="lg:col-span-7 flex flex-col space-y-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Histórico de Vendas / Operações (${clientOrders.length})</span>
                <button type="button" onclick="salesModule.createOrderForClient('${client.id}'); document.getElementById('client-history-modal').remove();" class="text-blue-600 hover:text-blue-800 text-[11px] font-bold">
                  + Nova Operação
                </button>
              </h4>
              
              <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex-1 max-h-[350px] overflow-y-auto">
                ${clientOrders.length === 0 ? `
                  <div class="p-8 text-center text-slate-400 text-xs italic">
                    Nenhum pedido ou orçamento registrado para este cliente até o momento.
                  </div>
                ` : `
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-extrabold text-[10px] sticky top-0">
                      <tr>
                        <th class="p-2.5">O.S. / Nº</th>
                        <th class="p-2.5">Data</th>
                        <th class="p-2.5">Tipo</th>
                        <th class="p-2.5">Status</th>
                        <th class="p-2.5 text-right">Valor Final</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      ${clientOrders.map(ord => `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td class="p-2.5 font-mono font-bold text-blue-600 dark:text-cyan-400">#${ord.numero}</td>
                          <td class="p-2.5 text-slate-500">${ord.created_at ? new Date(ord.created_at).toLocaleDateString('pt-BR') : (ord.data_emissao || '-')}</td>
                          <td class="p-2.5">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              ${ord.tipo_operacao || ord.tipo || 'Venda'}
                            </span>
                          </td>
                          <td class="p-2.5">
                            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${ord.status_fase === 'entregue' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                              ${ord.status_fase || 'Fila'}
                            </span>
                          </td>
                          <td class="p-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                            R$ ${(parseFloat(ord.valor_final || ord.valor_total || 0)).toFixed(2)}
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `}
              </div>
            </div>

            <!-- Coluna 2 (5 cols): Repositório Tipo Chat de Anotações CRM -->
            <div class="lg:col-span-5 flex flex-col space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>💬 Repositório de Anotações CRM</span>
                </h4>
                <span class="text-[10px] font-bold text-slate-400" id="crm-notes-count">${notas.length} notas</span>
              </div>

              <!-- Timeline estilo Chat -->
              <div id="crm-notes-timeline" class="space-y-3 overflow-y-auto flex-1 max-h-[260px] p-1">
                ${notas.length === 0 ? `
                  <div class="p-6 text-center text-slate-400 text-xs italic">
                    Nenhuma anotação registrada ainda. Digite uma mensagem abaixo para iniciar o histórico do cliente.
                  </div>
                ` : notas.map(n => `
                  <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div class="flex items-center justify-between text-[11px]">
                      <strong class="text-blue-600 dark:text-cyan-400 font-bold">${n.usuario || 'Operador'}</strong>
                      <span class="text-slate-400 text-[10px]">${n.data_hora}</span>
                    </div>
                    <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed break-words">${n.texto}</p>
                  </div>
                `).join('')}
              </div>

              <!-- Input estilo chat para adicionar nova anotação -->
              <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <textarea id="new-crm-note-text" rows="2" placeholder="Digite uma anotação sobre o cliente (ex: ligou pedindo desconto, prefere entrega às terças...)" class="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"></textarea>
                <div class="flex justify-end">
                  <button type="button" onclick="salesModule.saveClientCrmNote('${client.id}')" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    <span>Salvar Anotação</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          <!-- Rodapé do Modal -->
          <div class="border-t border-slate-200 dark:border-slate-800 pt-3 mt-4 flex justify-end">
            <button type="button" onclick="document.getElementById('client-history-modal').remove()" class="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-300 transition cursor-pointer">
              Fechar Histórico
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  saveClientCrmNote(clientId) {
    const textarea = document.getElementById('new-crm-note-text');
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) {
      alert('Digite uma anotação para salvar.');
      return;
    }

    const client = window.store.getClients().find(c => String(c.id) === String(clientId));
    if (!client) return;

    if (!client.anotacoes_crm) client.anotacoes_crm = [];
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userNome = window.app?.currentUser?.nome || 'Operador Grafsis';

    const newNote = {
      id: 'note-' + Date.now(),
      data_hora: formattedDate,
      usuario: userNome,
      texto: text
    };

    client.anotacoes_crm.unshift(newNote);
    window.store.saveClient(client);

    textarea.value = '';

    // Atualiza a timeline na tela
    const timeline = document.getElementById('crm-notes-timeline');
    if (timeline) {
      timeline.innerHTML = client.anotacoes_crm.map(n => `
        <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <strong class="text-blue-600 dark:text-cyan-400 font-bold">${n.usuario || 'Operador'}</strong>
            <span class="text-slate-400 text-[10px]">${n.data_hora}</span>
          </div>
          <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed break-words">${n.texto}</p>
        </div>
      `).join('');
    }
    const countSpan = document.getElementById('crm-notes-count');
    if (countSpan) countSpan.innerText = `${client.anotacoes_crm.length} notas`;
  }

};




















