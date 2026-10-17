/* ==============================================================================
   GRAFSIS - Módulo de Fornecedores
   Cadastro Completo: Razão Social, CNPJ, Inscrição Estadual, Vendedor, Contato
   ============================================================================== */

window.suppliersModule = {
  render() {
    const suppliers = window.store.getSuppliers();
    const container = document.getElementById('view-container');
    
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Fornecedores</h1>
            <p class="text-slate-500 text-sm">Controle de fornecedores de insumos: lonas, vinil, tintas, acrílicos, MDF e brindes</p>
          </div>
          <div>
            <button onclick="suppliersModule.openModal()" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Novo Fornecedor
            </button>
          </div>
        </div>

        <!-- Filtro de Busca -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <input type="text" id="supplier-search" oninput="suppliersModule.search(this.value)" placeholder="Buscar por Nome Fantasia, Razão Social, CNPJ, Vendedor ou Insumo..." class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button 
              type="button" 
              onclick="suppliersModule.clearSearch()" 
              title="Limpar busca"
              class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200 shadow-sm cursor-pointer shrink-0">
              ✕ Limpar
            </button>
          </div>
        </div>

        <!-- Tabela / Cards de Fornecedores -->
        <div id="suppliers-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${this.renderCards(suppliers)}
        </div>
      </div>
    `;
  },

  renderCards(suppliers) {
    if (suppliers.length === 0) {
      return `
        <div class="col-span-full py-12 text-center text-slate-400">
          <svg class="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          <p class="text-base font-medium">Nenhum fornecedor cadastrado</p>
          <p class="text-sm">Cadastre seus distribuidores de vinis, lonas, chapas e tintas</p>
        </div>
      `;
    }

    return suppliers.map(forn => {
      const cleanPhone = (forn.celular_whatsapp || forn.telefone || '').replace(/\D/g, '');
      const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

      return `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="flex justify-between items-start gap-2">
              <div>
                <h3 class="font-bold text-slate-800 text-base">${forn.nome_fantasia}</h3>
                ${forn.razao_social ? `<p class="text-xs text-slate-500">${forn.razao_social}</p>` : ''}
              </div>
              <span class="bg-slate-100 text-slate-600 text-[11px] font-mono px-2 py-0.5 rounded border border-slate-200">${forn.uf || 'BR'}</span>
            </div>

            <div class="mt-2 flex flex-wrap gap-1">
              ${forn.cnpj ? `<span class="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono border border-blue-100">CNPJ: ${forn.cnpj}</span>` : ''}
              ${forn.inscricao_estadual ? `<span class="text-[11px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">IE: ${forn.inscricao_estadual}</span>` : ''}
            </div>

            <div class="mt-4 space-y-2 text-xs text-slate-600">
              ${forn.nome_vendedor ? `
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  <span class="font-semibold text-slate-700">Vendedor: ${forn.nome_vendedor}</span>
                </div>
              ` : ''}
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.532 2.027.815 3.149.815 3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.769-5.768-5.769zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.059-1.146-.086-.299-.097-.687-.228-1.187-.446-2.099-.92-3.469-3.08-3.574-3.222-.105-.145-.853-1.135-.853-2.164 0-1.03.537-1.536.728-1.745.191-.21.417-.262.556-.262.139 0 .279.002.401.008.129.006.304-.049.475.363.177.427.604 1.474.656 1.58.053.106.088.23.018.371-.07.14-.105.228-.21.35-.105.123-.222.274-.317.368-.105.105-.214.219-.092.428.122.209.543.896 1.164 1.448.8.713 1.474.933 1.684 1.038.209.105.332.088.455-.053.123-.14.524-.61.664-.82.14-.21.279-.175.47-.105.192.07 1.218.574 1.428.679.209.105.349.157.401.245.053.088.053.508-.091.913z"/></svg>
                <span>${forn.celular_whatsapp || forn.telefone || 'Sem telefone'}</span>
                ${waLink ? `<a href="${waLink}" target="_blank" class="ml-auto text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">WhatsApp</a>` : ''}
              </div>
              ${forn.email ? `
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span class="truncate">${forn.email}</span>
                </div>
              ` : ''}
              ${forn.endereco ? `
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  <span>${forn.endereco} - ${forn.cidade || ''}/${forn.uf || ''}</span>
                </div>
              ` : ''}
              ${forn.categoria_produtos ? `
                <div class="mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                  <strong class="block text-amber-900 font-semibold mb-0.5">Insumos Fornecidos:</strong>
                  ${forn.categoria_produtos}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <button onclick="financeModule.createExpenseForSupplier('${forn.id}')" class="text-xs text-rose-600 hover:text-rose-800 font-medium">
              + Lançar Conta a Pagar
            </button>
            <div class="flex gap-2">
              <button onclick="suppliersModule.editModal('${forn.id}')" class="text-slate-500 hover:text-slate-800 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button onclick="suppliersModule.delete('${forn.id}')" class="text-red-500 hover:text-red-700 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  search(term) {
    const suppliers = window.store.getSuppliers();
    const t = term.toLowerCase().trim();
    const filtered = suppliers.filter(f => 
      (f.nome_fantasia && f.nome_fantasia.toLowerCase().includes(t)) ||
      (f.razao_social && f.razao_social.toLowerCase().includes(t)) ||
      (f.cnpj && f.cnpj.includes(t)) ||
      (f.nome_vendedor && f.nome_vendedor.toLowerCase().includes(t)) ||
      (f.categoria_produtos && f.categoria_produtos.toLowerCase().includes(t))
    );
    document.getElementById('suppliers-list').innerHTML = this.renderCards(filtered);
  },

  clearSearch() {
    const input = document.getElementById('supplier-search');
    if (input) input.value = '';
    const suppliers = window.store.getSuppliers();
    const list = document.getElementById('suppliers-list');
    if (list) list.innerHTML = this.renderCards(suppliers);
  },

  openModal(supplier = null, activeTab = 'identificacao') {
    const isEdit = !!supplier;
    const tipoPessoa = supplier ? (supplier.tipo_pessoa || (supplier.cnpj && supplier.cnpj.length > 14 ? 'PJ' : 'PF')) : 'PJ';
    const fotoOuLogo = supplier ? (supplier.foto_logo || '') : '';
    const negociacoes = (supplier && supplier.negociacoes) ? supplier.negociacoes : [];

    const modalHtml = `
      <div id="supplier-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto flex flex-col">
          
          <!-- Topo com Título e Botão Fechar -->
          <div class="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span class="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400 tracking-wider">Parceiros de Negócio</span>
              <h2 class="text-lg font-black text-slate-800 dark:text-white">
                ${isEdit ? 'Editar Fornecedor / Prestador de Serviço' : 'Novo Fornecedor / Prestador de Serviço'}
              </h2>
            </div>
            <button onclick="document.getElementById('supplier-modal').remove()" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Navegação por Duas Abas -->
          <div class="flex border-b border-slate-200 dark:border-slate-800 mt-3 mb-4">
            <button type="button" id="tab-btn-identificacao" onclick="suppliersModule.switchTab('identificacao')" class="py-2.5 px-4 font-black text-xs border-b-2 ${activeTab === 'identificacao' ? 'border-blue-600 text-blue-600 dark:text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'} transition flex items-center gap-2 cursor-pointer">
              <span>👤 1. Identificação Cadastral</span>
            </button>
            <button type="button" id="tab-btn-negociacoes" onclick="suppliersModule.switchTab('negociacoes')" class="py-2.5 px-4 font-black text-xs border-b-2 ${activeTab === 'negociacoes' ? 'border-blue-600 text-blue-600 dark:text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'} transition flex items-center gap-2 cursor-pointer">
              <span>📦 2. Negociações Atendidas (${negociacoes.length})</span>
            </button>
          </div>

          <!-- Formulário Principal -->
          <form id="supplier-form" onsubmit="suppliersModule.save(event, '${supplier ? supplier.id : ''}')" class="space-y-4">
            
            <!-- ABA 1: IDENTIFICAÇÃO -->
            <div id="tab-content-identificacao" class="${activeTab === 'identificacao' ? 'block' : 'hidden'} space-y-4">
              
              <!-- Marcação em Verde Limão: Opção Pessoa Física / Pessoa Jurídica -->
              <div class="p-3 bg-lime-50 dark:bg-lime-950/30 border-2 border-lime-500 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-lime-500 inline-block shadow-xs"></span>
                  <span class="text-xs font-black text-lime-950 dark:text-lime-200 uppercase tracking-wide">Tipo de Cadastro:</span>
                </div>
                <div class="flex items-center gap-4">
                  <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    <input type="radio" name="tipo_pessoa" value="PF" onchange="suppliersModule.handleTipoPessoaChange('PF')" ${tipoPessoa === 'PF' ? 'checked' : ''} class="w-4 h-4 text-blue-600 focus:ring-blue-500">
                    <span>Pessoa Física (Prestador de Serviço)</span>
                  </label>
                  <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    <input type="radio" name="tipo_pessoa" value="PJ" onchange="suppliersModule.handleTipoPessoaChange('PJ')" ${tipoPessoa === 'PJ' ? 'checked' : ''} class="w-4 h-4 text-blue-600 focus:ring-blue-500">
                    <span>Pessoa Jurídica (Empresa / Fornecedor)</span>
                  </label>
                </div>
              </div>

              <!-- Upload de Foto (Prestador) ou Logomarca (Empresa) -->
              <div class="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div class="relative w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 shadow-inner">
                  ${fotoOuLogo 
                    ? `<img id="supplier-photo-preview" src="${fotoOuLogo}" class="w-full h-full object-cover">` 
                    : `<span id="supplier-photo-placeholder" class="text-2xl">${tipoPessoa === 'PF' ? '👤' : '🏢'}</span>`}
                  <input type="hidden" name="foto_logo" id="supplier-photo-val" value="${fotoOuLogo}">
                </div>
                <div class="flex-1 space-y-1 text-center sm:text-left">
                  <label id="supplier-photo-label" class="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    ${tipoPessoa === 'PF' ? 'Foto do Prestador de Serviço' : 'Logomarca da Empresa Fornecedora'}
                  </label>
                  <p class="text-[11px] text-slate-400">Formatos aceitos: JPG, PNG ou WEBP. Imagem otimizada automaticamente.</p>
                  <input type="file" id="supplier-photo-input" accept="image/*" onchange="suppliersModule.handlePhotoUpload(this)" class="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label id="lbl-nome-fantasia" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ${tipoPessoa === 'PF' ? 'Nome Completo / Apelido Profissional *' : 'Nome Fantasia *'}
                  </label>
                  <input type="text" name="nome_fantasia" required value="${supplier ? supplier.nome_fantasia : ''}" placeholder="${tipoPessoa === 'PF' ? 'Ex: João da Silva Serralheiro' : 'Ex: Distribuidora Paulista'}" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div>
                  <label id="lbl-razao-social" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ${tipoPessoa === 'PF' ? 'Nome Completo de Registro' : 'Razão Social'}
                  </label>
                  <input type="text" name="razao_social" value="${supplier ? (supplier.razao_social || '') : ''}" placeholder="${tipoPessoa === 'PF' ? 'Nome civil da pessoa física' : 'Razão social registrada'}" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div>
                  <label id="lbl-cnpj-cpf" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ${tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}
                  </label>
                  <input type="text" name="cnpj" id="supplier-cnpj-input" value="${supplier ? (supplier.cnpj || '') : ''}" placeholder="${tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'}" oninput="suppliersModule.formatDocMask(this)" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inscrição Estadual / Registro</label>
                  <input type="text" name="inscricao_estadual" value="${supplier ? (supplier.inscricao_estadual || '') : ''}" placeholder="Isento ou Nº da inscrição" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div>
                  <label id="lbl-vendedor" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ${tipoPessoa === 'PF' ? 'Especialidade / Função Principal' : 'Nome do Vendedor / Representante'}
                  </label>
                  <input type="text" name="nome_vendedor" value="${supplier ? (supplier.nome_vendedor || '') : ''}" placeholder="${tipoPessoa === 'PF' ? 'Ex: Instalador de Fachadas / Serralheiro' : 'Ex: Marcos Souza'}" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Celular / WhatsApp *</label>
                  <input type="text" name="celular_whatsapp" required value="${supplier ? (supplier.celular_whatsapp || supplier.telefone || '') : ''}" placeholder="(11) 98888-7777" oninput="if(window.salesModule) salesModule.formatPhoneMask(this)" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone Fixo / Recado</label>
                  <input type="text" name="telefone" value="${supplier ? (supplier.telefone || '') : ''}" placeholder="(11) 2345-6789" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail Comercial</label>
                  <input type="email" name="email" value="${supplier ? (supplier.email || '') : ''}" placeholder="contato@parceiro.com" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div class="col-span-2">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                    <input type="text" name="cidade" value="${supplier ? (supplier.cidade || '') : ''}" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">UF</label>
                    <input type="text" name="uf" maxlength="2" value="${supplier ? (supplier.uf || '') : ''}" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Endereço Completo</label>
                  <input type="text" name="endereco" value="${supplier ? (supplier.endereco || '') : ''}" placeholder="Rua, Número, Bairro" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>

                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ${tipoPessoa === 'PF' ? 'Serviços Prestados e Especialidades' : 'Categorias de Insumos Fornecidos'}
                  </label>
                  <input type="text" name="categoria_produtos" value="${supplier ? (supplier.categoria_produtos || '') : ''}" placeholder="${tipoPessoa === 'PF' ? 'Ex: Instalação de Lona, Solda de Estrutura Metálica, Aplicação de Adesivo' : 'Ex: Vinil Imprimível, Bobinas de Lona 440g, Tintas solvente, Chapas ACM, Acrílico'}" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>
            </div>

            <!-- ABA 2: NEGOCIAÇÕES ATENDIDAS -->
            <div id="tab-content-negociacoes" class="${activeTab === 'negociacoes' ? 'block' : 'hidden'} space-y-3.5">
              
              <!-- Formulário Rápido para Adicionar Negociação -->
              <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block">
                  + Registrar Negociação / Compra / Serviço Atendido
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase">Data</label>
                    <input type="date" id="neg-data" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 font-bold">
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-500 uppercase">Descrição do Produto / Serviço *</label>
                    <input type="text" id="neg-desc" placeholder="Ex: 2 Bobinas Lona 440g ou Instalação Fachada Loja A" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase">Qtde</label>
                    <input type="number" id="neg-qtd" step="1" value="1" min="1" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-center bg-white dark:bg-slate-800 font-bold">
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase">Valor Total (R$) *</label>
                    <input type="number" id="neg-valor" step="0.01" placeholder="0.00" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-800">
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-500 uppercase">Observações Adicionais</label>
                    <div class="flex gap-2">
                      <input type="text" id="neg-obs" placeholder="Nº da NF, condições, garantia..." class="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800">
                      <button type="button" onclick="suppliersModule.addNegociacaoItem()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition cursor-pointer shrink-0">
                        + Inserir
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grid com Todas as Negociadas que foram Atendidas -->
              <div class="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
                <div class="bg-slate-100 dark:bg-slate-800 px-3.5 py-2 flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  <span>Histórico de Negociações Atendidas</span>
                  <span id="neg-count-badge" class="font-mono text-[11px] text-blue-600 dark:text-cyan-400 font-bold">Total: ${negociacoes.length}</span>
                </div>
                <div class="max-h-60 overflow-y-auto">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0">
                      <tr>
                        <th class="px-3 py-2 w-24">Data</th>
                        <th class="px-3 py-2">Descrição do Produto e Serviço</th>
                        <th class="px-3 py-2 text-center w-16">Qtde</th>
                        <th class="px-3 py-2 text-right w-24">Valor</th>
                        <th class="px-3 py-2">Observações</th>
                        <th class="px-2 py-2 text-center w-10">✕</th>
                      </tr>
                    </thead>
                    <tbody id="supplier-negociacoes-tbody" class="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                      ${this.renderNegociacoesRows(negociacoes)}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <!-- Rodapé de Ações do Modal -->
            <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span class="text-[11px] text-slate-400">
                Grafsis Cloud • Cadastro de Parceiros e Prestadores
              </span>
              <div class="flex gap-2">
                <button type="button" onclick="document.getElementById('supplier-modal').remove()" class="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" class="px-5 py-2.5 text-xs bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-black shadow-md transition cursor-pointer">
                  Salvar Parceiro
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    `;

    document.getElementById('supplier-modal')?.remove();
    this.activeNegociacoes = JSON.parse(JSON.stringify(negociacoes));
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  switchTab(tab) {
    const tabIdent = document.getElementById('tab-content-identificacao');
    const tabNeg = document.getElementById('tab-content-negociacoes');
    const btnIdent = document.getElementById('tab-btn-identificacao');
    const btnNeg = document.getElementById('tab-btn-negociacoes');

    if (tab === 'identificacao') {
      if (tabIdent) tabIdent.classList.remove('hidden');
      if (tabNeg) tabNeg.classList.add('hidden');
      if (btnIdent) btnIdent.className = "py-2.5 px-4 font-black text-xs border-b-2 border-blue-600 text-blue-600 dark:text-cyan-400 transition flex items-center gap-2 cursor-pointer";
      if (btnNeg) btnNeg.className = "py-2.5 px-4 font-black text-xs border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white transition flex items-center gap-2 cursor-pointer";
    } else {
      if (tabIdent) tabIdent.classList.add('hidden');
      if (tabNeg) tabNeg.classList.remove('hidden');
      if (btnIdent) btnIdent.className = "py-2.5 px-4 font-black text-xs border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white transition flex items-center gap-2 cursor-pointer";
      if (btnNeg) btnNeg.className = "py-2.5 px-4 font-black text-xs border-b-2 border-blue-600 text-blue-600 dark:text-cyan-400 transition flex items-center gap-2 cursor-pointer";
    }
  },

  handleTipoPessoaChange(tipo) {
    const lblNome = document.getElementById('lbl-nome-fantasia');
    const lblRazao = document.getElementById('lbl-razao-social');
    const lblDoc = document.getElementById('lbl-cnpj-cpf');
    const lblVend = document.getElementById('lbl-vendedor');
    const photoLabel = document.getElementById('supplier-photo-label');
    const photoPh = document.getElementById('supplier-photo-placeholder');
    const docInput = document.getElementById('supplier-cnpj-input');

    if (tipo === 'PF') {
      if (lblNome) lblNome.innerText = 'Nome Completo / Apelido Profissional *';
      if (lblRazao) lblRazao.innerText = 'Nome Completo de Registro';
      if (lblDoc) lblDoc.innerText = 'CPF';
      if (lblVend) lblVend.innerText = 'Especialidade / Função Principal';
      if (photoLabel) photoLabel.innerText = 'Foto do Prestador de Serviço';
      if (photoPh) photoPh.innerText = '👤';
      if (docInput) docInput.placeholder = '000.000.000-00';
    } else {
      if (lblNome) lblNome.innerText = 'Nome Fantasia *';
      if (lblRazao) lblRazao.innerText = 'Razão Social';
      if (lblDoc) lblDoc.innerText = 'CNPJ';
      if (lblVend) lblVend.innerText = 'Nome do Vendedor / Representante';
      if (photoLabel) photoLabel.innerText = 'Logomarca da Empresa Fornecedora';
      if (photoPh) photoPh.innerText = '🏢';
      if (docInput) docInput.placeholder = '00.000.000/0001-00';
    }
  },

  async handlePhotoUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      let dataUrl = '';
      if (window.salesModule && typeof window.salesModule.compressImage === 'function') {
        dataUrl = await window.salesModule.compressImage(file, 600, 600, 0.75);
      } else {
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }
      const valInput = document.getElementById('supplier-photo-val');
      if (valInput) valInput.value = dataUrl;

      const container = document.querySelector('#supplier-photo-preview')?.parentElement || document.getElementById('supplier-photo-placeholder')?.parentElement;
      if (container) {
        container.innerHTML = `<img id="supplier-photo-preview" src="${dataUrl}" class="w-full h-full object-cover">`;
      }
    } catch (e) {
      console.warn('[GRAFSIS] Erro ao carregar foto do fornecedor:', e);
    }
  },

  formatDocMask(input) {
    if (!input) return;
    let v = input.value.replace(/\D/g, '');
    const radioPf = document.querySelector('input[name="tipo_pessoa"][value="PF"]');
    const isPf = radioPf && radioPf.checked;

    if (isPf || v.length <= 11) {
      if (v.length > 11) v = v.substring(0, 11);
      v = v.replace(/^(\d{3})(\d)/, '$1.$2')
           .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
           .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
    } else {
      if (v.length > 14) v = v.substring(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2')
           .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
           .replace(/\.(\d{3})(\d)/, '.$1/$2')
           .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    input.value = v;
  },

  renderNegociacoesRows(items = []) {
    if (!items || items.length === 0) {
      return `
        <tr>
          <td colspan="6" class="px-3 py-6 text-center text-slate-400 italic">
            Nenhuma negociação ou serviço atendido registrado ainda. Use o formulário acima para registrar.
          </td>
        </tr>
      `;
    }

    return items.map((it, idx) => `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
        <td class="px-3 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">${it.data ? new Date(it.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</td>
        <td class="px-3 py-2 font-bold text-slate-800 dark:text-slate-100">${it.descricao}</td>
        <td class="px-3 py-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">${it.quantidade || 1}</td>
        <td class="px-3 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ ${Number(it.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td class="px-3 py-2 text-slate-500 text-[11px]">${it.observacoes || '-'}</td>
        <td class="px-2 py-2 text-center">
          <button type="button" onclick="suppliersModule.removeNegociacaoItem(${idx})" class="text-rose-500 hover:text-rose-700 font-bold text-sm cursor-pointer" title="Remover item">✕</button>
        </td>
      </tr>
    `).join('');
  },

  addNegociacaoItem() {
    const dataInput = document.getElementById('neg-data');
    const descInput = document.getElementById('neg-desc');
    const qtdInput = document.getElementById('neg-qtd');
    const valorInput = document.getElementById('neg-valor');
    const obsInput = document.getElementById('neg-obs');

    const desc = descInput ? descInput.value.trim() : '';
    const valor = parseFloat(valorInput ? valorInput.value : 0) || 0;
    if (!desc) {
      alert('Informe a descrição do produto ou serviço.');
      if (descInput) descInput.focus();
      return;
    }
    if (valor <= 0) {
      alert('Informe o valor da negociação.');
      if (valorInput) valorInput.focus();
      return;
    }

    this.activeNegociacoes = this.activeNegociacoes || [];
    this.activeNegociacoes.unshift({
      id: 'neg_' + Date.now(),
      data: dataInput ? dataInput.value : new Date().toISOString().split('T')[0],
      descricao: desc,
      quantidade: parseInt(qtdInput ? qtdInput.value : 1) || 1,
      valor: valor,
      observacoes: obsInput ? obsInput.value.trim() : ''
    });

    const tbody = document.getElementById('supplier-negociacoes-tbody');
    if (tbody) tbody.innerHTML = this.renderNegociacoesRows(this.activeNegociacoes);

    const badge = document.getElementById('neg-count-badge');
    if (badge) badge.innerText = `Total: ${this.activeNegociacoes.length}`;

    if (descInput) descInput.value = '';
    if (valorInput) valorInput.value = '';
    if (obsInput) obsInput.value = '';
    if (qtdInput) qtdInput.value = '1';
  },

  removeNegociacaoItem(idx) {
    if (this.activeNegociacoes && this.activeNegociacoes[idx]) {
      this.activeNegociacoes.splice(idx, 1);
      const tbody = document.getElementById('supplier-negociacoes-tbody');
      if (tbody) tbody.innerHTML = this.renderNegociacoesRows(this.activeNegociacoes);
      const badge = document.getElementById('neg-count-badge');
      if (badge) badge.innerText = `Total: ${this.activeNegociacoes.length}`;
    }
  },

  editModal(id) {
    const supplier = window.store.getSuppliers().find(s => s.id === id);
    if (supplier) this.openModal(supplier);
  },

  save(e, id) {
    e.preventDefault();
    const form = e.target;
    const tipoPessoaRadio = form.querySelector('input[name="tipo_pessoa"]:checked');

    const supplierData = {
      id: id || undefined,
      tipo_pessoa: tipoPessoaRadio ? tipoPessoaRadio.value : 'PJ',
      foto_logo: form.foto_logo ? form.foto_logo.value : '',
      nome_fantasia: form.nome_fantasia.value.trim(),
      razao_social: form.razao_social.value.trim(),
      cnpj: form.cnpj.value.trim(),
      inscricao_estadual: form.inscricao_estadual.value.trim(),
      nome_vendedor: form.nome_vendedor.value.trim(),
      celular_whatsapp: form.celular_whatsapp.value.trim(),
      telefone: form.telefone.value.trim(),
      email: form.email.value.trim(),
      cidade: form.cidade.value.trim(),
      uf: form.uf.value.trim().toUpperCase(),
      endereco: form.endereco.value.trim(),
      categoria_produtos: form.categoria_produtos.value.trim(),
      negociacoes: this.activeNegociacoes || []
    };

    window.store.saveSupplier(supplierData);
    document.getElementById('supplier-modal').remove();
    this.render();
  },

  delete(id) {
    if (confirm('Tem certeza que deseja remover este fornecedor/prestador?')) {
      window.store.deleteSupplier(id);
      this.render();
    }
  }
};
