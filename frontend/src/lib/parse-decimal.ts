const BRAZILIAN_DECIMAL_FORMAT = /^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$/;

export function parseDecimal(value: string): number | null {
  const normalized = value.replace(/\s/g, '');

  if (!BRAZILIAN_DECIMAL_FORMAT.test(normalized)) {
    return null;
  }

  return Number(normalized.replace(/\./g, '').replace(',', '.'));
}
