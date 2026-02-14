# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetPrayerRequests*](#getprayerrequests)
  - [*ListGroups*](#listgroups)
- [**Mutations**](#mutations)
  - [*CreatePrayerRequest*](#createprayerrequest)
  - [*JoinGroup*](#joingroup)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetPrayerRequests
You can execute the `GetPrayerRequests` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPrayerRequests(): QueryPromise<GetPrayerRequestsData, undefined>;

interface GetPrayerRequestsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPrayerRequestsData, undefined>;
}
export const getPrayerRequestsRef: GetPrayerRequestsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPrayerRequests(dc: DataConnect): QueryPromise<GetPrayerRequestsData, undefined>;

interface GetPrayerRequestsRef {
  ...
  (dc: DataConnect): QueryRef<GetPrayerRequestsData, undefined>;
}
export const getPrayerRequestsRef: GetPrayerRequestsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPrayerRequestsRef:
```typescript
const name = getPrayerRequestsRef.operationName;
console.log(name);
```

### Variables
The `GetPrayerRequests` query has no variables.
### Return Type
Recall that executing the `GetPrayerRequests` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPrayerRequestsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPrayerRequestsData {
  prayerRequests: ({
    id: UUIDString;
    requestText: string;
    isPrivate?: boolean | null;
    createdAt: TimestampString;
    answeredAt?: TimestampString | null;
  } & PrayerRequest_Key)[];
}
```
### Using `GetPrayerRequests`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPrayerRequests } from '@dataconnect/generated';


// Call the `getPrayerRequests()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPrayerRequests();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPrayerRequests(dataConnect);

console.log(data.prayerRequests);

// Or, you can use the `Promise` API.
getPrayerRequests().then((response) => {
  const data = response.data;
  console.log(data.prayerRequests);
});
```

### Using `GetPrayerRequests`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPrayerRequestsRef } from '@dataconnect/generated';


// Call the `getPrayerRequestsRef()` function to get a reference to the query.
const ref = getPrayerRequestsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPrayerRequestsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.prayerRequests);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.prayerRequests);
});
```

## ListGroups
You can execute the `ListGroups` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listGroups(): QueryPromise<ListGroupsData, undefined>;

interface ListGroupsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListGroupsData, undefined>;
}
export const listGroupsRef: ListGroupsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listGroups(dc: DataConnect): QueryPromise<ListGroupsData, undefined>;

interface ListGroupsRef {
  ...
  (dc: DataConnect): QueryRef<ListGroupsData, undefined>;
}
export const listGroupsRef: ListGroupsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listGroupsRef:
```typescript
const name = listGroupsRef.operationName;
console.log(name);
```

### Variables
The `ListGroups` query has no variables.
### Return Type
Recall that executing the `ListGroups` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListGroupsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListGroups`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listGroups } from '@dataconnect/generated';


// Call the `listGroups()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listGroups();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listGroups(dataConnect);

console.log(data.groups);

// Or, you can use the `Promise` API.
listGroups().then((response) => {
  const data = response.data;
  console.log(data.groups);
});
```

### Using `ListGroups`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listGroupsRef } from '@dataconnect/generated';


// Call the `listGroupsRef()` function to get a reference to the query.
const ref = listGroupsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listGroupsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.groups);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.groups);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreatePrayerRequest
You can execute the `CreatePrayerRequest` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPrayerRequest(vars: CreatePrayerRequestVariables): MutationPromise<CreatePrayerRequestData, CreatePrayerRequestVariables>;

interface CreatePrayerRequestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePrayerRequestVariables): MutationRef<CreatePrayerRequestData, CreatePrayerRequestVariables>;
}
export const createPrayerRequestRef: CreatePrayerRequestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPrayerRequest(dc: DataConnect, vars: CreatePrayerRequestVariables): MutationPromise<CreatePrayerRequestData, CreatePrayerRequestVariables>;

interface CreatePrayerRequestRef {
  ...
  (dc: DataConnect, vars: CreatePrayerRequestVariables): MutationRef<CreatePrayerRequestData, CreatePrayerRequestVariables>;
}
export const createPrayerRequestRef: CreatePrayerRequestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPrayerRequestRef:
```typescript
const name = createPrayerRequestRef.operationName;
console.log(name);
```

### Variables
The `CreatePrayerRequest` mutation requires an argument of type `CreatePrayerRequestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePrayerRequestVariables {
  requestText: string;
  isPrivate?: boolean | null;
}
```
### Return Type
Recall that executing the `CreatePrayerRequest` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePrayerRequestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePrayerRequestData {
  prayerRequest_insert: PrayerRequest_Key;
}
```
### Using `CreatePrayerRequest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPrayerRequest, CreatePrayerRequestVariables } from '@dataconnect/generated';

// The `CreatePrayerRequest` mutation requires an argument of type `CreatePrayerRequestVariables`:
const createPrayerRequestVars: CreatePrayerRequestVariables = {
  requestText: ..., 
  isPrivate: ..., // optional
};

// Call the `createPrayerRequest()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPrayerRequest(createPrayerRequestVars);
// Variables can be defined inline as well.
const { data } = await createPrayerRequest({ requestText: ..., isPrivate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPrayerRequest(dataConnect, createPrayerRequestVars);

console.log(data.prayerRequest_insert);

// Or, you can use the `Promise` API.
createPrayerRequest(createPrayerRequestVars).then((response) => {
  const data = response.data;
  console.log(data.prayerRequest_insert);
});
```

### Using `CreatePrayerRequest`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPrayerRequestRef, CreatePrayerRequestVariables } from '@dataconnect/generated';

// The `CreatePrayerRequest` mutation requires an argument of type `CreatePrayerRequestVariables`:
const createPrayerRequestVars: CreatePrayerRequestVariables = {
  requestText: ..., 
  isPrivate: ..., // optional
};

// Call the `createPrayerRequestRef()` function to get a reference to the mutation.
const ref = createPrayerRequestRef(createPrayerRequestVars);
// Variables can be defined inline as well.
const ref = createPrayerRequestRef({ requestText: ..., isPrivate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPrayerRequestRef(dataConnect, createPrayerRequestVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.prayerRequest_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.prayerRequest_insert);
});
```

## JoinGroup
You can execute the `JoinGroup` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
joinGroup(vars: JoinGroupVariables): MutationPromise<JoinGroupData, JoinGroupVariables>;

interface JoinGroupRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: JoinGroupVariables): MutationRef<JoinGroupData, JoinGroupVariables>;
}
export const joinGroupRef: JoinGroupRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
joinGroup(dc: DataConnect, vars: JoinGroupVariables): MutationPromise<JoinGroupData, JoinGroupVariables>;

interface JoinGroupRef {
  ...
  (dc: DataConnect, vars: JoinGroupVariables): MutationRef<JoinGroupData, JoinGroupVariables>;
}
export const joinGroupRef: JoinGroupRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the joinGroupRef:
```typescript
const name = joinGroupRef.operationName;
console.log(name);
```

### Variables
The `JoinGroup` mutation requires an argument of type `JoinGroupVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface JoinGroupVariables {
  groupId: UUIDString;
}
```
### Return Type
Recall that executing the `JoinGroup` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `JoinGroupData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface JoinGroupData {
  groupMembership_insert: GroupMembership_Key;
}
```
### Using `JoinGroup`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, joinGroup, JoinGroupVariables } from '@dataconnect/generated';

// The `JoinGroup` mutation requires an argument of type `JoinGroupVariables`:
const joinGroupVars: JoinGroupVariables = {
  groupId: ..., 
};

// Call the `joinGroup()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await joinGroup(joinGroupVars);
// Variables can be defined inline as well.
const { data } = await joinGroup({ groupId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await joinGroup(dataConnect, joinGroupVars);

console.log(data.groupMembership_insert);

// Or, you can use the `Promise` API.
joinGroup(joinGroupVars).then((response) => {
  const data = response.data;
  console.log(data.groupMembership_insert);
});
```

### Using `JoinGroup`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, joinGroupRef, JoinGroupVariables } from '@dataconnect/generated';

// The `JoinGroup` mutation requires an argument of type `JoinGroupVariables`:
const joinGroupVars: JoinGroupVariables = {
  groupId: ..., 
};

// Call the `joinGroupRef()` function to get a reference to the mutation.
const ref = joinGroupRef(joinGroupVars);
// Variables can be defined inline as well.
const ref = joinGroupRef({ groupId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = joinGroupRef(dataConnect, joinGroupVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.groupMembership_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.groupMembership_insert);
});
```

