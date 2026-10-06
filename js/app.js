window.app = {
  currentTab: 'production',

  init() {
    this.updateUserHeader();
    const perms = window.authModule.getRolePermissions();
    const initialTab = window.authModule.canAccess(this.currentTab) ? this.currentTab : perms.tabs[0];
    this.navigate(initialTab);
  },

  updateUserHeader() {
    const user = window.authModule.getCurrentUser();
    const permissions = window.authModule.getRolePermissions();

    const nameEl = document.getElementById('user-header-name');
    const badgeEl = document.getElementById('user-header-badge');
    if (nameEl) nameEl.textContent = user.nome || user.login;
    if (badgeEl) {
      badgeEl.textContent = permissions.name;
      badgeEl.className = `text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${permissions.badgeColor}`;
    }

    // Branding Dinâmico (Multi-tenant)
    if (window.store) {
      const settings = window.store.getSettings();
      const tenantNameEl = document.getElementById('header-tenant-name');
      const tenantLogoImg = document.getElementById('header-logo-img');
      const tenantLogoContainer = document.getElementById('header-logo-container');
      
      if (tenantNameEl) {
        tenantNameEl.textContent = settings.tenantName || 'Top Digital';
      }
      if (tenantLogoImg && tenantLogoContainer) {
        const logoUrl = settings.tenantLogo || 'assets/demo-top-digital.png';
        tenantLogoImg.src = logoUrl;
        
        // Se a logo for muito longa ou precisar de ajustes, pode-se tratar aqui. 
        // Vamos apenas garantir que ela aparece.
      }
    }

    // Controle de abas por perfil
    document.querySelectorAll('#nav-tabs-container .nav-link').forEach(link => {
      const tab = link.getAttribute('data-tab');
      if (window.authModule.canAccess(tab)) {
        link.classList.remove('hidden');
      } else {
        link.classList.add('hidden');
      }
    });

    // Controle de botões de ação do topo
    const btnNewOrder = document.getElementById('btn-header-new-order');
    if (btnNewOrder) {
      if (window.authModule.can('canCreateOrders')) {
        btnNewOrder.classList.remove('hidden');
      } else {
        btnNewOrder.classList.add('hidden');
      }
    }

    if (window.store) {
      window.store.updateSyncBadge(!!window.store.supabaseClient);
    }
  },

  navigate(tab) {
    if (!window.authModule.canAccess(tab)) {
      alert(`Acesso restrito: seu perfil (${window.authModule.getCurrentUser().role}) não possui permissão para esta aba.`);
      const perms = window.authModule.getRolePermissions();
      tab = perms.tabs[0];
    }

    this.currentTab = tab;
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-tab') === tab) {
        link.className = 'nav-link w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-lg bg-blue-50 text-blue-700 shadow-sm border-r-4 border-blue-600';
      } else {
        link.className = 'nav-link w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors';
      }
    });

    switch (tab) {
      case 'production':
        window.productionModule.render();
        break;
      case 'sales':
        window.salesModule.render();
        break;
      case 'clients':
        window.clientsModule.render();
        break;
      case 'suppliers':
        window.suppliersModule.render();
        break;
      case 'products':
        window.productsModule.render();
        break;
      case 'finance':
        window.financeModule.render();
        break;
      case 'settings':
        this.renderSettings();
        break;
      case 'owner':
        this.renderOwner();
        break;
      case 'selfservice':
        window.selfserviceModule.render();
        break;
    }
  },


  renderOwner() {
    if (!window.authModule.can('canManageSettings')) {
      document.getElementById('view-container').innerHTML = '<div class="p-8 text-center text-red-500 font-bold">Acesso Negado.</div>';
      return;
    }
    const isMasterAdmin = true;
    const settings = window.store.getSettings();
    const users = window.authModule.getUsers();
    const container = document.getElementById('view-container');

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Painel do Proprietário</h1>
            <p class="text-slate-500 text-sm">Controle de Usuários, White Label e Dados da Gráfica</p>
          </div>
        </div>

<!-- Configurações da Empresa (Gráfica) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <h2 class="text-base font-bold text-slate-800">🏢 Configurações da Empresa (Sua Gráfica)</h2>
            ${isMasterAdmin ? '<span class="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">Modo Edição (ADM)</span>' : '<span class="text-xs text-slate-500">Apenas visualização</span>'}
          </div>
          <p class="text-xs text-slate-500">Estes dados aparecem no cabeçalho e rodapé dos orçamentos, ordens de serviço e recibos.</p>
          
          <form id="company-config-form" class="space-y-4" onsubmit="app.saveCompanyConfig(event)">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Razão Social / Nome Fantasia *</label>
                <input type="text" id="comp-nome" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white" value="${settings.companyName || ''}" ${isMasterAdmin ? 'required' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
                <input type="text" id="comp-cnpj" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white" value="${settings.companyCnpj || ''}" ${isMasterAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Telefone Fixo</label>
                <input type="text" id="comp-tel" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white" value="${settings.companyPhone || ''}" ${isMasterAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Celular / WhatsApp *</label>
                <input type="text" id="comp-cel" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white" value="${settings.companyCell || ''}" ${isMasterAdmin ? 'required' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                <input type="email" id="comp-email" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white" value="${settings.companyEmail || ''}" ${isMasterAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Endereço / Localização</label>
                <input type="text" id="comp-end" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white" value="${settings.companyAddress || ''}" ${isMasterAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Site / Portfólio</label>
                <input type="url" id="comp-site" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white" value="${settings.companySite || ''}" ${isMasterAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Instagram (@)</label>
                <input type="text" id="comp-insta" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white" value="${settings.companyInsta || ''}" ${isMasterAdmin ? '' : 'disabled'}>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Upload da Logomarca (Imagem)</label>
                <input type="file" accept="image/*" id="comp-logo-file" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white mb-2" ${isMasterAdmin ? '' : 'disabled'} onchange="app.handleLogoUpload(this, 'comp-logo-preview', 'comp-logo-base64')">
                <input type="hidden" id="comp-logo-base64" value="${settings.companyLogo || ''}">
                <div class="h-16 border rounded bg-slate-50 flex items-center justify-center overflow-hidden">
                  <img id="comp-logo-preview" src="${settings.companyLogo || ''}" class="max-h-full max-w-full object-contain" onerror="this.src=''; this.alt='Sem Logo'">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Mensagem de Rodapé (Orçamentos)</label>
                <textarea id="comp-msg" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white h-24" ${isMasterAdmin ? '' : 'disabled'}>${settings.companyFooterMsg || ''}</textarea>
              </div>
            </div>

            ${isMasterAdmin ? `
              <div class="flex justify-end pt-2">
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition shadow-sm">
                  Salvar Dados da Gráfica
                </button>
              </div>
            ` : ''}
          </form>
        </div>
        
<!-- Personalização de Marca (White Label) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
              Personalização da Gráfica (White Label)
            </h2>
          </div>
          
          <p class="text-xs text-slate-500">
            Defina o nome e a logomarca da sua empresa. Esses dados aparecerão no topo do sistema e em relatórios.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Nome da Gráfica / Cliente</label>
              <input type="text" id="set-tenant-name" value="${settings.tenantName || ''}" placeholder="Ex: Top Digital" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Upload da Logomarca (Imagem)</label>
              <input type="file" accept="image/*" id="set-tenant-logo-file" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" onchange="app.handleLogoUpload(this, 'tenant-logo-preview', 'set-tenant-logo')">
              <input type="hidden" id="set-tenant-logo" value="${settings.tenantLogo || ''}">
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button onclick="app.saveTenantSettings()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition">
              Salvar Marca
            </button>
          </div>
        </div>

        <!-- Gestão de Usuários da Equipe (ADMIN) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Cadastro & Controle de Usuários (RBAC)
              </h2>
              <p class="text-xs text-slate-500">Cadastre novos operadores, defina perfis e controle datas de acesso</p>
            </div>
            <div class="flex gap-2">
              <button onclick="app.openChangePasswordModal()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition">
                Trocar Minha Senha
              </button>
              ${isMasterAdmin ? `
                <button onclick="app.openUserModal()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition">
                  + Novo Usuário
                </button>
              ` : ''}
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th class="p-2.5">Nome / Operador</th>
                  <th class="p-2.5">Login</th>
                  <th class="p-2.5">Perfil</th>
                  <th class="p-2.5">Status</th>
                  <th class="p-2.5">Data Cadastro</th>
                  <th class="p-2.5">Último Acesso</th>
                  <th class="p-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${users.map(u => {
                  const perms = ROLE_PERMISSIONS[u.role] || {};
                  const dtCad = u.data_cadastro ? new Date(u.data_cadastro).toLocaleDateString('pt-BR') : '-';
                  const dtAcesso = u.data_ultimo_acesso ? new Date(u.data_ultimo_acesso).toLocaleString('pt-BR') : 'Nunca';
                  return `
                    <tr class="hover:bg-slate-50">
                      <td class="p-2.5 font-bold text-slate-800">${u.nome}</td>
                      <td class="p-2.5 font-mono text-slate-600">${u.login}</td>
                      <td class="p-2.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${perms.badgeColor || ''}">
                          ${u.role}
                        </span>
                      </td>
                      <td class="p-2.5">
                        ${u.ativo !== false ? `
                          <span class="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Ativo
                          </span>
                        ` : `
                          <span class="inline-flex items-center text-red-600 font-semibold text-[11px]">
                            <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span> Inativo
                          </span>
                        `}
                      </td>
                      <td class="p-2.5 text-slate-500">${dtCad}</td>
                      <td class="p-2.5 text-slate-500">${dtAcesso}</td>
                      <td class="p-2.5 text-right space-x-2">
                        ${isMasterAdmin ? `
                          <button onclick="app.openUserModal('${u.id}')" class="text-blue-600 hover:text-blue-800 font-bold">Editar</button>
                          ${u.login !== 'admin' ? `
                            <button onclick="app.deleteUser('${u.id}')" class="text-red-600 hover:text-red-800 font-bold">Excluir</button>
                          ` : ''}
                        ` : '<span class="text-slate-400 text-[10px]">-</span>'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    `;
  },
  renderSettings() {
    const isMasterAdmin = window.authModule.can('canManageSettings');
    const settings = window.store.getSettings();
    const config = window.GRAFSIS_CONFIG ? window.GRAFSIS_CONFIG.getSupabaseConfig() : settings;
    const users = window.authModule.getUsers();
    const container = document.getElementById('view-container');

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Sincronização Nuvem & Backup</h1>
            <p class="text-slate-500 text-sm">Gerencie a sincronização Supabase (PC & Celular) e controle de usuários da equipe</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.store.syncAllWithCloud()" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Sincronizar Nuvem Agora
            </button>
          </div>
        </div>

                <!-- Conexão Supabase Cloud -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 5h16M4 12c0 2 1 3 3 3h10c2 0 3-1 3-3"></path></svg>
              Conexão com Banco de Dados Nuvem (Supabase)
            </h2>
            <div id="settings-status-indicator">
              ${window.store.supabaseClient ? `
                <span class="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Conectado
                </span>
              ` : `
                <span class="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span> Desconectado / Local
                </span>
              `}
            </div>
          </div>
          
          <p class="text-xs text-slate-500">
            A mesma chave deve estar salva para que <strong>PC e Celular</strong> acessem exatamente os mesmos clientes e pedidos instantaneamente.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Project URL</label>
              <input type="text" id="set-url" value="${config.url || ''}" placeholder="https://exemplo.supabase.co" class="w-full px-3 py-2 border rounded-lg text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Anon / Public API Key</label>
              <input type="password" id="set-key" value="${config.key || ''}" placeholder="Cole a chave anon copiada do Supabase..." class="w-full px-3 py-2 border rounded-lg text-xs font-mono">
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button onclick="app.saveSupabaseSettings()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition">
              Salvar e Conectar
            </button>
            <button onclick="app.testSupabaseConnection()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition">
              Testar Conexão
            </button>
          </div>
        </div>

        <!-- Backup Local JSON -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 class="text-base font-bold text-slate-800">Backup e Exportação Offline</h2>
          <p class="text-xs text-slate-500">Baixe uma cópia completa dos seus dados em arquivo JSON ou restaure um backup existente.</p>
          <div class="flex gap-3">
            <button onclick="window.store.exportData()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition">
              Baixar Backup Completo (.JSON)
            </button>
            <input type="file" id="import-file" accept=".json" onchange="app.handleImport(this)" class="hidden">
            <button onclick="document.getElementById('import-file').click()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition">
              Restaurar Arquivo de Backup
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Modal de Criação / Edição de Usuário
  openUserModal(userId = null) {
    const isEdit = !!userId;
    const user = isEdit ? window.authModule.getUsers().find(u => u.id === userId) : null;

    const modal = document.getElementById('user-modal');
    if (!modal) return;

    document.getElementById('user-modal-title').textContent = isEdit ? 'Editar Usuário' : 'Novo Usuário';
    document.getElementById('user-form-id').value = user ? user.id : '';
    document.getElementById('user-form-nome').value = user ? user.nome : '';
    document.getElementById('user-form-login').value = user ? user.login : '';
    document.getElementById('user-form-senha').value = user ? (user.senha || user.pin || '1234') : '1234';
    document.getElementById('user-form-role').value = user ? user.role : 'VENDAS';
    document.getElementById('user-form-ativo').checked = user ? (user.ativo !== false) : true;
    
    const infoMeta = document.getElementById('user-form-meta');
    if (user && user.data_cadastro) {
      infoMeta.textContent = `Cadastrado em: ${new Date(user.data_cadastro).toLocaleString('pt-BR')}`;
      infoMeta.classList.remove('hidden');
    } else {
      infoMeta.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeUserModal() {
    const modal = document.getElementById('user-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async handleUserFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-form-id').value;
    const nome = document.getElementById('user-form-nome').value.trim();
    const login = document.getElementById('user-form-login').value.trim().toLowerCase();
    const senha = document.getElementById('user-form-senha').value.trim();
    const role = document.getElementById('user-form-role').value;
    const ativo = document.getElementById('user-form-ativo').checked;

    const existing = id ? window.authModule.getUsers().find(u => u.id === id) : null;

    const userData = {
      id: id || undefined,
      nome,
      login,
      senha: senha || '1234',
      pin: senha || '1234',
      role,
      ativo,
      data_cadastro: existing ? existing.data_cadastro : new Date().toISOString(),
      data_ultimo_acesso: existing ? existing.data_ultimo_acesso : null
    };

    await window.authModule.saveUser(userData);
    this.closeUserModal();
    this.renderSettings();
    alert('Usuário salvo com sucesso!');
  },

  async deleteUser(id) {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    await window.authModule.deleteUser(id);
    this.renderSettings();
  },

  // Modal de Troca de Senha
  openChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
      document.getElementById('cp-current').value = '';
      document.getElementById('cp-new').value = '';
      document.getElementById('cp-confirm').value = '';
      const err = document.getElementById('cp-error');
      if (err) err.classList.add('hidden');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async handleChangePasswordSubmit(e) {
    e.preventDefault();
    const curr = document.getElementById('cp-current').value;
    const newP = document.getElementById('cp-new').value;
    const conf = document.getElementById('cp-confirm').value;
    const err = document.getElementById('cp-error');

    if (newP !== conf) {
      err.textContent = 'A confirmação de senha não confere.';
      err.classList.remove('hidden');
      return;
    }
    if (newP.length < 4) {
      err.textContent = 'A nova senha deve ter no mínimo 4 caracteres.';
      err.classList.remove('hidden');
      return;
    }

    const currentU = window.authModule.getCurrentUser();
    const res = await window.authModule.changePassword(currentU.id, curr, newP);
    if (res.success) {
      alert(res.message);
      this.closeChangePasswordModal();
    } else {
      err.textContent = res.message;
      err.classList.remove('hidden');
    }
  },

  openVersionModal() {
    const modal = document.getElementById('version-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeVersionModal() {
    const modal = document.getElementById('version-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  saveSupabaseSettings() {
    const url = document.getElementById('set-url').value.trim();
    const key = document.getElementById('set-key').value.trim();
    if (window.GRAFSIS_CONFIG) {
      window.GRAFSIS_CONFIG.setSupabaseConfig(url, key);
    }
    const settings = window.store.getSettings();
    window.store.saveSettings({ ...settings, supabaseUrl: url, supabaseKey: key });
    this.updateUserHeader();
    this.renderSettings();
    alert('Configurações salvas! Sincronizando com o Supabase...');
    window.store.syncAllWithCloud();
  },

  saveTenantSettings() {
    const name = document.getElementById('set-tenant-name').value.trim(); const tid = document.getElementById('set-tenant-id')?.value.trim();
    const logo = document.getElementById('set-tenant-logo').value.trim();
    
    const settings = window.store.getSettings();
    settings.tenantName = name; settings.tenantId = tid;
    settings.tenantLogo = logo;
    
    window.store.saveSettings(settings);
    this.updateUserHeader();
    alert('Marca da gráfica salva com sucesso!');
  },

  async testSupabaseConnection() {
    if (!window.store.supabaseClient) {
      alert('Supabase desconectado. Verifique se preencheu a URL e a Anon Key e salvou.');
      return;
    }
    try {
      const { data, error } = await window.store.supabaseClient.from('clientes').select('count', { count: 'exact', head: true });
      if (error) {
        alert('Erro ao conectar ao Supabase: ' + error.message);
      } else {
        alert('Conexão com o Supabase efetuada com SUCESSO! A nuvem está pronta para sincronizar PC e Celular.');
      }
    } catch (e) {
      alert('Falha no teste: ' + e.message);
    }
  },

  handleImport(input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (window.store.importData(e.target.result)) {
          alert('Dados restaurados com sucesso!');
          this.navigate('production');
        }
      };
      reader.readAsText(file);
    }
  },

  handleLogoUpload(input, previewId, hiddenInputId) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      const preview = document.getElementById(previewId);
      const hidden = document.getElementById(hiddenInputId);
      
      if (preview) preview.src = base64;
      if (hidden) hidden.value = base64;
    };
    reader.readAsDataURL(file);
  },

  saveCompanyConfig(e) {
    e.preventDefault();
    const settings = window.store.getSettings();
    
    settings.companyName = document.getElementById('comp-nome').value.trim();
    settings.companyCnpj = document.getElementById('comp-cnpj').value.trim();
    settings.companyPhone = document.getElementById('comp-tel').value.trim();
    settings.companyCell = document.getElementById('comp-cel').value.trim();
    settings.companyEmail = document.getElementById('comp-email').value.trim();
    settings.companyAddress = document.getElementById('comp-end').value.trim();
    settings.companySite = document.getElementById('comp-site').value.trim();
    settings.companyInsta = document.getElementById('comp-insta').value.trim();
    settings.companyLogo = document.getElementById('comp-logo-base64').value.trim();
    settings.companyFooterMsg = document.getElementById('comp-msg').value.trim();
    
    window.store.saveSettings(settings);
    alert('Dados da gráfica salvos com sucesso!');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});




