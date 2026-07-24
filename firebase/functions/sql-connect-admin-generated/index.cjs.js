const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'mobile',
  serviceId: 'chicken-pixel-village',
  location: 'asia-east1'
};
exports.connectorConfig = connectorConfig;

function confirmDistributionAdmin(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('ConfirmDistributionAdmin', inputVars, inputOpts);
}
exports.confirmDistributionAdmin = confirmDistributionAdmin;

function myOrganizations(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('MyOrganizations', undefined, inputOpts);
}
exports.myOrganizations = myOrganizations;

function myChickenHouses(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('MyChickenHouses', undefined, inputOpts);
}
exports.myChickenHouses = myChickenHouses;

function createOrganization(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateOrganization', inputVars, inputOpts);
}
exports.createOrganization = createOrganization;

function createChickenHouse(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateChickenHouse', inputVars, inputOpts);
}
exports.createChickenHouse = createChickenHouse;

function updateChickenHouse(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateChickenHouse', inputVars, inputOpts);
}
exports.updateChickenHouse = updateChickenHouse;

function financialRecordsServerOnly(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('FinancialRecordsServerOnly', undefined, inputOpts);
}
exports.financialRecordsServerOnly = financialRecordsServerOnly;

function latestMarketRecords(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('LatestMarketRecords', undefined, inputOpts);
}
exports.latestMarketRecords = latestMarketRecords;

function listEquipment(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListEquipment', undefined, inputOpts);
}
exports.listEquipment = listEquipment;

