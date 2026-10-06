window.selfserviceModule = {
  currentClient: null,
  currentTab: 'pedido',
  cart: [],
  photoDataUrl: null,

  getSettings() {
    const s = localStorage.getItem('grafsis_cracha_settings');
    let parsed = s ? JSON.parse(s) : { templates: [] };
    if (parsed.price !== undefined && !parsed.templates) {
      parsed = { templates: [{ id: 'tpl_1', name: 'Crachá Padrão', price: parsed.price || 15, bg_front: parsed.bg_url || '', bg_back: '' }] };
      this.saveSettings(parsed);
    }
    if (!parsed.templates || parsed.templates.length === 0) {
      parsed.templates = [{ id: 'tpl_1', name: 'Crachá Padrão', price: 15, bg_front: '', bg_back: '' }];
    }
    return parsed;
  },
  
  saveSettings(s) {
    localStorage.setItem('grafsis_cracha_settings', JSON.stringify(s));
  },
  
  render() {
    const container = document.getElementById('view-container');
    if (!this.currentClient) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[70vh]">
          <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 text-center">
            <h1 class="text-2xl font-black text-slate-800 mb-2">Autoatendimento</h1>
            <p class="text-slate-500 mb-6">Acesse com seu CPF ou Telefone para solicitar seus produtos.</p>
            <form onsubmit="selfserviceModule.login(event)" class="space-y-4">
              <input type="text" id="ss-login-doc" required placeholder="Digite CPF ou Celular" class="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-lg font-bold focus:ring-2 focus:ring-blue-500">
              <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md">ENTRAR</button>
            </form>
          </div>
        </div>
      `;
    } else {
      this.renderDashboard();
    }
  },

  login(e) {
    e.preventDefault();
    const doc = document.getElementById('ss-login-doc').value.trim().replace(/\D/g, '');
    const clients = window.store.getClients();
    const client = clients.find(c => {
      const cDoc = (c.cpf_cnpj || '').replace(/\D/g, '');
      const cPhone = (c.telefone_whatsapp || '').replace(/\D/g, '');
      return (cDoc && cDoc === doc) || (cPhone && cPhone === doc);
    });
    if (client) {
      this.currentClient = client;
      this.currentTab = 'pedido';
      this.cart = [];
      this.photoDataUrl = null;
      this.renderDashboard();
    } else {
      alert('Cliente não encontrado. Verifique o número digitado ou dirija-se ao balcão.');
    }
  },

  logout() {
    this.currentClient = null;
    this.photoDataUrl = null;
    this.cart = [];
    this.render();
  },

  setTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  renderDashboard() {
    const container = document.getElementById('view-container');
    const c = this.currentClient;
    const saldo = Number(c.saldo_corrente) || 0;
    const user = window.authModule.getCurrentUser();
    const isAdmin = user && ['ADMIN', 'PROPRIETARIO', 'GERENTE', 'ADMINISTRADOR'].includes(user.role.toUpperCase());

    let tabContent = '';
    if (this.currentTab === 'pedido') tabContent = this.getPedidoTabHtml();
    else if (this.currentTab === 'pedidos') tabContent = this.getPedidosTabHtml();
    else if (this.currentTab === 'perfil') tabContent = this.getPerfilTabHtml();
    else if (this.currentTab === 'config' && isAdmin) tabContent = this.getConfigTabHtml();

    container.innerHTML = `
      <div class="max-w-5xl mx-auto py-6">
        <!-- HEADER DO CLIENTE -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-600 text-white p-6 rounded-2xl shadow-lg mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold">Olá, ${c.nome}!</h2>
            <p class="text-blue-100 text-sm">Bem-vindo ao Autoatendimento</p>
          </div>
          <div class="sm:text-right bg-blue-700/50 p-3 rounded-xl border border-blue-500 w-full sm:w-auto flex justify-between sm:block items-center">
            <p class="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Saldo na Conta Corrente</p>
            <p class="text-2xl font-black">R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <button onclick="selfserviceModule.logout()" class="text-xs text-blue-200 hover:text-white underline mt-1 hidden sm:inline-block">Sair da Conta</button>
          </div>
          <button onclick="selfserviceModule.logout()" class="sm:hidden text-xs text-blue-200 hover:text-white underline">Sair da Conta</button>
        </div>

        <!-- MENU DE NAVEGAÇÃO -->
        <div class="flex flex-wrap gap-3 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <button onclick="selfserviceModule.setTab('pedido')" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${this.currentTab === 'pedido' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} flex-1 sm:flex-none text-center">Novo Pedido</button>
          <button onclick="selfserviceModule.setTab('pedidos')" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${this.currentTab === 'pedidos' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} flex-1 sm:flex-none text-center">Meus Pedidos</button>
          <button onclick="selfserviceModule.setTab('perfil')" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${this.currentTab === 'perfil' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} flex-1 sm:flex-none text-center">Perfil</button>
          ${isAdmin ? `<button onclick="selfserviceModule.setTab('config')" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${this.currentTab === 'config' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'} flex-1 sm:flex-none text-center">Configuração (Admin)</button>` : ''}
        </div>

        <!-- CONTEÚDO DA ABA -->
        ${tabContent}
      </div>
    `;

    if (this.currentTab === 'pedido') {
      setTimeout(() => this.preview(), 50);
    } else if (this.currentTab === 'pedidos') {
      this.loadPedidosList();
    }
  },

  // ==========================================
  // ABA: NOVO PEDIDO (CRACHÁ)
  // ==========================================
  getPedidoTabHtml() {
    const template = this.getSettings().templates[0]; // Sempre usa o padrao 0
    const preco = Number(template.price) || 0;
    
    // Lista de crachás no carrinho
    let cartHtml = '';
    let cartTotal = 0;
    if (this.cart.length > 0) {
      cartTotal = this.cart.reduce((acc, item) => acc + item.preco, 0);
      cartHtml = `
        <div class="mt-8 border-t pt-6">
          <h4 class="font-black text-slate-800 mb-4 flex items-center justify-between">
            <span>Crachás no Pedido Atual (${this.cart.length})</span>
            <span class="text-blue-700 text-xl">Total: R$ ${cartTotal.toFixed(2)}</span>
          </h4>
          <div class="space-y-3 mb-6">
            ${this.cart.map((item, idx) => `
              <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                    ${item.foto ? `<img src="${item.foto}" class="w-full h-full object-cover">` : ''}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">${item.nome}</p>
                    <p class="text-[10px] font-bold text-slate-500 uppercase">MAT: ${item.mat || '--'} | TIPO: ${item.sangue || '--'}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="font-black text-slate-700 text-sm">R$ ${item.preco.toFixed(2)}</span>
                  <button type="button" onclick="selfserviceModule.removeFromCart(${idx})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Remover">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" onclick="selfserviceModule.checkout()" class="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl transition shadow-md uppercase tracking-wider flex justify-center items-center gap-2 text-lg">
            FINALIZAR COMPRA (Descontar R$ ${cartTotal.toFixed(2)})
          </button>
        </div>
      `;
    }

    return `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
           <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
           Solicitar Novo Crachá
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- FORMULÁRIO -->
          <div>
            <form id="cracha-form" class="space-y-5" onsubmit="selfserviceModule.addToCart(event)">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nome no Crachá *</label>
                <input type="text" id="cr-nome" required oninput="selfserviceModule.preview()" placeholder="EX: JOÃO SILVA" class="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500 font-bold text-slate-800">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Matrícula / ID *</label>
                  <input type="text" id="cr-mat" required oninput="selfserviceModule.preview()" class="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500 font-bold text-slate-800">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Tipo Sanguíneo</label>
                  <input type="text" id="cr-sangue" oninput="selfserviceModule.preview()" placeholder="EX: O+" class="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500 font-bold text-slate-800">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Sua Foto (Selfie ou Arquivo) *</label>
                <input type="file" id="cr-foto" required accept="image/*" onchange="selfserviceModule.handlePhoto(this)" class="w-full text-sm p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition">
              </div>
              
              <div class="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                  <span class="font-bold text-slate-600 text-sm">Valor do Crachá:</span>
                  <span class="font-black text-blue-700 text-xl">R$ ${preco.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow flex justify-center items-center gap-2 uppercase tracking-wide text-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  Adicionar Crachá ao Pedido
                </button>
              </div>
            </form>
          </div>

          <!-- PREVIEW -->
          <div class="flex flex-col items-center justify-start border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8 border-slate-200 overflow-x-auto">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pré-visualização do Crachá</p>
            <div class="flex flex-col sm:flex-row gap-6">
              <!-- Frente -->
              <div class="flex flex-col items-center">
                <div class="relative w-[200px] h-[316px] border border-orange-500 shadow-lg rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  <span class="absolute text-slate-400 text-xs font-bold preview-loading">FRENTE...</span>
                  <canvas id="cracha-canvas-front" width="250" height="395" class="w-full h-full relative z-10 scale-80" style="transform: scale(0.8); transform-origin: top left;"></canvas>
                </div>
                <span class="text-xs font-black text-orange-600 mt-2 bg-orange-100 px-3 py-1 rounded-full">FRENTE</span>
              </div>
              <!-- Verso -->
              <div class="flex flex-col items-center">
                <div class="relative w-[200px] h-[316px] border border-yellow-400 shadow-lg rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  <span class="absolute text-slate-400 text-xs font-bold preview-loading">VERSO...</span>
                  <canvas id="cracha-canvas-back" width="250" height="395" class="w-full h-full relative z-10 scale-80" style="transform: scale(0.8); transform-origin: top left;"></canvas>
                </div>
                <span class="text-xs font-black text-yellow-600 mt-2 bg-yellow-100 px-3 py-1 rounded-full">VERSO</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CARRINHO -->
        ${cartHtml}
      </div>
    `;
  },

  handlePhoto(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoDataUrl = e.target.result;
      this.preview();
    };
    reader.readAsDataURL(file);
  },

  preview() {
    const canvasF = document.getElementById('cracha-canvas-front');
    const canvasB = document.getElementById('cracha-canvas-back');
    if (!canvasF || !canvasB) return;
    
    document.querySelectorAll('.preview-loading').forEach(el => el.style.display = 'none');
    
    const ctxF = canvasF.getContext('2d');
    const ctxB = canvasB.getContext('2d');
    
    const template = this.getSettings().templates[0]; // Padrão

    const nome = document.getElementById('cr-nome')?.value || 'NOME DO CLIENTE';
    const mat = document.getElementById('cr-mat')?.value || '123456';
    const sangue = document.getElementById('cr-sangue')?.value || '';

    // -- Render Front --
    const drawFront = () => {
      ctxF.fillStyle = '#ffffff';
      ctxF.fillRect(0, 0, canvasF.width, canvasF.height);
      const drawTextsAndPhoto = () => {
        ctxF.save();
        if (this.photoDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctxF.beginPath(); ctxF.arc(125, 150, 60, 0, Math.PI * 2, true); ctxF.closePath(); ctxF.clip();
            const sizer = Math.max(120 / img.width, 120 / img.height);
            const drawW = img.width * sizer; const drawH = img.height * sizer;
            ctxF.drawImage(img, 125 - drawW/2, 150 - drawH/2, drawW, drawH);
            ctxF.restore(); drawFTexts();
          };
          img.src = this.photoDataUrl;
        } else {
          ctxF.beginPath(); ctxF.arc(125, 150, 60, 0, Math.PI * 2, true);
          ctxF.fillStyle = '#e2e8f0'; ctxF.fill(); ctxF.closePath(); ctxF.restore();
          drawFTexts();
        }
      };
      const drawFTexts = () => {
        ctxF.fillStyle = '#1e293b'; ctxF.textAlign = 'center'; ctxF.font = '900 20px Arial, sans-serif';
        ctxF.fillText(nome.toUpperCase(), 125, 250, 230);
        ctxF.font = 'bold 12px Arial, sans-serif'; ctxF.fillStyle = '#64748b';
        if (mat) ctxF.fillText('MATRÍCULA: ' + mat.toUpperCase(), 125, 275);
        if (sangue) {
          ctxF.fillStyle = '#e11d48'; ctxF.font = '900 16px Arial, sans-serif';
          ctxF.fillText('SANGUE: ' + sangue.toUpperCase(), 125, 305);
        }
      };

      if (template && template.bg_front) {
        const bg = new Image();
        bg.onload = () => { ctxF.drawImage(bg, 0, 0, canvasF.width, canvasF.height); drawTextsAndPhoto(); };
        bg.onerror = () => drawTextsAndPhoto();
        bg.src = template.bg_front;
      } else { drawTextsAndPhoto(); }
    };

    // -- Render Back --
    const drawBack = () => {
      ctxB.fillStyle = '#ffffff';
      ctxB.fillRect(0, 0, canvasB.width, canvasB.height);
      const drawBTexts = () => {
        ctxB.fillStyle = '#1e293b'; ctxB.textAlign = 'center'; ctxB.font = 'bold 14px Arial, sans-serif';
        ctxB.fillText(nome.toUpperCase(), 125, 360, 230);
      };
      if (template && template.bg_back) {
        const bg2 = new Image();
        bg2.onload = () => { ctxB.drawImage(bg2, 0, 0, canvasB.width, canvasB.height); drawBTexts(); };
        bg2.onerror = () => drawBTexts();
        bg2.src = template.bg_back;
      } else { drawBTexts(); }
    };

    drawFront();
    drawBack();
  },

  addToCart(e) {
    e.preventDefault();
    const template = this.getSettings().templates[0];
    const preco = Number(template.price) || 0;
    
    const nome = document.getElementById('cr-nome').value.trim();
    const mat = document.getElementById('cr-mat').value.trim();
    const sangue = document.getElementById('cr-sangue').value.trim();
    
    if (!this.photoDataUrl) {
      alert("Por favor, selecione uma foto.");
      return;
    }
    
    // Captura as artes geradas
    const canvasF = document.getElementById('cracha-canvas-front');
    const canvasB = document.getElementById('cracha-canvas-back');
    const finalImageFront = canvasF.toDataURL('image/png');
    const finalImageBack = canvasB.toDataURL('image/png');

    this.cart.push({
      nome,
      mat,
      sangue,
      foto: this.photoDataUrl,
      preco,
      frontUrl: finalImageFront,
      backUrl: finalImageBack,
      templateName: template.name || 'Crachá'
    });

    // Limpa o formulário para o próximo
    this.photoDataUrl = null;
    this.renderDashboard();
  },

  removeFromCart(idx) {
    this.cart.splice(idx, 1);
    this.renderDashboard();
  },

  async checkout() {
    if (this.cart.length === 0) return;

    const totalPreco = this.cart.reduce((acc, item) => acc + item.preco, 0);
    this.currentClient.saldo_corrente = Number(this.currentClient.saldo_corrente) || 0;
    
    if (this.currentClient.saldo_corrente < totalPreco) {
      alert(`SALDO INSUFICIENTE!\n\nVocê possui R$ ${this.currentClient.saldo_corrente.toFixed(2)}.\nO pedido custa R$ ${totalPreco.toFixed(2)}.\n\nVá na aba "Meus Pedidos" para recarregar com PIX.`);
      return;
    }

    if(!confirm(`CONFIRMAR PEDIDO DE ${this.cart.length} CRACHÁ(S)?\n\nSerão descontados R$ ${totalPreco.toFixed(2)} do seu saldo.`)) return;

    const clients = window.store.getClients();
    const idx = clients.findIndex(c => c.id === this.currentClient.id);
    if(idx > -1) {
      clients[idx].saldo_corrente = (Number(clients[idx].saldo_corrente) || 0) - totalPreco;
      await window.store.saveClient(clients[idx]);
      this.currentClient.saldo_corrente = clients[idx].saldo_corrente;
    }
    
    const dtNow = new Date().toISOString();
    
    const pedido = {
      id: Date.now().toString(),
      numero: window.store.getOrders().length + 1001,
      cliente_id: this.currentClient.id,
      tipo_operacao: 'venda',
      status_pagamento: 'pago',
      status_fase: 'producao',
      data_criacao: dtNow,
      dias_entrega: 2,
      previsao_entrega: dtNow.split('T')[0],
      itens: this.cart.map(item => ({
        produto_id: '',
        descricao: `${item.templateName} (Autoatendimento) - ${item.nome}`,
        quantidade: 1,
        tipo_calculo: 'unidade',
        preco_base: item.preco,
        preco_unitario: item.preco,
        valor_total: item.preco,
        arte_url: item.frontUrl,
        arte_verso_url: item.backUrl
      })),
      historico: [{ data: dtNow, usuario: 'Autoatendimento', acao: `Pedido gerado com ${this.cart.length} item(ns). Pago usando Saldo.` }]
    };

    await window.store.saveOrder(pedido);
    await window.store.saveFinanceEntry({
      tipo: 'receber',
      descricao: `Pagamento de Autoatendimento (${this.cart.length} itens) via Saldo - Pedido #${pedido.numero}`,
      valor: totalPreco,
      data_vencimento: dtNow.split('T')[0],
      data_pagamento: dtNow.split('T')[0],
      status: 'pago',
      forma_pagamento: 'saldo_corrente',
      pedido_id: pedido.id
    });

    alert('PEDIDO ENVIADO PARA PRODUÇÃO!\n\nSeu pedido foi registrado e o valor descontado da conta.');
    this.cart = []; // Limpa o carrinho
    this.setTab('pedidos');
  },

  // ==========================================
  // ABA: MEUS PEDIDOS & PIX
  // ==========================================
  getPedidosTabHtml() {
    return `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h3 class="text-lg font-bold text-slate-800">Meus Pedidos</h3>
          <button onclick="selfserviceModule.openPixModal()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
             Recarregar Saldo (PIX)
          </button>
        </div>
        <div id="ss-pedidos-list" class="space-y-4">Carregando pedidos...</div>
      </div>
    `;
  },
  loadPedidosList() {
    const listEl = document.getElementById('ss-pedidos-list');
    if (!listEl) return;
    const orders = window.store.getOrders().filter(o => o.cliente_id === this.currentClient.id).sort((a,b) => b.numero - a.numero);
    
    if (orders.length === 0) {
      listEl.innerHTML = '<p class="text-slate-500 text-center py-4">Nenhum pedido encontrado.</p>';
      return;
    }
    
    listEl.innerHTML = orders.map(o => {
      let desc = 'Produto Genérico';
      if (o.itens && o.itens.length > 0) {
        if (o.itens.length === 1) desc = o.itens[0].descricao;
        else desc = `Pedido com ${o.itens.length} crachás`;
      }
      const total = (o.itens || []).reduce((acc, it) => acc + (it.valor_total || 0), 0);
      const dataFormat = new Date(o.data_criacao).toLocaleDateString('pt-BR');
      return `
        <div class="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 hover:bg-slate-100 transition">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-slate-800">Pedido #${o.numero}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">${o.status_fase}</span>
            </div>
            <p class="text-sm text-slate-600">${desc}</p>
            <p class="text-xs text-slate-400 mt-1">Realizado em ${dataFormat}</p>
          </div>
          <div class="text-right">
            <p class="font-black text-lg text-slate-800">R$ ${total.toFixed(2)}</p>
          </div>
        </div>
      `;
    }).join('');
  },
  openPixModal() {
    const html = `
      <div id="pix-modal" class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl border border-slate-100">
           <h2 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Recarga via PIX (Simulação)</h2>
           <label class="block text-xs font-bold text-slate-600 text-left mb-1">Valor da Recarga (R$)</label>
           <input type="number" id="pix-valor" class="w-full border border-slate-300 p-3 mb-6 rounded-lg text-center text-xl font-black text-green-700 focus:ring-2 focus:ring-green-500" value="50.00" step="10.00">
           
           <div class="bg-slate-100 w-48 h-48 mx-auto flex flex-col items-center justify-center mb-4 rounded-xl border border-slate-200 shadow-inner">
             <svg class="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
             <span class="text-slate-400 text-xs font-bold px-4">Aqui entraria o QR Code PIX</span>
           </div>
           
           <p class="text-xs text-slate-500 mb-6">Como isto é apenas uma demonstração, clique no botão abaixo para simular que o pagamento foi compensado.</p>
           
           <button onclick="selfserviceModule.confirmPix()" class="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl mb-2 transition shadow-md uppercase tracking-wide">Simular Pagamento</button>
           <button onclick="document.getElementById('pix-modal').remove()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition">Cancelar</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },
  async confirmPix() {
    const valor = parseFloat(document.getElementById('pix-valor').value) || 0;
    if (valor <= 0) return;
    
    this.currentClient.saldo_corrente = (Number(this.currentClient.saldo_corrente) || 0) + valor;
    await window.store.saveClient(this.currentClient);
    
    document.getElementById('pix-modal').remove();
    this.render();
    alert(\`Recarga PIX de R$ \${valor.toFixed(2)} realizada com sucesso (Simulada). O saldo já está disponível na sua conta.\`);
  },

  // ==========================================
  // ABA: PERFIL
  // ==========================================
  getPerfilTabHtml() {
    const c = this.currentClient;
    return `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Meu Perfil</h3>
        <form onsubmit="selfserviceModule.saveProfile(event)" class="space-y-4 max-w-3xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label class="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label><input type="text" id="pf-nome" value="${c.nome || ''}" class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500" required></div>
            <div><label class="block text-xs font-bold text-slate-700 mb-1">Telefone/WhatsApp</label><input type="text" id="pf-tel" value="${c.telefone_whatsapp || ''}" class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500" required></div>
            <div><label class="block text-xs font-bold text-slate-700 mb-1">E-mail</label><input type="email" id="pf-email" value="${c.email || ''}" class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"></div>
            <div>
              <div class="grid grid-cols-3 gap-2">
                 <div class="col-span-2"><label class="block text-xs font-bold text-slate-700 mb-1">Cidade</label><input type="text" id="pf-cid" value="${c.cidade || ''}" class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"></div>
                 <div><label class="block text-xs font-bold text-slate-700 mb-1">UF</label><input type="text" id="pf-uf" value="${c.uf || ''}" class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500" maxlength="2"></div>
              </div>
            </div>
            <div class="md:col-span-2 border-t pt-4">
               <label class="block text-xs font-bold text-slate-700 mb-1">Nova Senha de Acesso (opcional)</label>
               <input type="password" id="pf-senha" class="w-full md:w-1/2 border border-slate-300 p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500" placeholder="Deixe em branco para não alterar">
            </div>
          </div>
          <div class="border-t pt-4 mt-6">
             <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md uppercase text-sm">Salvar Alterações do Perfil</button>
          </div>
        </form>
      </div>
    `;
  },
  async saveProfile(e) {
    e.preventDefault();
    this.currentClient.nome = document.getElementById('pf-nome').value;
    this.currentClient.telefone_whatsapp = document.getElementById('pf-tel').value;
    this.currentClient.cidade = document.getElementById('pf-cid').value;
    this.currentClient.uf = document.getElementById('pf-uf').value;
    this.currentClient.email = document.getElementById('pf-email').value;
    const s = document.getElementById('pf-senha').value;
    if (s) {
      if (!this.currentClient.observacoes) this.currentClient.observacoes = '';
      this.currentClient.observacoes += `\n[Senha Atualizada no Autoatendimento]`;
    }
    
    await window.store.saveClient(this.currentClient);
    alert('Seu perfil foi atualizado com sucesso.');
    this.render();
  },

  // ==========================================
  // ABA: CONFIGURAÇÃO (ADMIN)
  // ==========================================
  getConfigTabHtml() {
    const templates = this.getSettings().templates;
    return `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h3 class="text-lg font-bold text-slate-800">Modelos Base de Produtos (Templates)</h3>
        </div>
        <p class="text-sm text-slate-600 mb-4">Apenas o primeiro modelo desta lista é usado como base para os novos crachás.</p>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 text-sm">
                <th class="p-3 border-b font-bold rounded-tl-lg">Nome do Produto</th>
                <th class="p-3 border-b font-bold">Preço Base</th>
                <th class="p-3 border-b font-bold text-center">Frente</th>
                <th class="p-3 border-b font-bold text-center">Verso</th>
                <th class="p-3 border-b font-bold text-right rounded-tr-lg">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${templates.map(t => `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                  <td class="p-3 font-semibold text-slate-800">${t.name}</td>
                  <td class="p-3 text-blue-700 font-bold">R$ ${Number(t.price).toFixed(2)}</td>
                  <td class="p-3 text-center">${t.bg_front ? '<span class="text-green-600 font-bold text-xs">Sim</span>' : '<span class="text-slate-400 text-xs">Não</span>'}</td>
                  <td class="p-3 text-center">${t.bg_back ? '<span class="text-green-600 font-bold text-xs">Sim</span>' : '<span class="text-slate-400 text-xs">Não</span>'}</td>
                  <td class="p-3 text-right">
                    <button onclick="selfserviceModule.editTemplate('${t.id}')" class="text-indigo-600 font-bold text-sm hover:underline">Editar Arte Base</button>
                  </td>
                </tr>
              `).join('')}
              ${templates.length === 0 ? '<tr><td colspan="5" class="p-6 text-center text-slate-500 font-bold">Nenhum modelo cadastrado.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  editTemplate(id) {
    let t = { id: 'new', name: '', price: 0, bg_front: '', bg_back: '' };
    if (id !== 'new') {
      const found = this.getSettings().templates.find(x => x.id === id);
      if (found) t = found;
    }
    
    const html = `
      <div id="tpl-modal" class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
           <h2 class="font-bold text-xl text-slate-800 mb-4 border-b pb-2">Editar Arte Base do Crachá</h2>
           <input type="hidden" id="tpl-id" value="${t.id}">
           
           <div class="space-y-5">
             <div class="grid grid-cols-3 gap-4">
               <div class="col-span-2"><label class="block text-xs font-bold text-slate-700 mb-1">Nome do Produto</label><input type="text" id="tpl-name" value="${t.name}" class="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" placeholder="Ex: Crachá Padrão"></div>
               <div><label class="block text-xs font-bold text-slate-700 mb-1">Preço (R$)</label><input type="number" step="0.01" id="tpl-price" value="${t.price}" class="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-blue-700 font-bold"></div>
             </div>
             
             <div class="bg-orange-50 p-4 rounded-xl border border-orange-200">
               <label class="block text-sm font-black text-orange-800 mb-1">Imagem FRENTE (Arte Base)</label>
               <p class="text-[10px] text-orange-600 mb-2">Tamanho recomendado: 250x395 pixels (retrato).</p>
               <input type="file" id="tpl-front" accept="image/*" class="w-full text-xs p-2 bg-white rounded border border-orange-200">
               ${t.bg_front ? '<p class="text-green-700 text-xs mt-2 font-bold">✓ Imagem carregada. Envie outra apenas se quiser substituir.</p>' : ''}
             </div>
             
             <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
               <label class="block text-sm font-black text-yellow-800 mb-1">Imagem VERSO (Arte Complementar)</label>
               <p class="text-[10px] text-yellow-600 mb-2">Se enviada, será mostrada na 2ª prévia.</p>
               <input type="file" id="tpl-back" accept="image/*" class="w-full text-xs p-2 bg-white rounded border border-yellow-200">
               ${t.bg_back ? '<p class="text-green-700 text-xs mt-2 font-bold">✓ Imagem carregada. Envie outra apenas se quiser substituir.</p>' : ''}
             </div>
           </div>
           
           <div class="flex justify-end gap-3 mt-8 border-t pt-4">
             <button onclick="document.getElementById('tpl-modal').remove()" class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Cancelar</button>
             <button onclick="selfserviceModule.saveTemplate()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md">Salvar Modelo</button>
           </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },
  async saveTemplate() {
    const id = document.getElementById('tpl-id').value;
    const name = document.getElementById('tpl-name').value.trim();
    const price = parseFloat(document.getElementById('tpl-price').value) || 0;
    
    if (!name) { alert('Informe o nome do produto.'); return; }

    const settings = this.getSettings();
    let t = settings.templates.find(x => x.id === id);
    if (!t) {
      t = { id: 'tpl_' + Date.now(), name, price, bg_front: '', bg_back: '' };
      settings.templates.push(t);
    } else {
      t.name = name;
      t.price = price;
    }

    const fileF = document.getElementById('tpl-front').files[0];
    const fileB = document.getElementById('tpl-back').files[0];

    const readFile = (file) => new Promise(res => {
      const r = new FileReader();
      r.onload = (e) => res(e.target.result);
      r.readAsDataURL(file);
    });

    if (fileF) t.bg_front = await readFile(fileF);
    if (fileB) t.bg_back = await readFile(fileB);

    this.saveSettings(settings);
    document.getElementById('tpl-modal').remove();
    this.render();
  }
};
