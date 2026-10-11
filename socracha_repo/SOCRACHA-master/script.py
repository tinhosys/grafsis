import re

with open('js/cracha.js', 'r', encoding='utf-8') as f:
    code = f.read()

login_replacement = """
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
            <p class="text-sm text-slate-500 mt-4">Ainda n\u00e3o tem conta? <a href="#" onclick="selfserviceModule.isRegistering=true; selfserviceModule.render(); return false;" class="text-blue-600 font-bold hover:underline">Cadastre-se</a></p>
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
            <p class="text-sm text-slate-500 mt-4 text-center">J\u00e1 tem conta? <a href="#" onclick="selfserviceModule.isRegistering=false; selfserviceModule.render(); return false;" class="text-blue-600 font-bold hover:underline">Fazer Login</a></p>
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

    if (!cpf || cpf.length < 11) return alert('CPF inv\u00e1lido.');

    const clients = JSON.parse(localStorage.getItem('grafsis_clients') || '[]');
    if (clients.find(c => (c.cpf_cnpj || '').replace(/\D/g, '') === cpf)) {
      return alert('CPF j\u00e1 cadastrado. Fa\u00e7a login.');
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
"""

code = re.sub(r'  render\(\) \{.*?(?=  logout\(\) \{)', login_replacement, code, flags=re.DOTALL)

dashboard_replacement = """
  renderDashboard() {
    const container = document.getElementById('view-container');
    const tabs = [
      { id: 'vitrine', label: 'Vitrine' },
      { id: 'pedido', label: 'Crach\u00e1 Personalizado' },
      { id: 'cart', label: `Carrinho (${this.cart.length})` },
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
    else if (this.currentTab === 'pedido') contentHtml = this.getPedidoHtml();
    else if (this.currentTab === 'cart') contentHtml = this.getCartHtml();
    else if (this.currentTab === 'meus_pedidos') contentHtml = this.getMeusPedidosHtml();
    else if (this.currentTab === 'perfil') contentHtml = this.getPerfilHtml();
    else contentHtml = this.getVitrineHtml();

    container.innerHTML = `
      <div class="mb-6 bg-blue-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black">Ol\u00e1, ${this.currentClient.nome.toUpperCase()}!</h2>
          <p class="text-blue-100 text-sm">Bem-vindo \u00e0 nossa loja</p>
        </div>
        <div class="text-right flex flex-col items-end">
          <button onclick="selfserviceModule.logout()" class="text-xs text-blue-200 hover:text-white underline mb-2">Sair da Conta</button>
          <button onclick="selfserviceModule.setTab('cart')" class="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-md transition-transform hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
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
          <h3 class="text-xl font-bold text-slate-600">Seu carrinho est\u00e1 vazio</h3>
          <p class="text-slate-400 mt-2 mb-6">Acesse a vitrine para escolher seus produtos.</p>
          <button onclick="selfserviceModule.setTab('vitrine')" class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">Ver Produtos</button>
        </div>
      `;
    }

    let total = 0;
    let itemsHtml = this.cart.map((item, idx) => {
      let price = item.preco || 0;
      total += price * (item.quantidade || 1);
      
      let details = item.type === 'cracha' ? `Crach\u00e1 Personalizado: ${item.nome}` : item.nome;
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
          <button onclick="selfserviceModule.finishOrder('Cart\u00e3o de Cr\u00e9dito')" class="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
            <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            <span class="font-bold text-slate-700">Cart\u00e3o de Cr\u00e9dito</span>
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
"""

code = re.sub(r'  renderDashboard\(\) \{.*?(?=  getPedidoHtml\(\) \{)', dashboard_replacement, code, flags=re.DOTALL)

with open('js/cracha.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("done")
