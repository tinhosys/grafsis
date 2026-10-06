$utf8NoBom = New-Object System.Text.UTF8Encoding $False

$salesPath = "js/sales.js"
$sales = [System.IO.File]::ReadAllText($salesPath, $utf8NoBom)

# 1. 0.00 dimensions
$sales = $sales.Replace('id="item-width" value="1.00"', 'id="item-width" value="0.00"')
$sales = $sales.Replace('id="item-height" value="1.00"', 'id="item-height" value="0.00"')

# 2. calcPiecePrice bug
$oldCalc = @"
    calcPiecePrice() {
    const type = document.getElementById('item-type').value;
    const w = parseFloat(document.getElementById('item-width').value) || 1;
    const h = parseFloat(document.getElementById('item-height').value) || 1;
"@
$newCalc = @"
    calcPiecePrice() {
    const type = document.getElementById('item-type').value;
    let w = parseFloat(document.getElementById('item-width').value); if(isNaN(w)) w = 0;
    let h = parseFloat(document.getElementById('item-height').value); if(isNaN(h)) h = 0;
"@
$sales = $sales.Replace($oldCalc, $newCalc)

$oldAddItem = @"
    const type = document.getElementById('item-type').value;
    const w = parseFloat(document.getElementById('item-width').value) || 1;
    const h = parseFloat(document.getElementById('item-height').value) || 1;
"@
$newAddItem = @"
    const type = document.getElementById('item-type').value;
    let w = parseFloat(document.getElementById('item-width').value); if(isNaN(w)) w = 0;
    let h = parseFloat(document.getElementById('item-height').value); if(isNaN(h)) h = 0;
"@
$sales = $sales.Replace($oldAddItem, $newAddItem)

$oldReset = @"
      document.getElementById('item-width').value = '1.00';
      document.getElementById('item-height').value = '1.00';
"@
$newReset = @"
      document.getElementById('item-width').value = '0.00';
      document.getElementById('item-height').value = '0.00';
"@
$sales = $sales.Replace($oldReset, $newReset)

# 3. Add updateDaysFromDate right after updateDateFromDays
$oldDate = "document.getElementsByName('previsao_entrega')[0].value = date.toISOString().split('T')[0];`r`n    },"
$newDate = $oldDate + "`r`n    updateDaysFromDate() {`r`n      const previsaoInput = document.getElementsByName('previsao_entrega')[0];`r`n      if (!previsaoInput || !previsaoInput.value) return;`r`n      const selectedDate = new Date(previsaoInput.value + 'T12:00:00');`r`n      const today = new Date();`r`n      today.setHours(12, 0, 0, 0);`r`n      const diffTime = selectedDate.getTime() - today.getTime();`r`n      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));`r`n      document.getElementById('dias-entrega').value = diffDays >= 0 ? diffDays : 0;`r`n    },"
$sales = $sales.Replace($oldDate, $newDate)

# Date sync inputs
$sales = $sales.Replace('<input type="date" name="previsao_entrega" value="', '<input type="date" name="previsao_entrega" id="previsao_entrega" oninput="salesModule.updateDaysFromDate()" onchange="salesModule.updateDaysFromDate()" value="')

# 4. Edit button and CRUD
$oldTr = '<td class="p-2 text-right"><button type="button" onclick="salesModule.removeItem(${idx})" class="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded">&times;</button></td>'
$newTr = '<td class="p-2 text-right flex justify-end gap-2"><button type="button" onclick="salesModule.editItem(${idx})" class="text-blue-500 font-bold hover:bg-blue-50 px-2 py-1 rounded" title="Editar">&#9998;</button><button type="button" onclick="salesModule.removeItem(${idx})" class="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded" title="Remover">&times;</button></td>'
$sales = $sales.Replace($oldTr, $newTr)

$oldEditAnchor = "openModal(params = {}) {"
$newEditFunc = @"
  editItem(idx) {
    const it = this.activeItems[idx];
    const prodSelect = document.getElementById('item-prod-select');
    prodSelect.value = it.produto_id || '';
    if (prodSelect.value) { this.handleProdSelect(prodSelect); }
    
    document.getElementById('item-desc').value = it.descricao || '';
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
    
    let cancelBtn = document.getElementById('cancel-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.type = 'button';
        cancelBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-sm text-[11px] h-[38px] uppercase whitespace-nowrap ml-2';
        cancelBtn.innerHTML = 'CANCELAR';
        cancelBtn.onclick = () => {
            if(confirm('Cancelar edição e limpar formulário?')) {
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
$sales = $sales.Replace($oldEditAnchor, $newEditFunc + "`r`n    " + $oldEditAnchor)

$oldInsertEnd = @"
    this.calcPiecePrice();
    this.recalcTotals('val');
    document.getElementById('item-prod-select').focus();
"@
$newInsertEnd = @"
    this.calcPiecePrice();
    this.recalcTotals('val');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if(cancelBtn) cancelBtn.remove();
    document.getElementById('item-prod-select').focus();
"@
$sales = $sales.Replace($oldInsertEnd, $newInsertEnd)

[System.IO.File]::WriteAllText($salesPath, $sales, $utf8NoBom)


$htmlPath = "index.html"
$html = [System.IO.File]::ReadAllText($htmlPath, $utf8NoBom)
$html = $html.Replace("v2.2.12", "v2.2.16")
$scripts = "auth", "store", "app", "sales", "production", "finance", "products", "clients", "suppliers"
foreach ($s in $scripts) {
    $html = $html -replace "js/$s\.js(\?v=[^`"]+)?", "js/$s.js?v=2.2.16"
}
[System.IO.File]::WriteAllText($htmlPath, $html, $utf8NoBom)
