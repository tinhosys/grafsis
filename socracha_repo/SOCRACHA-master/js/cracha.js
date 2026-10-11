window.selfserviceModule = {
  currentClient: null,
  currentTab: 'pedido',
  cart: [],
  photoDataUrl: null,
  currentOrderId: null,
  
  layoutConfig: {
    width: 685,
    height: 1051,
    safeWidth: 638,
    safeHeight: 1004,
    offsetX: 23.5,
    offsetY: 23.5
  },

  getSettings() {
    const s = localStorage.getItem('grafsis_cracha_settings');
    let parsed = s ? JSON.parse(s) : { templates: [] };
    
    const defaultLayoutFront = [
      { id: 'photo_1', type: 'photo', x: 282, y: 350, w: 120, h: 120, radius: 60 },
      { id: 'text_1', type: 'text', field: 'nome', label: 'Nome do Cliente', x: 342, y: 550, color: '#1e293b', font: '900 40px Arial', align: 'center' },
      { id: 'text_2', type: 'text', field: 'mat', label: 'Matr+�cula: {mat}', x: 342, y: 600, color: '#64748b', font: 'bold 24px Arial', align: 'center' },
      { id: 'text_3', type: 'text', field: 'sangue', label: 'Sangue: {sangue}', x: 342, y: 650, color: '#e11d48', font: '900 28px Arial', align: 'center' }
    ];
    const defaultLayoutBack = [
      { id: 'text_b1', type: 'text', field: 'nome', label: 'Nome do Cliente', x: 342, y: 550, color: '#1e293b', font: 'bold 30px Arial', align: 'center' }
    ];

    if (parsed.price !== undefined && !parsed.templates) {
      parsed = { templates: [{ id: 'tpl_1', name: 'Crach+� Padr+�o', price: parsed.price || 15, bg_front: parsed.bg_url || '', bg_back: '', crop_marks: 'green', layout_front: defaultLayoutFront, layout_back: defaultLayoutBack }] };
      this.saveSettings(parsed);
    }
    if (!parsed.templates || parsed.templates.length === 0) {
      parsed.templates = [{ id: 'tpl_1', name: 'Crach+� Padr+�o', price: 15, bg_front: '', bg_back: '', crop_marks: 'green', layout_front: defaultLayoutFront, layout_back: defaultLayoutBack }];
      this.saveSettings(parsed);
    } else {
      parsed.templates.forEach(t => {
        if (!t.layout_front) t.layout_front = JSON.parse(JSON.stringify(defaultLayoutFront));
        if (!t.layout_back) t.layout_back = JSON.parse(JSON.stringify(defaultLayoutBack));
        if (!t.crop_marks) t.crop_marks = 'green';
      });
    }
    return parsed;
  },
  
  saveSettings(s) {
    localStorage.setItem('grafsis_cracha_settings', JSON.stringify(s));
  },
  
  isRegistering: false,

  render() {
    const container = document.getElementById('view-container');
    if (!this.currentClient) {
      if (this.isRegistering) {
        this.renderRegister(container);
      } else {
        this.renderLogin(container);
      }
    } else {
      this.renderDashboard();
    }
  },

  renderLogin(container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[70vh]">
        <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 text-center">
          <h1 class="text-2xl font-black text-slate-800 mb-2">Login</h1>
          <p class="text-slate-500 mb-6">Acesse com seu CPF e Senha para comprar.</p>
          <form onsubmit="selfserviceModule.login(event)" class="space-y-4">
            <input type="text" id="ss-login-doc" required placeholder="Digite seu CPF" class="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-lg focus:ring-2 focus:ring-blue-500">
            <input type="password" id="ss-login-pwd" required placeholder="Digite sua Senha" class="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-lg focus:ring-2 focus:ring-blue-500">
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md">ENTRAR</button>
            <p class="text-sm text-slate-500 mt-4">Ainda n&atilde;o tem conta? <a href="#" onclick="selfserviceModule.isRegistering=true; selfserviceModule.render(); return false;" class="text-blue-600 font-bold hover:underline">Cadastre-se</a></p>
          </form>
        </div>
      </div>
    `;
  },

  renderRegister(container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[80vh] py-8">
        <div class="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-slate-100">
          <h1 class="text-2xl font-black text-slate-800 mb-2 text-center">Criar Conta</h1>
          <p class="text-slate-500 mb-6 text-center">Preencha seus dados para acessar o e-commerce.</p>
          <form onsubmit="selfserviceModule.register(event)" class="space-y-4">
            <div><label class="block text-xs font-bold text-slate-500 mb-1">Nome Completo</label><input type="text" id="reg-nome" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-xs font-bold text-slate-500 mb-1">CPF</label><input type="text" id="reg-cpf" required class="w-full px-3 py-2 border rounded-lg"></div>
              <div><label class="block text-xs font-bold text-slate-500 mb-1">Celular</label><input type="text" id="reg-celular" required class="w-full px-3 py-2 border rounded-lg"></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-xs font-bold text-slate-500 mb-1">Cidade</label><input type="text" id="reg-cidade" required class="w-full px-3 py-2 border rounded-lg"></div>
              <div><label class="block text-xs font-bold text-slate-500 mb-1">UF</label><input type="text" id="reg-uf" required class="w-full px-3 py-2 border rounded-lg"></div>
            </div>
            <div><label class="block text-xs font-bold text-slate-500 mb-1">E-mail</label><input type="email" id="reg-email" required class="w-full px-3 py-2 border rounded-lg"></div>
            <div><label class="block text-xs font-bold text-slate-500 mb-1">Senha</label><input type="password" id="reg-senha" required class="w-full px-3 py-2 border rounded-lg"></div>
            
            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mt-4 transition shadow-md">CADASTRAR</button>
            <p class="text-sm text-slate-500 mt-4 text-center">J&aacute; tem conta? <a href="#" onclick="selfserviceModule.isRegistering=false; selfserviceModule.render(); return false;" class="text-blue-600 font-bold hover:underline">Fazer Login</a></p>
          </form>
        </div>
      </div>
    `;
  },

  register(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value.trim();
    const cpf = document.getElementById('reg-cpf').value.trim().replace(/\D/g, '');
    const celular = document.getElementById('reg-celular').value.trim();
    const cidade = document.getElementById('reg-cidade').value.trim();
    const uf = document.getElementById('reg-uf').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const senha = document.getElementById('reg-senha').value.trim();

    if (!cpf || cpf.length < 11) return alert('CPF inv&aacute;lido.');

    const clients = JSON.parse(localStorage.getItem('grafsis_clients') || '[]');
    if (clients.find(c => (c.cpf_cnpj || '').replace(/\D/g, '') === cpf)) {
      return alert('CPF j&aacute; cadastrado. Fa&ccedil;a login.');
    }

    const newClient = {
      id: grafsisUUID(),
      tipo: 'PF',
      nome, cpf_cnpj: cpf, celular, cidade, estado: uf, email, senha,
      data_cadastro: new Date().toISOString()
    };
    
    clients.push(newClient);
    localStorage.setItem('grafsis_clients', JSON.stringify(clients));
    
    alert('Conta criada com sucesso!');
    this.currentClient = newClient;
    this.isRegistering = false;
    this.cart = [];
    this.currentTab = 'vitrine';
    this.renderDashboard();
  },

  login(e) {
    e.preventDefault();
    const doc = document.getElementById('ss-login-doc').value.trim().replace(/\D/g, '');
    const pwd = document.getElementById('ss-login-pwd').value.trim();
    const clients = JSON.parse(localStorage.getItem('grafsis_clients') || '[]');
    
    const client = clients.find(c => {
      const cDoc = (c.cpf_cnpj || '').replace(/\D/g, '');
      return cDoc === doc && c.senha === pwd;
    });

    if (client) {
      this.currentClient = client;
      this.currentTab = 'vitrine';
      this.cart = [];
      this.photoDataUrl = null;
      this.renderDashboard();
    } else {
      alert('CPF ou Senha incorretos.');
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
    const tabs = [
      { id: 'vitrine', label: 'Vitrine' },
      { id: 'pedido', label: 'Crachá Personalizado' },
      { id: 'cart', label: 'Carrinho (' + this.cart.length + ')' },
      { id: 'meus_pedidos', label: 'Meus Pedidos' },
      { id: 'perfil', label: 'Meu Perfil' }
    ];

    let tabsHtml = tabs.map(t => `
      <button onclick="selfserviceModule.setTab('${t.id}')" 
        class="px-4 py-2 font-bold text-sm rounded-full transition-colors 
        ${this.currentTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
        ${t.label}
      </button>
    `).join('');

    let contentHtml = '';
    if (this.currentTab === 'vitrine') contentHtml = this.getVitrineHtml();
    else if (this.currentTab === 'pedido') contentHtml = this.getPedidoTabHtml();
    else if (this.currentTab === 'cart') contentHtml = this.getCartHtml();
    else if (this.currentTab === 'meus_pedidos') contentHtml = this.getMeusPedidosHtml();
    else if (this.currentTab === 'perfil') contentHtml = this.getPerfilHtml();
    else contentHtml = this.getVitrineHtml();

    container.innerHTML = `
      <div class="mb-6 bg-blue-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black">Olá, ${this.currentClient.nome.toUpperCase()}!</h2>
          <p class="text-blue-100 text-sm">Bem-vindo &agrave; nossa loja</p>
        </div>
        <div class="text-right flex flex-col items-end">
          <button onclick="selfserviceModule.logout()" class="text-xs text-blue-200 hover:text-white underline mb-2">Sair da Conta</button>
          <button onclick="selfserviceModule.setTab('cart')" class="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-md transition-transform hover:scale-105">
            <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Carrinho (${this.cart.length})
          </button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mb-6">
        ${tabsHtml}
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
        ${contentHtml}
      </div>
    `;

    if (this.currentTab === 'pedido') {
      this.updateCanvas('front');
      this.updateCanvas('back');
    }
  },

  getVitrineHtml() {
    const products = JSON.parse(localStorage.getItem('grafsis_products') || '[]');
    let items = '';
    products.forEach(p => {
      items += `
        <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col">
          <div class="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
            <img src="${p.foto_url}" alt="${p.nome}" class="object-cover w-full h-full">
          </div>
          <div class="p-4 flex-1 flex flex-col">
            <div class="text-xs font-bold text-slate-400 mb-1">${p.referencia}</div>
            <h3 class="font-bold text-slate-800 leading-tight mb-2">${p.nome}</h3>
            <p class="text-xs text-slate-500 mb-4 flex-1">${p.descricao}</p>
            <div class="flex items-center justify-between mt-auto">
              <span class="text-lg font-black text-blue-600">R$ ${p.preco_base.toFixed(2)}</span>
              ${p.isCustom 
                ? `<button onclick="selfserviceModule.setTab('pedido')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition">Personalizar</button>`
                : `<button onclick="selfserviceModule.addToCartSimple('${p.id}')" class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition">Comprar</button>`
              }
            </div>
          </div>
        </div>
      `;
    });

    return `
      <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        Nossos Produtos
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${items}
      </div>
    `;
  },

  addToCartSimple(productId) {
    const products = JSON.parse(localStorage.getItem('grafsis_products') || '[]');
    const p = products.find(x => x.id === productId);
    if (!p) return;
    this.cart.push({
      type: 'simple',
      product: p,
      nome: p.nome,
      preco: p.preco_base,
      quantidade: 1
    });
    alert(p.nome + ' adicionado ao carrinho!');
    this.renderDashboard();
  },

  getCartHtml() {
    if (this.cart.length === 0) {
      return `
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <h3 class="text-xl font-bold text-slate-600">Seu carrinho est&aacute; vazio</h3>
          <p class="text-slate-400 mt-2 mb-6">Acesse a vitrine para escolher seus produtos.</p>
          <button onclick="selfserviceModule.setTab('vitrine')" class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">Ver Produtos</button>
        </div>
      `;
    }

    let total = 0;
    let itemsHtml = this.cart.map((item, idx) => {
      let price = item.preco || 0;
      total += price * (item.quantidade || 1);
      
      let details = item.type === 'cracha' ? `Crachá Personalizado: ${item.nome}` : item.nome;
      return `
        <div class="flex items-center justify-between p-4 border-b border-slate-100 last:border-0">
          <div>
            <div class="font-bold text-slate-800">${details}</div>
            <div class="text-sm text-slate-500">Qtd: ${item.quantidade || 1}</div>
          </div>
          <div class="flex items-center gap-4">
            <div class="font-black text-slate-800">R$ ${price.toFixed(2)}</div>
            <button onclick="selfserviceModule.removeFromCart(${idx})" class="text-red-500 hover:text-red-700 p-2" title="Remover">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <h3 class="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Seu Carrinho</h3>
      <div class="bg-slate-50 rounded-xl border border-slate-200 mb-6">
        ${itemsHtml}
      </div>
      <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div class="text-slate-500 text-sm font-bold uppercase tracking-wide">Total do Pedido</div>
          <div class="text-3xl font-black text-blue-600">R$ ${total.toFixed(2)}</div>
        </div>
        <button onclick="selfserviceModule.renderCheckout()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-md transition-transform hover:scale-105">
          Finalizar Compra
        </button>
      </div>
    `;
  },

  removeFromCart(idx) {
    this.cart.splice(idx, 1);
    this.renderDashboard();
  },

  renderCheckout() {
    const container = document.getElementById('view-container');
    let total = this.cart.reduce((acc, item) => acc + (item.preco || 0) * (item.quantidade || 1), 0);
    
    container.innerHTML = `
      <div class="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mt-10">
        <h2 class="text-2xl font-black text-slate-800 mb-6">Pagamento do Pedido</h2>
        <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
          <div class="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <span class="text-slate-600 font-bold">Total a Pagar:</span>
            <span class="text-3xl font-black text-green-600">R$ ${total.toFixed(2)}</span>
          </div>
          <p class="text-sm text-slate-500 text-center">Escolha sua forma de pagamento para simular a compra.</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-8">
          <button onclick="selfserviceModule.finishOrder('PIX')" class="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition cursor-pointer">
            <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span class="font-bold text-slate-700">Pagar com PIX</span>
          </button>
          <button onclick="selfserviceModule.finishOrder('Cart&atilde;o de Cr&eacute;dito')" class="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
            <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            <span class="font-bold text-slate-700">Cart&atilde;o de Cr&eacute;dito</span>
          </button>
        </div>
        
        <button onclick="selfserviceModule.setTab('cart')" class="w-full text-center text-slate-500 hover:text-slate-800 font-bold underline">Voltar para o Carrinho</button>
      </div>
    `;
  },

  async finishOrder(paymentMethod) {
    if (this.cart.length === 0) return;
    let total = this.cart.reduce((acc, item) => acc + (item.preco || 0) * (item.quantidade || 1), 0);
    
    const pedido = {
      id: grafsisUUID(),
      numero: Math.floor(Math.random() * 10000) + 1000,
      cliente_id: this.currentClient.id,
      data_criacao: new Date().toISOString(),
      status: 'Aprovado',
      valor_total: total,
      metodo_pagamento: paymentMethod,
      itens: this.cart
    };
    
    let orders = JSON.parse(localStorage.getItem('grafsis_orders') || '[]');
    orders.push(pedido);
    localStorage.setItem('grafsis_orders', JSON.stringify(orders));
    
    alert(`Pagamento de R$ ${total.toFixed(2)} aprovado via ${paymentMethod}!\nPedido #${pedido.numero} gerado com sucesso.`);
    
    this.cart = [];
    this.setTab('meus_pedidos');
  },

  getPedidoTabHtml() {

    const template = this.getSettings().templates[0];
    const preco = Number(template.price) || 0;
    
    let cartHtml = '';
    let cartTotal = 0;
    if (this.cart.length > 0) {
      cartTotal = this.cart.reduce((acc, item) => acc + item.preco, 0);
      cartHtml = `
        <div class="mt-8 border-t pt-6">
          <h4 class="font-black text-slate-800 mb-4 flex items-center justify-between">
            <span>Crach+�s no Pedido Atual (${this.cart.length})</span>
            <span class="text-blue-700 text-xl">Total: R$ ${cartTotal.toFixed(2)}</span>
          </h4>
          <div class="space-y-3 mb-6">
            ${this.cart.map((item, idx) => `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div class="flex items-center gap-4 w-full sm:w-auto">
                    <div class="rounded overflow-hidden border border-slate-300 shadow-sm shrink-0 bg-white" style="width: 48px; height: 73px;" title="Tamanho Real (58x89mm)">
                      ${item.frontUrl ? `<img src="${item.frontUrl}" class="w-full h-full object-fill">` : ''}
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-bold text-slate-800">${item.nome}</p>
                      <p class="text-[10px] font-bold text-slate-500 uppercase mt-0.5">MAT: ${item.mat || '--'} | TIPO: ${item.sangue || '--'}</p>
                      <div class="flex items-center gap-2 mt-2">
                         <button type="button" onclick="selfserviceModule.downloadBadge(${idx}, 'front')" class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition shadow-sm">Baixar Frente</button>
                         ${item.backUrl ? `<button type="button" onclick="selfserviceModule.downloadBadge(${idx}, 'back')" class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition shadow-sm">Baixar Verso</button>` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 w-full sm:w-auto">
                    <span class="font-black text-slate-700 text-sm">R$ ${item.preco.toFixed(2)}</span>
                    <button type="button" onclick="selfserviceModule.removeFromCart(${idx})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Remover">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              `).join('')}         </div>
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
           Solicitar Novo Crach+�
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <form id="cracha-form" class="space-y-4" onsubmit="selfserviceModule.addToCart(event)">
              ${(() => {
                let html = '';
                const fields = [...template.layout_front, ...template.layout_back];
                
                const hasPhoto = fields.some(f => f.type === 'photo' && f.visible !== false);
                if (hasPhoto) {
                  html += `<div><label class="block text-xs font-bold text-slate-700 mb-1">Foto do Crach+�-� *</label>
                           <input type="file" id="cr-foto" required accept="image/*" onchange="selfserviceModule.handlePhoto(this)" class="w-full text-sm p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500"></div>`;
                }

                const uniqueFields = {};
                fields.forEach(f => {
                   if (f.type === 'text' && f.field && f.visible !== false && !uniqueFields[f.field]) {
                      uniqueFields[f.field] = true;
                      html += `<div><label class="block text-xs font-bold text-slate-700 mb-1">${f.label || f.field} *</label>
                               <input type="text" id="cr-${f.field}" required oninput="selfserviceModule.preview()" class="w-full px-4 py-3 border rounded-xl bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"></div>`;
                   }
                });
                return html;
              })()}
              <label class="inline-flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" id="cr-blank-back" onchange="selfserviceModule.preview()" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm font-bold text-slate-700">Deixar Verso em Branco</span>
              </label>

              <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition shadow-md uppercase tracking-wider mt-4">
                Adicionar ao Carrinho
              </button>
            </form>
          </div>

          <div class="flex flex-col items-center justify-start border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8 border-slate-200 overflow-x-auto">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pr+�-visualiza+�+�o do Crach+�</p>
            
            <div class="w-full max-w-[250px] flex mb-4 bg-slate-100 rounded-lg shadow-sm border border-slate-200">
               <button id="btn-prev-front" onclick="selfserviceModule.switchPreviewTab('front')" class="flex-1 py-2 text-sm font-bold bg-blue-600 text-white rounded-l-lg transition">FRENTE</button>
               <button id="btn-prev-back" onclick="selfserviceModule.switchPreviewTab('back')" class="flex-1 py-2 text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-r-lg transition">VERSO</button>
            </div>

            <div id="container-prev-front" class="flex flex-col items-center">
              <div class="relative w-[228px] h-[350px] border border-slate-300 shadow-xl rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <span class="absolute text-slate-400 text-xs font-bold preview-loading" id="load-front">GERANDO...</span>
                <canvas id="cracha-canvas-front" width="685" height="1051" class="w-full h-full relative z-10" style="object-fit: contain;"></canvas>
              </div>
              <p class="text-[10px] text-slate-500 mt-2 text-center leading-tight">A arte final cont+�m sangria para impress+�o (58x89mm).<br>As linhas mostram a +�rea segura (54x85mm).</p>
            </div>
            
            <div id="container-prev-back" class="flex-col items-center" style="display: none;">
              <div class="relative w-[228px] h-[350px] border border-slate-300 shadow-xl rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <span class="absolute text-slate-400 text-xs font-bold preview-loading" id="load-back">GERANDO...</span>
                <canvas id="cracha-canvas-back" width="685" height="1051" class="w-full h-full relative z-10" style="object-fit: contain;"></canvas>
              </div>
              <p class="text-[10px] text-slate-500 mt-2 text-center leading-tight">A arte final cont+�m sangria para impress+�o (58x89mm).<br>As linhas mostram a +�rea segura (54x85mm).</p>
            </div>
          </div>
        </div>
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

  drawLayoutCanvas(ctx, template, layoutArr, bgDataUrl) {
    const { width, height, safeWidth, safeHeight, offsetX, offsetY } = this.layoutConfig;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const formVals = {};
      const fields = ['nome', 'mat', 'sangue', 'campo1', 'campo2', 'campo3', 'campov1', 'campov2', 'campov3', 'campov4'];
      fields.forEach(f => {
         const el = document.getElementById('cr-' + f);
         if (el) formVals[f] = el.value.toUpperCase();
      });
      const blankBackEl = document.getElementById('cr-blank-back');
      const blankBack = blankBackEl ? blankBackEl.checked : false;
      if (blankBack && targetTab === 'back') {
         // Render blank back
         const canvas = document.getElementById('preview-canvas');
         const ctx = canvas.getContext('2d');
         ctx.fillStyle = '#ffffff';
         ctx.fillRect(0,0, canvas.width, canvas.height);
         return;
      }

    const drawElements = () => {
      layoutArr.forEach(el => {
        ctx.save();
        if (el.type === 'photo') {
          if (this.photoDataUrl) {
            const img = new Image();
            img.src = this.photoDataUrl;
            this.drawPhotoElement(ctx, img, el);
          } else {
            ctx.fillStyle = '#e2e8f0';
            this.clipPhotoArea(ctx, el);
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('FOTO', el.x + el.w/2, el.y + el.h/2);
          }
        } else if (el.type === 'text') {
            if (el.visible === false) { ctx.restore(); return; }
            let text = el.label || '';
            if (el.field && formVals[el.field] !== undefined) {
               if (text.includes(`{${el.field}}`)) {
                 text = text.replace(`{${el.field}}`, formVals[el.field] || '');
               } else {
                 text = formVals[el.field];
               }
            }
            if (!text && el.field === 'sangue') text = '';
            if (text) {
               const bw = el.w || 200;
               const bh = el.h || 50;
               const align = el.align || 'center';
               let bx = el.x;
               if (align === 'center') bx = el.x - bw/2;
               else if (align === 'right') bx = el.x - bw;
               
               if (el.bgColor && el.bgTransparent === false) {
                 ctx.fillStyle = el.bgColor;
                 if (el.radius) {
                   ctx.beginPath(); ctx.roundRect(bx, el.y, bw, bh, el.radius); ctx.fill();
                 } else {
                   ctx.fillRect(bx, el.y, bw, bh);
                 }
               }
               if (el.borderColor && el.borderTransparent === false) {
                 ctx.strokeStyle = el.borderColor;
                 ctx.lineWidth = el.borderWidth || 2;
                 if (el.radius) {
                   ctx.beginPath(); ctx.roundRect(bx, el.y, bw, bh, el.radius); ctx.stroke();
                 } else {
                   ctx.strokeRect(bx, el.y, bw, bh);
                 }
               }

               ctx.fillStyle = el.color || '#000000';
               ctx.font = el.font || 'bold 30px Arial';
               ctx.textAlign = align;
               ctx.textBaseline = 'middle';
               
               let tx = el.x;
               let ty = el.y + bh/2;
               if (align === 'left') tx = bx + 10;
               if (align === 'right') tx = bx + bw - 10;

               ctx.fillText(text, tx, ty, bw);
            }
          }
          ctx.restore();
      });

      this.drawCropMarks(ctx, template.crop_marks);
    };

    if (bgDataUrl) {
      const bg = new Image();
      bg.onload = () => {
        ctx.drawImage(bg, 0, 0, width, height);
        drawElements();
      };
      bg.src = bgDataUrl;
    } else {
      drawElements();
    }
  },

  clipPhotoArea(ctx, el) {
    ctx.beginPath();
    if (el.radius > 0) {
      if (el.radius >= el.w/2 && el.w === el.h) {
         ctx.arc(el.x + el.w/2, el.y + el.h/2, el.w/2, 0, Math.PI * 2, true);
      } else {
         ctx.roundRect(el.x, el.y, el.w, el.h, el.radius);
      }
    } else {
      ctx.rect(el.x, el.y, el.w, el.h);
    }
    ctx.closePath();
  },

  drawPhotoElement(ctx, img, el) {
    if (img.complete && img.naturalWidth !== 0) {
      ctx.save();
      this.clipPhotoArea(ctx, el);
      ctx.clip();
      
      const sizer = Math.max(el.w / img.width, el.h / img.height);
      const drawW = img.width * sizer; 
      const drawH = img.height * sizer;
      const dx = el.x + (el.w - drawW)/2;
      const dy = el.y + (el.h - drawH)/2;
      
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();
    }
  },

  drawCropMarks(ctx, style) {
    if (!style || style === 'none') return;
    const { safeWidth, safeHeight, offsetX, offsetY } = this.layoutConfig;
    
    let color = '#32cd32'; 
    if (style === 'white') color = '#ffffff';
    if (style === 'black') color = '#000000';

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const len = 40;

    // TL
    ctx.beginPath(); ctx.moveTo(offsetX, offsetY - len); ctx.lineTo(offsetX, offsetY); ctx.lineTo(offsetX - len, offsetY); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(offsetX + safeWidth, offsetY - len); ctx.lineTo(offsetX + safeWidth, offsetY); ctx.lineTo(offsetX + safeWidth + len, offsetY); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(offsetX, offsetY + safeHeight + len); ctx.lineTo(offsetX, offsetY + safeHeight); ctx.lineTo(offsetX - len, offsetY + safeHeight); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(offsetX + safeWidth, offsetY + safeHeight + len); ctx.lineTo(offsetX + safeWidth, offsetY + safeHeight); ctx.lineTo(offsetX + safeWidth + len, offsetY + safeHeight); ctx.stroke();
    ctx.restore();
  },

  async preview() {
    const canvasF = document.getElementById('cracha-canvas-front');
    const canvasB = document.getElementById('cracha-canvas-back');
    if (!canvasF || !canvasB) return;
    
    document.getElementById('load-front').style.display = 'none';
    document.getElementById('load-back').style.display = 'none';
    
    const ctxF = canvasF.getContext('2d');
    const ctxB = canvasB.getContext('2d');
    const template = this.getSettings().templates[0];

    if (this.photoDataUrl) {
      const img = new Image();
      img.onload = () => {
        this.drawLayoutCanvas(ctxF, template, template.layout_front, template.bg_front);
        this.drawLayoutCanvas(ctxB, template, template.layout_back, template.bg_back);
      };
      img.src = this.photoDataUrl;
    } else {
      this.drawLayoutCanvas(ctxF, template, template.layout_front, template.bg_front);
      this.drawLayoutCanvas(ctxB, template, template.layout_back, template.bg_back);
    }
  },

  async addToCart(e) {
      e.preventDefault();
      const template = this.getSettings().templates[0];
      const preco = Number(template.price) || 0;
      
      const fields = ['nome', 'mat', 'sangue', 'campo1', 'campo2', 'campo3', 'campov1', 'campov2', 'campov3', 'campov4'];
      const details = {};
      fields.forEach(f => {
         const el = document.getElementById('cr-' + f);
         if (el) details[f] = el.value.trim();
      });

      const photoEl = document.getElementById('cr-foto');
      if (photoEl && !this.photoDataUrl) {
        alert("Por favor, selecione uma foto.");
        return;
      }
      
      if (!this.currentOrderId) {
         this.currentOrderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
      }

      await new Promise(r => setTimeout(r, 100));
  
      const canvasF = document.getElementById('cracha-canvas-front');
      const canvasB = document.getElementById('cracha-canvas-back');
      const finalImageFront = canvasF.toDataURL('image/png', 0.9);
      
      const blankBackEl = document.getElementById('cr-blank-back');
      const blankBack = blankBackEl ? blankBackEl.checked : false;
      const finalImageBack = blankBack ? '' : canvasB.toDataURL('image/png', 0.9);
  
      this.cart.push({
        details,
        nome: details.nome || details.campo1 || 'Crach+�-�',
        mat: details.mat || details.campo2 || '',
        sangue: details.sangue || details.campo3 || '',
        foto: this.photoDataUrl,
        preco,
        frontUrl: finalImageFront,
        backUrl: finalImageBack,
        templateName: template.name || 'Crach+�-�'
      });

    this.photoDataUrl = null;
    this.renderDashboard();
  },

  downloadBadge(idx, side) {
    const item = this.cart[idx];
    if (!item) return;
    const url = side === 'front' ? item.frontUrl : item.backUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `cracha_${this.currentOrderId || 'NOVO'}_${(item.nome||'').replace(/\s+/g, '_')}_${side}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
      alert(`SALDO INSUFICIENTE!\\n\\nVoc+� possui R$ ${this.currentClient.saldo_corrente.toFixed(2)}.\\nO pedido custa R$ ${totalPreco.toFixed(2)}.\\n\\nV+� na aba "Meus Pedidos" para recarregar com PIX.`);
      return;
    }

    if(!confirm(`CONFIRMAR PEDIDO DE ${this.cart.length} CRACH+�(S)?\\n\\nSer+�o descontados R$ ${totalPreco.toFixed(2)} do seu saldo.`)) return;

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

    alert('PEDIDO ENVIADO PARA PRODU+�+�O!\\n\\nSeu pedido foi registrado e o valor descontado da conta.');
    this.cart = []; 
    this.setTab('pedidos');
  },

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
      let desc = 'Produto Gen+�rico';
      if (o.itens && o.itens.length > 0) {
        if (o.itens.length === 1) desc = o.itens[0].descricao;
        else desc = `Pedido com ${o.itens.length} crach+�s`;
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
           <h2 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Recarga via PIX (Simula+�+�o)</h2>
           <label class="block text-xs font-bold text-slate-600 text-left mb-1">Valor da Recarga (R$)</label>
           <input type="number" id="pix-valor" class="w-full border border-slate-300 p-3 mb-6 rounded-lg text-center text-xl font-black text-green-700 focus:ring-2 focus:ring-green-500" value="50.00" step="10.00">
           <div class="bg-slate-100 w-48 h-48 mx-auto flex flex-col items-center justify-center mb-4 rounded-xl border border-slate-200 shadow-inner">
             <svg class="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
             <span class="text-slate-400 text-xs font-bold px-4">Aqui entraria o QR Code PIX</span>
           </div>
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
    alert(`Recarga PIX de R$ ${valor.toFixed(2)} realizada com sucesso (Simulada).`);
  },

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
               <input type="password" id="pf-senha" class="w-full md:w-1/2 border border-slate-300 p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="border-t pt-4 mt-6">
             <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md uppercase text-sm">Salvar Altera+�+�es do Perfil</button>
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
      this.currentClient.observacoes += `\\n[Senha Atualizada no Autoatendimento]`;
    }
    
    await window.store.saveClient(this.currentClient);
    alert('Seu perfil foi atualizado com sucesso.');
    this.render();
  },

  getConfigTabHtml() {
    const templates = this.getSettings().templates;
    return `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h3 class="text-lg font-bold text-slate-800">Modelos Base de Produtos (Templates)</h3>
        </div>
        <p class="text-sm text-slate-600 mb-4">Apenas o primeiro modelo desta lista +� usado como base para os novos crach+�s.</p>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 text-sm">
                <th class="p-3 border-b font-bold rounded-tl-lg">Nome do Produto</th>
                <th class="p-3 border-b font-bold">Pre+�o Base</th>
                <th class="p-3 border-b font-bold text-center">Frente</th>
                <th class="p-3 border-b font-bold text-center">Verso</th>
                <th class="p-3 border-b font-bold text-right rounded-tr-lg">A+�+�es</th>
              </tr>
            </thead>
            <tbody>
              ${templates.map(t => `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                  <td class="p-3 font-semibold text-slate-800">${t.name}</td>
                  <td class="p-3 text-blue-700 font-bold">R$ ${Number(t.price).toFixed(2)}</td>
                  <td class="p-3 text-center">${t.bg_front ? '<span class="text-green-600 font-bold text-xs">Sim</span>' : '<span class="text-slate-400 text-xs">N+�o</span>'}</td>
                  <td class="p-3 text-center">${t.bg_back ? '<span class="text-green-600 font-bold text-xs">Sim</span>' : '<span class="text-slate-400 text-xs">N+�o</span>'}</td>
                  <td class="p-3 text-right">
                    <button onclick="window.layoutEditorModule.openEditor('${t.id}')" class="text-indigo-600 font-bold text-sm hover:underline">Editar Layout</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

window.layoutEditorModule = {
  currentTemplateId: null,
  currentTab: 'front', // 'front' or 'back'
  layoutFront: [],
  layoutBack: [],
  bgFront: '',
  bgBack: '',
  cropMarks: 'green',
  selectedElementId: null,

  openEditor(templateId) {
    this.currentTemplateId = templateId;
    const settings = window.selfserviceModule.getSettings();
    let t = settings.templates.find(x => x.id === templateId);
    
    if (!t) {
       alert("Modelo n+�o encontrado."); return;
    }

    this.layoutFront = JSON.parse(JSON.stringify(t.layout_front || []));
    this.layoutBack = JSON.parse(JSON.stringify(t.layout_back || []));
    this.bgFront = t.bg_front || '';
    this.bgBack = t.bg_back || '';
    this.cropMarks = t.crop_marks || 'green';
    this.currentTab = 'front';
    this.selectedElementId = null;

    this.renderEditorModal();
  },

  closeEditor() {
    const el = document.getElementById('layout-editor-modal');
    if (el) el.remove();
  },

  renderEditorModal() {
    let el = document.getElementById('layout-editor-modal');
    if (!el) {
      document.body.insertAdjacentHTML('beforeend', `<div id="layout-editor-modal" class="fixed inset-0 z-[200] bg-slate-900/90 flex flex-col"></div>`);
      el = document.getElementById('layout-editor-modal');
    }

    const currentLayout = this.currentTab === 'front' ? this.layoutFront : this.layoutBack;
    const currentBg = this.currentTab === 'front' ? this.bgFront : this.bgBack;

    el.innerHTML = `
      <!-- Header -->
      <div class="bg-white p-4 flex justify-between items-center shadow-md z-10">
        <div>
          <h2 class="text-xl font-black text-slate-800">Editor de Layout de Crach+�</h2>
          <p class="text-xs text-slate-500">Arraste os elementos. Arte: 58x89mm (sangria). +�rea Segura: 54x85mm.</p>
        </div>
        <div class="flex gap-4">
          <button onclick="layoutEditorModule.closeEditor()" class="px-5 py-2 bg-slate-200 hover:bg-slate-300 font-bold rounded-lg text-sm transition">Cancelar</button>
          <button onclick="layoutEditorModule.saveLayout()" class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition shadow">Salvar Layout</button>
        </div>
      </div>

      <!-- Main Area -->
      <div class="flex flex-1 overflow-hidden">
        
        <!-- Sidebar Tools -->
        <div class="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 overflow-y-auto">
          <div class="flex bg-slate-200 rounded-lg p-1 mb-6">
            <button onclick="layoutEditorModule.switchTab('front')" class="flex-1 py-1.5 text-xs font-bold rounded ${this.currentTab === 'front' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}">FRENTE</button>
            <button onclick="layoutEditorModule.switchTab('back')" class="flex-1 py-1.5 text-xs font-bold rounded ${this.currentTab === 'back' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}">VERSO</button>
          </div>

          <h3 class="text-xs font-black text-slate-800 uppercase mb-3">Adicionar Elemento</h3>
          <button onclick="layoutEditorModule.addElement('text')" class="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 mb-2 transition">+ Campo de Texto</button>
          <button onclick="layoutEditorModule.addElement('photo')" class="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 mb-6 transition">+ +�rea da Foto</button>
          
          <h3 class="text-xs font-black text-slate-800 uppercase mb-3">Fundo & Guias</h3>
          <div class="mb-4">
            <label class="block text-[10px] font-bold text-slate-600 mb-1">Trocar Arte de Fundo</label>
            <input type="file" accept="image/*" onchange="layoutEditorModule.handleBgUpload(this)" class="w-full text-xs p-1 bg-white border rounded">
          </div>
          <div class="mb-6">
            <label class="block text-[10px] font-bold text-slate-600 mb-1">Cor da Linha de Corte</label>
            <select onchange="layoutEditorModule.changeCropMarks(this.value)" class="w-full p-2 border rounded bg-white text-xs">
               <option value="green" ${this.cropMarks === 'green' ? 'selected' : ''}>Verde Lim+�o</option>
               <option value="white" ${this.cropMarks === 'white' ? 'selected' : ''}>Branco</option>
               <option value="black" ${this.cropMarks === 'black' ? 'selected' : ''}>Preto</option>
               <option value="none" ${this.cropMarks === 'none' ? 'selected' : ''}>Nenhuma</option>
            </select>
          </div>

          <hr class="my-2">
          <div id="element-properties">
            ${this.renderPropertiesPanel()}
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="flex-1 bg-slate-800 flex justify-center items-center overflow-auto p-8 relative" id="canvas-wrapper">
          <div id="layout-canvas-container" class="relative bg-white shadow-2xl" style="width: 685px; height: 1051px; transform-origin: top left; transform: scale(0.6);">
             <!-- Render Background -->
             ${currentBg ? `<img src="${currentBg}" class="absolute pointer-events-none" style="left: 0; top: 0; width: 100%; height: 100%; object-fit: fill;">` : ''}
             
             <!-- Render Crop Marks -->
             ${this.renderEditorCropMarks()}

             <!-- Render Elements -->
             ${currentLayout.map(el => this.renderDraggableElement(el)).join('')}
          </div>
        </div>
      </div>
    `;

    // Make elements draggable
    setTimeout(() => this.initDraggables(), 100);
    
    // Scale container to fit window nicely
    const wrapper = document.getElementById('canvas-wrapper');
    const container = document.getElementById('layout-canvas-container');
    if (wrapper && container) {
       const scale = Math.min((wrapper.clientWidth - 100) / 685, (wrapper.clientHeight - 100) / 1051);
       if(scale < 1) container.style.transform = `scale(${scale})`;
       else container.style.transform = 'scale(1)';
    }
  },

  renderEditorCropMarks() {
    if (this.cropMarks === 'none') return '';
    let color = '#32cd32';
    if (this.cropMarks === 'white') color = '#ffffff';
    if (this.cropMarks === 'black') color = '#000000';
    
    const d = `M 23.5 -16.5 L 23.5 23.5 L -16.5 23.5 M 661.5 -16.5 L 661.5 23.5 L 701.5 23.5 M 23.5 1067.5 L 23.5 1027.5 L -16.5 1027.5 M 661.5 1067.5 L 661.5 1027.5 L 701.5 1027.5`;

    return `
      <svg class="absolute inset-0 pointer-events-none overflow-visible" style="width: 100%; height: 100%; z-index: 50;">
         <path d="${d}" stroke="${color}" stroke-width="2" fill="none"></path>
         <!-- Safe area dashed border -->
         <rect x="23.5" y="23.5" width="638" height="1004" stroke="${color}" stroke-width="1" stroke-dasharray="10,10" fill="none" opacity="0.4"></rect>
      </svg>
    `;
  },

  renderDraggableElement(el) {
    const isSel = this.selectedElementId === el.id;
    const border = isSel ? 'border-2 border-blue-500 shadow-lg ring-4 ring-blue-500/30' : 'border border-dashed border-slate-400 hover:border-blue-400';
    
    if (el.type === 'photo') {
       let borderRadius = el.radius > 0 ? (el.radius >= el.w/2 ? '50%' : el.radius + 'px') : '0';
       return `
         <div id="${el.id}" class="absolute cursor-move flex items-center justify-center bg-slate-200/80 text-slate-500 font-bold text-2xl ${border}" style="left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px; border-radius: ${borderRadius}; z-index: 10;" onmousedown="layoutEditorModule.selectElement('${el.id}', event)">
            FOTO
         </div>
       `;
    } else {
       return `
         <div id="${el.id}" class="absolute cursor-move ${border}" style="left: ${el.x}px; top: ${el.y}px; color: ${el.color}; font: ${el.font}; text-align: ${el.align}; white-space: nowrap; z-index: 10;" onmousedown="layoutEditorModule.selectElement('${el.id}', event)">
            ${el.label || '{Texto}'}
         </div>
       `;
    }
  },

  renderPropertiesPanel() {
    if (!this.selectedElementId) {
      return '<p class="text-xs text-slate-400 text-center py-4">Selecione um elemento no canvas para editar suas propriedades.</p>';
    }

    const currentLayout = this.currentTab === 'front' ? this.layoutFront : this.layoutBack;
    const el = currentLayout.find(x => x.id === this.selectedElementId);
    if (!el) return '';

    let html = `
      <div class="flex justify-between items-center mb-4">
         <h3 class="text-xs font-black text-slate-800 uppercase">Propriedades</h3>
         <button onclick="layoutEditorModule.deleteSelected()" class="text-xs text-red-500 hover:underline font-bold">Excluir</button>
      </div>
    `;

    html += `<div class="grid grid-cols-2 gap-2 mb-3">
       <div><label class="block text-[10px] font-bold text-slate-600">X (px)</label><input type="number" value="${el.x}" onchange="layoutEditorModule.updateProp('x', parseInt(this.value))" class="w-full text-xs p-1 border rounded"></div>
       <div><label class="block text-[10px] font-bold text-slate-600">Y (px)</label><input type="number" value="${el.y}" onchange="layoutEditorModule.updateProp('y', parseInt(this.value))" class="w-full text-xs p-1 border rounded"></div>
    </div>`;

    if (el.type === 'photo') {
      html += `
        <div class="grid grid-cols-2 gap-2 mb-3">
           <div><label class="block text-[10px] font-bold text-slate-600">Largura (px)</label><input type="number" value="${el.w}" onchange="layoutEditorModule.updateProp('w', parseInt(this.value))" class="w-full text-xs p-1 border rounded"></div>
           <div><label class="block text-[10px] font-bold text-slate-600">Altura (px)</label><input type="number" value="${el.h}" onchange="layoutEditorModule.updateProp('h', parseInt(this.value))" class="w-full text-xs p-1 border rounded"></div>
        </div>
        <div class="mb-3">
           <label class="block text-[10px] font-bold text-slate-600">Bordas (Raio px)</label>
           <input type="number" value="${el.radius}" onchange="layoutEditorModule.updateProp('radius', parseInt(this.value))" class="w-full text-xs p-1 border rounded">
           <p class="text-[9px] text-slate-500 mt-1">Coloque ${el.w/2} para redondo perfeito.</p>
        </div>
      `;
    } else {
      html += `
        <div class="mb-3">
           <label class="block text-[10px] font-bold text-slate-600">Texto / Label (Est+�tico ou R+�tulo)</label>
           <input type="text" value="${el.label || ''}" onchange="layoutEditorModule.updateProp('label', this.value)" class="w-full text-xs p-1 border rounded">
        </div>
        <div class="grid grid-cols-2 gap-2 mb-3">
           <div>
             <label class="block text-[10px] font-bold text-slate-600">Vincular ao Campo</label>
             <select onchange="layoutEditorModule.updateProp('field', this.value)" class="w-full text-xs p-1 border rounded bg-white">
                <option value="">Nenhum (Fixo)</option>
                <option value="campo1" ${el.field === 'campo1' ? 'selected' : ''}>Campo 1</option>
                <option value="campo2" ${el.field === 'campo2' ? 'selected' : ''}>Campo 2</option>
                <option value="campo3" ${el.field === 'campo3' ? 'selected' : ''}>Campo 3</option>
                <option value="campov1" ${el.field === 'campov1' ? 'selected' : ''}>Verso 1</option>
                <option value="campov2" ${el.field === 'campov2' ? 'selected' : ''}>Verso 2</option>
                <option value="campov3" ${el.field === 'campov3' ? 'selected' : ''}>Verso 3</option>
                <option value="campov4" ${el.field === 'campov4' ? 'selected' : ''}>Verso 4</option>
             </select>
           </div>
           <div>
             <label class="block text-[10px] font-bold text-slate-600">Vis+�vel no Form</label>
             <select onchange="layoutEditorModule.updateProp('visible', this.value === 'true')" class="w-full text-xs p-1 border rounded bg-white">
                <option value="true" ${el.visible !== false ? 'selected' : ''}>Sim</option>
                <option value="false" ${el.visible === false ? 'selected' : ''}>N+�o (Oculto)</option>
             </select>
           </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-3">
           <div><label class="block text-[10px] font-bold text-slate-600">Largura (px)</label><input type="number" value="${el.w || 200}" onchange="layoutEditorModule.updateProp('w', parseInt(this.value))" class="w-full text-xs p-1 border rounded"></div>
           <div><label class="block text-[10px] font-bold text-slate-600">Altura (px)</label><input type="number" value="${el.h || 50}" onchange="layoutEditorModule.updateProp('h', parseInt(this.value))" class="w-full text-xs p-1 border rounded"></div>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-3">
           <div><label class="block text-[10px] font-bold text-slate-600">Cor Texto</label><input type="color" value="${el.color || '#000000'}" onchange="layoutEditorModule.updateProp('color', this.value)" class="w-full h-6 p-0 border-0"></div>
           <div>
             <label class="block text-[10px] font-bold text-slate-600">Cor Fundo</label>
             <input type="color" value="${el.bgColor || '#ffffff'}" onchange="layoutEditorModule.updateProp('bgColor', this.value)" class="w-full h-6 p-0 border-0" ${el.bgTransparent ? 'disabled' : ''}>
             <label class="flex items-center gap-1 mt-1"><input type="checkbox" ${el.bgTransparent !== false ? 'checked' : ''} onchange="layoutEditorModule.updateProp('bgTransparent', this.checked)"><span class="text-[9px]">Transparente</span></label>
           </div>
           <div>
             <label class="block text-[10px] font-bold text-slate-600">Cor Borda</label>
             <input type="color" value="${el.borderColor || '#000000'}" onchange="layoutEditorModule.updateProp('borderColor', this.value)" class="w-full h-6 p-0 border-0" ${el.borderTransparent ? 'disabled' : ''}>
             <label class="flex items-center gap-1 mt-1"><input type="checkbox" ${el.borderTransparent !== false ? 'checked' : ''} onchange="layoutEditorModule.updateProp('borderTransparent', this.checked)"><span class="text-[9px]">Transparente</span></label>
           </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-3">
           <div>
             <label class="block text-[10px] font-bold text-slate-600">Raio Borda (px)</label>
             <input type="number" value="${el.radius || 0}" onchange="layoutEditorModule.updateProp('radius', parseInt(this.value))" class="w-full text-xs p-1 border rounded">
           </div>
           <div>
             <label class="block text-[10px] font-bold text-slate-600">Espessura Borda</label>
             <input type="number" value="${el.borderWidth || 2}" onchange="layoutEditorModule.updateProp('borderWidth', parseInt(this.value))" class="w-full text-xs p-1 border rounded">
           </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-3">
           <div>
              <label class="block text-[10px] font-bold text-slate-600">Alinhamento</label>
              <select onchange="layoutEditorModule.updateProp('align', this.value)" class="w-full text-xs p-1 border rounded">
                 <option value="left" ${el.align === 'left' ? 'selected' : ''}>Esquerda</option>
                 <option value="center" ${el.align === 'center' ? 'selected' : ''}>Centro</option>
                 <option value="right" ${el.align === 'right' ? 'selected' : ''}>Direita</option>
              </select>
           </div>
           <div>
              <label class="block text-[10px] font-bold text-slate-600">Fonte</label>
              <input type="text" value="${el.font}" onchange="layoutEditorModule.updateProp('font', this.value)" class="w-full text-xs p-1 border rounded">
           </div>
        </div>
      `;
    }

    return html;
  },

  selectElement(id, e) {
    if (e) {
      // Initiate drag
      const container = document.getElementById('layout-canvas-container');
      const elDom = document.getElementById(id);
      const currentLayout = this.currentTab === 'front' ? this.layoutFront : this.layoutBack;
      const dataEl = currentLayout.find(x => x.id === id);
      
      const scale = container.getBoundingClientRect().width / container.offsetWidth;
      let startX = e.clientX;
      let startY = e.clientY;
      let elX = dataEl.x;
      let elY = dataEl.y;

      const onMove = (ev) => {
         const dx = (ev.clientX - startX) / scale;
         const dy = (ev.clientY - startY) / scale;
         dataEl.x = Math.round(elX + dx);
         dataEl.y = Math.round(elY + dy);
         elDom.style.left = dataEl.x + 'px';
         elDom.style.top = dataEl.y + 'px';
      };

      const onUp = () => {
         document.removeEventListener('mousemove', onMove);
         document.removeEventListener('mouseup', onUp);
         this.renderEditorModal(); // re-render props
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
    this.selectedElementId = id;
    this.renderEditorModal();
  },

  updateProp(prop, value) {
    const currentLayout = this.currentTab === 'front' ? this.layoutFront : this.layoutBack;
    const el = currentLayout.find(x => x.id === this.selectedElementId);
    if (el) {
       el[prop] = value;
       this.renderEditorModal();
    }
  },

  deleteSelected() {
    if (!this.selectedElementId) return;
    const currentLayout = this.currentTab === 'front' ? this.layoutFront : this.layoutBack;
    const idx = currentLayout.findIndex(x => x.id === this.selectedElementId);
    if (idx > -1) {
       currentLayout.splice(idx, 1);
       this.selectedElementId = null;
       this.renderEditorModal();
    }
  },

  addElement(type) {
    const currentLayout = this.currentTab === 'front' ? this.layoutFront : this.layoutBack;
    const id = type + '_' + Date.now();
    if (type === 'photo') {
       currentLayout.push({ id, type: 'photo', x: 282, y: 350, w: 120, h: 120, radius: 60 });
    } else if (type === 'label') {
       currentLayout.push({ id, type: 'text', field: '', label: 'TEXTO FIXO', x: 342, y: 500, w: 200, h: 50, color: '#000000', bgTransparent: true, borderTransparent: true, font: 'bold 30px Arial', align: 'center' });
    } else {
       currentLayout.push({ id, type: 'text', field: 'campo1', label: 'Novo Campo', x: 342, y: 500, w: 200, h: 50, color: '#000000', bgTransparent: true, borderTransparent: true, font: 'bold 30px Arial', align: 'center' });
    }
    this.selectedElementId = id;
    this.renderEditorModal();
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.selectedElementId = null;
    this.renderEditorModal();
  },

  changeCropMarks(val) {
    this.cropMarks = val;
    this.renderEditorModal();
  },

  handleBgUpload(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.currentTab === 'front') this.bgFront = e.target.result;
      else this.bgBack = e.target.result;
      this.renderEditorModal();
    };
    reader.readAsDataURL(file);
  },

  initDraggables() {
    // Just an empty function, drag is handled inline via selectElement mousedown
  },

  saveLayout() {
    const settings = window.selfserviceModule.getSettings();
    let t = settings.templates.find(x => x.id === this.currentTemplateId);
    if (t) {
       t.layout_front = this.layoutFront;
       t.layout_back = this.layoutBack;
       t.bg_front = this.bgFront;
       t.bg_back = this.bgBack;
       t.crop_marks = this.cropMarks;
       window.selfserviceModule.saveSettings(settings);
       alert("Layout salvo com sucesso!");
       this.closeEditor();
       window.selfserviceModule.render();
    }
  }
};

