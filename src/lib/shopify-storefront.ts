export const SHOPIFY_API_VERSION = "2026-10";
export const SHOPIFY_STORE_DOMAIN = "screenshot-exact-match-42ycs-rjd6gnmz.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "92af4f337ef3534e573a714cfcf5e622";

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: ShopifyMoney;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  tags: string[];
  priceRange: { minVariantPrice: ShopifyMoney };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export async function storefrontApiRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify returned status ${response.status}.`);
  }

  const result = (await response.json()) as GraphQLResponse<T>;
  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join(" "));
  }
  if (!result.data) {
    throw new Error("Shopify returned no storefront data.");
  }
  return result.data;
}

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  productType
  tags
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 5) { edges { node { url altText } } }
  variants(first: 20) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
`;

export async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  const result = await storefrontApiRequest<{
    products: { edges: Array<{ node: ShopifyProduct }> };
  }>(`query AurelleProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }`, { first: 50 });
  return result.products.edges.map(({ node }) => node);
}

export async function fetchShopifyProduct(handle: string): Promise<ShopifyProduct | null> {
  const result = await storefrontApiRequest<{ product: ShopifyProduct | null }>(
    `query AurelleProduct($handle: String!) {
      product(handle: $handle) { ${PRODUCT_FIELDS} }
    }`,
    { handle },
  );
  return result.product;
}

export interface ShopifyCartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface ShopifyCartLine {
  id: string;
  merchandise: { id: string };
}

export interface ShopifyCartResult {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { edges: Array<{ node: ShopifyCartLine }> };
}

const CART_SELECTION = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 100) {
    edges { node { id merchandise { ... on ProductVariant { id } } } }
  }
`;

export function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

export async function createShopifyCart(lines: ShopifyCartLineInput[]): Promise<ShopifyCartResult> {
  const result = await storefrontApiRequest<{
    cartCreate: { cart: ShopifyCartResult | null; userErrors: Array<{ message: string }> };
  }>(`mutation AurelleCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ${CART_SELECTION} }
      userErrors { message }
    }
  }`, { input: { lines, buyerIdentity: { countryCode: "IN" } } });

  const { cart, userErrors } = result.cartCreate;
  if (userErrors.length || !cart) {
    throw new Error(userErrors.map((error) => error.message).join(" ") || "Could not create your bag.");
  }
  return { ...cart, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl) };
}

export async function addShopifyCartLine(cartId: string, line: ShopifyCartLineInput): Promise<ShopifyCartResult> {
  const result = await storefrontApiRequest<{
    cartLinesAdd: { cart: ShopifyCartResult | null; userErrors: Array<{ message: string }> };
  }>(`mutation AurelleCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_SELECTION} }
      userErrors { message }
    }
  }`, { cartId, lines: [line] });

  const { cart, userErrors } = result.cartLinesAdd;
  if (userErrors.length || !cart) {
    throw new Error(userErrors.map((error) => error.message).join(" ") || "Could not update your bag.");
  }
  return { ...cart, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl) };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCartResult> {
  const result = await storefrontApiRequest<{
    cartLinesUpdate: { cart: ShopifyCartResult | null; userErrors: Array<{ message: string }> };
  }>(`mutation AurelleCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_SELECTION} }
      userErrors { message }
    }
  }`, { cartId, lines: [{ id: lineId, quantity }] });

  const { cart, userErrors } = result.cartLinesUpdate;
  if (userErrors.length || !cart) {
    throw new Error(userErrors.map((error) => error.message).join(" ") || "Could not update your bag.");
  }
  return { ...cart, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl) };
}

export async function removeShopifyCartLine(cartId: string, lineId: string): Promise<ShopifyCartResult> {
  const result = await storefrontApiRequest<{
    cartLinesRemove: { cart: ShopifyCartResult | null; userErrors: Array<{ message: string }> };
  }>(`mutation AurelleCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_SELECTION} }
      userErrors { message }
    }
  }`, { cartId, lineIds: [lineId] });

  const { cart, userErrors } = result.cartLinesRemove;
  if (userErrors.length || !cart) {
    throw new Error(userErrors.map((error) => error.message).join(" ") || "Could not remove this piece.");
  }
  return { ...cart, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl) };
}

export async function readShopifyCart(cartId: string): Promise<ShopifyCartResult | null> {
  const result = await storefrontApiRequest<{ cart: ShopifyCartResult | null }>(
    `query AurelleCart($id: ID!) { cart(id: $id) { ${CART_SELECTION} } }`,
    { id: cartId },
  );
  return result.cart ? { ...result.cart, checkoutUrl: formatCheckoutUrl(result.cart.checkoutUrl) } : null;
}