"use server";

/** PUBLIC — client checkout on /p/[id] */
export async function createPaymongoLinkAction(
  projectId: string,
  amountPHP: number,
  description: string
) {
  try {
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      return {
        success: false,
        error: "Payment gateway is not configured (missing PAYMONGO_SECRET_KEY).",
      };
    }

    const amountCentavos = Math.round(amountPHP * 100);

    const response = await fetch("https://api.paymongo.com/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(secretKey + ":").toString("base64"),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountCentavos,
            description: description,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo Error:", data);
      return {
        success: false,
        error: data.errors?.[0]?.detail || "Failed to create payment link.",
      };
    }

    return { success: true, checkoutUrl: data.data.attributes.checkout_url };
  } catch (error: unknown) {
    console.error("Failed to generate PayMongo link:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
