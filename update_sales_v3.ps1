$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

# 1. Adjust margin of main form content
$content = $content -replace '<div class="bg-white rounded-xl w-full p-6 shadow-sm border border-slate-200 -mt-2">', '<div class="bg-white rounded-xl w-full p-6 shadow-sm border border-slate-200 mt-4">'

# 2. Rewrite items grid
$oldGrid = '(?s)<div class="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-blue-50/50 p-3 rounded-lg text-xs border border-blue-100">.*?<div class="mt-4 border border-slate-200 rounded-lg overflow-hidden">'
$newGrid = @'
              <div class="grid grid-cols-1 gap-3 bg-blue-50/50 p-3 rounded-lg text-xs border border-blue-100">
                <div class="grid grid-cols-12 gap-2">
                  <div class="col-span-12 sm:col-span-6 flex items-end gap-1">
                    <div class="flex-1">
                      <label class="block font-semibold mb-1 text-slate-700">Produto Base *</label>
                      <select id="item-prod-select" onchange="salesModule.handleProdSelect(this)" class="w-full p-2 border border-slate-300 rounded bg-white font-semibold">
                        <option value="">Selecione...</option>
                        ${products.map(p => `<option value="${p.id}" data-type="${p.tipo_cobranca}" data-price="${p.preco_base}">${p.nome} (R$ ${p.preco_base}/${p.unidade_medida})</option>`).join('')}
                      </select>
                    </div>
                    <button type="button" onclick="salesModule.openNewProductModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-2 rounded shadow-sm text-xs h-[38px]" title="Cadastrar Novo Produto Rápido">+ NOVO</button>
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label class="block font-semibold mb-1 text-slate-700">Calculo</label>
                    <select id="item-type" onchange="salesModule.toggleDimensionInputs()" class="w-full p-2 border border-slate-300 rounded bg-slate-100 font-semibold" disabled>
                      <option value="m2">m2 (X x Y)</option>
                      <option value="linear">Linear</option>
                      <option value="unidade">Unitario</option>
                    </select>
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label class="block font-semibold mb-1 text-slate-700">Base m² / un</label>
                    <input type="number" step="0.01" id="item-price" value="0.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-transparent focus:text-blue-700 transition-colors font-bold selection:text-transparent focus:selection:text-white" title="Preço base - Fica invisível ao perder o foco">
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-slate-700">Descricao / Detalhes *</label>
                  <input type="text" id="item-desc" placeholder="Ex: Adesivo com recorte" class="w-full p-2 border border-slate-300 rounded bg-white">
                </div>
                <div class="grid grid-cols-12 gap-2 items-end">
                  <div class="col-span-3" id="div-width">
                    <label class="block font-semibold mb-1 text-slate-700">Largura X (m)</label>
                    <input type="number" step="0.01" id="item-width" value="1.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono">
                  </div>
                  <div class="col-span-3" id="div-height">
                    <label class="block font-semibold mb-1 text-slate-700">Compr. Y (m)</label>
                    <input type="number" step="0.01" id="item-height" value="1.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono">
                  </div>
                  <div class="col-span-2">
                    <label class="block font-semibold mb-1 text-slate-700">Qtd</label>
                    <input type="number" step="1" id="item-qty" value="1" min="1" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-bold text-center">
                  </div>
                  <div class="col-span-4 sm:col-span-2">
                    <label class="block font-semibold mb-1 text-slate-700">V. Peça</label>
                    <div id="item-piece-price" class="w-full p-2 border border-transparent font-mono text-purple-700 font-bold bg-purple-50 rounded flex items-center h-[38px] text-xs">R$ 0.00</div>
                  </div>
                  <div class="col-span-12 sm:col-span-2 mt-2 sm:mt-0">
                    <button type="button" onclick="salesModule.addItemToOrder()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-sm text-xs h-[38px] uppercase">+ INSERIR ITEM</button>
                  </div>
                </div>
              </div>
              <div class="mt-4 border border-slate-200 rounded-lg overflow-hidden">'
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldGrid, $newGrid)

# 3. Rewrite Finance section
$oldFin = '(?s)<div class="flex justify-between items-center">\s*<span class="text-sm font-semibold text-slate-600">Desconto \(R\$\):<\/span>.*?<div class="pt-6 mt-4 border-t flex flex-col sm:flex-row'
$newFin = @'
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Desconto (%):</span>
                  <input type="number" step="0.01" id="order-discount-perc" value="0" oninput="salesModule.recalcTotals('perc')" class="w-20 p-1.5 border rounded-lg text-center font-mono text-sm bg-white text-purple-700 font-bold">
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Desconto (R$):</span>
                  <input type="number" step="0.01" id="order-discount" value="${order ? (order.desconto || 0) : 0}" oninput="salesModule.recalcTotals('val')" class="w-24 p-1.5 border rounded-lg text-right font-mono text-sm bg-white">
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span class="text-lg font-black text-blue-900">Total Final:</span>
                  <span class="text-2xl font-black text-blue-700 font-mono" id="order-total-final">R$ 0.00</span>
                </div>
                <div class="mt-4 pt-4 border-t border-blue-100">
                  <button type="button" onclick="salesModule.openFinanceModal()" class="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-lg shadow-sm flex justify-center items-center gap-2 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    RECEBER / FINANCEIRO
                  </button>
                  <div class="text-center mt-3 bg-green-50 p-2 rounded border border-green-100 hidden" id="finance-summary">
                    <span class="text-xs font-bold text-slate-600">Total Recebido:</span>
                    <span class="text-sm font-black text-green-700" id="finance-received-text">R$ 0.00 (0%)</span>
                    <input type="hidden" id="order-valor-recebido" value="${order ? (order.valor_recebido || 0) : 0}">
                  </div>
                </div>
              </div>
            </div>
            <div class="pt-6 mt-4 border-t flex flex-col sm:flex-row'
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldFin, $newFin)

# 4. Rewrite JS Methods (calcPiecePrice, recalcTotals, addItemToOrder reset)
$oldRecalc = '(?s)recalcTotals\(\) \{\s*const subtotal = this.activeItems.reduce.*?document.getElementById\(''order-total-final''\).innerText = `R\$ \$\{total.toFixed\(2\)\}`;'
$newRecalc = @'
  recalcTotals(source = 'val') {
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    let descVal = parseFloat(document.getElementById('order-discount').value) || 0;
    let descPerc = parseFloat(document.getElementById('order-discount-perc')?.value) || 0;
    
    if (source === 'perc') {
      descVal = subtotal * (descPerc / 100);
      document.getElementById('order-discount').value = descVal.toFixed(2);
    } else if (source === 'val' && subtotal > 0) {
      descPerc = (descVal / subtotal) * 100;
      const percEl = document.getElementById('order-discount-perc');
      if (percEl) percEl.value = descPerc.toFixed(2);
    }

    const total = subtotal - descVal;
    document.getElementById('order-subtotal').innerText = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('order-total-final').innerText = `R$ ${total.toFixed(2)}`;
    
    // Atualiza resumo financeiro se houver recebimento previo
    const valorRecebido = parseFloat(document.getElementById('order-valor-recebido')?.value) || 0;
    if (valorRecebido > 0 || total > 0) {
      this.updateFinanceSummary(valorRecebido, total);
    }
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldRecalc, $newRecalc)

$oldAddItem = '(?s)document.getElementById\(''order-items-tbody''\).innerHTML = this.renderActiveItemsHtml\(\);.*?this.recalcTotals\(\);'
$newAddItem = @'
    document.getElementById('order-items-tbody').innerHTML = this.renderActiveItemsHtml();
    document.getElementById('item-desc').value = '';
    document.getElementById('item-prod-select').value = '';
    document.getElementById('item-price').value = '0.00';
    if(itemArteInput) itemArteInput.value = '';
    this.calcPiecePrice();
    this.recalcTotals('val');
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldAddItem, $newAddItem)

$oldUpload = '(?s)handleArteUpload\(input\) \{.*?\}'
$newUpload = @'
  handleArteUpload(input) {
    if(!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 1.5 * 1024 * 1024) {
      alert("A imagem da arte deve ter no máximo 1.5MB.");
      input.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      document.querySelector('input[name="foto_arte_url"]').value = "Imagem salva no banco de dados";
      document.getElementById('order-arte-url').value = e.target.result;
      alert("Imagem da arte anexada com sucesso e pronta para salvar!");
    };
    reader.readAsDataURL(file);
  }
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldUpload, $newUpload)

$calcPiecePriceAdd = @'
  calcPiecePrice() {
    const type = document.getElementById('item-type').value;
    const w = parseFloat(document.getElementById('item-width').value) || 1;
    const h = parseFloat(document.getElementById('item-height').value) || 1;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const area = type === 'm2' ? (w * h) : (type === 'linear' ? w : 1);
    const piecePrice = type === 'unidade' ? price : (area * price);
    const displayEl = document.getElementById('item-piece-price');
    if(displayEl) displayEl.innerText = `R$ ${piecePrice.toFixed(2)}`;
  },
  openFinanceModal() {
    const total = parseFloat(document.getElementById('order-total-final').innerText.replace('R$ ', '')) || 0;
    const recebido = parseFloat(document.getElementById('order-valor-recebido')?.value) || 0;
    
    const modalHtml = `
      <div id="finance-modal" class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl">
          <h3 class="font-black text-lg text-slate-800 mb-4 border-b pb-2 text-center text-yellow-600">Recebimento Financeiro</h3>
          <div class="space-y-4">
            <div class="flex justify-between font-bold text-sm text-slate-700 bg-slate-50 p-2 rounded">
              <span>Total do Pedido:</span> <span>R$ ${total.toFixed(2)}</span>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1 text-slate-600">Valor Já Recebido (Sinal) R$</label>
              <input type="number" id="fm-recebido" step="0.01" class="w-full p-3 border-2 border-yellow-400 rounded-lg font-black text-green-700 text-lg text-center bg-yellow-50 focus:outline-none focus:ring-4 focus:ring-yellow-200" value="${recebido.toFixed(2)}">
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button onclick="document.getElementById('finance-modal').remove()" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Voltar</button>
            <button onclick="salesModule.confirmFinance()" class="px-5 py-2 text-sm bg-green-600 text-white font-black rounded-lg shadow hover:bg-green-700">Confirmar Recebimento</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },
  confirmFinance() {
    const recebido = parseFloat(document.getElementById('fm-recebido').value) || 0;
    const total = parseFloat(document.getElementById('order-total-final').innerText.replace('R$ ', '')) || 0;
    
    const inputRec = document.getElementById('order-valor-recebido');
    if(inputRec) inputRec.value = recebido;
    
    this.updateFinanceSummary(recebido, total);
    document.getElementById('finance-modal').remove();
  },
  updateFinanceSummary(recebido, total) {
    const summaryEl = document.getElementById('finance-summary');
    const textEl = document.getElementById('finance-received-text');
    if (!summaryEl || !textEl) return;
    
    if (recebido > 0) {
      summaryEl.classList.remove('hidden');
      const perc = total > 0 ? ((recebido / total) * 100).toFixed(1) : 0;
      textEl.innerText = `R$ ${recebido.toFixed(2)} (${perc}%)`;
    } else {
      summaryEl.classList.add('hidden');
    }
  },
'@

$content = $content.Replace("calcPiecePrice() {", $calcPiecePriceAdd + "`n  calcPiecePriceOLD() {")

# To prevent error about old `calcPiecePrice`, I just used a Replace trick. But wait, I need to make sure the old calcPiecePrice is harmless, or I can just Regex replace the entire old calcPiecePrice block.
$oldCalc = '(?s)calcPiecePrice\(\) \{.*?\}\,'
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldCalc, $calcPiecePriceAdd + "`n  ", 1)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, [System.Text.Encoding]::UTF8)
