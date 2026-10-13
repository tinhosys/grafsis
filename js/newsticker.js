/* ==============================================================================
   GRAFSIS - Monitor de Notícias On-Line & RSS Feed Ticker Dinâmico
   Versão 4.9.0 - Tempo Real, Ticker da Esquerda para a Direita, Relógio Ativo,
   Fixação Alfinete (Mostrar/Esconder) e Configuração Centralizada por Empresa.
   ============================================================================== */

window.newsTickerModule = {
  feedUrl: '',
  newsItems: [],
  intervalId: null,
  clockIntervalId: null,
  isHidden: false,
  STORAGE_PREF_KEY: 'grafsis_news_ticker_pinned',
  STORAGE_FEED_KEY_PREFIX: 'grafsis_news_feed_',
  DEFAULT_FEED: 'https://g1.globo.com/rss/g1/economia/',

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
    this.fetchNews();

    // Atualização automática do feed a cada 5 minutos
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
          localStorage.setItem(this.STORAGE_FEED_KEY_PREFIX + tenantId, url);
        }
      } catch (err) {}
    }

    this.feedUrl = url || this.DEFAULT_FEED;
  },

  async saveFeedUrl(newUrl) {
    const tenantId = this.getTenantId();
    const cleanUrl = (newUrl || '').trim();
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
        console.warn('[NewsTicker] Não foi possível salvar na nuvem empresas_feed_noticias:', err);
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
      el.textContent = ${dia}// ::;
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
    const mainScroll = document.getElementById('main-content-scroll');

    if (this.isHidden) {
      if (bar) bar.classList.add('hidden');
      if (pinTab) pinTab.classList.remove('hidden');
      if (mainScroll) mainScroll.classList.remove('with-news-ticker');
    } else {
      if (bar) bar.classList.remove('hidden');
      if (pinTab) pinTab.classList.add('hidden');
      if (mainScroll) mainScroll.classList.add('with-news-ticker');
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

  async fetchNews() {
    const track = document.getElementById('news-ticker-track');
    if (!track) return;

    if (!this.feedUrl) {
      track.innerHTML = '<span class="px-4 text-xs text-slate-400">Nenhum feed RSS configurado.</span>';
      return;
    }

    try {
      let items = await this.tryFetchDirect(this.feedUrl);

      if (!items || items.length === 0) {
        items = await this.tryFetchRss2Json(this.feedUrl);
      }

      if (!items || items.length === 0) {
        items = await this.tryFetchAllOrigins(this.feedUrl);
      }

      if (items && items.length > 0) {
        this.newsItems = items.slice(0, 20);
        this.renderItems();
      } else {
        if (!this.newsItems || this.newsItems.length === 0) {
          track.innerHTML = '<span class="px-4 text-xs text-amber-500 font-medium">⚠️ Aguardando notícias do site configurado...</span>';
        }
      }
    } catch (e) {
      console.warn('[NewsTicker] Erro ao carregar feed:', e);
      if (!this.newsItems || this.newsItems.length === 0) {
        track.innerHTML = '<span class="px-4 text-xs text-slate-400">Notícias temporariamente indisponíveis no link.</span>';
      }
    }
  },

  async tryFetchDirect(url) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
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
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(target, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.items && Array.isArray(data.items)) {
        return data.items.map(it => ({
          title: it.title || '',
          link: it.link || ''
        }));
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
          if (t) items.push({ title: t.trim(), link: l.trim() });
        });
        return items;
      }

      const atomEntries = doc.querySelectorAll('entry');
      if (atomEntries && atomEntries.length > 0) {
        atomEntries.forEach(el => {
          const t = el.querySelector('title')?.textContent || '';
          const linkNode = el.querySelector('link');
          const l = linkNode ? (linkNode.getAttribute('href') || linkNode.textContent || '') : '';
          if (t) items.push({ title: t.trim(), link: l.trim() });
        });
        return items;
      }

      return items;
    } catch (e) {
      return null;
    }
  },

  renderItems() {
    const track = document.getElementById('news-ticker-track');
    if (!track) return;

    if (!this.newsItems || this.newsItems.length === 0) {
      track.innerHTML = '<span class="px-4 text-xs text-slate-400">Nenhuma notícia recente encontrada.</span>';
      return;
    }

    const renderList = [...this.newsItems, ...this.newsItems];
    track.innerHTML = '';
    renderList.forEach(item => {
      const a = document.createElement('a');
      a.href = item.link || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'news-ticker-item inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 transition whitespace-nowrap group';
      
      const dot = document.createElement('span');
      dot.className = 'w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform shrink-0';
      
      const txt = document.createElement('span');
      txt.textContent = item.title;
      txt.className = 'underline-offset-2 group-hover:underline';

      a.appendChild(dot);
      a.appendChild(txt);
      track.appendChild(a);
    });
  },

  openConfigModal() {
    if (window.authModule && !window.authModule.can('canManageNewsFeed')) {
      alert('Acesso Restrito: Apenas Gerente Geral, Proprietário ou Administrador do Sistema podem configurar o site de notícias da empresa.');
      return;
    }

    const currentUrl = this.feedUrl || this.DEFAULT_FEED;
    const modalHtml = 
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
              <input type="url" id="input-rss-feed-url" value="" placeholder="Ex: https://g1.globo.com/rss/g1/economia/" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

            <div class="space-y-1 pt-1">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Sugestões de Portais:</span>
              <div class="flex flex-wrap gap-1.5">
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://g1.globo.com/rss/g1/economia/'" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition">
                  G1 Economia
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://g1.globo.com/rss/g1/'" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition">
                  G1 Notícias
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://feeds.folha.uol.com.br/mercado/rss091.xml'" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition">
                  Folha Mercado
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://rss.uol.com.br/feed/noticias.xml'" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition">
                  UOL Notícias
                </button>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-[11px]">
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
            " class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition">
              Salvar para a Empresa
            </button>
          </div>
        </div>
      </div>
    ;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
};
