export default async (request) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Warenkorb ist leer." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const params = new URLSearchParams();

    params.append("mode", "payment");
    params.append(
      "success_url",
      `${process.env.URL}/success.html?session_id={CHECKOUT_SESSION_ID}`
    );
    params.append("cancel_url", `${process.env.URL}/`);

    params.append("billing_address_collection", "auto");

    items.forEach((item, index) => {
      params.append(
        `line_items[${index}][price_data][currency]`,
        "chf"
      );

      params.append(
        `line_items[${index}][price_data][product_data][name]`,
        item.name || "ORVN / 001 — Beyond The Surface Tee"
      );

      params.append(
        `line_items[${index}][price_data][product_data][description]`,
        `ORVN / 001 | Größe: ${item.size || "M"}`
      );

      params.append(
        `line_items[${index}][price_data][unit_amount]`,
        "4990"
      );

      params.append(
        `line_items[${index}][quantity]`,
        String(item.quantity || 1)
      );
    });

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return new Response(
        JSON.stringify({
          error: session.error?.message || "Stripe Fehler"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Checkout konnte nicht erstellt werden."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
