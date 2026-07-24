import { capacityTier, type ChickenHouse, type MapPlacement } from '@chicken-village/domain';
import { PixelPanel } from '@chicken-village/ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HouseSprite } from '../components/Sprites';

export function VillagePage({ houses, placements, onMove }: { houses: ChickenHouse[]; placements: MapPlacement[]; onMove: (houseId: string, xDelta: number, yDelta: number) => void }) {
  const [editing, setEditing] = useState('');
  const active = houses.filter((house) => !house.archivedAt);
  return <div className="page village-page">
    <header className="page-title"><p className="eyebrow">遊戲式導覽地圖</p><h1>我的村莊</h1><p>地圖位置會離線保存並同步，但不顯示任何真實地址。</p></header>
    <div className="village-board">
      <img src="/assets/art/village-map.png" alt="俯視像素村莊，有市場、孵化所、史料館、住宅與雞舍用地" />
      <Link className="map-pin map-pin--market" to="/today"><span>市場</span></Link><Link className="map-pin map-pin--archive" to="/history"><span>史料館</span></Link>
      {active.map((house, index) => { const placement = placements.find((row) => row.chickenHouseId === house.id); const left = `${(placement?.xBasisPoints ?? 1500 + index * 2700) / 100}%`; const top = `${(placement?.yBasisPoints ?? 6900) / 100}%`; return <button aria-label={`移動 ${house.name}`} className={`house-marker ${editing === house.id ? 'editing' : ''}`} style={{ left, top }} onClick={() => setEditing(editing === house.id ? '' : house.id)} key={house.id}><HouseSprite tier={capacityTier(house.designCapacity)} name={house.name} /><span>{house.name}<small>{house.currentBirdCount.toLocaleString()} 隻</small></span></button>; })}
    </div>
    {editing && <PixelPanel title="調整雞舍位置" className="map-editor"><p>{active.find((house) => house.id === editing)?.name}（每次移動 3%）</p><div className="map-editor__pad"><button aria-label="向上" onClick={() => onMove(editing, 0, -300)}>↑</button><button aria-label="向左" onClick={() => onMove(editing, -300, 0)}>←</button><button aria-label="向下" onClick={() => onMove(editing, 0, 300)}>↓</button><button aria-label="向右" onClick={() => onMove(editing, 300, 0)}>→</button></div><Link className="secondary-button map-editor__link" to="/houses">開啟雞舍資料</Link></PixelPanel>}
    <PixelPanel title="村莊圖例"><div className="legend"><span><i className="dot dot--good" />批次正常</span><span><i className="dot dot--warn" />待補資料</span><span><i className="dot dot--high" />高風險</span></div></PixelPanel>
  </div>;
}
