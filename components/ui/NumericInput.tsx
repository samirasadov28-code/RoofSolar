'use client';

import { ChangeEvent, FocusEvent, InputHTMLAttributes, useState } from 'react';

interface NumericInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number;
  onChange: (n: number) => void;
  /** Step granularity. <1 implies decimals; >=1 implies integer. */
  step?: number;
}

function decimalsFor(step?: number): number {
  if (!step || step >= 1) return 0;
  // step = 0.01 → 2 decimals, 0.001 → 3, etc.
  return Math.max(0, -Math.floor(Math.log10(step)));
}

function formatWithSeparators(n: number, step?: number): string {
  if (!Number.isFinite(n)) return '';
  const decimals = decimalsFor(step);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Numeric input that displays its value with thousand separators (e.g.
 * "4,200" or "12,345.50") while not focused. While the user is editing
 * we show the raw digits so cursor positioning behaves naturally.
 */
export function NumericInput({ value, onChange, step, ...rest }: NumericInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const displayed = focused ? draft : formatWithSeparators(value, step);

  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    setDraft(Number.isFinite(value) ? String(value) : '');
    rest.onFocus?.(e);
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    rest.onBlur?.(e);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setDraft(text);
    // Strip any incidentally-typed commas / spaces / non-numeric noise.
    const cleaned = text.replace(/[, ]/g, '').replace(/[^\d.\-]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(cleaned);
    if (Number.isFinite(parsed)) onChange(parsed);
  }

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      value={displayed}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}
