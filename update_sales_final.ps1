$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js")

$oldBtn = @'
                <div class="sm:col-span-4 flex items-end gap-1">
                  <div class="flex-1">
                    <label class="block font-semibold mb-1 text-slate-700">Produto Base *</label>
                    <select id="item-prod-select" onchange="salesModule.handleProdSelect(this)" class="w-full p-2 border border-slate-300 rounded bg-white font-semibold">
                      <option value="">Selecione...</option>
                      ${products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (R$ ${p.preco_base}/${p.unidade_medida})</option>`).join('')}
                    </select>
                  </div>
                  <button type="button" onclick="window.app.navigate('products')" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-2 rounded shadow-sm text-xs h-[38px]" title="Novo Produto Base">
                    + NOVO
                  </button>
                </div>
'@

$newBtn = @'
                <div class="sm:col-span-4 flex items-end gap-1">
                  <div class="flex-1">
                    <label class="block font-semibold mb-1 text-slate-700">Produto Base *</label>
                    <select id="item-prod-select" onchange="salesModule.handleProdSelect(this)" class="w-full p-2 border border-slate-300 rounded bg-white font-semibold">
                      <option value="">Selecione...</option>
                      ${products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (R$ ${p.preco_base}/${p.unidade_medida})</option>`).join('')}
                    </select>
                  </div>
                  <button type="button" onclick="salesModule.openNewProductModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-2 rounded shadow-sm text-xs h-[38px]" title="Cadastrar Novo Produto Rápido">
                    + NOVO
                  </button>
                </div>
'@
$content = $content.Replace($oldBtn, $newBtn)

$oldInputs = @'
                <div class="sm:col-span-2" id="div-width">
                  <label class="block font-semibold mb-1 text-slate-700">Largura X (m)</label>
                  <input type="number" step="0.01" id="item-width" value="1.00" class="w-full p-2 border border-slate-300 rounded bg-white font-mono">
                </div>
                <div class="sm:col-span-2" id="div-height">
                  <label class="block font-semibold mb-1 text-slate-700">Compr. Y (m)</label>
                  <input type="number" step="0.01" id="item-height" value="1.00" class="w-full p-2 border border-slate-300 rounded bg-white font-mono">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1 text-slate-700">Qtd</label>
                  <input type="number" step="1" id="item-qty" value="1" min="1" class="w-full p-2 border border-slate-300 rounded bg-white font-bold text-center">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1 text-slate-700">Preco Unit.</label>
                  <input type="number" step="0.01" id="item-price" value="0.00" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-blue-700 font-bold">
                </div>
'@

$newInputs = @'
                <div class="sm:col-span-2" id="div-width">
                  <label class="block font-semibold mb-1 text-slate-700">Largura X (m)</label>
                  <input type="number" step="0.01" id="item-width" value="1.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono">
                </div>
                <div class="sm:col-span-2" id="div-height">
                  <label class="block font-semibold mb-1 text-slate-700">Compr. Y (m)</label>
                  <input type="number" step="0.01" id="item-height" value="1.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1 text-slate-700">Qtd</label>
                  <input type="number" step="1" id="item-qty" value="1" min="1" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-bold text-center">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1 text-slate-700">Base m² / un</label>
                  <input type="number" step="0.01" id="item-price" value="0.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-transparent focus:text-blue-700 transition-colors font-bold selection:text-transparent focus:selection:text-white" title="Preço base - Fica invisível ao perder o foco">
                  <div id="item-piece-price" class="text-[11px] text-purple-700 font-mono mt-1 font-bold bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded shadow-sm inline-block">Peça: R$ 0.00</div>
                </div>
'@
$content = $content.Replace($oldInputs, $newInputs)

$oldMethods = @'
  handleProdSelect(select) {
    const opt = select.options[select.selectedIndex];
    if (opt.value) {
      document.getElementById('item-desc').value = ""; document.getElementById('item-prod-select').setAttribute("data-nome", opt.text.split(" (R$")[0]);
      const type = opt.getAttribute('data-type');
      document.getElementById('item-type').value = type;
      document.getElementById('item-price').value = opt.getAttribute('data-price');
      this.toggleDimensionInputs();
    }
  },
  toggleDimensionInputs() {
    const type = document.getElementById('item-type').value;
    document.getElementById('div-width').style.display = (type === 'm2' || type === 'linear') ? 'block' : 'none';
    document.getElementById('div-height').style.display = (type === 'm2') ? 'block' : 'none';
  },
'@

$newMethods = @'
  handleProdSelect(select) {
    const opt = select.options[select.selectedIndex];
    if (opt.value) {
      document.getElementById('item-desc').value = ""; document.getElementById('item-prod-select').setAttribute("data-nome", opt.text.split(" (R$")[0]);
      const type = opt.getAttribute('data-type');
      document.getElementById('item-type').value = type;
      document.getElementById('item-price').value = opt.getAttribute('data-price');
      this.toggleDimensionInputs();
      this.calcPiecePrice();
    }
  },
  toggleDimensionInputs() {
    const type = document.getElementById('item-type').value;
    document.getElementById('div-width').style.display = (type === 'm2' || type === 'linear') ? 'block' : 'none';
    document.getElementById('div-height').style.display = (type === 'm2') ? 'block' : 'none';
    this.calcPiecePrice();
  },
  calcPiecePrice() {
    const type = document.getElementById('item-type').value;
    const w = parseFloat(document.getElementById('item-width').value) || 1;
    const h = parseFloat(document.getElementById('item-height').value) || 1;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const area = type === 'm2' ? (w * h) : (type === 'linear' ? w : 1);
    const piecePrice = type === 'unidade' ? price : (area * price);
    const displayEl = document.getElementById('item-piece-price');
    if(displayEl) displayEl.innerText = `Peça: R$ ${piecePrice.toFixed(2)}`;
  },
  openNewProductModal() {
    const modalHtml = `
      <div id="quick-product-modal" class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl">
          <h3 class="font-black text-lg text-slate-800 mb-4 border-b pb-2">Cadastrar Produto Rápido</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold mb-1">Nome do Produto</label>
              <input type="text" id="qp-nome" class="w-full p-2 border rounded text-sm bg-slate-50" placeholder="Ex: Lona Frontlight 440g">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">Cálculo</label>
              <select id="qp-tipo" class="w-full p-2 border rounded text-sm bg-slate-50">
                <option value="m2">Por m²</option>
                <option value="linear">Metro Linear</option>
                <option value="unidade">Por Unidade</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">Preço Base (R$)</label>
              <input type="number" id="qp-preco" step="0.01" class="w-full p-2 border rounded text-sm bg-slate-50" placeholder="0.00">
            </div>
          </div>
          <div class="mt-5 pt-3 border-t flex justify-end gap-2">
            <button onclick="document.getElementById('quick-product-modal').remove()" class="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
            <button onclick="salesModule.saveQuickProduct()" class="px-4 py-2 text-sm bg-blue-600 text-white font-bold rounded shadow">Salvar</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },
  saveQuickProduct() {
    const nome = document.getElementById('qp-nome').value.trim();
    const tipo = document.getElementById('qp-tipo').value;
    const preco = parseFloat(document.getElementById('qp-preco').value) || 0;
    if(!nome) return alert('Informe o nome do produto');
    
    const newProd = {
      id: Date.now().toString(),
      nome, categoria: 'Outros', tipo_cobranca: tipo,
      unidade_medida: tipo === 'm2' ? 'm2' : (tipo === 'linear' ? 'm' : 'un'),
      preco_base: preco, custo_base: 0, estoque_atual: 100, estoque_minimo: 10
    };
    const products = window.store.getProducts();
    products.push(newProd);
    window.store.save('grafsis_products', products);
    document.getElementById('quick-product-modal').remove();
    
    // Atualiza o select de produtos na tela
    const sel = document.getElementById('item-prod-select');
    sel.innerHTML = `<option value="">Selecione...</option>` + products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (R$ ${p.preco_base}/${p.unidade_medida})</option>`).join('');
    sel.value = newProd.id;
    this.handleProdSelect(sel);
    alert('Produto cadastrado com sucesso!');
  },
'@
$content = $content.Replace($oldMethods, $newMethods)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content)
