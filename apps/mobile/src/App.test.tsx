import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { HomePage } from './pages/HomePage';
import { verifiedMarketFixture } from '@chicken-village/market-data';
import { initialVisitProgress } from '@chicken-village/domain';

it('shows all six primary destinations and a market summary', () => {
  render(<MemoryRouter><HomePage bundle={{ records: verifiedMarketFixture, snapshots: [], mode: 'fixture', message: '測試' }} visits={initialVisitProgress} /></MemoryRouter>);
  for (const label of ['今日雞情', '歷史行情', '我的村莊', '我的雞舍', '管理者', '設定']) expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.getByText('雞蛋・產地')).toBeInTheDocument();
});
