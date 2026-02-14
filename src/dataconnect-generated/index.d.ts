import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreatePrayerRequestData {
  prayerRequest_insert: PrayerRequest_Key;
}

export interface CreatePrayerRequestVariables {
  requestText: string;
  isPrivate?: boolean | null;
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface GetPrayerRequestsData {
  prayerRequests: ({
    id: UUIDString;
    requestText: string;
    isPrivate?: boolean | null;
    createdAt: TimestampString;
    answeredAt?: TimestampString | null;
  } & PrayerRequest_Key)[];
}

export interface GroupMembership_Key {
  userId: UUIDString;
  groupId: UUIDString;
  __typename?: 'GroupMembership_Key';
}

export interface Group_Key {
  id: UUIDString;
  __typename?: 'Group_Key';
}

export interface JoinGroupData {
  groupMembership_insert: GroupMembership_Key;
}

export interface JoinGroupVariables {
  groupId: UUIDString;
}

export interface ListGroupsData {
  groups: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    meetingSchedule?: string | null;
    leader?: {
      id: UUIDString;
      displayName: string;
    } & User_Key;
  } & Group_Key)[];
}

export interface PrayerRequest_Key {
  id: UUIDString;
  __typename?: 'PrayerRequest_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreatePrayerRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePrayerRequestVariables): MutationRef<CreatePrayerRequestData, CreatePrayerRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePrayerRequestVariables): MutationRef<CreatePrayerRequestData, CreatePrayerRequestVariables>;
  operationName: string;
}
export const createPrayerRequestRef: CreatePrayerRequestRef;

export function createPrayerRequest(vars: CreatePrayerRequestVariables): MutationPromise<CreatePrayerRequestData, CreatePrayerRequestVariables>;
export function createPrayerRequest(dc: DataConnect, vars: CreatePrayerRequestVariables): MutationPromise<CreatePrayerRequestData, CreatePrayerRequestVariables>;

interface GetPrayerRequestsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPrayerRequestsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetPrayerRequestsData, undefined>;
  operationName: string;
}
export const getPrayerRequestsRef: GetPrayerRequestsRef;

export function getPrayerRequests(): QueryPromise<GetPrayerRequestsData, undefined>;
export function getPrayerRequests(dc: DataConnect): QueryPromise<GetPrayerRequestsData, undefined>;

interface JoinGroupRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: JoinGroupVariables): MutationRef<JoinGroupData, JoinGroupVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: JoinGroupVariables): MutationRef<JoinGroupData, JoinGroupVariables>;
  operationName: string;
}
export const joinGroupRef: JoinGroupRef;

export function joinGroup(vars: JoinGroupVariables): MutationPromise<JoinGroupData, JoinGroupVariables>;
export function joinGroup(dc: DataConnect, vars: JoinGroupVariables): MutationPromise<JoinGroupData, JoinGroupVariables>;

interface ListGroupsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListGroupsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListGroupsData, undefined>;
  operationName: string;
}
export const listGroupsRef: ListGroupsRef;

export function listGroups(): QueryPromise<ListGroupsData, undefined>;
export function listGroups(dc: DataConnect): QueryPromise<ListGroupsData, undefined>;

