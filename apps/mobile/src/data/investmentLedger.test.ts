import { describe, expect, it } from 'vitest';
import { investmentMembers, investmentRounds } from './investmentLedger';

describe('investment ledger source data', () => {
  it('keeps the eight current venues and six supplied settlements', () => {
    expect(investmentRounds).toHaveLength(8);
    expect(investmentRounds.flatMap((round) => round.settlements)).toHaveLength(6);
    expect(investmentRounds.filter((round) => round.settlements.length === 0)).toHaveLength(4);
  });

  it('reconciles every settlement line to its caretaker payable amount', () => {
    for (const settlement of investmentRounds.flatMap((round) => round.settlements)) {
      const lineTotal = settlement.lines.reduce((sum, line) => sum + line.amountTwd, 0);
      expect(lineTotal, settlement.id).toBe(settlement.caretakerSettlementPayableTwd);
    }
  });

  it('reconciles farm profit and team ownership without rounding away the member totals', () => {
    for (const round of investmentRounds) {
      for (const settlement of round.settlements) {
        expect(settlement.teamNetIncomeTwd).toBeCloseTo(settlement.farmProfitLossTwd * round.teamSharePercent / 100, 5);
      }
    }
    const teamNet = investmentRounds.flatMap((round) => round.settlements).reduce((sum, settlement) => sum + settlement.teamNetIncomeTwd, 0);
    expect(teamNet).toBeCloseTo(419_739.6, 5);
    expect(teamNet / investmentMembers.length).toBeCloseTo(139_913.2, 5);
  });
});
