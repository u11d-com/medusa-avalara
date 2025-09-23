export const getAvalaraProductCacheKey = (productId: string): string =>
  `avalara:product_tax_code:${productId}`;
