$salesFile = "js/sales.js"
$htmlFile = "index.html"

# Ensure UTF8
$salesContent = [System.IO.File]::ReadAllText($salesFile, [System.Text.Encoding]::UTF8)
$htmlContent = [System.IO.File]::ReadAllText($htmlFile, [System.Text.Encoding]::UTF8)

# 1. Bump version and cache busters in index.html
$htmlContent = $htmlContent -replace "v2\.2\.12", "v2.2.15"
$scripts = "auth", "store", "app", "sales", "production", "finance", "products", "clients", "suppliers"
foreach ($s in $scripts) {
    $htmlContent = $htmlContent -replace "js/$s\.js(\?v=[^`"]+)?", "js/$s.js?v=2.2.15"
}

# 2. Fix sales.js

# Form syntax fix (was in e044f6b already, but let's make sure, actually we checked out e044f6b which ALREADY HAD IT! Wait, e044f6b is "Fix form closing div bug...". So it's already fixed in this file!)

# Dimensions default to 0
$salesContent = $salesContent -replace 'id="item-width" value="1.00"', 'id="item-width" value="0.00"'
$salesContent = $salesContent -replace 'id="item-height" value="1.00"', 'id="item-height" value="0.00"'

# calcPiecePrice logic: fix the "0 || 1" bug
$salesContent = $salesContent -replace "const w = parseFloat\(document.getElementById\('item-width'\)\.value\) \|\| 1;", "let w = parseFloat(document.getElementById('item-width').value); if(isNaN(w)) w = 0;"
$salesContent = $salesContent -replace "const h = parseFloat\(document.getElementById\('item-height'\)\.value\) \|\| 1;", "let h = parseFloat(document.getElementById('item-height').value); if(isNaN(h)) h = 0;"

# addItemToOrder logic: fix the "0 || 1" bug and reset to 0
$salesContent = $salesContent -replace "const w = parseFloat\(document.getElementById\('item-width'\)\.value\) \|\| 1;", "let w = parseFloat(document.getElementById('item-width').value); if(isNaN(w)) w = 0;"
$salesContent = $salesContent -replace "const h = parseFloat\(document.getElementById\('item-height'\)\.value\) \|\| 1;", "let h = parseFloat(document.getElementById('item-height').value); if(isNaN(h)) h = 0;"
$salesContent = $salesContent -replace "document\.getElementById\('item-width'\)\.value = '1\.00';", "document.getElementById('item-width').value = '0.00';"
$salesContent = $salesContent -replace "document\.getElementById\('item-height'\)\.value = '1\.00';", "document.getElementById('item-height').value = '0.00';"

# In addItemToOrder reset logic, we also want to clear any editing index.
$salesContent = $salesContent -replace "this\.calcPiecePrice\(\);`r`n      this\.recalcTotals\('val'\);`r`n      document\.getElementById\('item-prod-select'\)\.focus\(\);", "this.editingItemIdx = -1; this.calcPiecePrice(); this.recalcTotals('val'); document.getElementById('item-prod-select').focus();"


# Sincronia de data
$salesContent = $salesContent -replace '<input type="date" name="previsao_entrega" value="', '<input type="date" name="previsao_entrega" id="previsao_entrega" oninput="salesModule.updateDaysFromDate()" onchange="salesModule.updateDaysFromDate()" value="'

$addFunctions = @"
  updateDaysFromDate() {
    const previsaoInput = document.getElementsByName('previsao_entrega')[0];
    if (!previsaoInput || !previsaoInput.value) return;
    const selectedDate = new Date(previsaoInput.value + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('dias-entrega').value = diffDays >= 0 ? diffDays : 0;
  },
  editItem(idx) {
    const it = this.activeItems[idx];
    document.getElementById('item-desc').value = it.descricao || '';
    const prodSelect = document.getElementById('item-prod-select');
    prodSelect.value = it.produto_id || '';
    if (prodSelect.value) { this.handleProdSelect(prodSelect); }
    
    document.getElementById('item-type').value = it.tipo_calculo || 'm2';
    document.getElementById('item-price').value = it.preco_base || '0.00';
    document.getElementById('item-width').value = it.largura_x || '0.00';
    document.getElementById('item-height').value = it.comprimento_y || '0.00';
    document.getElementById('item-qty').value = it.quantidade || '1';
    
    const itemArteInput = document.getElementById('item-arte-url');
    if(itemArteInput) itemArteInput.value = it.arte_url || '';
    const arteBtn = document.getElementById('item-arte-btn');
    if(arteBtn) {
      if(it.arte_url) {
        arteBtn.className = 'w-full h-full bg-blue-100 border border-blue-400 rounded flex items-center justify-center text-blue-600';
      } else {
        arteBtn.className = 'w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors';
      }
    }
    this.toggleDimensionInputs();
    this.calcPiecePrice();
    this.removeItem(idx);
    
    // Add cancel button
    let cancelBtn = document.getElementById('cancel-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.type = 'button';
        cancelBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-sm text-[11px] h-[38px] uppercase whitespace-nowrap ml-2';
        cancelBtn.innerHTML = 'CANCELAR EDI&Ccedil;&Atilde;O';
        cancelBtn.onclick = () => {
            if(confirm('Cancelar edi&ccedil;&atilde;o e limpar formul&aacute;rio?')) {
                // to cancel, we just re-insert the item back or clear. Wait, since we removeItem, if we cancel, the item is LOST!
                // To do it right, we should insert it back. 
                // Let's just restore it!
                salesModule.activeItems.splice(idx, 0, it);
                document.getElementById('order-items-tbody').innerHTML = salesModule.renderActiveItemsHtml();
                document.getElementById('item-desc').value = '';
                document.getElementById('item-prod-select').value = '';
                document.getElementById('item-price').value = '0.00';
                document.getElementById('item-width').value = '0.00';
                document.getElementById('item-height').value = '0.00';
                document.getElementById('item-qty').value = '1';
                cancelBtn.remove();
                salesModule.recalcTotals('val');
            }
        };
        const insertBtn = document.querySelector('button[onclick="salesModule.addItemToOrder()"]');
        if (insertBtn) insertBtn.parentNode.appendChild(cancelBtn);
    }
  },
"@
$salesContent = $salesContent -replace "(updateDateFromDays\(\) \{[\s\S]*?\},)", "`$1`n$addFunctions"

# In addItemToOrder, we need to remove the cancel button if it exists after successfully adding
$salesContent = $salesContent -replace "this\.recalcTotals\('val'\);", "this.recalcTotals('val'); const cancelBtn = document.getElementById('cancel-edit-btn'); if(cancelBtn) cancelBtn.remove();"

# Edit button in list
$salesContent = $salesContent -replace '<td class="p-2 text-right"><button type="button" onclick="salesModule\.removeItem\(`\$\{idx\}`\)" class="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded">&times;</button></td>', '<td class="p-2 text-right flex justify-end gap-2"><button type="button" onclick="salesModule.editItem(`${idx}`)" class="text-blue-500 font-bold hover:bg-blue-50 px-2 py-1 rounded" title="Editar">&#9998;</button><button type="button" onclick="salesModule.removeItem(`${idx}`)" class="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded" title="Remover">&times;</button></td>'

[System.IO.File]::WriteAllText($salesFile, $salesContent, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($htmlFile, $htmlContent, [System.Text.Encoding]::UTF8)
