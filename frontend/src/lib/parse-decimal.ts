const BRAZILIAN_FORMAT = /^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$/;
const DOT_DECIMAL_FORMAT = /^-?\d+\.\d{1,2}$/;

export function parseDecimal(value: string): number | null {
  const normalized = value.replace(/\s/g, '');

  if (DOT_DECIMAL_FORMAT.test(normalized)) {
    return Number(normalized);
  }

  if (BRAZILIAN_FORMAT.test(normalized)) {
    return Number(normalized.replace(/\./g, '').replace(',', '.'));
  }

  return null;
}
