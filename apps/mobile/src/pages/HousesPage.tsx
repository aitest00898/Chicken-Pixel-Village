import { capacityTier, demoBatch, type ChickenHouse } from '@chicken-village/domain';
import { PixelPanel, ProgressBar } from '@chicken-village/ui';
import { useState, type FormEvent } from 'react';
import { HouseSprite } from '../components/Sprites';

export function HousesPage({ houses, onAdd }: { houses: ChickenHouse[]; onAdd: (house: ChickenHouse) => void }) {
  const [showForm, setShowForm] = useState(false);
  const totalCapacity = houses.reduce((sum, house) => sum + house.designCapacity, 0);
  const totalBirds = houses.reduce((sum, house) => sum + house.currentBirdCount, 0);
  const [selected, setSelected] = useState(houses[0]?.id ?? '');
  const selectedHouse = houses.find((house) => house.id === selected) ?? houses[0];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const capacity = Number(data.get('capacity'));
    const now = new Date().toISOString();
    onAdd({ id: crypto.randomUUID(), organizationId: 'org-demo', revision: 0, createdAt: now, updatedAt: now, deletedAt: null, deviceId: 'local-device', operationId: crypto.randomUUID(), syncStatus: 'pending', name: String(data.get('name')), species: String(data.get('species')) as ChickenHouse['species'], designCapacity: capacity, currentBirdCount: 0, fosterFarmerId: null, archivedAt: null });
    event.currentTarget.reset(); setShowForm(false);
  }

  return (
    <div className="page houses-page">
      <header className="page-title inline-title"><div><p className="eyebrow">私人營運模組</p><h1>我的雞舍</h1></div><button className="primary-button compact" onClick={() => setShowForm((value) => !value)}>＋ 新增</button></header>
      {showForm && <form className="house-form" onSubmit={submit}><label>雞舍名稱<input required name="name" maxLength={30} /></label><label>雞種<select name="species"><option value="red_feather">紅羽土雞</option><option value="black_feather">黑羽土雞</option><option value="broiler">白肉雞</option><option value="layer">蛋雞</option></select></label><label>設計容量<input required name="capacity" type="number" min="1" max="1000000" /></label><button className="primary-button" type="submit">保存本機草稿</button><small>連線後才能正式確認；設計容量決定地圖建築規模。</small></form>}
      <div className="summary-grid"><PixelPanel><small>設計總容量</small><strong>{totalCapacity.toLocaleString()}</strong><span>隻</span></PixelPanel><PixelPanel><small>當前在養</small><strong>{totalBirds.toLocaleString()}</strong><span>隻</span></PixelPanel><PixelPanel><small>權益雞數</small><strong>{Math.round(totalBirds * 0.4).toLocaleString()}</strong><span>投資曝險指標</span></PixelPanel><PixelPanel><small>加權風險</small><strong>31</strong><span>中度</span></PixelPanel></div>
      <div className="house-switcher">{houses.map((house) => <button className={selected === house.id ? 'selected' : ''} onClick={() => setSelected(house.id)} key={house.id}>{house.name}</button>)}</div>
      {selectedHouse && <PixelPanel className="house-detail"><div className="house-detail__hero"><HouseSprite tier={capacityTier(selectedHouse.designCapacity)} name={selectedHouse.name} /><div><DataLine label="雞種" value={{ red_feather: '紅羽土雞', black_feather: '黑羽土雞', broiler: '白肉雞', layer: '蛋雞', other: '其他' }[selectedHouse.species]} /><DataLine label="設計容量" value={`${selectedHouse.designCapacity.toLocaleString()} 隻`} /><DataLine label="在養數" value={`${selectedHouse.currentBirdCount.toLocaleString()} 隻`} /></div></div><ProgressBar value={selectedHouse.currentBirdCount / selectedHouse.designCapacity * 100} label="雞舍在養容量使用率" /><div className="detail-tabs"><button className="active">總覽</button><button>批次</button><button>股東</button><button>分潤</button><button>風險</button></div><div className="batch-card"><span className="status-light" /><div><strong>{demoBatch.batchCode}</strong><small>預計出貨 {demoBatch.expectedSaleDate}・{demoBatch.currentCount.toLocaleString()} 隻</small></div><b>進行中</b></div><div className="risk-card"><div><small>5M1E 風險</small><strong>31／100</strong></div><div><small>資料完整度</small><strong>83%</strong></div><p>決策輔助指標，不是保險、獸醫或財務保證。</p></div></PixelPanel>}
    </div>
  );
}

function DataLine({ label, value }: { label: string; value: string }) { return <p className="data-line"><span>{label}</span><strong>{value}</strong></p>; }

