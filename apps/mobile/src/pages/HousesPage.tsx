import { capacityTier, type ChickenHouse, type RiskAnswer, type RiskDimension } from '@chicken-village/domain';
import { PixelPanel, ProgressBar } from '@chicken-village/ui';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { HouseSprite } from '../components/Sprites';
import type { VillageState } from '../hooks/useVillageState';

type Tab = 'overview' | 'batches' | 'shareholders' | 'distributions' | 'risk' | 'edit';
const speciesLabel = { red_feather: '紅羽土雞', black_feather: '黑羽土雞', broiler: '白肉雞', layer: '蛋雞', other: '其他' } as const;
const riskDimensions: Array<[RiskDimension, string]> = [['man', '人員'], ['machine', '設備'], ['material', '物料'], ['method', '方法'], ['measurement', '量測'], ['environment', '環境']];

export function HousesPage({ village, online, isAdmin }: { village: VillageState; online: boolean; isAdmin: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(village.houses.find((house) => !house.archivedAt)?.id ?? '');
  const [tab, setTab] = useState<Tab>('overview');
  const [message, setMessage] = useState('');
  const activeHouses = village.houses.filter((house) => !house.archivedAt);
  const selectedHouse = village.houses.find((house) => house.id === selected) ?? activeHouses[0];
  useEffect(() => { if (!isAdmin && tab === 'edit') setTab('overview'); }, [isAdmin, tab]);
  const metrics = useMemo(() => {
    const totalCapacity = activeHouses.reduce((sum, house) => sum + house.designCapacity, 0);
    const totalBirds = activeHouses.reduce((sum, house) => sum + house.currentBirdCount, 0);
    const selfId = village.shareholders.find((holder) => holder.displayName === '我')?.id;
    const equityBirds = activeHouses.reduce((sum, house) => {
      const bp = village.shareholdings.find((holding) => holding.chickenHouseId === house.id && holding.shareholderId === selfId && !holding.effectiveTo)?.ownershipBasisPoints ?? 0;
      return sum + Math.round(house.currentBirdCount * bp / 10_000);
    }, 0);
    const riskRows = activeHouses.map((house) => village.riskAssessments.filter((risk) => risk.chickenHouseId === house.id).sort((a, b) => b.assessedAt.localeCompare(a.assessedAt))[0]).filter(Boolean);
    const weightedRisk = riskRows.length ? Math.round(riskRows.reduce((sum, risk) => sum + (risk?.finalScore ?? 0), 0) / riskRows.length) : null;
    const confirmed = village.distributions.filter((row) => row.status !== 'draft' && row.status !== 'reversed').reduce((sum, row) => sum + row.totalAmountTwd, 0);
    const unpaid = village.distributions.filter((row) => ['confirmed', 'partially_paid'].includes(row.status)).flatMap((row) => row.entries).reduce((sum, entry) => sum + entry.allocatedAmountTwd + entry.adjustmentAmountTwd - entry.paidAmountTwd, 0);
    const nextSale = village.batches.map((row) => row.expectedSaleDate).filter((date): date is string => Boolean(date)).sort()[0] ?? '尚未設定';
    return { totalCapacity, totalBirds, equityBirds, weightedRisk, confirmed, unpaid, highRisk: riskRows.filter((row) => (row?.finalScore ?? 0) >= 50).length, nextSale };
  }, [activeHouses, village]);

  function run(action: () => void, success: string) { try { action(); setMessage(success); } catch (error) { setMessage(error instanceof Error ? error.message : '操作失敗'); } }
  async function submitHouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const now = new Date().toISOString();
    const house: ChickenHouse = { id: crypto.randomUUID(), organizationId: 'org-public', revision: 1, createdAt: now, updatedAt: now, deletedAt: null, deviceId: 'admin-web', operationId: crypto.randomUUID(), syncStatus: 'synced', name: String(data.get('name')), species: String(data.get('species')) as ChickenHouse['species'], designCapacity: Number(data.get('capacity')), currentBirdCount: 0, fosterFarmerId: null, archivedAt: null };
    try { await village.addHouse(house); setSelected(house.id); form.reset(); setShowForm(false); setMessage('雞舍已寫入 Firebase，所有訪客都會看到最新資料。'); } catch (error) { setMessage(error instanceof Error ? error.message : '新增雞舍失敗。'); }
  }

  return <div className="page houses-page">
    <header className="page-title inline-title"><div><p className="eyebrow">公開雞舍資訊</p><h1>雞舍一覽</h1></div>{isAdmin ? <button className="primary-button compact" onClick={() => setShowForm((value) => !value)}>＋ 新增</button> : <Link className="admin-entry-chip" to="/admin">管理員</Link>}</header>
    <div className={`access-banner ${isAdmin ? 'admin' : 'public'}`}><strong>{isAdmin ? '管理員模式' : '公開瀏覽模式'}</strong><span>{isAdmin ? '可新增、編輯與封存雞舍資料。' : '所有人可瀏覽；資料異動僅限管理員。'}</span></div>
    {!online && isAdmin && <div className="offline-draft-note" role="status">管理員寫入需要網路連線；目前只能瀏覽已快取資料。</div>}
    {message && <div className="operation-message" role="status"><span>{message}</span><button aria-label="關閉訊息" onClick={() => setMessage('')}>×</button></div>}
    {showForm && <form className="house-form" onSubmit={(event) => { void submitHouse(event); }}><label>雞舍名稱<input required name="name" maxLength={30} /></label><SpeciesSelect /><label>設計容量<input required name="capacity" type="number" min="1" max="1000000" /></label><button className="primary-button" type="submit">保存本機草稿</button><small>容量會決定村莊中的建築規模。</small></form>}
    <div className="summary-grid summary-grid--wide">
      <Metric label="投資雞舍" value={String(activeHouses.length)} suffix="舍" /><Metric label="設計總容量" value={metrics.totalCapacity.toLocaleString()} suffix="隻" /><Metric label="當前在養" value={metrics.totalBirds.toLocaleString()} suffix="隻" /><Metric label="權益雞數" value={metrics.equityBirds.toLocaleString()} suffix="依持股計算" />
      <Metric label="已確認分潤" value={`$${metrics.confirmed.toLocaleString()}`} suffix="TWD" /><Metric label="待付分潤" value={`$${metrics.unpaid.toLocaleString()}`} suffix="TWD" /><Metric label="加權風險" value={metrics.weightedRisk === null ? '—' : String(metrics.weightedRisk)} suffix={`高風險 ${metrics.highRisk} 舍`} /><Metric label="下次預計出貨" value={metrics.nextSale} suffix={`未同步 ${village.unsyncedCount} 筆`} />
    </div>
    <div className="house-switcher">{activeHouses.map((house) => <button className={selectedHouse?.id === house.id ? 'selected' : ''} onClick={() => { setSelected(house.id); setTab('overview'); }} key={house.id}>{house.name}</button>)}</div>
    {selectedHouse && <PixelPanel className="house-detail">
      <div className="house-detail__hero"><HouseSprite tier={capacityTier(selectedHouse.designCapacity)} name={selectedHouse.name} /><div><DataLine label="雞種" value={speciesLabel[selectedHouse.species]} /><DataLine label="設計容量" value={`${selectedHouse.designCapacity.toLocaleString()} 隻`} /><DataLine label="在養數" value={`${selectedHouse.currentBirdCount.toLocaleString()} 隻`} /></div></div>
      <ProgressBar value={selectedHouse.designCapacity ? selectedHouse.currentBirdCount / selectedHouse.designCapacity * 100 : 0} label="雞舍在養容量使用率" />
      <div className="detail-tabs" role="tablist">{([['overview', '總覽'], ['batches', '批次'], ['shareholders', '股東'], ['distributions', '分潤'], ['risk', '風險'], ...(isAdmin ? [['edit', '編輯'] as [Tab, string]] : [])] as Array<[Tab, string]>).map(([id, label]) => <button role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}>{label}</button>)}</div>
      {tab === 'overview' && <Overview houseId={selectedHouse.id} village={village} />}
      {tab === 'batches' && <Batches house={selectedHouse} village={village} onMessage={setMessage} editable={isAdmin} />}
      {tab === 'shareholders' && <Shareholders houseId={selectedHouse.id} village={village} onMessage={setMessage} editable={isAdmin} />}
      {tab === 'distributions' && <Distributions houseId={selectedHouse.id} village={village} online={online} run={run} editable={isAdmin} />}
      {tab === 'risk' && <RiskForm houseId={selectedHouse.id} village={village} onMessage={setMessage} editable={isAdmin} />}
      {tab === 'edit' && isAdmin && <EditHouse house={selectedHouse} village={village} onMessage={setMessage} />}
    </PixelPanel>}
  </div>;
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix: string }) { return <PixelPanel><small>{label}</small><strong>{value}</strong><span>{suffix}</span></PixelPanel>; }
function DataLine({ label, value }: { label: string; value: string }) { return <p className="data-line"><span>{label}</span><strong>{value}</strong></p>; }
function SpeciesSelect() { return <label>雞種<select name="species"><option value="red_feather">紅羽土雞</option><option value="black_feather">黑羽土雞</option><option value="broiler">白肉雞</option><option value="layer">蛋雞</option><option value="other">其他</option></select></label>; }

function Overview({ houseId, village }: { houseId: string; village: VillageState }) {
  const batch = village.batches.filter((row) => row.chickenHouseId === houseId).sort((a, b) => b.placementDate.localeCompare(a.placementDate))[0];
  const risk = village.riskAssessments.filter((row) => row.chickenHouseId === houseId).sort((a, b) => b.assessedAt.localeCompare(a.assessedAt))[0];
  return <div className="operation-stack">{batch ? <div className="batch-card"><span className="status-light" /><div><strong>{batch.batchCode}</strong><small>預計出貨 {batch.expectedSaleDate ?? '未設定'}・{batch.currentCount.toLocaleString()} 隻</small></div><b>{batch.status === 'draft' ? '草稿' : '進行中'}</b></div> : <p className="empty-note">尚無批次。</p>}<div className="risk-card"><div><small>5M1E 風險</small><strong>{risk?.finalScore ?? '—'}／100</strong></div><div><small>資料完整度</small><strong>{Math.round((risk?.completenessBasisPoints ?? 0) / 100)}%</strong></div><p>決策輔助指標，不是保險、獸醫或財務保證。</p></div><small className="audit-caption">本機稽核事件 {village.auditEvents.filter((event) => event.entityId === houseId).length} 筆</small></div>;
}

function Batches({ house, village, onMessage, editable }: { house: ChickenHouse; village: VillageState; onMessage: (message: string) => void; editable: boolean }) {
  const rows = village.batches.filter((row) => row.chickenHouseId === house.id);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); village.addBatch(house.id, { batchCode: String(data.get('code')), species: house.species, placedCount: Number(data.get('count')), placementDate: String(data.get('placementDate')), expectedSaleDate: String(data.get('saleDate')) || null }); event.currentTarget.reset(); onMessage('批次草稿已保存在本機。'); }
  return <div className="operation-stack">{rows.map((row) => <div className="batch-card" key={row.id}><span className="status-light" /><div><strong>{row.batchCode}</strong><small>{row.placementDate} 入雛・{row.currentCount.toLocaleString()} 隻・預售 {row.expectedSaleDate ?? '未定'}</small></div><b>{row.status === 'draft' ? '草稿' : row.status}</b></div>)}{editable && <form className="inline-operation-form" onSubmit={submit}><h3>新增批次草稿</h3><label>批次代碼<input required name="code" /></label><label>入雛數<input required min="1" type="number" name="count" /></label><label>入雛日<input required type="date" name="placementDate" /></label><label>預計出貨<input type="date" name="saleDate" /></label><button className="secondary-button">保存草稿</button></form>}</div>;
}

function Shareholders({ houseId, village, onMessage, editable }: { houseId: string; village: VillageState; onMessage: (message: string) => void; editable: boolean }) {
  const holdings = village.shareholdings.filter((row) => row.chickenHouseId === houseId && !row.effectiveTo);
  const total = holdings.reduce((sum, row) => sum + row.profitShareBasisPoints, 0);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const bp = Math.round(Number(data.get('percent')) * 100); if (bp <= 0 || bp > 10_000) { onMessage('比例必須介於 0.01% 到 100%。'); return; } village.addShareholder(houseId, String(data.get('name')), bp); event.currentTarget.reset(); onMessage('股東與持股草稿已建立，正式啟用前需連線確認。'); }
  return <div className="operation-stack"><div className={`allocation-total ${total === 10_000 ? 'valid' : 'invalid'}`}>分潤比例合計 <strong>{(total / 100).toFixed(2)}%</strong>{total !== 10_000 && <small>建立分潤前必須剛好 100%</small>}</div>{holdings.map((holding) => { const person = village.shareholders.find((row) => row.id === holding.shareholderId); return <div className="holding-row" key={holding.id}><span>{person?.displayName ?? '未知股東'}<small>{person?.referenceCode}</small></span><strong>{(holding.profitShareBasisPoints / 100).toFixed(2)}%</strong><i>{holding.syncStatus}</i></div>; })}{editable && <form className="inline-operation-form" onSubmit={submit}><h3>新增股東持股草稿</h3><label>顯示名稱<input required name="name" /></label><label>分潤比例（%）<input required min="0.01" max="100" step="0.01" type="number" name="percent" /></label><button className="secondary-button">保存本機草稿</button></form>}</div>;
}

function Distributions({ houseId, village, online, run, editable }: { houseId: string; village: VillageState; online: boolean; run: (action: () => void, success: string) => void; editable: boolean }) {
  const rows = village.distributions.filter((row) => row.chickenHouseId === houseId && !row.reversalOfId);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); run(() => village.createDistribution(houseId, String(data.get('period')), Number(data.get('amount'))), '分潤草稿已依整數 TWD 與最大餘數法分配。'); event.currentTarget.reset(); }
  return <div className="operation-stack">{rows.map((row) => <article className="distribution-card" key={row.id}><header><div><strong>{row.periodLabel}</strong><small>{row.status}・revision {row.revision}</small></div><b>${row.totalAmountTwd.toLocaleString()}</b></header>{row.entries.map((entry) => { const holder = village.shareholders.find((person) => person.id === entry.shareholderId); const due = entry.allocatedAmountTwd + entry.adjustmentAmountTwd - entry.paidAmountTwd; return <div className="distribution-entry" key={entry.id}><span>{holder?.displayName ?? '未知'}<small>已付 ${entry.paidAmountTwd.toLocaleString()}</small></span><strong>待付 ${due.toLocaleString()}</strong>{editable && due > 0 && ['confirmed', 'partially_paid'].includes(row.status) && <button disabled={!online} onClick={() => run(() => village.payDistribution(row.id, entry.id, due, online), '付款已登記並寫入稽核紀錄。')}>付清</button>}</div>; })}{editable && <footer>{row.status === 'draft' && <button disabled={!online} onClick={() => run(() => village.confirmDistributionRecord(row.id, online), '分潤已確認並鎖定。')}>連線確認</button>}{['confirmed', 'partially_paid', 'paid'].includes(row.status) && <button className="danger-button" disabled={!online} onClick={() => run(() => village.reverseDistributionRecord(row.id, online), '原分潤已沖銷並建立負數沖銷單。')}>沖銷</button>}</footer>}</article>)}{editable && <form className="inline-operation-form" onSubmit={submit}><h3>建立分潤草稿</h3><label>期間<input id="distribution-period" required name="period" placeholder="例如 2026 Q3" /></label><label>總額（整數 TWD）<input required min="1" step="1" type="number" name="amount" /></label><button className="secondary-button">計算並保存草稿</button><small>離線可建立草稿；確認、付款與沖銷必須連線。</small></form>}</div>;
}

function RiskForm({ houseId, village, onMessage, editable }: { houseId: string; village: VillageState; onMessage: (message: string) => void; editable: boolean }) {
  const latest = village.riskAssessments.filter((row) => row.chickenHouseId === houseId).sort((a, b) => b.assessedAt.localeCompare(a.assessedAt))[0];
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const answers: RiskAnswer[] = riskDimensions.map(([dimension]) => ({ questionId: dimension, dimension, score: data.get(dimension) === '' ? null : Number(data.get(dimension)), note: String(data.get(`${dimension}-note`) ?? '') })); village.saveRisk(houseId, answers, String(data.get('notes'))); onMessage('5M1E 風險草稿已保存並記錄模型版本。'); }
  if (!editable) return <div className="risk-readonly"><div className="risk-form__summary"><strong>最新：{latest?.finalScore ?? '—'}／100</strong><span>完整度 {Math.round((latest?.completenessBasisPoints ?? 0) / 100)}%・模型 {latest?.modelVersion ?? '5m1e-v1'}</span></div>{riskDimensions.map(([dimension, label]) => <div key={dimension}><span>{label}</span><strong>{latest?.dimensionScores[dimension] ?? '—'}</strong></div>)}{latest?.notes ? <p>{latest.notes}</p> : null}</div>;
  return <form className="risk-form" onSubmit={submit}><div className="risk-form__summary"><strong>最新：{latest?.finalScore ?? '—'}／100</strong><span>完整度 {Math.round((latest?.completenessBasisPoints ?? 0) / 100)}%・模型 {latest?.modelVersion ?? '5m1e-v1'}</span></div>{riskDimensions.map(([dimension, label]) => <label key={dimension}>{label}風險（0–100）<input name={dimension} type="number" min="0" max="100" defaultValue={latest?.dimensionScores[dimension] ?? ''} /><input name={`${dimension}-note`} placeholder={`${label}備註（選填）`} /></label>)}<label className="full-field">總體備註<textarea name="notes" defaultValue={latest?.notes} /></label><button className="primary-button">重算並保存草稿</button><small>缺值會降低完整度；權重與 modelVersion 會與評估一併保存。</small></form>;
}

function EditHouse({ house, village, onMessage }: { house: ChickenHouse; village: VillageState; onMessage: (message: string) => void }) {
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { await village.updateHouse(house.id, { name: String(data.get('name')), species: String(data.get('species')) as ChickenHouse['species'], designCapacity: Number(data.get('capacity')), currentBirdCount: Number(data.get('birds')) }); onMessage('雞舍修改已寫入 Firebase。'); } catch (error) { onMessage(error instanceof Error ? error.message : '修改失敗。'); } }
  return <div className="operation-stack"><form className="inline-operation-form" onSubmit={(event) => { void submit(event); }}><label>雞舍名稱<input required name="name" defaultValue={house.name} /></label><SpeciesSelect /><label>設計容量<input required min="1" type="number" name="capacity" defaultValue={house.designCapacity} /></label><label>當前在養<input required min="0" type="number" name="birds" defaultValue={house.currentBirdCount} /></label><button className="primary-button">保存至 Firebase</button></form><button className="danger-button archive-button" onClick={() => { void village.archiveHouse(house.id).then(() => onMessage('雞舍已封存並同步給所有訪客。')).catch((error: unknown) => onMessage(error instanceof Error ? error.message : '封存失敗。')); }}>封存雞舍</button></div>;
}
