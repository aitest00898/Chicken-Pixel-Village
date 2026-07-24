export interface InvestmentSettlementLine {
  label: string;
  amountTwd: number;
}

export interface InvestmentSettlement {
  id: string;
  paidOn: string;
  farmProfitLossTwd: number;
  teamNetIncomeTwd: number;
  feedConversionRate: number;
  survivalRatePercent: number;
  caretakerSettlementPayableTwd: number;
  caretakerProfitSharePayableTwd?: number;
  paymentMemo: string;
  lines: InvestmentSettlementLine[];
}

export interface InvestmentRound {
  id: string;
  name: string;
  teamShareBasisPoints: number;
  caretaker: string | null;
  iconIndex: number;
  speciesLabel: string;
  statusLabel: string;
  settlements: InvestmentSettlement[];
}

export interface InvestmentLedgerSnapshot {
  updatedOn: string | null;
  members: string[];
  rounds: InvestmentRound[];
}

function finiteInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

function parseLine(value: unknown): InvestmentSettlementLine | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.label !== 'string' || !finiteInteger(row.amountTwd)) return null;
  return { label: row.label, amountTwd: row.amountTwd };
}

function parseSettlement(value: unknown): InvestmentSettlement | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const requiredIntegers = ['farmProfitLossTwd', 'teamNetIncomeTwd', 'survivalRatePercent', 'caretakerSettlementPayableTwd'] as const;
  if (typeof row.id !== 'string' || typeof row.paidOn !== 'string' || typeof row.paymentMemo !== 'string') return null;
  if (typeof row.feedConversionRate !== 'number' || !requiredIntegers.every((field) => finiteInteger(row[field]))) return null;
  if (!Array.isArray(row.lines)) return null;
  const lines = row.lines.map(parseLine).filter((line): line is InvestmentSettlementLine => line !== null);
  const parsed: InvestmentSettlement = {
    id: row.id,
    paidOn: row.paidOn,
    farmProfitLossTwd: row.farmProfitLossTwd as number,
    teamNetIncomeTwd: row.teamNetIncomeTwd as number,
    feedConversionRate: row.feedConversionRate,
    survivalRatePercent: row.survivalRatePercent as number,
    caretakerSettlementPayableTwd: row.caretakerSettlementPayableTwd as number,
    paymentMemo: row.paymentMemo,
    lines,
  };
  if (finiteInteger(row.caretakerProfitSharePayableTwd)) parsed.caretakerProfitSharePayableTwd = row.caretakerProfitSharePayableTwd;
  return parsed;
}

export function parseInvestmentRound(id: string, value: Record<string, unknown>): InvestmentRound | null {
  if (typeof value.name !== 'string' || !finiteInteger(value.teamShareBasisPoints)) return null;
  if (value.teamShareBasisPoints < 0 || value.teamShareBasisPoints > 10_000) return null;
  const settlements = Array.isArray(value.settlements)
    ? value.settlements.map(parseSettlement).filter((row): row is InvestmentSettlement => row !== null)
    : [];
  return {
    id,
    name: value.name,
    teamShareBasisPoints: value.teamShareBasisPoints,
    caretaker: typeof value.caretaker === 'string' ? value.caretaker : null,
    iconIndex: finiteInteger(value.iconIndex) ? Math.max(0, Math.min(7, value.iconIndex)) : 0,
    speciesLabel: typeof value.speciesLabel === 'string' ? value.speciesLabel : '土雞投資場',
    statusLabel: typeof value.statusLabel === 'string' ? value.statusLabel : '目前投資中',
    settlements,
  };
}
