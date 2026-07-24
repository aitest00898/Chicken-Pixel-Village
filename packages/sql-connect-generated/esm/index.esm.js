import { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'mobile',
  service: 'chicken-pixel-village',
  location: 'asia-east1'
};
export const latestMarketRecordsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'LatestMarketRecords');
}
latestMarketRecordsRef.operationName = 'LatestMarketRecords';

export function latestMarketRecords(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(latestMarketRecordsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}

export const listEquipmentRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEquipment');
}
listEquipmentRef.operationName = 'ListEquipment';

export function listEquipment(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listEquipmentRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}

export const confirmDistributionAdminRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ConfirmDistributionAdmin', inputVars);
}
confirmDistributionAdminRef.operationName = 'ConfirmDistributionAdmin';

export function confirmDistributionAdmin(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(confirmDistributionAdminRef(dcInstance, inputVars));
}

export const myOrganizationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyOrganizations');
}
myOrganizationsRef.operationName = 'MyOrganizations';

export function myOrganizations(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(myOrganizationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}

export const myChickenHousesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyChickenHouses');
}
myChickenHousesRef.operationName = 'MyChickenHouses';

export function myChickenHouses(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(myChickenHousesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}

export const createOrganizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOrganization', inputVars);
}
createOrganizationRef.operationName = 'CreateOrganization';

export function createOrganization(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createOrganizationRef(dcInstance, inputVars));
}

export const createChickenHouseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateChickenHouse', inputVars);
}
createChickenHouseRef.operationName = 'CreateChickenHouse';

export function createChickenHouse(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createChickenHouseRef(dcInstance, inputVars));
}

export const updateChickenHouseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateChickenHouse', inputVars);
}
updateChickenHouseRef.operationName = 'UpdateChickenHouse';

export function updateChickenHouse(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateChickenHouseRef(dcInstance, inputVars));
}

export const financialRecordsServerOnlyRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'FinancialRecordsServerOnly');
}
financialRecordsServerOnlyRef.operationName = 'FinancialRecordsServerOnly';

export function financialRecordsServerOnly(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(financialRecordsServerOnlyRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}

