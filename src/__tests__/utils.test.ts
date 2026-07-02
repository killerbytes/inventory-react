import { describe, it, expect } from 'vitest';
import {
  getTotalAmountTableFooter,
  getGoodReceiptTotalAmount,
  mappedStatusHistory,
  formatLabel,
  groupSubItems,
} from '@/lib/utils';

// ---------------------------------------------------------------------------
// getTotalAmountTableFooter
// ---------------------------------------------------------------------------
describe('getTotalAmountTableFooter', () => {
  it('sums amount correctly across multiple items', () => {
    const items = [
      { purchasePrice: 200, quantity: 5, discount: 0 },
      { purchasePrice: 100, quantity: 2, discount: 50 },
    ];
    const result = getTotalAmountTableFooter(items);
    // 200*5 + 100*2 = 1000 + 200 = 1200
    expect(result.amount).toBe(1200);
  });

  it('sums discounts correctly', () => {
    const items = [
      { purchasePrice: 200, quantity: 5, discount: 10 },
      { purchasePrice: 100, quantity: 2, discount: 20 },
    ];
    const result = getTotalAmountTableFooter(items);
    expect(result.discount).toBe(30);
  });

  it('handles empty array without throwing', () => {
    const result = getTotalAmountTableFooter([]);
    expect(result.amount).toBe(0);
    expect(result.discount).toBe(0);
  });

  it('handles null discount gracefully', () => {
    const items = [{ purchasePrice: 100, quantity: 2, discount: null }];
    const result = getTotalAmountTableFooter(items);
    expect(result.discount).toBe(0);
    expect(result.amount).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// getGoodReceiptTotalAmount
// ---------------------------------------------------------------------------
describe('getGoodReceiptTotalAmount', () => {
  /** Minimal GoodReceipt shape needed for the function */
  const makeReceipt = (total: string, returnTotal: string) =>
    ({
      totalAmount: total,
      totalReturnAmount: returnTotal,
    }) as unknown as Parameters<typeof getGoodReceiptTotalAmount>[0][number];

  it('calculates net total correctly', () => {
    const receipts = [
      makeReceipt('1000', '100'),
      makeReceipt('500', '0'),
    ];
    expect(getGoodReceiptTotalAmount(receipts)).toBe(1400);
  });

  it('returns 0 for an empty list', () => {
    expect(getGoodReceiptTotalAmount([])).toBe(0);
  });

  it('handles full returns (net 0)', () => {
    const receipts = [makeReceipt('500', '500')];
    expect(getGoodReceiptTotalAmount(receipts)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// mappedStatusHistory
// ---------------------------------------------------------------------------
describe('mappedStatusHistory', () => {
  const makeHistory = (status: string, username: string) =>
    ({
      status,
      user: { username },
    }) as unknown as Parameters<typeof mappedStatusHistory>[0][number];

  it('maps history by status key', () => {
    const history = [
      makeHistory('DRAFT', 'admin'),
      makeHistory('RECEIVED', 'cashier'),
    ];
    const mapped = mappedStatusHistory(history);
    expect(mapped['DRAFT'].user.username).toBe('admin');
    expect(mapped['RECEIVED'].user.username).toBe('cashier');
  });

  it('later entry overwrites earlier for duplicate status', () => {
    const history = [
      makeHistory('RECEIVED', 'first'),
      makeHistory('RECEIVED', 'second'),
    ];
    const mapped = mappedStatusHistory(history);
    expect(mapped['RECEIVED'].user.username).toBe('second');
  });

  it('returns empty object for empty array', () => {
    expect(mappedStatusHistory([])).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// formatLabel
// ---------------------------------------------------------------------------
describe('formatLabel', () => {
  it('formats snake_case to Title Case', () => {
    expect(formatLabel('sales_order')).toBe('Sales Order');
  });

  it('handles single word', () => {
    expect(formatLabel('draft')).toBe('Draft');
  });

  it('handles already uppercase input', () => {
    expect(formatLabel('RECEIVED')).toBe('Received');
  });
});

// ---------------------------------------------------------------------------
// groupSubItems
// ---------------------------------------------------------------------------
describe('groupSubItems', () => {
  const makeItem = (id: number, isBreakPackOfId?: number) =>
    ({
      id,
      isBreakPackOfId: isBreakPackOfId ?? null,
      name: `Item-${id}`,
    }) as unknown as Parameters<typeof groupSubItems>[0][number];

  it('returns root items when no break-packs exist', () => {
    const items = [makeItem(1), makeItem(2)];
    const result = groupSubItems(items);
    expect(result).toHaveLength(2);
  });

  it('nests a break-pack under its parent', () => {
    const items = [makeItem(1), makeItem(2, 1)]; // item 2 is a sub of item 1
    const result = groupSubItems(items);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].subItem?.[0].id).toBe(2);
  });

  it('ignores orphaned break-pack references', () => {
    const items = [makeItem(1, 99)]; // parent 99 doesn't exist
    const result = groupSubItems(items);
    // No parent found → treated as root
    expect(result).toHaveLength(1);
  });
});
