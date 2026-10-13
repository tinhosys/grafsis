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
      const c = clients.find(cl => cl.id === o.cliente_id);
      const cName = c ? c.nome : 'Desconhecido';
      
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

  checkClientStatusAndAge(selectElement) {
    const clientId = selectElement.value;
    if (!clientId) {
      this.updateFormState();
      return;
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
        if (confirm(`Atenção: Os dados do cliente ${client.nome} não são atualizados há mais de 1 ano. Deseja atualizar os dados agora?`)) {
          if (window.clientsModule && typeof window.clientsModule.editModal === 'function') {
            window.clientsModule.editModal(clientId);
          } else {
            alert('Acesse a aba Clientes para atualizar os dados.');
          }
        }
      }
    }
    this.updateFormState();
  },

  handleOperationTypeChange(select) {
    const op = select.value;
    if ((op === 'permuta' || op === 'patrocinio') && !this.canManagePermutaPatrocinio()) {
      alert('Operação restrita: Permuta e Patrocínio só podem ser autorizados pelos perfis Gerente ou Proprietário.');
      select.value = 'venda';
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
      if (el.id !== 'item-type') el.disabled = false;
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

    // 7. Recibo: "RECIBO SÓ SE HABITA NA VENDA, PERMUTA"
    const btnRecibo = document.getElementById('btn-detalhes-recibo');
    if (btnRecibo) {
      const canRecibo = (op === 'venda' || op === 'permuta');
      btnRecibo.disabled = !canRecibo;
      if (canRecibo) {
        btnRecibo.className = 'w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-lg shadow-sm flex justify-center items-center gap-2 transition cursor-pointer';
        btnRecibo.title = 'Lançar recebimento e emitir recibo comercial';
      } else {
        btnRecibo.className = 'w-full py-2 bg-slate-200 text-slate-400 font-bold rounded-lg shadow-none flex justify-center items-center gap-2 transition cursor-not-allowed';
        btnRecibo.title = 'Recibo desabilitado para ' + (op === 'patrocinio' ? 'Patrocínio' : (op === 'pre-venda' ? 'Pré-Venda' : 'Orçamento'));
      }
    }

    // 8. Botões de Ação Inferiores:
    // PRÉ-VENDA: "Salvar Pré-Venda", "Emitir Pré-Venda", SEM O.S., SEM caixa
    // ORÇAMENTO: "Salvar Orçamento", "Emitir Orçamento", SEM O.S., SEM caixa
    // VENDA / PERMUTA / PATROCÍNIO: "Finalizar...", "Emitir Pedido", COM O.S.
    const btnSubmit = document.getElementById('btn-submit-order');
    const btnEmitirPedido = document.getElementById('btn-emitir-pedido');
    const btnEmitirOS = document.getElementById('btn-emitir-os');

    if (btnSubmit) {
      btnSubmit.disabled = false;
      if (op === 'orcamento') {
        btnSubmit.innerText = 'Salvar Orçamento';
        btnSubmit.className = 'px-7 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md uppercase transition';
      } else if (op === 'pre-venda') {
        btnSubmit.innerText = 'Salvar Pré-Venda';
        btnSubmit.className = 'px-7 py-2.5 text-sm bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-md uppercase transition';
      } else if (op === 'permuta') {
        btnSubmit.innerText = 'Finalizar Permuta';
        btnSubmit.className = 'px-7 py-2.5 text-sm bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md uppercase transition';
      } else if (op === 'patrocinio') {
        btnSubmit.innerText = 'Finalizar Patrocínio';
        btnSubmit.className = 'px-7 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md uppercase transition';
      } else {
        btnSubmit.innerText = 'Finalizar Pedido';
        btnSubmit.className = 'px-7 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md uppercase transition';
      }
    }

    if (btnEmitirPedido) {
      btnEmitirPedido.disabled = false;
      if (op === 'orcamento') {
        btnEmitirPedido.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Emitir Orçamento`;
      } else if (op === 'pre-venda') {
        btnEmitirPedido.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Emitir Pré-Venda`;
      } else {
        btnEmitirPedido.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Emitir Pedido`;
      }
    }

    if (btnEmitirOS) {
      if (op === 'orcamento' || op === 'pre-venda') {
        btnEmitirOS.style.display = 'none';
      } else {
        btnEmitirOS.style.display = 'inline-flex';
        btnEmitirOS.disabled = false;
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

  handleProdSelect(selectEl) {
    if (!selectEl) return;
    const prodId = selectEl.value;
    if (!prodId) return;
    const products = window.store.getProducts();
    const prod = products.find(p => String(p.id) === String(prodId));
    const opt = selectEl.options[selectEl.selectedIndex];
    const price = prod ? (prod.preco_base ?? 0) : parseFloat(opt?.getAttribute('data-price') || 0);
    const type = prod ? (prod.tipo_cobranca || 'm2') : (opt?.getAttribute('data-type') || 'm2');

    const priceInput = document.getElementById('item-price');
    if (priceInput) {
      priceInput.value = parseFloat(price).toFixed(2);
    }
    const typeSelect = document.getElementById('item-type');
    if (typeSelect) {
      typeSelect.value = type;
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
      ${products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome}</option>`).join('')}
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
      cancelBtn.innerHTML = 'CANCELAR';
      cancelBtn.onclick = () => {
        if (confirm('Cancelar edição e limpar formulário?')) {
          salesModule.activeItems.splice(idx, 0, it);
          document.getElementById('order-items-tbody').innerHTML = salesModule.renderActiveItemsHtml();
          document.getElementById('item-desc').value = '';
          document.getElementById('item-prod-select').value = '';
          document.getElementById('item-price').value = '0.00';
          document.getElementById('item-width').value = '0.00';
          document.getElementById('item-height').value = '0.00';
          document.getElementById('item-qty').value = '1';
          salesModule.removeItemArte();
          cancelBtn.remove();
          salesModule.recalcTotals('val');
        }
      };
      const insertBtn = document.querySelector('button[onclick="salesModule.addItemToOrder()"]');
      if (insertBtn) insertBtn.parentNode.appendChild(cancelBtn);
    }
  },

  openModal(params = {}) {
    this.isFormOpen = true;
    this.currentEditingOrderId = params.orderId || null;
    this.editingItemIdx = null;
    const clients = window.store.getClients();
    const products = window.store.getProducts();
    const isEdit = params.orderId ? true : false;
    const order = isEdit ? window.store.getOrders().find(o => o.id === params.orderId) : null;
    this.activeItems = order ? JSON.parse(JSON.stringify(order.itens || [])).map(it => ({
      ...it,
      liberado_os: it.liberado_os !== undefined ? it.liberado_os : true
    })) : [];
    if (params.preItem) {
      this.activeItems.push({
        ...params.preItem,
        liberado_os: params.preItem.liberado_os !== undefined ? params.preItem.liberado_os : true
      });
    }
    
    const displayId = isEdit ? order.numero : this.getNextOrderId();
    this.activeItems.forEach((it, idx) => {
      if (!it.item_id || !it.item_id.startsWith(String(displayId))) {
        it.item_id = String(displayId) + String(idx + 1).padStart(2, '0');
      }
    });
    const canPermutaPatrocinio = this.canManagePermutaPatrocinio();
    
    const defValidadeDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const initialClientId = (order && order.cliente_id) || params.clientId || '';
    const initialOp = (order && (order.tipo_operacao || order.tipo)) || 'venda';
    const isBudgetOrPre = (initialOp === 'orcamento' || initialOp === 'pre-venda');
    const isPermutaPatrocinio = (initialOp === 'permuta' || initialOp === 'patrocinio');

    const formHtml = `
      <div class="space-y-4 max-w-6xl mx-auto pb-10">
        <div class="sticky top-0 z-40 bg-white/95 backdrop-blur rounded-xl w-full p-4 mb-4 shadow-sm border border-slate-200">
          <div class="flex justify-between items-center mb-4">
            <div>
              <button type="button" onclick="salesModule.render()" class="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 mb-1">
                &larr; Voltar para Lista
              </button>
              <h2 class="text-2xl font-black text-slate-800">${isEdit ? 'Editar Pedido' : 'Nova Venda / Orçamento'}</h2>
            </div>
            <div class="text-right">
              <span class="block text-xs font-bold text-slate-500 uppercase tracking-wider">ID OPERAÇÃO</span>
              <span class="text-2xl font-black text-blue-700 dark:text-cyan-400 font-mono tracking-tight" id="display-order-id-label">#${displayId}</span>
              <input type="hidden" id="current-display-id" value="${displayId}">
            </div>
          </div>
          
          <form id="order-form" onsubmit="salesModule.saveOrder(event, '${order ? order.id : ''}', '${displayId}')" class="space-y-4">
            
            <!-- GRID SUPERIOR: CLIENTE, TIPO DE OPERAÇÃO E CONTROLES ESPECÍFICOS (IMAGEM 1) -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="md:col-span-2">
                <label class="block text-xs font-semibold mb-1 text-slate-800 flex items-center justify-between">
                  <span>Cliente *</span>
                  <span class="text-[11px] text-blue-600 font-bold">Obrigatório para prosseguir</span>
                </label>
                <select name="cliente_id" id="order-cliente-select" required class="w-full p-2.5 border-2 border-blue-400 rounded-lg text-sm bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" onchange="salesModule.checkClientStatusAndAge(this)">
                  <option value="">Selecione o Cliente...</option>
                  ${clients.map(c => `<option value="${c.id}" ${initialClientId === c.id ? 'selected' : ''}>${c.nome} ${c.cpf_cnpj ? '('+c.cpf_cnpj+')' : ''}</option>`).join('')}
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
                    <div class="col-span-12 sm:col-span-5">
                      <label class="block font-semibold mb-1 text-slate-700">Produto Base *</label>
                      <select id="item-prod-select" onchange="salesModule.handleProdSelect(this)" class="w-full p-2 border border-slate-300 rounded bg-white font-semibold">
                        <option value="">Selecione...</option>
                        ${products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome}</option>`).join('')}
                      </select>
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                      <label class="block font-semibold mb-1 text-slate-700">Calculo</label>
                      <select id="item-type" onchange="salesModule.toggleDimensionInputs()" class="w-full p-2 border border-slate-300 rounded bg-slate-100 font-semibold" disabled>
                        <option value="m2">m2 (X x Y)</option>
                        <option value="linear">Linear</option>
                        <option value="unidade">Unitario</option>
                      </select>
                    </div>
                    <div class="col-span-6 sm:col-span-2">
                      <label class="block font-semibold mb-1 text-slate-700 flex items-center justify-between">
                        <span>Base m² / un</span>
                        <span class="text-[9px] text-slate-400 font-normal">2x clique (4s)</span>
                      </label>
                      <input type="number" step="0.01" id="item-price" value="0.00" oninput="salesModule.calcPiecePrice()" onmouseenter="salesModule.handlePriceHover(this, true)" onmouseleave="salesModule.handlePriceHover(this, false)" ondblclick="salesModule.revealPrice4s(this)" style="color: transparent; text-shadow: none;" class="w-full p-2 border border-slate-300 rounded bg-white font-mono font-bold transition-all duration-200 cursor-pointer selection:text-transparent" title="Preço base - Passe o mouse ou dê duplo clique para visualizar por 4 segundos">
                    </div>
                    <div class="col-span-12 sm:col-span-2 flex items-end">
                      <button type="button" onclick="salesModule.openQuickProductModal()" class="w-full h-[38px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer" title="Adicionar Novo Produto no Catálogo">
                        <span class="text-sm font-black">+</span>
                        <span>Novo Produto</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block font-semibold mb-1 text-slate-700">Descricao / Detalhes *</label>
                    <input type="text" id="item-desc" placeholder="Ex: Homem-Aranha, Superman, Candidato Fulano..." class="w-full p-2 border border-slate-300 rounded bg-white">
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
                      <div class="relative w-10 h-[38px] flex-shrink-0" title="Anexar Imagem / Arte do Item (Max 2MB)">
                        <input type="file" id="item-arte-upload" accept="image/png, image/jpeg, image/jpg, image/webp" class="absolute inset-0 opacity-0 cursor-pointer z-10" onchange="salesModule.handleItemArteUpload(this)">
                        <div id="item-arte-btn" class="w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </div>
                        <input type="hidden" id="item-arte-url" value="">
                      </div>
                      <button type="button" onclick="salesModule.addItemToOrder()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-sm text-[11px] h-[38px] uppercase whitespace-nowrap">+ INSERIR ITEM</button>
                    </div>
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

                  <!-- IDENTIFICAÇÃO E STATUS DA OPERAÇÃO (MUDADO CONFORME IMAGEM 2) -->
                  <div class="pt-2 border-t border-slate-200" id="secao-status-producao">
                    <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                      <div class="flex items-center gap-2.5">
                        <span class="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></span>
                        <div>
                          <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Identificação & Status</div>
                          <div class="text-sm font-black text-slate-800 flex items-center gap-2 flex-wrap">
                            <span>Operação <strong class="font-mono text-blue-700">#${displayId}</strong></span>
                            <span class="text-slate-300">&bull;</span>
                            <span class="text-slate-600 font-medium text-xs">Fluxo controlado pelo Kanban da Produção</span>
                          </div>
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="text-[10px] font-bold uppercase text-slate-400 block">Fase Atual</span>
                        <span class="text-xs font-black px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg border border-amber-300 uppercase">${order ? (order.status_fase || 'Orçamento') : 'Orçamento'}</span>
                      </div>
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
                    <button type="button" id="btn-detalhes-recibo" onclick="salesModule.openFinanceModal()" class="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-lg shadow-sm flex justify-center items-center gap-2 transition cursor-pointer">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      DETALHES / RECIBO / CARTÃO
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

              <!-- BARRA DE BOTÕES & CONTROLE OPERACIONAL (Imagem 2: 6 Botões Padronizados em Grid) -->
              <input type="hidden" name="status_fase" value="${order ? (order.status_fase || 'orcamento') : 'orcamento'}">
              <div class="pt-6 mt-4 border-t bg-slate-50 p-4 rounded-xl border border-slate-200" id="secao-botoes-acoes">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  <!-- LINHA SUPERIOR (3 BOTÕES) -->
                  <!-- 1. Cancelar -->
                  <button type="button" onclick="salesModule.render()" class="w-full h-12 text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Cancelar e voltar para a listagem">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Cancelar
                  </button>

                  <!-- 2. Edita (marcado em amarelo na imagem 2) -->
                  <button type="button" id="btn-edit-order" onclick="salesModule.handleEditAction('${order ? order.id : ''}')" class="w-full h-12 text-sm font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 border border-amber-500 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Editar dados e itens da operação">
                    <svg class="w-4 h-4 text-amber-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Edita
                  </button>

                  <!-- 3. Salva Operação (marcado em verde na imagem 2) -->
                  <button type="button" id="btn-save-draft" onclick="salesModule.saveOrderQuick(event, '${order ? order.id : ''}', '${displayId}')" class="w-full h-12 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Salvar a operação rapidamente como rascunho / orçamento">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    Salva Operação
                  </button>

                  <!-- LINHA INFERIOR (3 BOTÕES) -->
                  <!-- 4. Finalizar Pedido -->
                  <button type="button" id="btn-submit-order" onclick="salesModule.saveOrder(event, '${order ? order.id : ''}', '${displayId}')" class="w-full h-12 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase" title="Gravar e oficializar pedido">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    ${isEdit ? 'Atualizar Pedido' : 'Finalizar Pedido'}
                  </button>

                  <!-- 5. Emitir Pedido -->
                  <button type="button" id="btn-emitir-pedido" onclick="salesModule.printOrder('pedido')" class="w-full h-12 text-sm font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Emitir Pedido / Operação em A4">
                    <svg class="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Emitir Pedido
                  </button>

                  <!-- 6. Emitir O.S. -->
                  <button type="button" id="btn-emitir-os" onclick="salesModule.printOrder('os')" class="w-full h-12 text-sm font-bold text-orange-950 bg-orange-200 hover:bg-orange-300 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer" title="Emitir Ordem de Serviço Técnica em A4 Paisagem">
                    <svg class="w-4 h-4 text-orange-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    Emitir O.S.
                  </button>
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
      btn.className = 'w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors';
      btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>`;
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
    const type = document.getElementById('item-type').value;
    let w = parseFloat(document.getElementById('item-width').value); if(isNaN(w)) w = 0;
    let h = parseFloat(document.getElementById('item-height').value); if(isNaN(h)) h = 0;
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
  printReceipt() {
    const orderIdStr = document.getElementById('current-display-id')?.value;
    const orders = window.store?.getOrders ? window.store.getOrders() : [];
    const savedOrder = (this.currentEditingOrderId && orders.find(o => o.id === this.currentEditingOrderId)) || (orderIdStr && orders.find(o => String(o.numero) === String(orderIdStr)));
    
    // BLOQUEIO DE IMPRESSÃO SEM ID VÁLIDO REGISTRADO (Imagem 3 & 5)
    if (!savedOrder) {
      if (confirm(`O Pedido #${orderIdStr || ''} ainda não foi registrado no sistema.\n\nDeseja salvar e finalizar o pedido agora para emitir o recibo imediatamente?`)) {
        const formEl = document.getElementById('order-form');
        if (formEl) {
          this.saveOrder(null, this.currentEditingOrderId, orderIdStr, { autoPrintAfter: 'recibo' });
          return;
        }
      }
      alert(`Operação negada: O Pedido #${orderIdStr || ''} ainda não foi registrado no sistema. É obrigatório clicar em "Finalizar Pedido" para registrar o ID antes de emitir o recibo.`);
      return;
    }

    const tenant = (window.store && window.store.getActiveTenant ? window.store.getActiveTenant() : null) || {};
    const conf = (window.store?.getSettings ? window.store.getSettings() : {}) || {};
    const companyName = tenant.razao_social || tenant.nome_fantasia || conf.empresa_nome || 'GRAFSIS';
    const companyCNPJ = tenant.cnpj || conf.empresa_cnpj || '00.000.000/0001-00';
    const companyAddress = [tenant.endereco || tenant.logradouro, tenant.numero, tenant.bairro].filter(Boolean).join(', ') || conf.empresa_endereco || 'Endereço não informado';
    const companyCityUf = [tenant.cidade || conf.empresa_cidade || 'Ji-Paraná', tenant.uf || 'RO'].filter(Boolean).join(' - ');
    const companyPhone = tenant.celular_whatsapp || tenant.telefone_fixo || conf.empresa_telefone || '(69) 99922-1336';
    const companyLogo = tenant.logo_url || conf.empresa_logo || '';
    const logoHtml = companyLogo ? `<img src="${companyLogo}" style="max-width: 140px; max-height: 70px; margin: 0 auto 8px auto; display: block; object-fit: contain;">` : '';

    const clientId = savedOrder.cliente_id || document.querySelector('select[name="cliente_id"]')?.value;
    const client = (window.store && window.store.getClients().find(c => c.id === clientId)) || {};
    const clientName = client.nome || savedOrder.cliente_nome || 'Consumidor Final';
    const clientDoc = client.cpf_cnpj || '';
    const clientPhone = client.telefone_whatsapp || '';

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
      const tam = it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` : (it.tipo_calculo === 'linear' ? `${it.comprimento_y}m linear` : 'Unidade');
      const vUnit = Number(it.preco_unitario || it.preco_base || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      const subTot = Number(it.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      return `<div style="margin-bottom: 4px; padding-bottom: 3px; border-bottom: 1px dotted #ccc; text-align: left; font-size: 11px;">
        <strong>${idx + 1} - </strong>Qtde: ${qtd}, ${desc}, Tam: ${tam}, V. Unit: R$ ${vUnit}, Subtotal: R$ ${subTot}
      </div>`;
    }).join('');

    const currentUser = (window.authModule && window.authModule.getCurrentUser ? window.authModule.getCurrentUser() : null) || { nome: 'Operador', role: 'Vendas' };
    const colaboradorStr = `${currentUser.nome || currentUser.login || 'Colaborador'} (${currentUser.role || currentUser.cargo || 'Atendimento'})`;

    const receiptHtml = `
      <html><head><title>Recibo - #${savedOrder.numero || orderIdStr}</title>
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
        @media print {
            body { padding: 0; }
            .receipt { border: none; padding: 0; max-width: 100%; width: 320px; }
        }
      </style>
      </head><body>
      <div class="receipt">
        ${logoHtml}
        <h2>RECIBO</h2>
        <div class="bold" style="font-size:14px; text-transform: uppercase;">${companyName}</div>
        <div style="font-size: 11px;">CNPJ: ${companyCNPJ}</div>
        <div style="font-size: 11px;">${companyAddress}</div>
        <div style="font-size: 11px;">${companyCityUf}</div>
        <div style="font-size: 11px;">Tel: ${companyPhone}</div>
        <div class="line"></div>
        <div class="text-left">
          <p><strong>Pedido ID:</strong> <span class="bold" style="font-size:13px; font-family: monospace;">#${savedOrder.numero || orderIdStr}</span></p>
          <p><strong>Cliente:</strong> ${clientName}${clientDoc ? ' (' + clientDoc + ')' : ''}</p>
          ${clientPhone ? `<p><strong>Telefone:</strong> ${clientPhone}</p>` : ''}
          <p><strong>Data:</strong> ${dateStr}</p>
        </div>
        <div class="line"></div>
        <div class="text-left">
          <div class="bold" style="font-size: 11px; margin-bottom: 5px; text-transform: uppercase;">Itens do Pedido:</div>
          ${itemsListHtml}
        </div>
        <div class="line"></div>
        <div class="text-left">
          <p style="line-height: 1.4;">Recebemos de <strong>${clientName}</strong>${clientDoc ? ' (' + clientDoc + ')' : ''}, a importância de:</p>
          <h2 style="text-align:center; margin: 10px 0; color: #1e3a8a;">R$ ${recebido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
          <p style="text-align:center; font-style: italic; font-size: 11px; margin-bottom: 8px;">(${valExtenso})</p>
          <p><strong>Referente:</strong> ${tipoPagtoTexto} do pedido ID <strong>#${savedOrder.numero || orderIdStr}</strong>.</p>
          <p><strong>Forma Pagto:</strong> ${method}</p>
          ${obs ? `<p><strong>Obs:</strong> ${obs}</p>` : ''}
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
          <p style="font-size: 12px; font-weight: bold; margin: 3px 0;">${companyName}</p>
          <p style="font-size: 11px; color: #444; margin: 2px 0;">Colaborador: ${colaboradorStr}</p>
        </div>
      </div>
      <script>window.print();</script>
      </body></html>
    `;
    this.openPrintDocument(receiptHtml);
  },
  printOrder(type) {
    const orderIdStr = document.getElementById('current-display-id')?.value;
    const orders = window.store?.getOrders ? window.store.getOrders() : [];
    const savedOrder = (this.currentEditingOrderId && orders.find(o => o.id === this.currentEditingOrderId)) || (orderIdStr && orders.find(o => String(o.numero) === String(orderIdStr)));
    
    // BLOQUEIO DE IMPRESSÃO SEM ID VÁLIDO REGISTRADO (Imagem 3 & 5)
    if (!savedOrder) {
      if (confirm(`O Pedido #${orderIdStr || ''} ainda não foi registrado no sistema.\n\nDeseja salvar e registrar o pedido agora para emitir a ${type === 'os' ? 'O.S. Técnica' : 'impressão'} imediatamente?`)) {
        const formEl = document.getElementById('order-form');
        if (formEl) {
          this.saveOrder(null, this.currentEditingOrderId, orderIdStr, { autoPrintAfter: type });
          return;
        }
      }
      alert(`Operação negada: O Pedido #${orderIdStr || ''} ainda não foi registrado no sistema. É necessário clicar em "Finalizar Pedido" para registrar o ID antes de emitir impressões ou O.S.`);
      return;
    }

    // Se for Ordem de Serviço, emite no formato A4 Paisagem Técnico sem valores financeiros (Imagem 2 & 3)
    if (type === 'os') {
      this.printTechnicalWorkOrder(savedOrder.id, { includeImages: true });
      return;
    }

    const clientSelect = document.querySelector('select[name="cliente_id"]');
    const clientId = savedOrder.cliente_id || (clientSelect ? clientSelect.value : null);
    const client = (window.store && window.store.getClients().find(c => c.id === clientId)) || {};
    const clientName = client.nome || savedOrder.cliente_nome || 'Consumidor Final';
    const clientDoc = client.cpf_cnpj || '';
    const clientPhone = client.telefone_whatsapp || '';
    const clientEmail = client.email || '';
    const clientAddress = [client.endereco, client.logradouro, client.numero, client.bairro].filter(Boolean).join(', ') || '';
    const clientCity = [client.cidade, client.uf].filter(Boolean).join(' - ') || '';
    const clientLogo = client.foto_url || '';

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

    const tenant = (window.store && window.store.getActiveTenant()) || {};
    const companyName = tenant.nome_fantasia || tenant.razao_social || 'GRAFSIS';
    const companyCNPJ = tenant.cnpj || '';
    const companyPhone = tenant.celular_whatsapp || tenant.telefone_fixo || '(69) 99922-1336';
    const companyLogo = tenant.logo_url || '';

    const opVal = (savedOrder.tipo_operacao || savedOrder.tipo || 'venda').toLowerCase();
    let title = 'Pedido de Venda';
    if (type === 'os') {
      title = 'Ordem de Serviço';
    } else {
      if (opVal === 'orcamento') title = 'Orçamento Comercial';
      else if (opVal === 'pre-venda') title = 'Proposta de Pré-Venda';
      else if (opVal === 'permuta') title = 'Pedido de Venda (Permuta)';
      else if (opVal === 'patrocinio') title = 'Pedido de Venda (Patrocínio)';
    }

    const diasValidade = document.getElementById('dias-validade')?.value || '10';
    const dataValidadeInput = document.getElementById('data-validade')?.value || '';
    const validadeFormatada = dataValidadeInput ? new Date(dataValidadeInput + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    const percentualOp = document.getElementById('operacao-percentual')?.value || '100';

    const itemsHtml = this.activeItems.map((it, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; vertical-align: top;">${idx+1}</td>
        <td style="padding: 10px 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${it.arte_url ? `<img src="${it.arte_url}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; flex-shrink: 0;">` : ''}
            <div>
              <div style="font-weight: bold; color: #0f172a; font-size: 13px;">${it.produto_nome}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${it.descricao}</div>
            </div>
          </div>
        </td>
        <td style="padding: 10px 8px; vertical-align: top; font-family: monospace; font-size: 12px;">${it.largura_x}m x ${it.comprimento_y}m</td>
        <td style="padding: 10px 8px; text-align: center; vertical-align: top; font-weight: bold;">${it.quantidade}</td>
        <td style="padding: 10px 8px; text-align: right; vertical-align: top; font-family: monospace;">R$ ${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="padding: 10px 8px; text-align: right; vertical-align: top; font-weight: bold; font-family: monospace; color: #0f172a;">R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      </tr>
    `).join('');

    const pdfHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>OP-${orderIdStr}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 15px; font-size: 12px; }
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px; border-bottom: 2px solid #0284c7; margin-bottom: 15px; }
          .client-brand { display: flex; align-items: center; gap: 14px; max-width: 60%; }
          .client-logo-img { max-height: 65px; max-width: 110px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1; padding: 2px; }
          .client-logo-fallback { width: 55px; height: 55px; border-radius: 10px; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; }
          .order-title { text-align: right; }
          .order-title h1 { margin: 0; font-size: 19px; color: #0284c7; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
          .order-title .meta { font-size: 11px; color: #64748b; margin-top: 3px; }
          
          .client-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 15px; display: grid; grid-cols: 1; font-size: 11px; }
          .client-card-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 8px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th { background: #f1f5f9; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          
          .totals-bar { display: flex; justify-content: flex-end; margin-bottom: 20px; }
          .totals-table { width: 280px; font-size: 12px; }
          .totals-table tr td { padding: 4px 6px; }
          .totals-table tr.final-row td { font-size: 16px; font-weight: 900; color: #15803d; border-top: 2px solid #15803d; padding-top: 6px; }

          /* Bloco Inferior: Informações do Pedido e Vistos de Produção / Aceite */
          .validation-section { border-top: 2px dashed #cbd5e1; padding-top: 15px; margin-top: 15px; }
          .order-info-strip { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11px; }
          
          .approval-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .approval-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background: #fff; min-height: 105px; display: flex; flex-col; justify-content: space-between; }
          .approval-title { font-weight: bold; font-size: 11px; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; }
          .sig-line { border-top: 1px solid #94a3b8; margin-top: 30px; padding-top: 4px; text-align: center; font-size: 10px; color: #64748b; font-weight: 600; }

          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <!-- CABEÇALHO COM LOGO E DADOS DO CLIENTE + DADOS DA EMPRESA EMISSORA (Imagem 2) -->
        <div class="header-box">
          <div class="client-brand">
            ${clientLogo 
              ? `<img src="${clientLogo}" class="client-logo-img" alt="Logo Cliente">` 
              : `<div class="client-logo-fallback">${(clientName || 'CL').slice(0,2).toUpperCase()}</div>`
            }
            <div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a;">${clientName}</div>
              ${clientDoc ? `<div style="font-size: 11px; color: #475569;"><strong>CPF/CNPJ:</strong> ${clientDoc}</div>` : ''}
              ${clientAddress ? `<div style="font-size: 11px; color: #475569;"><strong>Endereço:</strong> ${clientAddress}</div>` : ''}
              ${clientCity ? `<div style="font-size: 11px; color: #475569;"><strong>Cidade/UF:</strong> ${clientCity}</div>` : ''}
              ${clientPhone ? `<div style="font-size: 11px; color: #0284c7;"><strong>WhatsApp/Tel:</strong> ${clientPhone}</div>` : ''}
              ${clientEmail ? `<div style="font-size: 11px; color: #64748b;"><strong>E-mail:</strong> ${clientEmail}</div>` : ''}
            </div>
          </div>

          <div class="order-title">
            <h1>${title}</h1>
            <div style="font-size: 18px; font-weight: 900; color: #0f172a; font-family: monospace;">#${orderIdStr}</div>
            <div class="meta"><strong>Emissão:</strong> ${dateStr}</div>
            <div class="meta" style="margin-top: 4px; font-weight: bold; color: #334155;">${companyName}</div>
            ${companyCNPJ ? `<div class="meta">CNPJ: ${companyCNPJ}</div>` : ''}
            ${companyPhone ? `<div class="meta">Suporte: ${companyPhone}</div>` : ''}
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
              <span style="color: #64748b; text-transform: uppercase; font-size: 9px; font-weight: bold; display: block;">${(opVal === 'orcamento' || opVal === 'pre-venda') ? 'Validade da Proposta:' : 'Prazo de Entrega:'}</span>
              <strong style="color: #0f172a; font-size: 13px;">${(opVal === 'orcamento' || opVal === 'pre-venda') ? (validadeFormatada ? validadeFormatada + ' (' + diasValidade + ' dias)' : diasValidade + ' dias') : previsaoFormatada}</strong>
            </div>
            <div>
              <span style="color: #64748b; text-transform: uppercase; font-size: 9px; font-weight: bold; display: block;">${(opVal === 'permuta' || opVal === 'patrocinio') ? 'Operação / %:' : 'Forma de Pagto:'}</span>
              <strong style="color: #0f172a;">${(opVal === 'permuta' || opVal === 'patrocinio') ? opVal.toUpperCase() + ' (' + percentualOp + '%)' : metodoPagto}</strong>
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
                  <span style="font-size: 9px; color: #0284c7;">${autorizoProd ? autorizoProd : 'Visto'}</span>
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
                  <span style="font-size: 9px; color: #16a34a;">${confArte ? confArte : 'OK'}</span>
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

        <script>window.print();</script>
      </body>
      </html>
    `;
    this.openPrintDocument(pdfHtml, 'OP-' + orderIdStr);
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
    const type = document.getElementById('item-type').value;
    let w = parseFloat(document.getElementById('item-width').value); if(isNaN(w)) w = 0;
    let h = parseFloat(document.getElementById('item-height').value); if(isNaN(h)) h = 0;
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
    
    // LIMPA A ARTE DA MEMÓRIA E DO PREVIEW COMPLETAMENTE PARA O PRÓXIMO LAYOUT
    this.removeItemArte();

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
    this.removeItemArte();
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
            <input type="checkbox" ${it.liberado_os !== false ? 'checked' : ''} onchange="salesModule.toggleItemOs(${idx}, this.checked)" title="Liberar item para O.S. (Desmarque para reter)" class="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600">
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
                  <span class="text-[10px] font-mono ${it.liberado_os !== false ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-amber-100 text-amber-800 border-amber-300'} border px-1.5 py-0.5 rounded font-black cursor-pointer hover:bg-blue-200 transition" onclick="salesModule.isolateItemForOs(${idx})" title="Clique para isolar este item na O.S. / visualização">#${it.item_id || '----'}</span>
                  ${it.produto_nome || ''}
                  ${it.liberado_os === false ? '<span class="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Aguardando Liberação</span>' : ''}
                </div>
                <div class="text-[11px] text-slate-500 font-medium mt-0.5">${it.descricao}</div>
              </div>
            </div>
          </td>
          <td class="p-3 font-mono text-xs text-slate-700">${it.tipo_calculo === 'm2' ? it.largura_x + 'm x ' + it.comprimento_y + 'm' : (it.tipo_calculo === 'linear' ? it.largura_x + 'm linear' : 'UNID')}</td>
          <td class="p-3 font-bold text-center text-xs">${it.quantidade}</td>
          <td class="p-3 font-mono text-xs text-purple-700 font-bold">${it.tipo_calculo !== 'unidade' ? (it.area_m2 * it.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + (it.tipo_calculo === 'm2' ? ' m²' : ' m') : '-'}</td>
          <td class="p-3 font-mono text-xs text-slate-700">R$ ${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="p-3 font-bold text-blue-700 text-xs">R$ ${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td class="p-3 text-right">
            <div class="flex justify-end gap-1">
              <button type="button" onclick="salesModule.editItem(${idx})" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="Editar Item">&#9998;</button>
              <button type="button" onclick="salesModule.removeItem(${idx})" class="text-rose-600 hover:bg-rose-50 p-1.5 rounded" title="Remover Item">&times;</button>
            </div>
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
      saveBtn.innerHTML = `<span>Salvando...</span>`;
    }

    try {
      const activeDisplayId = document.getElementById('current-display-id')?.value;
      const currentId = (id && typeof isValidUUID === 'function' && isValidUUID(id)) 
        ? id 
        : (this.currentEditingOrderId && typeof isValidUUID === 'function' && isValidUUID(this.currentEditingOrderId) && this.currentEditingOrderId === id 
            ? this.currentEditingOrderId 
            : null);
      const isExistingOrder = !!currentId;
      const oldOrder = isExistingOrder ? window.store.getOrders().find(o => o.id === currentId) : null;
      const finalNumber = (isExistingOrder && oldOrder && oldOrder.numero) ? oldOrder.numero : (activeDisplayId || geradoNumero || this.getNextOrderId());

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
      const op = form.tipo_operacao ? form.tipo_operacao.value : 'orcamento';
      const rawEntrada = document.getElementById("order-valor-entrada")?.value || document.getElementById("order-valor-recebido")?.value || '0';
      const cleanEntrada = String(rawEntrada).trim().replace(/\./g, '').replace(',', '.');
      const valorEntrada = parseFloat(cleanEntrada) || 0;
      const saldoRestante = Math.max(0, finalTotal - valorEntrada);
      const statusPagto = (saldoRestante <= 0.01 && finalTotal > 0) ? 'pago' : (valorEntrada > 0 ? 'parcial' : 'pendente');

      let historico = oldOrder?.historico ? JSON.parse(JSON.stringify(oldOrder.historico)) : [];
      historico.push({
        fase: 'orcamento',
        data: new Date().toISOString(),
        usuario: window.app?.currentUser?.nome || 'Operador'
      });

      const orderData = {
        id: currentId || undefined,
        numero: finalNumber,
        cliente_id: clienteId,
        tipo_operacao: op,
        tipo: op,
        vendedor: window.app?.currentUser?.nome || "Vendedor",
        status_fase: 'orcamento',
        previsao_entrega: form.previsao_entrega?.value || null,
        validade_proposta_dias: form.validade_proposta_dias ? (parseInt(form.validade_proposta_dias.value) || 10) : 10,
        data_validade: form.data_validade ? form.data_validade.value : null,
        percentual_operacao: 100,
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
        valor_total: subtotal,
        desconto: discount,
        valor_final: finalTotal,
        itens: this.activeItems,
        historico: historico
      };

      const saved = await window.store.saveOrder(orderData);
      this.currentEditingOrderId = null;

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
      }

      alert(`Operação #${saved.numero} salva com sucesso no sistema!`);
      this.render();
    } catch (err) {
      console.error('[GRAFSIS] Erro ao salvar operação rápida:', err);
      alert('Erro ao salvar operação: ' + (err.message || err));
    } finally {
      if (saveBtn) {
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

    const clienteId = form.cliente_id ? form.cliente_id.value : document.getElementById('order-cliente-select')?.value;
    if (!clienteId) {
      alert('Selecione um cliente para prosseguir com o pedido.');
      return;
    }
    if (!this.activeItems || this.activeItems.length === 0) { 
      alert('Adicione pelo menos um item ao pedido antes de finalizar.'); 
      return; 
    }

    const submitBtn = document.getElementById('btn-submit-order');
    const originalBtnText = submitBtn ? submitBtn.innerText : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Gravando...';
    }

    try {
      const { subtotal, discount, finalTotal } = this.recalcTotals();
      const op = form.tipo_operacao ? form.tipo_operacao.value : 'venda';
      
      // Perfis autorizados para Permuta e Patrocínio
      if ((op === 'permuta' || op === 'patrocinio') && !this.canManagePermutaPatrocinio()) {
        alert('Operação negada: Permuta e Patrocínio só podem ser autorizados pelos perfis Gerente ou Proprietário.');
        return;
      }

      let historico = [];
      const currentId = (id && typeof isValidUUID === 'function' && isValidUUID(id)) 
        ? id 
        : (this.currentEditingOrderId && typeof isValidUUID === 'function' && isValidUUID(this.currentEditingOrderId) && this.currentEditingOrderId === id 
            ? this.currentEditingOrderId 
            : null);
      const isExistingOrder = !!currentId;
      const oldOrder = isExistingOrder ? window.store.getOrders().find(o => o.id === currentId) : null;
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

      const activeDisplayId = document.getElementById('current-display-id')?.value;
      const finalNumber = (isExistingOrder && oldOrder && oldOrder.numero) ? oldOrder.numero : (activeDisplayId || geradoNumero || this.getNextOrderId());

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
        tipo_operacao: op,
        tipo: op,
        vendedor: window.app?.currentUser?.nome || "Vendedor",
        status_fase: newPhase,
        previsao_entrega: (op === 'orcamento' || op === 'pre-venda') ? (form.previsao_entrega?.value || null) : (form.previsao_entrega?.value || null),
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
        valor_total: subtotal,
        desconto: discount,
        valor_final: finalTotal,
        itens: this.activeItems,
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

      // Restaura o botão ANTES do alert nativo para evitar parecer travado em 'Gravando...'
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }

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
          alert(`Pedido #${saved.numero} registrado e gravado com sucesso no sistema!\n\n(Aviso: permita pop-ups no navegador para abrir a impressão automaticamente).`);
        }
      } else {
        alert(`Pedido #${saved.numero} registrado e gravado com sucesso no sistema!`);
      }

      this.render();
    } catch (err) {
      console.error('[GRAFSIS] Erro ao salvar pedido:', err);
      alert('Erro ao gravar pedido no sistema: ' + (err.message || err));
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
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

  handleEditAction(orderId) {
    if (orderId) {
      this.currentEditingOrderId = orderId;
    }
    const clientSel = document.getElementById('order-cliente-select') || document.querySelector('select[name="cliente_id"]');
    const prodSel = document.getElementById('item-prod-select');
    if (prodSel) prodSel.focus();
    else if (clientSel) clientSel.focus();
    
    // Feedback visual
    const displayId = document.getElementById('current-display-id')?.value || '';
    const badge = document.createElement('div');
    badge.className = 'fixed bottom-4 right-4 z-50 bg-amber-500 text-amber-950 font-black px-4 py-2 rounded-xl shadow-lg border border-amber-600 animate-bounce text-sm';
    badge.innerText = `Modo de Edição ativo no Pedido #${displayId || ''}!`;
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 2500);
  },
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
      'orcamento': '1. ORÇAMENTO',
      'prevenda': '2. PRÉ-VENDA',
      'aprovacao': '3. APROVAÇÃO DA ARTE',
      'liberado': '4. LIBERADO P/ OFICINA',
      'producao': '5. EM IMPRESSÃO / PRODUÇÃO',
      'acabamento': '6. ACABAMENTO / SOLDA',
      'embalagem': '7. EMBALAGEM & EXPEDIÇÃO',
      'entregue': '8. CONCLUÍDO / ENTREGUE'
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
                ${order.foto_arte_url ? `<span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300">Arquivo Conforme</span>` : ''}
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
    const client = (window.store && window.store.getClients().find(c => c.id === order.cliente_id)) || {
      nome: order.cliente_nome || 'Cliente não informado',
      telefone_whatsapp: '',
      cpf_cnpj: '',
      endereco: '',
      cidade: '',
      uf: ''
    };

    const tenant = (window.store && window.store.getActiveTenant()) || {};
    const companyName = tenant.nome_fantasia || tenant.razao_social || 'GRAFSIS COMUNICAÇÃO VISUAL';
    const companyCNPJ = tenant.cnpj || '';
    const companyPhone = tenant.celular_whatsapp || tenant.telefone_fixo || '(69) 99922-1336';
    const companyAddress = [tenant.endereco || tenant.logradouro, tenant.numero, tenant.bairro, tenant.cidade, tenant.uf].filter(Boolean).join(', ') || 'Endereço não informado';
    const companyLogo = tenant.logo_url || '';

    const phaseNames = {
      'orcamento': '1. ORÇAMENTO',
      'prevenda': '2. PRÉ-VENDA',
      'aprovacao': '3. APROVAÇÃO DA ARTE',
      'liberado': '4. LIBERADO P/ PRODUÇÃO',
      'producao': '5. EM IMPRESSÃO / PRODUÇÃO',
      'acabamento': '6. ACABAMENTO / SOLDA',
      'embalagem': '7. EMBALAGEM & EXPEDIÇÃO',
      'entregue': '8. CONCLUÍDO / ENTREGUE'
    };
    const faseNome = phaseNames[order.status_fase] || (order.status_fase || 'PRODUÇÃO').toUpperCase();

    const dataPedido = order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : (order.data_criacao ? new Date(order.data_criacao).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'));
    const prazoEntrega = order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'A Combinar';
    const clientAddressStr = [client.endereco, client.numero, client.bairro, client.cidade, client.uf].filter(Boolean).join(', ');

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
              <span>Cliente / Empresa</span>
              <strong>${client.nome}</strong>
              <div style="font-size: 9.5px; color: #475569;">${client.cpf_cnpj ? client.cpf_cnpj + ' &bull; ' : ''}${client.telefone_whatsapp || ''}</div>
              ${clientAddressStr ? `<div style="font-size: 9px; color: #64748b;">${clientAddressStr}</div>` : ''}
            </div>
            <div class="cell">
              <span>Data do Pedido</span>
              <strong>${dataPedido}</strong>
              <div style="font-size: 9px; color: #64748b;">Vendedor: ${order.vendedor || 'Comercial'}</div>
            </div>
            <div class="cell">
              <span>Prazo de Entrega</span>
              <strong style="color: #b91c1c; font-size: 13px;">${prazoEntrega}</strong>
              <div style="font-size: 9px; color: #64748b;">Operador: ${order.operador || 'Oficina Geral'}</div>
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
              <strong>Observações Técnicas / Instruções de Produção:</strong> ${order.observacoes}
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




















