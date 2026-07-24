import { capacityTier, type ChickenHouse } from '@chicken-village/domain';
import { PixelPanel } from '@chicken-village/ui';
import { Link } from 'react-router-dom';
import { HouseSprite } from '../components/Sprites';

const plots = [{ left: '12%', top: '69%' }, { left: '39%', top: '70%' }, { left: '67%', top: '69%' }];

export function VillagePage({ houses }: { houses: ChickenHouse[] }) {
  return (
    <div className="page village-page">
      <header className="page-title"><p className="eyebrow">遊戲式導覽地圖</p><h1>我的村莊</h1><p>地圖不顯示任何真實地址。</p></header>
      <div className="village-board">
        <img src="/assets/art/village-map.png" alt="俯視像素村莊，有市場、孵化所、史料館、住宅與三塊雞舍用地" />
        <Link className="map-pin map-pin--market" to="/today"><span>市場</span></Link>
        <Link className="map-pin map-pin--archive" to="/history"><span>史料館</span></Link>
        {houses.slice(0, 3).map((house, index) => <Link className="house-marker" style={plots[index]} to="/houses" key={house.id}><HouseSprite tier={capacityTier(house.designCapacity)} name={house.name} /><span>{house.name}<small>{house.currentBirdCount.toLocaleString()} 隻</small></span></Link>)}
      </div>
      <PixelPanel title="村莊圖例"><div className="legend"><span><i className="dot dot--good" />批次正常</span><span><i className="dot dot--warn" />待補資料</span><span><i className="dot dot--high" />高風險</span></div></PixelPanel>
    </div>
  );
}

