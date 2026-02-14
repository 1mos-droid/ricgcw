import { CreatePrayerRequestData, CreatePrayerRequestVariables, GetPrayerRequestsData, JoinGroupData, JoinGroupVariables, ListGroupsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreatePrayerRequest(options?: useDataConnectMutationOptions<CreatePrayerRequestData, FirebaseError, CreatePrayerRequestVariables>): UseDataConnectMutationResult<CreatePrayerRequestData, CreatePrayerRequestVariables>;
export function useCreatePrayerRequest(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePrayerRequestData, FirebaseError, CreatePrayerRequestVariables>): UseDataConnectMutationResult<CreatePrayerRequestData, CreatePrayerRequestVariables>;

export function useGetPrayerRequests(options?: useDataConnectQueryOptions<GetPrayerRequestsData>): UseDataConnectQueryResult<GetPrayerRequestsData, undefined>;
export function useGetPrayerRequests(dc: DataConnect, options?: useDataConnectQueryOptions<GetPrayerRequestsData>): UseDataConnectQueryResult<GetPrayerRequestsData, undefined>;

export function useJoinGroup(options?: useDataConnectMutationOptions<JoinGroupData, FirebaseError, JoinGroupVariables>): UseDataConnectMutationResult<JoinGroupData, JoinGroupVariables>;
export function useJoinGroup(dc: DataConnect, options?: useDataConnectMutationOptions<JoinGroupData, FirebaseError, JoinGroupVariables>): UseDataConnectMutationResult<JoinGroupData, JoinGroupVariables>;

export function useListGroups(options?: useDataConnectQueryOptions<ListGroupsData>): UseDataConnectQueryResult<ListGroupsData, undefined>;
export function useListGroups(dc: DataConnect, options?: useDataConnectQueryOptions<ListGroupsData>): UseDataConnectQueryResult<ListGroupsData, undefined>;
