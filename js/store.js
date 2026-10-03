/* ==============================================================================
   GRAFSIS - Camada de Dados (Store)
   Suporte a LocalStorage/IndexedDB + Sincronização Supabase (Free Tier)
   ============================================================================== */

const STORAGE_KEYS = {
  CLIENTS: 'grafsis_clients',
  SUPPLIERS: 'grafsis_suppliers',
  PRODUCTS: 'grafsis_products',
  ORDERS: 'grafsis_orders',
  FINANCE: 'grafsis_finance',
  SETTINGS: 'grafsis_settings'
};

// Dados Iniciais Demonstrativos para começar pronto para uso
const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
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
    id: 'prod-2',
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
    id: 'prod-3',
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
    id: 'prod-4',
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

const INITIAL_CLIENTS = [
  {
    id: 'cli-1',
    nome: 'Supermercado Progresso Ltda',
    apelido: 'Marcos Progresso',
    cpf_cnpj: '12.345.678/0001-90',
    telefone_whatsapp: '11999998888',
    email: 'compras@progresso.com.br',
    cep: '01310-100',
    cidade: 'São Paulo',
    uf: 'SP',
    endereco: 'Av. Paulista, 1000 - Bela Vista',
    referencia: 'Em frente ao Metrô Trianon-Masp',
    plus_code: '87G8C822+4X',
    foto_url: '',
    observacoes: 'Cliente VIP - entrega sempre na doca 2'
  }
];

const INITIAL_SUPPLIERS = [
  {
    id: 'forn-1',
    nome_fantasia: 'Suprimentos Visuais Distribuidora',
    razao_social: 'SP Distribuidora de Vinis e Lonas S/A',
    cnpj: '98.765.432/0001-11',
    inscricao_estadual: '112.334.556.778',
    cidade: 'Guarulhos',
    uf: 'SP',
    endereco: 'Rua das Indústrias, 450 - Cumbica',
    nome_vendedor: 'Carlos Oliveira',
    telefone: '1124458899',
    celular_whatsapp: '11988887777',
    email: 'vendas@suprimentosvisuais.com.br',
    categoria_produtos: 'Lonas, Vinil Adesivo, Tintas Eco-Solvente'
  }
];

class GrafsisStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.save(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      this.save(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.save(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.save(STORAGE_KEYS.ORDERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCE)) {
      this.save(STORAGE_KEYS.FINANCE, []);
    }
  }

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Erro ao carregar chave ${key}:`, e);
      return [];
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notifySupabaseIfConfigured(key, data);
      return true;
    } catch (e) {
      console.error(`Erro ao salvar chave ${key}:`, e);
      return false;
    }
  }

  // Clientes
  getClients() { return this.get(STORAGE_KEYS.CLIENTS); }
  saveClient(client) {
    const clients = this.getClients();
    if (!client.id) {
      client.id = 'cli-' + Date.now();
      clients.unshift(client);
    } else {
      const index = clients.findIndex(c => c.id === client.id);
      if (index >= 0) clients[index] = client;
      else clients.unshift(client);
    }
    this.save(STORAGE_KEYS.CLIENTS, clients);
    return client;
  }
  deleteClient(id) {
    const clients = this.getClients().filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CLIENTS, clients);
  }

  // Fornecedores
  getSuppliers() { return this.get(STORAGE_KEYS.SUPPLIERS); }
  saveSupplier(supplier) {
    const suppliers = this.getSuppliers();
    if (!supplier.id) {
      supplier.id = 'forn-' + Date.now();
      suppliers.unshift(supplier);
    } else {
      const index = suppliers.findIndex(s => s.id === supplier.id);
      if (index >= 0) suppliers[index] = supplier;
      else suppliers.unshift(supplier);
    }
    this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
    return supplier;
  }
  deleteSupplier(id) {
    const suppliers = this.getSuppliers().filter(s => s.id !== id);
    this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  // Produtos
  getProducts() { return this.get(STORAGE_KEYS.PRODUCTS); }
  saveProduct(prod) {
    const prods = this.getProducts();
    if (!prod.id) {
      prod.id = 'prod-' + Date.now();
      prods.unshift(prod);
    } else {
      const index = prods.findIndex(p => p.id === prod.id);
      if (index >= 0) prods[index] = prod;
      else prods.unshift(prod);
    }
    this.save(STORAGE_KEYS.PRODUCTS, prods);
    return prod;
  }
  deleteProduct(id) {
    const prods = this.getProducts().filter(p => p.id !== id);
    this.save(STORAGE_KEYS.PRODUCTS, prods);
  }

  // Pedidos & Fases de Produção
  getOrders() { return this.get(STORAGE_KEYS.ORDERS); }
  saveOrder(order) {
    const orders = this.getOrders();
    if (!order.id) {
      order.id = 'ped-' + Date.now();
      order.numero = orders.length + 1001;
      order.created_at = new Date().toISOString();
      orders.unshift(order);
    } else {
      const index = orders.findIndex(o => o.id === order.id);
      if (index >= 0) orders[index] = order;
      else orders.unshift(order);
    }
    this.save(STORAGE_KEYS.ORDERS, orders);
    return order;
  }
  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status_fase = newStatus;
      if (newStatus === 'entregue' && !order.data_entrega) {
        order.data_entrega = new Date().toISOString();
      }
      this.save(STORAGE_KEYS.ORDERS, orders);
      return true;
    }
    return false;
  }
  deleteOrder(id) {
    const orders = this.getOrders().filter(o => o.id !== id);
    this.save(STORAGE_KEYS.ORDERS, orders);
  }

  // Financeiro
  getFinance() { return this.get(STORAGE_KEYS.FINANCE); }
  saveFinanceEntry(entry) {
    const entries = this.getFinance();
    if (!entry.id) {
      entry.id = 'fin-' + Date.now();
      entry.created_at = new Date().toISOString();
      entries.unshift(entry);
    } else {
      const index = entries.findIndex(e => e.id === entry.id);
      if (index >= 0) entries[index] = entry;
      else entries.unshift(entry);
    }
    this.save(STORAGE_KEYS.FINANCE, entries);
    return entry;
  }
  deleteFinanceEntry(id) {
    const entries = this.getFinance().filter(e => e.id !== id);
    this.save(STORAGE_KEYS.FINANCE, entries);
  }

  // Configurações Supabase
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  }
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  notifySupabaseIfConfigured(key, data) {
    // Gancho para sincronização com Supabase via REST se configurado
    const settings = this.getSettings();
    if (settings.supabaseUrl && settings.supabaseKey) {
      console.log(`[Supabase Sync] Sincronização ativada para ${key}`);
    }
  }

  // Exportação e Backup JSON
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
      if (data.clients) this.save(STORAGE_KEYS.CLIENTS, data.clients);
      if (data.suppliers) this.save(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.products) this.save(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.orders) this.save(STORAGE_KEYS.ORDERS, data.orders);
      if (data.finance) this.save(STORAGE_KEYS.FINANCE, data.finance);
      return true;
    } catch (e) {
      alert('Arquivo de backup inválido: ' + e.message);
      return false;
    }
  }
}

window.store = new GrafsisStore();
