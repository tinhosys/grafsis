// Supabase Edge Function: mercadopago-pix
// Deno TypeScript Runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, amount, description, payerEmail, payerCpf, accessToken, webhookUrl } = await req.json();

    const token = accessToken || Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Access Token do Mercado Pago não configurado." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const idempotencyKey = req.headers.get("x-idempotency-key") || `pix-${orderId}-${Date.now()}`;
    const cleanCpf = (payerCpf || "").replace(/\D/g, "");

    const body: Record<string, any> = {
      transaction_amount: Number(amount),
      description: description || `Grafsis - Pedido #${orderId}`,
      payment_method_id: "pix",
      external_reference: String(orderId),
      payer: {
        email: payerEmail || "cliente@grafsis.com.br",
      }
    };

    if (cleanCpf && cleanCpf.length === 11) {
      body.payer.identification = {
        type: "CPF",
        number: cleanCpf
      };
    }

    if (webhookUrl) {
      body.notification_url = webhookUrl;
    }

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(body)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return new Response(
        JSON.stringify({ error: mpData.message || "Erro ao gerar Pix no Mercado Pago", details: mpData }),
        { status: mpResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        id: mpData.id,
        status: mpData.status,
        qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
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
