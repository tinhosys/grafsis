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
          <div class="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">${isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <button onclick="document.getElementById('client-modal').remove()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
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
                  <input type="text" name="foto_url" id="client-foto-url" value="${client ? (client.foto_url || '') : ''}" placeholder="URL da foto" class="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none mb-1" oninput="document.getElementById('client-foto-preview').src=this.value; document.getElementById('client-foto-preview').classList.remove('hidden'); document.getElementById('client-foto-icon').classList.add('hidden');">
                  <input type="file" accept="image/*" onchange="clientsModule.handlePhotoUpload(this)" class="w-full text-[10px] text-slate-500 file:mr-1 file:py-1 file:px-1 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
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
                      <input type="text" name="cpf_cnpj" value="${client ? (client.cpf_cnpj || '') : ''}" onblur="clientsModule.validaCpfCnpj(this)" placeholder="000.000.000-00" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <p id="cpf-error" class="text-red-500 text-[10px] font-bold mt-1 hidden">Documento Inválido</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Telefone WhatsApp *</label>
                <input type="text" name="telefone_whatsapp" required value="${client ? client.telefone_whatsapp : ''}" placeholder="(11) 99999-8888" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                <input type="email" name="email" value="${client ? (client.email || '') : ''}" placeholder="cliente@email.com" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Instagram (Link/@)</label>
                <input type="text" name="instagram" value="${client ? (client.instagram || '') : ''}" placeholder="@cliente ou https://..." class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">CEP</label>
                <input type="text" name="cep" id="client-cep" onblur="clientsModule.buscaCep(this.value)" value="${client ? (client.cep || '') : ''}" placeholder="00000-000" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input type="text" name="cidade" id="client-cidade" value="${client ? (client.cidade || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">UF</label>
                  <input type="text" name="uf" id="client-uf" maxlength="2" value="${client ? (client.uf || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>

              <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Endereço / Logradouro</label>
                  <input type="text" name="logradouro" id="client-logradouro" value="${client ? (client.logradouro || client.endereco || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <input type="hidden" name="endereco" value="">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Número</label>
                  <input type="text" name="numero" id="client-numero" value="${client ? (client.numero || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Bairro</label>
                  <input type="text" name="bairro" id="client-bairro" value="${client ? (client.bairro || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div class="col-span-4">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Complemento</label>
                  <input type="text" name="complemento" id="client-complemento" value="${client ? (client.complemento || '') : ''}" placeholder="Apto, Sala, Bloco..." class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Ponto de Referência</label>
                <input type="text" name="referencia" value="${client ? (client.referencia || '') : ''}" placeholder="Ex: Próximo à padaria central" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Plus Code (Google Maps)</label>
                <input type="text" name="plus_code" value="${client ? (client.plus_code || '') : ''}" placeholder="Ex: 87G8C822+4X" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-slate-600 mb-1">Observações / Anotações do Cliente</label>
                <textarea name="observacoes" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${client ? (client.observacoes || '') : ''}</textarea>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onclick="document.getElementById('client-modal').remove()" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="submit" class="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">Salvar Cliente</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  editModal(id) {
    const client = window.store.getClients().find(c => c.id === id);
    if (client) this.openModal(client);
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

  handlePhotoUpload(input) {
    const file = input.files[0];
    if (file) {
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

  save(e, id) {
    e.preventDefault();
    const form = e.target;
    const clientData = {
      id: id || undefined,
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
