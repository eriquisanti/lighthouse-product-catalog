import { formatDecimal } from './format';

const MAX_CURRENCY_DIGITS = 10;
const MAX_INTEGER_DIGITS = 10;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskCurrency(value: string): string {
  const digits = onlyDigits(value).replace(/^0+/, '').slice(0, MAX_CURRENCY_DIGITS);

  if (!digits) {
    return '';
  }

  return formatDecimal(Number(digits) / 100);
}

export function maskInteger(value: string): string {
  return onlyDigits(value)
    .replace(/^0+(?=\d)/, '')
    .slice(0, MAX_INTEGER_DIGITS);
}
