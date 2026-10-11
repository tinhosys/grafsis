/* ==============================================================================
   GRAFSIS - Módulo de Clientes
   Cadastro Completo: Nome, Apelido, WhatsApp, Plus Code, Foto, CEP, etc.
   ============================================================================== */

window.clientsModule = {
  render() {
    const clients = window.store.getClients();
    const container = document.getElementById('view-container');
    
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Clientes</h1>
            <p class="text-slate-500 text-sm">Gerencie sua carteira de clientes, contatos de WhatsApp, localização e Plus Code</p>
          </div>
          <div class="flex gap-2">
            <button onclick="clientsModule.openModal()" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Novo Cliente
            </button>
          </div>
        </div>

        <!-- Filtro de Busca -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div class="relative">
            <input type="text" id="client-search" oninput="clientsModule.search(this.value)" placeholder="Buscar por Nome, Apelido, CPF/CNPJ, Telefone ou Cidade..." class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <!-- Tabela / Cards de Clientes -->
        <div id="clients-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${this.renderCards(clients)}
        </div>
      </div>
    `;
  },

  renderCards(clients) {
    if (clients.length === 0) {
      return `
        <div class="col-span-full py-12 text-center text-slate-400">
          <svg class="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <p class="text-base font-medium">Nenhum cliente cadastrado ainda</p>
          <p class="text-sm">Clique em "Novo Cliente" para começar</p>
        </div>
      `;
    }

    return clients.map(cli => {
      const cleanPhone = (cli.telefone_whatsapp || '').replace(/\D/g, '');
      const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
      const mapsLink = cli.plus_code ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cli.plus_code)}` : null;

      return `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 flex items-center justify-center">
                ${cli.foto_url 
                  ? `<img src="${cli.foto_url}" class="w-full h-full object-cover" alt="${cli.nome}">` 
                  : `<span class="text-lg font-bold text-blue-600">${cli.nome.charAt(0).toUpperCase()}</span>`
                }
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-slate-800 text-base truncate">${cli.nome}</h3>
                ${cli.apelido ? `<p class="text-xs text-blue-600 font-semibold mb-1">Apelido: ${cli.apelido}</p>` : ''}
                <p class="text-xs text-slate-400 font-mono">${cli.cpf_cnpj || 'Sem CPF/CNPJ'}</p>
              </div>
            </div>

            <div class="mt-4 space-y-2 text-xs text-slate-600">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.532 2.027.815 3.149.815 3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.769-5.768-5.769zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.059-1.146-.086-.299-.097-.687-.228-1.187-.446-2.099-.92-3.469-3.08-3.574-3.222-.105-.145-.853-1.135-.853-2.164 0-1.03.537-1.536.728-1.745.191-.21.417-.262.556-.262.139 0 .279.002.401.008.129.006.304-.049.475.363.177.427.604 1.474.656 1.58.053.106.088.23.018.371-.07.14-.105.228-.21.35-.105.123-.222.274-.317.368-.105.105-.214.219-.092.428.122.209.543.896 1.164 1.448.8.713 1.474.933 1.684 1.038.209.105.332.088.455-.053.123-.14.524-.61.664-.82.14-.21.279-.175.47-.105.192.07 1.218.574 1.428.679.209.105.349.157.401.245.053.088.053.508-.091.913z"/></svg>
                <span class="font-medium">${cli.telefone_whatsapp}</span>
                ${waLink ? `<a href="${waLink}" target="_blank" class="ml-auto text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">WhatsApp</a>` : ''}
              </div>
              ${cli.email ? `
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span class="truncate">${cli.email}</span>
                </div>
              ` : ''}
              <div class="flex items-start gap-2">
                <svg class="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                <div>
                  <span>${cli.cidade || 'Cidade não inf.'} - ${cli.uf || ''}</span>
                  ${cli.endereco ? `<p class="text-[11px] text-slate-500">${cli.endereco}</p>` : ''}
                  ${cli.referencia ? `<p class="text-[11px] text-amber-600">Ref: ${cli.referencia}</p>` : ''}
                  ${cli.plus_code ? `
                    <div class="mt-1">
                      <span class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono text-[10px] border border-blue-200">Plus Code: ${cli.plus_code}</span>
                      ${mapsLink ? `<a href="${mapsLink}" target="_blank" class="ml-1 text-blue-600 underline text-[10px]">Ver no Mapa</a>` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <button onclick="salesModule.createOrderForClient('${cli.id}')" class="text-xs text-blue-600 hover:text-blue-800 font-medium">
              + Novo Orçamento
            </button>
            <div class="flex gap-2">
              <button onclick="clientsModule.editModal('${cli.id}')" class="text-slate-500 hover:text-slate-800 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button onclick="clientsModule.delete('${cli.id}')" class="text-red-500 hover:text-red-700 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  search(term) {
    const clients = window.store.getClients();
    const t = term.toLowerCase().trim();
    const filtered = clients.filter(c => 
      (c.nome && c.nome.toLowerCase().includes(t)) ||
      (c.apelido && c.apelido.toLowerCase().includes(t)) ||
      (c.cpf_cnpj && c.cpf_cnpj.includes(t)) ||
      (c.telefone_whatsapp && c.telefone_whatsapp.includes(t)) ||
      (c.cidade && c.cidade.toLowerCase().includes(t))
    );
    document.getElementById('clients-list').innerHTML = this.renderCards(filtered);
  },

  openModal(client = null) {
    const isEdit = !!client;
    const modalHtml = `
      <div id="client-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex flex-col gap-3 pb-4 border-b border-slate-100">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <h2 class="text-lg font-bold text-slate-800">${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <!-- Chave Ativo/Bloqueado (Rosa) -->
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" name="status" value="ativo" class="sr-only" ${!client || client.status !== 'bloqueado' ? 'checked' : ''} onchange="this.nextElementSibling.classList.toggle('bg-blue-600'); this.nextElementSibling.classList.toggle('bg-slate-300'); this.nextElementSibling.firstElementChild.classList.toggle('translate-x-full'); this.parentElement.nextElementSibling.innerText = this.checked ? 'Ativo' : 'Bloqueado';">
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
                      <input type="file" accept="image/*" capture="environment" onchange="clientsModule.handlePhotoUpload(this)" class="hidden">
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
                    <input type="text" name="nome" required value="${client ? client.nome : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label id="lbl-apelido" class="block text-xs font-semibold text-slate-600 mb-1">${!client || client.tipo_pessoa !== 'PJ' ? 'Nome Popular' : 'Nome Fantasia'}</label>
                      <input type="text" name="apelido" value="${client ? (client.apelido || '') : ''}" placeholder="Ex: Marcos" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
                <label class="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                <input type="email" name="email" value="${client ? (client.email || '') : ''}" placeholder="cliente@email.com" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input type="text" name="cidade" id="client-cidade" value="${client ? (client.cidade || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div class="col-span-1">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">UF</label>
                  <input type="text" name="uf" id="client-uf" maxlength="2" value="${client ? (client.uf || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
                ${isEdit ? `<button type="button" id="btn-editar-cliente" onclick="clientsModule.enableEditMode()" class="px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-sm">Editar</button>` : ''}
                <button type="submit" id="btn-salvar-cliente" class="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm ${isEdit ? 'hidden' : ''}">Salvar Cliente</button>
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
  },

  editModal(id) {
    const client = window.store.getClients().find(c => c.id === id);
    if (client) {
      this.openModal(client);
      setTimeout(() => {
        const form = document.getElementById('client-form');
        if(!form) return;
        const elements = form.querySelectorAll('input, select, textarea, button[type="button"]:not([onclick*="remove"]):not([onclick*="deleteClient"]):not(#btn-editar-cliente):not([onclick*="getLocation"])');
        elements.forEach(el => el.disabled = true);
      }, 50);
    }
  },

  toggleTipoPessoa(tipo) {
    const lblNome = document.getElementById('lbl-nome');
    const lblApelido = document.getElementById('lbl-apelido');
    const lblCpf = document.getElementById('lbl-cpf');
    const inpCpf = document.querySelector('input[name="cpf_cnpj"]');
    if (tipo === 'PJ') {
      lblNome.innerText = 'Razão Social *';
      lblApelido.innerText = 'Nome Fantasia';
      lblCpf.innerText = 'CNPJ';
      inpCpf.placeholder = '00.000.000/0000-00';
    } else {
      lblNome.innerText = 'Nome *';
      lblApelido.innerText = 'Nome Popular';
      lblCpf.innerText = 'CPF';
      inpCpf.placeholder = '000.000.000-00';
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
    const elements = form.querySelectorAll('input, select, textarea, button[type="button"]:not(#btn-editar-cliente):not([onclick*="remove"]):not([onclick*="deleteClient"]):not([onclick*="getLocation"])');
    elements.forEach(el => el.disabled = false);
    document.getElementById('btn-editar-cliente').classList.add('hidden');
    document.getElementById('btn-salvar-cliente').classList.remove('hidden');
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
      if (file.size > 3 * 1024 * 1024) {
        alert('A foto não pode ter mais de 3 MB.');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('client-foto-url').value = e.target.result;
        if(document.getElementById('client-foto-preview')) {
          document.getElementById('client-foto-preview').src = e.target.result;
          document.getElementById('client-foto-preview').classList.remove('hidden');
          document.getElementById('client-foto-icon').classList.add('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
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
    
    const clientData = {
      id: id || undefined,
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
      instagram: form.instagram ? form.instagram.value.trim() : '',
      logradouro: form.logradouro ? form.logradouro.value.trim() : '',
      numero: form.numero ? form.numero.value.trim() : '',
      complemento: form.complemento ? form.complemento.value.trim() : '',
      bairro: form.bairro ? form.bairro.value.trim() : '',
      observacoes: form.observacoes ? form.observacoes.value.trim() : '',
      updated_at: new Date().toISOString()
    };

    const allClients = window.store.getClients();
    const isDuplicateCpf = allClients.some(c => c.cpf_cnpj && c.cpf_cnpj === clientData.cpf_cnpj && c.id !== clientData.id);
    if (isDuplicateCpf) {
      alert("Operação negada: Já existe um cliente cadastrado com este CPF/CNPJ.");
      return;
    }

    const hasSimilar = allClients.some(c => c.id !== clientData.id && (
      (c.telefone_whatsapp && c.telefone_whatsapp === clientData.telefone_whatsapp) ||
      (c.email && c.email === clientData.email) ||
      (c.nome && c.nome.toLowerCase() === clientData.nome.toLowerCase())
    ));

    if (hasSimilar) {
      if (!confirm("Aviso: Já existe um cliente com o mesmo Nome, Telefone ou E-mail. Deseja salvar mesmo assim?")) {
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
