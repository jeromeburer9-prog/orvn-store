export default async (request) => {
  // Nur POST erlauben
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    // Stripe Secret Key prüfen
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({
          error: "STRIPE_SECRET_KEY fehlt in Netlify."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Warenkorb aus dem Browser
    const body = await request.json();
    const items = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Der Warenkorb ist leer."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const params = new URLSearchParams();

    // Stripe Checkout
    params.append("mode", "payment");

    // Nach erfolgreicher Zahlung
    params.append(
      "success_url",
      `${process.env.URL}/success.html?session_id={CHECKOUT_SESSION_ID}`
    );

    // Wenn Kunde Checkout abbricht
    params.append(
      "cancel_url",
      `${process.env.URL}/`
    );

    // Rechnungsadresse automatisch
    params.append(
      "billing_address_collection",
      "auto"
    );

    // Produkte
    items.forEach((item, index) => {
      params.append(
        `line_items[${index}][price_data][currency]`,
        "chf"
      );

      params.append(
        `line_items[${index}][price_data][unit_amount]`,
        "4990"
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
        `line_items[${index}][quantity]`,
        String(item.quantity || 1)
      );
    });

    // Anfrage an Stripe
    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );

    const stripeData = await stripeResponse.json();

    // Stripe Fehler
    if (!stripeResponse.ok) {
      return new Response(
        JSON.stringify({
          error:
            stripeData?.error?.message ||
            "Stripe konnte die Checkout-Session nicht erstellen."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Stripe Checkout URL zurück an den Browser
    return new Response(
      JSON.stringify({
        url: stripeData.url
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "Interner Checkout-Fehler."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
