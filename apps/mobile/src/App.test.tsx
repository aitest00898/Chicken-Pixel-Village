import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { HomePage } from './pages/HomePage';
import { verifiedMarketFixture } from '@chicken-village/market-data';
import { initialVisitProgress } from '@chicken-village/domain';
import { AppShell } from './components/AppShell';

it('shows all six primary destinations and a market summary', () => {
  render(<MemoryRouter><HomePage bundle={{ records: verifiedMarketFixture, snapshots: [], mode: 'fixture', message: '測試' }} visits={initialVisitProgress} /></MemoryRouter>);
  for (const label of ['今日雞情', '歷史行情', '我的村莊', '我的雞舍', '管理者', '設定']) expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.getByText('雞蛋・產地')).toBeInTheDocument();
});

it('keeps history directly reachable in the primary navigation', () => {
  render(<MemoryRouter initialEntries={['/today']}><AppShell offline={false} syncLabel="已同步"><p>內容</p></AppShell></MemoryRouter>);
  const navigation = screen.getByRole('navigation', { name: '主要導覽' });
  expect(within(navigation).getAllByRole('link')).toHaveLength(6);
  expect(within(navigation).getByRole('link', { name: '歷史' })).toHaveAttribute('href', '/history');
});
