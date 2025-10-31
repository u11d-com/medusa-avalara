export const getAvalaraLocationCacheKey = (
  countryCode: string,
  provinceCode?: string
): string => {
  const base = `avalara:location:${countryCode.toLowerCase()}`;
  return provinceCode ? `${base}:${provinceCode.toLowerCase()}` : base;
};
