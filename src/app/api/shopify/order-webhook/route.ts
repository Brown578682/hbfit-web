import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.SHOPIFY_ORDERS_WEBHOOK_SECRET!;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_ORDERS_WEBHOOK_URL!;

function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  const hash = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

function formatMoney(amount: string, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
  }).format(parseFloat(amount));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const topic = req.headers.get("x-shopify-topic") ?? "";
  const rawBody = await req.text();

  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (topic !== "orders/paid") {
    return NextResponse.json({ ok: true });
  }

  let order: Record<string, unknown>;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderNumber = order.order_number ?? order.name ?? "—";
  const customer = order.customer as Record<string, string> | null;
  const customerName = customer
    ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() || "Guest"
    : "Guest";
  const email = customer?.email ?? "—";
  const totalPrice = formatMoney(
    (order.total_price as string) ?? "0",
    (order.currency as string) ?? "USD"
  );
  const lineItems = (order.line_items as Array<Record<string, unknown>>) ?? [];
  const itemLines = lineItems
    .map((item) => {
      const variant = item.variant_title ? ` (${item.variant_title})` : "";
      return `• ${item.quantity}x **${item.name}**${variant}`;
    })
    .join("\n");

  const shippingAddress = order.shipping_address as Record<string, string> | null;
  const city = shippingAddress
    ? `${shippingAddress.city}, ${shippingAddress.province_code}`
    : "—";

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: `🛒 New Order #${orderNumber}`,
        color: 0x00b36b,
        fields: [
          { name: "Customer", value: customerName, inline: true },
          { name: "Email", value: email, inline: true },
          { name: "Ship To", value: city, inline: true },
          { name: "Items", value: itemLines || "—", inline: false },
          { name: "Total", value: `**${totalPrice}**`, inline: true },
        ],
        footer: { text: "Honor Bound FIT · Shopify" },
        timestamp: new Date().toISOString(),
      }],
    }),
  });

  return NextResponse.json({ ok: true });
}
