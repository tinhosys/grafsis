/* ==============================================================================
   GRAFSIS - Monitor de Notícias On-Line & RSS Feed Ticker Dinâmico
   Versão 4.9.7.4 - Feed Oficial Roxo News (https://roxo.news/feed/),
   Layout Flex Nativo de Rodapé Widescreen, Motor Contínuo Multi-Ciclo Seamless
   via requestAnimationFrame com getBoundingClientRect, Categorias em Destaque
   e Redirecionamento no Clique.
   ============================================================================== */

window.newsTickerModule = {
  feedUrl: '',
  newsItems: [],
  intervalId: null,
  clockIntervalId: null,
  animationFrameId: null,
  scrollOffset: 0,
  scrollSpeed: 0.85, // Velocidade contínua e suave (~50px/s)
  isPaused: false,
  hoverListenersAttached: false,
  isHidden: false,
  STORAGE_PREF_KEY: 'grafsis_news_ticker_pinned',
  STORAGE_FEED_KEY_PREFIX: 'grafsis_news_feed_',
  DEFAULT_FEED: 'https://roxo.news/feed/',

  // Notícias Reais Pré-Carregadas do Roxo News (Execução Imediata e Fallback Rico)
  FALLBACK_NEWS: [
    {
      title: 'Fluminense x Palmeiras: confira onde assistir e as prováveis escalações',
      link: 'https://roxo.news/esportes/fluminense-x-palmeiras-confira-onde-assistir-e-as-provaveis-escalacoes/',
      category: 'ESPORTES'
    },
    {
      title: 'Acordo Mercosul-UE impulsiona exportações brasileiras em 30,7%, e país amplia mercados do agro',
      link: 'https://roxo.news/economia/acordo-mercosul-ue-impulsiona-exportacoes-brasileiras-em-307-e-pais-amplia-mercados-do-agro/',
      category: 'ECONOMIA'
    },
    {
      title: 'CBF lamenta morte de Silvio Barsetti; jornalista terá homenagem em jogo da seleção feminina',
      link: 'https://roxo.news/esportes/cbf-lamenta-morte-de-silvio-barsetti-jornalista-tera-homenagem-em-jogo-da-selecao-feminina/',
      category: 'RECONHECIMENTO'
    },
    {
      title: 'Retiram grade de passarela das Cataratas do Iguaçu após cheia histórica',
      link: 'https://roxo.news/brasil/retiram-grade-de-passarela-das-cataratas-do-iguacu/',
      category: 'TURISMO'
    },
    {
      title: '\'Linha dura\' e polêmico: as histórias de Seedorf como jogador por onde passou',
      link: 'https://roxo.news/esportes/linha-dura-e-polemico-as-historias-de-seedorf-como-jogador-por-onde-passou/',
      category: 'COMANDANTE'
    },
    {
      title: 'Eleições 2026: Principais propostas econômicas em debate no Congresso Nacional',
      link: 'https://roxo.news/politica/',
      category: 'POLÍTICA'
    },
    {
      title: 'Mercado financeiro eleva projeção de crescimento do PIB para o próximo trimestre',
      link: 'https://roxo.news/economia/',
      category: 'MERCADO'
    },
    {
      title: 'Produção industrial avança puxada pelo setor de comunicação visual e gráfica',
      link: 'https://roxo.news/economia/',
      category: 'INDÚSTRIA'
    },
    {
      title: 'Petrobras anuncia novos investimentos em sustentabilidade e eficiência energética',
      link: 'https://roxo.news/economia/',
      category: 'ENERGIA'
    },
    {
      title: 'Inovação e automação digital impulsionam gráficas e prestadores de serviços no Brasil',
      link: 'https://roxo.news/tecnologia/',
      category: 'TECNOLOGIA'
    }
  ],

  init() {
    try {
      const savedPin = localStorage.getItem(this.STORAGE_PREF_KEY);
      this.isHidden = savedPin === 'hidden';
    } catch (e) {
      this.isHidden = false;
    }

    this.applyVisibility();
    this.startClock();
    this.loadFeedConfig();

    // Renderiza imediatamente as notícias de fallback enquanto a busca remota carrega
    this.newsItems = [...this.FALLBACK_NEWS];
    this.renderItems();

    // Inicia o motor de movimento contínuo ininterrupto
    this.startMarqueeEngine();

    // Busca remota atualizada do feed Roxo News
    this.fetchNews();

    // Atualização automática periódica a cada 5 minutos
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.fetchNews();
    }, 5 * 60 * 1000);
  },

  getTenantId() {
    if (window.store && typeof window.store.getActiveTenant === 'function') {
      const t = window.store.getActiveTenant();
      return (t && t.id) ? String(t.id) : '001';
    }
    const user = window.authModule ? window.authModule.getCurrentUser() : null;
    return (user && user.empresa_id) ? String(user.empresa_id) : '001';
  },

  normalizeUrl(rawUrl) {
    if (!rawUrl) return this.DEFAULT_FEED;
    let u = rawUrl.trim();
    if (u.includes('g1.globo.com')) {
      return this.DEFAULT_FEED;
    }
    if (u === 'https://roxo.news' || u === 'https://roxo.news/' || u === 'http://roxo.news' || u === 'http://roxo.news/') {
      return this.DEFAULT_FEED;
    }
    return u;
  },

  async loadFeedConfig() {
    const tenantId = this.getTenantId();
    let url = localStorage.getItem(this.STORAGE_FEED_KEY_PREFIX + tenantId) || '';

    if (window.store && window.store.supabaseClient) {
      try {
        const { data, error } = await window.store.runWithTimeout(
          window.store.supabaseClient
            .from('empresas_feed_noticias')
            .select('rss_url')
            .eq('empresa_id', tenantId)
            .maybeSingle(),
          3000
        );
        if (!error && data && data.rss_url) {
          url = data.rss_url;
        }
      } catch (err) {}
    }

    this.feedUrl = this.normalizeUrl(url);
    localStorage.setItem(this.STORAGE_FEED_KEY_PREFIX + tenantId, this.feedUrl);
  },

  async saveFeedUrl(newUrl) {
    const tenantId = this.getTenantId();
    const cleanUrl = this.normalizeUrl(newUrl);
    if (!cleanUrl) return;

    this.feedUrl = cleanUrl;
    localStorage.setItem(this.STORAGE_FEED_KEY_PREFIX + tenantId, cleanUrl);

    if (window.store && window.store.supabaseClient) {
      try {
        const user = window.authModule ? window.authModule.getCurrentUser() : null;
        await window.store.runWithTimeout(
          window.store.supabaseClient.from('empresas_feed_noticias').upsert({
            empresa_id: tenantId,
            rss_url: cleanUrl,
            atualizado_por: user ? (user.operador || user.nome || user.login) : 'Gerência',
            updated_at: new Date().toISOString()
          }),
          3500
        );
      } catch (err) {
        console.warn('[NewsTicker] Não foi possível salvar empresas_feed_noticias no banco:', err);
      }
    }

    this.fetchNews();
  },

  startClock() {
    const updateTime = () => {
      const el = document.getElementById('news-ticker-clock');
      if (!el) return;
      const now = new Date();
      const dia = String(now.getDate()).padStart(2, '0');
      const mes = String(now.getMonth() + 1).padStart(2, '0');
      const ano = now.getFullYear();
      const hora = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const seg = String(now.getSeconds()).padStart(2, '0');
      el.textContent = `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
    };

    updateTime();
    if (this.clockIntervalId) clearInterval(this.clockIntervalId);
    this.clockIntervalId = setInterval(updateTime, 1000);
  },

  toggle() {
    this.isHidden = !this.isHidden;
    try {
      localStorage.setItem(this.STORAGE_PREF_KEY, this.isHidden ? 'hidden' : 'visible');
    } catch (e) {}
    this.applyVisibility();
  },

  applyVisibility() {
    const bar = document.getElementById('news-ticker-bar');
    const pinTab = document.getElementById('news-ticker-pin-tab');

    if (this.isHidden) {
      if (bar) bar.classList.add('hidden');
      if (pinTab) pinTab.classList.remove('hidden');
    } else {
      if (bar) bar.classList.remove('hidden');
      if (pinTab) pinTab.classList.add('hidden');
      this.startMarqueeEngine();
    }

    this.updateManageAccess();
  },

  updateManageAccess() {
    const btnCfg = document.getElementById('btn-ticker-config');
    if (!btnCfg) return;
    const canManage = window.authModule && window.authModule.can('canManageNewsFeed');
    if (canManage) {
      btnCfg.classList.remove('hidden');
    } else {
      btnCfg.classList.add('hidden');
    }
  },

  /* ==============================================================================
     MOTOR DE MOVIMENTO CONTÍNUO MULTI-CICLO (Loop Infinito da Direita para a Esquerda)
     ============================================================================== */
  startMarqueeEngine() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const track = document.getElementById('news-ticker-track');
    const viewport = document.querySelector('.news-ticker-viewport');
    if (!track || !viewport) return;

    if (!this.hoverListenersAttached) {
      viewport.addEventListener('mouseenter', () => { this.isPaused = true; });
      viewport.addEventListener('mouseleave', () => { this.isPaused = false; });
      viewport.addEventListener('touchstart', () => { this.isPaused = true; }, { passive: true });
      viewport.addEventListener('touchend', () => { this.isPaused = false; });
      this.hoverListenersAttached = true;
    }

    const tick = () => {
      if (!this.isHidden && track) {
        const firstCycle = track.querySelector('.news-cycle');
        if (firstCycle) {
          const cycleWidth = firstCycle.getBoundingClientRect().width;
          if (cycleWidth > 50) {
            if (!this.isPaused) {
              this.scrollOffset += this.scrollSpeed;
              if (this.scrollOffset >= cycleWidth) {
                // Preserva o resto sub-pixel sem engasgos ou cortes
                this.scrollOffset -= cycleWidth;
              }
              track.style.transform = `translate3d(-${this.scrollOffset}px, 0, 0)`;
            }
          }
        }
      }
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  },

  async fetchNews() {
    const track = document.getElementById('news-ticker-track');
    if (!track) return;

    const url = this.feedUrl || this.DEFAULT_FEED;

    try {
      let items = await this.tryFetchRss2Json(url);

      if (!items || items.length === 0) {
        items = await this.tryFetchAllOrigins(url);
      }

      if (!items || items.length === 0) {
        items = await this.tryFetchDirect(url);
      }

      if (items && items.length > 0) {
        this.newsItems = items.slice(0, 25);
        this.renderItems();
      } else if (!this.newsItems || this.newsItems.length === 0) {
        this.newsItems = [...this.FALLBACK_NEWS];
        this.renderItems();
      }
    } catch (e) {
      console.warn('[NewsTicker] Erro ao carregar feed:', e);
      if (!this.newsItems || this.newsItems.length === 0) {
        this.newsItems = [...this.FALLBACK_NEWS];
        this.renderItems();
      }
    }
  },

  async tryFetchDirect(url) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3500);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const text = await res.text();
      return this.parseXml(text);
    } catch (e) {
      return null;
    }
  },

  async tryFetchRss2Json(url) {
    try {
      const target = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4500);
      const res = await fetch(target, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.items && Array.isArray(data.items)) {
        return data.items.map(it => {
          let cat = 'DESTAQUE';
          if (it.categories && Array.isArray(it.categories) && it.categories.length > 0) {
            cat = String(it.categories[0]).trim().toUpperCase();
          }
          return {
            title: it.title || '',
            link: it.link || 'https://roxo.news/',
            category: cat
          };
        });
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async tryFetchAllOrigins(url) {
    try {
      const target = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4500);
      const res = await fetch(target, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.contents) {
        return this.parseXml(data.contents);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  parseXml(xmlText) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      const items = [];

      const rssItems = doc.querySelectorAll('item');
      if (rssItems && rssItems.length > 0) {
        rssItems.forEach(el => {
          const t = el.querySelector('title')?.textContent || '';
          const l = el.querySelector('link')?.textContent || '';
          const c = el.querySelector('category')?.textContent || 'DESTAQUE';
          if (t) {
            items.push({
              title: t.trim(),
              link: l.trim() || 'https://roxo.news/',
              category: c.trim().toUpperCase()
            });
          }
        });
        return items;
      }

      const atomEntries = doc.querySelectorAll('entry');
      if (atomEntries && atomEntries.length > 0) {
        atomEntries.forEach(el => {
          const t = el.querySelector('title')?.textContent || '';
          const linkNode = el.querySelector('link');
          const l = linkNode ? (linkNode.getAttribute('href') || linkNode.textContent || '') : '';
          const c = el.querySelector('category')?.getAttribute('term') || el.querySelector('category')?.textContent || 'DESTAQUE';
          if (t) {
            items.push({
              title: t.trim(),
              link: l.trim() || 'https://roxo.news/',
              category: c.trim().toUpperCase()
            });
          }
        });
        return items;
      }

      return items;
    } catch (e) {
      return null;
    }
  },

  createCycleElement(items) {
    const cycle = document.createElement('div');
    cycle.className = 'news-cycle flex items-center shrink-0';

    items.forEach(item => {
      const a = document.createElement('a');
      a.href = item.link || 'https://roxo.news/';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'news-ticker-item inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 whitespace-nowrap group select-none transition-colors shrink-0';
      a.title = `Clique para ler matéria completa em Roxo News: ${item.title}`;

      // Badge de Categoria em Caixa Alta (estilo oficial Roxo News)
      const badge = document.createElement('span');
      badge.className = 'inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors';
      badge.textContent = item.category || 'DESTAQUE';

      // Título da Notícia
      const txt = document.createElement('span');
      txt.textContent = item.title;
      txt.className = 'underline-offset-2 group-hover:underline text-[11.5px] font-medium text-slate-700 dark:text-slate-200';

      // Separador discreto entre as notícias
      const separator = document.createElement('span');
      separator.className = 'text-slate-300 dark:text-slate-700 ml-2 select-none';
      separator.textContent = '•';

      a.appendChild(badge);
      a.appendChild(txt);
      a.appendChild(separator);
      cycle.appendChild(a);
    });

    return cycle;
  },

  renderItems() {
    const track = document.getElementById('news-ticker-track');
    if (!track) return;

    const list = (this.newsItems && this.newsItems.length > 0) ? this.newsItems : this.FALLBACK_NEWS;
    track.innerHTML = '';

    // Cria 3 ciclos idênticos consecutivos garantindo preenchimento contínuo e sem corte
    track.appendChild(this.createCycleElement(list));
    track.appendChild(this.createCycleElement(list));
    track.appendChild(this.createCycleElement(list));

    // Reinicia o motor contínuo com os novos blocos
    this.startMarqueeEngine();
  },

  openConfigModal() {
    if (window.authModule && !window.authModule.can('canManageNewsFeed')) {
      alert('Acesso Restrito: Apenas Gerente Geral, Proprietário ou Administrador do Sistema podem configurar o site de notícias da empresa.');
      return;
    }

    const currentUrl = this.feedUrl || this.DEFAULT_FEED;
    const modalHtml = `
      <div id="news-feed-config-modal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-xl">📡</span>
              <h3 class="text-base font-black text-slate-800 dark:text-white">Configurar Feed de Notícias (RSS)</h3>
            </div>
            <button onclick="document.getElementById('news-feed-config-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
          </div>

          <div class="py-4 space-y-3 text-xs">
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              O feed de notícias é unificado para <strong>todos os usuários da empresa</strong> que utilizam o GRAFSIS. Insira abaixo a URL do feed RSS do site jornalístico desejado:
            </p>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">URL do Feed RSS / Notícias:</label>
              <input type="url" id="input-rss-feed-url" value="${currentUrl}" placeholder="Ex: https://roxo.news/feed/" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none">
            </div>

            <div class="space-y-1.5 pt-1">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Portais Recomendados:</span>
              <div class="flex flex-wrap gap-1.5">
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://roxo.news/feed/'" class="px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-lg text-[10px] font-bold border border-purple-200 dark:border-purple-800 transition flex items-center gap-1">
                  <span>⚡</span>
                  <span>Roxo News (Padrão Oficial)</span>
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://g1.globo.com/rss/g1/economia/'" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition">
                  G1 Economia
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://feeds.folha.uol.com.br/mercado/rss091.xml'" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition">
                  Folha Mercado
                </button>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-200 text-[11px]">
              🔒 <strong>Permissão Exclusiva:</strong> Apenas Gerente, Proprietário e Administrador podem alterar esta fonte.
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button onclick="document.getElementById('news-feed-config-modal').remove()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              Cancelar
            </button>
            <button onclick="
              const val = document.getElementById('input-rss-feed-url')?.value;
              if (val) {
                newsTickerModule.saveFeedUrl(val);
                document.getElementById('news-feed-config-modal').remove();
              }
            " class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition">
              Salvar para a Empresa
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
};
