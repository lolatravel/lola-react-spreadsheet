import toLower from 'lodash/toLower';
import type { FormatCostShape } from '../types';

type Delimeters = Record<string, {
  thousands: string;
  decimal: string;
}>;

const NUMBER_DELIMITERS_BY_LANGUAGE: Delimeters = {
  de: {
    thousands: '.',
    decimal: ','
  },
  en: {
    thousands: ',',
    decimal: '.'
  },
  es: {
    thousands: ',',
    decimal: '.'
  },
  fr: {
    thousands: ' ',
    decimal: ','
  }
};

export function formatCost({
  value,
  locale,
  currency = 'USD',
  padDecimalsWithZeros = false,
  canBeNegative = true,
  defaultToZero = true
}: FormatCostShape) {
  const formattedValue = typeof value === 'number' ? value.toString() : value || '';

  const language: string = locale ? toLower(locale.split('-')[0]) : '';
  const delimiters = NUMBER_DELIMITERS_BY_LANGUAGE[language] || {};
  const numberRegex = canBeNegative
    ? new RegExp(`[^0-9-${delimiters.decimal}]`, 'g')
    : new RegExp(`[^0-9${delimiters.decimal}]`, 'g');
  const cost = formattedValue.replace(numberRegex, '');
  const minimumFractionDigits = padDecimalsWithZeros ? 2 : 0;

  if (!cost || value === '.') {
    if (defaultToZero) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
        minimumFractionDigits
      }).format(0);
    }

    return '';
  }

  // Make sure decimals are max 2 digits so that we don't round up
  // (since this formats user input, it would be confusing)
  const parts = cost.replace(delimiters.decimal, '.').split('.');
  const normalizedCost = parts.length === 2 ? `${parts[0]}.${parts[1].slice(0, 2)}` : cost;

  if (Number.isNaN(Number(normalizedCost))) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits
    }).format(0);
  }

  const formattedCost = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits
  }).format(Number(normalizedCost));

  // Temporary statement since we primarily work with USD. This should be revisited to make sure other
  // locales and currencies are correctly handled.
  if (locale !== 'en-US') {
    if (!padDecimalsWithZeros && cost.includes(delimiters.decimal)) {
      const decimalIndex = cost.indexOf(delimiters.decimal);
      const isDecimalEndOfNumber = Number.isNaN(parseInt(cost[decimalIndex + 1], 10));

      const endOfNumberIndex = formattedCost.lastIndexOf(cost[decimalIndex - 1]);
      const beforeDecimal = formattedCost.slice(0, endOfNumberIndex + 1);
      const afterDecimal = formattedCost.slice(endOfNumberIndex + 1, formattedCost.length);

      if (!isDecimalEndOfNumber) {
        const charactersAfterDelimiter = cost.slice(decimalIndex + 1, cost.length).slice(0, 2);
        return parseInt(charactersAfterDelimiter, 10) === 0
          ? `${beforeDecimal}${delimiters.decimal}${charactersAfterDelimiter}${afterDecimal}`
          : formattedCost;
      }

      return `${beforeDecimal}${delimiters.decimal}${afterDecimal}`;
    }

    return formattedCost;
  }

  // Since this function is used for formatting costs in inputs, we need to keep the trailing decimal delimiter.
  // Intl.NumberFormat removes it during formatting if no decimals are specified, so we need to add it back.
  if (!padDecimalsWithZeros && cost.includes(delimiters.decimal)) {
    const decimalIndex = cost.indexOf(delimiters.decimal);
    const isDecimalEndOfNumber = Number.isNaN(parseInt(cost[decimalIndex + 1], 10));

    let beforeDecimal;
    let afterDecimal;

    if (formattedCost.includes(delimiters.decimal)) {
      const endOfNumberIndex = formattedCost.lastIndexOf(cost[decimalIndex]);
      beforeDecimal = formattedCost.slice(0, endOfNumberIndex);
      afterDecimal = formattedCost.slice(endOfNumberIndex + 2, formattedCost.length + 1);
    } else {
      const endOfNumberIndex = formattedCost.lastIndexOf(cost[decimalIndex - 1]);
      beforeDecimal = formattedCost.slice(0, endOfNumberIndex + 1);
      afterDecimal = formattedCost.slice(endOfNumberIndex + 2, formattedCost.length + 1);
    }

    if (!isDecimalEndOfNumber) {
      const charactersAfterDelimiter = cost.slice(decimalIndex + 1, cost.length).slice(0, 2);
      return parseInt(charactersAfterDelimiter, 10) === 0
        ? `${beforeDecimal}${delimiters.decimal}${charactersAfterDelimiter}${afterDecimal}`
        : `${beforeDecimal}${delimiters.decimal}${charactersAfterDelimiter}`;
    }

    return `${beforeDecimal}${delimiters.decimal}${afterDecimal}`;
  }

  return formattedCost;
}
