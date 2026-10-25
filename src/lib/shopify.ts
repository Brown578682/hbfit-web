/**
 * Shopify Storefront API client
 * Headless integration — products fetched server-side, checkout hosted by Shopify
 */

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
const SHOPIFY_API_VERSION = "2024-10";

export const SHOPIFY_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  variants: { nodes: ShopifyProductVariant[] };
  tags: string[];
  productType: string;
  availableForSale: boolean;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: { id: string; title: string; product: { title: string; featuredImage: ShopifyImage | null } };
      cost: { totalAmount: { amount: string; currencyCode: string } };
    }[];
  };
}

// ── GraphQL fetch ──────────────────────────────────────────────────────────────

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(SHOPIFY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // ISR — refresh product data every 60s
  });

  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "Shopify GraphQL error");
  return json.data as T;
}

// ── Queries ────────────────────────────────────────────────────────────────────

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  descriptionHtml
  availableForSale
  tags
  productType
  featuredImage { url altText width height }
  images(first: 10) { nodes { url altText width height } }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  variants(first: 100) {
    nodes {
      id
      title
      availableForSale
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
    }
  }
`;

// ── Category mapping ───────────────────────────────────────────────────────────

export const CATEGORY_MAP: Record<string, string> = {
  "T-Shirt": "T-Shirts",
  "Long Sleeve": "Long Sleeve",
  "Tank Top": "Tank Tops",
  "Hoodie": "Hoodies",
  "Full Zip Hoodie": "Hoodies",
  "Crewneck": "Crewnecks",
  "Heavyweight Crewneck": "Crewnecks",
  "Performance T-Shirt": "Performance",
  "Quarter Zip": "Quarter Zips",
  "Polo": "Polos",
  "Ranger Panty": "Shorts",
  "Beanie": "Headwear",
  "Dad Hat": "Headwear",
  "Legacy Trucker": "Headwear",
  "Retro Trucker": "Headwear",
};

export function getProductCategory(productType: string): string {
  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (productType.includes(key)) return category;
  }
  return "Other";
}

export function getProductColors(product: ShopifyProduct): string[] {
  const colors = new Set<string>();
  product.variants.nodes.forEach(v => {
    v.selectedOptions.forEach(o => {
      if (o.name === "Color") colors.add(o.value);
    });
  });
  return [...colors];
}

export async function getProducts(first = 24): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(`
    query GetProducts($first: Int!) {
      products(first: $first, sortKey: CREATED_AT, reverse: true) {
        nodes { ${PRODUCT_FIELDS} }
      }
    }
  `, { first });
  return data.products.nodes;
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(`
    query GetProduct($handle: String!) {
      product(handle: $handle) { ${PRODUCT_FIELDS} }
    }
  `, { handle });
  return data.product;
}

export async function createCart(variantId: string, quantity = 1): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(`
    mutation CartCreate($variantId: ID!, $quantity: Int!) {
      cartCreate(input: {
        lines: [{ merchandiseId: $variantId, quantity: $quantity }]
      }) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost { totalAmount { amount currencyCode } }
          lines(first: 10) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product { title featuredImage { url altText width height } }
                }
              }
              cost { totalAmount { amount currencyCode } }
            }
          }
        }
      }
    }
  `, { variantId, quantity });
  return data.cartCreate.cart;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatPrice(amount: string, currencyCode = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}
