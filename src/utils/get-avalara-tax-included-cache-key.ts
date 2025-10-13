export const getAvalaraTaxIncludedCacheKey = (countryCode: string): string =>
  `avalara:country:${countryCode.toLocaleLowerCase()}:tax_included`;
