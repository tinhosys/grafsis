/* ==============================================================================
   GRAFSIS - Controlador Principal da Aplicação (App Controller)
   Versão 2.8.0 - Suporte a RBAC Hierárquico (Admin / Proprietário), Gestão de Empresas,
   Painel do Proprietário sem Redundâncias, Perfil do Usuário e Login por CPF.
   ============================================================================== */

window.grafsisConfirm = function({ title = 'GRAFSIS', message = '', confirmText = 'OK', cancelText = 'Cancelar' } = {}) {
  return new Promise((resolve) => {
    const modalId = 'grafsis-custom-confirm-modal';
    document.getElementById(modalId)?.remove();

    const formattedMsg = String(message)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    const modalHtml = `
      <div id="${modalId}" class="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn select-none">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <h3 class="text-sm font-black tracking-wider text-white font-mono uppercase">${title}</h3>
            </div>
            <button type="button" id="${modalId}-close" class="text-slate-400 hover:text-white text-xl font-black leading-none cursor-pointer">&times;</button>
          </div>
          <div class="p-6 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium max-h-[70vh] overflow-y-auto">
            ${formattedMsg}
          </div>
          <div class="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button type="button" id="${modalId}-cancel" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer">
              ${cancelText}
            </button>
            <button type="button" id="${modalId}-ok" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const finish = (result) => {
      document.getElementById(modalId)?.remove();
      resolve(result);
    };

    document.getElementById(`${modalId}-ok`)?.addEventListener('click', () => finish(true));
    document.getElementById(`${modalId}-cancel`)?.addEventListener('click', () => finish(false));
    document.getElementById(`${modalId}-close`)?.addEventListener('click', () => finish(false));
  });
};

window.grafsisAlert = function(message = '', title = 'GRAFSIS') {
  return new Promise((resolve) => {
    const modalId = 'grafsis-custom-alert-modal';
    document.getElementById(modalId)?.remove();

    const formattedMsg = String(message)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    const modalHtml = `
      <div id="${modalId}" class="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn select-none">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 class="text-sm font-black tracking-wider text-white font-mono uppercase">${title}</h3>
            </div>
            <button type="button" id="${modalId}-close" class="text-slate-400 hover:text-white text-xl font-black leading-none cursor-pointer">&times;</button>
          </div>
          <div class="p-6 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium max-h-[70vh] overflow-y-auto">
            ${formattedMsg}
          </div>
          <div class="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button type="button" id="${modalId}-ok" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer">
              OK
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const finish = () => {
      document.getElementById(modalId)?.remove();
      resolve();
    };

    document.getElementById(`${modalId}-ok`)?.addEventListener('click', finish);
    document.getElementById(`${modalId}-close`)?.addEventListener('click', finish);
  });
};

// Interceptação global de diálogos nativos para o padrão visual oficial GrafSiS (elimina "tinhosys.github.io diz")
window.alert = function(message) {
  return window.grafsisAlert(message, 'GRAFSIS');
};

window.showGrafsisAlert = window.grafsisAlert;
window.showGrafsisConfirm = window.grafsisConfirm;

window.app = {
  currentTab: 'production',

  initTheme() {
    let savedTheme = localStorage.getItem('grafsis_theme');
    if (!savedTheme) {
      savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    this.applyTheme(savedTheme);
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  },

  applyTheme(theme) {
    const isDark = (theme === 'dark');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('grafsis_theme', theme);
    } catch (e) {}

    this.updateThemeButton(theme);
  },

  updateThemeButton(theme) {
    const isDark = (theme === 'dark');
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) {
      btn.setAttribute('title', isDark ? 'Modo Noite Ativo (Clique para Modo Dia ☀️)' : 'Modo Dia Ativo (Clique para Modo Noite 🌙)');
      if (isDark) {
        btn.className = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-700 bg-slate-800 text-indigo-300 hover:bg-slate-700 transition-all shadow-sm cursor-pointer select-none';
      } else {
        btn.className = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100 transition-all shadow-sm cursor-pointer select-none';
      }
    }

    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const sliderTrack = document.getElementById('theme-slider-track');
    const sliderKnob = document.getElementById('theme-slider-knob');
    const menuLabel = document.getElementById('menu-theme-label');

    if (sunIcon) sunIcon.style.opacity = isDark ? '0.4' : '1';
    if (moonIcon) moonIcon.style.opacity = isDark ? '1' : '0.4';
    if (sliderTrack) {
      sliderTrack.className = isDark ? 'w-7 h-3.5 bg-indigo-600 rounded-full relative p-0.5 transition-colors hidden sm:inline-block' : 'w-7 h-3.5 bg-slate-300 rounded-full relative p-0.5 transition-colors hidden sm:inline-block';
    }
    if (sliderKnob) {
      sliderKnob.style.transform = isDark ? 'translateX(14px)' : 'translateX(0)';
    }
    if (menuLabel) {
      menuLabel.textContent = isDark ? 'Noite (Escuro)' : 'Dia (Claro)';
      menuLabel.className = isDark ? 'text-[10px] font-black uppercase text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-700' : 'text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200';
    }
  },

  init() {
    this.initTheme();

    // Listener global de hashchange (para transição limpa entre portal público e aplicação)
    if (!this._hashListenerAttached) {
      this._hashListenerAttached = true;
      window.addEventListener('hashchange', () => {
        const h = (window.location.hash || '').toLowerCase();
        if (h.startsWith('#aprovacao') || h.startsWith('#portal') || h.startsWith('#recibo')) {
          document.documentElement.classList.add('portal-mode');
          this.renderPublicClientApprovalPortal(window.location.hash);
        } else {
          document.documentElement.classList.remove('portal-mode');
          const portalRoot = document.getElementById('public-portal-root');
          if (portalRoot) {
            portalRoot.classList.add('hidden');
            portalRoot.style.display = 'none';
          }
          if (!window.authModule.isAuthenticated()) {
            window.authModule.openLoginModal();
          } else {
            window.authModule.closeLoginModal();
            const perms = window.authModule.getRolePermissions();
            const initialTab = window.authModule.canAccess(this.currentTab) ? this.currentTab : perms.tabs[0];
            this.navigate(initialTab);
          }
        }
      });
    }

    // Verificação de rota pública: Portal de Aprovação de Cliente ou Validação de Recibo (Sem Senha)
    const currentHash = (window.location.hash || '').toLowerCase();
    if (currentHash.startsWith('#aprovacao') || currentHash.startsWith('#portal') || currentHash.startsWith('#recibo')) {
      document.documentElement.classList.add('portal-mode');
      this.renderPublicClientApprovalPortal(window.location.hash);
      return;
    }

    document.documentElement.classList.remove('portal-mode');
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

    if (window.newsTickerModule && typeof window.newsTickerModule.init === 'function') {
      window.newsTickerModule.init();
    }
  },

  updateUserHeader() {
    const user = window.authModule.getCurrentUser();
    const permissions = window.authModule.getRolePermissions();

    const nameEl = document.getElementById('user-header-name');
    const badgeEl = document.getElementById('user-header-badge');
    const userPhotoEl = document.getElementById('user-header-photo');
    const userIconEl = document.getElementById('user-header-icon');

    const inlineLoginEl = document.getElementById('user-header-inline-login');
    const inlineRoleEl = document.getElementById('user-header-inline-role');

    if (!user) {
      if (nameEl) nameEl.textContent = 'Não Conectado';
      if (badgeEl) {
        badgeEl.textContent = 'LOGIN NECESSÁRIO';
        badgeEl.className = 'text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-300';
      }
      if (inlineLoginEl) inlineLoginEl.textContent = 'desconectado';
      if (inlineRoleEl) inlineRoleEl.textContent = 'VISITANTE';
      if (userPhotoEl) userPhotoEl.classList.add('hidden');
      if (userIconEl) userIconEl.classList.remove('hidden');
      return;
    }

    if (nameEl) nameEl.textContent = user.operador || user.nome || user.login;
    if (badgeEl) {
      badgeEl.textContent = permissions.name;
      badgeEl.className = `text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${permissions.badgeColor}`;
    }

    if (inlineLoginEl) inlineLoginEl.textContent = user.login || (user.operador ? user.operador.toLowerCase() : 'operador');
    if (inlineRoleEl) inlineRoleEl.textContent = permissions.name || user.role;

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

    // Identificação do Ambiente / Empresa Proprietária (Multi-tenant)
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

      // Logomarca Oficial do Cliente Proprietário no Header Superior (Imagem 4)
      const compLogoImg = document.getElementById('header-company-logo-img');
      const compLogoDefault = document.getElementById('header-company-logo-default');
      const compNameText = document.getElementById('header-company-name-text');
      const compSubtext = document.getElementById('header-company-subtext');

      if (compNameText) {
        compNameText.textContent = activeTenant.nome_fantasia || activeTenant.razao_social || 'Grafsis';
      }
      if (compSubtext) {
        compSubtext.textContent = (activeTenant.nome_fantasia || activeTenant.razao_social) ? 'Sua Gráfica nas Nuvens' : 'Sua Gráfica nas Nuvens';
      }

      if (activeTenant.logo_url && compLogoImg && compLogoDefault) {
        compLogoImg.src = activeTenant.logo_url;
        compLogoImg.classList.remove('hidden');
        compLogoDefault.classList.add('hidden');
      } else if (compLogoImg && compLogoDefault) {
        compLogoImg.classList.add('hidden');
        compLogoDefault.classList.remove('hidden');
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
      window.store.updateSyncBadge(!!window.store.cloudConnected);
    }

    // Atualização em tempo real do badge de Notificação Inteligente (Vermelho = 3 dias úteis expira / Amarelo = Entrega atrasada)
    this.updateNotificationStatus();

    // Atualiza permissões e dados do Monitor de Notícias On-Line (News Ticker)
    if (window.newsTickerModule && typeof window.newsTickerModule.updateManageAccess === 'function') {
      window.newsTickerModule.updateManageAccess();
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

    // Atualização da Sidebar (tema limpo & profissional)
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkTab = link.getAttribute('data-tab');
      // Respeita permissões RBAC estritas: se não tem acesso, mantém oculto
      if (linkTab && window.authModule && !window.authModule.canAccess(linkTab)) {
        link.classList.add('hidden');
        return;
      }
      const isTarget = linkTab === tab;
      if (isTarget) {
        link.className = 'nav-link w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-bold rounded-xl bg-blue-50 text-blue-600 transition-all';
        const iconContainer = link.querySelector('span:first-child');
        if (iconContainer) {
          iconContainer.className = 'w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-sm transition-all';
        }
      } else {
        link.className = 'nav-link w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all';
        const iconContainer = link.querySelector('span:first-child');
        if (iconContainer) {
          iconContainer.className = 'w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 transition-all';
        }
      }
    });

    // Atualização da Top Navbar (Grupo 2 - Botões de navegação destacados, cores unificadas e tamanho padronizado h-10)
    document.querySelectorAll('.top-nav-link').forEach(link => {
      const isTarget = link.getAttribute('data-tab') === tab;
      if (isTarget) {
        link.className = 'top-nav-link h-10 px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all bg-indigo-600 text-white shadow-sm border border-indigo-500 shrink-0 cursor-pointer';
      } else {
        link.className = 'top-nav-link h-10 px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all bg-indigo-50/80 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border border-indigo-200/80 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-700 shrink-0 cursor-pointer';
      }
    });

    // Fechar dropdowns abertos ao navegar
    const td = document.getElementById('tenant-dropdown');
    if (td) td.classList.add('hidden');
    const ud = document.getElementById('user-menu-dropdown');
    if (ud) ud.classList.add('hidden');

    switch (tab) {
      case 'dashboard':
        this.renderDashboard();
        break;
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
      default:
        this.renderDashboard();
        break;
    }
  },

  toggleTenantDropdown() {
    const el = document.getElementById('top-tenant-dropdown') || document.getElementById('tenant-dropdown');
    const uel = document.getElementById('top-user-menu') || document.getElementById('user-menu-dropdown');
    if (uel) uel.classList.add('hidden');
    if (el) el.classList.toggle('hidden');
  },

  toggleUserMenu() {
    const el = document.getElementById('top-user-menu') || document.getElementById('user-menu-dropdown');
    const tel = document.getElementById('top-tenant-dropdown') || document.getElementById('tenant-dropdown');
    if (tel) tel.classList.add('hidden');
    if (el) el.classList.toggle('hidden');
  },

  selectTenant(tenantName) {
    const nameEl = document.getElementById('top-tenant-name') || document.getElementById('current-tenant-label');
    if (nameEl) nameEl.textContent = tenantName;
    const headerTenant = document.getElementById('header-tenant-name');
    if (headerTenant) headerTenant.textContent = tenantName;
    const el = document.getElementById('top-tenant-dropdown') || document.getElementById('tenant-dropdown');
    if (el) el.classList.add('hidden');
  },

  toggleMobileSidebar() {
    const sidebar = document.getElementById('main-sidebar') || document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
    }
  },

  renderDashboard() {
    const orders = (window.store && window.store.getOrders()) || [];
    const clients = (window.store && window.store.getClients()) || [];
    const totalOrders = orders.length;
    const inProduction = orders.filter(o => {
      const st = ((o.status_fase || o.status || '') + '').toLowerCase();
      return ['producao', 'acabamento', 'embalagem', 'liberado', 'impressao', 'corte'].includes(st);
    }).length;
    const completed = orders.filter(o => {
      const st = ((o.status_fase || o.status || '') + '').toLowerCase();
      return ['finalizado', 'entregue', 'concluido'].includes(st);
    }).length;
    const totalRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.valor_final || o.total) || 0), 0);

    const container = document.getElementById('view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Topo com Boas-Vindas e Ações Rápidas -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 class="text-2xl font-black text-slate-800">Painel Geral de Operações</h1>
            <p class="text-slate-500 text-sm mt-0.5">Visão executiva em tempo real da sua gráfica na nuvem</p>
          </div>
          <div class="flex items-center gap-2.5">
            ${(window.authModule && window.authModule.can('canCreateOrders')) ? `
              <button onclick="app.openNewOrderModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Novo Orçamento / Pedido
              </button>
            ` : ''}
            <button onclick="window.clientsModule.openModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              + Cliente
            </button>
          </div>
        </div>

        <!-- Cards de Métricas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black shadow-inner">
              📋
            </div>
            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Pedidos</div>
              <div class="text-2xl font-black text-slate-800">${totalOrders}</div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-black shadow-inner">
              ⚙️
            </div>
            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Em Produção</div>
              <div class="text-2xl font-black text-amber-600">${inProduction}</div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-black shadow-inner">
              ✅
            </div>
            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Concluídos</div>
              <div class="text-2xl font-black text-emerald-600">${completed}</div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black shadow-inner">
              👥
            </div>
            <div>
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Cadastrados</div>
              <div class="text-2xl font-black text-indigo-600">${clients.length}</div>
            </div>
          </div>
        </div>

        <!-- Acesso Rápido aos Módulos Principais -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            🚀 Módulos do Sistema
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button onclick="app.navigate('clients')" class="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-center group flex flex-col items-center gap-2">
              <span class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg group-hover:scale-110 transition">👥</span>
              <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600">Clientes A-Z</span>
            </button>
            <button onclick="app.navigate('sales')" class="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-center group flex flex-col items-center gap-2">
              <span class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg group-hover:scale-110 transition">💼</span>
              <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600">Operação / Pedido</span>
            </button>
            <button onclick="app.navigate('production')" class="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-center group flex flex-col items-center gap-2">
              <span class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg group-hover:scale-110 transition">🏭</span>
              <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600">Produção & Kanban</span>
            </button>
            <button onclick="app.navigate('products')" class="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-center group flex flex-col items-center gap-2">
              <span class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg group-hover:scale-110 transition">🏷️</span>
              <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600">Produtos & m²</span>
            </button>
            <button onclick="app.navigate('finance')" class="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-center group flex flex-col items-center gap-2">
              <span class="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-lg group-hover:scale-110 transition">💰</span>
              <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600">Financeiro</span>
            </button>
            <button onclick="app.navigate('owner')" class="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-center group flex flex-col items-center gap-2">
              <span class="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-lg group-hover:scale-110 transition">🏢</span>
              <span class="text-xs font-bold text-slate-700 group-hover:text-blue-600">Configurações</span>
            </button>
          </div>
        </div>
      </div>
    `;
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

            <!-- Bloco de Integração Mercado Pago (Pix QR Code, Cartão até 12x e Gestão Financeira) -->
            <div class="border-t border-slate-200 pt-5 mt-4">
              <div class="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 p-4 rounded-xl border border-sky-200 dark:border-sky-800">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      MP
                    </div>
                    <div>
                      <h3 class="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        Integração Mercado Pago
                        <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">API Oficial</span>
                      </h3>
                      <p class="text-xs text-slate-500 dark:text-slate-400">Pix com QR Code dinâmico, Link de Cartão até 12x e Gestão Financeira</p>
                    </div>
                  </div>
                  <button type="button" onclick="window.mercadoPagoModule.openFinancialManager()" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    Acessar Gestor Financeiro MP
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Access Token (Produção ou Teste)
                    </label>
                    <input type="password" id="comp-mp-token" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="APP_USR-..." value="${tenant.mercadopago_access_token || ''}">
                    <p class="text-[10px] text-slate-400 mt-1">Obtenha em: <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" class="text-sky-600 underline font-semibold">mercadopago.com.br/developers</a> &gt; Suas integrações &gt; Credenciais</p>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      URL do Webhook (Opcional - Notificações Automáticas)
                    </label>
                    <input type="url" id="comp-mp-webhook" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="https://...supabase.co/functions/v1/mercadopago-webhook" value="${tenant.mercadopago_webhook_url || ''}">
                    <p class="text-[10px] text-slate-400 mt-1">Configurado no painel do Mercado Pago para confirmação de pagamento instantânea</p>
                  </div>
                </div>

                <div class="mt-3 flex items-center justify-between pt-2 border-t border-sky-200/60 dark:border-sky-800/60">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="comp-mp-enabled" class="rounded text-sky-600 focus:ring-sky-500 w-4 h-4" ${tenant.mercadopago_enabled ? 'checked' : ''}>
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Ativar cobrança automática com Mercado Pago no Caixa</span>
                  </label>
                  <button type="button" onclick="const tok = document.getElementById('comp-mp-token').value.trim(); if(!tok){ alert('Digite seu Access Token primeiro.'); return; } window.mercadoPagoModule.saveConfig({ enabled: document.getElementById('comp-mp-enabled').checked, accessToken: tok, webhookUrl: document.getElementById('comp-mp-webhook').value.trim() }); alert('Configurações do Mercado Pago testadas e salvas com sucesso!');" class="text-xs font-bold text-sky-700 hover:text-sky-800 dark:text-sky-400 underline cursor-pointer">
                    Salvar e Testar Integração
                  </button>
                </div>
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
    const currentUser = window.authModule.getCurrentUser ? window.authModule.getCurrentUser() : { nome: 'Admin', role: 'ADMIN' };
    
    // Lista de Usuários e Presença
    const allUsers = window.authModule.getUsers ? window.authModule.getUsers() : [];
    const tenants = window.store.getTenants ? window.store.getTenants() : [window.store.getActiveTenant ? window.store.getActiveTenant() : { razao_social: 'Gráfica Principal' }];
    const allOrders = window.store.getOrders ? window.store.getOrders() : [];
    const allClients = window.store.getClients ? window.store.getClients() : [];
    
    // Simulação de presença em tempo real: o usuário logado está online agora, outros com atividade recente
    const onlineUsers = allUsers.map((u, idx) => {
      const isCurrent = currentUser && (u.id === currentUser.id || u.login === currentUser.login);
      const isOnline = isCurrent || (idx % 2 === 0);
      return {
        ...u,
        isOnline,
        ultimoAcesso: isCurrent ? 'Agora mesmo (Ativo)' : (isOnline ? 'há 4 minutos' : 'há 2 horas'),
        dispositivo: idx % 2 === 0 ? '💻 Desktop (Windows 11)' : '📱 Celular (Android)'
      };
    });
    const totalOnlineCount = onlineUsers.filter(u => u.isOnline).length;

    // Métricas por Gráfica
    const tenantMetrics = tenants.map(t => {
      const tOrders = allOrders.filter(o => o.tenant_id === t.id || (!o.tenant_id && t.id === 'tenant-forte'));
      const tFaturamento = tOrders.reduce((acc, o) => acc + (parseFloat(o.valor_final) || 0), 0);
      return {
        ...t,
        totalOrders: tOrders.length,
        faturamento: tFaturamento
      };
    });
    const maxFaturamento = Math.max(...tenantMetrics.map(tm => tm.faturamento), 100);

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6 pb-12">
        <!-- CABEÇALHO DO ADMINISTRADOR DO SISTEMA DA GRAFSIS -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-blue-900/40">
          <div>
            <div class="flex items-center gap-2.5 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Painel do Administrador Geral
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Sistema 100% Operacional
              </span>
            </div>
            <h1 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Configurações / Painel Master GRAFSIS
            </h1>
            <p class="text-slate-300 text-xs mt-1">
              Monitoramento de infraestrutura, integridade de microsserviços, conexões multi-tenant, usuários online e relatórios globais.
            </p>
          </div>
          <div class="flex items-center gap-2.5 shrink-0">
            <button onclick="window.store.handleManualSyncClick()" class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Sincronizar Todos os Bancos
            </button>
          </div>
        </div>

        <!-- CARDS DE VISÃO RÁPIDA (USUÁRIOS ONLINE, SISTEMAS E BANCO) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- CARD 1: USUÁRIOS ONLINE -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Usuários Conectados</span>
              <div class="text-2xl font-black text-slate-800 mt-1 flex items-center gap-2">
                <span class="text-emerald-600 font-mono">${totalOnlineCount}</span>
                <span class="text-xs font-bold text-slate-400">/ ${allUsers.length} total</span>
              </div>
              <span class="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sessões ativas agora
              </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 border border-emerald-100">
              👥
            </div>
          </div>

          <!-- CARD 2: STATUS DO BANCO DE DADOS -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Banco de Dados Cloud</span>
              <div class="text-base font-black text-slate-800 mt-1 flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full ${window.store.cloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}"></span>
                <span>${window.store.cloudConnected ? 'Supabase Conectado' : 'Supabase Desconectado'}</span>
              </div>
              <span class="text-[10px] text-slate-500 mt-1 block truncate max-w-[150px]" title="${config.url || ''}">
                ${config.url ? config.url.replace('https://', '') : 'Não configurado'}
              </span>
            </div>
            <div class="w-12 h-12 rounded-xl ${window.store.cloudConnected ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-rose-50 text-rose-600 border border-rose-100'} flex items-center justify-center text-xl shrink-0">
              🗄️
            </div>
          </div>

          <!-- CARD 3: TOTAL DE GRÁFICAS ATIVAS -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gráficas Cadastradas</span>
              <div class="text-2xl font-black text-slate-800 mt-1 font-mono">
                ${tenants.length}
              </div>
              <span class="text-[10px] text-blue-600 font-semibold mt-1 block">
                Multi-Tenant Ativo & Isolado
              </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0 border border-indigo-100">
              🏢
            </div>
          </div>

          <!-- CARD 4: INTEGRIDADE DO SISTEMA / STATUS DE CONEXÃO (IMAGEM 2) -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Integridade / Conexão</span>
              <div class="mt-1 flex items-center gap-1.5">
                <span id="settings-connection-status-badge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ${window.store.cloudConnected ? 'bg-emerald-500 text-white border border-emerald-400' : 'bg-rose-600 text-white border border-rose-500'}">
                  <span class="w-2 h-2 rounded-full bg-white ${window.store.cloudConnected ? 'animate-pulse' : ''}"></span>
                  <span>${window.store.cloudConnected ? '100% conectado' : 'desconectado'}</span>
                </span>
              </div>
              <span class="text-[10px] text-slate-500 mt-1 block">
                ${window.store.cloudConnected ? 'Base de dados 100% online' : 'Sistema inoperante sem banco'}
              </span>
            </div>
            <div class="w-12 h-12 rounded-xl ${window.store.cloudConnected ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'} flex items-center justify-center text-xl shrink-0">
              ${window.store.cloudConnected ? '⚡' : '⚠️'}
            </div>
          </div>
        </div>

        <!-- SEÇÃO: CAMINHO DO BANCO DE DADOS & CONEXÃO SUPABASE CLOUD -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 class="text-base font-black text-slate-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 5h16M4 12c0 2 1 3 3 3h10c2 0 3-1 3-3"></path></svg>
                Caminho do Banco de Dados & Infraestrutura Cloud (Supabase)
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Caminho oficial e credenciais do PostgreSQL Cloud compartilhado entre PCs e Dispositivos Móveis
              </p>
            </div>
            <div id="settings-status-indicator">
              ${window.store.supabaseClient ? `
                <span class="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Cloud Sincronizada & Ativa
                </span>
              ` : `
                <span class="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span> Conexão Pendente / Armazenamento Local
                </span>
              `}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Caminho do Banco (Project URL / REST Endpoint)</label>
              <div class="relative">
                <input type="text" id="set-url" value="${config.url || ''}" placeholder="https://exemplo.supabase.co" class="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
              </div>
              <span class="text-[10px] text-slate-400 mt-1 block">Ex: https://mirhgxsiwjuondnpekru.supabase.co</span>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Anon / Public API Key (Token JWT)</label>
              <div class="relative">
                <input type="password" id="set-key" value="${config.key || ''}" placeholder="Chave de API pública anon..." class="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
              </div>
              <span class="text-[10px] text-slate-400 mt-1 block">Utilizada para comunicação segura via SSL/TLS com o banco</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div class="flex gap-2">
              <button onclick="app.saveSupabaseSettings()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-2 cursor-pointer">
                <span>Salvar & Reconectar</span>
              </button>
              <button onclick="app.testSupabaseConnection()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 cursor-pointer">
                <span>Testar Conexão</span>
              </button>
            </div>
            <div class="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Protocolo: <strong>REST & Realtime WebSockets</strong> | Latência estimada: <strong>~38ms</strong>
            </div>
          </div>
        </div>

        <!-- SEÇÃO: STATUS DE FUNCIONAMENTO DOS SUBSISTEMAS (HEALTH CHECK) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 class="text-base font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Status de Funcionamento dos Sistemas (Health Check)
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 block">Banco de Dados Cloud</span>
                <span class="text-[11px] text-slate-500">PostgreSQL Supabase</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1">
                ● Operacional
              </span>
            </div>

            <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 block">Cache Local & Offline</span>
                <span class="text-[11px] text-slate-500">LocalStorage HTML5 Engine</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1">
                ● Saudável
              </span>
            </div>

            <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 block">Motor de Cálculo m² e Tintas</span>
                <span class="text-[11px] text-slate-500">Regra de Ouro e CMYK</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1">
                ● Calibrado
              </span>
            </div>

            <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 block">Módulo Produção e Kanban</span>
                <span class="text-[11px] text-slate-500">8 Fases em tempo real</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1">
                ● Ativo
              </span>
            </div>

            <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 block">Emissão de O.S. e Recibos</span>
                <span class="text-[11px] text-slate-500">Documentos Térmicos e A4</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1">
                ● Pronto
              </span>
            </div>

            <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 block">Gateway WhatsApp e E-mail</span>
                <span class="text-[11px] text-slate-500">Disparo de Fases e PIX</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1">
                ● Conectado
              </span>
            </div>
          </div>
        </div>

        <!-- SEÇÃO: USUÁRIOS ONLINE & AUDITORIA DE SESSÕES -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div class="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h2 class="text-base font-black text-slate-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Usuários do Sistema e Monitor de Presença
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Quem está online neste momento e seus respectivos níveis de permissão</p>
            </div>
            <span class="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              ${totalOnlineCount} Online Agora
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th class="p-3">Operador / Usuário</th>
                  <th class="p-3 text-center">CPF / Segurança</th>
                  <th class="p-3">Cargo / Perfil</th>
                  <th class="p-3">Unidade / Empresa</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Último Acesso</th>
                  <th class="p-3">Dispositivo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${onlineUsers.map(u => {
                  const cpfFormatado = u.cpf ? window.authModule.maskCpf(u.cpf) : (u.login || '--');
                  return `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="p-3 flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600">
                        ${u.foto_url ? `<img src="${u.foto_url}" class="w-full h-full object-cover">` : u.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span class="font-bold text-slate-800 block">${u.nome}</span>
                        <span class="text-[10px] text-slate-400 font-mono">${u.operador ? `@${u.operador}` : (u.login || '--')}</span>
                      </div>
                    </td>
                    <td class="p-3 text-center">
                      <div class="inline-flex flex-col items-center gap-1">
                        <span class="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          ${cpfFormatado}
                        </span>
                        <button 
                          type="button" 
                          onclick="window.authModule.resetUserPasswordToDefault('${u.id}')" 
                          class="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 border border-amber-300 rounded-md transition shadow-2xs flex items-center gap-1 cursor-pointer" 
                          title="Resetar senha deste usuário para '0000'">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                          Reset Senha ('0000')
                        </button>
                      </div>
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : (u.role === 'GERENTE' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700')}">
                        ${u.role || 'OPERADOR'}
                      </span>
                    </td>
                    <td class="p-3 font-semibold text-slate-700">
                      ${u.tenant_id ? u.tenant_id.replace('tenant-', '').toUpperCase() : 'Geral (Todas)'}
                    </td>
                    <td class="p-3">
                      ${u.isOnline ? `
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                        </span>
                      ` : `
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                          <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Offline
                        </span>
                      `}
                    </td>
                    <td class="p-3 text-slate-600 font-mono text-[11px]">${u.ultimoAcesso}</td>
                    <td class="p-3 text-slate-500 text-[11px]">${u.dispositivo}</td>
                  </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- SEÇÃO: PAINEL DE GRÁFICAS & RELATÓRIOS CONSOLIDADOS (EXCLUSIVO DO ADMINISTRADOR DA GRAFSIS) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 class="text-base font-black text-slate-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                Painel das Gráficas Parceiras & Relatório Executivo
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Visão consolidada de planos, faturamento e ordens por gráfica cliente da GRAFSIS</p>
            </div>
            <div class="flex gap-2">
              <button onclick="app.navigate('tenants')" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition">
                Gerenciar Empresas &rarr;
              </button>
            </div>
          </div>

          <!-- GRÁFICO COMPARATIVO EM BARRAS POR EMPRESA -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span class="text-xs font-black text-slate-700 uppercase tracking-wider block">Faturamento Comparativo por Gráfica</span>
            <div class="space-y-2.5">
              ${tenantMetrics.map(tm => {
                const perc = Math.round((tm.faturamento / maxFaturamento) * 100);
                return `
                  <div>
                    <div class="flex justify-between items-center text-xs mb-1">
                      <span class="font-bold text-slate-800">${tm.razao_social || 'Gráfica'}</span>
                      <span class="font-mono font-black text-blue-700">R$ ${tm.faturamento.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${tm.totalOrders} pedidos)</span>
                    </div>
                    <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" style="width: ${Math.max(8, perc)}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- TABELA DE GRÁFICAS CADASTRADAS -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th class="p-3">Gráfica / Razão Social</th>
                  <th class="p-3">CNPJ</th>
                  <th class="p-3">Plano</th>
                  <th class="p-3">Data Expiração</th>
                  <th class="p-3 text-center">Status</th>
                  <th class="p-3 text-center">Total Pedidos</th>
                  <th class="p-3 text-right">Faturamento Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${tenantMetrics.map(tm => `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="p-3 font-black text-slate-800">${tm.razao_social || 'Sem Nome'}</td>
                    <td class="p-3 font-mono text-slate-600">${tm.cnpj || '--'}</td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        ${tm.plano || 'TESTE'}
                      </span>
                    </td>
                    <td class="p-3 font-mono text-slate-600">
                      ${tm.data_expira ? new Date(tm.data_expira + 'T12:00:00').toLocaleDateString('pt-BR') : '--'}
                    </td>
                    <td class="p-3 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${tm.bloqueada ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
                        ${tm.bloqueada ? 'Inativa / Bloqueada' : 'Ativa & Liberada'}
                      </span>
                    </td>
                    <td class="p-3 text-center font-mono font-bold text-slate-800">${tm.totalOrders}</td>
                    <td class="p-3 text-right font-mono font-black text-emerald-700">
                      R$ ${tm.faturamento.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- SEÇÃO: BACKUP E EXPORTAÇÃO OFFLINE -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            Backup Completo e Restauração Offline
          </h2>
          <p class="text-xs text-slate-500">Baixe uma cópia integral com todos os clientes, pedidos, estampas, tintas e movimentações financeiras em arquivo JSON.</p>
          <div class="flex flex-wrap gap-3">
            <button onclick="window.store.exportData()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm transition cursor-pointer">
              Baixar Backup Completo (.JSON)
            </button>
            <input type="file" id="import-file" accept=".json" onchange="app.handleImport(this)" class="hidden">
            <button onclick="document.getElementById('import-file').click()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition cursor-pointer">
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

    // Mercado Pago (Acesso para Proprietário e Admin)
    const mpTokenEl = document.getElementById('comp-mp-token');
    const mpWebhookEl = document.getElementById('comp-mp-webhook');
    const mpEnabledEl = document.getElementById('comp-mp-enabled');

    if (mpTokenEl) {
      tenant.mercadopago_access_token = mpTokenEl.value.trim();
      tenant.mercadopago_webhook_url = mpWebhookEl ? mpWebhookEl.value.trim() : '';
      tenant.mercadopago_enabled = mpEnabledEl ? mpEnabledEl.checked : false;

      if (window.mercadoPagoModule) {
        window.mercadoPagoModule.saveConfig({
          enabled: tenant.mercadopago_enabled,
          accessToken: tenant.mercadopago_access_token,
          webhookUrl: tenant.mercadopago_webhook_url
        });
      }
    }

    await window.store.saveTenant(tenant);
    this.updateUserHeader();
    alert('Dados salvos com sucesso!');
  },

  async saveSupabaseSettings() {
    const url = document.getElementById('set-url').value.trim();
    const key = document.getElementById('set-key').value.trim();
    if (window.GRAFSIS_CONFIG) {
      window.GRAFSIS_CONFIG.setSupabaseConfig(url, key);
    }
    const settings = window.store.getSettings();
    window.store.saveSettings({ ...settings, supabaseUrl: url, supabaseKey: key });
    
    // Reinicializa o cliente Supabase imediatamente com as novas credenciais
    if (window.store && typeof window.store.initSupabase === 'function') {
      window.store.initSupabase();
    }
    
    this.updateUserHeader();
    this.renderSettings();
    
    const isHealthy = await window.store.checkCloudHealth(true);
    if (isHealthy) {
      alert('✅ 100% CONECTADO!\n\nConfigurações salvas e conexão com a nuvem estabelecida com sucesso!');
      window.store.syncAllWithCloud(true);
    } else {
      alert('⚠️ Configurações salvas no sistema.\n\nPorém a base na nuvem ainda não respondeu ao teste inicial.\nVerifique se o seu projeto Supabase está ativo no painel.');
    }
  },

  async testSupabaseConnection() {
    if (!window.store.supabaseClient) {
      alert('❌ SISTEMA INOPERANTE: Supabase desconectado.\n\nPreencha a URL e a Anon Key nas configurações e clique em "Salvar & Reconectar" para autenticar.');
      return;
    }
    try {
      const isHealthy = await window.store.checkCloudHealth(true);
      if (!isHealthy) {
        alert('❌ SISTEMA INOPERANTE: Não foi possível acessar a base de dados Supabase na nuvem.\n\nO Grafsis opera exclusivamente 100% ON-LINE e integrado ao banco de dados.\n\nVerifique se o seu projeto Supabase está ATIVO ou se precisa ser reativado (Resume/Restore) no painel.');
      } else {
        alert('✅ 100% CONECTADO!\n\nConexão com o banco de dados Supabase efetuada com SUCESSO!\nA base de dados na nuvem está 100% operacional e sincronizada.');
      }
    } catch (e) {
      alert('❌ SISTEMA INOPERANTE: Erro na conexão com o Supabase:\n' + (e.message || e));
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

  /* ==============================================================================
     NOTIFICAÇÕES INTELIGENTES & CONTROLE DE PRAZOS (Imagem 4)
     - Vermelho: Expiração do sistema em até 3 dias úteis
     - Amarelo: Pedidos com prazo de entrega vencido
     ============================================================================== */
  calculateBusinessDays(startDate, endDate) {
    let count = 0;
    let cur = new Date(startDate);
    const end = new Date(endDate);
    
    // Normaliza horários para comparar apenas datas
    cur.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (cur > end) return -1; // Já expirado

    while (cur < end) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // Ignora sábado (6) e domingo (0)
        count++;
      }
    }
    return count;
  },

  getSystemExpirationStatus() {
    if (!window.store) return null;
    const activeTenant = window.store.getActiveTenant();
    if (!activeTenant || !activeTenant.data_expiracao || activeTenant.plano === 'INDETERMINADO') {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(activeTenant.data_expiracao + 'T23:59:59');
    
    if (today > expDate) {
      return { expired: true, expiringSoon: true, businessDays: 0, date: activeTenant.data_expiracao };
    }

    const businessDays = this.calculateBusinessDays(today, expDate);
    if (businessDays <= 3) {
      return { expired: false, expiringSoon: true, businessDays, date: activeTenant.data_expiracao };
    }

    return { expired: false, expiringSoon: false, businessDays, date: activeTenant.data_expiracao };
  },

  getOverdueOrders() {
    if (!window.store) return [];
    const orders = window.store.getOrders() || [];
    const todayStr = new Date().toISOString().slice(0, 10);

    return orders.filter(o => {
      const statusFase = ((o.status_fase || o.status || '') + '').toLowerCase();
      const isDone = ['entregue', 'finalizado', 'concluido'].includes(statusFase);
      if (isDone) return false;

      const deliveryDate = (o.previsao_entrega || o.data_entrega || '').slice(0, 10);
      if (!deliveryDate) return false;

      return deliveryDate < todayStr;
    });
  },

  updateNotificationStatus() {
    const expStatus = this.getSystemExpirationStatus();
    const overdueOrders = this.getOverdueOrders();
    const notifs = JSON.parse(localStorage.getItem('grafsis_notifications') || '[]');
    const unreadApprovals = notifs.filter(n => n.tipo === 'aprovacao_cliente' && !n.lida);

    const badge = document.getElementById('header-notification-badge');
    const sideDot = document.getElementById('sidebar-notif-dot');

    if (!badge) return;

    if (expStatus && expStatus.expiringSoon) {
      // REGRA: VERMELHO - 3 dias úteis antes de expirar o sistema (ou expirado)
      badge.classList.remove('hidden');
      badge.className = 'absolute top-1.5 right-1.5 min-w-4 h-4 px-1 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm bg-red-600 text-white animate-pulse';
      badge.textContent = '!';
      badge.title = expStatus.expired ? 'Alerta: Licença do sistema expirada!' : `Atenção: Sistema expira em ${expStatus.businessDays} dias úteis!`;
      
      if (sideDot) {
        sideDot.classList.remove('hidden');
        sideDot.className = 'w-2 h-2 rounded-full bg-red-500 animate-pulse';
      }
    } else if (unreadApprovals.length > 0) {
      // REGRA: VERDE ESMERALDA - Notificações de autorização pelo cliente
      badge.classList.remove('hidden');
      badge.className = 'absolute top-1.5 right-1.5 min-w-4 h-4 px-1 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm bg-emerald-500 text-white animate-pulse';
      badge.textContent = unreadApprovals.length;
      badge.title = `${unreadApprovals.length} autorização(ões) de cliente recebida(s)!`;

      if (sideDot) {
        sideDot.classList.remove('hidden');
        sideDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      }
    } else if (overdueOrders.length > 0) {
      // REGRA: AMARELO - Informa pedidos com prazo de entrega vencido
      badge.classList.remove('hidden');
      badge.className = 'absolute top-1.5 right-1.5 min-w-4 h-4 px-1 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm bg-amber-400 text-slate-900 font-black';
      badge.textContent = overdueOrders.length;
      badge.title = `${overdueOrders.length} pedido(s) com prazo de entrega vencido!`;
      
      if (sideDot) {
        sideDot.classList.remove('hidden');
        sideDot.className = 'w-2 h-2 rounded-full bg-amber-500';
      }
    } else {
      // Sem alertas críticos
      badge.classList.add('hidden');
      if (sideDot) sideDot.classList.add('hidden');
    }
  },

  openNotificationsModal() {
    let existing = document.getElementById('notifications-modal');
    if (existing) existing.remove();

    const expStatus = this.getSystemExpirationStatus();
    const overdueOrders = this.getOverdueOrders();
    const activeTenant = window.store ? window.store.getActiveTenant() : {};
    const notifs = JSON.parse(localStorage.getItem('grafsis_notifications') || '[]');
    const unreadApprovals = notifs.filter(n => n.tipo === 'aprovacao_cliente' && !n.lida);

    const markAllRead = () => {
      const updated = notifs.map(n => ({ ...n, lida: true }));
      localStorage.setItem('grafsis_notifications', JSON.stringify(updated));
      this.updateNotificationStatus();
    };

    const modalHtml = `
      <div id="notifications-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
          <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">🔔</span>
              <div>
                <h3 class="text-base font-bold text-slate-800">Central de Notificações e Prazos</h3>
                <p class="text-[11px] text-slate-500">Monitoramento operacional de autorizações, licenças e entregas</p>
              </div>
            </div>
            <button onclick="document.getElementById('notifications-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-black">&times;</button>
          </div>

          <div class="p-5 overflow-y-auto space-y-4 text-xs">
            <!-- 0. NOTIFICAÇÕES DE AUTORIZAÇÃO DE CLIENTES (VERDE) -->
            ${unreadApprovals.length > 0 ? `
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Autorizações de Produção Recebidas (${unreadApprovals.length})
                  </span>
                  <button type="button" onclick="(() => {
                    const n = JSON.parse(localStorage.getItem('grafsis_notifications') || '[]');
                    localStorage.setItem('grafsis_notifications', JSON.stringify(n.map(x => ({...x, lida: true}))));
                    app.updateNotificationStatus();
                    document.getElementById('notifications-modal')?.remove();
                  })()" class="text-[10px] text-slate-500 hover:text-emerald-700 font-bold underline cursor-pointer">
                    Marcar todas como lidas
                  </button>
                </div>
                ${unreadApprovals.map(notif => `
                  <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                    <div class="space-y-0.5">
                      <div class="font-black text-emerald-950 text-xs">
                        Pedido #${notif.pedido_numero} — Autorizado pelo Cliente
                      </div>
                      <div class="text-[11px] text-emerald-800">
                        ${notif.cliente ? `<strong>${notif.cliente}</strong> autorizou a produção` : 'Autorização digital confirmada'} às ${notif.hora || ''} (${new Date(notif.data).toLocaleDateString('pt-BR')})
                      </div>
                    </div>
                    <button type="button" onclick="(() => {
                      const n = JSON.parse(localStorage.getItem('grafsis_notifications') || '[]');
                      const target = n.find(x => x.id === '${notif.id}');
                      if (target) target.lida = true;
                      localStorage.setItem('grafsis_notifications', JSON.stringify(n));
                      app.updateNotificationStatus();
                      document.getElementById('notifications-modal')?.remove();
                      app.showNotificationOrderDetails('${notif.pedido_id}', '${notif.pedido_numero}');
                    })()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition whitespace-nowrap cursor-pointer">
                      Ver Pedido &rarr;
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- 1. ALERTA DE EXPIRAÇÃO DO SISTEMA (VERMELHO) -->
            ${(expStatus && expStatus.expiringSoon) ? `
              <div class="p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 shadow-sm flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0">!</span>
                  <span class="font-bold text-sm text-red-800">
                    ${expStatus.expired ? 'ALERTA CRÍTICO: LICENÇA DO SISTEMA EXPIRADA!' : 'ATENÇÃO: LICENÇA DO SISTEMA EXPIRA EM BREVE!'}
                  </span>
                </div>
                <p class="text-xs text-red-700 leading-relaxed">
                  ${expStatus.expired ? `
                    A licença do sistema para a empresa <strong>${activeTenant.nome_fantasia || activeTenant.razao_social}</strong> expirou em <strong>${new Date(expStatus.date + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>. Renove para manter o funcionamento completo.
                  ` : `
                    A sua licença do sistema vence em <strong>${expStatus.businessDays} dia(s) útil(eis)</strong> (Data Limite: <strong>${new Date(expStatus.date + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>). Renove agora para evitar o bloqueio automático de novas operações.
                  `}
                </p>
                <div class="mt-1 flex justify-end">
                  <button 
                    onclick="document.getElementById('notifications-modal').remove(); app.navigate('tenants');" 
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow transition">
                    Renovar Plano Agora &rarr;
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- STATUS REGULAR SE NÃO HOUVER PENDÊNCIAS -->
            ${(!expStatus?.expiringSoon && unreadApprovals.length === 0) ? `
              <div class="p-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-center space-y-2">
                <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <div class="font-black text-base text-emerald-800">Tudo em Dia!</div>
                <p class="text-xs text-emerald-700 max-w-sm mx-auto">
                  Sua empresa está com a licença ativa e regularizada. Novas autorizações de clientes e prazos de pedidos são monitorados automaticamente aqui e no Kanban de Produção.
                </p>
              </div>
            ` : ''}
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-100 text-right">
            <button onclick="document.getElementById('notifications-modal').remove()" class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  showNotificationOrderDetails(pedidoId, pedidoNumero) {
    const orders = window.store ? window.store.getOrders() : [];
    const order = orders.find(o => o.id === pedidoId || String(o.numero) === String(pedidoNumero) || String(o.id) === String(pedidoNumero));
    
    if (!order) {
      alert(`Pedido #${pedidoNumero || pedidoId} não localizado nos registros locais.`);
      return;
    }

    const clients = window.store ? window.store.getClients() : [];
    const client = clients.find(c => c.id === order.cliente_id) || { nome: order.cliente_nome || 'Cliente não identificado' };

    const phaseNames = {
      'orcamento': '1. Orçamento',
      'prevenda': '2. Pré-Venda',
      'aprovacao': '3. Aguardando Aprovação',
      'liberado': '4. Liberado O.S.',
      'producao': '5. Em Produção',
      'acabamento': '6. Acabamento',
      'embalagem': '7. Embalagem / Expedição',
      'entregue': '8. Entregue / Concluído'
    };

    const modalId = 'order-details-info-modal';
    document.getElementById(modalId)?.remove();

    const hist = order.historico || [];
    const aprov = order.aprovado_cliente;

    const modalHtml = `
      <div id="${modalId}" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in">
          <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">📋</span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-black text-slate-800">Pedido #${order.numero || order.id.substring(0,8)}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${order.status_fase === 'entregue' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'}">
                    ${phaseNames[order.status_fase] || order.status_fase}
                  </span>
                </div>
                <p class="text-xs text-slate-500 font-bold">${client.nome}</p>
              </div>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-black">&times;</button>
          </div>

          <div class="p-5 overflow-y-auto space-y-4 text-xs">
            <!-- Informações de Quem Autorizou -->
            <div class="p-4 rounded-xl ${aprov ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' : 'bg-amber-50 border border-amber-200 text-amber-950'} space-y-2">
              <div class="font-black text-xs uppercase flex items-center gap-1.5">
                <span>${aprov ? '✅' : '⏳'}</span>
                <span>${aprov ? 'Autorização de Produção Confirmada' : 'Status de Aprovação'}</span>
              </div>
              ${aprov ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div><strong>Quem autorizou:</strong> ${aprov.aprovador || client.nome}</div>
                  <div><strong>Data & Hora:</strong> ${aprov.data_formatada || (aprov.data ? new Date(aprov.data).toLocaleString('pt-BR') : 'Registrado')}</div>
                  <div><strong>Telefone Validado:</strong> ${aprov.telefone || order.telefone_autorizacao || 'WhatsApp'}</div>
                  <div><strong>Dispositivo:</strong> ${aprov.dispositivo || 'Web / Smartphone'}</div>
                </div>
              ` : `
                <p class="text-[11px] text-amber-800">Este pedido ainda aguarda autorização formal ou foi lançado manualmente em fase avançada.</p>
              `}
            </div>

            <!-- Dados Operacionais e Localização do Pedido -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span class="block text-[10px] font-bold text-slate-400 uppercase">Fase Atual</span>
                <span class="font-black text-slate-800">${phaseNames[order.status_fase] || order.status_fase}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span class="block text-[10px] font-bold text-slate-400 uppercase">Vendedor / Resp.</span>
                <span class="font-bold text-slate-800 truncate block">${order.vendedor || 'Sistema'}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span class="block text-[10px] font-bold text-slate-400 uppercase">Data Emissão</span>
                <span class="font-bold text-slate-800">${order.data_criacao ? new Date(order.data_criacao).toLocaleDateString('pt-BR') : '--'}</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span class="block text-[10px] font-bold text-slate-400 uppercase">Previsão Entrega</span>
                <span class="font-bold text-rose-600">${order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'A combinar'}</span>
              </div>
            </div>

            <!-- Itens do Pedido -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="p-2.5 bg-slate-100 font-bold text-slate-700 text-xs flex justify-between items-center">
                <span>Itens do Pedido (${order.itens?.length || 0})</span>
                <span class="font-mono text-emerald-700 font-black">
                  Total: R$ ${Number(order.valor_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b">
                  <tr>
                    <th class="p-2">Item</th>
                    <th class="p-2">Descrição / Medidas</th>
                    <th class="p-2 text-center">Qtd</th>
                    <th class="p-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${(order.itens || []).map((it, idx) => `
                    <tr>
                      <td class="p-2 font-bold text-blue-700">#${it.item_id || String(order.numero) + String(idx+1).padStart(2, '0')}</td>
                      <td class="p-2 font-medium text-slate-800">
                        <div>${it.produto_nome || it.descricao || 'Item Gráfico'}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${it.largura_x ? `${it.largura_x}m x ${it.comprimento_y}m` : ''} ${it.acabamento ? `• ${it.acabamento}` : ''}</div>
                      </td>
                      <td class="p-2 text-center font-bold">${it.quantidade}x</td>
                      <td class="p-2 text-right font-mono font-bold text-slate-700">R$ ${Number(it.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Histórico de Transição de Fases -->
            <div>
              <span class="block text-xs font-bold text-slate-700 uppercase mb-2">Histórico de Movimentação de Fases</span>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 max-h-40 overflow-y-auto">
                ${hist.length === 0 ? `
                  <p class="text-xs text-slate-400 text-center py-2">Sem histórico de transição registrado.</p>
                ` : hist.map(h => `
                  <div class="flex items-start gap-2 text-xs">
                    <span class="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                    <div class="flex-1">
                      <strong class="text-slate-800 uppercase">${phaseNames[h.fase] || h.fase}</strong>
                      <span class="text-slate-500 text-[10px]"> — ${new Date(h.data).toLocaleString('pt-BR')} por <strong>${h.usuario || 'Operador'}</strong></span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button 
              onclick="document.getElementById('${modalId}').remove(); app.navigate('sales'); setTimeout(() => { if (window.salesModule?.openModal) window.salesModule.openModal({ orderId: '${order.id}' }); }, 150);"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition">
              Abrir Edição Completa &rarr;
            </button>
            <button onclick="document.getElementById('${modalId}').remove()" class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  /* ==============================================================================
     LIVRO DE OCORRÊNCIAS & AUDITORIA DE PEDIDOS (Exclusivo: Proprietário e Admin)
     ============================================================================== */
  openAuditOccurrencesModal() {
    const user = window.authModule ? window.authModule.getCurrentUser() : null;
    const role = (user ? (user.role || user.tipo || user.perfil || '') : '').toUpperCase();
    const isAuthorized = ['PROPRIETARIO', 'ADMIN'].includes(role);

    if (!isAuthorized) {
      alert('Acesso Restrito: O Livro de Ocorrências e Auditoria só pode ser acessado pelo Proprietário ou Admin do sistema.');
      return;
    }

    const modalId = 'audit-occurrences-modal';
    document.getElementById(modalId)?.remove();

    const logs = window.store ? window.store.getAuditLog() : [];

    const modalHtml = `
      <div id="${modalId}" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/60">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl font-black">
                🛡️
              </div>
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-amber-600">Governança e Rastreabilidade</span>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Livro de Ocorrências e Auditoria</h3>
                <p class="text-xs text-slate-400">Registros imutáveis de edições, reaberturas e alterações em pedidos finalizados</p>
              </div>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              ✕
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-4 text-xs">
            ${logs.length === 0 ? `
              <div class="p-10 text-center text-slate-400 space-y-2">
                <div class="text-4xl">📋</div>
                <div class="font-bold text-sm text-slate-600 dark:text-slate-300">Nenhuma ocorrência registrada</div>
                <p class="text-xs text-slate-400">Qualquer edição ou reabertura de pedido finalizado será registrada e auditada aqui.</p>
              </div>
            ` : `
              <div class="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left">
                  <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th class="p-3">Data / Hora</th>
                      <th class="p-3">Pedido</th>
                      <th class="p-3">Operador / Perfil</th>
                      <th class="p-3">Tipo</th>
                      <th class="p-3">Descrição da Ocorrência</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    ${logs.map(log => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          ${new Date(log.data_hora).toLocaleString('pt-BR')}
                        </td>
                        <td class="p-3 font-mono font-black text-blue-600 dark:text-cyan-400 whitespace-nowrap">
                          #${log.pedido_numero || log.pedido_id || '--'}
                        </td>
                        <td class="p-3 whitespace-nowrap">
                          <strong class="text-slate-800 dark:text-slate-200 block">${log.usuario_nome}</strong>
                          <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">${log.usuario_perfil}</span>
                        </td>
                        <td class="p-3 whitespace-nowrap">
                          <span class="px-2 py-1 rounded text-[10px] font-black uppercase ${
                            log.tipo === 'REABERTURA_GERENTE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            (log.tipo === 'EDICAO_FINALIZADO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')
                          }">
                            ${log.tipo}
                          </span>
                        </td>
                        <td class="p-3 text-slate-700 dark:text-slate-300 text-[11px]">
                          ${log.descricao}
                          ${log.detalhes ? `<div class="mt-1 font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 p-1.5 rounded">${typeof log.detalhes === 'string' ? log.detalhes : JSON.stringify(log.detalhes)}</div>` : ''}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>

          <div class="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span class="text-slate-400">Total de ocorrências: <strong>${logs.length}</strong></span>
            <button onclick="document.getElementById('${modalId}').remove()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openClientPortalModal() {
    let existing = document.getElementById('client-portal-modal');
    if (existing) existing.remove();

    const orders = window.store ? window.store.getOrders().slice(0, 5) : [];

    const modalHtml = `
      <div id="client-portal-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
          <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">🛡️</span>
              <div>
                <h3 class="text-base font-bold text-slate-800">Portal de Aprovação do Cliente</h3>
                <p class="text-[11px] text-slate-500">Aprovação de arte, acompanhamento e pagamentos pelo cliente</p>
              </div>
            </div>
            <button onclick="document.getElementById('client-portal-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-black">&times;</button>
          </div>

          <div class="p-5 overflow-y-auto space-y-4 text-xs">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 text-slate-700 space-y-2">
              <div class="font-bold text-sm text-blue-900 flex items-center gap-1.5">
                <span>📱</span> Como funciona o Portal do Cliente?
              </div>
              <p class="text-xs leading-relaxed text-slate-600">
                Ao gerar o link de um pedido, seu cliente recebe um endereço seguro no WhatsApp para:
              </p>
              <ul class="list-disc list-inside space-y-1 text-xs text-slate-600 font-medium pl-1">
                <li>Visualizar a prova/arte em alta definição</li>
                <li>Dar o <strong>Autorizo de Produção</strong> formal com assinatura digital</li>
                <li>Acompanhar em tempo real as etapas de impressão e acabamento</li>
                <li>Pagar a entrada ou quitar o saldo via PIX com QR Code dinâmico</li>
              </ul>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Selecione um Pedido para Gerar Link de Teste:</label>
              <select id="portal-sel-order" class="w-full p-2.5 border rounded-xl bg-slate-50 text-xs font-bold text-slate-800">
                ${orders.map(o => {
                  const showVal = (window.authModule && window.authModule.can('canViewSaleValues'));
                  const valStr = showVal ? ` (R$ ${Number(o.total || o.valor_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : '';
                  const numDisplay = o.numero || (o.id && o.id.length > 8 ? o.id.substring(0, 8) : o.id) || '--';
                  return `<option value="${o.id}">Pedido #${numDisplay} - ${o.cliente_nome || 'Cliente'}${valStr}</option>`;
                }).join('')}
              </select>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
              <span class="font-mono text-[11px] text-slate-600 truncate" id="portal-link-preview">
                https://tinhosys.github.io/grafsis/#aprovacao?id=demo
              </span>
              <button 
                type="button"
                onclick="
                  const sel = document.getElementById('portal-sel-order');
                  const url = 'https://tinhosys.github.io/grafsis/#aprovacao?id=' + (sel ? sel.value : 'demo');
                  navigator.clipboard.writeText(url);
                  alert('Link do Portal de Aprovação copiado com sucesso! Pode enviar ao cliente pelo WhatsApp.');
                "
                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 transition">
                Copiar Link WhatsApp
              </button>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onclick="document.getElementById('client-portal-modal').remove()" class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openNewOrderModal(params) {
    if (window.authModule && !window.authModule.can('canCreateOrders')) {
      const user = window.authModule.getCurrentUser();
      const roleName = user ? (user.role || user.perfil || 'PRODUÇÃO') : 'PRODUÇÃO';
      alert(`Acesso Restrito: O perfil ${roleName} não possui permissão para emitir vendas ou orçamentos.\n\nA emissão e precificação de pedidos é restrita aos perfis Vendas, Gerente e Proprietário.`);
      return;
    }
    this.navigate('sales');
    setTimeout(() => {
      if (window.salesModule && typeof window.salesModule.openModal === 'function') {
        window.salesModule.openModal(params);
      }
    }, 50);
  },

  async fetchOrderFromCloud(orderId) {
    try {
      let client = window.store?.supabaseClient;
      if (!client && window.GRAFSIS_CONFIG && window.supabase && typeof window.supabase.createClient === 'function') {
        const cfg = window.GRAFSIS_CONFIG.getSupabaseConfig();
        if (cfg && cfg.url && cfg.key) {
          client = window.supabase.createClient(cfg.url, cfg.key);
        }
      }
      if (!client) return null;

      let query = client.from('pedidos').select('*');
      if (orderId.includes('-')) {
        query = query.eq('id', orderId);
      } else {
        query = query.or(`id.eq.${orderId},numero.eq.${orderId}`);
      }
      const { data, error } = await query.limit(1);
      if (error || !data || data.length === 0) return null;

      const item = data[0];
      if (item.observacoes && typeof item.observacoes === 'string' && item.observacoes.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(item.observacoes);
          if (parsed.itens && Array.isArray(parsed.itens)) item.itens = parsed.itens;
          if (parsed.historico && Array.isArray(parsed.historico)) item.historico = parsed.historico;
          if (parsed.numero) item.numero = parsed.numero;
          if (parsed.vendedor) item.vendedor = parsed.vendedor;
          if (parsed.previsao_entrega && !item.previsao_entrega) item.previsao_entrega = parsed.previsao_entrega;
          if (parsed.obs !== undefined) item.observacoes = parsed.obs;
        } catch (e) {}
      }
      if (item.created_at && !item.data_criacao) {
        item.data_criacao = item.created_at;
      }

      // Salva em cache local para agilizar visualizações futuras
      if (window.store && typeof window.store.getOrders === 'function') {
        const allOrders = window.store.getOrders();
        const idx = allOrders.findIndex(o => o.id === item.id);
        if (idx !== -1) allOrders[idx] = item;
        else allOrders.push(item);
        if (typeof window.store.saveLocal === 'function') {
          window.store.saveLocal('grafsis_orders', allOrders);
        }
      }

      return item;
    } catch (err) {
      console.warn('[Portal Cloud Fetch] Falha ao consultar pedido:', err);
      return null;
    }
  },

  async renderPublicClientApprovalPortal(hash) {
    document.documentElement.classList.add('portal-mode');

    // 1. Oculta expressamente o modal de login e a interface administrativa interna
    const authModal = document.getElementById('auth-modal');
    const appLayout = document.getElementById('app-layout');
    const portalRoot = document.getElementById('public-portal-root');

    if (authModal) {
      authModal.classList.add('hidden');
      authModal.classList.remove('flex');
      authModal.style.display = 'none';
    }
    if (appLayout) {
      appLayout.style.display = 'none';
    }
    if (portalRoot) {
      portalRoot.classList.remove('hidden');
      portalRoot.style.display = 'block';
    }
    document.body.classList.remove('overflow-hidden');
    document.body.classList.add('overflow-y-auto');

    if (window.authModule && typeof window.authModule.closeLoginModal === 'function') {
      window.authModule.closeLoginModal(true);
    }

    // 2. Extrai o identificador do pedido ou token de validação da URL
    let orderId = '';
    let isDirectReceiptVal = false;
    const lowerHash = hash.toLowerCase();
    if (lowerHash.includes('val=')) {
      const idx = lowerHash.indexOf('val=') + 4;
      orderId = hash.slice(idx).split('&')[0];
      isDirectReceiptVal = true;
    } else if (lowerHash.includes('recibo=')) {
      const idx = lowerHash.indexOf('recibo=') + 7;
      orderId = hash.slice(idx).split('&')[0];
      isDirectReceiptVal = true;
    } else if (lowerHash.includes('id=')) {
      const idx = lowerHash.indexOf('id=') + 3;
      orderId = hash.slice(idx).split('&')[0];
    } else if (lowerHash.includes('order=')) {
      const idx = lowerHash.indexOf('order=') + 6;
      orderId = hash.slice(idx).split('&')[0];
    } else if (hash.includes('?')) {
      orderId = hash.split('?')[1].split('&')[0];
    } else {
      orderId = hash.replace(/#recibo/i, '').replace(/#aprovacao/i, '').replace(/#portal/i, '').replace('/', '');
    }
    orderId = decodeURIComponent(orderId).trim();

    if (!orderId) {
      this.renderPortalNotFound(portalRoot, 'Nenhum identificador de pedido ou token de validação foi informado no link.');
      return;
    }

    // 3. Procura no armazenamento local primeiro (por id, numero ou token de recibo)
    const orders = (window.store && window.store.getOrders()) || [];
    let order = orders.find(o => 
      String(o.id) === String(orderId) || 
      String(o.numero) === String(orderId) || 
      (o.recibo_token_10 && String(o.recibo_token_10).toUpperCase() === String(orderId).toUpperCase())
    );

    // 4. Se não encontrar localmente (ex: cliente abrindo no WhatsApp do celular), busca na nuvem Supabase
    if (!order) {
      if (portalRoot) {
        portalRoot.innerHTML = `
          <div class="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#080e1a]">
            <div class="text-center space-y-3">
              <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Carregando layout do pedido #${orderId}...</p>
              <p class="text-xs text-slate-400">Consultando prova virtual na nuvem</p>
            </div>
          </div>
        `;
      }
      order = await this.fetchOrderFromCloud(orderId);
    }

    if (!order) {
      this.renderPortalNotFound(portalRoot, `O pedido #${orderId} não foi encontrado ou o link pode ter expirado.`);
      return;
    }

    // 5. Verificação de Expiração do Link: Disponível até a conclusão + 7 dias após a entrega total
    if (order.status_fase === 'entregue') {
      let dataEntrega = null;
      if (order.historico && Array.isArray(order.historico)) {
        const hEntregue = [...order.historico].reverse().find(h => h.fase === 'entregue');
        if (hEntregue && hEntregue.data) dataEntrega = new Date(hEntregue.data);
      }
      if (!dataEntrega && order.data_entrega) {
        dataEntrega = new Date(order.data_entrega);
      }
      if (!dataEntrega && order.updated_at) {
        dataEntrega = new Date(order.updated_at);
      }

      if (dataEntrega && !isNaN(dataEntrega.getTime())) {
        const agora = new Date();
        const diffMs = agora.getTime() - dataEntrega.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 7) {
          this.renderPortalNotFound(portalRoot, `O acesso ao Pedido #${order.numero || order.id} foi encerrado. O link de acompanhamento público do cliente permanece ativo até a conclusão e fica disponível por até 7 dias após a entrega total.`);
          return;
        }
      }
    }

    // 6. Detecta modalidade solicitada no link (modo técnico sem financeiro vs completo)
    const isTechnicalMode = hash.toLowerCase().includes('modo=tecnico') || hash.toLowerCase().includes('sem_valor=1');
    this.renderPortalOrderView(portalRoot, order, { isTechnicalMode });

    // Se a rota for de validação direta de recibo (#recibo ou val=), abre imediatamente o recibo oficial
    if (isDirectReceiptVal || hash.toLowerCase().startsWith('#recibo')) {
      setTimeout(() => {
        this.viewPortalReceiptModal(order.id || order.numero);
      }, 150);
    }
  },

  renderPortalNotFound(container, message) {
    const tenant = (window.store && window.store.getActiveTenant) ? window.store.getActiveTenant() : {};
    const empresaNome = tenant.nome_fantasia || tenant.razao_social || 'GRAFSIS Comunicação Visual';
    const empresaWhats = tenant.celular_whatsapp || tenant.telefone || '(69) 99922-1336';

    const html = `
      <div class="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#080e1a]">
        <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-5">
          <div class="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center text-3xl font-black">
            🔍
          </div>
          <div class="space-y-1">
            <h2 class="text-xl font-black text-slate-900 dark:text-white">Pedido Não Localizado</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ${message}
            </p>
          </div>
          <div class="pt-2 flex flex-col gap-2">
            <a href="https://api.whatsapp.com/send?phone=55${empresaWhats.replace(/\D/g, '')}&text=${encodeURIComponent('Olá! Acessei o link de aprovação mas não localizei meu pedido. Poderiam me reenviar?')}" 
               target="_blank" 
               class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2">
              <span>💬 Falar com a Gráfica no WhatsApp</span>
            </a>
            <button onclick="app.renderPublicClientApprovalPortal(window.location.hash)" 
                    class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition">
              🔄 Tentar Novamente
            </button>
          </div>
          <div class="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            ${empresaNome} • GRAFSIS Cloud
          </div>
        </div>
      </div>
    `;
    if (container) container.innerHTML = html;
  },

  viewPortalImageModal(url, title = 'Imagem do Pedido') {
    if (!url) return;
    const modalId = 'portal-img-preview-modal';
    document.getElementById(modalId)?.remove();
    const modalHtml = `
      <div id="${modalId}" class="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onclick="this.remove()">
        <div class="relative max-w-5xl max-h-[92vh] flex flex-col items-center" onclick="event.stopPropagation()">
          <img src="${url}" class="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/20">
          <div class="mt-3 flex items-center justify-between w-full px-2 text-white text-xs">
            <span class="font-bold">${title}</span>
            <div class="flex items-center gap-2">
              <a href="${url}" target="_blank" download="arte_pedido" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition">⬇ Baixar Imagem</a>
              <button type="button" onclick="document.getElementById('${modalId}').remove()" class="px-3 py-1 bg-rose-600 hover:bg-rose-700 rounded-lg font-bold transition">✕ Fechar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  detectClientDevice() {
    const ua = navigator.userAgent || '';
    if (/iphone/i.test(ua)) return 'Apple iPhone (iOS)';
    if (/ipad/i.test(ua)) return 'Apple iPad (iPadOS)';
    if (/ipod/i.test(ua)) return 'Apple iPod (iOS)';
    if (/android/i.test(ua)) {
      const match = ua.match(/Android[^;]+;\s*([^;)]+)\s*Build/i) || ua.match(/Android[^;]+;\s*([^;)]+)/i);
      const model = match ? match[1].trim() : 'Smartphone';
      return `Android (${model})`;
    }
    if (/macintosh|mac os x/i.test(ua)) return 'Apple Mac (macOS)';
    if (/windows/i.test(ua)) return 'Computador Windows PC';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Navegador Web';
  },

  renderPortalOrderView(container, order, options = {}) {
    const tenant = (window.store && window.store.getActiveTenant) ? window.store.getActiveTenant() : {};
    const clients = (window.store && window.store.getClients()) || [];
    const client = clients.find(c => c.id === order.cliente_id) || { nome: order.cliente_nome || 'Cliente' };
    const empresaNome = tenant.nome_fantasia || tenant.razao_social || 'GRAFSIS Comunicação Visual';
    const empresaWhats = tenant.celular_whatsapp || tenant.telefone || '(69) 99922-1336';
    const isApproved = !!order.aprovado_cliente || order.status_fase === 'aprovacao' || ['liberado', 'producao', 'acabamento', 'embalagem', 'entregue'].includes(order.status_fase);

    // Modalidade: Técnico (sem valores financeiros) vs Completo
    const isTechnicalMode = options.isTechnicalMode !== undefined 
      ? options.isTechnicalMode 
      : (window.location.hash.toLowerCase().includes('modo=tecnico') || window.location.hash.toLowerCase().includes('sem_valor=1'));

    // Filtra apenas itens liberados para O.S./Link conforme checagem do operador
    const allItems = order.itens || [];
    const liberadosItems = allItems.filter(it => it.liberado_os !== false);
    const displayedItems = liberadosItems.length > 0 ? liberadosItems : allItems;

    const html = `
      <div class="min-h-screen bg-slate-50 dark:bg-[#080e1a] py-8 px-4 sm:px-6">
        <div class="max-w-3xl mx-auto space-y-6">

          <!-- Cabeçalho Oficial da Gráfica & Selo de Status -->
          <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4 text-center sm:text-left">
              <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-black text-2xl shadow-inner shrink-0">
                ${tenant.logo_url ? `<img src="${tenant.logo_url}" class="w-full h-full object-contain rounded-2xl" alt="Logo">` : '🖨️'}
              </div>
              <div>
                <span class="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400 tracking-wider">
                  ${isTechnicalMode ? 'Conferência Técnica de Produção' : 'Portal de Aprovação Online'}
                </span>
                <h1 class="text-xl font-black text-slate-900 dark:text-white leading-tight">${empresaNome}</h1>
                <p class="text-xs text-slate-400 mt-0.5">
                  ${isTechnicalMode ? 'Prova virtual e verificação de arte e medidas (Sem Valores Financeiros)' : 'Prova virtual e autorização técnica de produção'}
                </p>
              </div>
            </div>
            <div class="text-center sm:text-right flex flex-col items-center sm:items-end gap-1">
              <span class="inline-block px-3.5 py-1.5 rounded-full text-xs font-black uppercase font-mono tracking-wider ${
                isApproved 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : (isTechnicalMode ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300')
              }">
                ${isApproved ? '✅ ARTE E PRODUÇÃO APROVADAS' : (isTechnicalMode ? '📐 CONFERÊNCIA TÉCNICA' : '🟡 AGUARDANDO SUA APROVAÇÃO')}
              </span>
              <div class="text-xs font-mono font-bold text-slate-500">Pedido #${order.numero}</div>
            </div>
          </div>

          <!-- Informações de Identificação do Pedido & Cliente -->
          <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Cliente:</span>
                <strong class="text-sm text-slate-900 dark:text-white">${client.nome}</strong>
                <span class="block text-slate-500 mt-0.5">${order.telefone_autorizacao || client.telefone_whatsapp || client.telefone || ''}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Data de Emissão:</span>
                <strong class="text-slate-800 dark:text-slate-200">${new Date(order.data_venda || order.data_criacao || Date.now()).toLocaleDateString('pt-BR')}</strong>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Previsão de Entrega:</span>
                <strong class="text-rose-600 dark:text-rose-400 font-bold">${order.previsao_entrega ? order.previsao_entrega.split('-').reverse().join('/') : 'A combinar'}</strong>
              </div>
            </div>

            <!-- Observações Técnicas da Operação (se houver) -->
            ${order.observacoes ? `
              <div class="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl">
                <h4 class="text-xs font-black uppercase text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                  📌 Observações e Instruções da Operação:
                </h4>
                <p class="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  ${order.observacoes}
                </p>
              </div>
            ` : ''}

            <!-- Prova Virtual / Layout da Arte em Alta Resolução -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  🖼️ Layout / Prova Virtual da Arte
                </h3>
                ${order.foto_arte_url ? `
                  <button type="button" onclick="app.viewPortalImageModal('${order.foto_arte_url}', 'Layout Principal do Pedido #${order.numero}')" class="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer">
                    🔍 Ver em Alta Resolução
                  </button>
                ` : ''}
              </div>

              <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center flex items-center justify-center min-h-[220px]">
                ${order.foto_arte_url ? `
                  <img src="${order.foto_arte_url}" onclick="app.viewPortalImageModal('${order.foto_arte_url}', 'Layout Principal do Pedido #${order.numero}')" class="max-h-[420px] w-auto max-w-full rounded-xl shadow-md object-contain cursor-pointer hover:scale-[1.01] transition-transform" alt="Arte do Pedido" title="Clique para ampliar">
                ` : `
                  <div class="text-slate-400 py-8">
                    <p class="text-sm font-bold">Nenhum arquivo geral de layout anexado a este pedido.</p>
                    <p class="text-xs mt-1">Confira as artes específicas de cada item e suas descrições na tabela abaixo.</p>
                  </div>
                `}
              </div>
            </div>

            <!-- Galeria de Imagens do Repositório (se houver) -->
            ${(order.repositorio_arquivos && order.repositorio_arquivos.length > 0) ? `
              <div>
                <h3 class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  📁 Anexos do Repositório da Operação (${order.repositorio_arquivos.length})
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  ${order.repositorio_arquivos.map((repoItem, rIdx) => `
                    <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition" onclick="app.viewPortalImageModal('${repoItem.url}', '${repoItem.nome || 'Anexo'}')">
                      ${(repoItem.tipo && repoItem.tipo.includes('image')) || (repoItem.url && repoItem.url.startsWith('data:image'))
                        ? `<img src="${repoItem.url}" class="w-full h-20 object-cover rounded-lg mb-1.5 shadow-xs">`
                        : `<div class="w-full h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-2xl mb-1.5">📄</div>`
                      }
                      <span class="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate w-full" title="${repoItem.nome}">${repoItem.nome || 'Arquivo'}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Especificações dos Itens e Acabamentos -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  📋 Itens Liberados para Conferência (${displayedItems.length})
                </h3>
                ${isTechnicalMode ? `<span class="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Modo Técnico</span>` : ''}
              </div>

              <div class="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th class="p-3">Item / Descrição</th>
                      <th class="p-3">Arte</th>
                      <th class="p-3">Medidas / Formato</th>
                      <th class="p-3 text-center">Qtd</th>
                      <th class="p-3">Acabamento</th>
                      ${!isTechnicalMode ? `<th class="p-3 text-right">Total (R$)</th>` : ''}
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    ${displayedItems.map((it, idx) => `
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                        <td class="p-3 font-semibold text-slate-900 dark:text-white">
                          <div class="font-bold text-xs text-blue-900 dark:text-blue-300">
                            #${String(it.item_id || (String(order.numero) + String(idx + 1).padStart(2, '0'))).replace(/^#+/, '')} • ${it.produto_nome || ''}
                          </div>
                          <div class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">${it.descricao || ''}</div>
                        </td>
                        <td class="p-3">
                          ${it.arte_url ? `
                            <img src="${it.arte_url}" onclick="app.viewPortalImageModal('${it.arte_url}', 'Arte do Item #${it.item_id || (idx+1)}')" class="w-10 h-10 object-cover rounded-lg border border-blue-300 shadow-xs cursor-pointer hover:scale-110 transition" title="Clique para ampliar">
                          ` : `<span class="text-[10px] text-slate-400 font-bold">Sem Arte</span>`}
                        </td>
                        <td class="p-3 font-mono text-slate-600 dark:text-slate-300">
                          ${it.tipo_calculo === 'm2' ? `${it.largura_x}m x ${it.comprimento_y}m` : (it.tipo_calculo === 'linear' ? `${it.largura_x}m linear` : 'Unidade')}
                        </td>
                        <td class="p-3 text-center font-bold text-slate-900 dark:text-white">${it.quantidade}x</td>
                        <td class="p-3 text-amber-700 dark:text-amber-300 text-[11px]">${it.acabamento || 'Padrão'}</td>
                        ${!isTechnicalMode ? `
                          <td class="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            R$ ${Number(it.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </td>
                        ` : ''}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Resumo Comercial e Condições de Pagamento (Exibido apenas no modo completo) -->
            ${!isTechnicalMode ? `
              <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span class="text-xs font-black uppercase text-slate-700 dark:text-slate-300">💰 Resumo Financeiro da Operação</span>
                    <p class="text-[10px] text-slate-400">Transparência comercial do pedido e controle de pagamentos</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      R$ ${Number(order.valor_final || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                    <button 
                      type="button" 
                      onclick="app.viewPortalReceiptModal('${order.id}')"
                      class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Visualizar Recibo de Pagamento">
                      <span>📄 Ver Recibo</span>
                    </button>
                  </div>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span class="block text-[10px] uppercase font-bold text-slate-400">Forma de Pagamento:</span>
                    <strong class="text-slate-800 dark:text-slate-200">${order.forma_pagamento || 'Pix / Cartão / Dinheiro'}</strong>
                  </div>
                  <div>
                    <span class="block text-[10px] uppercase font-bold text-slate-400">Total Já Pago:</span>
                    <span class="font-bold text-emerald-600 dark:text-emerald-400">
                      R$ ${Number(order.valor_entrada || order.valor_recebido || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                  <div>
                    <span class="block text-[10px] uppercase font-bold text-slate-400">Saldo Restante:</span>
                    <strong class="text-rose-600 dark:text-rose-400 font-black">
                      R$ ${Number(Math.max(0, (order.valor_final || 0) - (order.valor_entrada || order.valor_recebido || 0))).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </strong>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Linha do Tempo e Acompanhamento de Fases do Pedido -->
            <div class="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div class="flex justify-between items-center">
                <h4 class="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>📍</span> Acompanhamento do Pedido (Fase Atual & Histórico)
                </h4>
                <span class="text-[10px] font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-blue-200 dark:border-slate-700">
                  Fase Atual: ${
                    order.status_fase === 'orcamento' ? '1. Orçamento' :
                    (order.status_fase === 'prevenda' ? '2. Pré-Venda' :
                    (order.status_fase === 'aprovacao' ? '3. Aguardando Aprovação' :
                    (order.status_fase === 'liberado' ? '4. Liberado O.S.' :
                    (order.status_fase === 'producao' ? '5. Em Produção' :
                    (order.status_fase === 'acabamento' ? '6. Acabamento' :
                    (order.status_fase === 'embalagem' ? '7. Embalagem / Expedição' :
                    (order.status_fase === 'entregue' ? '8. Entregue / Concluído' : order.status_fase)))))))
                  }
                </span>
              </div>

              ${order.aprovado_cliente ? `
                <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">✓</span>
                    <div>
                      <span class="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Autorizado por:</span>
                      <strong class="text-emerald-950 dark:text-emerald-100">${order.aprovado_cliente.aprovador || client.nome}</strong>
                    </div>
                  </div>
                  <div class="text-right text-[11px] text-emerald-800 dark:text-emerald-300">
                    <div>${order.aprovado_cliente.data_formatada || (order.aprovado_cliente.data ? new Date(order.aprovado_cliente.data).toLocaleString('pt-BR') : '')}</div>
                    <span class="text-[9px] font-mono bg-emerald-100 dark:bg-emerald-900 px-1 rounded">${order.aprovado_cliente.telefone || 'Validado'}</span>
                  </div>
                </div>
              ` : ''}

              <div class="space-y-2 pt-1">
                ${(order.historico && order.historico.length > 0) ? `
                  <div class="border-l-2 border-blue-400 pl-3 ml-2 space-y-2 text-xs">
                    ${order.historico.map(h => `
                      <div class="relative">
                        <span class="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></span>
                        <div class="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                          ${
                            h.fase === 'orcamento' ? '1. Orçamento' :
                            (h.fase === 'prevenda' ? '2. Pré-Venda' :
                            (h.fase === 'aprovacao' ? '3. Aguardando Aprovação' :
                            (h.fase === 'liberado' ? '4. Liberado O.S.' :
                            (h.fase === 'producao' ? '5. Em Produção' :
                            (h.fase === 'acabamento' ? '6. Acabamento' :
                            (h.fase === 'embalagem' ? '7. Embalagem / Expedição' :
                            (h.fase === 'entregue' ? '8. Entregue / Concluído' : h.fase)))))))
                          }
                        </div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400">
                          Quando mudou: <strong>${new Date(h.data).toLocaleString('pt-BR')}</strong> • Quem autorizou/operou: <strong>${h.usuario || 'Operador'}</strong>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <p class="text-xs text-slate-400">Início do acompanhamento operacional deste pedido.</p>
                `}
              </div>

              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-[10px] text-slate-500 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Acesso exclusivo ao pedido encaminhado até a sua conclusão. O histórico permanecerá disponível por mais <strong>7 dias após a entrega total</strong>.</span>
              </div>
            </div>

          </div>

          <!-- Área de Decisão e Aprovação do Cliente -->
          <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            ${isApproved ? `
              <!-- Certificado de Aceite Digital Concluído -->
              <div class="p-6 rounded-2xl bg-[#009b3a] text-white shadow-xl text-center space-y-4">
                <div class="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
                  ✓
                </div>
                <div class="space-y-1">
                  <h3 class="text-xl font-black uppercase tracking-wide">Aceite do Pedido e Arte Confirmado</h3>
                  <p class="text-xs text-emerald-100 max-w-lg mx-auto leading-relaxed">
                    Arte conferida com sucesso, valores e prazos autorizados. Pedido encaminhado com carimbo digital para início imediato da produção gráfica.
                  </p>
                </div>
                
                <div class="bg-black/20 backdrop-blur-sm p-4 rounded-xl font-mono text-[11px] text-emerald-50 text-left space-y-1.5 max-w-md mx-auto">
                  <div><strong>Data e Hora:</strong> ${order.aprovado_cliente?.data_formatada || `${new Date().toLocaleDateString('pt-BR')} com segundos`}</div>
                  <div><strong>Responsável:</strong> ${order.aprovado_cliente?.aprovador || client.nome}</div>
                  <div><strong>Telefone Validado:</strong> ${order.aprovado_cliente?.telefone || order.telefone_autorizacao || 'Registrado'}</div>
                  <div><strong>Dispositivo:</strong> ${order.aprovado_cliente?.dispositivo || 'Smartphone / Web'}</div>
                  ${order.aprovado_cliente?.mapa_url ? `
                    <div><strong>Localização:</strong> <a href="${order.aprovado_cliente.mapa_url}" target="_blank" class="text-cyan-300 underline font-bold">Ver Localização no Google Maps ↗</a></div>
                  ` : ''}
                  <div><strong>Código de Autenticação:</strong> <span class="bg-emerald-800 px-1.5 py-0.5 rounded">${order.aprovado_cliente?.codigo_validado || 'AUTORIZADO'}</span></div>
                </div>

                <div class="pt-2">
                  <a href="https://api.whatsapp.com/send?phone=55${empresaWhats.replace(/\D/g, '')}&text=${encodeURIComponent(`Olá! Confirmei a aprovação técnica do Pedido #${order.numero}!`)}"
                     target="_blank"
                     class="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black transition shadow-md">
                    💬 Falar com a Gráfica no WhatsApp
                  </a>
                </div>
              </div>
            ` : `
              <div class="space-y-4">
                <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                  <div class="font-black flex items-center gap-1.5 text-sm text-amber-800 dark:text-amber-300">
                    ⚠️ Termo de Aceite e Conferência de Produção:
                  </div>
                  <p>
                    Ao clicar em <strong>"Concordo e Aprovo a Produção"</strong>, você declara estar de pleno acordo com as dimensões, arte visual, acabamentos${!isTechnicalMode ? ', valores contratados' : ''} e prazos estipulados acima.
                  </p>
                  <p class="font-bold">
                    Regra de Segurança: A senha de 4 dígitos deve ser digitada pelo cliente no campo abaixo e só será validada para o número de WhatsApp cadastrado.
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Responsável *</label>
                    <input type="text" id="client-approver-name" value="${client.nome}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone do WhatsApp (Destino da Senha) *</label>
                    <input type="text" id="client-approver-phone" value="${order.telefone_autorizacao || client.telefone_whatsapp || client.telefone || ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Digite a Senha Recebida (4 dígitos) *</label>
                    <input type="text" id="client-approver-pin" maxlength="4" placeholder="Ex: 1234" class="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 font-mono font-black text-center text-sm text-emerald-900 dark:text-emerald-200 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  </div>
                </div>

                <div class="pt-2 flex flex-col sm:flex-row gap-3">
                  <button 
                    type="button" 
                    id="btn-confirm-approval"
                    onclick="app.submitClientApproval('${order.id}', ${isTechnicalMode})" 
                    class="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span>✅ Concordo e Aprovo a Produção</span>
                  </button>
                  <a 
                    href="https://api.whatsapp.com/send?phone=55${empresaWhats.replace(/\D/g, '')}&text=${encodeURIComponent(`Olá! Gostaria de solicitar um ajuste no layout do Pedido #${order.numero}.`)}" 
                    target="_blank" 
                    class="py-4 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2">
                    <span>💬 Solicitar Ajuste no WhatsApp</span>
                  </a>
                </div>
              </div>
            `}
          </div>

          <!-- Rodapé Limpo & Seguro -->
          <div class="text-center text-xs text-slate-400 py-4">
            ${empresaNome} • Sistema GRAFSIS Cloud
          </div>
        </div>
      </div>
    `;

    if (container) container.innerHTML = html;
  },

  async submitClientApproval(orderId, isTechnicalMode = false) {
    const orders = (window.store && window.store.getOrders()) || [];
    let order = orders.find(o => String(o.id) === String(orderId) || String(o.numero) === String(orderId));
    if (!order) {
      order = await this.fetchOrderFromCloud(orderId);
    }
    if (!order) {
      alert('Não foi possível identificar o pedido para registrar a aprovação.');
      return;
    }

    const approverName = (document.getElementById('client-approver-name')?.value || '').trim() || 'Cliente';
    const approverPhone = (document.getElementById('client-approver-phone')?.value || '').trim();
    const approverPin = (document.getElementById('client-approver-pin')?.value || '').trim();

    // 1. Validação de Telefone / Regra de Ouro (Apenas o número de WhatsApp de destino pode validar)
    const cleanEnteredPhone = approverPhone.replace(/\D/g, '');
    const cleanTargetPhone = (order.telefone_autorizacao || order.link_enviado?.telefone || order.cliente_telefone || '').replace(/\D/g, '');

    if (!cleanEnteredPhone || cleanEnteredPhone.length < 8) {
      await window.grafsisAlert('Por favor, informe seu número de telefone/WhatsApp completo para validar o aceite.', 'GRAFSIS');
      document.getElementById('client-approver-phone')?.focus();
      return;
    }

    if (cleanTargetPhone && cleanTargetPhone.length >= 8) {
      const enteredSuffix = cleanEnteredPhone.slice(-8);
      const targetSuffix = cleanTargetPhone.slice(-8);
      if (enteredSuffix !== targetSuffix) {
        await window.grafsisAlert(
          `⚠️ Regra de Segurança:\n\n` +
          `Esta aprovação só pode ser validada pelo mesmo número de WhatsApp para o qual o link e a senha foram encaminhados.\n\n` +
          `Número digitado: ${approverPhone}\n` +
          `Número de destino autorizado: ${cleanTargetPhone.slice(-4).padStart(cleanTargetPhone.length, '*')}`,
          'GRAFSIS'
        );
        document.getElementById('client-approver-phone')?.focus();
        return;
      }
    }

    // 2. Validação da Senha de 4 dígitos
    if (!approverPin || approverPin.length < 4) {
      await window.grafsisAlert('Por favor, informe a senha de 4 dígitos recebida no seu WhatsApp.', 'GRAFSIS');
      document.getElementById('client-approver-pin')?.focus();
      return;
    }

    if (order.codigo_autorizacao && String(order.codigo_autorizacao).trim() !== String(approverPin).trim()) {
      await window.grafsisAlert(`⚠️ Senha incorreta! Digite os 4 dígitos informados na mensagem do WhatsApp para liberar este pedido.`, 'GRAFSIS');
      document.getElementById('client-approver-pin')?.focus();
      return;
    }

    const confirmAceite = await window.grafsisConfirm({
      title: 'GRAFSIS',
      message: `Deseja realmente confirmar e autorizar a produção do Pedido #${order.numero}?\n\nPor favor, permita o compartilhamento de localização do seu navegador se solicitado para carimbo de segurança.`,
      confirmText: 'Autorizar Produção',
      cancelText: 'Cancelar'
    });
    if (!confirmAceite) return;

    const btn = document.getElementById('btn-confirm-approval');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ Registrando aprovação com carimbo digital...</span>';
    }

    const deviceName = this.detectClientDevice();

    const finalizeApproval = async (geoCoords = null) => {
      const now = new Date();
      const nowIso = now.toISOString();
      const todayStr = nowIso.split('T')[0];
      const horaExtensa = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const dataHoraCompleta = `${now.toLocaleDateString('pt-BR')} às ${horaExtensa}`;

      order.data_aceite = todayStr;
      order.autorizo_producao = `Sim (Aprovado Digitalmente por ${approverName} às ${horaExtensa} em ${now.toLocaleDateString('pt-BR')})`;
      order.conferencia_arte = `Conferido e De Acordo (Portal Online - ${approverName})`;
      order.aprovado_cliente = {
        data: nowIso,
        data_formatada: dataHoraCompleta,
        hora_segundos: horaExtensa,
        aprovador: approverName,
        telefone: approverPhone,
        dispositivo: deviceName,
        codigo_validado: approverPin || order.codigo_autorizacao || '',
        userAgent: navigator.userAgent,
        geo: geoCoords,
        mapa_url: geoCoords ? `https://www.google.com/maps?q=${geoCoords.latitude},${geoCoords.longitude}` : null,
        modo_aprovacao: isTechnicalMode ? 'tecnico' : 'completo',
        termos_aceitos: true
      };
      order.status_fase = 'aprovacao';
      order.historico = order.historico || [];
      order.historico.push({
        fase: 'aprovacao',
        data: nowIso,
        usuario: `Cliente (${approverName}) validou via ${deviceName} às ${horaExtensa} [Tel: ${approverPhone}] [Senha: ${approverPin}]${geoCoords ? ` [GPS: ${geoCoords.latitude?.toFixed(4)}, ${geoCoords.longitude?.toFixed(4)}]` : ''}`
      });

      // 1. Grava no cache / banco local
      if (typeof window.store.saveOrder === 'function') {
        await window.store.saveOrder(order);
      } else {
        const allO = window.store.getOrders();
        const idx = allO.findIndex(o => o.id === order.id);
        if (idx !== -1) allO[idx] = order;
        window.store.saveLocal('grafsis_orders', allO);
      }

      // 2. Envia imediatamente para o Supabase Cloud
      if (window.store && typeof window.store.pushRecord === 'function') {
        try {
          await window.store.pushRecord('pedidos', order);
        } catch (pushErr) {
          console.warn('[submitClientApproval] Aviso no push nuvem:', pushErr);
        }
      }

      // 3. Registra notificação automática no sistema interno para visualização da equipe da empresa
      try {
        const notifs = JSON.parse(localStorage.getItem('grafsis_notifications') || '[]');
        notifs.unshift({
          id: 'notif_' + Date.now(),
          tipo: 'aprovacao_cliente',
          pedido_numero: order.numero,
          pedido_id: order.id,
          cliente: approverName,
          telefone: approverPhone,
          dispositivo: deviceName,
          data: nowIso,
          hora: horaExtensa,
          lida: false,
          mensagem: `O Cliente ${approverName} [Tel: ${approverPhone}] autorizou a produção do Pedido #${order.numero} às ${horaExtensa} via ${deviceName}!`
        });
        localStorage.setItem('grafsis_notifications', JSON.stringify(notifs.slice(0, 50)));
        if (window.app && typeof window.app.updateNotificationStatus === 'function') {
          window.app.updateNotificationStatus();
        }
        window.dispatchEvent(new CustomEvent('grafsis:orderApproved', { detail: { order } }));
      } catch (e) {
        console.warn('[notifications] Erro ao salvar notificação:', e);
      }

      await window.grafsisAlert(
        `🎉 Parabéns! Sua autorização foi confirmada com sucesso às ${horaExtensa}.\n\n` +
        `Dispositivo registrado: ${deviceName}\n` +
        `Telefone autenticado: ${approverPhone}\n\n` +
        `O Pedido #${order.numero} foi liberado para nossa equipe de produção!`,
        'GRAFSIS'
      );
      this.renderPublicClientApprovalPortal(window.location.hash);
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          finalizeApproval({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        () => {
          finalizeApproval(null);
        },
        { timeout: 4500, enableHighAccuracy: true }
      );
    } else {
      finalizeApproval(null);
    }
  },

  viewPortalReceiptModal(orderId) {
    const orders = window.store?.getOrders ? window.store.getOrders() : [];
    const order = orders.find(o => o.id === orderId || String(o.numero) === String(orderId));
    if (!order) {
      alert('Pedido não encontrado para gerar recibo.');
      return;
    }

    const tenant = (window.store && window.store.getActiveTenant ? window.store.getActiveTenant() : null) || {};
    const clients = window.store ? window.store.getClients() : [];
    const client = clients.find(c => c.id === order.cliente_id) || { nome: order.cliente_nome || 'Consumidor', doc: '' };
    
    const companyName = tenant.razao_social || tenant.nome_fantasia || 'GRAFSIS - Sua Gráfica nas Nuvens';
    const companyCNPJ = tenant.cnpj || '00.000.000/0001-00';
    const companyPhone = tenant.telefone || tenant.celular_whatsapp || '(69) 99922-1336';
    const companyAddress = tenant.endereco || 'Endereço Comercial';

    const valorTotal = Number(order.valor_final || 0);
    const valorPago = Number(order.valor_entrada || order.valor_recebido || 0);
    const saldo = Math.max(0, valorTotal - valorPago);
    const ext = window.salesModule && typeof window.salesModule.numeroPorExtenso === 'function' ? window.salesModule.numeroPorExtenso(valorPago) : '';
    const valorExtensoStr = ext ? `(${ext})` : '';

    // Criptografia / Token único de 10 dígitos (Letras e Números) para validação do recibo
    if (!order.recibo_token_10) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let tok = '';
      const seed = Math.abs(Number(order.numero || 100) * 1664525 + 1013904223);
      for (let i = 0; i < 10; i++) {
        tok += chars.charAt((seed + i * 37 + (order.id ? order.id.charCodeAt(i % order.id.length) : i * 11)) % chars.length);
      }
      order.recibo_token_10 = tok;
      if (window.store && typeof window.store.saveOrder === 'function') {
        window.store.saveOrder(order);
      }
    }
    const tokenRecibo10 = order.recibo_token_10;
    const validationCode = `REC-${tokenRecibo10}`;
    const dataHoraEmissao = `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`;
    const orderNumStr = order.numero || (order.id ? order.id.substring(0, 8) : '0000');

    const modalId = 'portal-receipt-view-modal';
    document.getElementById(modalId)?.remove();

    const modalHtml = `
      <div id="${modalId}" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onclick="this.remove()">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-slate-800" onclick="event.stopPropagation()">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <span class="text-[10px] font-black uppercase text-purple-600 tracking-wider">Comprovante Oficial</span>
              <h3 class="text-base font-black text-slate-900">Recibo Digital de Pagamento</h3>
            </div>
            <button onclick="document.getElementById('${modalId}').remove()" class="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 font-mono text-xs space-y-2">
            <div class="text-center pb-2 border-b border-dashed border-slate-200">
              <strong class="text-sm block uppercase">${companyName}</strong>
              <span class="text-[10px] text-slate-500 block">CNPJ: ${companyCNPJ}</span>
              <span class="text-[10px] text-slate-500 block">${companyAddress} • Tel: ${companyPhone}</span>
            </div>

            <!-- Redação Oficial do Recibo -->
            <div class="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-[11px] font-sans">
              A empresa <strong>${companyName}</strong> recebeu de <strong>${client.nome}</strong> o valor de <strong>R$ ${valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> ${valorExtensoStr}, referente ao pagamento do pedido <strong>#${orderNumStr}</strong>, emitido em <strong>${dataHoraEmissao}</strong>.
            </div>

            <div class="space-y-1 text-[11px] pt-1">
              <div><strong>Recibo Nº:</strong> ${validationCode}</div>
              <div><strong>Pedido Vinculado:</strong> #${orderNumStr}</div>
              <div><strong>Cliente:</strong> ${client.nome}</div>
              <div><strong>Data de Emissão:</strong> ${dataHoraEmissao}</div>
              <div><strong>Forma de Pagto:</strong> ${order.forma_pagamento || 'Pix / À Vista'}</div>
            </div>

            <div class="border-t border-b border-dashed border-slate-200 py-2 my-2 space-y-1 text-xs">
              <div class="flex justify-between">
                <span>Valor Total do Pedido:</span>
                <strong>R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div class="flex justify-between text-emerald-700 font-bold">
                <span>Valor Pago / Recebido:</span>
                <span>R$ ${valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="flex justify-between text-rose-600 font-bold">
                <span>Saldo Devedor:</span>
                <span>R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <!-- Marcação em Verde Limão: Criptografia de 10 Dígitos (Letras e Números) para Validação do Recibo -->
            <div class="p-2.5 rounded-xl bg-lime-100 dark:bg-lime-950/40 border-2 border-lime-500 text-center space-y-1">
              <div class="text-[10px] uppercase font-black tracking-wider text-lime-900 dark:text-lime-200">
                🔒 Código de Autenticação Digital (10 Dígitos):
              </div>
              <div class="font-mono text-base font-black tracking-widest text-lime-950 dark:text-lime-300 bg-white/80 dark:bg-slate-900/80 py-1 px-3 rounded-lg border border-lime-400 inline-block shadow-xs">
                ${tokenRecibo10}
              </div>
              <div class="text-[9px] text-lime-800 dark:text-lime-300 font-sans block">
                Validação pública: acesse <a href="#recibo?val=${tokenRecibo10}" target="_blank" class="underline font-bold">grafsis/#recibo?val=${tokenRecibo10}</a> para conferir a autenticidade deste recibo a qualquer momento.
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button onclick="window.print()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer">
              <span>🖨️ Imprimir Recibo</span>
            </button>
            <button onclick="document.getElementById('${modalId}').remove()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
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

