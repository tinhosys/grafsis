/* ==============================================================================
   GRAFSIS - Módulo de Clientes
   Cadastro Completo: Nome, Apelido, WhatsApp, Plus Code, Foto, CEP, etc.
   ============================================================================== */

window.clientsModule = {
  openLetters: { A: true, C: true },
  searchTerm: '',

  seedDemoClientsIfEmpty() {
    let clients = window.store.getClients();
    if (!clients || clients.length < 2) {
      const demoClients = [
        {
          id: 'demo-c1',
          nome: 'Acme Comunicação',
          apelido: 'Acme',
          segmento: 'Brindes',
          email: 'contato@aransis.on.br',
          telefone_whatsapp: '(69) 99922-1336',
          status: 'Ativo',
          cidade: 'Porto Velho',
          uf: 'RO',
          avatarBg: '#0b2545',
          avatarText: 'Acme'
        },
        {
          id: 'demo-c2',
          nome: 'Alvorada Brindes',
          apelido: 'Alvorada',
          segmento: 'Brindes',
          email: 'contato@aransis.on.br',
          telefone_whatsapp: '(69) 9992-7831',
          status: 'Ativo',
          cidade: 'Porto Velho',
          uf: 'RO',
          foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
        },
        {
          id: 'demo-c3',
          nome: 'Art & Estampa',
          apelido: 'Art Estampa',
          segmento: 'Estamparia',
          email: 'contato@aransis.on.br',
          telefone_whatsapp: '(69) 99922-2000',
          status: 'Ativo',
          cidade: 'Ji-Paraná',
          uf: 'RO',
          foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
        },
        {
          id: 'demo-c4',
          nome: 'Cores & Artes',
          apelido: 'Cores Artes',
          segmento: 'Estamparia',
          email: 'contato@aransis.on.br',
          telefone_whatsapp: '(69) 99922-1336',
          status: 'Ativo',
          cidade: 'Ariquemes',
          uf: 'RO'
        },
        {
          id: 'demo-c5',
          nome: 'Criações Gráficas',
          apelido: 'Criações',
          segmento: 'Comunicação Visual',
          email: 'contato@aransis.on.br',
          telefone_whatsapp: '(69) 99922-1336',
          status: 'Ativo',
          cidade: 'Cacoal',
          uf: 'RO'
        }
      ];
      if (!clients || clients.length === 0) {
        window.store.saveLocal(STORAGE_KEYS.CLIENTS, demoClients);
      }
    }
  },

  renderCard(cli) {
    const cleanPhone = (cli.telefone_whatsapp || '').replace(/\D/g, '');
    const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : `https://wa.me/5569999221336`;
    const segmento = cli.segmento || (cli.observacoes ? cli.observacoes.slice(0, 25) : 'Brindes');
    const email = cli.email || '@aransis.on.br';
    const initials = (cli.nome || 'CL').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const isAtivo = cli.status !== 'Inativo' && cli.bloqueado !== true;

    return `
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between group relative">
        <!-- Topo do Card -->
        <div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-slate-900 text-sm truncate leading-snug cursor-pointer hover:text-blue-600 transition" onclick="clientsModule.editModal('${cli.id}')" title="${cli.nome}">
                ${cli.nome}
              </h4>
              <p class="text-xs text-slate-500 font-medium mt-0.5">${segmento}</p>
              <p class="text-xs text-slate-400 truncate mt-1">Contato: ${email}</p>
            </div>
            
            <!-- Avatar Redondo / Logo à Direita -->
            <div class="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm flex items-center justify-center bg-slate-900">
              ${cli.foto_url ? `
                <img src="${cli.foto_url}" class="w-full h-full object-cover" alt="${cli.nome}">
              ` : `
                <div class="w-full h-full flex items-center justify-center font-bold text-xs text-white uppercase ${cli.avatarBg ? '' : 'bg-[#0b2545]'}" style="${cli.avatarBg ? `background-color: ${cli.avatarBg}` : ''}">
                  ${cli.avatarText || initials}
                </div>
              `}
            </div>
          </div>

          <!-- Telefone / WhatsApp com Ícone -->
          <div class="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-100">
            <div class="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              <a href="${waLink}" target="_blank" class="hover:text-emerald-600 font-semibold tracking-tight">
                ${cli.telefone_whatsapp || '(69) 99922-1336'}
              </a>
            </div>

            <!-- Badge de Status Verde Ativo -->
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isAtivo ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}">
              ${isAtivo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        <!-- Ações do Card em Hover / Acesso Rápido -->
        <div class="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between opacity-80 group-hover:opacity-100 transition">
          <button onclick="salesModule.createOrderForClient('${cli.id}')" class="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            + Orçamento
          </button>
          <div class="flex items-center gap-1">
            <button onclick="clientsModule.editModal('${cli.id}')" class="p-1 text-slate-400 hover:text-slate-700 rounded transition" title="Editar Cliente">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button onclick="clientsModule.delete('${cli.id}')" class="p-1 text-slate-400 hover:text-red-600 rounded transition" title="Excluir">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleLetter(letter) {
    if (!this.openLetters) this.openLetters = {};
    this.openLetters[letter] = !this.openLetters[letter];
    this.render();
  },

  scrollToLetter(letter) {
    if (!this.openLetters) this.openLetters = {};
    this.openLetters[letter] = true;
    this.render();
    setTimeout(() => {
      const el = document.getElementById(`letter-group-${letter}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  },

  search(term) {
    this.searchTerm = term;
    this.render();
    const input = document.getElementById('client-search');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  },

  clearSearch() {
    this.searchTerm = '';
    this.render();
    const input = document.getElementById('client-search');
    if (input) {
      input.value = '';
      input.focus();
    }
  },

  render() {
    this.seedDemoClientsIfEmpty();
    const clients = window.store.getClients();
    const container = document.getElementById('view-container');
    if (!container) return;

    // Alfabeto completo A-Z
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Letras para o acordeão (todas que têm clientes + B, D, E, F que aparecem na arte de referência)
    const featuredLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const activeLettersWithClients = alphabet.filter(l => clients.some(c => (c.nome || '').trim().toUpperCase().startsWith(l)));
    const allDisplayLetters = Array.from(new Set([...featuredLetters, ...activeLettersWithClients]));
    allDisplayLetters.sort();

    // Filtro de busca se houver
    const term = (this.searchTerm || '').trim().toLowerCase();

    // Régua Alfabética Vertical A - Z (Azul Royal para letras com clientes, Azul bem claro para letras sem clientes)
    const alphabetRulerHtml = alphabet.map(l => {
      const hasClients = clients.some(c => (c.nome || '').trim().toUpperCase().startsWith(l));
      const isSelected = this.openLetters && this.openLetters[l];

      if (hasClients) {
        return `
          <button 
            type="button"
            onclick="clientsModule.scrollToLetter('${l}')" 
            class="w-6 h-6 rounded-md ${isSelected ? 'bg-[#0052cc] text-white ring-2 ring-blue-300' : 'bg-[#0052cc] text-white'} font-black text-xs flex items-center justify-center shadow-sm my-0.5 hover:bg-blue-700 transition" 
            title="Ir para letra ${l} (Possui clientes)">
            ${l}
          </button>
        `;
      } else {
        return `
          <button 
            type="button"
            onclick="clientsModule.scrollToLetter('${l}')" 
            class="w-6 h-5 rounded bg-blue-50/70 border border-blue-100 text-blue-400 hover:text-blue-700 hover:bg-blue-100 font-semibold text-[11px] flex items-center justify-center my-0.5 transition" 
            title="Letra ${l} (0 clientes)">
            ${l}
          </button>
        `;
      }
    }).join('');

    // Grupos Acordeão
    const groupsHtml = allDisplayLetters.map(letter => {
      const groupClients = clients.filter(c => (c.nome || '').trim().toUpperCase().startsWith(letter));
      
      // Se houver busca ativa, filtra dentro da letra
      const matchingClients = term ? groupClients.filter(c => 
        (c.nome && c.nome.toLowerCase().includes(term)) ||
        (c.apelido && c.apelido.toLowerCase().includes(term)) ||
        (c.cpf_cnpj && c.cpf_cnpj.includes(term)) ||
        (c.telefone_whatsapp && c.telefone_whatsapp.includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.cidade && c.cidade.toLowerCase().includes(term))
      ) : groupClients;

      if (term && matchingClients.length === 0) return '';

      const isOpen = term ? true : !!(this.openLetters && this.openLetters[letter]);
      const count = groupClients.length;

      // REGRA: AZUL ROYAL se tiver algum cliente na letra, AZUL BEM CLARO se cliente = 0
      const isRoyal = count > 0;
      const barBg = isRoyal ? 'bg-[#0052cc] text-white shadow-md shadow-blue-600/20' : 'bg-blue-50/90 text-blue-800 border border-blue-200/90 hover:bg-blue-100/90';
      const arrowColor = isRoyal ? 'text-white' : 'text-blue-500';

      return `
        <div id="letter-group-${letter}" class="rounded-2xl overflow-hidden shadow-sm transition">
          <!-- Barra de Cabeçalho do Acordeão da Letra (Azul Royal vs Azul Bem Claro) -->
          <div 
            onclick="clientsModule.toggleLetter('${letter}')"
            class="${barBg} px-4 py-3 rounded-2xl flex items-center justify-between font-bold text-sm shadow-sm cursor-pointer select-none hover:opacity-95 transition">
            <span class="tracking-wide">${letter} (${count} cliente${count !== 1 ? 's' : ''})</span>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${arrowColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${isOpen ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}"></path>
              </svg>
            </div>
          </div>

          <!-- Conteúdo da Letra (Cards de Clientes) -->
          <div class="${isOpen ? 'block' : 'hidden'} mt-2 mb-4">
            ${matchingClients.length === 0 ? `
              <div class="py-6 px-4 bg-white/70 border border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-medium">
                Nenhum cliente cadastrado nesta letra.
              </div>
            ` : `
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${matchingClients.map(c => this.renderCard(c)).join('')}
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Barra de Título, Busca e Botão Novo Cliente (Conforme Imagem Oficial) -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div class="flex items-center gap-4 flex-1">
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Clientes</h1>
            
            <!-- Campo de Busca Estilizado com Ícone e Botão Limpar -->
            <div class="flex items-center gap-2">
              <div class="relative w-64 sm:w-80">
                <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  type="text" 
                  id="client-search" 
                  value="${this.searchTerm || ''}"
                  oninput="clientsModule.search(this.value)" 
                  placeholder="Buscar cliente..." 
                  class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition">
              </div>
              <button 
                type="button" 
                onclick="clientsModule.clearSearch()" 
                title="Limpar busca"
                class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200 shadow-sm cursor-pointer shrink-0">
                ✕ Limpar
              </button>
            </div>
          </div>

          <!-- Botão Novo Cliente Azul Vibrante -->
          <div class="shrink-0">
            <button 
              onclick="clientsModule.openModal()" 
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0066ff] hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer">
              <span class="text-base font-black leading-none">+</span>
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>

        <!-- Layout de Duas Colunas: Régua A-Z à Esquerda + Acordeão à Direita -->
        <div class="flex items-start gap-4">
          <!-- Régua Alfabética Vertical A a Z -->
          <div id="alphabet-quick-index" class="hidden sm:flex flex-col items-center bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm shrink-0 select-none sticky top-4 max-h-[85vh] overflow-y-auto">
            ${alphabetRulerHtml}
          </div>

          <!-- Coluna com os Grupos de Acordeão -->
          <div class="flex-1 min-w-0 space-y-3">
            ${groupsHtml || `<div class="py-12 text-center text-slate-400 font-bold bg-white rounded-2xl border border-slate-200">Nenhum cliente encontrado para o termo pesquisado.</div>`}
          </div>
        </div>
      </div>
    `;
  },

  openModal(client = null) {
    const existingModal = document.getElementById('client-modal');
    if (existingModal) existingModal.remove();

    const isEdit = !!client;
    this.currentEditingClientId = client ? client.id : null;
    const clientUf = client ? (client.uf || (client.cidade && typeof client.cidade === 'string' && client.cidade.includes(' - ') ? client.cidade.split(' - ')[1].trim().toUpperCase() : 'RO')) : '';
    const clientCidade = client ? (client.cidade ? (typeof client.cidade === 'string' && client.cidade.includes(' - ') ? client.cidade.split(' - ')[0].trim() : String(client.cidade)) : '') : '';

    const modalHtml = `
      <div id="client-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex flex-col gap-3 pb-4 border-b border-slate-100">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <h2 class="text-lg font-bold text-slate-800">${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <!-- Chave Ativo/Bloqueado -->
                <label id="client-status-label" class="flex items-center cursor-pointer" title="Status do Cliente (Ativo / Bloqueado)">
                  <div class="relative">
                    <input type="checkbox" id="client-status-checkbox" name="status" value="ativo" class="sr-only" ${!client || client.status !== 'bloqueado' ? 'checked' : ''} onchange="this.nextElementSibling.classList.toggle('bg-blue-600'); this.nextElementSibling.classList.toggle('bg-slate-300'); this.nextElementSibling.firstElementChild.classList.toggle('translate-x-full'); this.parentElement.nextElementSibling.innerText = this.checked ? 'Ativo' : 'Bloqueado';">
                    <div class="block w-10 h-6 rounded-full transition-colors ${!client || client.status !== 'bloqueado' ? 'bg-blue-600' : 'bg-slate-300'}">
                      <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${!client || client.status !== 'bloqueado' ? 'translate-x-full' : ''}"></div>
                    </div>
                  </div>
                  <span class="ml-2 text-xs font-semibold text-slate-600">${!client || client.status !== 'bloqueado' ? 'Ativo' : 'Bloqueado'}</span>
                </label>
              </div>
              <div class="flex items-center gap-3">
                ${client ? `<div class="text-[10px] text-slate-400 text-right leading-tight border-r border-slate-200 pr-3">Cadastrado: ${new Date(client.created_at || new Date()).toLocaleString('pt-BR')}<br>Editado: ${new Date(client.updated_at || new Date()).toLocaleString('pt-BR')}</div>` : ''}
                <button type="button" onclick="document.getElementById('client-modal').remove()" class="text-slate-400 hover:text-slate-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
            ${!isEdit ? `
            <!-- Busca Localize (Verde) -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input type="text" oninput="clientsModule.searchInModal(this.value)" placeholder="Localize ao digitar (Nome, Telefone, Fantasia)..." class="block w-full pl-10 pr-3 py-2 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm bg-green-50 placeholder-green-600/50">
              <div id="modal-search-results" class="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-slate-200 hidden max-h-48 overflow-y-auto"></div>
            </div>
            ` : ''}
          </div>

          <form id="client-form" onsubmit="clientsModule.save(event, '${client ? client.id : ''}')" class="mt-4 space-y-4">
            <input type="hidden" name="client_id" id="client-id-field" value="${client ? client.id : ''}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2 flex justify-end gap-4 mb-2">
                <label class="flex items-center gap-1 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input type="radio" name="tipo_pessoa" value="PF" ${!client || client.tipo_pessoa !== 'PJ' ? 'checked' : ''} onchange="clientsModule.toggleTipoPessoa(this.value)"> Pessoa Física
                </label>
                <label class="flex items-center gap-1 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input type="radio" name="tipo_pessoa" value="PJ" ${client && client.tipo_pessoa === 'PJ' ? 'checked' : ''} onchange="clientsModule.toggleTipoPessoa(this.value)"> Pessoa Jurídica
                </label>
              </div>

              <!-- Foto superior esquerda e Dados à direita -->
              <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <div class="col-span-1 flex flex-col items-center border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <div class="w-24 h-24 bg-white border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center mb-2 shadow-sm">
                    <img id="client-foto-preview" src="${client && client.foto_url ? client.foto_url : ''}" class="w-full h-full object-cover ${client && client.foto_url ? '' : 'hidden'}">
                    <svg id="client-foto-icon" class="w-8 h-8 text-slate-300 ${client && client.foto_url ? 'hidden' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <input type="text" name="foto_url" id="client-foto-url" value="${client ? (client.foto_url || '') : ''}" placeholder="URL da foto" class="hidden w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none mb-1" oninput="document.getElementById('client-foto-preview').src=this.value; document.getElementById('client-foto-preview').classList.remove('hidden'); document.getElementById('client-foto-icon').classList.add('hidden');">
                  <div class="flex gap-1 w-full mt-1">
                    <label class="flex-1 text-center cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 px-1 py-1 rounded text-[10px] font-semibold border border-blue-100">
                      Câmera
                      <input type="file" accept="image/*" capture onchange="clientsModule.handlePhotoUpload(this)" class="hidden">
                    </label>
                    <label class="flex-1 text-center cursor-pointer bg-slate-50 text-slate-700 hover:bg-slate-100 px-1 py-1 rounded text-[10px] font-semibold border border-slate-200">
                      Arquivo
                      <input type="file" accept="image/*" onchange="clientsModule.handlePhotoUpload(this)" class="hidden">
                    </label>
                  </div>
                </div>

                <div class="col-span-3 space-y-4">
                  <div>
                    <label id="lbl-nome" class="block text-xs font-semibold text-slate-600 mb-1">${!client || client.tipo_pessoa !== 'PJ' ? 'Nome *' : 'Razão Social *'}</label>
                    <input type="text" name="nome" required value="${client ? client.nome : ''}" oninput="clientsModule.handleNomeInput(this)" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label id="lbl-apelido" class="block text-xs font-semibold text-slate-600 mb-1">${!client || client.tipo_pessoa !== 'PJ' ? 'Nome Popular' : 'Nome Fantasia'}</label>
                      <input type="text" name="apelido" id="client-apelido" value="${client ? (client.apelido || '') : ''}" oninput="this.dataset.userEdited='true'" placeholder="Ex: Marcos" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>
                    <div>
                      <label id="lbl-cpf" class="block text-xs font-semibold text-slate-600 mb-1">${!client || client.tipo_pessoa !== 'PJ' ? 'CPF' : 'CNPJ'}</label>
                      <input type="text" name="cpf_cnpj" value="${client ? (client.cpf_cnpj || '') : ''}" oninput="this.value = clientsModule.maskCpfCnpj(this.value)" onblur="clientsModule.validaCpfCnpj(this)" placeholder="000.000.000-00" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <p id="cpf-error" class="text-red-500 text-[10px] font-bold mt-1 hidden">Documento Inválido</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Telefone WhatsApp *</label>
                <input type="text" name="telefone_whatsapp" required value="${client ? client.telefone_whatsapp : ''}" placeholder="(00) 0 0000-0000" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" oninput="this.value = clientsModule.maskPhone(this.value)">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">E-mail *</label>
                <input type="email" name="email" required value="${client ? (client.email || '') : ''}" placeholder="cliente@email.com" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Instagram</label>
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-slate-400">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.834a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </span>
                  <input type="text" name="instagram" value="${client ? (client.instagram || '') : ''}" placeholder="instagram.com/" class="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" oninput="this.value = this.value.replace(/^@/, '')">
                  <a href="#" onclick="const v=this.previousElementSibling.value; if(v) window.open('https://instagram.com/'+v.replace('instagram.com/', ''), '_blank')" class="absolute right-3 text-blue-500 hover:text-blue-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </div>
              </div>

              <div class="${client && client.tipo_pessoa === 'PJ' ? 'hidden' : ''}" id="container-data-nascimento">
                <label class="block text-xs font-semibold text-slate-600 mb-1">Data de Nascimento</label>
                <input type="date" name="data_nascimento" value="${client ? (client.data_nascimento || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div class="${client && client.tipo_pessoa === 'PJ' ? 'hidden' : ''}" id="container-genero">
                <label class="block text-xs font-semibold text-slate-600 mb-1">Gênero</label>
                <div class="flex gap-4 items-center h-9">
                  <label class="flex items-center gap-1 text-sm text-slate-700 cursor-pointer">
                    <input type="radio" name="genero" value="M" ${client && client.genero === 'M' ? 'checked' : ''}> Masculino
                  </label>
                  <label class="flex items-center gap-1 text-sm text-slate-700 cursor-pointer">
                    <input type="radio" name="genero" value="F" ${client && client.genero === 'F' ? 'checked' : ''}> Feminino
                  </label>
                </div>
              </div>

              <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="col-span-3 relative">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Endereço / Logradouro</label>
                  <input type="text" name="logradouro" id="client-logradouro" autocomplete="off" value="${client ? (client.logradouro || client.endereco || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" oninput="clientsModule.searchAddress(this.value)">
                  <div id="address-suggestions" class="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-slate-200 hidden max-h-48 overflow-y-auto"></div>
                  <input type="hidden" name="endereco" value="">
                </div>
                <div class="col-span-1">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Número</label>
                  <input type="text" name="numero" id="client-numero" value="${client ? (client.numero || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Bairro</label>
                  <input type="text" name="bairro" id="client-bairro" value="${client ? (client.bairro || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">CEP</label>
                  <input type="text" name="cep" id="client-cep" onblur="clientsModule.buscaCep(this.value)" value="${client ? (client.cep || '') : ''}" placeholder="00000-000" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div class="col-span-4">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Complemento</label>
                  <input type="text" name="complemento" id="client-complemento" value="${client ? (client.complemento || '') : ''}" placeholder="Apto, Sala, Bloco..." class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>

              <div class="grid grid-cols-4 gap-2">
                <div class="col-span-3">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Cidade *</label>
                  <input type="text" name="cidade" id="client-cidade" required value="${clientCidade}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" onblur="clientsModule.syncUF(this.value)">
                </div>
                <div class="col-span-1">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">UF *</label>
                  <input type="text" name="uf" id="client-uf" maxlength="2" required value="${clientUf}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Ponto de Referência</label>
                <input type="text" name="referencia" value="${client ? (client.referencia || '') : ''}" placeholder="Ex: Próximo à padaria central" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Localização (Plus Code/Endereço)</label>
                <div class="relative flex items-center">
                  <input type="text" name="plus_code" id="client-plus-code" value="${client ? (client.plus_code || '') : ''}" placeholder="Ex: 87G8C822+4X ou Endereço" class="w-full pr-10 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <button type="button" onclick="clientsModule.getLocation()" class="absolute right-2 text-blue-500 hover:text-blue-700" title="Ver no Mapa ou Pegar Localização Atual">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </button>
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-slate-600 mb-1">Observações / Anotações do Cliente</label>
                <textarea name="observacoes" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${client ? (client.observacoes || '') : ''}</textarea>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
              <div>
                ${isEdit ? `<button type="button" onclick="clientsModule.deleteClient('${client.id}')" class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium">Excluir</button>` : '<div></div>'}
              </div>
              <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('client-modal').remove()" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" id="btn-salvar-cliente" class="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">${isEdit ? 'Salvar Alterações' : 'Salvar Cliente'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => this.initGoogleAutocomplete(), 100);
  },

  initGoogleAutocomplete() {
    try {
      if (window.google && window.google.maps && window.google.maps.places) {
        const input = document.getElementById('client-logradouro');
        if (input) {
          const autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { country: "br" },
            fields: ["address_components", "geometry", "name"],
            types: ["address"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            let numero = '';
            let logradouro = '';
            let bairro = '';
            let cidade = '';
            let uf = '';
            let cep = '';
            
            if(place.address_components) {
              for (const component of place.address_components) {
                const componentType = component.types[0];
                switch (componentType) {
                  case "street_number": numero = component.long_name; break;
                  case "route": logradouro = component.long_name; break;
                  case "sublocality_level_1": bairro = component.long_name; break;
                  case "administrative_area_level_2": cidade = component.long_name; break;
                  case "administrative_area_level_1": uf = component.short_name; break;
                  case "postal_code": cep = component.long_name; break;
                }
              }
            }
            if(logradouro) input.value = logradouro;
            if(numero && document.getElementById('client-numero')) document.getElementById('client-numero').value = numero;
            if(bairro && document.getElementById('client-bairro')) document.getElementById('client-bairro').value = bairro;
            if(cidade && document.getElementById('client-cidade')) document.getElementById('client-cidade').value = cidade;
            if(uf && document.getElementById('client-uf')) document.getElementById('client-uf').value = uf;
            if(cep && document.getElementById('client-cep')) document.getElementById('client-cep').value = cep;
          });
        }
      }
    } catch (e) {
      console.warn('[Clients] Autocomplete indisponível:', e);
    }
  },

  editModal(id) {
    if (!id) return;
    const client = window.store.getClients().find(c => c.id === id || String(c.id) === String(id));
    if (client) {
      this.openModal(client);
    } else {
      console.warn('[Clients] Cliente não encontrado para edição:', id);
    }
  },

  toggleTipoPessoa(tipo) {
    const lblNome = document.getElementById('lbl-nome');
    const lblApelido = document.getElementById('lbl-apelido');
    const lblCpf = document.getElementById('lbl-cpf');
    const inpCpf = document.querySelector('input[name="cpf_cnpj"]');
    const cNasc = document.getElementById('container-data-nascimento');
    const cGen = document.getElementById('container-genero');
    if (tipo === 'PJ') {
      lblNome.innerText = 'Razão Social *';
      lblApelido.innerText = 'Nome Fantasia';
      lblCpf.innerText = 'CNPJ';
      inpCpf.placeholder = '00.000.000/0000-00';
      if(cNasc) cNasc.classList.add('hidden');
      if(cGen) cGen.classList.add('hidden');
    } else {
      lblNome.innerText = 'Nome *';
      lblApelido.innerText = 'Nome Popular';
      lblCpf.innerText = 'CPF';
      inpCpf.placeholder = '000.000.000-00';
      if(cNasc) cNasc.classList.remove('hidden');
      if(cGen) cGen.classList.remove('hidden');
    }
  },

  validaCpfCnpj(input) {
    const val = input.value.replace(/\D/g, '');
    const err = document.getElementById('cpf-error');
    if (!val) { err.classList.add('hidden'); input.classList.remove('border-red-500'); return; }
    let valid = false;
    if (val.length === 11) {
      valid = !/^(\d)\1{10}$/.test(val);
    } else if (val.length === 14) {
      valid = !/^(\d)\1{13}$/.test(val);
    }
    
    if (!valid) {
      err.classList.remove('hidden');
      input.classList.add('border-red-500');
    } else {
      err.classList.add('hidden');
      input.classList.remove('border-red-500');
    }
  },

  enableEditMode() {
    const form = document.getElementById('client-form');
    if (form) {
      const elements = form.querySelectorAll('input, select, textarea, button[type="button"]:not(#btn-editar-cliente):not([onclick*="remove"]):not([onclick*="deleteClient"]):not([onclick*="getLocation"])');
      elements.forEach(el => el.disabled = false);
    }
    const statusCb = document.getElementById('client-status-checkbox');
    if (statusCb) statusCb.disabled = false;
    const statusLbl = document.getElementById('client-status-label');
    if (statusLbl) {
      statusLbl.classList.remove('opacity-60', 'pointer-events-none', 'cursor-not-allowed');
      statusLbl.classList.add('cursor-pointer');
      statusLbl.title = 'Status do Cliente (Ativo / Bloqueado)';
    }
    const btnEditar = document.getElementById('btn-editar-cliente');
    if (btnEditar) btnEditar.classList.add('hidden');
    const btnSalvar = document.getElementById('btn-salvar-cliente');
    if (btnSalvar) btnSalvar.classList.remove('hidden');
  },

  deleteClient(id) {
    const orders = window.store.getOrders();
    const hasOrders = orders.some(o => o.cliente_id === id);
    if (hasOrders) {
      alert("Operação negada: Este cliente não pode ser excluído pois possui pedidos vinculados (Regra de Integridade).");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este cliente permanentemente?")) {
      window.store.deleteClient(id);
      document.getElementById('client-modal').remove();
      this.render();
    }
  },

  handlePhotoUpload(input) {
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

          document.getElementById('client-foto-url').value = compressedDataUrl;
          if (document.getElementById('client-foto-preview')) {
            document.getElementById('client-foto-preview').src = compressedDataUrl;
            document.getElementById('client-foto-preview').classList.remove('hidden');
            document.getElementById('client-foto-icon').classList.add('hidden');
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },
  syncUF(cidade) {
    if (!cidade) return;
    const ufInput = document.getElementById('client-uf');
    if (!ufInput) return;

    // Se já tem valor, podemos optar por não sobrescrever, ou só checar.
    if (ufInput.value && ufInput.value.length === 2) return;

    // Tentar deduzir UF baseando na busca do Nominatim se houver timeout ou lookup rápido
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cidade)}&countrycodes=br&limit=1&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0 && data[0].address && data[0].address.state) {
          const stateMap = {
            'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
            'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
            'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
            'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', 'Rondônia': 'RO',
            'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
          };
          const st = data[0].address.state;
          if (stateMap[st]) {
            ufInput.value = stateMap[st];
          }
        }
      })
      .catch(e => console.warn('Erro syncUF:', e));
  },

  async buscaCep(cep) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await resp.json();
        if (!data.erro) {
          document.getElementById('client-cidade').value = data.localidade || '';
          document.getElementById('client-uf').value = data.uf || '';
          if(document.getElementById('client-logradouro')) document.getElementById('client-logradouro').value = data.logradouro || '';
          if(document.getElementById('client-bairro')) document.getElementById('client-bairro').value = data.bairro || '';
        }
      } catch (e) {
        console.warn('Erro ao consultar CEP:', e);
      }
    }
  },

  maskCpfCnpj(v) {
    v = v.replace(/\D/g, ''); // Apenas números
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      if (v.length > 14) v = v.slice(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1/$2');
      v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return v;
  },

  getLocation() {
    const input = document.getElementById('client-plus-code');
    const val = input ? input.value.trim() : '';
    if (val) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}`, '_blank');
      return;
    }
    const btn = document.querySelector('#client-plus-code').nextElementSibling;
    if (navigator.geolocation) {
      if(btn) btn.classList.add('animate-pulse');
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        if(input) input.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        if(btn) btn.classList.remove('animate-pulse');
      }, (error) => {
        alert('Erro ao obter localização. Verifique as permissões do navegador.');
        if(btn) btn.classList.remove('animate-pulse');
      });
    } else {
      alert('Geolocalização não suportada no seu navegador.');
    }
  },

  handleNomeInput(input) {
    const nome = (input.value || '').trim();
    const apelidoInp = document.getElementById('client-apelido');
    if (apelidoInp && !apelidoInp.dataset.userEdited && (!apelidoInp.value || apelidoInp.value === '')) {
      const primeiroNome = nome.split(' ')[0] || '';
      apelidoInp.value = primeiroNome;
    }
  },

  maskPhone(v) {
    v = v.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) return v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    return v;
  },

  searchInModal(term) {
    const resDiv = document.getElementById('modal-search-results');
    if (!term || term.trim().length < 2) {
      resDiv.classList.add('hidden');
      return;
    }
    const lowerTerm = term.toLowerCase().trim();
    const clients = window.store.getClients();
    const matches = clients.filter(c => 
      c.nome.toLowerCase().includes(lowerTerm) || 
      (c.telefone_whatsapp && c.telefone_whatsapp.replace(/\D/g,'').includes(lowerTerm.replace(/\D/g,''))) || 
      (c.apelido && c.apelido.toLowerCase().includes(lowerTerm))
    ).slice(0, 5);

    if (matches.length > 0) {
      resDiv.innerHTML = matches.map(c => `
        <div class="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0" onclick="document.getElementById('client-modal').remove(); clientsModule.editModal('${c.id}')">
          <div class="font-bold text-sm text-slate-800">${c.nome}</div>
          <div class="text-xs text-slate-500">${c.telefone_whatsapp} ${c.apelido ? ' - ' + c.apelido : ''}</div>
        </div>
      `).join('');
      resDiv.classList.remove('hidden');
    } else {
      resDiv.innerHTML = '<div class="px-4 py-2 text-sm text-slate-500 italic">Nenhum cliente encontrado.</div>';
      resDiv.classList.remove('hidden');
    }
  },

  searchAddressTimer: null,
  async searchAddress(term) {
    const resDiv = document.getElementById('address-suggestions');
    if (!term || term.trim().length < 4) {
      resDiv.classList.add('hidden');
      return;
    }
    
    // Check if Google Maps Places Autocomplete is available
    if (window.google && window.google.maps && window.google.maps.places) {
      // If we initialized autocomplete on the input, it handles the dropdown natively.
      return;
    }

    // Fallback: Use Nominatim (OpenStreetMap) if no Google Maps API
    clearTimeout(this.searchAddressTimer);
    this.searchAddressTimer = setTimeout(async () => {
      try {
        const city = document.getElementById('client-cidade')?.value || 'Porto Velho';
        const state = document.getElementById('client-uf')?.value || 'RO';
        let query = term;
        query += ', ' + city + ', ' + state;
        
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=br&limit=5`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          resDiv.innerHTML = data.map(place => {
            const addr = place.address;
            const logr = addr.road || addr.pedestrian || addr.path || '';
            const brro = addr.suburb || addr.neighbourhood || addr.residential || '';
            const cid = addr.city || addr.town || addr.municipality || '';
            const post = addr.postcode || '';
            const num = addr.house_number || '';
            return `
            <div class="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-start gap-2" onclick="
              document.getElementById('client-logradouro').value = '${logr || place.name}';
              if('${brro}') document.getElementById('client-bairro').value = '${brro}';
              if('${cid}') document.getElementById('client-cidade').value = '${cid}';
              if('${post}') document.getElementById('client-cep').value = '${post}';
              if('${num}') document.getElementById('client-numero').value = '${num}';
              document.getElementById('address-suggestions').classList.add('hidden');
            ">
              <svg class="w-4 h-4 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <div class="text-sm text-slate-700">${place.display_name}</div>
            </div>
          `}).join('');
          resDiv.classList.remove('hidden');
        } else {
          resDiv.classList.add('hidden');
        }
      } catch (e) {
        console.warn('Erro ao buscar endereco:', e);
      }
    }, 500);
  },

  save(e, id) {
    e.preventDefault();
    const form = e.target;
    const statusCheckbox = document.querySelector('input[name="status"]');
    
    // Identifica com precisão se é uma edição
    const formIdVal = (form.client_id && form.client_id.value) ? form.client_id.value.trim() : '';
    let targetId = id || formIdVal || this.currentEditingClientId || undefined;

    const clientData = {
      id: targetId,
      status: statusCheckbox && statusCheckbox.checked ? 'ativo' : 'bloqueado',
      nome: form.nome.value.trim(),
      apelido: form.apelido.value.trim(),
      cpf_cnpj: form.cpf_cnpj.value.trim(),
      telefone_whatsapp: form.telefone_whatsapp.value.trim(),
      email: form.email.value.trim(),
      cep: form.cep.value.trim(),
      cidade: form.cidade.value.trim(),
      uf: form.uf.value.trim().toUpperCase(),
      endereco: form.endereco.value.trim(),
      referencia: form.referencia.value.trim(),
      plus_code: form.plus_code.value.trim(),
      foto_url: form.foto_url.value.trim(),
      tipo_pessoa: form.tipo_pessoa ? form.tipo_pessoa.value : 'PF',
      instagram: form.instagram ? form.instagram.value.trim() : null,
      data_nascimento: form.data_nascimento && form.data_nascimento.value ? form.data_nascimento.value : null,
      genero: form.genero && form.genero.value ? form.genero.value : null,
      logradouro: form.logradouro ? form.logradouro.value.trim() : '',
      numero: form.numero ? form.numero.value.trim() : '',
      complemento: form.complemento ? form.complemento.value.trim() : '',
      bairro: form.bairro ? form.bairro.value.trim() : '',
      observacoes: form.observacoes ? form.observacoes.value.trim() : '',
      updated_at: new Date().toISOString()
    };

    const allClients = window.store.getClients();
    const isEdit = !!targetId;
    clientData.id = targetId;

    // 1. Validação de Telefone WhatsApp: OBRIGATÓRIO SEMPRE e deve conter DDD válido
    const cleanPhone = (clientData.telefone_whatsapp || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert("Operação negada: O número de Telefone WhatsApp é OBRIGATÓRIO SEMPRE e deve conter DDD válido.");
      return;
    }

    const cleanCpfCnpj = (clientData.cpf_cnpj || '').replace(/\D/g, '');

    // REGRA DE CHAVE PRIMÁRIA & UNICIDADE:
    // Na edição, exclui o próprio cliente sendo editado para permitir alteração de qualquer campo sem acusar duplicata contra si mesmo.
    const duplicatePhone = allClients.find(c => 
      (targetId ? String(c.id) !== String(targetId) : true) && 
      (c.telefone_whatsapp || '').replace(/\D/g, '') === cleanPhone
    );
    if (duplicatePhone) {
      alert(`Operação negada: O número de telefone informado já está cadastrado para outro cliente (${duplicatePhone.nome}). O telefone é chave de identificação e não pode duplicar.`);
      return;
    }

    if (cleanCpfCnpj) {
      const duplicateCpf = allClients.find(c => 
        (targetId ? String(c.id) !== String(targetId) : true) && 
        (c.cpf_cnpj || '').replace(/\D/g, '') === cleanCpfCnpj
      );
      if (duplicateCpf) {
        alert(`Operação negada: O CPF/CNPJ informado já está cadastrado para outro cliente (${duplicateCpf.nome}). Não é permitido duplicar o documento.`);
        return;
      }
    }

    // 3. Validação de Campos Requeridos: E-mail, Cidade e UF
    if (!clientData.email || !clientData.email.includes('@')) {
      alert("Operação negada: O campo E-mail é obrigatório e deve ser válido.");
      return;
    }
    if (!clientData.cidade) {
      alert("Operação negada: O campo Cidade é obrigatório.");
      return;
    }
    if (!clientData.uf || clientData.uf.length !== 2) {
      alert("Operação negada: O campo UF é obrigatório (2 letras).");
      return;
    }

    // 4. Se Nome Popular estiver vazio, preencher com o primeiro nome por padrão
    if (!clientData.apelido && clientData.nome) {
      clientData.apelido = clientData.nome.split(' ')[0];
    }

    // 5. Alerta de Homônimo / Nome Popular (pode repetir, mas alerta com orientação e consentimento)
    const homonimo = allClients.find(c => {
      if (targetId && String(c.id) === String(targetId)) return false;
      return (
        (c.nome && c.nome.toLowerCase().trim() === clientData.nome.toLowerCase().trim()) ||
        (clientData.apelido && c.apelido && c.apelido.toLowerCase().trim() === clientData.apelido.toLowerCase().trim())
      );
    });

    if (homonimo) {
      const msgAlerta = `⚠️ ALERTA: CLIENTE COM NOME OU NOME POPULAR SIMILAR ENCONTRADO!\n\n` +
        `Já existe cadastrado: "${homonimo.nome}"` + 
        (homonimo.apelido ? ` (Nome Popular: ${homonimo.apelido})` : '') + `.\n\n` +
        `ORIENTAÇÃO IMPORTANTE SOBRE IDENTIFICAÇÃO:\n` +
        `• O ideal é que haja uma diferenciação no Nome Popular (ex: Zé da Máquina, Zé Costa, Zé da Leste, etc.).\n` +
        `• CUIDADO & RESPEITO: Esta relação é complexa e delicada e deve ser tratada com muito cuidado. NUNCA coloque apelido sem o consentimento do cliente!\n` +
        `• Se o cliente não autorizar ou não houver relação específica, mantenha o primeiro nome/sobrenome mesmo.\n\n` +
        `Deseja gravar os dados deste cliente agora?`;
      
      if (!confirm(msgAlerta)) {
        return;
      }
    }

    window.store.saveClient(clientData);
    document.getElementById('client-modal').remove();
    this.render();
  },

  delete(id) {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      window.store.deleteClient(id);
      this.render();
    }
  }
};