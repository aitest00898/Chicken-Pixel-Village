import { describe, expect, it } from 'vitest';
import { parseInvestmentRound } from './investmentLedger';

describe('Firebase investment ledger boundary', () => {
  it('parses basis points and integer settlement amounts without embedding real records', () => {
    const round = parseInvestmentRound('house-a', {
      name: '測試雞舍', teamShareBasisPoints: 2_000, caretaker: '測試代養戶', iconIndex: 7,
      speciesLabel: '紅羽土雞', statusLabel: '目前投資中',
      settlements: [{
        id: 'settlement-a', paidOn: '2026-07-15', farmProfitLossTwd: 100_000,
        teamNetIncomeTwd: 20_000, feedConversionRate: 2.4, survivalRatePercent: 92,
        caretakerSettlementPayableTwd: 80_000, paymentMemo: '應付',
        lines: [{ label: '代養金', amountTwd: 80_000 }],
      }],
    });
    expect(round).toMatchObject({ id: 'house-a', teamShareBasisPoints: 2_000, iconIndex: 7 });
    expect(round?.settlements[0]?.teamNetIncomeTwd).toBe(20_000);
  });

  it('rejects invalid ownership percentages before they reach the UI', () => {
    expect(parseInvestmentRound('bad', { name: '錯誤', teamShareBasisPoints: 10_001 })).toBeNull();
    expect(parseInvestmentRound('bad', { name: '錯誤', teamShareBasisPoints: 12.5 })).toBeNull();
  });
});
