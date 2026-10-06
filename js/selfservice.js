window.selfserviceModule = {
  currentClient: null,
  
  getSettings() {
    const s = localStorage.getItem('grafsis_cracha_settings');
    return s ? JSON.parse(s) : { bg_url: '', price: 15.00 };
  },
  
  saveSettings(s) {
    localStorage.setItem('grafsis_cracha_settings', JSON.stringify(s));
  },
  
  render() {
    const container = document.getElementById('view-container');
    const user = window.authModule.getCurrentUser();
    const isAdmin = user && ['ADMIN', 'PROPRIETARIO', 'GERENTE'].includes(user.role);
    
    let adminBtn = '';
    if (isAdmin) {
      adminBtn = `<button onclick="selfserviceModule.openSettings()" class="mb-4 text-xs font-bold text-blue-600 underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">Acesso Restrito: Configurar Arte e Preço do Crachá</button>`;
    }

    if (!this.currentClient) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[70vh]">
          ` + adminBtn + `
          <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 text-center">
            <h1 class="text-2xl font-black text-slate-800 mb-2">Autoatendimento</h1>
            <p class="text-slate-500 mb-6">Acesse com seu CPF ou Telefone para solicitar seu crachá.</p>
            
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
      this.renderDashboard();
    } else {
      alert('Cliente não encontrado. Verifique o número digitado ou dirija-se ao balcão.');
    }
  },

  logout() {
    this.currentClient = null;
    this.photoDataUrl = null;
    this.render();
  },

  renderDashboard() {
    const container = document.getElementById('view-container');
    const settings = this.getSettings();
    const c = this.currentClient;
    const saldo = c.saldo_corrente || 0;
    
    container.innerHTML = `
      <div class="max-w-4xl mx-auto py-6">
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

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
            Solicitar Novo Crachá
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form id="cracha-form" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nome no Crachá *</label>
                <input type="text" id="cr-nome" required oninput="selfserviceModule.preview()" placeholder="Ex: JOÃO SILVA" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Matrícula / ID *</label>
                  <input type="text" id="cr-mat" required oninput="selfserviceModule.preview()" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Tipo Sanguíneo</label>
                  <input type="text" id="cr-sangue" oninput="selfserviceModule.preview()" placeholder="Ex: O+" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Sua Foto (Selfie ou Arquivo) *</label>
                <input type="file" id="cr-foto" accept="image/*" required onchange="selfserviceModule.handlePhoto(this)" class="w-full text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition">
              </div>
              
              <div class="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                  <span class="font-bold text-slate-600 text-sm">Valor do Crachá:</span>
                  <span class="font-black text-blue-700 text-xl">R$ ${settings.price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <button type="button" onclick="selfserviceModule.checkout()" class="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl transition shadow-md uppercase tracking-wider text-sm flex justify-center items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Gerar e Descontar do Saldo
                </button>
              </div>
            </form>

            <div class="flex flex-col items-center justify-start border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8 border-slate-200">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pré-visualização do Crachá</p>
              <div id="canvas-container" class="relative w-[250px] h-[395px] border border-slate-300 shadow-lg rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <span id="canvas-loading" class="absolute text-slate-400 text-xs font-bold">Carregando prévia...</span>
                <canvas id="cracha-canvas" width="250" height="395" class="w-full h-full relative z-10"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    setTimeout(() => this.preview(), 50);
  },

  photoDataUrl: null,

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
    const canvas = document.getElementById('cracha-canvas');
    if (!canvas) return;
    document.getElementById('canvas-loading').style.display = 'none';
    const ctx = canvas.getContext('2d');
    const settings = this.getSettings();
    
    const nome = document.getElementById('cr-nome')?.value || 'NOME DO CLIENTE';
    const mat = document.getElementById('cr-mat')?.value || '123456';
    const sangue = document.getElementById('cr-sangue')?.value || '';

    // Fundo limpo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawTextsAndPhoto = () => {
      ctx.save();
      
      // Foto centralizada (100x100) Y=70
      if (this.photoDataUrl) {
        const img = new Image();
        img.onload = () => {
          // Circle mask
          ctx.beginPath();
          ctx.arc(125, 120, 55, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();
          
          // Draw image to fill the circle
          const sizer = Math.max(110 / img.width, 110 / img.height);
          const drawW = img.width * sizer;
          const drawH = img.height * sizer;
          ctx.drawImage(img, 125 - drawW/2, 120 - drawH/2, drawW, drawH);
          
          ctx.restore();
          drawTexts();
        };
        img.src = this.photoDataUrl;
      } else {
        ctx.beginPath();
        ctx.arc(125, 120, 55, 0, Math.PI * 2, true);
        ctx.fillStyle = '#e2e8f0';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        drawTexts();
      }
    };

    const drawTexts = () => {
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.font = '900 18px Arial, sans-serif';
      ctx.fillText(nome.toUpperCase(), canvas.width / 2, 220, 230);
      
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('MATRÍCULA: ' + mat.toUpperCase(), canvas.width / 2, 250);
      
      if (sangue) {
        ctx.fillStyle = '#e11d48';
        ctx.font = '900 16px Arial, sans-serif';
        ctx.fillText('SANGUE: ' + sangue.toUpperCase(), canvas.width / 2, 280);
      }
    };

    if (settings.bg_url) {
      const bg = new Image();
      bg.onload = () => {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        drawTextsAndPhoto();
      };
      bg.onerror = () => drawTextsAndPhoto();
      bg.src = settings.bg_url;
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawTextsAndPhoto();
    }
  },

  async checkout() {
    const settings = this.getSettings();
    const nome = document.getElementById('cr-nome').value.trim();
    const mat = document.getElementById('cr-mat').value.trim();
    
    if (!nome || !mat || !this.photoDataUrl) {
      alert('Preencha os campos obrigatórios (Nome, Matrícula e Foto).');
      return;
    }

    this.currentClient.saldo_corrente = Number(this.currentClient.saldo_corrente) || 0;
    if (this.currentClient.saldo_corrente < settings.price) {
      alert('SALDO INSUFICIENTE!\n\nVocê possui R$ ' + this.currentClient.saldo_corrente.toLocaleString('pt-BR', {minimumFractionDigits: 2}) + ' de saldo, mas o crachá custa R$ ' + settings.price.toLocaleString('pt-BR', {minimumFractionDigits: 2}) + '.\n\nDirija-se ao balcão para recarregar sua conta.');
      return;
    }

    if(!confirm('CONFIRMAR PEDIDO?\n\nSerão descontados R$ ' + settings.price.toLocaleString('pt-BR', {minimumFractionDigits: 2}) + ' do seu saldo.')) return;

    // Deduct balance
    const clients = window.store.getClients();
    const idx = clients.findIndex(c => c.id === this.currentClient.id);
    if(idx > -1) {
      clients[idx].saldo_corrente = (Number(clients[idx].saldo_corrente) || 0) - settings.price;
      await window.store.saveClient(clients[idx]);
      this.currentClient.saldo_corrente = clients[idx].saldo_corrente;
    }

    // Generate Order
    const canvas = document.getElementById('cracha-canvas');
    const finalImage = canvas.toDataURL('image/png');
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
      itens: [{
        produto_id: '',
        descricao: 'Crachá Autoatendimento - ' + nome,
        quantidade: 1,
        tipo_calculo: 'unidade',
        preco_base: settings.price,
        preco_unitario: settings.price,
        valor_total: settings.price,
        arte_url: finalImage
      }],
      historico: [{
        data: dtNow,
        usuario: 'Autoatendimento',
        acao: 'Pedido gerado. Pago usando Saldo da Conta Corrente.'
      }]
    };

    await window.store.saveOrder(pedido);
    await window.store.saveFinanceEntry({
      tipo: 'receber',
      descricao: 'Pagamento de Crachá via Conta Corrente (Autoatendimento) - Pedido #' + pedido.numero,
      valor: settings.price,
      data_vencimento: dtNow.split('T')[0],
      data_pagamento: dtNow.split('T')[0],
      status: 'pago',
      forma_pagamento: 'saldo_corrente',
      pedido_id: pedido.id
    });

    alert('CRACHÁ ENVIADO PARA PRODUÇÃO!\n\nSeu pedido foi registrado com sucesso e o valor foi descontado da sua conta.');
    this.logout();
  },

  openSettings() {
    const s = this.getSettings();
    const modalHtml = `
      <div id="cracha-settings-modal" class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100">
          <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h2 class="text-lg font-bold text-slate-800">Configuração do Crachá</h2>
            <button onclick="document.getElementById('cracha-settings-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Valor do Crachá (R$) debitado do saldo</label>
              <input type="number" step="0.01" id="cfg-price" value="${s.price}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Arte Base (Fundo do Crachá)</label>
              <input type="file" id="cfg-bg" accept="image/*" class="w-full text-xs mb-2 p-2 border border-slate-300 rounded-lg bg-slate-50">
              <p class="text-[10px] text-slate-500">A arte ficará no fundo (sugestão: 250x395 pixels). O sistema vai pintar a foto no meio e o nome embaixo.</p>
              ${s.bg_url ? `<div class="mt-2 text-xs text-green-600 font-bold">Arte atual já carregada. Selecione uma nova apenas se quiser substituir.</div>` : ''}
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6 border-t border-slate-100 pt-4">
            <button onclick="document.getElementById('cracha-settings-modal').remove()" class="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-sm transition">Cancelar</button>
            <button onclick="selfserviceModule.saveSettingsForm()" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold text-sm shadow-md transition">Salvar Configurações</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  saveSettingsForm() {
    const price = parseFloat(document.getElementById('cfg-price').value) || 0;
    const fileInput = document.getElementById('cfg-bg');
    
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.saveSettings({ price: price, bg_url: e.target.result });
        document.getElementById('cracha-settings-modal').remove();
        this.render();
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      const old = this.getSettings();
      this.saveSettings({ price: price, bg_url: old.bg_url });
      document.getElementById('cracha-settings-modal').remove();
      this.render();
    }
  }
};