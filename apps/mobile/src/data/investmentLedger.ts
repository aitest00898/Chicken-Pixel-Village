export interface InvestmentSettlementLine {
  label: string;
  amountTwd: number;
}

export interface InvestmentSettlement {
  id: string;
  paidOn: string;
  farmProfitLossTwd: number;
  teamNetIncomeTwd: number;
  feedConversionRate: number;
  survivalRatePercent: number;
  caretakerSettlementPayableTwd: number;
  caretakerProfitSharePayableTwd?: number;
  paymentMemo: string;
  lines: InvestmentSettlementLine[];
}

export interface InvestmentRound {
  id: string;
  name: string;
  teamSharePercent: number;
  caretaker: string | null;
  settlements: InvestmentSettlement[];
}

export const investmentLedgerUpdatedOn = '2026-07-11';
export const investmentMembers = ['SUGAR', '何先生', '承蠔'] as const;

export const investmentRounds: InvestmentRound[] = [
  {
    id: 'lin-erlun',
    name: '林志騰二林場',
    teamSharePercent: 10,
    caretaker: '翁崇銘',
    settlements: [
      {
        id: 'lin-erlun-2025-12-17',
        paidOn: '2025-12-17',
        farmProfitLossTwd: 688_462,
        teamNetIncomeTwd: 68_846.2,
        feedConversionRate: 2.32,
        survivalRatePercent: 93,
        caretakerSettlementPayableTwd: 425_946,
        paymentMemo: '匯款楊佳惠；應付金額已含代養、盈餘分配及扣款。',
        lines: [
          { label: '代養金', amountTwd: 216_000 },
          { label: '換肉率獎金', amountTwd: 24_045 },
          { label: '磅費', amountTwd: 3_300 },
          { label: '飲料', amountTwd: 1_200 },
          { label: '清洗雞舍零件', amountTwd: 3_820 },
          { label: '牆面設備整修', amountTwd: 900 },
          { label: '電箱損壞賠償費', amountTwd: 12_878 },
          { label: '代養戶盈餘分配', amountTwd: 344_231 },
          { label: '扣實習工資', amountTwd: -72_428 },
          { label: '扣預付代養金', amountTwd: -108_000 },
        ],
      },
      {
        id: 'lin-erlun-2026-04-15',
        paidOn: '2026-04-15',
        farmProfitLossTwd: 1_166_129,
        teamNetIncomeTwd: 116_612.9,
        feedConversionRate: 2.38,
        survivalRatePercent: 92,
        caretakerSettlementPayableTwd: 689_779,
        paymentMemo: '匯款楊佳惠；燈泡含東勢場、二林場各一筆。',
        lines: [
          { label: '代養金', amountTwd: 228_448 },
          { label: '換肉率獎金', amountTwd: 28_556 },
          { label: '飲料、便當', amountTwd: 825 },
          { label: '噴霧機管路施工', amountTwd: 900 },
          { label: '深水馬達維修', amountTwd: 13_100 },
          { label: '牆面設備整修', amountTwd: 1_080 },
          { label: '燈泡（東勢場）', amountTwd: 1_025 },
          { label: '燈泡（二林場）', amountTwd: 1_025 },
          { label: '中古冰箱', amountTwd: 5_900 },
          { label: '代養戶盈餘分配', amountTwd: 583_064 },
          { label: '扣實習工資', amountTwd: -59_000 },
          { label: '扣預付代養金', amountTwd: -115_144 },
        ],
      },
    ],
  },
  {
    id: 'lin-dongshi',
    name: '林志騰東勢場',
    teamSharePercent: 20,
    caretaker: '翁崇銘',
    settlements: [
      {
        id: 'lin-dongshi-2026-03-25',
        paidOn: '2026-03-25',
        farmProfitLossTwd: 351_709,
        teamNetIncomeTwd: 70_341.8,
        feedConversionRate: 2.26,
        survivalRatePercent: 92,
        caretakerSettlementPayableTwd: 74_918,
        caretakerProfitSharePayableTwd: 140_684,
        paymentMemo: '匯款楊佳惠；代養結算與盈餘分配分開列示。',
        lines: [
          { label: '代養金', amountTwd: 105_000 },
          { label: '換肉率獎金', amountTwd: 17_408 },
          { label: '磅費', amountTwd: 750 },
          { label: '便當', amountTwd: 660 },
          { label: '修理門窗', amountTwd: 3_600 },
          { label: '扣預付代養金', amountTwd: -52_500 },
        ],
      },
    ],
  },
  { id: 'liao-caiyi', name: '廖纔藝場', teamSharePercent: 10, caretaker: null, settlements: [] },
  { id: 'chen-longtan', name: '陳駿榜龍潭場', teamSharePercent: 5, caretaker: null, settlements: [] },
  {
    id: 'hong-xiumei',
    name: '洪秀美場',
    teamSharePercent: 25,
    caretaker: '莊洪秀美',
    settlements: [
      {
        id: 'hong-xiumei-2026-07-15',
        paidOn: '2026-07-15',
        farmProfitLossTwd: -84_000,
        teamNetIncomeTwd: -21_000,
        feedConversionRate: 2.479,
        survivalRatePercent: 91,
        caretakerSettlementPayableTwd: 310_711,
        paymentMemo: '付現洪秀美；紅羽未達換肉率 2.475，獎金取消。',
        lines: [
          { label: '代養金', amountTwd: 540_000 },
          { label: '磅費', amountTwd: 1_000 },
          { label: '電費', amountTwd: 35_921 },
          { label: '溯源標籤', amountTwd: 1_515 },
          { label: '餐費', amountTwd: 400 },
          { label: '化製費', amountTwd: 7_000 },
          { label: '廢棄物清運費', amountTwd: 4_000 },
          { label: '水塔整修', amountTwd: 4_500 },
          { label: '飼料款管線整修', amountTwd: 5_600 },
          { label: '電纜線', amountTwd: 3_300 },
          { label: '噴嘴', amountTwd: 2_675 },
          { label: '扣預付代養金', amountTwd: -270_000 },
          { label: '扣虧損應收', amountTwd: -25_200 },
        ],
      },
    ],
  },
  {
    id: 'huang-taibao',
    name: '黃惠玲太保場',
    teamSharePercent: 10,
    caretaker: '合泰宏',
    settlements: [
      {
        id: 'huang-taibao-2026-02-25',
        paidOn: '2026-02-25',
        farmProfitLossTwd: 1_207_909,
        teamNetIncomeTwd: 120_790.9,
        feedConversionRate: 2.54,
        survivalRatePercent: 94,
        caretakerSettlementPayableTwd: 532_451,
        caretakerProfitSharePayableTwd: 241_582,
        paymentMemo: '付現黃惠玲；盈餘與代養金分開裝袋。',
        lines: [
          { label: '代養金', amountTwd: 640_000 },
          { label: '磅費', amountTwd: 3_900 },
          { label: '水費', amountTwd: 4_932 },
          { label: '電費', amountTwd: 133_459 },
          { label: '溯源標籤', amountTwd: 2_160 },
          { label: '餐費、飲料', amountTwd: 4_000 },
          { label: '扣預付代養金', amountTwd: -256_000 },
        ],
      },
      {
        id: 'huang-taibao-2026-06-17',
        paidOn: '2026-06-17',
        farmProfitLossTwd: 641_478,
        teamNetIncomeTwd: 64_147.8,
        feedConversionRate: 2.39,
        survivalRatePercent: 95,
        caretakerSettlementPayableTwd: 405_000,
        caretakerProfitSharePayableTwd: 192_443,
        paymentMemo: '付現黃惠玲；紅羽達 2.40 以下，每隻獎金 2 元。',
        lines: [
          { label: '代養金', amountTwd: 640_000 },
          { label: '換肉率獎金', amountTwd: 59_990 },
          { label: '磅費', amountTwd: 3_400 },
          { label: '水費', amountTwd: 6_921 },
          { label: '電費', amountTwd: 9_883 },
          { label: '溯源標籤', amountTwd: 2_240 },
          { label: '餐費、飲料', amountTwd: 4_000 },
          { label: '扣預付代養金', amountTwd: -320_000 },
          { label: '扣上批水電', amountTwd: -1_434 },
        ],
      },
    ],
  },
  { id: 'lin-kaiwei', name: '林楷威場', teamSharePercent: 10, caretaker: null, settlements: [] },
  { id: 'hong-jiaqing', name: '洪嘉卿場', teamSharePercent: 20, caretaker: null, settlements: [] },
];
