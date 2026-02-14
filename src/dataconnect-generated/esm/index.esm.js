import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'ricgcw',
  location: 'us-east4'
};

export const createPrayerRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePrayerRequest', inputVars);
}
createPrayerRequestRef.operationName = 'CreatePrayerRequest';

export function createPrayerRequest(dcOrVars, vars) {
  return executeMutation(createPrayerRequestRef(dcOrVars, vars));
}

export const getPrayerRequestsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPrayerRequests');
}
getPrayerRequestsRef.operationName = 'GetPrayerRequests';

export function getPrayerRequests(dc) {
  return executeQuery(getPrayerRequestsRef(dc));
}

export const joinGroupRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'JoinGroup', inputVars);
}
joinGroupRef.operationName = 'JoinGroup';

export function joinGroup(dcOrVars, vars) {
  return executeMutation(joinGroupRef(dcOrVars, vars));
}

export const listGroupsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListGroups');
}
listGroupsRef.operationName = 'ListGroups';

export function listGroups(dc) {
  return executeQuery(listGroupsRef(dc));
}

