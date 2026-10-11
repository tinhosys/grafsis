/* ==============================================================================
   GRAFSIS - Controlador Principal da Aplicação (App Controller)
   Versão 2.8.0 - Suporte a RBAC Hierárquico (Admin / Proprietário), Gestão de Empresas,
   Painel do Proprietário sem Redundâncias, Perfil do Usuário e Login por CPF.
   ============================================================================== */

window.app = {
  currentTab: 'production',

  init() {
    this.updateUserHeader();

    // Primeiro de tudo: tela de login. Só entra se tiver acesso autenticado.
    if (!window.authModule.isAuthenticated()) {
      window.authModule.openLoginModal();
      return;
    }

    // Se já autenticado, fecha modal e exibe o dashboard
    window.authModule.closeLoginModal();
    const perms = window.authModule.getRolePermissions();
    const initialTab = window.authModule.canAccess(this.currentTab) ? this.currentTab : perms.tabs[0];
    this.navigate(initialTab);
  },

  updateUserHeader() {
    const user = window.authModule.getCurrentUser();
    const permissions = window.authModule.getRolePermissions();

    const nameEl = document.getElementById('user-header-name');
    const badgeEl = document.getElementById('user-header-badge');
    const userPhotoEl = document.getElementById('user-header-photo');
    const userIconEl = document.getElementById('user-header-icon');

    if (!user) {
      if (nameEl) nameEl.textContent = 'Não Conectado';
      if (badgeEl) {
        badgeEl.textContent = 'LOGIN NECESSÁRIO';
        badgeEl.className = 'text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-300';
      }
      if (userPhotoEl) userPhotoEl.classList.add('hidden');
      if (userIconEl) userIconEl.classList.remove('hidden');
      return;
    }

    if (nameEl) nameEl.textContent = user.operador || user.nome || user.login;
    if (badgeEl) {
      badgeEl.textContent = permissions.name;
      badgeEl.className = `text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${permissions.badgeColor}`;
    }

    if (userPhotoEl && userIconEl) {
      if (user.foto_url) {
        userPhotoEl.src = user.foto_url;
        userPhotoEl.classList.remove('hidden');
        userIconEl.classList.add('hidden');
      } else {
        userPhotoEl.classList.add('hidden');
        userIconEl.classList.remove('hidden');
      }
    }

    // Identificação do Ambiente / Empresa (Multi-tenant)
    if (window.store) {
      const activeTenant = window.store.getActiveTenant();
      const tenantNameEl = document.getElementById('header-tenant-name');
      const tenantLogoImg = document.getElementById('header-logo-img');
      const tenantEnvBadge = document.getElementById('header-environment-badge');

      if (tenantNameEl) {
        tenantNameEl.textContent = activeTenant.nome_fantasia || activeTenant.razao_social || 'Sua Gráfica';
      }
      if (tenantLogoImg) {
        tenantLogoImg.src = activeTenant.logo_url || 'assets/demo-top-digital.png';
      }
      if (tenantEnvBadge) {
        tenantEnvBadge.innerHTML = `🏢 Ambiente: <span class="font-bold text-slate-800">${activeTenant.nome_fantasia || activeTenant.razao_social}</span> <span class="font-mono text-blue-600">(ID: ${activeTenant.id})</span>`;
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
    if (!window.authModule.isAuthenticated()) {
      window.authModule.openLoginModal();
      return;
    }

    if (!window.authModule.canAccess(tab)) {
      const user = window.authModule.getCurrentUser();
      const roleName = user ? user.role : 'OPERADOR';
      alert(`Acesso restrito: seu perfil (${roleName}) não possui permissão para esta aba.`);
      const perms = window.authModule.getRolePermissions();
      tab = perms.tabs[0];
    }

    this.currentTab = tab;
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-tab') === tab) {
        link.className = 'nav-link w-full flex items-center gap-3.5 px-3.5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-white shadow-lg border-l-4 border-blue-500 backdrop-blur-sm group';
        const iconContainer = link.querySelector('span:first-child');
        if (iconContainer) {
          iconContainer.className = 'w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600 text-white shadow-md shadow-blue-500/30 transition-all';
        }
      } else {
        link.className = 'nav-link w-full flex items-center gap-3.5 px-3.5 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all duration-200 group';
        const iconContainer = link.querySelector('span:first-child');
        if (iconContainer) {
          iconContainer.className = 'w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-all shadow-sm';
        }
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
      case 'owner':
        this.renderOwner();
        break;
      case 'tenants':
        this.renderTenants();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  },

  switchTab(tab) {
    this.navigate(tab);
  },

  /* ==============================================================================
     PAINEL DO PROPRIETÁRIO (Sem redundâncias de marca - Imagem 3 & 4)
     Proprietário edita: Logomarca e Mensagem de Rodapé
     Admin do Sistema: edita todos os dados cadastrais da empresa
     ============================================================================== */
  renderOwner() {
    const currentUser = window.authModule.getCurrentUser();
    if (!window.authModule.can('canManageSettings')) {
      document.getElementById('view-container').innerHTML = '<div class="p-8 text-center text-red-500 font-bold">Acesso Negado: painel restrito ao Proprietário e Administrador.</div>';
      return;
    }

    const isSystemAdmin = (currentUser.role === 'ADMIN');
    const tenant = window.store.getActiveTenant();
    const users = window.authModule.getUsers().filter(u => isSystemAdmin || (u.empresa_id || '001') === tenant.id);
    const container = document.getElementById('view-container');

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Top Bar com Identificação de Ambiente -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">ID: ${tenant.id}</span>
              <h1 class="text-2xl font-black text-slate-800">Painel do Proprietário</h1>
            </div>
            <p class="text-slate-500 text-xs mt-1">Ambiente ativo: <strong class="text-slate-700">${tenant.nome_fantasia || tenant.razao_social}</strong> • Pacote: <span class="text-indigo-600 font-bold">${tenant.pacote_mensal || 'Profissional'}</span> (Válido até: ${tenant.data_expiracao ? new Date(tenant.data_expiracao).toLocaleDateString('pt-BR') : 'Ilimitado'})</p>
          </div>
          <div class="flex items-center gap-2">
            ${isSystemAdmin ? `
              <button onclick="app.navigate('tenants')" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Gestão de Todas Empresas
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Formulário da Empresa: Dados Gerais + Personalização (Unificado sem redundância) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
                🏢 Configurações da Empresa (Sua Gráfica)
              </h2>
              <p class="text-xs text-slate-500">Dados oficiais que constam em cabeçalhos, rodapés de orçamentos e ordens de serviço</p>
            </div>
            <div>
              ${isSystemAdmin 
                ? '<span class="text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">Modo Edição Completa (ADM)</span>' 
                : '<span class="text-xs text-amber-700 font-medium bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">Proprietário: Edição de Logo e Rodapé</span>'}
            </div>
          </div>

          <form id="company-config-form" onsubmit="app.saveCompanyConfig(event, '${tenant.id}')" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Razão Social / Nome Fantasia *</label>
                <input type="text" id="comp-nome" class="w-full px-3 py-2 border rounded-lg text-sm ${isSystemAdmin ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}" value="${tenant.razao_social || ''}" ${isSystemAdmin ? 'required' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">CNPJ</label>
                <input type="text" id="comp-cnpj" class="w-full px-3 py-2 border rounded-lg text-sm ${isSystemAdmin ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}" value="${tenant.cnpj || ''}" ${isSystemAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Telefone Fixo</label>
                <input type="text" id="comp-tel" class="w-full px-3 py-2 border rounded-lg text-sm ${isSystemAdmin ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}" value="${tenant.telefone_fixo || ''}" ${isSystemAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Celular / WhatsApp *</label>
                <input type="text" id="comp-cel" class="w-full px-3 py-2 border rounded-lg text-sm ${isSystemAdmin ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}" value="${tenant.celular_whatsapp || ''}" ${isSystemAdmin ? 'required' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                <input type="email" id="comp-email" class="w-full px-3 py-2 border rounded-lg text-sm ${isSystemAdmin ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}" value="${tenant.email || ''}" ${isSystemAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Endereço / Localização</label>
                <input type="text" id="comp-end" class="w-full px-3 py-2 border rounded-lg text-sm ${isSystemAdmin ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}" value="${tenant.endereco || ''}" ${isSystemAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Site / Portfólio</label>
                <input type="url" id="comp-site" class="w-full px-3 py-2 border rounded-lg text-sm ${isSystemAdmin ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}" value="${tenant.site || ''}" ${isSystemAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Instagram (@)</label>
                <input type="text" id="comp-insta" class="w-full px-3 py-2 border rounded-lg text-sm ${isSystemAdmin ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-100 text-slate-600 cursor-not-allowed'}" value="${tenant.instagram || ''}" ${isSystemAdmin ? '' : 'disabled'}>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Pacote Contratado & Expiração</label>
                <input type="text" class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed font-medium" value="${tenant.pacote_mensal || 'Profissional'} (Expira: ${tenant.data_expiracao || 'Sem data'})" disabled>
              </div>
            </div>

            <!-- Área Exclusiva do Proprietário e Admin (Logo e Rodapé) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-5 mt-4">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold text-slate-700">Upload da Logomarca (Imagem)</label>
                  <span class="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">Proprietário pode alterar</span>
                </div>
                <input type="file" accept="image/*" id="comp-logo-file" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2" onchange="app.handleLogoUpload(this, 'comp-logo-preview', 'comp-logo-base64')">
                <input type="hidden" id="comp-logo-base64" value="${tenant.logo_url || ''}">
                <div class="h-20 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                  <img id="comp-logo-preview" src="${tenant.logo_url || ''}" class="max-h-full max-w-full object-contain" onerror="this.src=''; this.alt='Sem Logo'">
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold text-slate-700">Mensagem de Rodapé (Orçamentos)</label>
                  <span class="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">Proprietário pode alterar</span>
                </div>
                <textarea id="comp-msg" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-28" placeholder="Digite uma mensagem personalizada para orçamentos e pedidos...">${tenant.rodape_msg || ''}</textarea>
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition shadow-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                ${isSystemAdmin ? 'Salvar Dados da Gráfica' : 'Salvar Logomarca e Rodapé'}
              </button>
            </div>
          </form>
        </div>

        <!-- Tabela de Cadastro & Controle de Usuários (RBAC - Imagem 2) -->
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
              <button onclick="app.openUserProfileConfigModal()" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                Configurações do Perfil
              </button>
              <button onclick="app.openUserModal()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1">
                + Novo Usuário
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th class="p-3 font-bold text-slate-700">Operador</th>
                  <th class="p-3 font-bold text-slate-700">Nome Completo</th>
                  <th class="p-3 font-bold text-slate-700">Login / CPF</th>
                  <th class="p-3 font-bold text-slate-700">Perfil</th>
                  <th class="p-3 font-bold text-slate-700">Status</th>
                  <th class="p-3 font-bold text-slate-700">Data Cadastro</th>
                  <th class="p-3 font-bold text-slate-700">Último Acesso</th>
                  <th class="p-3 font-bold text-slate-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${users.map(u => {
                  const perms = ROLE_PERMISSIONS[u.role] || {};
                  const dtCad = u.data_cadastro ? new Date(u.data_cadastro).toLocaleDateString('pt-BR') : '-';
                  const dtAcesso = u.data_ultimo_acesso ? new Date(u.data_ultimo_acesso).toLocaleString('pt-BR') : 'Nunca';
                  const canEdit = window.authModule.canManageTargetUser(u);
                  return `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                          ${u.foto_url ? `<img src="${u.foto_url}" class="w-full h-full object-cover">` : (u.operador || u.nome || 'O').charAt(0).toUpperCase()}
                        </div>
                        <span>${u.operador || u.nome.split(' ')[0]}</span>
                      </td>
                      <td class="p-3 text-slate-700">${u.nome}</td>
                      <td class="p-3 font-mono text-slate-500">${u.cpf ? window.authModule.maskCpf(u.cpf) : u.login}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${perms.badgeColor || ''}">
                          ${u.role}
                        </span>
                      </td>
                      <td class="p-3">
                        ${u.ativo !== false ? `
                          <span class="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Ativo
                          </span>
                        ` : `
                          <span class="inline-flex items-center text-red-600 font-semibold text-[11px]">
                            <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span> Bloqueado
                          </span>
                        `}
                      </td>
                      <td class="p-3 text-slate-500">${dtCad}</td>
                      <td class="p-3 text-slate-500">${dtAcesso}</td>
                      <td class="p-3 text-right space-x-2">
                        ${canEdit ? `
                          <button onclick="app.openUserModal('${u.id}')" class="text-blue-600 hover:text-blue-800 font-bold">Editar</button>
                          ${u.login !== 'admin' && u.cpf !== '59156813287' ? `
                            <button onclick="app.deleteUser('${u.id}')" class="text-red-600 hover:text-red-800 font-bold">Excluir</button>
                          ` : ''}
                        ` : '<span class="text-slate-400 text-[10px] italic">Protegido</span>'}
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

  /* ==============================================================================
     NOVO FORM: GESTÃO DE EMPRESAS / GRÁFICAS (Exclusivo para ADMIN do Sistema)
     ID aleatório/formatado '000', pacotes mensais, datas de validade e bloqueio geral
     ============================================================================== */
  renderTenants() {
    const currentUser = window.authModule.getCurrentUser();
    if (currentUser.role !== 'ADMIN') {
      document.getElementById('view-container').innerHTML = '<div class="p-8 text-center text-red-500 font-bold">Acesso restrito exclusivamente ao Administrador Geral do Sistema.</div>';
      return;
    }

    const tenants = window.store.getTenants();
    const container = document.getElementById('view-container');

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 class="text-2xl font-black text-slate-800">Gestão de Empresas & Gráficas (Tenants)</h1>
            <p class="text-slate-500 text-xs mt-1">Ambiente de Controle Geral do Sistema • Gestão de Pacotes Mensais e Bloqueio Global</p>
          </div>
          <button onclick="app.openTenantModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow">
            + Nova Empresa / Gráfica
          </button>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th class="p-3 font-bold">ID (Cód)</th>
                  <th class="p-3 font-bold">Razão Social / Nome Fantasia</th>
                  <th class="p-3 font-bold">CNPJ</th>
                  <th class="p-3 font-bold">Contato (WhatsApp / Fixo)</th>
                  <th class="p-3 font-bold">Plano</th>
                  <th class="p-3 font-bold">Expiração</th>
                  <th class="p-3 font-bold">Status</th>
                  <th class="p-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${tenants.map(t => {
                  const isExpired = t.data_expiracao && new Date(t.data_expiracao + 'T23:59:59') < new Date();
                  const isBlocked = (t.ativo === false) || isExpired;
                  return `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-3 font-mono font-bold text-amber-700 bg-amber-50/50 rounded">${t.id}</td>
                      <td class="p-3">
                        <div class="font-bold text-slate-800">${t.nome_fantasia || t.razao_social}</div>
                        <div class="text-[11px] text-slate-500">${t.razao_social}</div>
                      </td>
                      <td class="p-3 font-mono text-slate-600">${t.cnpj || '-'}</td>
                      <td class="p-3 text-slate-600">${t.celular_whatsapp || t.telefone_fixo || '-'}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          ${t.plano || t.pacote_mensal || 'MENSAL - 99,90'}
                        </span>
                      </td>
                      <td class="p-3">
                        ${t.data_expiracao ? `
                          <span class="${isExpired ? 'text-red-600 font-bold' : 'text-slate-600'}">
                            ${new Date(t.data_expiracao + 'T12:00:00').toLocaleDateString('pt-BR')} ${isExpired ? '(Expirado)' : ''}
                          </span>
                        ` : '<span class="text-emerald-600 font-bold">Indeterminado</span>'}
                      </td>
                      <td class="p-3">
                        ${!isBlocked ? `
                          <span class="inline-flex items-center text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Liberado
                          </span>
                        ` : `
                          <span class="inline-flex items-center text-red-700 font-bold text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span> ${isExpired ? 'Bloqueado (Expirada)' : 'Bloqueado'}
                          </span>
                        `}
                      </td>
                      <td class="p-3 text-right space-x-2">
                        <button onclick="app.openTenantModal('${t.id}')" class="text-blue-600 hover:text-blue-800 font-bold">Editar</button>
                        <button onclick="app.toggleTenantStatus('${t.id}')" class="${!isBlocked ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'} font-bold">
                          ${!isBlocked ? 'Bloquear' : 'Liberar'}
                        </button>
                        ${t.id !== '001' ? `
                          <button onclick="app.deleteTenant('${t.id}')" class="text-red-600 hover:text-red-800 font-bold">Excluir</button>
                        ` : ''}
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

  /* ==============================================================================
     UTILITÁRIOS: MÁSCARAS, VALIDAÇÕES E GERAÇÃO DE ID (v3.1.0)
     ============================================================================== */
  generateUniqueTenantId() {
    const tenants = window.store ? window.store.getTenants() : [];
    const existingIds = new Set(tenants.map(t => String(t.id).padStart(3, '0')));
    let attempts = 0;
    while (attempts < 1000) {
      const rand = Math.floor(Math.random() * 900) + 100; // 100 a 999
      const strId = String(rand).padStart(3, '0');
      if (!existingIds.has(strId)) {
        return strId;
      }
      attempts++;
    }
    return String(Math.floor(Math.random() * 900) + 100);
  },

  maskCnpj(v) {
    if (!v) return '';
    v = v.replace(/\D/g, '').slice(0, 14);
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    return v;
  },

  validateCnpj(cnpj) {
    if (!cnpj) return true; // campo opcional no envio em branco
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return false;
    if (/^(\d)\1+$/.test(clean)) return false; // todos os dígitos iguais

    // 1º Dígito Verificador
    let size = 12;
    let numbers = clean.substring(0, size);
    let digits = clean.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== Number(digits.charAt(0))) return false;

    // 2º Dígito Verificador
    size = 13;
    numbers = clean.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== Number(digits.charAt(1))) return false;

    return true;
  },

  maskDynamicPhone(v) {
    if (!v) return '';
    let d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) {
      return d.length > 0 ? `(${d}` : '';
    }
    const ddd = d.slice(0, 2);
    const rest = d.slice(2);
    const firstDigit = rest.charAt(0);

    // Se iniciado por 1, 2, 3, 4 ou 5 após o DDD -> Telefone Fixo (00) 0000-0000 (8 dígitos)
    if (['1', '2', '3', '4', '5'].includes(firstDigit)) {
      const fixedRest = rest.slice(0, 8);
      if (fixedRest.length <= 4) {
        return `(${ddd}) ${fixedRest}`;
      }
      return `(${ddd}) ${fixedRest.slice(0, 4)}-${fixedRest.slice(4)}`;
    }

    // Se celular / WhatsApp (iniciado por 9 ou >=6) -> Máscara (00) 0 0000-0000
    if (rest.length <= 1) {
      return `(${ddd}) ${rest}`;
    } else if (rest.length <= 5) {
      return `(${ddd}) ${rest.charAt(0)} ${rest.slice(1)}`;
    } else {
      const p1 = rest.charAt(0);
      const p2 = rest.slice(1, 5);
      const p3 = rest.slice(5, 9);
      return `(${ddd}) ${p1} ${p2}${p3 ? '-' + p3 : ''}`;
    }
  },

  maskCep(v) {
    if (!v) return '';
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length > 5) {
      return `${d.slice(0, 5)}-${d.slice(5)}`;
    }
    return d;
  },

  calculatePlanExpiration(plano) {
    const now = new Date();
    let days = 30; // default MENSAL
    if (plano === 'TESTE') days = 8;
    else if (plano === 'MENSAL - 99,90' || plano === 'MENSAL') days = 30;
    else if (plano === 'SEMESTRAL - 499,99' || plano === 'SEMESTRAL') days = 180;
    else if (plano === 'ANUAL - 999,99' || plano === 'ANUAL') days = 365;
    else if (plano === 'INDETERMINADO') days = 3650;

    const target = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return target.toISOString().split('T')[0];
  },

  handlePlanSelectionChange(plano) {
    const expEl = document.getElementById('tenant-form-expiracao');
    if (expEl) {
      expEl.value = this.calculatePlanExpiration(plano);
      this.updateTenantExpirationStatusUI();
    }
  },

  renewTenantPlan() {
    const planEl = document.getElementById('tenant-form-plano');
    const expEl = document.getElementById('tenant-form-expiracao');
    const ativoEl = document.getElementById('tenant-form-ativo');

    const plano = planEl ? planEl.value : 'MENSAL - 99,90';
    const newDate = this.calculatePlanExpiration(plano);
    if (expEl) expEl.value = newDate;
    if (ativoEl) ativoEl.checked = true;
    this.updateTenantExpirationStatusUI();
    alert(`Plano [${plano}] renovado com sucesso até ${new Date(newDate + 'T12:00:00').toLocaleDateString('pt-BR')}!`);
  },

  updateTenantExpirationStatusUI() {
    const expEl = document.getElementById('tenant-form-expiracao');
    const ativoEl = document.getElementById('tenant-form-ativo');
    const badgeEl = document.getElementById('tenant-form-status-badge');
    if (!expEl || !ativoEl || !badgeEl) return;

    const val = expEl.value;
    if (!val) {
      badgeEl.textContent = 'Data não definida';
      badgeEl.className = 'text-[11px] font-bold text-slate-500';
      return;
    }

    const expDate = new Date(val + 'T23:59:59');
    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      ativoEl.checked = false;
      badgeEl.textContent = 'Empresa Inativa e Bloqueada (Expirada)';
      badgeEl.className = 'text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200';
    } else {
      ativoEl.checked = true;
      badgeEl.textContent = `Ativa e Liberada (${diffDays} dias restantes)`;
      badgeEl.className = 'text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200';
    }
  },

  /* ==============================================================================
     MODAL DE CADASTRO E EDIÇÃO DE EMPRESAS / GRÁFICAS (TENANTS - v3.1.0)
     ============================================================================== */
  openTenantModal(tenantId = null) {
    const isEdit = !!tenantId;
    const tenant = isEdit ? window.store.getTenants().find(t => t.id === tenantId) : null;
    const uniqueId = isEdit ? tenant.id : this.generateUniqueTenantId();

    let modal = document.getElementById('tenant-modal');
    if (modal) modal.remove();

    const selectedPlano = tenant ? (tenant.plano || tenant.pacote_mensal || 'MENSAL - 99,90') : 'MENSAL - 99,90';
    const initialExpDate = tenant ? (tenant.data_expiracao || this.calculatePlanExpiration(selectedPlano)) : this.calculatePlanExpiration(selectedPlano);

    const modalHtml = `
      <div id="tenant-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
          <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <div>
              <h3 id="tenant-modal-title" class="text-base font-bold text-slate-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                ${isEdit ? 'Editar Empresa / Gráfica' : 'Nova Empresa / Gráfica'}
              </h3>
              <p class="text-xs text-slate-500">Configuração corporativa de licença, endereço e acesso</p>
            </div>
            <button onclick="document.getElementById('tenant-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none">&times;</button>
          </div>

          <form id="tenant-form" onsubmit="app.handleTenantFormSubmit(event)" class="p-6 space-y-4 overflow-y-auto flex-1">
            <input type="hidden" id="tenant-form-id" value="${tenant ? tenant.id : ''}">

            <!-- Linha 1: ID Aleatório (Marcado de Laranja), Nome Fantasia e Razão Social -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                  ID (3 Dígitos)
                  <span class="text-[9px] bg-amber-100 text-amber-800 px-1 rounded">Aleatório</span>
                </label>
                <input type="text" id="tenant-form-code" value="${uniqueId}" readonly disabled class="w-full px-3 py-2 bg-amber-50 border-2 border-amber-300 rounded-lg text-sm font-mono font-black text-amber-900 cursor-not-allowed text-center shadow-inner">
              </div>
              <div class="sm:col-span-3">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia *</label>
                <input type="text" id="tenant-form-fantasia" value="${tenant ? (tenant.nome_fantasia || '') : ''}" required placeholder="Ex: Top Digital" class="w-full px-3 py-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Razão Social *</label>
              <input type="text" id="tenant-form-razao" value="${tenant ? (tenant.razao_social || '') : ''}" required placeholder="Ex: Top Digital Comunicação Visual Ltda" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>

            <!-- Linha 2 (Marcadas de Amarelo): CNPJ com máscara/validação e WhatsApp/Telefone dinâmico -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/40 p-3 rounded-xl border border-amber-200">
              <div>
                <label class="block text-xs font-bold text-amber-900 mb-1">CNPJ (00.000.000/0000-00)</label>
                <input type="text" id="tenant-form-cnpj" value="${tenant ? (tenant.cnpj || '') : ''}" placeholder="00.000.000/0000-00" oninput="this.value = app.maskCnpj(this.value)" class="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
                <p class="text-[10px] text-amber-700 mt-0.5">Validação oficial por dígitos verificadores</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-amber-900 mb-1">Telefone WhatsApp / Fixo *</label>
                <input type="text" id="tenant-form-tel" value="${tenant ? (tenant.celular_whatsapp || tenant.telefone_fixo || '') : ''}" required placeholder="(00) 0 0000-0000 ou (00) 0000-0000" oninput="this.value = app.maskDynamicPhone(this.value)" class="w-full px-3 py-2 border rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
                <p class="text-[10px] text-amber-700 mt-0.5">Detecta fixo (início 1 a 5) ou celular automaticamente</p>
              </div>
            </div>

            <!-- Linha 3 (Marcada em Verde): Endereço Completo -->
            <div class="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 space-y-2.5">
              <div class="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Endereço Completo da Empresa
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div class="sm:col-span-3">
                  <label class="block text-[11px] font-semibold text-emerald-800 mb-0.5">Rua / Logradouro</label>
                  <input type="text" id="tenant-form-rua" value="${tenant ? (tenant.rua || '') : ''}" placeholder="Ex: Av. Sete de Setembro" class="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-emerald-800 mb-0.5">Número</label>
                  <input type="text" id="tenant-form-num" value="${tenant ? (tenant.numero || '') : ''}" placeholder="1234" class="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white">
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label class="block text-[11px] font-semibold text-emerald-800 mb-0.5">CEP</label>
                  <input type="text" id="tenant-form-cep" value="${tenant ? (tenant.cep || '') : ''}" placeholder="00000-000" oninput="this.value = app.maskCep(this.value)" class="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono bg-white">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-[11px] font-semibold text-emerald-800 mb-0.5">Cidade</label>
                  <input type="text" id="tenant-form-cidade" value="${tenant ? (tenant.cidade || '') : ''}" placeholder="Porto Velho" class="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-emerald-800 mb-0.5">UF</label>
                  <input type="text" id="tenant-form-uf" value="${tenant ? (tenant.uf || '') : ''}" maxlength="2" placeholder="RO" class="w-full px-2.5 py-1.5 border rounded-lg text-xs uppercase bg-white text-center font-bold">
                </div>
              </div>
            </div>

            <!-- Linha 4: Plano, Data de Expiração e Botão Renovar (Marcado em Verde) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Plano</label>
                <select id="tenant-form-plano" onchange="app.handlePlanSelectionChange(this.value)" class="w-full px-3 py-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="TESTE" ${selectedPlano === 'TESTE' ? 'selected' : ''}>TESTE (8 dias)</option>
                  <option value="MENSAL - 99,90" ${selectedPlano === 'MENSAL - 99,90' || selectedPlano === 'MENSAL' ? 'selected' : ''}>MENSAL - 99,90 (30 dias)</option>
                  <option value="SEMESTRAL - 499,99" ${selectedPlano === 'SEMESTRAL - 499,99' || selectedPlano === 'SEMESTRAL' ? 'selected' : ''}>SEMESTRAL - 499,99 (180 dias)</option>
                  <option value="ANUAL - 999,99" ${selectedPlano === 'ANUAL - 999,99' || selectedPlano === 'ANUAL' ? 'selected' : ''}>ANUAL - 999,99 (365 dias)</option>
                  <option value="INDETERMINADO" ${selectedPlano === 'INDETERMINADO' ? 'selected' : ''}>INDETERMINADO (Vitalício)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Data de Expiração</label>
                <div class="flex gap-2">
                  <input type="date" id="tenant-form-expiracao" value="${initialExpDate}" onchange="app.updateTenantExpirationStatusUI()" class="flex-1 px-3 py-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <button type="button" onclick="app.renewTenantPlan()" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0" title="Renovar conforme o plano selecionado">
                    🔄 Renovar
                  </button>
                </div>
              </div>
            </div>

            <!-- Linha 5: Observações (Marcação Rosa - Imagem 1) -->
            <div class="bg-pink-50/40 p-3 rounded-xl border border-pink-200">
              <label class="block text-xs font-bold text-pink-900 mb-1">Observações Internas (Empresa / Contrato)</label>
              <textarea id="tenant-form-obs" rows="2" placeholder="Observações de licenciamento, dados do contrato, particularidades..." class="w-full px-3 py-2 border border-pink-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none">${tenant ? (tenant.observacoes || '') : ''}</textarea>
            </div>

            <!-- Linha 6: Empresa Ativa e Liberada (Status Automático) -->
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="tenant-form-ativo" ${tenant ? (tenant.ativo !== false ? 'checked' : '') : 'checked'} onchange="app.updateTenantExpirationStatusUI()" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300">
                <span class="text-xs font-bold text-slate-800">Empresa Ativa e Liberada</span>
              </label>
              <span id="tenant-form-status-badge">...</span>
            </div>

            <div class="flex gap-2 pt-3 border-t border-slate-100">
              <button type="button" onclick="document.getElementById('tenant-modal').remove()" class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-bold hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button type="submit" class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition">
                Salvar Empresa
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.updateTenantExpirationStatusUI();
  },

  async handleTenantFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('tenant-form-id').value;
    const code = document.getElementById('tenant-form-code').value.trim();
    const nome_fantasia = document.getElementById('tenant-form-fantasia').value.trim();
    const razao_social = document.getElementById('tenant-form-razao').value.trim();
    const cnpj = document.getElementById('tenant-form-cnpj').value.trim();
    const tel = document.getElementById('tenant-form-tel').value.trim();
    const rua = document.getElementById('tenant-form-rua').value.trim();
    const numero = document.getElementById('tenant-form-num').value.trim();
    const cep = document.getElementById('tenant-form-cep').value.trim();
    const cidade = document.getElementById('tenant-form-cidade').value.trim();
    const uf = document.getElementById('tenant-form-uf').value.trim().toUpperCase();
    const plano = document.getElementById('tenant-form-plano').value;
    const data_expiracao = document.getElementById('tenant-form-expiracao').value;
    const observacoes = document.getElementById('tenant-form-obs').value.trim();
    let ativo = document.getElementById('tenant-form-ativo').checked;

    // 1. Validação Oficial de CNPJ
    if (cnpj && !this.validateCnpj(cnpj)) {
      alert('CNPJ inválido! O número digitado não atende ao cálculo dos dígitos verificadores da Receita Federal.');
      document.getElementById('tenant-form-cnpj').focus();
      return;
    }

    // 2. Bloqueio automático se expirado
    if (data_expiracao && new Date(data_expiracao + 'T23:59:59') < new Date()) {
      ativo = false;
    }

    // Composição de endereço formatado
    let endereco = '';
    if (rua || cidade) {
      endereco = `${rua}${numero ? ', ' + numero : ''}${cidade ? ' - ' + cidade : ''}${uf ? '/' + uf : ''}${cep ? ' - CEP: ' + cep : ''}`;
    }

    const tenantData = {
      id: code || id || undefined,
      nome_fantasia,
      razao_social,
      cnpj,
      celular_whatsapp: tel,
      telefone_fixo: tel,
      rua,
      numero,
      cep,
      cidade,
      uf,
      endereco,
      plano,
      pacote_mensal: plano,
      data_expiracao: data_expiracao || null,
      observacoes,
      ativo
    };

    await window.store.saveTenant(tenantData);
    const modal = document.getElementById('tenant-modal');
    if (modal) modal.remove();
    this.renderTenants();
    this.updateUserHeader();
    alert('Empresa salva com sucesso!');
  },

  async toggleTenantStatus(id) {
    const tenants = window.store.getTenants();
    const t = tenants.find(item => item.id === id);
    if (!t) return;
    t.ativo = (t.ativo === false);
    await window.store.saveTenant(t);
    this.renderTenants();
    alert(`Status da empresa ${t.nome_fantasia || t.razao_social} atualizado para: ${t.ativo ? 'LIBERADA' : 'BLOQUEADA'}.`);
  },

  async deleteTenant(id) {
    if (!confirm('Deseja realmente remover esta empresa do sistema?')) return;
    await window.store.deleteTenant(id);
    this.renderTenants();
  },

  /* ==============================================================================
     NOVO FORM: CONFIGURAÇÕES DO PERFIL DO USUÁRIO (Imagem 5 & 3 - Engrenagem)
     Identificação da empresa no topo, foto com corte quadrado 1:1 e labels limpos.
     ============================================================================== */
  openUserProfileConfigModal() {
    const user = window.authModule.getCurrentUser();
    if (!user) {
      window.authModule.openLoginModal();
      return;
    }
    const modal = document.getElementById('user-profile-modal');
    if (!modal) return;

    // Identificação da Empresa no Topo do Modal (Marcação Laranja - Imagem 5)
    const activeTenant = window.store ? window.store.getActiveTenant() : null;
    const fantEl = document.getElementById('prof-tenant-fantasia');
    const razEl = document.getElementById('prof-tenant-razao');
    if (activeTenant) {
      if (fantEl) fantEl.textContent = `${activeTenant.id} - ${activeTenant.nome_fantasia || 'Gráfica'}`;
      if (razEl) razEl.textContent = activeTenant.razao_social || '';
    }

    const op = user.operador || (user.nome ? user.nome.split(' ')[0] : (user.login || ''));
    document.getElementById('prof-operador').value = op;
    document.getElementById('prof-nome').value = user.nome || '';
    document.getElementById('prof-cpf').value = window.authModule.maskCpf(user.cpf || '');
    document.getElementById('prof-telefone').value = user.telefone || '(Não cadastrado)';
    document.getElementById('prof-email').value = user.email || '(Não cadastrado)';
    document.getElementById('prof-cargo').value = user.role || 'VENDAS';

    const photoImg = document.getElementById('prof-photo-img');
    const photoIcon = document.getElementById('prof-photo-icon');
    if (user.foto_url) {
      photoImg.src = user.foto_url;
      photoImg.classList.remove('hidden');
      photoIcon.classList.add('hidden');
    } else {
      photoImg.classList.add('hidden');
      photoIcon.classList.remove('hidden');
    }

    // Limpa campos de senha
    document.getElementById('prof-current-pass').value = '';
    document.getElementById('prof-new-pass').value = '';
    document.getElementById('prof-confirm-pass').value = '';
    const errEl = document.getElementById('prof-pass-error');
    if (errEl) errEl.classList.add('hidden');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  handleProfilePhotoUpload(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma foto de até 8MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        // Crop centralizado 1:1 quadrado via Canvas de alta qualidade
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        ctx.drawImage(img, startX, startY, size, size, 0, 0, targetSize, targetSize);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        // Atualiza preview no modal
        const photoImg = document.getElementById('prof-photo-img');
        const photoIcon = document.getElementById('prof-photo-icon');
        if (photoImg) {
          photoImg.src = dataUrl;
          photoImg.classList.remove('hidden');
        }
        if (photoIcon) photoIcon.classList.add('hidden');

        // Persiste no usuário autenticado
        const currentUser = window.authModule.getCurrentUser();
        if (currentUser) {
          currentUser.foto_url = dataUrl;
          window.authModule.saveUserWithoutValidation(currentUser);
          window.authModule.setCurrentUser(currentUser);
          app.updateUserHeader();

          // Sincroniza foto na nuvem Supabase se conectado
          if (window.store && window.store.supabaseClient) {
            try {
              await window.store.supabaseClient
                .from('usuarios')
                .update({ foto_url: dataUrl })
                .eq('id', currentUser.id);
            } catch (err) {
              console.warn('[Supabase] Falha ao sincronizar foto de perfil na nuvem:', err);
            }
          }
        }
        alert('Foto de perfil atualizada com sucesso!');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  closeUserProfileConfigModal() {
    const modal = document.getElementById('user-profile-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async handleProfilePasswordSubmit(e) {
    e.preventDefault();
    const curr = document.getElementById('prof-current-pass').value.trim();
    const newP = document.getElementById('prof-new-pass').value.trim();
    const conf = document.getElementById('prof-confirm-pass').value.trim();
    const err = document.getElementById('prof-pass-error');

    if (newP !== conf) {
      err.textContent = 'A confirmação de senha não confere.';
      err.classList.remove('hidden');
      return;
    }
    if (newP.length !== 4 || !/^\d{4}$/.test(newP)) {
      err.textContent = 'A nova senha deve ter exatamente 4 dígitos numéricos.';
      err.classList.remove('hidden');
      return;
    }

    const currentU = window.authModule.getCurrentUser();
    const res = await window.authModule.changePassword(currentU.id, curr, newP);
    if (res.success) {
      alert(res.message);
      this.closeUserProfileConfigModal();
    } else {
      err.textContent = res.message;
      err.classList.remove('hidden');
    }
  },

  /* ==============================================================================
     MODAL DE CADASTRO E EDIÇÃO DE USUÁRIOS (RBAC - Imagem 2)
     Foto (Câmera / Arquivo com compressão), CPF chave única obrigatória, Operador único.
     ============================================================================== */
  openUserModal(userId = null) {
    const isEdit = !!userId;
    const user = isEdit ? window.authModule.getUsers().find(u => u.id === userId) : null;
    const modal = document.getElementById('user-modal');
    if (!modal) return;

    const currentU = window.authModule.getCurrentUser();
    const isMasterAdmin = (currentU.role === 'ADMIN');
    const isProprietario = (currentU.role === 'PROPRIETARIO');

    document.getElementById('user-modal-title').textContent = isEdit ? 'Editar Usuário Operador' : 'Novo Usuário Operador';
    document.getElementById('user-form-id').value = user ? user.id : '';
    document.getElementById('user-form-operador').value = user ? (user.operador || '') : '';
    document.getElementById('user-form-nome').value = user ? user.nome : '';
    document.getElementById('user-form-cpf').value = user && user.cpf ? window.authModule.maskCpf(user.cpf) : '';
    document.getElementById('user-form-login').value = user ? user.login : '';
    document.getElementById('user-form-telefone').value = user ? (user.telefone || '') : '';
    document.getElementById('user-form-email').value = user ? (user.email || '') : '';
    document.getElementById('user-form-senha').value = user ? (user.senha || user.pin || '0000') : '0000';
    document.getElementById('user-form-role').value = user ? user.role : 'VENDAS';
    document.getElementById('user-form-ativo').checked = user ? (user.ativo !== false) : true;
    document.getElementById('user-form-foto-url').value = user ? (user.foto_url || '') : '';

    const preview = document.getElementById('user-foto-preview');
    const icon = document.getElementById('user-foto-icon');
    if (user && user.foto_url) {
      preview.src = user.foto_url;
      preview.classList.remove('hidden');
      icon.classList.add('hidden');
    } else {
      preview.src = '';
      preview.classList.add('hidden');
      icon.classList.remove('hidden');
    }

    // Regra de perfil: Proprietário só pode criar perfis abaixo dele (Gerente, Vendas, Produção)
    const roleSelect = document.getElementById('user-form-role');
    if (roleSelect) {
      Array.from(roleSelect.options).forEach(opt => {
        if (opt.value === 'ADMIN') {
          opt.disabled = !isMasterAdmin;
        } else if (opt.value === 'PROPRIETARIO') {
          opt.disabled = !isMasterAdmin;
        } else {
          opt.disabled = false;
        }
      });
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

  handlePhotoUploadUser(input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 250;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

          document.getElementById('user-form-foto-url').value = compressedDataUrl;
          const preview = document.getElementById('user-foto-preview');
          const icon = document.getElementById('user-foto-icon');
          if (preview) {
            preview.src = compressedDataUrl;
            preview.classList.remove('hidden');
          }
          if (icon) icon.classList.add('hidden');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  async handleUserFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-form-id').value;
    const operador = document.getElementById('user-form-operador').value.trim();
    const nome = document.getElementById('user-form-nome').value.trim();
    const cpf = document.getElementById('user-form-cpf').value.trim();
    const login = document.getElementById('user-form-login').value.trim().toLowerCase() || operador.toLowerCase();
    const telefone = document.getElementById('user-form-telefone').value.trim();
    const email = document.getElementById('user-form-email').value.trim();
    const senha = document.getElementById('user-form-senha').value.trim() || '0000';
    const role = document.getElementById('user-form-role').value;
    const ativo = document.getElementById('user-form-ativo').checked;
    const foto_url = document.getElementById('user-form-foto-url').value.trim();

    const existing = id ? window.authModule.getUsers().find(u => u.id === id) : null;
    const currentTenant = window.store.getActiveTenant();

    const userData = {
      id: id || undefined,
      operador,
      nome,
      cpf,
      login,
      telefone,
      email,
      senha,
      pin: senha,
      role,
      ativo,
      foto_url,
      empresa_id: existing ? (existing.empresa_id || currentTenant.id) : currentTenant.id,
      data_cadastro: existing ? existing.data_cadastro : new Date().toISOString(),
      data_ultimo_acesso: existing ? existing.data_ultimo_acesso : null
    };

    try {
      await window.authModule.saveUser(userData);
      this.closeUserModal();
      if (this.currentTab === 'owner') this.renderOwner();
      else this.renderSettings();
      alert('Usuário salvo com sucesso!');
    } catch (err) {
      alert(err.message);
    }
  },

  async deleteUser(id) {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    try {
      await window.authModule.deleteUser(id);
      if (this.currentTab === 'owner') this.renderOwner();
      else this.renderSettings();
      alert('Usuário removido com sucesso!');
    } catch (err) {
      alert(err.message);
    }
  },

  /* ==============================================================================
     BANCO DE DADOS (NUVEM) E CONFIGURAÇÕES
     ============================================================================== */
  renderSettings() {
    const isMasterAdmin = window.authModule.can('canManageSettings');
    const settings = window.store.getSettings();
    const config = window.GRAFSIS_CONFIG ? window.GRAFSIS_CONFIG.getSupabaseConfig() : settings;
    const container = document.getElementById('view-container');

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Sincronização Nuvem & Backup</h1>
            <p class="text-slate-500 text-sm">Gerencie a sincronização Supabase (PC & Celular) e backup dos dados</p>
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

  async saveCompanyConfig(e, tenantId) {
    e.preventDefault();
    const currentUser = window.authModule.getCurrentUser();
    const isSystemAdmin = (currentUser.role === 'ADMIN');
    
    const tenant = window.store.getActiveTenant();
    
    // Proprietário pode salvar apenas logo e rodapé
    tenant.logo_url = document.getElementById('comp-logo-base64').value.trim();
    tenant.rodape_msg = document.getElementById('comp-msg').value.trim();

    // Se for Admin, salva todos os campos
    if (isSystemAdmin) {
      tenant.razao_social = document.getElementById('comp-nome').value.trim();
      tenant.cnpj = document.getElementById('comp-cnpj').value.trim();
      tenant.telefone_fixo = document.getElementById('comp-tel').value.trim();
      tenant.celular_whatsapp = document.getElementById('comp-cel').value.trim();
      tenant.email = document.getElementById('comp-email').value.trim();
      tenant.endereco = document.getElementById('comp-end').value.trim();
      tenant.site = document.getElementById('comp-site').value.trim();
      tenant.instagram = document.getElementById('comp-insta').value.trim();
    }

    await window.store.saveTenant(tenant);
    this.updateUserHeader();
    alert('Dados salvos com sucesso!');
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

  openNewOrderModal(params) {
    if (window.salesModule && typeof window.salesModule.openModal === 'function') {
      window.salesModule.openModal(params);
    }
  }
};

// Aliases globais para tolerância a falhas e integração uniforme entre módulos
if (window.clientsModule) {
  window.clientsModule.openClientModal = (c) => window.clientsModule.openModal(c);
  window.clientsModule.closeModal = () => { const m = document.getElementById('client-modal'); if (m) m.remove(); };
}
if (window.suppliersModule) {
  window.suppliersModule.openSupplierModal = (s) => window.suppliersModule.openModal(s);
  window.suppliersModule.closeModal = () => { const m = document.getElementById('supplier-modal'); if (m) m.remove(); };
}
if (window.productsModule) {
  window.productsModule.openProductModal = (p) => window.productsModule.openModal(p);
  window.productsModule.closeModal = () => { const m = document.getElementById('product-modal'); if (m) m.remove(); };
  window.productsModule.closeCalculatorModal = () => { const m = document.getElementById('calc-modal'); if (m) m.remove(); };
}
if (window.salesModule) {
  window.salesModule.openNewOrderModal = (p) => window.salesModule.openModal(p);
  window.salesModule.closeModal = () => { const m = document.getElementById('order-modal'); if (m) m.remove(); };
}
if (window.financeModule) {
  window.financeModule.closeModal = () => { const m = document.getElementById('finance-modal'); if (m) m.remove(); };
}

// Inicialização segura e resiliente (dispara imediatamente se o DOM já estiver pronto)
function bootstrapGrafsis() {
  if (window.app && typeof window.app.init === 'function') {
    window.app.init();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapGrafsis);
} else {
  bootstrapGrafsis();
}

