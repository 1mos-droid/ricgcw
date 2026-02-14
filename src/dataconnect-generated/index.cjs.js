const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'ricgcw',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createPrayerRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePrayerRequest', inputVars);
}
createPrayerRequestRef.operationName = 'CreatePrayerRequest';
exports.createPrayerRequestRef = createPrayerRequestRef;

exports.createPrayerRequest = function createPrayerRequest(dcOrVars, vars) {
  return executeMutation(createPrayerRequestRef(dcOrVars, vars));
};

const getPrayerRequestsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPrayerRequests');
}
getPrayerRequestsRef.operationName = 'GetPrayerRequests';
exports.getPrayerRequestsRef = getPrayerRequestsRef;

exports.getPrayerRequests = function getPrayerRequests(dc) {
  return executeQuery(getPrayerRequestsRef(dc));
};

const joinGroupRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'JoinGroup', inputVars);
}
joinGroupRef.operationName = 'JoinGroup';
exports.joinGroupRef = joinGroupRef;

exports.joinGroup = function joinGroup(dcOrVars, vars) {
  return executeMutation(joinGroupRef(dcOrVars, vars));
};

const listGroupsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListGroups');
}
listGroupsRef.operationName = 'ListGroups';
exports.listGroupsRef = listGroupsRef;

exports.listGroups = function listGroups(dc) {
  return executeQuery(listGroupsRef(dc));
};
