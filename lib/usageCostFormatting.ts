export const formatUsageUsd = (value?: number | null) => {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  if (amount > 0 && amount < 0.00000001) return '<$0.00000001';
  const fractionDigits = amount === 0 ? 2 : amount < 0.01 ? 8 : amount < 1 ? 4 : 2;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
};
