export const getAvalaraCustomerCacheKey = (customerId: string): string =>
  `avalara:customer:${customerId}`;
