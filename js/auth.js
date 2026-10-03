/* ==============================================================================
   GRAFSIS - Módulo de Autenticação e Controle de Acesso (RBAC)
   Perfis: ADMIN, GERENTE, VENDAS, PRODUCAO
   ============================================================================== */

const ROLES = {
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE',
  VENDAS: 'VENDAS',
  PRODUCAO: 'PRODUCAO'
};

const ROLE_PERMISSIONS = {
  ADMIN: {
    name: 'Administrador',
    level: 4,
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    tabs: ['production', 'sales', 'products', 'clients', 'suppliers', 'finance', 'settings'],
    canCreateOrders: true,
    canViewCosts: true,
    canEditPrices: true,
    canViewFinance: true,
    canManageSuppliers: true,
    canManageSettings: true,
    canManageUsers: true,
    canDeleteRecords: true
  },
  GERENTE: {
    name: 'Gerente Geral',
    level: 3,
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    tabs: ['production', 'sales', 'products', 'clients', 'suppliers', 'finance'],
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
    level: 2,
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
    level: 1,
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
  }
};

const DEFAULT_USERS = [
  { id: 'usr-1', login: 'admin', nome: 'Administrador do Sistema', pin: '1234', role: ROLES.ADMIN, ativo: true },
  { id: 'usr-2', login: 'gerente', nome: 'Gerência Operacional', pin: '1234', role: ROLES.GERENTE, ativo: true },
  { id: 'usr-3', login: 'vendas', nome: 'Equipe Comercial', pin: '1234', role: ROLES.VENDAS, ativo: true },
  { id: 'usr-4', login: 'producao', nome: 'Oficina & Produção', pin: '1234', role: ROLES.PRODUCAO, ativo: true }
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
      return JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY) || '[]');
    } catch {
      return DEFAULT_USERS;
    }
  }

  saveUsers(users) {
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
    const permissions = this.getRolePermissions();
    return permissions.tabs.includes(tab);
  }

  can(action) {
    const permissions = this.getRolePermissions();
    return !!permissions[action];
  }

  login(login, pin) {
    const users = this.getUsers();
    const found = users.find(u => u.login.toLowerCase() === login.trim().toLowerCase() && u.pin === pin.trim());
    if (found) {
      if (!found.ativo) {
        return { success: false, message: 'Usuário desativado pelo Administrador.' };
      }
      this.setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Login ou PIN/Senha incorretos.' };
  }

  logout() {
    this.openLoginModal();
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
