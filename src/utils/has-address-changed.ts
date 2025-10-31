import { AddressInfo } from "avatax/models";

export const hasAddressChanged = (
  avalaraLocation: AddressInfo,
  newAddress: AddressInfo
): boolean =>
  avalaraLocation.line1 !== newAddress.line1 ||
  avalaraLocation.line2 !== newAddress.line2 ||
  avalaraLocation.city !== newAddress.city ||
  avalaraLocation.region !== newAddress.region ||
  avalaraLocation.country !== newAddress.country ||
  avalaraLocation.postalCode !== newAddress.postalCode;
