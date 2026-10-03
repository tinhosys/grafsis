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
            <h1 class="text-2xl font-bold text-slate-800">Produtos, Insumos & Serviços</h1>
            <p class="text-slate-500 text-sm">Venda fracionada por m² (Largura X x Comprimento Y), metro linear e peças unitárias</p>
          </div>
          <div class="flex gap-2">
            <button onclick="productsModule.openCalculatorModal()" class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              Calculadora Rápida m²
            </button>
            <button onclick="productsModule.openModal()" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition">
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
};
