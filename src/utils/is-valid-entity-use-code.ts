import { ENTITY_USE_CODES } from "../const";
import { EntityUseCode } from "../types";

export const isValidEntityUseCode = (code: string): boolean =>
  ENTITY_USE_CODES.includes(code as EntityUseCode);
