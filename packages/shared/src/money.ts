import Decimal from 'decimal.js';

export class Money {
  readonly amount: Decimal;
  readonly currency: string;

  private constructor(amount: Decimal, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  static from(input: string | number | Decimal, currency: string): Money {
    return new Money(new Decimal(input), currency.toUpperCase());
  }

  plus(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error('CURRENCY_MISMATCH');
    }
    return new Money(this.amount.plus(other.amount), this.currency);
  }

  minus(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error('CURRENCY_MISMATCH');
    }
    return new Money(this.amount.minus(other.amount), this.currency);
  }

  negate(): Money {
    return new Money(this.amount.negated(), this.currency);
  }

  isZero(): boolean {
    return this.amount.equals(0);
  }

  toString(): string {
    return this.amount.toFixed(2);
  }
}
