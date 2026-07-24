import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

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

/** Generated Node Admin SDK operation action function for the 'ConfirmDistributionAdmin' Mutation. Allow users to execute without passing in DataConnect. */
export function confirmDistributionAdmin(dc: DataConnect, vars: ConfirmDistributionAdminVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ConfirmDistributionAdminData>>;
/** Generated Node Admin SDK operation action function for the 'ConfirmDistributionAdmin' Mutation. Allow users to pass in custom DataConnect instances. */
export function confirmDistributionAdmin(vars: ConfirmDistributionAdminVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ConfirmDistributionAdminData>>;

/** Generated Node Admin SDK operation action function for the 'MyOrganizations' Query. Allow users to execute without passing in DataConnect. */
export function myOrganizations(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<MyOrganizationsData>>;
/** Generated Node Admin SDK operation action function for the 'MyOrganizations' Query. Allow users to pass in custom DataConnect instances. */
export function myOrganizations(options?: OperationOptions): Promise<ExecuteOperationResponse<MyOrganizationsData>>;

/** Generated Node Admin SDK operation action function for the 'MyChickenHouses' Query. Allow users to execute without passing in DataConnect. */
export function myChickenHouses(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<MyChickenHousesData>>;
/** Generated Node Admin SDK operation action function for the 'MyChickenHouses' Query. Allow users to pass in custom DataConnect instances. */
export function myChickenHouses(options?: OperationOptions): Promise<ExecuteOperationResponse<MyChickenHousesData>>;

/** Generated Node Admin SDK operation action function for the 'CreateOrganization' Mutation. Allow users to execute without passing in DataConnect. */
export function createOrganization(dc: DataConnect, vars: CreateOrganizationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateOrganizationData>>;
/** Generated Node Admin SDK operation action function for the 'CreateOrganization' Mutation. Allow users to pass in custom DataConnect instances. */
export function createOrganization(vars: CreateOrganizationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateOrganizationData>>;

/** Generated Node Admin SDK operation action function for the 'CreateChickenHouse' Mutation. Allow users to execute without passing in DataConnect. */
export function createChickenHouse(dc: DataConnect, vars: CreateChickenHouseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateChickenHouseData>>;
/** Generated Node Admin SDK operation action function for the 'CreateChickenHouse' Mutation. Allow users to pass in custom DataConnect instances. */
export function createChickenHouse(vars: CreateChickenHouseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateChickenHouseData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateChickenHouse' Mutation. Allow users to execute without passing in DataConnect. */
export function updateChickenHouse(dc: DataConnect, vars: UpdateChickenHouseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateChickenHouseData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateChickenHouse' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateChickenHouse(vars: UpdateChickenHouseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateChickenHouseData>>;

/** Generated Node Admin SDK operation action function for the 'FinancialRecordsServerOnly' Query. Allow users to execute without passing in DataConnect. */
export function financialRecordsServerOnly(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<FinancialRecordsServerOnlyData>>;
/** Generated Node Admin SDK operation action function for the 'FinancialRecordsServerOnly' Query. Allow users to pass in custom DataConnect instances. */
export function financialRecordsServerOnly(options?: OperationOptions): Promise<ExecuteOperationResponse<FinancialRecordsServerOnlyData>>;

/** Generated Node Admin SDK operation action function for the 'LatestMarketRecords' Query. Allow users to execute without passing in DataConnect. */
export function latestMarketRecords(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<LatestMarketRecordsData>>;
/** Generated Node Admin SDK operation action function for the 'LatestMarketRecords' Query. Allow users to pass in custom DataConnect instances. */
export function latestMarketRecords(options?: OperationOptions): Promise<ExecuteOperationResponse<LatestMarketRecordsData>>;

/** Generated Node Admin SDK operation action function for the 'ListEquipment' Query. Allow users to execute without passing in DataConnect. */
export function listEquipment(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListEquipmentData>>;
/** Generated Node Admin SDK operation action function for the 'ListEquipment' Query. Allow users to pass in custom DataConnect instances. */
export function listEquipment(options?: OperationOptions): Promise<ExecuteOperationResponse<ListEquipmentData>>;

