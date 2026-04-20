import { describe, expect, it } from 'vitest';
import { Money, err, ok, toUtcDate, nowUtc } from '../index';

describe('shared primitives', () => {
  it('handles Money arithmetic and currency mismatch behavior', () => {
    const left = Money.from('10.25', 'usd');
    const right = Money.from(2, 'USD');

    expect(left.plus(right).toString()).toBe('12.25');
    expect(left.minus(right).toString()).toBe('8.25');
    expect(left.negate().toString()).toBe('-10.25');
    expect(Money.from(0, 'USD').isZero()).toBe(true);
    expect(() => left.plus(Money.from(1, 'EUR'))).toThrow('CURRENCY_MISMATCH');
  });

  it('builds Result helpers and UTC date utilities', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
    expect(err('BOOM')).toEqual({ ok: false, error: 'BOOM' });

    const input = '2026-02-03T11:12:13.456-05:00';
    const utcDate = toUtcDate(input);
    expect(utcDate.toISOString()).toBe('2026-02-03T16:12:13.456Z');

    const now = nowUtc();
    expect(now).toBeInstanceOf(Date);
  });
});
