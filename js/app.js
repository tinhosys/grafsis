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

    // Controle de visibilidade das abas no menu superior
    document.querySelectorAll('#nav-tabs-container .nav-link').forEach(link => {
      const tab = link.getAttribute('data-tab');
      if (window.authModule.canAccess(tab)) {
        link.classList.remove('hidden');
      } else {
        link.classList.add('hidden');
      }
    });

    // Controle de botões de ação do cabeçalho
    const btnNewOrder = document.getElementById('btn-header-new-order');
    if (btnNewOrder) {
      if (window.authModule.can('canCreateOrders')) {
        btnNewOrder.classList.remove('hidden');
      } else {
        btnNewOrder.classList.add('hidden');
      }
    }
  },

  navigate(tab) {
    if (!window.authModule.canAccess(tab)) {
      alert(`Acesso restrito: seu perfil (${window.authModule.getCurrentUser().role}) não possui permissão para acessar esta área.`);
      const perms = window.authModule.getRolePermissions();
      tab = perms.tabs[0];
    }

    this.currentTab = tab;
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-tab') === tab) {
        link.className = 'nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white shadow-sm';
      } else {
        link.className = 'nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition';
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
    }
  },

  renderSettings() {
    const isMasterAdmin = window.authModule.can('canManageSettings');
    const settings = window.store.getSettings();
    const users = window.authModule.getUsers();
    const container = document.getElementById('view-container');

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Painel de Configurações & Acessos</h1>
          <p class="text-slate-500 text-sm">Gerencie a conexão em nuvem, controle de usuários e backup do sistema</p>
        </div>

        ${isMasterAdmin ? `
        <!-- Conexão Supabase -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 5h16M4 12c0 2 1 3 3 3h10c2 0 3-1 3-3"></path></svg>
            Conexão Supabase (PostgreSQL Nuvem Grátis)
          </h2>
          <p class="text-xs text-slate-500">
            Projeto conectado ao Supabase Cloud. O script de banco está em <code>database/schema.sql</code>.
          </p>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Project URL</label>
            <input type="text" id="set-url" value="${settings.supabaseUrl || ''}" placeholder="https://exemplo.supabase.co" class="w-full px-3 py-2 border rounded-lg text-sm font-mono">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Anon / Public Key</label>
            <input type="password" id="set-key" value="${settings.supabaseKey || ''}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." class="w-full px-3 py-2 border rounded-lg text-sm font-mono">
          </div>
          <button onclick="app.saveSupabaseSettings()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition">
            Salvar Configurações de Conexão
          </button>
        </div>

        <!-- Gestão de Usuários e Perfis -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Controle de Acessos & Usuários da Equipe
              </h2>
              <p class="text-xs text-slate-500">Defina os operadores e seus níveis de acesso no sistema</p>
            </div>
            <button onclick="app.openUserModal()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">
              + Novo Usuário
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th class="p-2.5">Nome / Operador</th>
                  <th class="p-2.5">Login</th>
                  <th class="p-2.5">Perfil / Nível</th>
                  <th class="p-2.5">PIN</th>
                  <th class="p-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${users.map(u => `
                  <tr>
                    <td class="p-2.5 font-bold text-slate-800">${u.nome}</td>
                    <td class="p-2.5 font-mono text-slate-600">${u.login}</td>
                    <td class="p-2.5">
                      <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${ROLE_PERMISSIONS[u.role]?.badgeColor || ''}">
                        ${u.role}
                      </span>
                    </td>
                    <td class="p-2.5 font-mono text-slate-400">••••</td>
                    <td class="p-2.5 text-right">
                      ${u.login !== 'admin' ? `
                        <button onclick="app.deleteUser('${u.id}')" class="text-red-600 hover:text-red-800 font-semibold">Excluir</button>
                      ` : '<span class="text-slate-400 text-[10px]">Protegido</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : `
        <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
          <strong>Aviso:</strong> Apenas usuários com o perfil <strong>ADMIN</strong> podem alterar configurações de banco de dados e gerenciar usuários.
        </div>
        `}

        <!-- Backup e Exportação -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 class="text-base font-bold text-slate-800">Backup e Exportação dos Dados</h2>
          <p class="text-xs text-slate-500">Exporte ou restaure todos os seus clientes, pedidos, itens, fornecedores e financeiro em formato JSON seguro.</p>
          <div class="flex gap-3">
            <button onclick="window.store.exportData()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition">
              Baixar Backup Completo (.JSON)
            </button>
            ${isMasterAdmin ? `
              <input type="file" id="import-file" accept=".json" onchange="app.handleImport(this)" class="hidden">
              <button onclick="document.getElementById('import-file').click()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold border border-slate-300 transition">
                Restaurar Backup
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  openUserModal() {
    const nome = prompt('Nome completo do operador:');
    if (!nome) return;
    const login = prompt('Login de acesso (sem espaços):');
    if (!login) return;
    const pin = prompt('PIN / Senha de 4 dígitos:', '1234');
    if (!pin) return;
    const roleInput = prompt('Perfil de acesso (ADMIN, GERENTE, VENDAS, PRODUCAO):', 'VENDAS');
    const role = (roleInput || '').toUpperCase();
    if (!['ADMIN', 'GERENTE', 'VENDAS', 'PRODUCAO'].includes(role)) {
      alert('Perfil inválido! Escolha: ADMIN, GERENTE, VENDAS ou PRODUCAO');
      return;
    }

    const users = window.authModule.getUsers();
    users.push({
      id: 'usr-' + Date.now(),
      nome,
      login: login.trim().toLowerCase(),
      pin: pin.trim(),
      role,
      ativo: true
    });
    window.authModule.saveUsers(users);
    alert('Novo usuário cadastrado com sucesso!');
    this.renderSettings();
  },

  deleteUser(id) {
    if (!confirm('Deseja realmente remover este usuário da equipe?')) return;
    let users = window.authModule.getUsers();
    users = users.filter(u => u.id !== id);
    window.authModule.saveUsers(users);
    this.renderSettings();
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
    window.store.saveSettings({ supabaseUrl: url, supabaseKey: key });
    alert('Configurações do Supabase salvas com sucesso!');
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
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});