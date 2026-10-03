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
          <div class="relative">
            <input type="text" id="supplier-search" oninput="suppliersModule.search(this.value)" placeholder="Buscar por Nome Fantasia, Razão Social, CNPJ, Vendedor ou Insumo..." class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
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

  openModal(supplier = null) {
    const isEdit = !!supplier;
    const modalHtml = `
      <div id="supplier-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">${isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
            <button onclick="document.getElementById('supplier-modal').remove()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form id="supplier-form" onsubmit="suppliersModule.save(event, '${supplier ? supplier.id : ''}')" class="mt-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Nome Fantasia *</label>
                <input type="text" name="nome_fantasia" required value="${supplier ? supplier.nome_fantasia : ''}" placeholder="Ex: Distribuidora Paulista" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Razão Social</label>
                <input type="text" name="razao_social" value="${supplier ? (supplier.razao_social || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">CNPJ</label>
                <input type="text" name="cnpj" value="${supplier ? (supplier.cnpj || '') : ''}" placeholder="00.000.000/0001-00" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Inscrição Estadual</label>
                <input type="text" name="inscricao_estadual" value="${supplier ? (supplier.inscricao_estadual || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Nome do Vendedor / Representante</label>
                <input type="text" name="nome_vendedor" value="${supplier ? (supplier.nome_vendedor || '') : ''}" placeholder="Ex: Marcos Souza" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Celular / WhatsApp *</label>
                <input type="text" name="celular_whatsapp" required value="${supplier ? (supplier.celular_whatsapp || supplier.telefone || '') : ''}" placeholder="(11) 98888-7777" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Telefone Fixo</label>
                <input type="text" name="telefone" value="${supplier ? (supplier.telefone || '') : ''}" placeholder="(11) 2345-6789" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">E-mail Comercial</label>
                <input type="email" name="email" value="${supplier ? (supplier.email || '') : ''}" placeholder="vendas@fornecedor.com" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input type="text" name="cidade" value="${supplier ? (supplier.cidade || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">UF</label>
                  <input type="text" name="uf" maxlength="2" value="${supplier ? (supplier.uf || '') : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Endereço Completo</label>
                <input type="text" name="endereco" value="${supplier ? (supplier.endereco || '') : ''}" placeholder="Rua, Número, Bairro" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-slate-600 mb-1">Categorias de Insumos Fornecidos</label>
                <input type="text" name="categoria_produtos" value="${supplier ? (supplier.categoria_produtos || '') : ''}" placeholder="Ex: Vinil Imprimível, Bobinas de Lona 440g, Tintas solvente, Chapas ACM, Acrílico" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onclick="document.getElementById('supplier-modal').remove()" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="submit" class="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">Salvar Fornecedor</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  editModal(id) {
    const supplier = window.store.getSuppliers().find(s => s.id === id);
    if (supplier) this.openModal(supplier);
  },

  save(e, id) {
    e.preventDefault();
    const form = e.target;
    const supplierData = {
      id: id || undefined,
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
      categoria_produtos: form.categoria_produtos.value.trim()
    };

    window.store.saveSupplier(supplierData);
    document.getElementById('supplier-modal').remove();
    this.render();
  },

  delete(id) {
    if (confirm('Tem certeza que deseja remover este fornecedor?')) {
      window.store.deleteSupplier(id);
      this.render();
    }
  }
};
