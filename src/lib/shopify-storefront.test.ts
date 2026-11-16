import { describe, expect, it } from "vitest";

import { formatCheckoutUrl } from "@/lib/shopify-storefront";

describe("Shopify checkout URL", () => {
  it("always includes the online store channel", () => {
    const checkout = new URL(formatCheckoutUrl("https://checkout.shopify.com/cart/token"));

    expect(checkout.searchParams.get("channel")).toBe("online_store");
  });
});