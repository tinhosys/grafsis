// Supabase Edge Function: mercadopago-webhook
// Deno TypeScript Runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature, x-request-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    
    // Obter payment_id tanto pelo data.id quanto query params
    const paymentId = body.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

    if (!paymentId) {
      return new Response(JSON.stringify({ received: true, message: "Sem payment_id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "Access token não configurado nas Edge Functions" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Consulta oficial em GET /v1/payments/{payment_id}
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!payRes.ok) {
      return new Response(JSON.stringify({ received: true, error: "Falha ao consultar pagamento no Mercado Pago" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const payment = await payRes.json();

    // Apenas dá baixa se status for approved
    if (payment.status === "approved") {
      const orderId = payment.external_reference;
      const valor = payment.transaction_amount || payment.transaction_details?.total_paid_amount;
      const formaPagto = payment.payment_method_id === "pix" ? "Pix" : "Cartão de Crédito";

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Verifica se o pagamento já foi registrado para evitar duplicidade (idempotência)
      const { data: existing } = await supabase
        .from("finance")
        .select("id")
        .eq("observacao", `Mercado Pago ID: ${paymentId}`)
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from("finance").insert({
          pedido_id: orderId,
          tipo: "recebimento",
          forma_pagamento: formaPagto,
          valor: valor,
          data_pagamento: new Date().toISOString(),
          observacao: `Mercado Pago ID: ${paymentId} (${payment.payment_type_id || ''})`,
          created_at: new Date().toISOString()
        });

        // Se o pedido estiver com saldo zerado, pode atualizar status para 'PAGO'
        if (orderId) {
          const { data: order } = await supabase.from("orders").select("id, valor_final").eq("id", orderId).single();
          if (order) {
            const { data: payments } = await supabase.from("finance").select("valor").eq("pedido_id", orderId).eq("tipo", "recebimento");
            const totalPago = (payments || []).reduce((acc: number, p: any) => acc + (parseFloat(p.valor) || 0), 0);
            if (totalPago >= (order.valor_final || 0)) {
              await supabase.from("orders").update({ status_pagamento: "PAGO" }).eq("id", orderId);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, paymentId, status: payment.status }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    // Retorna 200 conforme orientações do Mercado Pago para evitar retentativas desnecessárias em erros de parse
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
