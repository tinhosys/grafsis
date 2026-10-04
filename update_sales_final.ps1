$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

# 1. Remove the old Foto da Arte block
$oldArte = '(?s)<div>\s*<label class="block text-xs font-semibold mb-1 text-slate-700">Foto da Arte / Link do Drive</label>.*?</div>'
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldArte, "")

# 2. Remove the table's "Base: R$ ..." output
$oldTablePrice = '(?s)Base: R\$ \$\{Number\(it.preco_base \|\| 0\).toFixed\(2\)\}<br>Peca: R\$ \$\{Number\(it.preco_unitario\).toFixed\(2\)\}'
$newTablePrice = 'R$ ${Number(it.preco_unitario).toFixed(2)}'
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldTablePrice, $newTablePrice)

# 3. Add viewItemDetails modal onclick
$oldItemTr = '(?s)<span class="text-\[10px\] font-mono bg-blue-100 text-blue-800 px-1 rounded mr-1">#\$\{it.item_id \|\| ''----''\}<\/span>'
$newItemTr = '<span class="text-[10px] font-mono bg-blue-100 text-blue-800 px-1 rounded mr-1 cursor-pointer hover:bg-blue-200" onclick="salesModule.viewItemDetails(${idx})" title="Ver Detalhes do Item e Arte">#${it.item_id || ''----''}</span>'
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldItemTr, $newItemTr)

# 4. Update resets in addItemToOrder and removeItem
$oldAddItemResets = '(?s)document.getElementById\(''item-desc''\).value = '''';\s*document.getElementById\(''item-prod-select''\).value = '''';\s*document.getElementById\(''item-price''\).value = ''0.00'';'
$newAddItemResets = @'
      document.getElementById('item-desc').value = '';
      document.getElementById('item-prod-select').value = '';
      document.getElementById('item-price').value = '0.00';
      document.getElementById('item-width').value = '1.00';
      document.getElementById('item-height').value = '1.00';
      document.getElementById('item-qty').value = '1';
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldAddItemResets, $newAddItemResets)

# 5. Insert viewItemDetails function just before renderActiveItemsHtml
$oldMethods = '(?s)renderActiveItemsHtml\(\) \{'
$newMethods = @'
    viewItemDetails(idx) {
      const it = this.activeItems[idx];
      if(!it) return;
      const modalHtml = `
        <div id="item-details-modal" class="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onclick="document.getElementById('item-details-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 class="font-black text-xl text-slate-800 mb-4 border-b pb-2">Detalhes do Item <span class="text-blue-600">#${it.item_id || 'N/A'}</span></h3>
            
            <div class="flex flex-col md:flex-row gap-4 mb-4">
              <div class="w-full md:w-1/3 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-2 min-h-[150px]">
                ${it.arte_url ? `<img src="${it.arte_url}" class="max-w-full max-h-[200px] object-contain rounded shadow-sm">` : `<span class="text-slate-400 text-sm text-center">Nenhuma arte<br>anexada</span>`}
              </div>
              <div class="w-full md:w-2/3 space-y-2 text-sm text-slate-700">
                <p><strong class="text-slate-900">Produto:</strong> ${it.produto_nome}</p>
                <p><strong class="text-slate-900">Detalhes:</strong> ${it.descricao}</p>
                <p><strong class="text-slate-900">Cálculo:</strong> <span class="uppercase">${it.tipo_calculo}</span></p>
                <p><strong class="text-slate-900">Dimensões:</strong> ${it.largura_x}m x ${it.comprimento_y}m</p>
                <p><strong class="text-slate-900">Quantidade:</strong> ${it.quantidade}</p>
                <p><strong class="text-slate-900">Área Total:</strong> ${it.tipo_calculo !== 'unidade' ? (it.area_m2 * it.quantidade).toFixed(2) + (it.tipo_calculo === 'm2' ? ' m²' : ' m') : '-'}</p>
                <p><strong class="text-slate-900">Valor Unitário:</strong> R$ ${Number(it.preco_unitario).toFixed(2)}</p>
                <div class="font-black text-green-700 text-lg border-t pt-2 mt-2 flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ ${Number(it.valor_total).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 flex justify-end">
                <button onclick="document.getElementById('item-details-modal').remove()" class="px-6 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-lg transition-colors">Fechar</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    },
    renderActiveItemsHtml() {
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldMethods, $newMethods)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, [System.Text.Encoding]::UTF8)

