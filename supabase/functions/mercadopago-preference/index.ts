// Supabase Edge Function: mercadopago-preference
// Deno TypeScript Runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, title, amount, installments, accessToken, webhookUrl, backUrls } = await req.json();

    const token = accessToken || Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Access Token do Mercado Pago não configurado." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const maxInstallments = Math.min(Math.max(parseInt(installments) || 12, 1), 12);

    const body: Record<string, any> = {
      items: [
        {
          id: String(orderId),
          title: title || `Grafsis - Pedido #${orderId}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(amount)
        }
      ],
      external_reference: String(orderId),
      payment_methods: {
        installments: maxInstallments,
        excluded_payment_types: [
          { id: "ticket" } // Exclui boleto para priorizar cartão de crédito e pix
        ]
      }
    };

    if (webhookUrl) {
      body.notification_url = webhookUrl;
    }

    if (backUrls) {
      body.back_urls = backUrls;
      body.auto_return = "approved";
    }

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return new Response(
        JSON.stringify({ error: mpData.message || "Erro ao gerar preferência no Mercado Pago", details: mpData }),
        { status: mpResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
