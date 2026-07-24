import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Batch_Key {
  id: UUIDString;
  __typename?: 'Batch_Key';
}

export interface ChickenHouse_Key {
  id: UUIDString;
  __typename?: 'ChickenHouse_Key';
}

export interface ConfirmDistributionAdminData {
  distributionRecord_update?: DistributionRecord_Key | null;
}

export interface ConfirmDistributionAdminVariables {
  id: UUIDString;
  ownerUid: string;
  expectedRevision: number;
  confirmedAt: TimestampString;
}

export interface CreateChickenHouseData {
  chickenHouse_insert: ChickenHouse_Key;
}

export interface CreateChickenHouseVariables {
  id: UUIDString;
  organizationId: UUIDString;
  name: string;
  capacity: number;
  occupancy: number;
  houseType: string;
}

export interface CreateOrganizationData {
  organization_insert: Organization_Key;
  organizationMembership_insert: OrganizationMembership_Key;
}

export interface CreateOrganizationVariables {
  id: UUIDString;
  name: string;
}

export interface DistributionEntry_Key {
  id: UUIDString;
  __typename?: 'DistributionEntry_Key';
}

export interface DistributionRecord_Key {
  id: UUIDString;
  __typename?: 'DistributionRecord_Key';
}

export interface EquipmentItem_Key {
  id: string;
  __typename?: 'EquipmentItem_Key';
}

export interface FinancialRecordsServerOnlyData {
  distributionRecords: ({
    id: UUIDString;
    status: string;
    revision: number;
  } & DistributionRecord_Key)[];
}

export interface LatestMarketRecordsData {
  marketRecords: ({
    id: string;
    item: string;
    label: string;
    value?: number | null;
    unit: string;
    frequency: string;
    sourceDate: DateString;
    sourcePublishedAt?: TimestampString | null;
    fetchedAt: TimestampString;
    sourceName: string;
    sourceUrl: string;
    status: string;
    rawSnapshotHash: string;
    parserVersion: string;
    validationStatus: string;
  } & MarketRecord_Key)[];
}

export interface ListEquipmentData {
  equipmentItems: ({
    id: string;
    slot: string;
    name: string;
    unlockDays: number;
    spriteKey: string;
  } & EquipmentItem_Key)[];
}

export interface MarketRecord_Key {
  id: string;
  __typename?: 'MarketRecord_Key';
}

export interface MyChickenHousesData {
  chickenHouses: ({
    id: UUIDString;
    organizationId: UUIDString;
    name: string;
    capacity: number;
    occupancy: number;
    houseType: string;
    revision: number;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & ChickenHouse_Key)[];
}

export interface MyOrganizationsData {
  organizations: ({
    id: UUIDString;
    name: string;
    revision: number;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & Organization_Key)[];
}

export interface OrganizationMembership_Key {
  organizationId: UUIDString;
  userUid: string;
  __typename?: 'OrganizationMembership_Key';
}

export interface Organization_Key {
  id: UUIDString;
  __typename?: 'Organization_Key';
}

export interface RiskAssessment_Key {
  id: UUIDString;
  __typename?: 'RiskAssessment_Key';
}

export interface Shareholder_Key {
  id: UUIDString;
  __typename?: 'Shareholder_Key';
}

export interface Shareholding_Key {
  chickenHouseId: UUIDString;
  shareholderId: UUIDString;
  __typename?: 'Shareholding_Key';
}

export interface SyncOperation_Key {
  operationId: UUIDString;
  __typename?: 'SyncOperation_Key';
}

export interface UpdateChickenHouseData {
  chickenHouse_update?: ChickenHouse_Key | null;
}

export interface UpdateChickenHouseVariables {
  id: UUIDString;
  expectedRevision: number;
  name: string;
  capacity: number;
  occupancy: number;
  houseType: string;
}

export interface VisitProgress_Key {
  ownerUid: string;
  __typename?: 'VisitProgress_Key';
}

interface LatestMarketRecordsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<LatestMarketRecordsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<LatestMarketRecordsData, undefined>;
  operationName: string;
}
export const latestMarketRecordsRef: LatestMarketRecordsRef;

export function latestMarketRecords(options?: ExecuteQueryOptions): QueryPromise<LatestMarketRecordsData, undefined>;
export function latestMarketRecords(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<LatestMarketRecordsData, undefined>;

interface ListEquipmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEquipmentData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListEquipmentData, undefined>;
  operationName: string;
}
export const listEquipmentRef: ListEquipmentRef;

export function listEquipment(options?: ExecuteQueryOptions): QueryPromise<ListEquipmentData, undefined>;
export function listEquipment(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListEquipmentData, undefined>;

interface ConfirmDistributionAdminRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ConfirmDistributionAdminVariables): MutationRef<ConfirmDistributionAdminData, ConfirmDistributionAdminVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ConfirmDistributionAdminVariables): MutationRef<ConfirmDistributionAdminData, ConfirmDistributionAdminVariables>;
  operationName: string;
}
export const confirmDistributionAdminRef: ConfirmDistributionAdminRef;

export function confirmDistributionAdmin(vars: ConfirmDistributionAdminVariables): MutationPromise<ConfirmDistributionAdminData, ConfirmDistributionAdminVariables>;
export function confirmDistributionAdmin(dc: DataConnect, vars: ConfirmDistributionAdminVariables): MutationPromise<ConfirmDistributionAdminData, ConfirmDistributionAdminVariables>;

interface MyOrganizationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyOrganizationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MyOrganizationsData, undefined>;
  operationName: string;
}
export const myOrganizationsRef: MyOrganizationsRef;

export function myOrganizations(options?: ExecuteQueryOptions): QueryPromise<MyOrganizationsData, undefined>;
export function myOrganizations(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyOrganizationsData, undefined>;

interface MyChickenHousesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyChickenHousesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MyChickenHousesData, undefined>;
  operationName: string;
}
export const myChickenHousesRef: MyChickenHousesRef;

export function myChickenHouses(options?: ExecuteQueryOptions): QueryPromise<MyChickenHousesData, undefined>;
export function myChickenHouses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyChickenHousesData, undefined>;

interface CreateOrganizationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrganizationVariables): MutationRef<CreateOrganizationData, CreateOrganizationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateOrganizationVariables): MutationRef<CreateOrganizationData, CreateOrganizationVariables>;
  operationName: string;
}
export const createOrganizationRef: CreateOrganizationRef;

export function createOrganization(vars: CreateOrganizationVariables): MutationPromise<CreateOrganizationData, CreateOrganizationVariables>;
export function createOrganization(dc: DataConnect, vars: CreateOrganizationVariables): MutationPromise<CreateOrganizationData, CreateOrganizationVariables>;

interface CreateChickenHouseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateChickenHouseVariables): MutationRef<CreateChickenHouseData, CreateChickenHouseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateChickenHouseVariables): MutationRef<CreateChickenHouseData, CreateChickenHouseVariables>;
  operationName: string;
}
export const createChickenHouseRef: CreateChickenHouseRef;

export function createChickenHouse(vars: CreateChickenHouseVariables): MutationPromise<CreateChickenHouseData, CreateChickenHouseVariables>;
export function createChickenHouse(dc: DataConnect, vars: CreateChickenHouseVariables): MutationPromise<CreateChickenHouseData, CreateChickenHouseVariables>;

interface UpdateChickenHouseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateChickenHouseVariables): MutationRef<UpdateChickenHouseData, UpdateChickenHouseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateChickenHouseVariables): MutationRef<UpdateChickenHouseData, UpdateChickenHouseVariables>;
  operationName: string;
}
export const updateChickenHouseRef: UpdateChickenHouseRef;

export function updateChickenHouse(vars: UpdateChickenHouseVariables): MutationPromise<UpdateChickenHouseData, UpdateChickenHouseVariables>;
export function updateChickenHouse(dc: DataConnect, vars: UpdateChickenHouseVariables): MutationPromise<UpdateChickenHouseData, UpdateChickenHouseVariables>;

interface FinancialRecordsServerOnlyRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<FinancialRecordsServerOnlyData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<FinancialRecordsServerOnlyData, undefined>;
  operationName: string;
}
export const financialRecordsServerOnlyRef: FinancialRecordsServerOnlyRef;

export function financialRecordsServerOnly(options?: ExecuteQueryOptions): QueryPromise<FinancialRecordsServerOnlyData, undefined>;
export function financialRecordsServerOnly(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<FinancialRecordsServerOnlyData, undefined>;

