import re

with open('js/sales.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the top header to be sticky and remove Fase da Producao from the top grid
# The original grid is: <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
# It has Cliente (md:col-span-2), Fase, Tipo, and then Prazo/Previsao (md:col-span-2).
# We want Cliente (md:col-span-2), Tipo (md:col-span-1), Prazo/Previsao (md:col-span-2) ... wait that doesn't fit 4 columns perfectly. Let's just make Cliente col-span-2, Tipo col-span-1, and Prazo/Previsao col-span-1.

new_top_section = '''        <div class="sticky top-0 z-40 bg-white/95 backdrop-blur rounded-xl w-full p-4 mb-4 shadow-sm border border-slate-200">
          <div class="flex justify-between items-center mb-4">
            <div>
              <button onclick="salesModule.render()" class="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 mb-1">
                &larr; Voltar para Lista
              </button>
              <h2 class="text-2xl font-black text-slate-800">${isEdit ? 'Editar Pedido' : 'Nova Venda / Orcamento'}</h2>
            </div>
            <div class="text-right">
              <span class="block text-xs font-bold text-slate-500 uppercase">ID DA VENDA</span>
              <span class="text-2xl font-black text-slate-900">#${displayId}</span><input type="hidden" id="current-display-id" value="${displayId}">
            </div>
          </div>
          
          <form id="order-form" onsubmit="salesModule.saveOrder(event, '${order ? order.id : ''}', '${displayId}')" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="md:col-span-2">
                <label class="block text-xs font-semibold mb-1">Cliente *</label>
                <select name="cliente_id" required class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold text-slate-800">
                  <option value="">Selecione o Cliente...</option>
                  ${clients.map(c => `<option value="${c.id}" ${(order && order.cliente_id === c.id) || params.clientId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">Tipo de Operacao</label>
                <select name="tipo_operacao" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white">
                  <option value="venda" ${order && order.tipo_operacao === 'venda' ? 'selected' : ''}>Venda</option>
                  <option value="pre-venda" ${order && order.tipo_operacao === 'pre-venda' ? 'selected' : ''}>Pre-Venda</option>
                  <option value="orcamento" ${order && order.tipo_operacao === 'orcamento' ? 'selected' : ''}>Orcamento</option>
                  <option value="patrocinio" ${order && order.tipo_operacao === 'patrocinio' ? 'selected' : ''}>Patrocinio</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold mb-1 text-slate-700">Prazo (Dias)</label>
                  <input type="number" id="dias-entrega" min="0" oninput="salesModule.updateDateFromDays()" placeholder="Ex: 5" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1">Previsao</label>
                  <input type="date" name="previsao_entrega" value="${order ? (order.previsao_entrega || '') : new Date().toISOString().split('T')[0]}" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                </div>
              </div>
            </div>
        </div>
        
        <div class="bg-white rounded-xl w-full p-6 shadow-sm border border-slate-200 -mt-2">
'''

# We need to replace from `<div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">` down to `</div>\n            </div>` (the end of the top grid).

content = re.sub(
    r'<div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">.*?<div class="md:col-span-2 grid grid-cols-2 gap-2">.*?</div>\s*</div>\s*</div>',
    new_top_section,
    content,
    flags=re.DOTALL
)

# 2. Add "Novo Produto" button
new_prod_btn = '''                <div class="sm:col-span-4 flex items-end gap-1">
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
                </div>'''
content = re.sub(
    r'<div class="sm:col-span-4">\s*<label class="block font-semibold mb-1 text-slate-700">Produto Base \*</label>.*?</div>',
    new_prod_btn,
    content,
    flags=re.DOTALL
)

# 3. Add Fase da Producao at the bottom near the submit button
phases_options = """${(window.productionModule ? window.productionModule.phases : [
                      {id:'orcamento', name:'0. Orcamento'},
                      {id:'prevenda', name:'1. Pre-venda'},
                      {id:'venda', name:'2. Venda / Producao'},
                      {id:'entregue', name:'3. Entregue / Concluido'}
                    ]).map(p => `<option value="${p.id}" ${order && order.status_fase === p.id ? 'selected' : (!order && p.id === 'orcamento' ? 'selected' : '')}>${p.name}</option>`).join('')}"""

bottom_section = '''            <div class="pt-6 mt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="w-full sm:w-1/3">
                <label class="block text-xs font-bold text-slate-700 mb-1">Fase da Producao / Status Inicial</label>
                <select name="status_fase" class="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-black text-blue-700 shadow-sm border-blue-300">
                  ''' + phases_options + '''
                </select>
              </div>
              <div class="flex gap-3 w-full sm:w-auto justify-end">
                <button type="button" onclick="salesModule.render()" class="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                <button type="submit" class="px-8 py-3 text-sm bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md uppercase transition">${isEdit ? 'Atualizar Pedido' : 'Finalizar Pedido'}</button>
              </div>
            </div>'''
            
content = re.sub(
    r'<div class="pt-6 mt-4 border-t flex justify-end gap-3">.*?</div>',
    bottom_section,
    content,
    flags=re.DOTALL
)

with open('js/sales.js', 'w', encoding='utf-8') as f:
    f.write(content)
