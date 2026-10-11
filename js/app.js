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
    if (!window.authModule.canAccess(tab)) {
      alert(`Acesso restrito: seu perfil (${window.authModule.getCurrentUser().role}) não possui permissão para esta aba.`);
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
                  <th class="p-3 font-bold">Contato (WhatsApp)</th>
                  <th class="p-3 font-bold">Pacote Mensal</th>
                  <th class="p-3 font-bold">Expiração</th>
                  <th class="p-3 font-bold">Status</th>
                  <th class="p-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${tenants.map(t => {
                  const isExpired = t.data_expiracao && new Date(t.data_expiracao) < new Date();
                  return `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-3 font-mono font-bold text-blue-700">${t.id}</td>
                      <td class="p-3">
                        <div class="font-bold text-slate-800">${t.nome_fantasia || t.razao_social}</div>
                        <div class="text-[11px] text-slate-500">${t.razao_social}</div>
                      </td>
                      <td class="p-3 font-mono text-slate-600">${t.cnpj || '-'}</td>
                      <td class="p-3 text-slate-600">${t.celular_whatsapp || t.telefone_fixo || '-'}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          ${t.pacote_mensal || 'Básico'}
                        </span>
                      </td>
                      <td class="p-3">
                        ${t.data_expiracao ? `
                          <span class="${isExpired ? 'text-red-600 font-bold' : 'text-slate-600'}">
                            ${new Date(t.data_expiracao).toLocaleDateString('pt-BR')} ${isExpired ? '(Expirado)' : ''}
                          </span>
                        ` : '<span class="text-emerald-600 font-bold">Ilimitado</span>'}
                      </td>
                      <td class="p-3">
                        ${t.ativo !== false ? `
                          <span class="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Liberado
                          </span>
                        ` : `
                          <span class="inline-flex items-center text-red-600 font-semibold text-[11px]">
                            <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span> Bloqueado
                          </span>
                        `}
                      </td>
                      <td class="p-3 text-right space-x-2">
                        <button onclick="app.openTenantModal('${t.id}')" class="text-blue-600 hover:text-blue-800 font-bold">Editar</button>
                        <button onclick="app.toggleTenantStatus('${t.id}')" class="${t.ativo !== false ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'} font-bold">
                          ${t.ativo !== false ? 'Bloquear' : 'Liberar'}
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

  openTenantModal(tenantId = null) {
    const isEdit = !!tenantId;
    const tenant = isEdit ? window.store.getTenants().find(t => t.id === tenantId) : null;
    
    let modal = document.getElementById('tenant-modal');
    if (!modal) {
      const modalHtml = `
        <div id="tenant-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100">
            <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 id="tenant-modal-title" class="text-base font-bold text-slate-800">Empresa / Gráfica</h3>
              <button onclick="document.getElementById('tenant-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form id="tenant-form" onsubmit="app.handleTenantFormSubmit(event)" class="p-6 space-y-4">
              <input type="hidden" id="tenant-form-id">

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">ID (3 Dígitos)</label>
                  <input type="text" id="tenant-form-code" placeholder="000" maxlength="4" class="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-slate-50">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia *</label>
                  <input type="text" id="tenant-form-fantasia" required placeholder="Ex: Top Digital" class="w-full px-3 py-2 border rounded-lg text-sm">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Razão Social *</label>
                <input type="text" id="tenant-form-razao" required placeholder="Ex: Top Digital Ltda" class="w-full px-3 py-2 border rounded-lg text-sm">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
                  <input type="text" id="tenant-form-cnpj" placeholder="00.000.000/0000-00" class="w-full px-3 py-2 border rounded-lg text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Contato *</label>
                  <input type="text" id="tenant-form-tel" required placeholder="(00) 00000-0000" class="w-full px-3 py-2 border rounded-lg text-sm">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Pacote Mensal</label>
                  <select id="tenant-form-pacote" class="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="Plano Básico">Plano Básico</option>
                    <option value="Plano Profissional" selected>Plano Profissional</option>
                    <option value="Plano Ilimitado Premium">Plano Ilimitado Premium</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Data de Expiração</label>
                  <input type="date" id="tenant-form-expiracao" class="w-full px-3 py-2 border rounded-lg text-sm">
                </div>
              </div>

              <div class="pt-2">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="tenant-form-ativo" checked class="w-4 h-4 rounded text-blue-600">
                  <span class="text-xs font-bold text-slate-700">Empresa Ativa e Liberada</span>
                </label>
              </div>

              <div class="flex gap-2 pt-3 border-t">
                <button type="button" onclick="document.getElementById('tenant-modal').classList.add('hidden')" class="flex-1 px-4 py-2 border rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold">Salvar Empresa</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('tenant-modal');
    }

    document.getElementById('tenant-modal-title').textContent = isEdit ? 'Editar Empresa / Gráfica' : 'Nova Empresa / Gráfica';
    document.getElementById('tenant-form-id').value = tenant ? tenant.id : '';
    document.getElementById('tenant-form-code').value = tenant ? tenant.id : '';
    document.getElementById('tenant-form-fantasia').value = tenant ? (tenant.nome_fantasia || '') : '';
    document.getElementById('tenant-form-razao').value = tenant ? (tenant.razao_social || '') : '';
    document.getElementById('tenant-form-cnpj').value = tenant ? (tenant.cnpj || '') : '';
    document.getElementById('tenant-form-tel').value = tenant ? (tenant.celular_whatsapp || tenant.telefone_fixo || '') : '';
    document.getElementById('tenant-form-pacote').value = tenant ? (tenant.pacote_mensal || 'Plano Profissional') : 'Plano Profissional';
    document.getElementById('tenant-form-expiracao').value = tenant ? (tenant.data_expiracao || '') : '';
    document.getElementById('tenant-form-ativo').checked = tenant ? (tenant.ativo !== false) : true;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  async handleTenantFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('tenant-form-id').value;
    const code = document.getElementById('tenant-form-code').value.trim();
    const nome_fantasia = document.getElementById('tenant-form-fantasia').value.trim();
    const razao_social = document.getElementById('tenant-form-razao').value.trim();
    const cnpj = document.getElementById('tenant-form-cnpj').value.trim();
    const tel = document.getElementById('tenant-form-tel').value.trim();
    const pacote_mensal = document.getElementById('tenant-form-pacote').value;
    const data_expiracao = document.getElementById('tenant-form-expiracao').value;
    const ativo = document.getElementById('tenant-form-ativo').checked;

    const tenantData = {
      id: code || id || undefined,
      nome_fantasia,
      razao_social,
      cnpj,
      celular_whatsapp: tel,
      pacote_mensal,
      data_expiracao: data_expiracao || null,
      ativo
    };

    await window.store.saveTenant(tenantData);
    document.getElementById('tenant-modal').classList.add('hidden');
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
     NOVO FORM: CONFIGURAÇÕES DO PERFIL DO USUÁRIO (Imagem 5 - Engrenagem)
     Dados do usuário desabilitados (não edita*), permitindo apenas a troca de senha.
     ============================================================================== */
  openUserProfileConfigModal() {
    const user = window.authModule.getCurrentUser();
    const modal = document.getElementById('user-profile-modal');
    if (!modal) return;

    document.getElementById('prof-operador').value = user.operador || user.nome.split(' ')[0] || '';
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
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
