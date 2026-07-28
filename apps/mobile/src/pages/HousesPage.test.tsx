import { demoBatch, demoDistributions, demoFosterFarmers, demoHouses, demoMapPlacements, demoMemberships, demoOrganizations, demoRiskAssessments, demoShareholders, demoShareholdings, initialVisitProgress } from '@chicken-village/domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { VillageState } from '../hooks/useVillageState';
import { HousesPage } from './HousesPage';

vi.mock('../hooks/useInvestmentLedger', () => ({
  useInvestmentLedger: (enabled: boolean) => enabled ? {
    updatedOn: '2026-07-24', members: ['甲', '乙', '丙'], loading: false, error: null,
    rounds: [{
      id: 'investment-a', name: '測試投資場', teamShareBasisPoints: 2_000, caretaker: '測試代養戶', iconIndex: 3,
      speciesLabel: '紅羽土雞', statusLabel: '目前投資中',
      settlements: [{ id: 'settlement-a', paidOn: '2026-07-15', farmProfitLossTwd: 100_000, teamNetIncomeTwd: 20_000, feedConversionRate: 2.4, survivalRatePercent: 92, caretakerSettlementPayableTwd: 80_000, paymentMemo: '應付', lines: [{ label: '代養金', amountTwd: 80_000 }] }],
    }],
  } : { updatedOn: null, members: [], rounds: [], loading: false, error: null },
}));

function villageFixture(): VillageState {
  return {
    houses: demoHouses,
    organizations: demoOrganizations,
    memberships: demoMemberships,
    fosterFarmers: demoFosterFarmers,
    batches: [demoBatch],
    shareholders: demoShareholders,
    shareholdings: demoShareholdings,
    distributions: demoDistributions,
    riskAssessments: demoRiskAssessments,
    mapPlacements: demoMapPlacements,
    auditEvents: [],
    outbox: [],
    visits: initialVisitProgress,
    ready: true,
    storageMode: 'web-cache',
    unsyncedCount: 0,
    syncMode: 'idle',
    syncError: null,
    addHouse: vi.fn(), updateHouse: vi.fn(), archiveHouse: vi.fn(), addBatch: vi.fn(), addShareholder: vi.fn(), createDistribution: vi.fn(), confirmDistributionRecord: vi.fn(), payDistribution: vi.fn(), reverseDistributionRecord: vi.fn(), saveRisk: vi.fn(), moveHouse: vi.fn(), syncNow: vi.fn(), equip: vi.fn(), selectAvatar: vi.fn(),
  };
}

describe('public house browsing and admin operations', () => {
  it('keeps investment finance private until an administrator signs in', () => {
    render(<MemoryRouter><HousesPage village={villageFixture()} online isAdmin={false} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '大富翁投資場次' })).toBeInTheDocument();
    expect(screen.getByText('投資帳冊需要管理員登入')).toBeInTheDocument();
    expect(screen.queryByText('測試投資場')).not.toBeInTheDocument();
  });

  it('renders Firebase investment entries as illustrated house dossiers', () => {
    render(<HousesPage village={villageFixture()} online isAdmin />);
    expect(screen.getByRole('tab', { name: /測試投資場/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByText('20%').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('民國 115/07/15')).toBeInTheDocument();
    expect(screen.getAllByText('盈餘結算')).toHaveLength(1);
  });

  it('lets the public browse without exposing mutation controls', () => {
    render(<MemoryRouter><HousesPage village={villageFixture()} online isAdmin={false} /></MemoryRouter>);
    expect(screen.getByText('公開瀏覽模式')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '＋ 新增' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: '編輯' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '批次' }));
    expect(screen.queryByRole('heading', { name: '新增批次草稿' })).not.toBeInTheDocument();
  });

  it('shows operational metrics and edit controls to an administrator', () => {
    render(<HousesPage village={villageFixture()} online isAdmin />);
    for (const label of ['已建檔雞舍', '設計總容量', '當前在養', '權益雞數', '已確認分潤', '待付分潤', '加權風險', '下次預計出貨']) expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '＋ 新增' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '編輯' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '風險' }));
    expect(screen.getByText(/模型 5m1e-v1/)).toBeInTheDocument();
    expect(screen.getByLabelText('環境風險（0–100）')).toHaveValue(32);
  });

  it('keeps financial lifecycle actions unavailable while offline', () => {
    render(<HousesPage village={villageFixture()} online={false} isAdmin />);
    expect(screen.getByText(/管理員寫入需要網路連線/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '分潤' }));
    expect(screen.getByRole('button', { name: '付清' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '沖銷' })).toBeDisabled();
  });
});
