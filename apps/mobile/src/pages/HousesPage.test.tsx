import { demoBatch, demoDistributions, demoFosterFarmers, demoHouses, demoMapPlacements, demoMemberships, demoOrganizations, demoRiskAssessments, demoShareholders, demoShareholdings, initialVisitProgress } from '@chicken-village/domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

describe('public house browsing and admin operations', () => {
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
    for (const label of ['投資雞舍', '設計總容量', '當前在養', '權益雞數', '已確認分潤', '待付分潤', '加權風險', '下次預計出貨']) expect(screen.getByText(label)).toBeInTheDocument();
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
