/* ==============================================================================
   GRAFSIS - Módulo de Autenticação, Usuários & Controle de Acesso (RBAC)
   Versão 2.8.0 - Hierarquia: ADMIN (Sistema), PROPRIETARIO, GERENTE, VENDAS, PRODUCAO
   Login por CPF + Senha (4 dígitos) | Controle de Senha Padrão '0000' (10 acessos)
   ============================================================================== */

const LIBERAR_TUDO = false; // Controle de acesso ativo por perfil e hierarquia

const ROLES = {
  ADMIN: 'ADMIN',               // Administrador do Sistema / Desenvolvedor (Soberania Total)
  PROPRIETARIO: 'PROPRIETARIO', // Proprietário da Gráfica (Soberania na sua empresa)
  GERENTE: 'GERENTE',           // Gerência Operacional
  VENDAS: 'VENDAS',             // Comercial & Vendas
  PRODUCAO: 'PRODUCAO'          // Operador de Oficina & Produção
};

const ROLE_PERMISSIONS = {
  ADMIN: {
    name: 'Admin do Sistema',
    level: 6,
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    tabs: ['production', 'sales', 'products', 'clients', 'suppliers', 'finance', 'owner', 'tenants', 'settings'],
    canCreateOrders: true,
    canViewCosts: true,
    canEditPrices: true,
    canViewFinance: true,
    canManageSuppliers: true,
    canManageSettings: true,
    canManageUsers: true,
    canDeleteRecords: true,
    canManageTenants: true,
    canBlockCompanies: true
  },
  PROPRIETARIO: {
    name: 'Proprietário',
    level: 5,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    tabs: ['production', 'sales', 'products', 'clients', 'suppliers', 'finance', 'owner'],
    canCreateOrders: true,
    canViewCosts: true,
    canEditPrices: true,
    canViewFinance: true,
    canManageSuppliers: true,
    canManageSettings: true,
    canManageUsers: true,
    canDeleteRecords: true,
    canManageTenants: false,
    canBlockCompanies: false
  },
  GERENTE: {
    name: 'Gerente Geral',
    level: 4,
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    tabs: ['production', 'sales', 'products', 'clients', 'suppliers', 'finance'],
    canCreateOrders: true,
    canViewCosts: true,
    canEditPrices: true,
    canViewFinance: true,
    canManageSuppliers: true,
    canManageSettings: false,
    canManageUsers: false,
    canDeleteRecords: true,
    canManageTenants: false,
    canBlockCompanies: false
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
    canDeleteRecords: false,
    canManageTenants: false,
    canBlockCompanies: false
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
    canDeleteRecords: false,
    canManageTenants: false,
    canBlockCompanies: false
  }
};

const DEFAULT_USERS = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    operador: 'Admin',
    nome: 'Administrador do Sistema',
    cpf: '59156813287',
    login: 'admin',
    senha: '4791',
    pin: '4791',
    role: ROLES.ADMIN,
    ativo: true,
    foto_url: '',
    telefone: '(11) 99999-0000',
    email: 'admin@grafsis.com',
    tentativas_senha_padrao: 999,
    empresa_id: '001',
    data_cadastro: '2026-01-01T00:00:00Z',
    data_ultimo_acesso: new Date().toISOString()
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    operador: 'Carlos',
    nome: 'Carlos Proprietário',
    cpf: '11144477735',
    login: 'proprietario',
    senha: '0000',
    pin: '0000',
    role: ROLES.PROPRIETARIO,
    ativo: true,
    foto_url: '',
    telefone: '(69) 99922-1336',
    email: 'proprietario@topdigital.com.br',
    tentativas_senha_padrao: 10,
    empresa_id: '001',
    data_cadastro: '2026-01-01T00:00:00Z',
    data_ultimo_acesso: null
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    operador: 'Marcos',
    nome: 'Gerência Operacional',
    cpf: '22255588846',
    login: 'gerente',
    senha: '0000',
    pin: '0000',
    role: ROLES.GERENTE,
    ativo: true,
    foto_url: '',
    telefone: '(69) 98888-2222',
    email: 'gerencia@topdigital.com.br',
    tentativas_senha_padrao: 10,
    empresa_id: '001',
    data_cadastro: '2026-01-01T00:00:00Z',
    data_ultimo_acesso: null
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    operador: 'Ana',
    nome: 'Equipe Comercial',
    cpf: '33366699957',
    login: 'vendas',
    senha: '0000',
    pin: '0000',
    role: ROLES.VENDAS,
    ativo: true,
    foto_url: '',
    telefone: '(69) 97777-3333',
    email: 'vendas@topdigital.com.br',
    tentativas_senha_padrao: 10,
    empresa_id: '001',
    data_cadastro: '2026-01-01T00:00:00Z',
    data_ultimo_acesso: null
  },
  {
    id: 'a0000000-0000-4000-8000-000000000005',
    operador: 'João',
    nome: 'Oficina & Produção',
    cpf: '44477700068',
    login: 'producao',
    senha: '0000',
    pin: '0000',
    role: ROLES.PRODUCAO,
    ativo: true,
    foto_url: '',
    telefone: '(69) 96666-4444',
    email: 'producao@topdigital.com.br',
    tentativas_senha_padrao: 10,
    empresa_id: '001',
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

  maskCpf(v) {
    if (!v) return '';
    v = v.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  }

  cleanDigits(v) {
    return (v || '').replace(/\D/g, '');
  }

  init() {
    const raw = localStorage.getItem(this.STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    } else {
      // Garante migração para novos campos se usuário já existia no storage
      try {
        const list = JSON.parse(raw);
        let updated = false;
        list.forEach(u => {
          if (!u.cpf) {
            const def = DEFAULT_USERS.find(d => d.login === u.login || d.id === u.id);
            u.cpf = def ? def.cpf : ('000' + Math.floor(Math.random()*90000000 + 10000000));
            updated = true;
          }
          if (!u.operador) {
            u.operador = u.nome ? u.nome.split(' ')[0] : (u.login || 'Operador');
            updated = true;
          }
          if (u.tentativas_senha_padrao === undefined) {
            u.tentativas_senha_padrao = (u.senha === '0000' || u.pin === '0000') ? 10 : 999;
            updated = true;
          }
          if (!u.empresa_id) {
            u.empresa_id = '001';
            updated = true;
          }
        });
        // Garante que o gestor oficial 59156813287 / 4791 sempre exista
        const hasGestor = list.some(u => this.cleanDigits(u.cpf) === '59156813287');
        if (!hasGestor) {
          list.unshift(DEFAULT_USERS[0]);
          updated = true;
        }
        if (updated) this.saveUsersLocal(list);
      } catch (e) {
        localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }
    // Exigência estrita: se não houver login autenticado na sessão, não autentica automaticamente
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

  isAuthenticated() {
    try {
      const user = JSON.parse(sessionStorage.getItem(this.STORAGE_SESSION_KEY));
      return !!(user && user.id);
    } catch {
      return false;
    }
  }

  getCurrentUser() {
    try {
      const user = JSON.parse(sessionStorage.getItem(this.STORAGE_SESSION_KEY));
      return user || null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      sessionStorage.setItem(this.STORAGE_SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(this.STORAGE_SESSION_KEY);
    }
  }

  getRolePermissions() {
    const user = this.getCurrentUser();
    if (!user) return ROLE_PERMISSIONS.PRODUCAO;
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

  // Verifica se o usuário atual pode editar ou bloquear o usuário alvo
  canManageTargetUser(targetUser) {
    const current = this.getCurrentUser();
    if (!current) return false;
    if (current.role === ROLES.ADMIN) return true; // Admin do Sistema gerencia qualquer usuário
    if (current.role === ROLES.PROPRIETARIO) {
      // Proprietário não pode gerenciar Admin do Sistema nem outros proprietários
      if (targetUser.role === ROLES.ADMIN || targetUser.role === ROLES.PROPRIETARIO) {
        return targetUser.id === current.id; // pode editar seu próprio perfil básico
      }
      return true; // pode gerenciar GERENTE, VENDAS, PRODUCAO
    }
    return false;
  }

  login(cpfOuLogin, senha) {
    const users = this.getUsers();
    const termClean = (cpfOuLogin || '').trim().toLowerCase();
    const digitsOnly = this.cleanDigits(termClean);
    const pass = (senha || '').trim();

    // Busca por CPF ou por login
    const found = users.find(u => {
      const uCpfDigits = this.cleanDigits(u.cpf);
      const uLogin = (u.login || '').toLowerCase();
      const matchIdentity = (digitsOnly && uCpfDigits === digitsOnly) || (uLogin === termClean);
      const matchPass = ((u.senha && u.senha === pass) || (u.pin && u.pin === pass));
      return matchIdentity && matchPass;
    });

    if (!found) {
      return { success: false, message: 'CPF / Login ou Senha incorretos.' };
    }

    if (found.ativo === false) {
      return { success: false, message: 'Acesso negado: Este usuário está desativado no sistema.' };
    }

    // Validação da Empresa / Tenant (se empresa bloqueada pelo Admin)
    if (window.store && typeof window.store.getTenants === 'function' && found.role !== ROLES.ADMIN) {
      const tenants = window.store.getTenants();
      const emp = tenants.find(t => t.id === found.empresa_id);
      if (emp) {
        if (emp.ativo === false) {
          return { success: false, message: `Acesso negado: A empresa (${emp.nome_fantasia || emp.razao_social}) está bloqueada pelo Administrador do Sistema.` };
        }
        if (emp.data_expiracao && new Date(emp.data_expiracao) < new Date()) {
          return { success: false, message: `Acesso expirado: O pacote desta empresa expirou em ${new Date(emp.data_expiracao).toLocaleDateString('pt-BR')}. Contate o Administrador.` };
        }
      }
    }

    // Regra da senha padrão '0000': máximo de 10 entradas com alerta regressivo
    let warningDefaultPass = false;
    let remainingAttempts = null;

    if (pass === '0000') {
      if (found.tentativas_senha_padrao === undefined) found.tentativas_senha_padrao = 10;
      
      if (found.tentativas_senha_padrao <= 0) {
        return {
          success: false,
          message: 'Acesso bloqueado: Limite de 10 entradas com a senha temporária "0000" foi atingido! Solicite ao Administrador a redefinição de sua senha.'
        };
      }

      found.tentativas_senha_padrao -= 1;
      remainingAttempts = found.tentativas_senha_padrao;
      warningDefaultPass = true;
    }

    // Atualiza data do último acesso
    found.data_ultimo_acesso = new Date().toISOString();
    this.saveUserWithoutValidation(found);
    this.setCurrentUser(found);

    return { 
      success: true, 
      user: found,
      warningDefaultPass,
      remainingAttempts
    };
  }

  logout() {
    this.openLoginModal();
  }

  saveUserWithoutValidation(user) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.unshift(user);
    this.saveUsersLocal(users);
  }

  async saveUser(user) {
    const users = this.getUsers();
    const current = this.getCurrentUser();

    // 1. Validação de Permissão Hierárquica
    if (user.id && current) {
      const existing = users.find(u => u.id === user.id);
      if (existing && !this.canManageTargetUser(existing)) {
        throw new Error('Permissão negada: você não possui nível de acesso suficiente para alterar este usuário.');
      }
    }

    // 2. Validação de Operador (Nome Simples): Obrigatório e Único na mesma empresa
    const op = (user.operador || '').trim();
    if (!op) {
      throw new Error('O campo "Operador (Nome simples)" é obrigatório.');
    }
    const empId = user.empresa_id || '001';
    const opDuplicate = users.some(u => 
      u.id !== user.id && 
      (u.empresa_id || '001') === empId && 
      (u.operador || '').toLowerCase().trim() === op.toLowerCase()
    );
    if (opDuplicate) {
      throw new Error(`Já existe um operador com o nome "${op}" cadastrado nesta empresa/gráfica.`);
    }

    // 3. Validação do CPF do Usuário: Chave Única obrigatória (não pode repetir entre usuários ativos)
    const cpfClean = this.cleanDigits(user.cpf);
    if (!cpfClean || cpfClean.length !== 11) {
      throw new Error('CPF do usuário é obrigatório e deve conter 11 dígitos válidos.');
    }
    const cpfDuplicate = users.some(u => 
      u.id !== user.id && 
      this.cleanDigits(u.cpf) === cpfClean && 
      u.ativo !== false
    );
    if (cpfDuplicate) {
      throw new Error('Operação negada: Já existe um usuário ATIVO cadastrado com este CPF.');
    }

    // 4. Tratamento de senha padrão '0000'
    if (user.senha === '0000') {
      if (user.tentativas_senha_padrao === undefined) {
        user.tentativas_senha_padrao = 10;
      }
    } else {
      // Se trocou para senha definitiva pessoal, desativa bloqueio por contagem
      user.tentativas_senha_padrao = 999;
    }
    user.pin = user.senha;

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

    // Se o usuário editado for o mesmo logado na sessão, atualiza sessão
    if (current && current.id === user.id) {
      this.setCurrentUser(user);
    }

    // Sincroniza com Supabase se conectado
    if (window.store && window.store.supabaseClient) {
      try {
        await window.store.supabaseClient.from('usuarios').upsert({
          id: user.id,
          operador: user.operador,
          nome: user.nome,
          cpf: user.cpf,
          login: user.login,
          senha: user.senha || '0000',
          pin: user.pin || '0000',
          role: user.role,
          ativo: user.ativo,
          foto_url: user.foto_url || null,
          telefone: user.telefone || null,
          email: user.email || null,
          tentativas_senha_padrao: user.tentativas_senha_padrao,
          empresa_id: user.empresa_id || '001',
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
    const users = this.getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return;

    if (this.cleanDigits(target.cpf) === '59156813287' || target.login === 'admin') {
      throw new Error('Operação negada: O Administrador Geral do Sistema não pode ser excluído.');
    }

    const current = this.getCurrentUser();
    if (current && current.id === id) {
      throw new Error('Você não pode excluir o seu próprio usuário logado.');
    }

    if (!this.canManageTargetUser(target)) {
      throw new Error('Permissão negada: seu perfil não possui autorização para excluir este usuário.');
    }

    const filtered = users.filter(u => u.id !== id);
    this.saveUsersLocal(filtered);

    if (window.store && window.store.supabaseClient) {
      try {
        await window.store.supabaseClient.from('usuarios').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Falha ao deletar usuário remoto:', err);
      }
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'Usuário não encontrado.' };

    const curr = (user.senha || user.pin || '0000').trim();
    if (currentPassword.trim() !== curr) {
      return { success: false, message: 'A senha atual informada está incorreta.' };
    }

    const np = newPassword.trim();
    if (np.length !== 4 || !/^\d{4}$/.test(np)) {
      return { success: false, message: 'A nova senha deve conter exatamente 4 dígitos numéricos.' };
    }

    user.senha = np;
    user.pin = np;
    user.tentativas_senha_padrao = 999; // Senha pessoal definida, remove limite de 10 entradas
    this.saveUserWithoutValidation(user);
    this.setCurrentUser(user);

    if (window.store && window.store.supabaseClient) {
      try {
        await window.store.supabaseClient.from('usuarios').update({
          senha: user.senha,
          pin: user.pin,
          tentativas_senha_padrao: 999
        }).eq('id', user.id);
      } catch (e) {
        console.warn('[Supabase] Erro ao atualizar senha:', e);
      }
    }

    return { success: true, message: 'Senha pessoal atualizada com sucesso!' };
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

  handleCpfInput(input) {
    if (!input) return;
    input.value = this.maskCpf(input.value);
    const digits = this.cleanDigits(input.value);

    const hintBar = document.getElementById('auth-hint-bar');
    const hintText = document.getElementById('auth-hint-text');

    if (digits.length >= 11) {
      const users = this.getUsers();
      const found = users.find(u => this.cleanDigits(u.cpf) === digits);
      if (found) {
        let tenantName = 'Gráfica Padrão';
        if (window.store && typeof window.store.getTenants === 'function') {
          const tenants = window.store.getTenants();
          const t = tenants.find(item => item.id === (found.empresa_id || '001'));
          if (t) tenantName = t.nome_fantasia || t.razao_social;
        }

        const pass = found.senha || found.pin || '0000';
        if (hintBar) hintBar.classList.add('hidden');
        if (hintText) {
          hintText.innerHTML = `🔑 Senha: <span class="font-mono underline">${pass}</span> | 🏢 ${tenantName}`;
          hintText.classList.remove('hidden');
        }
        return;
      }
    }

    // Se CPF incompleto ou não localizado
    if (hintText) {
      hintText.classList.add('hidden');
      hintText.innerHTML = '';
    }
    if (hintBar) hintBar.classList.remove('hidden');
  }

  openLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      const errEl = document.getElementById('auth-error');
      if (errEl) errEl.classList.add('hidden');
      const loginInp = document.getElementById('auth-cpf');
      if (loginInp) {
        loginInp.value = '';
        loginInp.focus();
      }
      const passInp = document.getElementById('auth-pin');
      if (passInp) passInp.value = '';

      const hintBar = document.getElementById('auth-hint-bar');
      const hintText = document.getElementById('auth-hint-text');
      if (hintBar) hintBar.classList.remove('hidden');
      if (hintText) {
        hintText.classList.add('hidden');
        hintText.innerHTML = '';
      }
    }
  }

  closeLoginModal() {
    // Só permite fechar o modal se o usuário estiver autenticado
    if (!this.isAuthenticated()) {
      return;
    }
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  togglePasswordVisibility() {
    const passInp = document.getElementById('auth-pin');
    const eyeIcon = document.getElementById('auth-eye-icon');
    if (!passInp) return;
    if (passInp.type === 'password') {
      passInp.type = 'text';
      if (eyeIcon) {
        eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>`;
      }
    } else {
      passInp.type = 'password';
      if (eyeIcon) {
        eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
      }
    }
  }

  openSupportModal() {
    const modal = document.getElementById('support-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeSupportModal() {
    const modal = document.getElementById('support-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  logout() {
    this.setCurrentUser(null);
    sessionStorage.clear();
    localStorage.removeItem('grafsis_remember_cpf');
    if (window.app) {
      window.app.updateUserHeader();
    }
    this.openLoginModal();
  }

  submitLogin(e) {
    if (e) e.preventDefault();
    const cpfOuLogin = (document.getElementById('auth-cpf')?.value || '').trim();
    const pin = (document.getElementById('auth-pin')?.value || '').trim();
    const result = this.login(cpfOuLogin, pin);

    if (result.success) {
      this.closeLoginModal();
      if (window.app) {
        window.app.updateUserHeader();
        const perms = this.getRolePermissions();
        if (!this.canAccess(window.app.currentTab)) {
          window.app.navigate(perms.tabs[0]);
        } else {
          window.app.navigate(window.app.currentTab);
        }

        // Se estiver usando senha padrão '0000', alerta com urgência
        if (result.warningDefaultPass) {
          alert(`⚠️ ATENÇÃO: Você entrou com a senha padrão temporária ("0000").\nEsta senha deve ser trocada urgentemente!\nVocê tem ${result.remainingAttempts} entrada(s) restante(s) antes do bloqueio definitivo.\n\nAcesse a engrenagem no topo para cadastrar sua senha pessoal.`);
        }
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
      this.saveUserWithoutValidation(found);
      this.setCurrentUser(found);
      this.closeLoginModal();
      if (window.app) {
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
}

window.authModule = new GrafsisAuth();
