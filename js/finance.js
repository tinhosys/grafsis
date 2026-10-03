window.financeModule = {
  render() {
    const finance = window.store.getFinance();
    const container = document.getElementById('view-container');

    const totalReceber = finance.filter(f => f.tipo === 'receber' && f.status !== 'pago').reduce((a, b) => a + (parseFloat(b.valor)||0), 0);
    const totalPagar = finance.filter(f => f.tipo === 'pagar' && f.status !== 'pago').reduce((a, b) => a + (parseFloat(b.valor)||0), 0);
    const saldo = totalReceber - totalPagar;

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Contas a Pagar & Receber</h1>
            <p class="text-slate-500 text-sm">Fluxo financeiro integrado com pedidos e compras de suprimentos</p>
          </div>
          <div class="flex gap-2">
            <button onclick="financeModule.openModal('pagar')" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-lg shadow-sm">
              + Nova Conta a Pagar
            </button>
            <button onclick="financeModule.openModal('receber')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm">
              + Nova Conta a Receber
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-semibold uppercase">Total a Receber</span>
            <h3 class="text-2xl font-black text-emerald-600 mt-1">R$ ${totalReceber.toFixed(2)}</h3>
          </div>
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-semibold uppercase">Total a Pagar</span>
            <h3 class="text-2xl font-black text-rose-600 mt-1">R$ ${totalPagar.toFixed(2)}</h3>
          </div>
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-semibold uppercase">Saldo Previsto</span>
            <h3 class="text-2xl font-black ${saldo >= 0 ? 'text-blue-600' : 'text-amber-600'} mt-1">R$ ${saldo.toFixed(2)}</h3>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b">
                <tr>
                  <th class="p-3">Tipo</th>
                  <th class="p-3">Descrição / Origem</th>
                  <th class="p-3">Vencimento</th>
                  <th class="p-3">Valor</th>
                  <th class="p-3">Status</th>
                  <th class="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${finance.length === 0 ? `<tr><td colspan="6" class="p-8 text-center text-slate-400">Nenhum lançamento financeiro registrado</td></tr>` : ''}
                ${finance.map(f => `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-xs font-bold ${f.tipo === 'receber' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                        ${f.tipo === 'receber' ? 'A Receber' : 'A Pagar'}
                      </span>
                    </td>
                    <td class="p-3 font-semibold text-slate-800">${f.descricao}</td>
                    <td class="p-3 font-mono text-xs">${f.data_vencimento ? f.data_vencimento.split('-').reverse().join('/') : '-'}</td>
                    <td class="p-3 font-bold font-mono ${f.tipo === 'receber' ? 'text-emerald-700' : 'text-rose-700'}">
                      R$ ${Number(f.valor||0).toFixed(2)}
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-xs font-medium ${f.status === 'pago' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'}">
                        ${f.status === 'pago' ? 'Quitado' : 'Pendente'}
                      </span>
                    </td>
                    <td class="p-3 text-right">
                      <div class="inline-flex gap-2">
                        ${f.status !== 'pago' ? `
                          <button onclick="financeModule.markPaid('${f.id}')" class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded font-semibold border border-emerald-200">
                            Dar Baixa
                          </button>
                        ` : ''}
                        <button onclick="financeModule.delete('${f.id}')" class="text-red-500 hover:text-red-700 p-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  createExpenseForSupplier(suppId) {
    const supp = window.store.getSuppliers().find(s => s.id === suppId);
    this.openModal('pagar', {
      descricao: `Compra Insumos - ${supp ? supp.nome_fantasia : 'Fornecedor'}`
    });
  },

  openModal(tipo = 'pagar', pre = {}) {
    const modalHtml = `
      <div id="finance-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <h2 class="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">
            ${tipo === 'receber' ? 'Nova Conta a Receber' : 'Nova Conta a Pagar'}
          </h2>
          <form onsubmit="financeModule.save(event, '${tipo}')" class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Descrição do Lançamento *</label>
              <input type="text" name="descricao" required value="${pre.descricao || ''}" placeholder="Ex: Pagamento Bobinas de Lona" class="w-full px-3 py-2 border rounded-lg text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Valor (R$) *</label>
              <input type="number" step="0.01" name="valor" required placeholder="0.00" class="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-800">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Data de Vencimento *</label>
              <input type="date" name="data_vencimento" required value="${new Date().toISOString().slice(0,10)}" class="w-full px-3 py-2 border rounded-lg text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select name="status" class="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="pendente">Pendente</option>
                <option value="pago">Quitado / Pago</option>
              </select>
            </div>
            <div class="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onclick="document.getElementById('finance-modal').remove()" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="submit" class="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  save(e, tipo) {
    e.preventDefault();
    const form = e.target;
    window.store.saveFinanceEntry({
      tipo: tipo,
      descricao: form.descricao.value.trim(),
      valor: parseFloat(form.valor.value) || 0,
      data_vencimento: form.data_vencimento.value,
      status: form.status.value
    });
    document.getElementById('finance-modal').remove();
    this.render();
  },

  markPaid(id) {
    const entries = window.store.getFinance();
    const item = entries.find(e => e.id === id);
    if (item) {
      item.status = 'pago';
      item.data_pagamento = new Date().toISOString();
      window.store.save('grafsis_finance', entries);
      this.render();
    }
  },

  delete(id) {
    if (confirm('Remover lançamento financeiro?')) {
      window.store.deleteFinanceEntry(id);
      this.render();
    }
  }
,
  openCashierModal(orderId) {
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const client = window.store.getClients().find(c => c.id === order.cliente_id) || { nome: 'Consumidor' };
    const allFinance = window.store.getFinance();
    const payments = allFinance.filter(f => f.pedido_id === orderId && f.tipo === 'recebimento');
    const totalPaid = payments.reduce((a, b) => a + (parseFloat(b.valor)||0), 0);
    const balance = order.valor_final - totalPaid;

    const modalHtml = `
      <div id="cashier-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
          <div class="flex justify-between items-center pb-3 border-b">
            <div>
              <h2 class="text-xl font-black text-slate-800">Caixa - Recebimentos Parciais</h2>
              <p class="text-xs text-slate-500 font-bold uppercase">Pedido #${order.numero} - ${client.nome}</p>
            </div>
            <button onclick="document.getElementById('cashier-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
          </div>

          <div class="grid grid-cols-3 gap-3 mt-4 text-center">
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span class="block text-[10px] font-bold text-slate-500 uppercase">Valor Total</span>
              <span class="text-lg font-black text-slate-800">R$ ${Number(order.valor_final).toFixed(2)}</span>
            </div>
            <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span class="block text-[10px] font-bold text-emerald-600 uppercase">Já Pago</span>
              <span class="text-lg font-black text-emerald-700" id="cashier-total-paid">R$ ${totalPaid.toFixed(2)}</span>
            </div>
            <div class="bg-rose-50 p-3 rounded-xl border border-rose-200">
              <span class="block text-[10px] font-bold text-rose-600 uppercase">Saldo Devedor</span>
              <span class="text-lg font-black text-rose-700" id="cashier-balance">R$ ${balance.toFixed(2)}</span>
            </div>
          </div>

          <div class="mt-4 border rounded-xl overflow-hidden">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-100 text-slate-500 uppercase">
                <tr><th class="p-2">Data</th><th class="p-2">Forma Pgto</th><th class="p-2 font-mono text-right">Valor</th><th class="p-2 text-center">Ações</th></tr>
              </thead>
              <tbody id="cashier-payments-tbody">
                ${payments.length === 0 ? '<tr><td colspan="4" class="p-3 text-center text-slate-400">Nenhum pagamento registrado</td></tr>' : ''}
                ${payments.map(p => `
                  <tr class="border-t">
                    <td class="p-2 font-mono">${new Date(p.data_pagamento).toLocaleDateString('pt-BR')}</td>
                    <td class="p-2 font-bold">${p.forma_pagamento}</td>
                    <td class="p-2 font-mono text-emerald-600 font-bold text-right">R$ ${Number(p.valor).toFixed(2)}</td>
                    <td class="p-2 text-center"><button onclick="financeModule.deletePayment('${p.id}', '${orderId}')" class="text-red-500 hover:text-red-700 font-bold" title="Estornar">&times;</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${balance > 0 ? `
            <div class="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 class="text-sm font-bold text-slate-800 mb-2">Registrar Novo Pagamento</h3>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-semibold mb-1">Forma de Pagto</label>
                  <select id="new-pay-form" class="w-full p-2 border rounded bg-white text-sm">
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência Bancária</option>
                    <option value="Permuta / Patrocínio">Permuta / Patrocínio</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1">Valor Recebido</label>
                  <input type="number" id="new-pay-value" step="0.01" max="${balance}" value="${balance.toFixed(2)}" class="w-full p-2 border rounded bg-white text-sm font-bold text-emerald-700">
                </div>
                <div class="flex items-end">
                  <button onclick="financeModule.addPayment('${orderId}')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded shadow-sm text-sm">Confirmar Pagto</button>
                </div>
              </div>
            </div>
          ` : `
            <div class="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span class="font-black text-emerald-700 uppercase">✓ Pedido Totalmente Quitado</span>
            </div>
          `}
        </div>
      </div>
    `;
    
    const existing = document.getElementById('cashier-modal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  addPayment(orderId) {
    const val = parseFloat(document.getElementById('new-pay-value').value);
    const form = document.getElementById('new-pay-form').value;
    if (!val || val <= 0) return alert('Valor inválido');
    
    const orders = window.store.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    window.store.saveFinanceEntry({
      tipo: 'recebimento',
      descricao: 'Recibo Parcial/Total - Pedido #' + order.numero,
      valor: val,
      data_vencimento: new Date().toISOString().slice(0, 10),
      data_pagamento: new Date().toISOString(),
      forma_pagamento: form,
      status: 'pago',
      pedido_id: orderId,
      cliente_id: order.cliente_id
    });
    
    this.openCashierModal(orderId);
    if(window.salesModule) window.salesModule.render();
  },

  deletePayment(paymentId, orderId) {
    if(confirm('Tem certeza que deseja estornar este pagamento?')) {
      window.store.deleteFinanceEntry(paymentId);
      this.openCashierModal(orderId);
      if(window.salesModule) window.salesModule.render();
    }
  }
};
