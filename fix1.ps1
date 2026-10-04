$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

$oldGrid = '<div class="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-blue-50/50 p-3 rounded-lg text-xs border border-blue-100">
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
                <div class="sm:col-span-8">
                  <label class="block font-semibold mb-1 text-slate-700">Descricao / Detalhes *</label>
                  <input type="text" id="item-desc" placeholder="Ex: Adesivo com recorte" class="w-full p-2 border border-slate-300 rounded bg-white">
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold mb-1 text-slate-700">Calculo</label>
                  <select id="item-type" onchange="salesModule.toggleDimensionInputs()" class="w-full p-2 border border-slate-300 rounded bg-slate-100 font-semibold" disabled>
                    <option value="m2">m2 (X x Y)</option>
                    <option value="linear">Linear</option>
                    <option value="unidade">Unitario</option>
                  </select>
                </div>
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
                <div class="sm:col-span-2 flex items-end">
                  <button type="button" onclick="salesModule.addItemToOrder()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-sm text-sm">+ INSERIR</button>
                </div>
              </div>'

$newGrid = '<div class="grid grid-cols-1 gap-3 bg-blue-50/50 p-3 rounded-lg text-xs border border-blue-100">
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
              </div>'
$content = $content.Replace($oldGrid, $newGrid)

$oldFin = '<div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Desconto (R$):</span>
                  <input type="number" step="0.01" id="order-discount" value="${order ? (order.desconto || 0) : 0}" oninput="salesModule.recalcTotals()" class="w-24 p-1.5 border rounded-lg text-right font-mono text-sm bg-white">
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span class="text-lg font-black text-blue-900">Total Final:</span>
                  <span class="text-2xl font-black text-blue-700 font-mono" id="order-total-final">R$ 0.00</span>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-blue-100">
                  <div>
                    <label class="block text-xs font-bold mb-1 text-slate-700">Forma Pagto Inicial</label>
                    <select name="forma_pagamento" class="w-full p-2 border rounded-lg text-sm font-semibold">
                      <option value="Pix" ${order && order.forma_pagamento === "Pix" ? "selected" : ""}>Pix</option>
                      <option value="Dinheiro" ${order && order.forma_pagamento === "Dinheiro" ? "selected" : ""}>Dinheiro</option>
                      <option value="Cartao de Credito" ${order && order.forma_pagamento === "Cartao de Credito" ? "selected" : ""}>Cartao</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold mb-1 text-slate-700">Status Recebimento</label>
                    <select name="status_pagamento" class="w-full p-2 border rounded-lg text-sm font-semibold">
                      <option value="pendente" ${order && order.status_pagamento === "pendente" ? "selected" : ""}>Pendente (0%)</option>
                      <option value="parcial" ${order && order.status_pagamento === "parcial" ? "selected" : ""}>Sinal (50%)</option>
                      <option value="pago" ${order && order.status_pagamento === "pago" ? "selected" : ""}>Pago (100%)</option>
                    </select>
                  </div>
                </div>'

$newFin = '<div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Desconto (%):</span>
                  <input type="number" step="0.01" id="order-discount-perc" value="0" oninput="salesModule.recalcTotals(`perc`)" class="w-20 p-1.5 border rounded-lg text-center font-mono text-sm bg-white text-purple-700 font-bold">
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-600">Desconto (R$):</span>
                  <input type="number" step="0.01" id="order-discount" value="${order ? (order.desconto || 0) : 0}" oninput="salesModule.recalcTotals(`val`)" class="w-24 p-1.5 border rounded-lg text-right font-mono text-sm bg-white">
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
                </div>'
$content = $content.Replace($oldFin, $newFin)

$oldMt = '<div class="bg-white rounded-xl w-full p-6 shadow-sm border border-slate-200 -mt-2">'
$newMt = '<div class="bg-white rounded-xl w-full p-6 shadow-sm border border-slate-200 mt-4">'
$content = $content.Replace($oldMt, $newMt)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, [System.Text.Encoding]::UTF8)
