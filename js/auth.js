/* ==============================================================================
   GRAFSIS - Módulo de Autenticação, Usuários & Controle de Acesso (RBAC)
   Perfis: ADMIN, GERENTE, VENDAS, PRODUCAO
   ============================================================================== */

// TEMPORÁRIO: libera todas as abas e ações para todos os perfis.
// Mude para false para reativar o controle de acesso por perfil.
const LIBERAR_TUDO = true;

const ROLES = {
  PROPRIETARIO: 'PROPRIETARIO',
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE',
  VENDAS: 'VENDAS',
  PRODUCAO: 'PRODUCAO'
};

const ROLE_PERMISSIONS = {
  ADMIN: {
    name: 'Administrador',
    level: 6,
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    tabs: ['production', 'sales', 'products', 'clients', 'suppliers', 'finance', 'settings', 'owner', 'selfservice'],
    canCreateOrders: true,
    canViewCosts: true,
    canEditPrices: true,
    canViewFinance: true,
    canManageSuppliers: true,
    canManageSettings: true,
    canManageUsers: true,
    canDeleteRecords: true
  },
  PROPRIETARIO: {
    name: 'Proprietário (Master)',
    level: 5,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    tabs: ['production', 'sales', 'products', 'clients', 'suppliers', 'finance', 'settings', 'owner', 'selfservice'],
    canCreateOrders: true,
    canViewCosts: true,
    canEditPrices: true,
    canViewFinance: true,
    canManageSuppliers: true,
    canManageSettings: true,
    canManageUsers: true,
    canDeleteRecords: true,
    canGivePatrocinio: true
  },
  GERENTE: {
    name: 'Gerente Geral',
    level: 4,
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    tabs: ['production', 'sales', 'products', 'clients', 'suppliers', 'finance', 'selfservice'],
    canCreateOrders: true,
    canViewCosts: true,
    canEditPrices: true,
    canViewFinance: true,
    canManageSuppliers: true,
    canManageSettings: false,
    canManageUsers: false,
    canDeleteRecords: true
  },
  VENDAS: {
    name: 'Comercial & Vendas',
    level: 3,
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    tabs: ['sales', 'production', 'products', 'clients'],
    canCreateOrders: true,
    canViewCosts: false,
    canEditPrices: false,
    canViewFinance: false,
    canManageSuppliers: false,
    canManageSettings: false,
    canManageUsers: false,
    canDeleteRecords: false
  },
  PRODUCAO: {
    name: 'Operador de Produção',
    level: 2,
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    tabs: ['production'],
    canCreateOrders: false,
    canViewCosts: false,
    canEditPrices: false,
    canViewFinance: false,
    canManageSuppliers: false,
    canManageSettings: false,
    canManageUsers: false,
    canDeleteRecords: false
  },
  EXTERNO: {
    name: 'Acesso Externo',
    level: 1,
    badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
    tabs: ['production'],
    canCreateOrders: false,
    canViewCosts: false,
    canEditPrices: false,
    canViewFinance: false,
    canManageSuppliers: false,
    canManageSettings: false,
    canManageUsers: false,
    canDeleteRecords: false
  }
};

const DEFAULT_USERS = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    login: 'admin',
    nome: 'Administrador do Sistema',
    senha: '1234',
    pin: '1234',
    role: ROLES.ADMIN,
    ativo: true,
    data_cadastro: '2026-01-01T00:00:00Z',
    data_ultimo_acesso: new Date().toISOString()
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    login: 'gerente',
    nome: 'Gerência Operacional',
    senha: '1234',
    pin: '1234',
    role: ROLES.GERENTE,
    ativo: true,
    data_cadastro: '2026-01-01T00:00:00Z',
    data_ultimo_acesso: null
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    login: 'vendas',
    nome: 'Equipe Comercial',
    senha: '1234',
    pin: '1234',
    role: ROLES.VENDAS,
    ativo: true,
    data_cadastro: '2026-01-01T00:00:00Z',
    data_ultimo_acesso: null
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    login: 'producao',
    nome: 'Oficina & Produção',
    senha: '1234',
    pin: '1234',
    role: ROLES.PRODUCAO,
    ativo: true,
    data_cadastro: '2026-01-01T00:00:00Z',
    data_ultimo_acesso: null
  }
];

class GrafsisAuth {
  constructor() {
    this.STORAGE_USERS_KEY = 'grafsis_users';
    this.STORAGE_SESSION_KEY = 'grafsis_current_user';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.STORAGE_USERS_KEY)) {
      localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
    if (!sessionStorage.getItem(this.STORAGE_SESSION_KEY)) {
      const users = this.getUsers();
      this.setCurrentUser(users[0] || DEFAULT_USERS[0]);
    }
  }

  getUsers() {
    try {
      const list = JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY) || '[]');
      return list.length ? list : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  saveUsersLocal(users) {
    localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));
  }

  getCurrentUser() {
    try {
      const user = JSON.parse(sessionStorage.getItem(this.STORAGE_SESSION_KEY));
      return user || DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  }

  setCurrentUser(user) {
    sessionStorage.setItem(this.STORAGE_SESSION_KEY, JSON.stringify(user));
  }

  getRolePermissions() {
    const user = this.getCurrentUser();
    return ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.PRODUCAO;
  }

  canAccess(tab) {
    if (LIBERAR_TUDO) return true;
    const permissions = this.getRolePermissions();
    return permissions.tabs.includes(tab);
  }

  can(action) {
    if (LIBERAR_TUDO) return true;
    const permissions = this.getRolePermissions();
    return !!permissions[action];
  }

  login(login, senhaOuPin) {
    const users = this.getUsers();
    const l = login.trim().toLowerCase();
    const s = senhaOuPin.trim();

    const found = users.find(u => 
      u.login.toLowerCase() === l && ((u.senha && u.senha === s) || (u.pin && u.pin === s))
    );

    if (found) {
      if (!found.ativo) {
        return { success: false, message: 'Usuário desativado. Contate o Administrador.' };
      }
      // Atualiza data do último acesso
      found.data_ultimo_acesso = new Date().toISOString();
      this.saveUser(found);
      this.setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Login ou Senha incorretos.' };
  }

  logout() {
    this.openLoginModal();
  }

  async saveUser(user) {
    const users = this.getUsers();
    if (!user.id) {
      user.id = typeof grafsisUUID === 'function' ? grafsisUUID() : 'usr-' + Date.now();
      user.data_cadastro = user.data_cadastro || new Date().toISOString();
      users.unshift(user);
    } else {
      const index = users.findIndex(u => u.id === user.id);
      if (index >= 0) users[index] = user;
      else users.unshift(user);
    }
    this.saveUsersLocal(users);

    // Sincroniza com Supabase se conectado
    if (window.store && window.store.supabaseClient) {
      try {
        await window.store.supabaseClient.from('usuarios').upsert({
          id: user.id,
          nome: user.nome,
          login: user.login,
          senha: user.senha || '1234',
          pin: user.pin || '1234',
          role: user.role,
          ativo: user.ativo,
          data_cadastro: user.data_cadastro,
          data_ultimo_acesso: user.data_ultimo_acesso
        });
      } catch (err) {
        console.warn('[Supabase] Falha ao sincronizar usuário:', err);
      }
    }
    return user;
  }

  async deleteUser(id) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== id);
    this.saveUsersLocal(users);

    if (window.store && window.store.supabaseClient) {
      try {
        await window.store.supabaseClient.from('usuarios').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Falha ao deletar usuário:', err);
      }
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'Usuário não encontrado.' };

    const curr = (user.senha || user.pin || '1234').trim();
    if (currentPassword.trim() !== curr) {
      return { success: false, message: 'A senha atual está incorreta.' };
    }

    user.senha = newPassword.trim();
    user.pin = newPassword.trim();
    await this.saveUser(user);
    this.setCurrentUser(user);
    return { success: true, message: 'Senha alterada com sucesso!' };
  }

  async syncUsersWithCloud(supabaseClient) {
    if (!supabaseClient) return;
    try {
      const { data, error } = await supabaseClient.from('usuarios').select('*');
      if (error) {
        console.warn('[Supabase] Erro ao sincronizar tabela usuarios:', error.message);
        return;
      }
      if (data && data.length) {
        const local = this.getUsers();
        const map = new Map();
        local.forEach(u => map.set(u.id, u));
        data.forEach(u => map.set(u.id, u));
        const merged = Array.from(map.values());
        this.saveUsersLocal(merged);
      }
    } catch (e) {
      console.warn('[Supabase] Erro ao carregar usuarios remotos:', e);
    }
  }

  openLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      const errEl = document.getElementById('auth-error');
      if (errEl) errEl.classList.add('hidden');
      const loginInp = document.getElementById('auth-login');
      if (loginInp) loginInp.focus();
    }
  }

  closeLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  submitLogin(e) {
    if (e) e.preventDefault();
    const login = document.getElementById('auth-login').value;
    const pin = document.getElementById('auth-pin').value;
    const result = this.login(login, pin);

    if (result.success) {
      this.closeLoginModal();
      window.app.updateUserHeader();
      const perms = this.getRolePermissions();
      if (!this.canAccess(window.app.currentTab)) {
        window.app.navigate(perms.tabs[0]);
      } else {
        window.app.navigate(window.app.currentTab);
      }
    } else {
      const errEl = document.getElementById('auth-error');
      if (errEl) {
        errEl.innerText = result.message;
        errEl.classList.remove('hidden');
      }
    }
  }

  quickSwitch(role) {
    const users = this.getUsers();
    const found = users.find(u => u.role === role);
    if (found) {
      found.data_ultimo_acesso = new Date().toISOString();
      this.saveUser(found);
      this.setCurrentUser(found);
      this.closeLoginModal();
      window.app.updateUserHeader();
      const perms = this.getRolePermissions();
      if (!this.canAccess(window.app.currentTab)) {
        window.app.navigate(perms.tabs[0]);
      } else {
        window.app.navigate(window.app.currentTab);
      }
    }
  }
}

window.authModule = new GrafsisAuth();



