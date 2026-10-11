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
  SETTINGS: 'grafsis_settings',
  TENANTS: 'grafsis_tenants'
};

const DEFAULT_TENANTS = [
  {
    id: '001',
    razao_social: 'Top Digital Comunicação Visual Ltda',
    nome_fantasia: 'Top Digital',
    cnpj: '12.345.678/0001-90',
    telefone_fixo: '(69) 3222-1000',
    celular_whatsapp: '(69) 99922-1336',
    email: 'contato@topdigital.com.br',
    endereco: 'Rua Atlântica, Flodoaldo Pontes Pinto, Porto Velho - RO',
    site: 'https://topdigital.com.br',
    instagram: '@topdigital',
    logo_url: 'assets/demo-top-digital.png',
    rodape_msg: 'Agradecemos a preferência! Orçamento válido por 10 dias úteis.',
    pacote_mensal: 'Plano Profissional Ilimitado',
    data_expiracao: '2028-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  }
];

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
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
      this.saveLocal(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
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
        // Sincroniza imediatamente ao iniciar
        setTimeout(() => this.syncAllWithCloud(), 100);

        // Auto-sincronizacao ao focar na janela (ao alternar entre abas ou celular/PC)
        if (!this._focusListenerAttached) {
          this._focusListenerAttached = true;
          window.addEventListener('focus', () => this.syncAllWithCloud());
        }

        // Auto-sincronizacao periodica em segundo plano (a cada 20 segundos)
        if (!this._syncInterval) {
          this._syncInterval = setInterval(() => this.syncAllWithCloud(), 20000);
        }

        // Supabase Realtime (detecta alteracoes instantaneas entre PC e celular)
        if (!this._realtimeSubscribed) {
          this._realtimeSubscribed = true;
          try {
            this.supabaseClient
              .channel('public-sync')
              .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                console.log('[Supabase Realtime] Mudanca detectada na nuvem, sincronizando...');
                this.syncAllWithCloud();
              })
              .subscribe();
          } catch (rtErr) {
            console.warn('[Supabase Realtime] Falha ao assinar canal:', rtErr);
          }
        }
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
      console.warn('[Store] QuotaExceededError ao salvar ' + key, e);
      try {
        if (Array.isArray(data)) {
          const sanitized = data.map(item => {
            if (item && item.foto_url && item.foto_url.length > 30000) {
              const copy = { ...item };
              delete copy.foto_url;
              return copy;
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(sanitized));
          return true;
        }
      } catch (inner) {
        console.error('[Store] Falha definitiva no localStorage:', inner);
      }
      return false;
    }
  }

  // Sincronizacao Bidirecional Completa com o Supabase
  async syncAllWithCloud() {
    if (!this.supabaseClient || this.isSyncing) return;
    this.isSyncing = true;
    console.log('[Supabase Sync] Iniciando sincronizacao bidirecional...');

    try {
      // 1. Puxar todos os registros da nuvem IMEDIATAMENTE (Prioridade maxima: atualizar a tela)
      await Promise.all([
        this.pullTable('clientes', STORAGE_KEYS.CLIENTS),
        this.pullTable('fornecedores', STORAGE_KEYS.SUPPLIERS),
        this.pullTable('produtos', STORAGE_KEYS.PRODUCTS),
        this.pullTable('pedidos', STORAGE_KEYS.ORDERS),
        this.pullTable('financeiro_lancamentos', STORAGE_KEYS.FINANCE),
        window.authModule ? window.authModule.syncUsersWithCloud(this.supabaseClient) : Promise.resolve()
      ]);

      // Auditoria & Proteção: Se houver qualquer formulário aberto ou foco ativo de digitação,
      // NUNCA recarrega nem altera o DOM para não fechar formulários do usuário (ex: Nova Venda / Orçamento)
      const isUserEditing = document.getElementById('order-form') ||
                            (window.salesModule && window.salesModule.isFormOpen) ||
                            document.querySelector('.modal:not(.hidden):not(#auth-modal)') ||
                            (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName));

      if (!isUserEditing && window.app && window.app.currentTab && window.authModule && window.authModule.isAuthenticated()) {
        try {
          // Atualiza apenas a lista passiva sem resetar a navegação global (app.navigate)
          if (window.app.currentTab === 'dashboard' && typeof window.app.renderDashboard === 'function') {
            window.app.renderDashboard();
          } else if (window.app.currentTab === 'production' && window.productionModule) {
            window.productionModule.render();
          } else if ((window.app.currentTab === 'sales' || window.app.currentTab === 'orders') && window.salesModule && !window.salesModule.isFormOpen) {
            window.salesModule.render();
          } else if (window.app.currentTab === 'clients' && window.clientsModule) {
            window.clientsModule.render();
          } else if (window.app.currentTab === 'finance' && window.financeModule) {
            window.financeModule.render();
          } else if (window.app.currentTab === 'suppliers' && window.suppliersModule) {
            window.suppliersModule.render();
          } else if (window.app.currentTab === 'products' && window.productsModule) {
            window.productsModule.render();
          }
        } catch (uiErr) {
          console.warn('[Sync UI] Erro não impeditivo ao atualizar dados:', uiErr);
        }
      }

      // 2. Enviar registros locais em lote para a nuvem
      await this.pushAllLocalRecords();

      // 3. Corrigir pedidos com o mesmo numero (ID de venda duplicado)
      await this.fixDuplicateOrderNumbers();

      console.log('[Supabase Sync] Sincronizacao concluida com sucesso!');
    } catch (e) {
      console.warn('[Supabase Sync] Erro na sincronizacao:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  async pushAllLocalRecords() {
    try {
      const clients = this.getClients();
      await Promise.all(clients.map(c => {
        if (!isValidUUID(c.id)) c.id = grafsisUUID();
        return this.pushRecord('clientes', c);
      }));
      this.saveLocal(STORAGE_KEYS.CLIENTS, clients);

      const products = this.getProducts();
      await Promise.all(products.map(p => {
        if (!isValidUUID(p.id)) p.id = grafsisUUID();
        return this.pushRecord('produtos', p);
      }));
      this.saveLocal(STORAGE_KEYS.PRODUCTS, products);

      const suppliers = this.getSuppliers();
      await Promise.all(suppliers.map(s => {
        if (!isValidUUID(s.id)) s.id = grafsisUUID();
        return this.pushRecord('fornecedores', s);
      }));
      this.saveLocal(STORAGE_KEYS.SUPPLIERS, suppliers);

      const orders = this.getOrders();
      await Promise.all(orders.map(o => {
        if (!isValidUUID(o.id)) o.id = grafsisUUID();
        return this.pushRecord('pedidos', o);
      }));
      this.saveLocal(STORAGE_KEYS.ORDERS, orders);

      const finance = this.getFinance();
      await Promise.all(finance.map(f => {
        if (!isValidUUID(f.id)) f.id = grafsisUUID();
        return this.pushRecord('financeiro_lancamentos', f);
      }));
      this.saveLocal(STORAGE_KEYS.FINANCE, finance);
    } catch (err) {
      console.warn('[Supabase Sync] Erro no push local:', err);
    }
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
        // Se for tabela de pedidos, desempacota metadados caso tenham sido salvos em fallback JSON
        if (tableName === 'pedidos') {
          data.forEach(item => {
            if (item.observacoes && typeof item.observacoes === 'string' && item.observacoes.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(item.observacoes);
                if (parsed.itens && Array.isArray(parsed.itens)) item.itens = parsed.itens;
                if (parsed.historico && Array.isArray(parsed.historico)) item.historico = parsed.historico;
                if (parsed.numero) item.numero = parsed.numero;
                if (parsed.valor_entrada !== undefined) item.valor_entrada = parsed.valor_entrada;
                if (parsed.valor_recebido !== undefined) item.valor_recebido = parsed.valor_recebido;
                if (parsed.vendedor) item.vendedor = parsed.vendedor;
                if (parsed.validade_proposta_dias !== undefined) item.validade_proposta_dias = parsed.validade_proposta_dias;
                if (parsed.data_validade) item.data_validade = parsed.data_validade;
                if (parsed.percentual_operacao !== undefined) item.percentual_operacao = parsed.percentual_operacao;
                if (parsed.data_aceite) item.data_aceite = parsed.data_aceite;
                if (parsed.autorizo_producao) item.autorizo_producao = parsed.autorizo_producao;
                if (parsed.conferencia_arte) item.conferencia_arte = parsed.conferencia_arte;
                if (parsed.obs_pagto) item.obs_pagto = parsed.obs_pagto;
                if (parsed.obs !== undefined) item.observacoes = parsed.obs;
              } catch (e) {}
            }
            if (item.created_at && !item.data_criacao) {
              item.data_criacao = item.created_at;
            }
          });
        }

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
      let clean = { ...record };
      if (!clean.id || !isValidUUID(clean.id)) {
        clean.id = grafsisUUID();
        record.id = clean.id;
      }

      // Validação preventiva de Foreign Keys para o PostgreSQL do Supabase
      if (clean.cliente_id && !isValidUUID(clean.cliente_id)) clean.cliente_id = null;
      if (clean.fornecedor_id && !isValidUUID(clean.fornecedor_id)) clean.fornecedor_id = null;
      if (clean.pedido_id && !isValidUUID(clean.pedido_id)) clean.pedido_id = null;

      // Converte strings vazias em null para colunas com restrições SQL
      for (const k in clean) {
        if (clean[k] === '') {
          clean[k] = null;
        }
      }

      const { error } = await this.supabaseClient.from(tableName).upsert(clean);
      if (error) {
        console.warn(`[Supabase] Erro ao enviar para ${tableName}:`, error.message);

        // Fallback 1: PEDIDOS (Garante que nunca falhe no celular ou PC mesmo em schema antigo)
        if (tableName === 'pedidos') {
          console.warn('[Supabase Fallback] Sincronizando pedido com proteção de colunas e metadados JSON...');
          const metaPayload = {
            numero: clean.numero || null,
            vendedor: clean.vendedor || null,
            tipo_operacao: clean.tipo_operacao || null,
            validade_proposta_dias: clean.validade_proposta_dias || null,
            data_validade: clean.data_validade || null,
            percentual_operacao: clean.percentual_operacao || null,
            valor_entrada: clean.valor_entrada || 0,
            valor_recebido: clean.valor_recebido || 0,
            data_aceite: clean.data_aceite || null,
            autorizo_producao: clean.autorizo_producao || null,
            conferencia_arte: clean.conferencia_arte || null,
            obs_pagto: clean.obs_pagto || null,
            itens: clean.itens || [],
            historico: clean.historico || [],
            obs: clean.observacoes || ''
          };
          const baseOrder = {
            id: clean.id,
            cliente_id: isValidUUID(clean.cliente_id) ? clean.cliente_id : null,
            tipo: clean.tipo || clean.tipo_operacao || 'orcamento',
            status_fase: clean.status_fase || 'orcamento',
            valor_total: clean.valor_total || 0,
            desconto: clean.desconto || 0,
            valor_final: clean.valor_final || 0,
            forma_pagamento: clean.forma_pagamento || null,
            status_pagamento: clean.status_pagamento || 'pendente',
            previsao_entrega: clean.previsao_entrega || null,
            observacoes: JSON.stringify(metaPayload),
            foto_arte_url: clean.foto_arte_url || null,
            created_at: clean.created_at || clean.data_criacao || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          const fallbackRes = await this.supabaseClient.from('pedidos').upsert(baseOrder);
          if (fallbackRes.error) {
            console.error('[Supabase Fallback] Falha no fallback de pedidos:', fallbackRes.error.message);
          } else {
            console.log('[Supabase Fallback] Sucesso! Pedido gravado e sincronizado com a nuvem Supabase!');
          }
        }
        // Fallback 2: CLIENTES
        else if (tableName === 'clientes' && (error.message.includes('column') || error.message.includes('schema cache'))) {
          console.warn('[Supabase Fallback] Tentando sincronizar cliente com colunas fundamentais...');
          const baseClient = {
            id: clean.id,
            nome: clean.nome,
            apelido: clean.apelido || null,
            cpf_cnpj: clean.cpf_cnpj || null,
            telefone_whatsapp: clean.telefone_whatsapp || '00000000',
            email: clean.email || null,
            cep: clean.cep || null,
            cidade: clean.cidade || null,
            uf: clean.uf || null,
            endereco: clean.endereco || clean.logradouro || null,
            referencia: clean.referencia || null,
            plus_code: clean.plus_code || null,
            foto_url: clean.foto_url || null,
            observacoes: clean.observacoes || null,
            updated_at: clean.updated_at || new Date().toISOString()
          };
          const fallbackRes = await this.supabaseClient.from('clientes').upsert(baseClient);
          if (fallbackRes.error) {
            console.error('[Supabase Fallback] Falha no fallback de clientes:', fallbackRes.error.message);
          } else {
            console.log('[Supabase Fallback] Sucesso! Cliente sincronizado com a nuvem (colunas básicas).');
          }
        }
        // Fallback 3: FINANCEIRO
        else if (tableName === 'financeiro_lancamentos') {
          console.warn('[Supabase Fallback] Sincronizando lançamento financeiro sem FKs restritas...');
          const baseFin = {
            id: clean.id,
            tipo: clean.tipo || 'receber',
            descricao: clean.descricao || 'Lançamento',
            categoria: clean.categoria || 'Geral',
            valor: clean.valor || 0,
            data_vencimento: clean.data_vencimento || new Date().toISOString().slice(0, 10),
            data_pagamento: clean.data_pagamento || null,
            status: clean.status || 'pendente',
            forma_pagamento: clean.forma_pagamento || null,
            observacoes: clean.observacoes || null
          };
          const fallbackRes = await this.supabaseClient.from('financeiro_lancamentos').upsert(baseFin);
          if (fallbackRes.error) {
            console.error('[Supabase Fallback] Falha no fallback financeiro:', fallbackRes.error.message);
          } else {
            console.log('[Supabase Fallback] Sucesso! Lançamento financeiro sincronizado na nuvem.');
          }
        }
      } else {
        console.log(`[Supabase] Registro sincronizado com sucesso em ${tableName}:`, clean.id);
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

  // Próximo número de pedido no formato AA + sequência (ex: 260001)
  getNextOrderNumber(orders) {
    const list = orders || this.getOrders();
    const yy = new Date().getFullYear().toString().slice(-2);
    let maxSeq = 0;
    list.forEach(o => {
      if (o.numero && String(o.numero).startsWith(yy)) {
        const seq = parseInt(String(o.numero).slice(2), 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });
    return yy + String(maxSeq + 1).padStart(4, '0');
  }

  // Renumera pedidos que compartilham o mesmo número (o mais antigo mantém o número)
  async fixDuplicateOrderNumbers() {
    const orders = this.getOrders();
    const groups = new Map();
    orders.forEach(o => {
      if (!o.numero) return;
      const k = String(o.numero);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(o);
    });
    const changed = [];
    groups.forEach(list => {
      if (list.length < 2) return;
      list.sort((a, b) => {
        const da = new Date(a.created_at || a.data_criacao || 0) - new Date(b.created_at || b.data_criacao || 0);
        return da !== 0 ? da : String(a.id).localeCompare(String(b.id));
      });
      list.slice(1).forEach(o => {
        const old = o.numero;
        o.numero = this.getNextOrderNumber(orders);
        o.historico = o.historico || [];
        o.historico.push({
          fase: o.status_fase,
          data: new Date().toISOString(),
          usuario: 'Sistema',
          acao: `Número duplicado #${old} corrigido para #${o.numero}`
        });
        changed.push(o);
      });
    });
    if (changed.length === 0) return [];
    this.saveLocal(STORAGE_KEYS.ORDERS, orders);
    for (const o of changed) await this.pushRecord('pedidos', o);
    console.warn('[GRAFSIS] Pedidos com número duplicado renumerados:', changed.map(o => o.numero));
    return changed;
  }

  async saveOrder(order) {
    const isNew = !order.id || !isValidUUID(order.id);
    // Antes de criar um pedido novo, puxa os pedidos da nuvem para não repetir número
    if (isNew && this.supabaseClient) {
      await this.pullTable('pedidos', STORAGE_KEYS.ORDERS);
    }
    const orders = this.getOrders();
    if (!order.numero || orders.some(o => o.id !== order.id && String(o.numero) === String(order.numero))) {
      order.numero = this.getNextOrderNumber(orders);
    }
    if (isNew) {
      order.id = grafsisUUID();
      order.created_at = new Date().toISOString();
      if (!order.data_criacao) order.data_criacao = order.created_at;
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

  // Gestão de Empresas / Gráficas (Tenants)
  getTenants() {
    const list = this.getLocal(STORAGE_KEYS.TENANTS);
    return list.length ? list : DEFAULT_TENANTS;
  }

  getActiveTenant() {
    const tenants = this.getTenants();
    const currentUser = window.authModule ? window.authModule.getCurrentUser() : null;
    const empId = currentUser ? (currentUser.empresa_id || '001') : '001';
    return tenants.find(t => t.id === empId) || tenants[0] || DEFAULT_TENANTS[0];
  }

  async saveTenant(tenant) {
    const tenants = this.getTenants();
    // Bloqueio automático de empresa com plano expirado
    if (tenant.data_expiracao && new Date(tenant.data_expiracao + 'T23:59:59') < new Date()) {
      tenant.ativo = false;
    }

    if (!tenant.id) {
      // Gera ID aleatório de 3 dígitos (100 a 999) não colidente
      const existingIds = new Set(tenants.map(t => String(t.id).padStart(3, '0')));
      let randId = String(Math.floor(Math.random() * 900) + 100);
      for (let i = 0; i < 1000; i++) {
        const candidate = String(Math.floor(Math.random() * 900) + 100);
        if (!existingIds.has(candidate)) {
          randId = candidate;
          break;
        }
      }
      tenant.id = randId;
      tenant.created_at = new Date().toISOString();
      tenant.updated_at = tenant.created_at;
      tenants.push(tenant);
    } else {
      tenant.updated_at = new Date().toISOString();
      const index = tenants.findIndex(t => t.id === tenant.id);
      if (index >= 0) tenants[index] = tenant;
      else tenants.push(tenant);
    }
    this.saveLocal(STORAGE_KEYS.TENANTS, tenants);

    // Se conectado ao Supabase, sincroniza com empresas_tenants
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from('empresas_tenants').upsert(tenant);
      } catch (err) {
        console.warn('[Supabase] Falha ao sincronizar empresa_tenant:', err);
      }
    }
    return tenant;
  }

  async deleteTenant(id) {
    if (id === '001') {
      alert('A empresa matriz padrão não pode ser excluída.');
      return;
    }
    let tenants = this.getTenants().filter(t => t.id !== id);
    this.saveLocal(STORAGE_KEYS.TENANTS, tenants);
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from('empresas_tenants').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Falha ao deletar empresa_tenant:', err);
      }
    }
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