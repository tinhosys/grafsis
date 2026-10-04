$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

# Replace the 3rd row layout
$oldRow = '(?s)<div class="grid grid-cols-12 gap-2 items-end">\s*<div class="col-span-3" id="div-width">.*?<button type="button" onclick="salesModule.addItemToOrder\(\)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-sm text-xs h-\[38px\] uppercase">\+ INSERIR ITEM<\/button>\s*<\/div>\s*<\/div>'

$newRow = @'
<div class="grid grid-cols-12 gap-2 items-end">
                  <div class="col-span-2" id="div-width">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-slate-700">Largura X (m)</label>
                    <input type="number" step="0.01" id="item-width" value="1.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-xs">
                  </div>
                  <div class="col-span-2" id="div-height">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-slate-700">Compr. Y (m)</label>
                    <input type="number" step="0.01" id="item-height" value="1.00" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-mono text-xs">
                  </div>
                  <div class="col-span-2 sm:col-span-1">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-slate-700">Qtd</label>
                    <input type="number" step="1" id="item-qty" value="1" min="1" oninput="salesModule.calcPiecePrice()" class="w-full p-2 border border-slate-300 rounded bg-white font-bold text-center text-xs">
                  </div>
                  <div class="col-span-3 sm:col-span-2">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-red-600">V. Unit. (R$)</label>
                    <div id="item-piece-price" class="w-full p-2 font-mono text-red-600 font-bold bg-red-50 border border-red-100 rounded flex items-center h-[38px] text-[11px] truncate">0.00</div>
                  </div>
                  <div class="col-span-3 sm:col-span-2">
                    <label class="block text-[10px] uppercase font-bold mb-1 text-green-600">Sub Total</label>
                    <div id="item-subtotal-price" class="w-full p-2 font-mono text-green-700 font-bold bg-green-50 border border-green-100 rounded flex items-center h-[38px] text-[11px] truncate">0.00</div>
                  </div>
                  <div class="col-span-12 sm:col-span-3 mt-2 sm:mt-0 flex gap-2">
                    <div class="relative w-10 h-[38px] flex-shrink-0" title="Anexar Arte (Max 2MB)">
                      <input type="file" id="item-arte-upload" accept="image/png, image/jpeg, image/jpg" class="absolute inset-0 opacity-0 cursor-pointer z-10" onchange="salesModule.handleItemArteUpload(this)">
                      <div id="item-arte-btn" class="w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      </div>
                      <input type="hidden" id="item-arte-url" value="">
                    </div>
                    <button type="button" onclick="salesModule.addItemToOrder()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-sm text-[11px] h-[38px] uppercase whitespace-nowrap">+ INSERIR ITEM</button>
                  </div>
                </div>
'@

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldRow, $newRow)

# Update calcPiecePrice to also calculate item-subtotal-price
$oldCalc = '(?s)const displayEl = document.getElementById\(''item-piece-price''\);\s*if\(displayEl\) displayEl.innerText = `R\$ \$\{piecePrice.toFixed\(2\)\}`;'
$newCalc = @'
      const displayEl = document.getElementById('item-piece-price');
      if(displayEl) displayEl.innerText = `R$ ${piecePrice.toFixed(2)}`;
      const subtotalEl = document.getElementById('item-subtotal-price');
      if(subtotalEl) {
         const qty = parseInt(document.getElementById('item-qty').value) || 1;
         subtotalEl.innerText = `R$ ${(piecePrice * qty).toFixed(2)}`;
      }
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldCalc, $newCalc)

# Insert handleItemArteUpload
$oldMethods = '(?s)toggleDimensionInputs\(\) \{.*?this.calcPiecePrice\(\);\s*\},'
$newMethods = @'
    toggleDimensionInputs() {
      const type = document.getElementById('item-type').value;
      document.getElementById('div-width').style.display = (type === 'm2' || type === 'linear') ? 'block' : 'none';
      document.getElementById('div-height').style.display = (type === 'm2') ? 'block' : 'none';
      this.calcPiecePrice();
    },
    handleItemArteUpload(input) {
      if(!input.files || input.files.length === 0) return;
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB.");
        input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('item-arte-url').value = e.target.result;
        const btn = document.getElementById('item-arte-btn');
        btn.className = 'w-full h-full bg-green-100 border border-green-300 rounded flex items-center justify-center text-green-600';
        btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
      };
      reader.readAsDataURL(file);
    },
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldMethods, $newMethods)

# Reset item-arte-btn in addItemToOrder (and removeItem)
$oldReset = '(?s)if\(itemArteInput\) itemArteInput.value = '''';\s*this.calcPiecePrice\(\);'
$newReset = @'
      if(itemArteInput) itemArteInput.value = '';
      const arteBtn = document.getElementById('item-arte-btn');
      if(arteBtn) {
        arteBtn.className = 'w-full h-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-500 transition-colors';
        arteBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>`;
      }
      const arteUpload = document.getElementById('item-arte-upload');
      if(arteUpload) arteUpload.value = '';
      this.calcPiecePrice();
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldReset, $newReset)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, [System.Text.Encoding]::UTF8)

