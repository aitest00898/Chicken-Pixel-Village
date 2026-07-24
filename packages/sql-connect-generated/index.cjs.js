const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'mobile',
  service: 'chicken-pixel-village',
  location: 'asia-east1'
};
exports.connectorConfig = connectorConfig;

const confirmDistributionAdminRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ConfirmDistributionAdmin', inputVars);
}
confirmDistributionAdminRef.operationName = 'ConfirmDistributionAdmin';
exports.confirmDistributionAdminRef = confirmDistributionAdminRef;

exports.confirmDistributionAdmin = function confirmDistributionAdmin(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(confirmDistributionAdminRef(dcInstance, inputVars));
}
;

const myOrganizationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyOrganizations');
}
myOrganizationsRef.operationName = 'MyOrganizations';
exports.myOrganizationsRef = myOrganizationsRef;

exports.myOrganizations = function myOrganizations(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(myOrganizationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const myChickenHousesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyChickenHouses');
}
myChickenHousesRef.operationName = 'MyChickenHouses';
exports.myChickenHousesRef = myChickenHousesRef;

exports.myChickenHouses = function myChickenHouses(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(myChickenHousesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createOrganizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOrganization', inputVars);
}
createOrganizationRef.operationName = 'CreateOrganization';
exports.createOrganizationRef = createOrganizationRef;

exports.createOrganization = function createOrganization(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createOrganizationRef(dcInstance, inputVars));
}
;

const createChickenHouseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateChickenHouse', inputVars);
}
createChickenHouseRef.operationName = 'CreateChickenHouse';
exports.createChickenHouseRef = createChickenHouseRef;

exports.createChickenHouse = function createChickenHouse(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createChickenHouseRef(dcInstance, inputVars));
}
;

const financialRecordsServerOnlyRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'FinancialRecordsServerOnly');
}
financialRecordsServerOnlyRef.operationName = 'FinancialRecordsServerOnly';
exports.financialRecordsServerOnlyRef = financialRecordsServerOnlyRef;

exports.financialRecordsServerOnly = function financialRecordsServerOnly(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(financialRecordsServerOnlyRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const latestMarketRecordsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'LatestMarketRecords');
}
latestMarketRecordsRef.operationName = 'LatestMarketRecords';
exports.latestMarketRecordsRef = latestMarketRecordsRef;

exports.latestMarketRecords = function latestMarketRecords(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(latestMarketRecordsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listEquipmentRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEquipment');
}
listEquipmentRef.operationName = 'ListEquipment';
exports.listEquipmentRef = listEquipmentRef;

exports.listEquipment = function listEquipment(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listEquipmentRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
