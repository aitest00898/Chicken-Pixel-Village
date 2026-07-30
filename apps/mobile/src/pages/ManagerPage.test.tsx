import { avatarOptions, equipmentItems, type VisitProgress } from '@chicken-village/domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ManagerPage } from './ManagerPage';

describe('manager login rewards', () => {
  it('renders all twenty-four rewards, shows ready wearable assets, and blocks missing wearable assets from new equip writes', () => {
    const onEquip = vi.fn();
    const onAvatar = vi.fn();
    const visits: VisitProgress = { accumulatedDays: 24, streakDays: 3, lastVisitDate: '2026-07-24', equipped: { head: 'straw-hat' }, avatarId: 'manager-male' };
    render(<MemoryRouter><ManagerPage visits={visits} signedIn isAdmin onEquip={onEquip} onAvatar={onAvatar} /></MemoryRouter>);
    expect(screen.getAllByRole('button')).toHaveLength(equipmentItems.length + avatarOptions.length);
    expect(screen.getByRole('img', { name: /裝備 晨巡草帽/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /晨巡草帽/ })).toHaveTextContent('裝備中・點按脫下');
    expect(screen.getByRole('button', { name: /墨藍巡查帽/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /晨巡草帽/ }));
    expect(onEquip).toHaveBeenCalledWith('head', null);
    fireEvent.click(screen.getByRole('button', { name: /墨藍巡查帽/ }));
    expect(onEquip).not.toHaveBeenCalledWith('head', 'patrol-cap');
    fireEvent.click(screen.getByRole('button', { name: /艾琳/ }));
    expect(onAvatar).toHaveBeenCalledWith('manager-female');
  });
});
