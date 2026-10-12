/* ==============================================================================
   GRAFSIS - Módulo de Produtos & Calculadora Fracionada
   Venda Fracionada (m² e metros lineares): Largura (X) x Comprimento (Y), Brindes
   ============================================================================== */

window.productsModule = {
  render() {
    const products = window.store.getProducts();
    const container = document.getElementById('view-container');
    
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Catálogo (Produtos/Serviços)</h1>
            <p class="text-slate-500 text-sm">Catálogo de produtos, insumos e serviços com venda fracionada por m² (Largura X x Comprimento Y), metro linear e peças unitárias</p>
          </div>
          <div class="flex gap-2">
            <button onclick="productsModule.openCalculatorModal()" class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              Calculadora Rápida m²
            </button>
            <button onclick="productsModule.openInkModal()" class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg shadow-sm transition mr-2">💧 Controle de Tintas</button><button onclick="productsModule.openModal()" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Novo Produto
            </button>
          </div>
        </div>

        <!-- Filtro de Busca -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input type="text" id="product-search" oninput="productsModule.search(this.value)" placeholder="Buscar por Nome do Produto, Categoria..." class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <select id="product-category-filter" onchange="productsModule.filterCategory(this.value)" class="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">Todas as Categorias</option>
            <option value="Lonas">Lonas</option>
            <option value="Adesivos">Adesivos</option>
            <option value="Brindes">Brindes</option>
            <option value="Serviços de Recorte">Serviços de Recorte</option>
            <option value="Placas e Painéis">Placas e Painéis</option>
          </select>
        </div>

        <!-- Cards de Produtos -->
        <div id="products-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          ${this.renderCards(products)}
        </div>
      </div>
    `;
  },

  renderCards(products) {
    if (products.length === 0) {
      return `
        <div class="col-span-full py-12 text-center text-slate-400">
          <svg class="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <p class="text-base font-medium">Nenhum produto cadastrado</p>
          <p class="text-sm">Cadastre lonas, vinis adesivos, brindes ou serviços de recorte</p>
        </div>
      `;
    }

    return products.map(prod => {
      const isM2 = prod.tipo_cobranca === 'm2';
      const isLinear = prod.tipo_cobranca === 'linear';

      let typeBadge = '';
      if (isM2) {
        typeBadge = '<span class="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">Fracionado m²</span>';
      } else if (isLinear) {
        typeBadge = '<span class="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">Metro Linear</span>';
      } else {
        typeBadge = '<span class="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">Unitário</span>';
      }

      return `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="w-full h-36 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center relative mb-3">
              ${prod.foto_url 
                ? `<img src="${prod.foto_url}" class="w-full h-full object-cover" alt="${prod.nome}">`
                : `<svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`
              }
              <div class="absolute top-2 right-2">${typeBadge}</div>
            </div>

            <div class="flex justify-between items-start gap-1">
              <h3 class="font-bold text-slate-800 text-sm leading-tight">${prod.nome}</h3>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${prod.categoria || 'Geral'}</p>

            ${prod.descricao ? `<p class="text-xs text-slate-600 mt-2 line-clamp-2">${prod.descricao}</p>` : ''}

            <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-end">
              <div>
                <span class="text-[11px] text-slate-400 block">Preço de Venda</span>
                <span class="text-lg font-extrabold text-blue-600">R$ ${Number(prod.preco_base).toFixed(2)}</span>
                <span class="text-[11px] text-slate-500 font-medium">/ ${prod.unidade_medida || 'm²'}</span>
              </div>
              <div class="text-right">
                <span class="text-[11px] text-slate-400 block">Estoque</span>
                <span class="text-xs font-bold ${prod.estoque_atual <= prod.estoque_minimo ? 'text-amber-600' : 'text-slate-700'}">
                  ${prod.estoque_atual} ${prod.unidade_medida}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <button onclick="productsModule.openCalculatorForProduct('${prod.id}')" class="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              Calcular
            </button>
            <div class="flex gap-2">
              <button onclick="productsModule.editModal('${prod.id}')" class="text-slate-500 hover:text-slate-800 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button onclick="productsModule.delete('${prod.id}')" class="text-red-500 hover:text-red-700 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  search(term) {
    const products = window.store.getProducts();
    const t = term.toLowerCase().trim();
    const filtered = products.filter(p => 
      (p.nome && p.nome.toLowerCase().includes(t)) ||
      (p.categoria && p.categoria.toLowerCase().includes(t))
    );
    document.getElementById('products-list').innerHTML = this.renderCards(filtered);
  },

  filterCategory(cat) {
    const products = window.store.getProducts();
    if (!cat) {
      document.getElementById('products-list').innerHTML = this.renderCards(products);
      return;
    }
    const filtered = products.filter(p => p.categoria === cat);
    document.getElementById('products-list').innerHTML = this.renderCards(filtered);
  },

  openModal(product = null) {
    const isEdit = !!product;
    const modalHtml = `
      <div id="product-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">${isEdit ? 'Editar Produto / Serviço' : 'Novo Produto / Serviço'}</h2>
            <button onclick="document.getElementById('product-modal').remove()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form id="product-form" onsubmit="productsModule.save(event, '${product ? product.id : ''}')" class="mt-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-slate-600 mb-1">Nome do Produto / Serviço *</label>
                <input type="text" name="nome" required value="${product ? product.nome : ''}" placeholder="Ex: Lona Frontlight 440g Brilho" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Categoria *</label>
                <select name="categoria" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Lonas" ${product && product.categoria === 'Lonas' ? 'selected' : ''}>Lonas (Banner, Fachada, Outdoor)</option>
                  <option value="Adesivos" ${product && product.categoria === 'Adesivos' ? 'selected' : ''}>Adesivos (Vinil, Perfurado, Recorte)</option>
                  <option value="Brindes" ${product && product.categoria === 'Brindes' ? 'selected' : ''}>Brindes (Canecas, Copos, Camisas)</option>
                  <option value="Serviços de Recorte" ${product && product.categoria === 'Serviços de Recorte' ? 'selected' : ''}>Serviços de Recorte Laser / Router / Plotter</option>
                  <option value="Placas e Painéis" ${product && product.categoria === 'Placas e Painéis' ? 'selected' : ''}>Placas e Painéis (ACM, PVC Expandido, Acrílico)</option>
                  <option value="Outros" ${product && product.categoria === 'Outros' ? 'selected' : ''}>Outros Serviços Gráficos</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Tipo de Cobrança / Cálculo *</label>
                <select name="tipo_cobranca" id="tipo_cobranca" onchange="productsModule.adjustUnit(this.value)" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="m2" ${product && product.tipo_cobranca === 'm2' ? 'selected' : ''}>Fracionado por m² (Largura X x Altura Y)</option>
                  <option value="linear" ${product && product.tipo_cobranca === 'linear' ? 'selected' : ''}>Metro Linear (Comprimento)</option>
                  <option value="unidade" ${product && product.tipo_cobranca === 'unidade' ? 'selected' : ''}>Por Peça / Unidade (Brindes)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Preço de Venda Base (R$) *</label>
                <input type="number" step="0.01" name="preco_base" required value="${product ? product.preco_base : '0.00'}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Custo Base (R$)</label>
                <input type="number" step="0.01" name="custo_base" value="${product ? product.custo_base : '0.00'}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Estoque Atual</label>
                <input type="number" step="0.1" name="estoque_atual" value="${product ? product.estoque_atual : '100'}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Estoque Mínimo</label>
                <input type="number" step="0.1" name="estoque_minimo" value="${product ? product.estoque_minimo : '20'}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div class="md:col-span-2 p-3 bg-slate-50 border rounded-lg" id="div-larguras" style="${product && product.tipo_cobranca === 'm2' ? '' : 'display:none;'}">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Larguras de Bobina Disponíveis em Estoque (metros)</label>
                <input type="text" name="larguras_bobinas" value="${product && product.larguras_bobinas ? product.larguras_bobinas : '1.06, 1.27, 1.37, 1.52'}" placeholder="Ex: 1.00, 1.20, 1.60" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <span class="text-[10px] text-slate-500">Separado por vírgulas. Usado para sugerir a bobina com menor perda na produção.</span>
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-slate-600 mb-1">Foto do Produto / Acabamento (URL ou Arquivo)</label>
                <input type="text" name="foto_url" id="product-foto-url" value="${product ? (product.foto_url || '') : ''}" placeholder="Link da foto do produto" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-1">
                <input type="file" accept="image/*" onchange="productsModule.handlePhotoUpload(this)" class="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-slate-600 mb-1">Descrição / Especificações Técnicas</label>
                <textarea name="descricao" rows="2" placeholder="Gramatura, durabilidade externa, tipo de tinta..." class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${product ? (product.descricao || '') : ''}</textarea>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onclick="document.getElementById('product-modal').remove()" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="submit" class="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">Salvar Produto</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  adjustUnit(type) {
    const divLarguras = document.getElementById('div-larguras');
    if(divLarguras) divLarguras.style.display = type === 'm2' ? 'block' : 'none';
    // Automático
  },

  handlePhotoUpload(input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('product-foto-url').value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  editModal(id) {
    const product = window.store.getProducts().find(p => p.id === id);
    if (product) this.openModal(product);
  },

  save(e, id) {
    e.preventDefault();
    const form = e.target;
    const tipo = form.tipo_cobranca.value;
    let unit = 'm²';
    if (tipo === 'linear') unit = 'm';
    if (tipo === 'unidade') unit = 'un';

    const productData = {
      id: id || undefined,
      nome: form.nome.value.trim(),
      categoria: form.categoria.value,
      tipo_cobranca: tipo,
      preco_base: parseFloat(form.preco_base.value) || 0,
      custo_base: parseFloat(form.custo_base.value) || 0,
      estoque_atual: parseFloat(form.estoque_atual.value) || 0,
      estoque_minimo: parseFloat(form.estoque_minimo.value) || 0,
      larguras_bobinas: form.larguras_bobinas ? form.larguras_bobinas.value.trim() : '',
      unidade_medida: unit,
      foto_url: form.foto_url.value.trim(),
      descricao: form.descricao.value.trim()
    };

    window.store.saveProduct(productData);
    document.getElementById('product-modal').remove();
    this.render();
  },

  delete(id) {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      window.store.deleteProduct(id);
      this.render();
    }
  },

  // Calculadora Interativa Fracionada de m² (Largura X x Comprimento Y)
  openCalculatorModal(preSelectedProdId = null) {
    const products = window.store.getProducts();
    const selectedProd = preSelectedProdId ? products.find(p => p.id === preSelectedProdId) : (products[0] || null);

    const modalHtml = `
      <div id="calc-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </span>
              <h2 class="text-lg font-bold text-slate-800">Calculadora Fracionada (m²)</h2>
            </div>
            <button onclick="document.getElementById('calc-modal').remove()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Selecione o Material</label>
              <select id="calc-product" onchange="productsModule.updateCalcProductPrice()" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                ${products.map(p => `
                  <option value="${p.id}" data-price="${p.preco_base}" data-type="${p.tipo_cobranca}" ${selectedProd && selectedProd.id === p.id ? 'selected' : ''}>
                    ${p.nome} (${p.tipo_cobranca === 'm2' ? 'm²' : p.unidade_medida}) - R$ ${Number(p.preco_base).toFixed(2)}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Largura X (metros)</label>
                <input type="number" id="calc-width" step="0.01" value="1.20" oninput="productsModule.runCalculation()" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <span class="text-[10px] text-slate-500">Ex: 1.20 m</span>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Comprimento Y (metros)</label>
                <input type="number" id="calc-height" step="0.01" value="2.50" oninput="productsModule.runCalculation()" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <span class="text-[10px] text-slate-500">Ex: 2.50 m</span>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Quantidade</label>
                <input type="number" id="calc-qty" step="1" value="1" min="1" oninput="productsModule.runCalculation()" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Desconto (%)</label>
                <input type="number" id="calc-discount" step="1" value="0" min="0" max="100" oninput="productsModule.runCalculation()" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Preço Unitário m²</label>
                <input type="number" id="calc-unit-price" step="0.01" value="${selectedProd ? selectedProd.preco_base : '45.00'}" oninput="productsModule.runCalculation()" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <!-- Resultado Destacado -->
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-200 flex justify-between items-center">
              <div>
                <p class="text-xs text-blue-700 font-medium">Área Total Fracionada:</p>
                <p class="text-lg font-extrabold text-blue-900" id="calc-res-area">3.000 m²</p>
                <p class="text-[11px] text-blue-600" id="calc-res-sub">1 peça(s) de 1.20m x 2.50m</p>
                <div id="calc-res-sugestao" class="mt-2 text-[10px] font-semibold text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 hidden"></div>
              </div>
              <div class="text-right">
                <p class="text-xs text-blue-700 font-medium">Valor Total:</p>
                <p class="text-2xl font-black text-blue-700" id="calc-res-total">R$ 135,00</p>
              </div>
            </div>

            <div class="pt-2 flex justify-end gap-2">
              <button onclick="document.getElementById('calc-modal').remove()" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Fechar</button>
              <button onclick="productsModule.sendCalcToNewOrder()" class="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">
                Criar Orçamento com Esse Item
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.runCalculation();
  },

  openCalculatorForProduct(prodId) {
    this.openCalculatorModal(prodId);
  },

  updateCalcProductPrice() {
    const sel = document.getElementById('calc-product');
    const opt = sel.options[sel.selectedIndex];
    const price = opt.getAttribute('data-price');
    document.getElementById('calc-unit-price').value = price;
    this.runCalculation();
  },

  runCalculation() {
    const width = parseFloat(document.getElementById('calc-width').value) || 0;
    const height = parseFloat(document.getElementById('calc-height').value) || 0;
    const qty = parseFloat(document.getElementById('calc-qty').value) || 1;
    const discount = parseFloat(document.getElementById('calc-discount').value) || 0;
    const unitPrice = parseFloat(document.getElementById('calc-unit-price').value) || 0;

    const areaPerUnit = width * height;
    const totalArea = areaPerUnit * qty;
    let totalValue = totalArea * unitPrice;

    if (discount > 0) {
      totalValue = totalValue * (1 - (discount / 100));
    }

    document.getElementById('calc-res-area').innerText = `${totalArea.toFixed(3)} m²`;
    document.getElementById('calc-res-sub').innerText = `${qty} peça(s) de ${width.toFixed(2)}m x ${height.toFixed(2)}m`;
    
    // Suggest Roll logic
    const sel = document.getElementById('calc-product');
    const opt = sel.options[sel.selectedIndex];
    const prodId = sel.value;
    const prod = window.store.getProducts().find(p => p.id === prodId);
    const sugEl = document.getElementById('calc-res-sugestao');
    
    if (prod && prod.tipo_cobranca === 'm2' && prod.larguras_bobinas) {
      const rollsStr = prod.larguras_bobinas.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      if (rollsStr.length > 0) {
        let bestRoll = null;
        let minWaste = Infinity;
        let orientation = '';

        for (const r of rollsStr) {
          // Normal: width along the roll width
          if (width <= r) {
            const wasteW = r - width;
            const wasteArea = wasteW * height;
            if (wasteArea < minWaste) { minWaste = wasteArea; bestRoll = r; orientation = 'Normal'; }
          }
          // Rotated: height along the roll width
          if (height <= r) {
            const wasteW = r - height;
            const wasteArea = wasteW * width;
            if (wasteArea < minWaste) { minWaste = wasteArea; bestRoll = r; orientation = 'Rotacionado'; }
          }
        }
        
        if (bestRoll) {
          sugEl.style.display = 'block';
          sugEl.innerHTML = `💡 <b>Produção:</b> Usar bobina <b>${bestRoll.toFixed(2)}m</b> (${orientation}).<br>Perda aprox: <b>${minWaste.toFixed(2)}m²</b> por peça.`;
        } else {
          sugEl.style.display = 'block';
          sugEl.innerHTML = `⚠️ Peça maior que todas as bobinas (${prod.larguras_bobinas}). Necessário emenda!`;
        }
      } else {
        sugEl.style.display = 'none';
      }
    } else {
      sugEl.style.display = 'none';
    }
    document.getElementById('calc-res-total').innerText = `R$ ${totalValue.toFixed(2)}`;
  },

  sendCalcToNewOrder() {
    const sel = document.getElementById('calc-product');
    const opt = sel.options[sel.selectedIndex];
    const prodId = sel.value;
    const width = parseFloat(document.getElementById('calc-width').value) || 0;
    const height = parseFloat(document.getElementById('calc-height').value) || 0;
    const qty = parseFloat(document.getElementById('calc-qty').value) || 1;
    const discount = parseFloat(document.getElementById('calc-discount').value) || 0;
    const unitPrice = parseFloat(document.getElementById('calc-unit-price').value) || 0;

    document.getElementById('calc-modal').remove();
    
    // Abre modal de pedidos pré-preenchido
    window.salesModule.openModal({
      preItem: {
        produto_id: prodId,
        descricao: opt.text.split(' - ')[0],
        tipo_calculo: 'm2',
        largura_x: width,
        comprimento_y: height,
        quantidade: qty,
        desconto: discount,
        preco_unitario: unitPrice
      }
    });
  }
,
  getInkData() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('grafsis_ink_control') || 'null');
    } catch (e) { saved = null; }
    
    if (!saved) {
      saved = {
        activeTab: 'solvente',
        solvente: {
          rendimento_m2: 120,
          preco_litro_manual: null,
          estoque: { C: 5.0, M: 4.5, Y: 6.0, K: 8.0 },
          historico: [
            { id: 'ink-s1', cor: 'C', marca: 'InkTec', fornecedor: 'Global Tintas', data: '2026-10-01', qtde: 2.0, preco_unitario: 70.00 },
            { id: 'ink-s2', cor: 'M', marca: 'InkTec', fornecedor: 'Global Tintas', data: '2026-10-01', qtde: 2.0, preco_unitario: 70.00 },
            { id: 'ink-s3', cor: 'Y', marca: 'InkTec', fornecedor: 'Global Tintas', data: '2026-10-01', qtde: 2.0, preco_unitario: 75.00 },
            { id: 'ink-s4', cor: 'K', marca: 'Marabu', fornecedor: 'InkTec Brasil', data: '2026-10-05', qtde: 4.0, preco_unitario: 80.00 }
          ]
        },
        sublimacao: {
          rendimento_m2: 150,
          preco_litro_manual: null,
          estoque: { C: 3.0, M: 3.0, Y: 2.5, K: 4.0 },
          historico: [
            { id: 'ink-sub1', cor: 'C', marca: 'Gênesis', fornecedor: 'Gênesis Tintas', data: '2026-09-28', qtde: 1.0, preco_unitario: 85.00 },
            { id: 'ink-sub2', cor: 'M', marca: 'Gênesis', fornecedor: 'Gênesis Tintas', data: '2026-09-28', qtde: 1.0, preco_unitario: 85.00 },
            { id: 'ink-sub3', cor: 'Y', marca: 'Gênesis', fornecedor: 'Gênesis Tintas', data: '2026-09-28', qtde: 1.0, preco_unitario: 90.00 },
            { id: 'ink-sub4', cor: 'K', marca: 'Sensient', fornecedor: 'Sensient Subli', data: '2026-10-04', qtde: 2.0, preco_unitario: 95.00 }
          ]
        }
      };
      this.saveInkData(saved);
    }
    return saved;
  },

  saveInkData(data) {
    localStorage.setItem('grafsis_ink_control', JSON.stringify(data));
    if (window.store && window.store.supabaseClient) {
      window.store.pushRecord('settings', { id: 'ink_control', data: JSON.stringify(data) }).catch(() => {});
    }
  },

  setInkTab(tab) {
    const data = this.getInkData();
    data.activeTab = tab;
    this.saveInkData(data);
    this.renderInkModalContent();
  },

  addInkPurchase() {
    const cor = document.getElementById('new-ink-color').value;
    const marca = (document.getElementById('new-ink-marca')?.value || '').trim() || 'Padrão';
    const fornecedor = (document.getElementById('new-ink-fornecedor')?.value || '').trim() || 'Fornecedor Padrão';
    const data = document.getElementById('new-ink-date')?.value || new Date().toISOString().slice(0, 10);
    const qtde = parseFloat(document.getElementById('new-ink-qtde')?.value) || 0;
    const preco = parseFloat(document.getElementById('new-ink-preco')?.value) || 0;

    if (qtde <= 0) return alert('Informe a quantidade em litros (mínimo 0,250 L).');
    if (preco <= 0) return alert('Informe o preço unitário por litro.');

    const inkData = this.getInkData();
    const cat = inkData.activeTab || 'solvente';
    
    // Adiciona ao histórico em linha simples com Marca
    const newEntry = {
      id: 'ink-' + Date.now(),
      cor,
      marca,
      fornecedor,
      data,
      qtde: parseFloat(qtde.toFixed(3)),
      preco_unitario: preco
    };
    if (!inkData[cat].historico) inkData[cat].historico = [];
    inkData[cat].historico.unshift(newEntry);

    // REGRA: Entrada vai automaticamente para o controle de estoque de tinta!
    if (!inkData[cat].estoque) inkData[cat].estoque = { C: 0, M: 0, Y: 0, K: 0 };
    inkData[cat].estoque[cor] = parseFloat(((parseFloat(inkData[cat].estoque[cor]) || 0) + qtde).toFixed(3));

    // Reseta override manual para que a Regra de Ouro recalcule imediatamente com o maior preço
    inkData[cat].preco_litro_manual = null;

    this.saveInkData(inkData);
    this.renderInkModalContent();
  },

  deleteInkPurchase(id) {
    if (!confirm('Atenção: Confirma a exclusão desta entrada de compra do histórico?\nO estoque será abatido automaticamente.')) return;
    const inkData = this.getInkData();
    const cat = inkData.activeTab || 'solvente';
    const entry = (inkData[cat].historico || []).find(h => h.id === id);
    if (entry) {
      // Abate do estoque correspondente
      if (inkData[cat].estoque && inkData[cat].estoque[entry.cor] !== undefined) {
        inkData[cat].estoque[entry.cor] = parseFloat(Math.max(0, (inkData[cat].estoque[entry.cor] - entry.qtde)).toFixed(3));
      }
      inkData[cat].historico = inkData[cat].historico.filter(h => h.id !== id);
      this.saveInkData(inkData);
      this.renderInkModalContent();
    }
  },

  updateInkStockManual(cor, val) {
    const inkData = this.getInkData();
    const cat = inkData.activeTab || 'solvente';
    if (!inkData[cat].estoque) inkData[cat].estoque = {};
    inkData[cat].estoque[cor] = parseFloat(Math.max(0, parseFloat(val) || 0).toFixed(3));
    this.saveInkData(inkData);
    this.renderInkModalContent();
  },

  updateInkCalc() {
    const inkData = this.getInkData();
    const cat = inkData.activeTab || 'solvente';
    const precoLitroInput = parseFloat(document.getElementById('ink-calc-preco-l').value) || 0;
    const rendimentoInput = parseFloat(document.getElementById('ink-calc-rendimento').value) || 1;

    inkData[cat].preco_litro_manual = precoLitroInput;
    inkData[cat].rendimento_m2 = rendimentoInput;
    this.saveInkData(inkData);

    const custoM2 = rendimentoInput > 0 ? (precoLitroInput / rendimentoInput) : 0;
    const resEl = document.getElementById('ink-calc-res-m2');
    if (resEl) {
      resEl.innerText = 'R$ ' + custoM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },

  openInkModal() {
    let existing = document.getElementById('ink-modal');
    if (existing) existing.remove();

    const modalHtml = `
      <div id="ink-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
          <!-- Topo do Modal -->
          <div class="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
            <div>
              <h2 class="text-xl font-black text-slate-800 flex items-center gap-2">
                💧 Controle de Tintas
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Gestão por cor CMYK, histórico de compras, estoque automático e Regra de Ouro (Maior Preço)</p>
            </div>
            <button onclick="document.getElementById('ink-modal').remove()" class="text-slate-400 hover:text-slate-700 font-black text-2xl leading-none">&times;</button>
          </div>

          <!-- Corpo com Conteúdo Dinâmico -->
          <div id="ink-modal-body" class="p-5 overflow-y-auto flex-1 space-y-5">
          </div>

          <!-- Rodapé -->
          <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
            <button onclick="document.getElementById('ink-modal').remove()" class="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition shadow-sm">
              Concluir & Fechar
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.renderInkModalContent();
  },

  renderInkModalContent() {
    const container = document.getElementById('ink-modal-body');
    if (!container) return;

    const inkData = this.getInkData();
    const cat = inkData.activeTab || 'solvente';
    const catData = inkData[cat] || { estoque: {}, historico: [], rendimento_m2: 120 };

    // Cores CMYK e suas propriedades visuais
    const colors = [
      { key: 'C', name: 'Ciano', hex: '#00AEEF', solidBg: '#00AEEF', solidText: '#ffffff', bg: 'bg-[#00AEEF]', text: 'text-white' },
      { key: 'M', name: 'Magenta', hex: '#EC008C', solidBg: '#EC008C', solidText: '#ffffff', bg: 'bg-[#EC008C]', text: 'text-white' },
      { key: 'Y', name: 'Amarelo', hex: '#FFF200', solidBg: '#FFF200', solidText: '#0f172a', bg: 'bg-[#FFF200]', text: 'text-slate-900 border border-amber-300' },
      { key: 'K', name: 'Preto', hex: '#111827', solidBg: '#111827', solidText: '#ffffff', bg: 'bg-[#111827]', text: 'text-white' }
    ];

    // REGRA DE OURO: O MAIOR PREÇO registrado no histórico independe da data de compra!
    const allPrices = (catData.historico || []).map(h => parseFloat(h.preco_unitario) || 0).filter(p => p > 0);
    const goldenRulePrice = allPrices.length > 0 ? Math.max(...allPrices) : (cat === 'solvente' ? 75.00 : 90.00);
    
    // Preço do Litro a ser considerado (manual ou Regra de Ouro)
    const effectivePricePerL = catData.preco_litro_manual !== null && catData.preco_litro_manual !== undefined 
      ? catData.preco_litro_manual 
      : goldenRulePrice;

    const rendimentoM2 = catData.rendimento_m2 || (cat === 'solvente' ? 120 : 150);
    const custoM2 = rendimentoM2 > 0 ? (effectivePricePerL / rendimentoM2) : 0;

    // CÁLCULO GERAL: QUANTIDADE TOTAL DE TINTA EM ESTOQUE E RENDIMENTO TOTAL EM M²
    const totalStockL = colors.reduce((acc, col) => acc + (parseFloat(catData.estoque?.[col.key]) || 0), 0);
    const totalYieldM2 = totalStockL * rendimentoM2;

    const formatDec = (n, dec = 3) => {
      return Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    };

    container.innerHTML = `
      <!-- ABAS DE NAVEGAÇÃO ENTRE AS 2 CATEGORIAS -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          type="button" 
          onclick="productsModule.setInkTab('solvente')"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${cat === 'solvente' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          <span>🟨 Tinta Eco-Solvente (CMYK)</span>
        </button>
        <button 
          type="button" 
          onclick="productsModule.setInkTab('sublimacao')"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${cat === 'sublimacao' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          <span>🟣 Tinta Sublimática (CMYK)</span>
        </button>
      </div>

      <!-- PAINEL DE RENDIMENTO GLOBAL E CAPACIDADE EM M² -->
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0 border border-white/20">
            📊
          </div>
          <div>
            <div class="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Rendimento Estimado da Categoria (${cat === 'solvente' ? 'Eco-Solvente' : 'Sublimação'})</div>
            <div class="text-xl font-black flex items-center gap-2 mt-0.5">
              <span>${formatDec(totalYieldM2, 1)} m²</span>
              <span class="text-xs font-medium text-slate-300">de capacidade total de impressão</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 sm:border-l border-white/15 pt-2 sm:pt-0 sm:pl-4">
          <div class="text-center sm:text-right">
            <span class="text-[10px] text-blue-200 uppercase font-bold block">Estoque Total CMYK:</span>
            <span class="text-lg font-black text-amber-300 font-mono">${formatDec(totalStockL, 3)} L</span>
          </div>
          <div class="text-center sm:text-right pl-3 border-l border-white/15">
            <span class="text-[10px] text-blue-200 uppercase font-bold block">Rendimento do Equipamento:</span>
            <span class="text-lg font-black text-white font-mono">${formatDec(rendimentoM2, 0)} m²/L</span>
          </div>
        </div>
      </div>

      <!-- CARDS DE CONTROLE POR COR CMYK (Estoque Atual, Rendimento m², Última Compra e Maior Preço) -->
      <div>
        <div class="flex justify-between items-center mb-2.5">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Estoque Atual & Dados por Cor (CMYK)</h3>
          <span class="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
            ⭐ Regra de Ouro: Maior Preço R$ ${formatDec(goldenRulePrice, 2)}/L
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${colors.map(col => {
            const stock = (catData.estoque && catData.estoque[col.key] !== undefined) ? catData.estoque[col.key] : 0;
            const corHist = (catData.historico || []).filter(h => h.cor === col.key);
            const lastBuy = corHist[0] || null;
            const maxCorPrice = corHist.length > 0 ? Math.max(...corHist.map(h => h.preco_unitario)) : 0;
            const yieldCor = stock * rendimentoM2;

            return `
              <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="w-4 h-4 rounded-full ${col.bg} shrink-0 shadow-sm"></span>
                      <span class="font-black text-sm text-slate-800">${col.name} (${col.key})</span>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Estoque em Litros:</span>
                    <div class="flex items-center gap-1 mt-0.5">
                      <input 
                        type="number" 
                        step="0.250" 
                        min="0"
                        value="${Number(stock).toFixed(3)}" 
                        onchange="productsModule.updateInkStockManual('${col.key}', this.value)"
                        class="w-24 font-black text-sm text-blue-700 bg-blue-50/60 border border-blue-200 rounded px-2 py-0.5 focus:bg-white focus:outline-none"
                        title="Altere em frações de 0,250L">
                      <span class="text-xs font-bold text-slate-500">L</span>
                    </div>
                    <div class="mt-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                      Rendimento: ${formatDec(yieldCor, 1)} m²
                    </div>
                  </div>
                </div>

                <div class="mt-3 pt-2 border-t border-slate-100 text-[10px] space-y-0.5 text-slate-500">
                  <div><strong>Última compra:</strong> ${lastBuy ? new Date(lastBuy.data + 'T12:00:00').toLocaleDateString('pt-BR') : '--'}</div>
                  <div class="truncate" title="${lastBuy ? ((lastBuy.marca ? lastBuy.marca + ' - ' : '') + lastBuy.fornecedor) : ''}">
                    <strong>Marca/Forn:</strong> ${lastBuy ? ((lastBuy.marca ? lastBuy.marca + ' / ' : '') + lastBuy.fornecedor) : '--'}
                  </div>
                  <div><strong>Preço Último:</strong> ${lastBuy ? 'R$ ' + formatDec(lastBuy.preco_unitario, 2) : '--'}</div>
                  <div class="text-amber-700 font-bold"><strong>Maior Preço:</strong> ${maxCorPrice > 0 ? 'R$ ' + formatDec(maxCorPrice, 2) : '--'}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- CÁLCULO DE CUSTO POR M² BASEADO NO RENDIMENTO E PREÇO DO LITRO -->
      <div class="bg-gradient-to-r from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <h3 class="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          Cálculo de Custo por m² Impresso (Regra de Ouro)
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Preço do Litro (R$/L) *</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
              <input 
                type="number" 
                step="0.01" 
                id="ink-calc-preco-l" 
                value="${effectivePricePerL.toFixed(2)}" 
                oninput="productsModule.updateInkCalc()"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
                title="Pré-carregado com o Maior Preço do histórico (Regra de Ouro)">
            </div>
            <span class="text-[10px] text-slate-400 mt-1 block">Sugerido: Maior preço R$ ${formatDec(goldenRulePrice, 2)}</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Rendimento Esperado (m² por Litro) *</label>
            <div class="relative">
              <input 
                type="number" 
                step="1" 
                id="ink-calc-rendimento" 
                value="${rendimentoM2}" 
                oninput="productsModule.updateInkCalc()"
                placeholder="Ex: 120"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm">
              <span class="absolute right-3 top-2 text-xs font-bold text-slate-400">m²/L</span>
            </div>
            <span class="text-[10px] text-slate-400 mt-1 block">Digitar o rendimento do equipamento</span>
          </div>

          <div class="bg-white p-3 rounded-xl border-2 border-purple-200 shadow-inner flex flex-col justify-center">
            <span class="text-[10px] font-black uppercase text-purple-700 tracking-wider">Custo Calculado por m²</span>
            <span class="text-2xl font-black text-purple-800 font-mono mt-0.5" id="ink-calc-res-m2">R$ ${formatDec(custoM2, 2)}</span>
          </div>
        </div>
      </div>

      <!-- ENTRADA DE COMPRA DE TINTA COM MARCA E FRAÇÃO 0.250L -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h3 class="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nova Entrada de Compra (Soma Automática no Estoque)
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-end">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Cor CMYK</label>
            <select id="new-ink-color" class="w-full p-2 border rounded-xl text-xs bg-slate-50 font-bold text-slate-800">
              <option value="C">🔵 Ciano (C)</option>
              <option value="M">🟣 Magenta (M)</option>
              <option value="Y">🟡 Amarelo (Y)</option>
              <option value="K">⚫ Preto (K)</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Marca</label>
            <input type="text" id="new-ink-marca" placeholder="Ex: InkTec / Marabu" class="w-full p-2 border rounded-xl text-xs bg-slate-50 font-medium">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Fornecedor</label>
            <input type="text" id="new-ink-fornecedor" placeholder="Ex: Global Tintas" class="w-full p-2 border rounded-xl text-xs bg-slate-50 font-medium">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Data</label>
            <input type="date" id="new-ink-date" value="${new Date().toISOString().slice(0, 10)}" class="w-full p-2 border rounded-xl text-xs bg-slate-50 font-medium">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1" title="Clique nas setas para frações de 0,250 Litros">Qtde (Litros) ↕ 0,25L</label>
            <input 
              type="number" 
              step="0.250" 
              min="0.250" 
              id="new-ink-qtde" 
              placeholder="Ex: 0.250" 
              class="w-full p-2 border rounded-xl text-xs bg-slate-50 font-black text-blue-700">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Preço/L (R$)</label>
            <input type="number" step="0.01" id="new-ink-preco" placeholder="0.00" class="w-full p-2 border rounded-xl text-xs bg-slate-50 font-black">
          </div>
        </div>
        <div class="mt-3 flex justify-between items-center">
          <span class="text-[11px] text-slate-400">💡 Cada clique de seta ajusta <strong>0,250 L (250 ml)</strong> automaticamente.</span>
          <button 
            type="button" 
            onclick="productsModule.addInkPurchase()" 
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5">
            <span>+ Dar Entrada & Atualizar Estoque</span>
          </button>
        </div>
      </div>

      <!-- HISTÓRICO DAS TINTAS: PRIMEIRA COLUNA COM A COR SÓLIDA INTEIRA DO QUADRO -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 class="text-xs font-bold text-slate-700 uppercase">
            Histórico das Entradas - ${(cat === 'solvente' ? 'Tinta Eco-Solvente' : 'Tinta Sublimática')}
          </h3>
          <span class="text-[11px] text-slate-400 font-semibold">${(catData.historico || []).length} registro(s)</span>
        </div>
        <div class="overflow-x-auto max-h-56 overflow-y-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th class="p-2.5 text-center w-28">Cor (CMYK)</th>
                <th class="p-2.5">Marca</th>
                <th class="p-2.5">Fornecedor</th>
                <th class="p-2.5">Data</th>
                <th class="p-2.5 text-center">Qtde (Litros)</th>
                <th class="p-2.5 text-right">Preço Unit. (R$/L)</th>
                <th class="p-2.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${(catData.historico && catData.historico.length > 0) ? catData.historico.map(h => {
                const colInfo = colors.find(c => c.key === h.cor) || { solidBg: '#334155', solidText: '#ffffff', name: h.cor };
                const isMax = parseFloat(h.preco_unitario) === goldenRulePrice;

                return `
                  <tr class="hover:bg-slate-50/80 transition">
                    <!-- PRIMEIRA COLUNA: O QUADRO INTEIRO PREENCHIDO COM A COR SÓLIDA DA TINTA -->
                    <td class="p-2.5 text-center font-black tracking-wider shadow-inner" style="background-color: ${colInfo.solidBg}; color: ${colInfo.solidText}; border-right: 1px solid rgba(0,0,0,0.06);">
                      ${colInfo.name.toUpperCase()} (${h.cor})
                    </td>
                    <td class="p-2.5 text-slate-800 font-bold">${h.marca || '--'}</td>
                    <td class="p-2.5 text-slate-700 font-medium">${h.fornecedor}</td>
                    <td class="p-2.5 text-slate-500">${new Date(h.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                    <td class="p-2.5 text-center font-black text-slate-800">${formatDec(h.qtde, 3)} L</td>
                    <td class="p-2.5 text-right font-mono font-bold ${isMax ? 'text-amber-700 bg-amber-50/70 rounded' : 'text-slate-800'}">
                      R$ ${formatDec(h.preco_unitario, 2)}
                      ${isMax ? '<span class="text-[9px] text-amber-600 ml-1 font-sans" title="Maior preço da Regra de Ouro">⭐</span>' : ''}
                    </td>
                    <td class="p-2.5 text-center">
                      <button 
                        type="button" 
                        onclick="productsModule.deleteInkPurchase('${h.id}')" 
                        class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-bold border border-red-200 transition inline-flex items-center gap-1 shadow-sm" 
                        title="Excluir esta entrada e abater do estoque">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        <span>Excluir</span>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="7" class="p-6 text-center text-slate-400">Nenhuma compra registrada nesta categoria.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};



