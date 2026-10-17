/* ==============================================================================
   GRAFSIS - Módulo de Integração com Mercado Pago (Pix QR Code, Link de Cartão & Gestão)
   ============================================================================== */

window.mercadoPagoModule = {
  // Retorna configurações do Mercado Pago salvas para o Tenant
  getConfig() {
    const tenant = window.store?.getActiveTenant ? window.store.getActiveTenant() : {};
    let localConfig = {};
    try {
      localConfig = JSON.parse(localStorage.getItem('grafsis_mercadopago_config') || '{}');
    } catch (e) {
      localConfig = {};
    }

    return {
      enabled: tenant.mercadopago_enabled ?? localConfig.enabled ?? false,
      accessToken: (tenant.mercadopago_access_token || localConfig.accessToken || '').trim(),
      webhookUrl: (tenant.mercadopago_webhook_url || localConfig.webhookUrl || '').trim(),
      useEdgeFunctions: localConfig.useEdgeFunctions ?? true
    };
  },

  saveConfig(data) {
    const tenant = window.store?.getActiveTenant ? window.store.getActiveTenant() : {};
    tenant.mercadopago_enabled = !!data.enabled;
    tenant.mercadopago_access_token = (data.accessToken || '').trim();
    tenant.mercadopago_webhook_url = (data.webhookUrl || '').trim();

    localStorage.setItem('grafsis_mercadopago_config', JSON.stringify({
      enabled: tenant.mercadopago_enabled,
      accessToken: tenant.mercadopago_access_token,
      webhookUrl: tenant.mercadopago_webhook_url,
      useEdgeFunctions: true
    }));

    if (window.store?.saveTenant) {
      window.store.saveTenant(tenant);
    }
  },

  isConfigured() {
    const config = this.getConfig();
    return !!(config.accessToken && config.accessToken.length > 20);
  },

  // Gera o Pix via Edge Function ou diretamente via REST API do Mercado Pago
  async createPixPayment(params) {
    const config = this.getConfig();
    if (!config.accessToken) {
      throw new Error('Configure o Access Token do Mercado Pago nas Configurações da Empresa para faturar com Pix.');
    }

    const supabaseConfig = window.GRAFSIS_CONFIG ? window.GRAFSIS_CONFIG.getSupabaseConfig() : { url: '' };
    const edgeFunctionUrl = `${supabaseConfig.url}/functions/v1/mercadopago-pix`;

    // Tenta primeiro via Supabase Edge Function
    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.key || ''}`,
          'apikey': supabaseConfig.key || ''
        },
        body: JSON.stringify({
          orderId: params.orderId,
          amount: params.amount,
          description: params.description || `Grafsis - Pedido #${params.orderId}`,
          payerEmail: params.payerEmail,
          payerCpf: params.payerCpf,
          accessToken: config.accessToken,
          webhookUrl: config.webhookUrl
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Edge function indisponível, utilizando fallback REST direto:', e);
    }

    // Fallback: Chamada REST oficial direta com X-Idempotency-Key
    const cleanCpf = (params.payerCpf || '').replace(/\D/g, '');
    const reqBody = {
      transaction_amount: Number(params.amount),
      description: params.description || `Grafsis - Pedido #${params.orderId}`,
      payment_method_id: 'pix',
      external_reference: String(params.orderId),
      payer: {
        email: params.payerEmail || 'financeiro@grafsis.com.br'
      }
    };

    if (cleanCpf && cleanCpf.length === 11) {
      reqBody.payer.identification = { type: 'CPF', number: cleanCpf };
    }

    if (config.webhookUrl) {
      reqBody.notification_url = config.webhookUrl;
    }

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pix-${params.orderId}-${Date.now()}`
      },
      body: JSON.stringify(reqBody)
    });

    const data = await mpRes.json();
    if (!mpRes.ok) {
      throw new Error(data.message || data.error || 'Erro ao processar Pix no Mercado Pago');
    }

    return {
      id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: data.point_of_interaction?.transaction_data?.ticket_url
    };
  },

  // Gera o Link de Pagamento Checkout Pro com Cartão e Parcelamento até 12x
  async createCardPreference(params) {
    const config = this.getConfig();
    if (!config.accessToken) {
      throw new Error('Configure o Access Token do Mercado Pago nas Configurações da Empresa para faturar com Cartão.');
    }

    const supabaseConfig = window.GRAFSIS_CONFIG ? window.GRAFSIS_CONFIG.getSupabaseConfig() : { url: '' };
    const edgeFunctionUrl = `${supabaseConfig.url}/functions/v1/mercadopago-preference`;

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.key || ''}`,
          'apikey': supabaseConfig.key || ''
        },
        body: JSON.stringify({
          orderId: params.orderId,
          title: params.title || `Pedido #${params.orderId} - Grafsis`,
          amount: params.amount,
          installments: params.installments || 12,
          accessToken: config.accessToken,
          webhookUrl: config.webhookUrl
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Edge function indisponível, utilizando fallback REST direto:', e);
    }

    // Fallback: Chamada REST oficial direta
    const body = {
      items: [
        {
          id: String(params.orderId),
          title: params.title || `Pedido #${params.orderId} - Grafsis`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(params.amount)
        }
      ],
      external_reference: String(params.orderId),
      payment_methods: {
        installments: Math.min(Math.max(parseInt(params.installments) || 12, 1), 12),
        excluded_payment_types: [{ id: 'ticket' }]
      }
    };

    if (config.webhookUrl) {
      body.notification_url = config.webhookUrl;
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await mpRes.json();
    if (!mpRes.ok) {
      throw new Error(data.message || data.error || 'Erro ao gerar Link de Pagamento no Mercado Pago');
    }

    return {
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point
    };
  },

  // Consulta status de um pagamento
  async checkPaymentStatus(paymentId) {
    const config = this.getConfig();
    if (!config.accessToken) return null;

    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${config.accessToken}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Erro ao checar status do pagamento:', e);
    }
    return null;
  },

  // Abre o Painel Financeiro Oficial do Mercado Pago
  openFinancialManager() {
    window.open('https://www.mercadopago.com.br/summary', '_blank');
  },

  // Abre o modal de QR Code do Pix na tela
  showPixModal(pixData, orderId, valorRecebido) {
    const modalHtml = `
      <div id="mp-pix-modal" class="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-sky-200 dark:border-sky-900 text-center animate-fade-in">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></span>
              <span class="text-xs font-black tracking-wider uppercase text-sky-700 dark:text-sky-400">Pix Mercado Pago</span>
            </div>
            <button onclick="document.getElementById('mp-pix-modal')?.remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl">&times;</button>
          </div>

          <div class="my-4">
            <p class="text-xs text-slate-500 dark:text-slate-400">Escaneie o QR Code com o app do seu banco ou copie a chave:</p>
            <div class="mt-3 bg-white p-3 rounded-2xl border-2 border-sky-400 shadow-md inline-block">
              ${pixData.qr_code_base64 
                ? `<img src="data:image/png;base64,${pixData.qr_code_base64}" alt="QR Code Pix" class="w-48 h-48 mx-auto object-contain">`
                : `<div class="w-48 h-48 flex items-center justify-center text-xs text-slate-400">QR Code gerado</div>`
              }
            </div>
            <div class="mt-2 font-black text-xl text-emerald-700 dark:text-emerald-400">
              R$ ${Number(valorRecebido).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p class="text-[11px] font-mono text-slate-400 mt-0.5">ID: ${pixData.id}</p>
          </div>

          <div class="space-y-2 mt-4">
            <button type="button" onclick="window.mercadoPagoModule.copyPixCode('${encodeURIComponent(pixData.qr_code || '')}')" class="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              <span>COPIAR CÓDIGO PIX (COPIA E COLA)</span>
            </button>

            <button type="button" onclick="window.mercadoPagoModule.verifyAndConfirmPix('${pixData.id}', '${orderId}', ${valorRecebido})" class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>VERIFICAR & CONFIRMAR BAIXA</span>
            </button>

            <button type="button" onclick="document.getElementById('mp-pix-modal')?.remove()" class="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('mp-pix-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  copyPixCode(encoded) {
    const text = decodeURIComponent(encoded);
    navigator.clipboard.writeText(text).then(() => {
      alert('Código Pix Copia e Cola copiado com sucesso!');
    }).catch(() => {
      prompt('Copie o código Pix abaixo:', text);
    });
  },

  async verifyAndConfirmPix(paymentId, orderId, valor) {
    const statusData = await this.checkPaymentStatus(paymentId);
    if (statusData && statusData.status === 'approved') {
      alert('Pagamento Pix CONFIRMADO no Mercado Pago! Registrando recebimento...');
      document.getElementById('mp-pix-modal')?.remove();
      // Preenche o valor recebido e confirma
      const recInput = document.getElementById('fm-recebido');
      if (recInput) recInput.value = Number(valor).toFixed(2);
      const obsInput = document.getElementById('fm-obs');
      if (obsInput) obsInput.value = `Pix Mercado Pago ID: ${paymentId}`;
      if (window.salesModule?.confirmFinance) {
        window.salesModule.confirmFinance();
      }
    } else {
      const statusText = statusData ? statusData.status : 'pendente';
      if (confirm(`Status atual no Mercado Pago: ${statusText.toUpperCase()}.\nDeseja confirmar a baixa manualmente no caixa agora?`)) {
        document.getElementById('mp-pix-modal')?.remove();
        const recInput = document.getElementById('fm-recebido');
        if (recInput) recInput.value = Number(valor).toFixed(2);
        const obsInput = document.getElementById('fm-obs');
        if (obsInput) obsInput.value = `Pix Mercado Pago ID: ${paymentId} (${statusText})`;
        if (window.salesModule?.confirmFinance) {
          window.salesModule.confirmFinance();
        }
      }
    }
  },

  // Abre modal com Link de Cartão de Crédito
  showCardLinkModal(linkData, orderId, valor, clientPhone) {
    const link = linkData.init_point || linkData.sandbox_init_point;
    const cleanPhone = (clientPhone || '').replace(/\D/g, '');
    const whatsMsg = encodeURIComponent(`Olá! Segue o link seguro do Mercado Pago para pagamento do seu pedido #${orderId} no valor de R$ ${Number(valor).toFixed(2)} (parcelamento no cartão em até 12x):\n${link}`);
    const whatsUrl = cleanPhone ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${whatsMsg}` : `https://api.whatsapp.com/send?text=${whatsMsg}`;

    const modalHtml = `
      <div id="mp-card-modal" class="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-blue-200 dark:border-blue-900 text-center animate-fade-in">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-600"></span>
              <span class="text-xs font-black tracking-wider uppercase text-blue-700 dark:text-blue-400">Cartão Mercado Pago</span>
            </div>
            <button onclick="document.getElementById('mp-card-modal')?.remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl">&times;</button>
          </div>

          <div class="my-4">
            <div class="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-2">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </div>
            <h4 class="text-sm font-black text-slate-800 dark:text-white">Link de Pagamento Gerado!</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">O cliente poderá pagar por Cartão de Crédito com parcelamento em até 12x.</p>
            <div class="mt-2 font-black text-xl text-blue-600 dark:text-blue-400">
              R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div class="space-y-2 mt-4">
            <button type="button" onclick="window.open('${whatsUrl}', '_blank')" class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer">
              <span>ENVIAR NO WHATSAPP</span>
            </button>

            <button type="button" onclick="navigator.clipboard.writeText('${link}').then(() => alert('Link de pagamento copiado com sucesso!'))" class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer">
              <span>COPIAR LINK DO CARTÃO</span>
            </button>

            <button type="button" onclick="window.open('${link}', '_blank')" class="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer">
              Abrir Checkout Mercado Pago
            </button>

            <button type="button" onclick="document.getElementById('mp-card-modal')?.remove()" class="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('mp-card-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
};
