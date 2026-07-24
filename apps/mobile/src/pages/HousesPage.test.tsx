import { demoBatch, demoDistributions, demoFosterFarmers, demoHouses, demoMapPlacements, demoMemberships, demoOrganizations, demoRiskAssessments, demoShareholders, demoShareholdings, initialVisitProgress } from '@chicken-village/domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { VillageState } from '../hooks/useVillageState';
import { HousesPage } from './HousesPage';

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
    addHouse: vi.fn(), updateHouse: vi.fn(), archiveHouse: vi.fn(), addBatch: vi.fn(), addShareholder: vi.fn(), createDistribution: vi.fn(), confirmDistributionRecord: vi.fn(), payDistribution: vi.fn(), reverseDistributionRecord: vi.fn(), saveRisk: vi.fn(), moveHouse: vi.fn(), syncNow: vi.fn(), visitToday: vi.fn(), equip: vi.fn(),
  };
}

describe('private house operations', () => {
  it('shows the required operational metrics and working tabs', () => {
    render(<HousesPage village={villageFixture()} online />);
    for (const label of ['投資雞舍', '設計總容量', '當前在養', '權益雞數', '已確認分潤', '待付分潤', '加權風險', '下次預計出貨']) expect(screen.getByText(label)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '風險' }));
    expect(screen.getByText(/模型 5m1e-v1/)).toBeInTheDocument();
    expect(screen.getByLabelText('環境風險（0–100）')).toHaveValue(32);
  });

  it('keeps financial lifecycle actions unavailable while offline', () => {
    render(<HousesPage village={villageFixture()} online={false} />);
    expect(screen.getByText(/分潤確認、付款、沖銷及正式結算需連線/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '分潤' }));
    expect(screen.getByRole('button', { name: '付清' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '沖銷' })).toBeDisabled();
  });
});
