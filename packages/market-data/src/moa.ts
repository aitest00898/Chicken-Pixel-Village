import type { HistoricalMarketItem, HistoryPoint, MarketBundle, MarketFrequency, MarketHistoryResult, MarketItem, MarketRecord, RawSnapshot } from './types';

const BASE = 'https://data.moa.gov.tw/api/v1';
export const MOA_PARSER_VERSION = 'moa-poultry-v1.0.0';
const ASSOCIATION_BULLETIN_ENDPOINT = 'association-bulletin';
const CENTRAL_LIVESTOCK_MONTHLY_ENDPOINT = 'central-livestock-monthly';
const ASSOCIATION_BULLETIN_URL = 'https://www.poultry.org.tw/';
const ASSOCIATION_BULLETIN_SOURCE = '養雞協會日報表（附圖）';
const ASSOCIATION_BULLETIN_PARSER_VERSION = 'association-bulletin-v1.1.0';
const CENTRAL_LIVESTOCK_MONTHLY_URL = 'https://www.naif.org.tw/';
const CENTRAL_LIVESTOCK_MONTHLY_SOURCE = '中央畜產會「台灣地區畜禽產品價格調查」月報';
const CENTRAL_LIVESTOCK_MONTHLY_PARSER_VERSION = 'central-livestock-monthly-v1.0.0';

interface MoaResponse<T> { RS?: string; Data?: T[]; Next?: boolean }
interface RedRow {
  TransDate?: string; RedFeather_N_M?: string; RedFeather_N_F?: string; RedFeather_C_M?: string; RedFeather_C_F?: string; RedFeather_S_M?: string; RedFeather_S_F?: string;
}
interface BlackRow { TransDate?: string; BlackFeather_S_M?: string; BlackFeather_S_F?: string }
interface BroilerRow {
  TransDate?: string; 'TaijinPrice_2.0kgup'?: string; 'TaijinPrice_1.75kg_1.95kg'?: string; Store_KP_TaijinPrice?: string; egg_Price?: string; egg_Producer_Price?: string;
}

type PoultryRow = RedRow & BlackRow & BroilerRow & Record<string, string | undefined>;

function bulletinRow(TransDate: string, SourceDocument: string, values: PoultryRow): PoultryRow {
  return {
    TransDate,
    SourceDocument,
    fighting_east_free_female: '88',
    fighting_capon_all: '120',
    heritage_capon_all: '85',
    ...values,
  };
}

const associationBulletinRows: PoultryRow[] = [
  bulletinRow('2025/06/19', 'BC1293B9-D829-496E-9571-9D27B2D8F733.jpeg', {
    black_north_free_male: '62', black_north_free_female: '62', black_north_caged_male: '56', black_north_caged_female: '56',
    black_central_free_male: '62', black_central_free_female: '62', black_central_caged_male: '56', black_central_caged_female: '56',
    black_south_free_male: '64', black_south_free_female: '62', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '56', golden_central_female: '56',
    heritage_north_male: '62', heritage_north_female: '62', heritage_central_male: '62', heritage_central_female: '62', heritage_south_male: '62', heritage_south_female: '62',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '88', fighting_north_caged_female: '83', fighting_central_free_female: '88', fighting_central_caged_female: '83',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '62', zhubei_imitation_hen_all: '77', zhubei_imitation_capon_all: '123',
  }),
  bulletinRow('2025/10/16', 'B4D1FFD9-8071-4C75-9A16-B0D79435D43B.jpeg', {
    black_north_free_male: '61', black_north_free_female: '61', black_north_caged_male: '47', black_north_caged_female: '47',
    black_central_free_male: '61', black_central_free_female: '61', black_central_caged_male: '47', black_central_caged_female: '47',
    black_south_free_male: '64', black_south_free_female: '64', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '46', golden_central_female: '46', heritage_north_male: '61', heritage_north_female: '61', heritage_central_male: '61', heritage_central_female: '61', heritage_south_male: '61', heritage_south_female: '61',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '88', fighting_north_caged_female: '83', fighting_central_free_female: '88', fighting_central_caged_female: '83',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '62', zhubei_imitation_hen_all: '77', zhubei_imitation_capon_all: '123',
  }),
  bulletinRow('2025/10/24', 'F548B773-DB49-46BD-920B-DD3860719E8E.jpeg', {
    black_north_free_male: '59', black_north_free_female: '59', black_north_caged_male: '45', black_north_caged_female: '45',
    black_central_free_male: '59', black_central_free_female: '59', black_central_caged_male: '45', black_central_caged_female: '45',
    black_south_free_male: '62', black_south_free_female: '62', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '46', golden_central_female: '46', heritage_north_male: '61', heritage_north_female: '61', heritage_central_male: '61', heritage_central_female: '61', heritage_south_male: '61', heritage_south_female: '61',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '92', fighting_north_caged_female: '87', fighting_central_free_female: '92', fighting_central_caged_female: '87',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '60', zhubei_imitation_hen_all: '77', zhubei_imitation_capon_all: '123',
  }),
  bulletinRow('2025/10/25', '594EEA7B-1C0E-462D-A793-F99E22E71D4C.jpeg', {
    black_north_free_male: '59', black_north_free_female: '59', black_north_caged_male: '46', black_north_caged_female: '46',
    black_central_free_male: '59', black_central_free_female: '59', black_central_caged_male: '46', black_central_caged_female: '46',
    black_south_free_male: '62', black_south_free_female: '62', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '47', golden_central_female: '47', heritage_north_male: '61', heritage_north_female: '61', heritage_central_male: '61', heritage_central_female: '61', heritage_south_male: '61', heritage_south_female: '61',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '92', fighting_north_caged_female: '87', fighting_central_free_female: '92', fighting_central_caged_female: '87',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '60', zhubei_imitation_hen_all: '77', zhubei_imitation_capon_all: '123',
  }),
  bulletinRow('2025/10/27', 'D2AB69B4-82CF-4E7B-ACF6-5A38B8FB09DE.jpeg', {
    black_north_free_male: '59', black_north_free_female: '59', black_north_caged_male: '47', black_north_caged_female: '47',
    black_central_free_male: '59', black_central_free_female: '59', black_central_caged_male: '47', black_central_caged_female: '47',
    black_south_free_male: '62', black_south_free_female: '62', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '48', golden_central_female: '48', heritage_north_male: '61', heritage_north_female: '61', heritage_central_male: '61', heritage_central_female: '61', heritage_south_male: '61', heritage_south_female: '61',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '94', fighting_north_caged_female: '89', fighting_central_free_female: '94', fighting_central_caged_female: '89',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '62', zhubei_imitation_hen_all: '79', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/10/28', '64EB4DDC-A9D8-4127-A2E9-92310B59075C.jpeg', {
    black_north_free_male: '59', black_north_free_female: '59', black_north_caged_male: '47', black_north_caged_female: '47',
    black_central_free_male: '59', black_central_free_female: '59', black_central_caged_male: '47', black_central_caged_female: '47',
    black_south_free_male: '62', black_south_free_female: '62', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '48', golden_central_female: '48', heritage_north_male: '61', heritage_north_female: '61', heritage_central_male: '61', heritage_central_female: '61', heritage_south_male: '61', heritage_south_female: '61',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '62', zhubei_imitation_hen_all: '81', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/10/31', 'FCFF0763-4A38-4E9C-8607-587CF7DD23CB.jpeg', {
    black_north_free_male: '59', black_north_free_female: '59', black_north_caged_male: '48', black_north_caged_female: '48',
    black_central_free_male: '59', black_central_free_female: '59', black_central_caged_male: '48', black_central_caged_female: '48',
    black_south_free_male: '62', black_south_free_female: '62', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '50', golden_central_female: '50', heritage_north_male: '61', heritage_north_female: '61', heritage_central_male: '61', heritage_central_female: '61', heritage_south_male: '61', heritage_south_female: '61',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '62', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/11/01', '7CF618BF-9689-47A1-BE1E-4BA80F519FB6.jpeg', {
    black_north_free_male: '59', black_north_free_female: '59', black_north_caged_male: '49', black_north_caged_female: '49',
    black_central_free_male: '59', black_central_free_female: '59', black_central_caged_male: '49', black_central_caged_female: '49',
    black_south_free_male: '62', black_south_free_female: '62', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '51', golden_central_female: '51', heritage_north_male: '61', heritage_north_female: '61', heritage_central_male: '61', heritage_central_female: '61', heritage_south_male: '61', heritage_south_female: '61',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '62', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/11/03', '1BB4ACD5-E692-4737-8CF7-93CB41359C89.jpeg', {
    black_north_free_male: '59', black_north_free_female: '59', black_north_caged_male: '50', black_north_caged_female: '50',
    black_central_free_male: '59', black_central_free_female: '59', black_central_caged_male: '50', black_central_caged_female: '50',
    black_south_free_male: '62', black_south_free_female: '62', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '52', golden_central_female: '52', heritage_north_male: '61', heritage_north_female: '61', heritage_central_male: '61', heritage_central_female: '61', heritage_south_male: '61', heritage_south_female: '61',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '64', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/11/05', '69E4418B-45CB-4068-8D5A-D0D7054D4A8E.jpeg', {
    black_north_free_male: '61', black_north_free_female: '61', black_north_caged_male: '51', black_north_caged_female: '51',
    black_central_free_male: '61', black_central_free_female: '61', black_central_caged_male: '51', black_central_caged_female: '51',
    black_south_free_male: '64', black_south_free_female: '60', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '53', golden_central_female: '53', heritage_north_male: '63', heritage_north_female: '63', heritage_central_male: '63', heritage_central_female: '63', heritage_south_male: '63', heritage_south_female: '63',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '64', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/11/06', '6494B7C9-FD2D-48C7-B9BB-6C66353887AD.jpeg', {
    black_north_free_male: '63', black_north_free_female: '63', black_north_caged_male: '52', black_north_caged_female: '52',
    black_central_free_male: '63', black_central_free_female: '63', black_central_caged_male: '52', black_central_caged_female: '52',
    black_south_free_male: '64', black_south_free_female: '60', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '53', golden_central_female: '53', heritage_north_male: '65', heritage_north_female: '65', heritage_central_male: '65', heritage_central_female: '65', heritage_south_male: '65', heritage_south_female: '65',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '69', guinea_central_female: '69', wenchang_north: '64', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/11/20', '3136F20A-94C2-400F-A917-3AAFF7B661B3.jpeg', {
    black_north_free_male: '64', black_north_free_female: '60', black_north_caged_male: '55', black_north_caged_female: '52',
    black_central_free_male: '64', black_central_free_female: '60', black_central_caged_male: '55', black_central_caged_female: '52',
    black_south_free_male: '64', black_south_free_female: '60', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '55', golden_central_female: '55', heritage_north_male: '65', heritage_north_female: '65', heritage_central_male: '65', heritage_central_female: '65', heritage_south_male: '65', heritage_south_female: '65',
    silkie_central: '66', silkie_south: '68', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '71', guinea_central_female: '71', wenchang_north: '64', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/11/24', 'E458107E-91BA-49AC-8629-C7F58DE85E76.jpeg', {
    black_north_free_male: '64', black_north_free_female: '60', black_north_caged_male: '56', black_north_caged_female: '52',
    black_central_free_male: '64', black_central_free_female: '60', black_central_caged_male: '56', black_central_caged_female: '52',
    black_south_free_male: '65', black_south_free_female: '60', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '56', golden_central_female: '56', heritage_north_male: '65', heritage_north_female: '65', heritage_central_male: '65', heritage_central_female: '65', heritage_south_male: '65', heritage_south_female: '65',
    silkie_central: '66', silkie_south: '68', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '71', guinea_central_female: '71', wenchang_north: '66', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2025/12/08', '1B536DED-8725-4F83-9B07-B54C88150925.jpeg', {
    black_north_free_male: '66', black_north_free_female: '60', black_north_caged_male: '57', black_north_caged_female: '53',
    black_central_free_male: '66', black_central_free_female: '60', black_central_caged_male: '57', black_central_caged_female: '53',
    black_south_free_male: '68', black_south_free_female: '60', black_east_free_male: '63', black_east_free_female: '63',
    golden_central_male: '58', golden_central_female: '57', heritage_north_male: '66', heritage_north_female: '60', heritage_central_male: '66', heritage_central_female: '60', heritage_south_male: '66', heritage_south_female: '60',
    silkie_central: '66', silkie_south: '68', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '71', guinea_central_female: '71', wenchang_north: '66', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2026/01/30', '392034CC-2D8E-47B4-AE6C-0DF847C8425E.jpeg', {
    black_north_free_male: '66', black_north_free_female: '60', black_north_caged_male: '58', black_north_caged_female: '55',
    black_central_free_male: '66', black_central_free_female: '60', black_central_caged_male: '58', black_central_caged_female: '55',
    black_south_free_male: '70', black_south_free_female: '63', black_east_free_male: '64', black_east_free_female: '64',
    golden_central_male: '58', golden_central_female: '57', heritage_north_male: '66', heritage_north_female: '60', heritage_central_male: '66', heritage_central_female: '60', heritage_south_male: '66', heritage_south_female: '60',
    silkie_central: '66', silkie_south: '68', fighting_north_free_female: '97', fighting_north_caged_female: '92', fighting_central_free_female: '97', fighting_central_caged_female: '92',
    guinea_north_female: '74', guinea_central_female: '74', wenchang_north: '66', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2026/03/16', 'D12CC850-D1BA-41EE-8E3E-1903A91D88E5.jpeg', {
    black_north_free_male: '62', black_north_free_female: '62', black_north_caged_male: '58', black_north_caged_female: '55',
    black_central_free_male: '62', black_central_free_female: '62', black_central_caged_male: '58', black_central_caged_female: '55',
    black_south_free_male: '65', black_south_free_female: '65', black_east_free_male: '64', black_east_free_female: '64',
    golden_north_male: '58', golden_north_female: '57', golden_central_male: '58', golden_central_female: '57',
    heritage_north_male: '62', heritage_north_female: '62', heritage_central_male: '62', heritage_central_female: '62', heritage_south_male: '62', heritage_south_female: '62',
    silkie_central: '66', silkie_south: '68', fighting_north_free_female: '99', fighting_north_caged_female: '94', fighting_central_free_female: '99', fighting_central_caged_female: '94',
    guinea_north_female: '74', guinea_central_female: '74', wenchang_north: '66', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2026/06/01', 'B8FFA345-CA63-405E-81D1-CA45F5542A91.jpeg', {
    black_north_free_male: '58', black_north_free_female: '60', black_north_caged_male: '52', black_north_caged_female: '52',
    black_central_free_male: '58', black_central_free_female: '60', black_central_caged_male: '52', black_central_caged_female: '52',
    black_south_free_male: '60', black_south_free_female: '60', black_east_free_male: '62', black_east_free_female: '62',
    golden_north_male: '50', golden_north_female: '50', golden_central_male: '50', golden_central_female: '50',
    heritage_north_male: '58', heritage_north_female: '60', heritage_central_male: '58', heritage_central_female: '60', heritage_south_male: '58', heritage_south_female: '60',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '97', fighting_north_caged_female: '92', fighting_central_free_female: '97', fighting_central_caged_female: '92',
    guinea_north_female: '73', guinea_central_female: '73', wenchang_north: '62', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
  bulletinRow('2026/07/17', 'provided-association-bulletin-2026-07-17.jpg', {
    black_north_free_male: '56', black_north_free_female: '58', black_north_caged_male: '50', black_north_caged_female: '50',
    black_central_free_male: '56', black_central_free_female: '58', black_central_caged_male: '49', black_central_caged_female: '49',
    black_south_free_male: '59', black_south_free_female: '59', black_east_free_male: '62', black_east_free_female: '62',
    golden_north_male: '48', golden_north_female: '48', golden_central_male: '48', golden_central_female: '48',
    heritage_north_male: '56', heritage_north_female: '58', heritage_central_male: '56', heritage_central_female: '58', heritage_south_male: '56', heritage_south_female: '58',
    silkie_central: '64', silkie_south: '66', fighting_north_free_female: '95', fighting_north_caged_female: '90', fighting_central_free_female: '95', fighting_central_caged_female: '90',
    guinea_north_female: '72', guinea_central_female: '72', wenchang_north: '60', zhubei_imitation_hen_all: '82', zhubei_imitation_capon_all: '125',
  }),
];

const centralLivestockMonthlyRows: PoultryRow[] = [
  { TransDate: '2025/12/31', SourceDocument: '20260304_170912.3182.pdf', national_red_monthly: '93.33', national_black_male_monthly: '96.67', national_black_female_monthly: '86.67' },
  { TransDate: '2026/01/31', SourceDocument: '20260306_155123.90702.pdf', national_red_monthly: '93.33', national_black_male_monthly: '94.84', national_black_female_monthly: '86.67' },
  { TransDate: '2026/02/28', SourceDocument: '20260323_182316.55058.pdf', national_red_monthly: '93.33', national_black_male_monthly: '91.81', national_black_female_monthly: '91.23' },
  { TransDate: '2026/03/31', SourceDocument: '20260506_120325.32628.pdf', national_red_monthly: '92.85', national_black_male_monthly: '89.95', national_black_female_monthly: '89.95' },
  { TransDate: '2026/04/30', SourceDocument: '20260515_161534.77239.pdf', national_red_monthly: '88.67', national_black_male_monthly: '88.33', national_black_female_monthly: '88.33' },
  { TransDate: '2026/05/31', SourceDocument: '20260626_173655.32670.pdf', national_red_monthly: '85.05', national_black_male_monthly: '85.11', national_black_female_monthly: '85.11' },
  { TransDate: '2026/06/30', SourceDocument: '20260715_170323.52841.pdf', national_red_monthly: '78.50', national_black_male_monthly: '81.56', national_black_female_monthly: '81.56' },
];

export interface HistorySeriesDefinition {
  item: HistoricalMarketItem;
  label: string;
  group: string;
  endpoint: string;
  read: (row: PoultryRow) => string | undefined;
  frequency?: MarketFrequency;
  scale?: number;
}

export const historyMarketOptions: readonly HistorySeriesDefinition[] = [
  { item: 'red_north_male', label: '紅羽土雞・公・北區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_N_M },
  { item: 'red_north_female', label: '紅羽土雞・母・北區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_N_F },
  { item: 'red_central_male', label: '紅羽土雞・公・中區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_C_M },
  { item: 'red_central_female', label: '紅羽土雞・母・中區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_C_F },
  { item: 'red_south_male', label: '紅羽土雞・公・南區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_S_M },
  { item: 'red_south_female', label: '紅羽土雞・母・南區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_S_F },
  { item: 'black_south_male', label: '黑羽土雞・公・南區舍飼', group: '黑羽土雞', endpoint: 'PoultryTransType_BlackFeather', read: (row) => row.BlackFeather_S_M },
  { item: 'black_south_female', label: '黑羽土雞・母・南區舍飼', group: '黑羽土雞', endpoint: 'PoultryTransType_BlackFeather', read: (row) => row.BlackFeather_S_F },
  { item: 'black_north_free_male', label: '黑羽土雞・公・北區放山', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_north_free_male },
  { item: 'black_north_free_female', label: '黑羽土雞・母・北區放山', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_north_free_female },
  { item: 'black_north_caged_male', label: '黑羽土雞・公・北區舍飼', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_north_caged_male },
  { item: 'black_north_caged_female', label: '黑羽土雞・母・北區舍飼', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_north_caged_female },
  { item: 'black_central_free_male', label: '黑羽土雞・公・中區放山', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_central_free_male },
  { item: 'black_central_free_female', label: '黑羽土雞・母・中區放山', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_central_free_female },
  { item: 'black_central_caged_male', label: '黑羽土雞・公・中區舍飼', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_central_caged_male },
  { item: 'black_central_caged_female', label: '黑羽土雞・母・中區舍飼', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_central_caged_female },
  { item: 'black_south_free_male', label: '黑羽土雞・公・南區放山', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_south_free_male },
  { item: 'black_south_free_female', label: '黑羽土雞・母・南區放山', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_south_free_female },
  { item: 'black_east_free_male', label: '黑羽土雞・公・花東放山', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_east_free_male },
  { item: 'black_east_free_female', label: '黑羽土雞・母・花東放山', group: '黑羽土雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.black_east_free_female },
  { item: 'golden_north_male', label: '皇金雞・公・北區', group: '皇金雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.golden_north_male },
  { item: 'golden_north_female', label: '皇金雞・母・北區', group: '皇金雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.golden_north_female },
  { item: 'golden_central_male', label: '皇金雞・公・中區', group: '皇金雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.golden_central_male },
  { item: 'golden_central_female', label: '皇金雞・母・中區', group: '皇金雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.golden_central_female },
  { item: 'heritage_north_male', label: '古早雞・公・北區', group: '古早雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.heritage_north_male },
  { item: 'heritage_north_female', label: '古早雞・母・北區', group: '古早雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.heritage_north_female },
  { item: 'heritage_central_male', label: '古早雞・公・中區', group: '古早雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.heritage_central_male },
  { item: 'heritage_central_female', label: '古早雞・母・中區', group: '古早雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.heritage_central_female },
  { item: 'heritage_south_male', label: '古早雞・公・南區', group: '古早雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.heritage_south_male },
  { item: 'heritage_south_female', label: '古早雞・母・南區', group: '古早雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.heritage_south_female },
  { item: 'silkie_central', label: '烏骨雞・中區', group: '烏骨雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.silkie_central },
  { item: 'silkie_south', label: '烏骨雞・南區', group: '烏骨雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.silkie_south },
  { item: 'fighting_north_free_female', label: '鬥雞母・北區放山', group: '鬥雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.fighting_north_free_female },
  { item: 'fighting_north_caged_female', label: '鬥雞母・北區舍飼', group: '鬥雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.fighting_north_caged_female },
  { item: 'fighting_central_free_female', label: '鬥雞母・中區放山', group: '鬥雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.fighting_central_free_female },
  { item: 'fighting_central_caged_female', label: '鬥雞母・中區舍飼', group: '鬥雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.fighting_central_caged_female },
  { item: 'fighting_east_free_female', label: '鬥雞母・花東放山', group: '鬥雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.fighting_east_free_female },
  { item: 'guinea_north_female', label: '珍珠雞母・北區', group: '珍珠雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.guinea_north_female },
  { item: 'guinea_central_female', label: '珍珠雞母・中區', group: '珍珠雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.guinea_central_female },
  { item: 'wenchang_north', label: '文昌雞・北區', group: '文昌雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.wenchang_north },
  { item: 'zhubei_imitation_hen_all', label: '竹北仿雞母・全區', group: '竹北仿雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.zhubei_imitation_hen_all },
  { item: 'zhubei_imitation_capon_all', label: '竹北仿閹雞・全區', group: '竹北仿雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.zhubei_imitation_capon_all },
  { item: 'fighting_capon_all', label: '鬥閹雞・全區', group: '鬥雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.fighting_capon_all },
  { item: 'heritage_capon_all', label: '古早閹雞・全區', group: '古早雞', endpoint: ASSOCIATION_BULLETIN_ENDPOINT, read: (row) => row.heritage_capon_all },
  { item: 'national_red_monthly', label: '紅羽土雞・全國月均', group: '紅羽土雞', endpoint: CENTRAL_LIVESTOCK_MONTHLY_ENDPOINT, read: (row) => row.national_red_monthly, frequency: 'monthly', scale: 0.6 },
  { item: 'national_black_male_monthly', label: '黑羽土雞・公・全國月均', group: '黑羽土雞', endpoint: CENTRAL_LIVESTOCK_MONTHLY_ENDPOINT, read: (row) => row.national_black_male_monthly, frequency: 'monthly', scale: 0.6 },
  { item: 'national_black_female_monthly', label: '黑羽土雞・母・全國月均', group: '黑羽土雞', endpoint: CENTRAL_LIVESTOCK_MONTHLY_ENDPOINT, read: (row) => row.national_black_female_monthly, frequency: 'monthly', scale: 0.6 },
  { item: 'broiler_large', label: '白肉雞・2.0 kg 以上', group: '白肉雞', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row['TaijinPrice_2.0kgup'] },
  { item: 'broiler_medium', label: '白肉雞・1.75–1.95 kg', group: '白肉雞', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row['TaijinPrice_1.75kg_1.95kg'] },
  { item: 'broiler_store_kp', label: '白肉雞・高屏門市', group: '白肉雞', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row.Store_KP_TaijinPrice },
  { item: 'egg_producer', label: '雞蛋・產地', group: '雞蛋', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row.egg_Producer_Price },
  { item: 'egg_transport', label: '雞蛋・大運輸', group: '雞蛋', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row.egg_Price },
] as const;

function apiDate(value: Date): string {
  return `${value.getFullYear()}/${String(value.getMonth() + 1).padStart(2, '0')}/${String(value.getDate()).padStart(2, '0')}`;
}

function isoDate(value: string | undefined): string {
  if (!value || !/^\d{4}\/\d{2}\/\d{2}$/.test(value)) throw new Error('MOA row has an invalid date');
  return value.replaceAll('/', '-');
}

function numberOrNull(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '' || value.includes('休市')) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 500) throw new Error(`Invalid poultry price: ${value}`);
  return parsed;
}

async function sha256(payload: string): Promise<string> {
  const bytes = new TextEncoder().encode(payload);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function fetchSnapshot<T>(endpoint: string, start: string, end: string, fetchedAt: string, signal?: AbortSignal): Promise<{ row: T; snapshot: RawSnapshot }> {
  const query = new URLSearchParams({ Start_time: start, End_time: end });
  const sourceUrl = `${BASE}/${endpoint}/?${query.toString()}`;
  const request: RequestInit = { headers: { Accept: 'application/json' } };
  if (signal !== undefined) request.signal = signal;
  const response = await fetch(sourceUrl, request);
  if (!response.ok) throw new Error(`MOA ${endpoint} returned ${response.status}`);
  const text = await response.text();
  const payload = JSON.parse(text.replace(/^\uFEFF/, '')) as MoaResponse<T>;
  if (payload.RS !== 'OK' || !Array.isArray(payload.Data) || payload.Data.length === 0) throw new Error(`MOA ${endpoint} returned no usable rows`);
  const row = payload.Data[0];
  if (row === undefined) throw new Error(`MOA ${endpoint} returned an empty first row`);
  return {
    row,
    snapshot: { sourceUrl, fetchedAt, payload, sha256: await sha256(text), parserVersion: MOA_PARSER_VERSION },
  };
}

export function parseMoaHistoryRows(item: HistoricalMarketItem, rows: PoultryRow[]): HistoryPoint[] {
  const definition = historyMarketOptions.find((option) => option.item === item);
  if (!definition) throw new Error(`Unsupported poultry history item: ${item}`);
  const byDate = new Map<string, HistoryPoint>();
  for (const row of rows) {
    const date = isoDate(row.TransDate);
    const parsed = numberOrNull(definition.read(row));
    const value = parsed === null ? null : Math.round(parsed * (definition.scale ?? 1) * 1000) / 1000;
    byDate.set(date, { date, value });
  }
  return [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date));
}

export async function fetchMoaPoultryHistory(
  item: HistoricalMarketItem,
  startDate: Date,
  endDate: Date,
  signal?: AbortSignal,
): Promise<MarketHistoryResult> {
  const results = await fetchMoaPoultryHistories([item], startDate, endDate, signal);
  const result = results[0];
  if (!result) throw new Error(`MOA returned no history result for ${item}`);
  return result;
}

export async function fetchMoaPoultryHistories(
  items: readonly HistoricalMarketItem[],
  startDate: Date,
  endDate: Date,
  signal?: AbortSignal,
): Promise<MarketHistoryResult[]> {
  const range = endDate.getTime() - startDate.getTime();
  if (!Number.isFinite(range) || range < 0 || range > 732 * 86_400_000) throw new Error('Poultry history range must be between 0 and 732 days');
  const fetchedAt = new Date().toISOString();
  const definitions = items.map((item) => {
    const definition = historyMarketOptions.find((option) => option.item === item);
    if (!definition) throw new Error(`Unsupported poultry history item: ${item}`);
    return definition;
  });
  const endpoints = [...new Set(definitions.map((definition) => definition.endpoint))];
  const responses = await Promise.all(endpoints.map(async (endpoint) => {
    if (endpoint === ASSOCIATION_BULLETIN_ENDPOINT) {
      const start = apiDate(startDate);
      const end = apiDate(endDate);
      const rows = associationBulletinRows.filter((row) => row.TransDate !== undefined && row.TransDate >= start && row.TransDate <= end);
      const payload: MoaResponse<PoultryRow> = { RS: 'OK', Data: rows, Next: false };
      const text = JSON.stringify(payload);
      const snapshot: RawSnapshot = {
        sourceUrl: ASSOCIATION_BULLETIN_URL,
        fetchedAt,
        payload,
        sha256: await sha256(text),
        parserVersion: ASSOCIATION_BULLETIN_PARSER_VERSION,
      };
      return { endpoint, payload, snapshot, sourceName: ASSOCIATION_BULLETIN_SOURCE };
    }
    if (endpoint === CENTRAL_LIVESTOCK_MONTHLY_ENDPOINT) {
      const start = apiDate(startDate);
      const end = apiDate(endDate);
      const rows = centralLivestockMonthlyRows.filter((row) => row.TransDate !== undefined && row.TransDate >= start && row.TransDate <= end);
      const payload: MoaResponse<PoultryRow> = { RS: 'OK', Data: rows, Next: false };
      const text = JSON.stringify(payload);
      const snapshot: RawSnapshot = {
        sourceUrl: CENTRAL_LIVESTOCK_MONTHLY_URL,
        fetchedAt,
        payload,
        sha256: await sha256(text),
        parserVersion: CENTRAL_LIVESTOCK_MONTHLY_PARSER_VERSION,
      };
      return { endpoint, payload, snapshot, sourceName: CENTRAL_LIVESTOCK_MONTHLY_SOURCE };
    }
    const query = new URLSearchParams({ Start_time: apiDate(startDate), End_time: apiDate(endDate) });
    const sourceUrl = `${BASE}/${endpoint}/?${query.toString()}`;
    const request: RequestInit = { headers: { Accept: 'application/json' } };
    if (signal !== undefined) request.signal = signal;
    const response = await fetch(sourceUrl, request);
    if (!response.ok) throw new Error(`MOA ${endpoint} returned ${response.status}`);
    const text = await response.text();
    const payload = JSON.parse(text.replace(/^\uFEFF/, '')) as MoaResponse<PoultryRow>;
    if (payload.RS !== 'OK' || !Array.isArray(payload.Data)) throw new Error(`MOA ${endpoint} returned an invalid payload`);
    const snapshot: RawSnapshot = {
      sourceUrl,
      fetchedAt,
      payload,
      sha256: await sha256(text),
      parserVersion: MOA_PARSER_VERSION,
    };
    return { endpoint, payload, snapshot, sourceName: '農業部 Open Data' };
  }));
  return definitions.map((definition) => {
    const response = responses.find((candidate) => candidate.endpoint === definition.endpoint);
    if (!response) throw new Error(`MOA ${definition.endpoint} response is missing`);
    return {
      item: definition.item,
      label: definition.label,
      points: parseMoaHistoryRows(definition.item, response.payload.Data ?? []),
      unit: 'TWD_PER_600G',
      frequency: definition.frequency ?? 'daily',
      sourceName: response.sourceName,
      sourceUrl: response.snapshot.sourceUrl,
      fetchedAt,
      snapshot: response.snapshot,
    };
  });
}

interface FieldMap<T> { item: MarketItem; label: string; read: (row: T) => string | undefined }

function normalize<T extends { TransDate?: string }>(row: T, snapshot: RawSnapshot, fields: FieldMap<T>[]): MarketRecord[] {
  const sourceDate = isoDate(row.TransDate);
  return fields.map((field) => ({
    id: `${sourceDate}:${field.item}`,
    item: field.item,
    label: field.label,
    value: numberOrNull(field.read(row)),
    unit: 'TWD_PER_600G',
    frequency: 'daily',
    sourceDate,
    sourcePublishedAt: null,
    fetchedAt: snapshot.fetchedAt,
    sourceName: '農業部 Open Data',
    sourceUrl: snapshot.sourceUrl,
    status: 'verified-live',
    rawSnapshotHash: snapshot.sha256,
    parserVersion: snapshot.parserVersion,
    validationStatus: 'valid',
  }));
}

export async function fetchLatestMoaPoultry(now = new Date(), signal?: AbortSignal): Promise<MarketBundle> {
  const end = apiDate(now);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 10);
  const start = apiDate(startDate);
  const fetchedAt = now.toISOString();
  const [red, black, broiler] = await Promise.all([
    fetchSnapshot<RedRow>('PoultryTransType_RedFeather', start, end, fetchedAt, signal),
    fetchSnapshot<BlackRow>('PoultryTransType_BlackFeather', start, end, fetchedAt, signal),
    fetchSnapshot<BroilerRow>('PoultryTransType_BoiledChicken_Eggs', start, end, fetchedAt, signal),
  ]);
  const records = [
    ...normalize(red.row, red.snapshot, [
      { item: 'red_north_male', label: '紅羽土雞・公・北區', read: (row) => row.RedFeather_N_M },
      { item: 'red_north_female', label: '紅羽土雞・母・北區', read: (row) => row.RedFeather_N_F },
      { item: 'red_central_male', label: '紅羽土雞・公・中區', read: (row) => row.RedFeather_C_M },
      { item: 'red_central_female', label: '紅羽土雞・母・中區', read: (row) => row.RedFeather_C_F },
      { item: 'red_south_male', label: '紅羽土雞・公・南區', read: (row) => row.RedFeather_S_M },
      { item: 'red_south_female', label: '紅羽土雞・母・南區', read: (row) => row.RedFeather_S_F },
    ]),
    ...normalize(black.row, black.snapshot, [
      { item: 'black_south_male', label: '黑羽土雞・公・舍飼', read: (row) => row.BlackFeather_S_M },
      { item: 'black_south_female', label: '黑羽土雞・母・舍飼', read: (row) => row.BlackFeather_S_F },
    ]),
    ...normalize(broiler.row, broiler.snapshot, [
      { item: 'broiler_large', label: '白肉雞・2.0 kg 以上', read: (row) => row['TaijinPrice_2.0kgup'] },
      { item: 'broiler_medium', label: '白肉雞・1.75–1.95 kg', read: (row) => row['TaijinPrice_1.75kg_1.95kg'] },
      { item: 'broiler_store_kp', label: '白肉雞・高屏門市', read: (row) => row.Store_KP_TaijinPrice },
      { item: 'egg_transport', label: '雞蛋・大運輸', read: (row) => row.egg_Price },
      { item: 'egg_producer', label: '雞蛋・產地', read: (row) => row.egg_Producer_Price },
    ]),
  ];
  return { records, snapshots: [red.snapshot, black.snapshot, broiler.snapshot], mode: 'live', message: '已連線農業部 Open Data' };
}
