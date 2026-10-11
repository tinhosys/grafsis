/* ==============================================================================
   GRAFSIS - Camada de Dados (Store) & Sincronização Supabase Cloud em Tempo Real
   Suporte a LocalStorage (Offline First) + Supabase (PostgreSQL Nuvem)
   ============================================================================== */

function grafsisUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

const STORAGE_KEYS = {
  CLIENTS: 'grafsis_clients',
  SUPPLIERS: 'grafsis_suppliers',
  PRODUCTS: 'grafsis_products',
  ORDERS: 'grafsis_orders',
  FINANCE: 'grafsis_finance',
  SETTINGS: 'grafsis_settings'
};

const INITIAL_PRODUCTS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    nome: 'Lona Frontlight 440g Brilho',
    categoria: 'Lonas',
    tipo_cobranca: 'm2',
    preco_base: 45.00,
    custo_base: 18.00,
    estoque_atual: 120.0,
    estoque_minimo: 30.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Lona reforçada para banners, fachadas e outdoors'
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    nome: 'Adesivo Vinil Fosco / Brilho com Recorte',
    categoria: 'Adesivos',
    tipo_cobranca: 'm2',
    preco_base: 55.00,
    custo_base: 22.00,
    estoque_atual: 85.0,
    estoque_minimo: 20.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Impressão digital eco-solvente de alta definição com recorte eletrônico'
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    nome: 'Caneca Porcelana Personalizada',
    categoria: 'Brindes',
    tipo_cobranca: 'unidade',
    preco_base: 32.00,
    custo_base: 12.50,
    estoque_atual: 150.0,
    estoque_minimo: 50.0,
    unidade_medida: 'un',
    foto_url: '',
    descricao: 'Sublimação fotográfica resinada classe AAA'
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    nome: 'Serviço de Recorte Laser em Acrílico / MDF',
    categoria: 'Serviços de Recorte',
    tipo_cobranca: 'linear',
    preco_base: 15.00,
    custo_base: 4.00,
    estoque_atual: 999.0,
    estoque_minimo: 0.0,
    unidade_medida: 'm',
    foto_url: '',
    descricao: 'Corte de alta precisão por metro linear de percurso'
  }
];

class GrafsisStore {
  constructor() {
    this.supabaseClient = null;
    this.isSyncing = false;
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.saveLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      this.saveLocal(STORAGE_KEYS.CLIENTS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.saveLocal(STORAGE_KEYS.SUPPLIERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.saveLocal(STORAGE_KEYS.ORDERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCE)) {
      this.saveLocal(STORAGE_KEYS.FINANCE, []);
    }

    this.initSupabase();
  }

  initSupabase() {
    const config = window.GRAFSIS_CONFIG ? window.GRAFSIS_CONFIG.getSupabaseConfig() : this.getSettings();
    if (config.url && config.key && window.supabase && window.supabase.createClient) {
      try {
        this.supabaseClient = window.supabase.createClient(config.url, config.key);
        console.log('[Supabase] Cliente conectado com sucesso:', config.url);
        this.updateSyncBadge(true);
        // Sincroniza em segundo plano ao iniciar
        setTimeout(() => this.syncAllWithCloud(), 300);
      } catch (err) {
        console.warn('[Supabase] Falha ao inicializar cliente:', err);
        this.updateSyncBadge(false);
      }
    } else {
      this.updateSyncBadge(false);
    }
  }

  updateSyncBadge(connected) {
    const badge = document.getElementById('cloud-sync-status');
    if (badge) {
      if (connected) {
        badge.innerHTML = `
          <button onclick="window.store.syncAllWithCloud()" title="Clique para forçar sincronização agora" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Nuvem Sincronizada ↻
          </button>
        `;
      } else {
        badge.innerHTML = `
          <button onclick="app.navigate('settings')" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            Configurar Nuvem
          </button>
        `;
      }
    }
  }

  getLocal(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Sincronização Bidirecional Completa com o Supabase
  async syncAllWithCloud() {
    if (!this.supabaseClient || this.isSyncing) return;
    this.isSyncing = true;
    console.log('[Supabase Sync] Iniciando sincronização bidirecional...');

    try {
      // 1. Enviar registros locais pré-existentes para a nuvem
      await this.pushAllLocalRecords();

      // 2. Puxar todos os registros da nuvem para atualizar o dispositivo
      await Promise.all([
        this.pullTable('clientes', STORAGE_KEYS.CLIENTS),
        this.pullTable('fornecedores', STORAGE_KEYS.SUPPLIERS),
        this.pullTable('produtos', STORAGE_KEYS.PRODUCTS),
        this.pullTable('pedidos', STORAGE_KEYS.ORDERS),
        this.pullTable('financeiro_lancamentos', STORAGE_KEYS.FINANCE),
        window.authModule ? window.authModule.syncUsersWithCloud(this.supabaseClient) : Promise.resolve()
      ]);

      console.log('[Supabase Sync] Sincronização concluída com sucesso!');
      if (window.app && window.app.currentTab) {
        window.app.navigate(window.app.currentTab);
      }
    } catch (e) {
      console.warn('[Supabase Sync] Erro na sincronização:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  async pushAllLocalRecords() {
    const clients = this.getClients();
    for (const c of clients) {
      if (!isValidUUID(c.id)) c.id = grafsisUUID();
      await this.pushRecord('clientes', c);
    }
    this.saveLocal(STORAGE_KEYS.CLIENTS, clients);

    const products = this.getProducts();
    for (const p of products) {
      if (!isValidUUID(p.id)) p.id = grafsisUUID();
      await this.pushRecord('produtos', p);
    }
    this.saveLocal(STORAGE_KEYS.PRODUCTS, products);

    const suppliers = this.getSuppliers();
    for (const s of suppliers) {
      if (!isValidUUID(s.id)) s.id = grafsisUUID();
      await this.pushRecord('fornecedores', s);
    }
    this.saveLocal(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  async pullTable(tableName, storageKey) {
    if (!this.supabaseClient) return;
    try {
      const { data, error } = await this.supabaseClient.from(tableName).select('*');
      if (error) {
        console.warn(`[Supabase] Erro ao buscar ${tableName}:`, error.message);
        return;
      }
      if (data && Array.isArray(data)) {
        const local = this.getLocal(storageKey);
        const map = new Map();
        local.forEach(item => map.set(item.id, item));
        data.forEach(item => map.set(item.id, item));
        const merged = Array.from(map.values());
        this.saveLocal(storageKey, merged);
      }
    } catch (err) {
      console.warn(`[Supabase] Falha pull ${tableName}:`, err);
    }
  }

  async pushRecord(tableName, record) {
    if (!this.supabaseClient) return;
    try {
      const clean = { ...record };
      if (!clean.id || !isValidUUID(clean.id)) {
        clean.id = grafsisUUID();
        record.id = clean.id;
      }
      const { error } = await this.supabaseClient.from(tableName).upsert(clean);
      if (error) {
        console.warn(`[Supabase] Erro ao enviar para ${tableName}:`, error.message);
      } else {
        console.log(`[Supabase] Registro sincronizado em ${tableName}:`, clean.id);
      }
    } catch (err) {
      console.warn(`[Supabase] Falha ao enviar para ${tableName}:`, err);
    }
  }

  async deleteCloudRecord(tableName, id) {
    if (!this.supabaseClient) return;
    try {
      await this.supabaseClient.from(tableName).delete().eq('id', id);
    } catch (err) {
      console.warn(`[Supabase] Falha ao deletar de ${tableName}:`, err);
    }
  }

  // Clientes
  getClients() { return this.getLocal(STORAGE_KEYS.CLIENTS); }
  async saveClient(client) {
    const clients = this.getClients();
    if (!client.id || !isValidUUID(client.id)) {
      client.id = grafsisUUID();
      clients.unshift(client);
    } else {
      const index = clients.findIndex(c => c.id === client.id);
      if (index >= 0) clients[index] = client;
      else clients.unshift(client);
    }
    this.saveLocal(STORAGE_KEYS.CLIENTS, clients);
    await this.pushRecord('clientes', client);
    return client;
  }
  async deleteClient(id) {
    const clients = this.getClients().filter(c => c.id !== id);
    this.saveLocal(STORAGE_KEYS.CLIENTS, clients);
    await this.deleteCloudRecord('clientes', id);
  }

  // Fornecedores
  getSuppliers() { return this.getLocal(STORAGE_KEYS.SUPPLIERS); }
  async saveSupplier(supplier) {
    const suppliers = this.getSuppliers();
    if (!supplier.id || !isValidUUID(supplier.id)) {
      supplier.id = grafsisUUID();
      suppliers.unshift(supplier);
    } else {
      const index = suppliers.findIndex(s => s.id === supplier.id);
      if (index >= 0) suppliers[index] = supplier;
      else suppliers.unshift(supplier);
    }
    this.saveLocal(STORAGE_KEYS.SUPPLIERS, suppliers);
    await this.pushRecord('fornecedores', supplier);
    return supplier;
  }
  async deleteSupplier(id) {
    const suppliers = this.getSuppliers().filter(s => s.id !== id);
    this.saveLocal(STORAGE_KEYS.SUPPLIERS, suppliers);
    await this.deleteCloudRecord('fornecedores', id);
  }

  // Produtos
  getProducts() { return this.getLocal(STORAGE_KEYS.PRODUCTS); }
  async saveProduct(prod) {
    const prods = this.getProducts();
    if (!prod.id || !isValidUUID(prod.id)) {
      prod.id = grafsisUUID();
      prods.unshift(prod);
    } else {
      const index = prods.findIndex(p => p.id === prod.id);
      if (index >= 0) prods[index] = prod;
      else prods.unshift(prod);
    }
    this.saveLocal(STORAGE_KEYS.PRODUCTS, prods);
    await this.pushRecord('produtos', prod);
    return prod;
  }
  async deleteProduct(id) {
    const prods = this.getProducts().filter(p => p.id !== id);
    this.saveLocal(STORAGE_KEYS.PRODUCTS, prods);
    await this.deleteCloudRecord('produtos', id);
  }

  // Pedidos
  getOrders() { return this.getLocal(STORAGE_KEYS.ORDERS); }
  async saveOrder(order) {
    const orders = this.getOrders();
    if (!order.id || !isValidUUID(order.id)) {
      order.id = grafsisUUID();
      order.created_at = new Date().toISOString();
      orders.unshift(order);
    } else {
      const index = orders.findIndex(o => o.id === order.id);
      if (index >= 0) orders[index] = order;
      else orders.unshift(order);
    }
    this.saveLocal(STORAGE_KEYS.ORDERS, orders);
    await this.pushRecord('pedidos', order);
    return order;
  }
  async updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      if (order.status_fase !== newStatus) {
        order.historico = order.historico || [];
        order.historico.push({
          fase: newStatus,
          data: new Date().toISOString(),
          usuario: window.authModule ? window.authModule.getCurrentUser().nome || window.authModule.getCurrentUser().login : 'Sistema'
        });
        order.status_fase = newStatus;
        if (newStatus === 'entregue' && !order.data_entrega) {
          order.data_entrega = new Date().toISOString();
        }
      }
      this.saveLocal(STORAGE_KEYS.ORDERS, orders);
      await this.pushRecord('pedidos', order);
      return true;
    }
    return false;
  }
  async deleteOrder(id) {
    const orders = this.getOrders().filter(o => o.id !== id);
    this.saveLocal(STORAGE_KEYS.ORDERS, orders);
    await this.deleteCloudRecord('pedidos', id);
  }

  // Financeiro
  getFinance() { return this.getLocal(STORAGE_KEYS.FINANCE); }
  async saveFinanceEntry(entry) {
    const entries = this.getFinance();
    if (!entry.id || !isValidUUID(entry.id)) {
      entry.id = grafsisUUID();
      entry.created_at = new Date().toISOString();
      entries.unshift(entry);
    } else {
      const index = entries.findIndex(e => e.id === entry.id);
      if (index >= 0) entries[index] = entry;
      else entries.unshift(entry);
    }
    this.saveLocal(STORAGE_KEYS.FINANCE, entries);
    await this.pushRecord('financeiro_lancamentos', entry);
    return entry;
  }
  async deleteFinanceEntry(id) {
    const entries = this.getFinance().filter(e => e.id !== id);
    this.saveLocal(STORAGE_KEYS.FINANCE, entries);
    await this.deleteCloudRecord('financeiro_lancamentos', id);
  }

  // Configurações
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  }
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.initSupabase();
  }

  // Backup JSON
  exportData() {
    const all = {
      clients: this.getClients(),
      suppliers: this.getSuppliers(),
      products: this.getProducts(),
      orders: this.getOrders(),
      finance: this.getFinance(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_grafsis_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.clients) this.saveLocal(STORAGE_KEYS.CLIENTS, data.clients);
      if (data.suppliers) this.saveLocal(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.products) this.saveLocal(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.orders) this.saveLocal(STORAGE_KEYS.ORDERS, data.orders);
      if (data.finance) this.saveLocal(STORAGE_KEYS.FINANCE, data.finance);
      return true;
    } catch (e) {
      alert('Arquivo de backup inválido: ' + e.message);
      return false;
    }
  }
}

window.store = new GrafsisStore();
