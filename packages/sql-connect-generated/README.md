# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `mobile`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*MyOrganizations*](#myorganizations)
  - [*MyChickenHouses*](#mychickenhouses)
  - [*FinancialRecordsServerOnly*](#financialrecordsserveronly)
  - [*LatestMarketRecords*](#latestmarketrecords)
  - [*ListEquipment*](#listequipment)
- [**Mutations**](#mutations)
  - [*ConfirmDistributionAdmin*](#confirmdistributionadmin)
  - [*CreateOrganization*](#createorganization)
  - [*CreateChickenHouse*](#createchickenhouse)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `mobile`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@chicken-village/sql-connect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@chicken-village/sql-connect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@chicken-village/sql-connect';

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

Below are examples of how to use the `mobile` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## MyOrganizations
You can execute the `MyOrganizations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sql-connect-generated/index.d.ts](./index.d.ts):
```typescript
myOrganizations(options?: ExecuteQueryOptions): QueryPromise<MyOrganizationsData, undefined>;

interface MyOrganizationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyOrganizationsData, undefined>;
}
export const myOrganizationsRef: MyOrganizationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myOrganizations(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyOrganizationsData, undefined>;

interface MyOrganizationsRef {
  ...
  (dc: DataConnect): QueryRef<MyOrganizationsData, undefined>;
}
export const myOrganizationsRef: MyOrganizationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myOrganizationsRef:
```typescript
const name = myOrganizationsRef.operationName;
console.log(name);
```

### Variables
The `MyOrganizations` query has no variables.
### Return Type
Recall that executing the `MyOrganizations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyOrganizationsData`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface MyOrganizationsData {
  organizations: ({
    id: UUIDString;
    name: string;
    revision: number;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & Organization_Key)[];
}
```
### Using `MyOrganizations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myOrganizations } from '@chicken-village/sql-connect';


// Call the `myOrganizations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myOrganizations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myOrganizations(dataConnect);

console.log(data.organizations);

// Or, you can use the `Promise` API.
myOrganizations().then((response) => {
  const data = response.data;
  console.log(data.organizations);
});
```

### Using `MyOrganizations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myOrganizationsRef } from '@chicken-village/sql-connect';


// Call the `myOrganizationsRef()` function to get a reference to the query.
const ref = myOrganizationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myOrganizationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.organizations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.organizations);
});
```

## MyChickenHouses
You can execute the `MyChickenHouses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sql-connect-generated/index.d.ts](./index.d.ts):
```typescript
myChickenHouses(options?: ExecuteQueryOptions): QueryPromise<MyChickenHousesData, undefined>;

interface MyChickenHousesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyChickenHousesData, undefined>;
}
export const myChickenHousesRef: MyChickenHousesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myChickenHouses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyChickenHousesData, undefined>;

interface MyChickenHousesRef {
  ...
  (dc: DataConnect): QueryRef<MyChickenHousesData, undefined>;
}
export const myChickenHousesRef: MyChickenHousesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myChickenHousesRef:
```typescript
const name = myChickenHousesRef.operationName;
console.log(name);
```

### Variables
The `MyChickenHouses` query has no variables.
### Return Type
Recall that executing the `MyChickenHouses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyChickenHousesData`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `MyChickenHouses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myChickenHouses } from '@chicken-village/sql-connect';


// Call the `myChickenHouses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myChickenHouses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myChickenHouses(dataConnect);

console.log(data.chickenHouses);

// Or, you can use the `Promise` API.
myChickenHouses().then((response) => {
  const data = response.data;
  console.log(data.chickenHouses);
});
```

### Using `MyChickenHouses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myChickenHousesRef } from '@chicken-village/sql-connect';


// Call the `myChickenHousesRef()` function to get a reference to the query.
const ref = myChickenHousesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myChickenHousesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chickenHouses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chickenHouses);
});
```

## FinancialRecordsServerOnly
You can execute the `FinancialRecordsServerOnly` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sql-connect-generated/index.d.ts](./index.d.ts):
```typescript
financialRecordsServerOnly(options?: ExecuteQueryOptions): QueryPromise<FinancialRecordsServerOnlyData, undefined>;

interface FinancialRecordsServerOnlyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<FinancialRecordsServerOnlyData, undefined>;
}
export const financialRecordsServerOnlyRef: FinancialRecordsServerOnlyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
financialRecordsServerOnly(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<FinancialRecordsServerOnlyData, undefined>;

interface FinancialRecordsServerOnlyRef {
  ...
  (dc: DataConnect): QueryRef<FinancialRecordsServerOnlyData, undefined>;
}
export const financialRecordsServerOnlyRef: FinancialRecordsServerOnlyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the financialRecordsServerOnlyRef:
```typescript
const name = financialRecordsServerOnlyRef.operationName;
console.log(name);
```

### Variables
The `FinancialRecordsServerOnly` query has no variables.
### Return Type
Recall that executing the `FinancialRecordsServerOnly` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `FinancialRecordsServerOnlyData`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface FinancialRecordsServerOnlyData {
  distributionRecords: ({
    id: UUIDString;
    status: string;
    revision: number;
  } & DistributionRecord_Key)[];
}
```
### Using `FinancialRecordsServerOnly`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, financialRecordsServerOnly } from '@chicken-village/sql-connect';


// Call the `financialRecordsServerOnly()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await financialRecordsServerOnly();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await financialRecordsServerOnly(dataConnect);

console.log(data.distributionRecords);

// Or, you can use the `Promise` API.
financialRecordsServerOnly().then((response) => {
  const data = response.data;
  console.log(data.distributionRecords);
});
```

### Using `FinancialRecordsServerOnly`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, financialRecordsServerOnlyRef } from '@chicken-village/sql-connect';


// Call the `financialRecordsServerOnlyRef()` function to get a reference to the query.
const ref = financialRecordsServerOnlyRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = financialRecordsServerOnlyRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.distributionRecords);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.distributionRecords);
});
```

## LatestMarketRecords
You can execute the `LatestMarketRecords` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sql-connect-generated/index.d.ts](./index.d.ts):
```typescript
latestMarketRecords(options?: ExecuteQueryOptions): QueryPromise<LatestMarketRecordsData, undefined>;

interface LatestMarketRecordsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<LatestMarketRecordsData, undefined>;
}
export const latestMarketRecordsRef: LatestMarketRecordsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
latestMarketRecords(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<LatestMarketRecordsData, undefined>;

interface LatestMarketRecordsRef {
  ...
  (dc: DataConnect): QueryRef<LatestMarketRecordsData, undefined>;
}
export const latestMarketRecordsRef: LatestMarketRecordsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the latestMarketRecordsRef:
```typescript
const name = latestMarketRecordsRef.operationName;
console.log(name);
```

### Variables
The `LatestMarketRecords` query has no variables.
### Return Type
Recall that executing the `LatestMarketRecords` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `LatestMarketRecordsData`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `LatestMarketRecords`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, latestMarketRecords } from '@chicken-village/sql-connect';


// Call the `latestMarketRecords()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await latestMarketRecords();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await latestMarketRecords(dataConnect);

console.log(data.marketRecords);

// Or, you can use the `Promise` API.
latestMarketRecords().then((response) => {
  const data = response.data;
  console.log(data.marketRecords);
});
```

### Using `LatestMarketRecords`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, latestMarketRecordsRef } from '@chicken-village/sql-connect';


// Call the `latestMarketRecordsRef()` function to get a reference to the query.
const ref = latestMarketRecordsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = latestMarketRecordsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.marketRecords);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.marketRecords);
});
```

## ListEquipment
You can execute the `ListEquipment` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sql-connect-generated/index.d.ts](./index.d.ts):
```typescript
listEquipment(options?: ExecuteQueryOptions): QueryPromise<ListEquipmentData, undefined>;

interface ListEquipmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEquipmentData, undefined>;
}
export const listEquipmentRef: ListEquipmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listEquipment(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListEquipmentData, undefined>;

interface ListEquipmentRef {
  ...
  (dc: DataConnect): QueryRef<ListEquipmentData, undefined>;
}
export const listEquipmentRef: ListEquipmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listEquipmentRef:
```typescript
const name = listEquipmentRef.operationName;
console.log(name);
```

### Variables
The `ListEquipment` query has no variables.
### Return Type
Recall that executing the `ListEquipment` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListEquipmentData`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListEquipmentData {
  equipmentItems: ({
    id: string;
    slot: string;
    name: string;
    unlockDays: number;
    spriteKey: string;
  } & EquipmentItem_Key)[];
}
```
### Using `ListEquipment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listEquipment } from '@chicken-village/sql-connect';


// Call the `listEquipment()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listEquipment();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listEquipment(dataConnect);

console.log(data.equipmentItems);

// Or, you can use the `Promise` API.
listEquipment().then((response) => {
  const data = response.data;
  console.log(data.equipmentItems);
});
```

### Using `ListEquipment`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listEquipmentRef } from '@chicken-village/sql-connect';


// Call the `listEquipmentRef()` function to get a reference to the query.
const ref = listEquipmentRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listEquipmentRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.equipmentItems);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.equipmentItems);
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

Below are examples of how to use the `mobile` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## ConfirmDistributionAdmin
You can execute the `ConfirmDistributionAdmin` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sql-connect-generated/index.d.ts](./index.d.ts):
```typescript
confirmDistributionAdmin(vars: ConfirmDistributionAdminVariables): MutationPromise<ConfirmDistributionAdminData, ConfirmDistributionAdminVariables>;

interface ConfirmDistributionAdminRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ConfirmDistributionAdminVariables): MutationRef<ConfirmDistributionAdminData, ConfirmDistributionAdminVariables>;
}
export const confirmDistributionAdminRef: ConfirmDistributionAdminRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
confirmDistributionAdmin(dc: DataConnect, vars: ConfirmDistributionAdminVariables): MutationPromise<ConfirmDistributionAdminData, ConfirmDistributionAdminVariables>;

interface ConfirmDistributionAdminRef {
  ...
  (dc: DataConnect, vars: ConfirmDistributionAdminVariables): MutationRef<ConfirmDistributionAdminData, ConfirmDistributionAdminVariables>;
}
export const confirmDistributionAdminRef: ConfirmDistributionAdminRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the confirmDistributionAdminRef:
```typescript
const name = confirmDistributionAdminRef.operationName;
console.log(name);
```

### Variables
The `ConfirmDistributionAdmin` mutation requires an argument of type `ConfirmDistributionAdminVariables`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ConfirmDistributionAdminVariables {
  id: UUIDString;
  ownerUid: string;
  expectedRevision: number;
  confirmedAt: TimestampString;
}
```
### Return Type
Recall that executing the `ConfirmDistributionAdmin` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ConfirmDistributionAdminData`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ConfirmDistributionAdminData {
  distributionRecord_update?: DistributionRecord_Key | null;
}
```
### Using `ConfirmDistributionAdmin`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, confirmDistributionAdmin, ConfirmDistributionAdminVariables } from '@chicken-village/sql-connect';

// The `ConfirmDistributionAdmin` mutation requires an argument of type `ConfirmDistributionAdminVariables`:
const confirmDistributionAdminVars: ConfirmDistributionAdminVariables = {
  id: ..., 
  ownerUid: ..., 
  expectedRevision: ..., 
  confirmedAt: ..., 
};

// Call the `confirmDistributionAdmin()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await confirmDistributionAdmin(confirmDistributionAdminVars);
// Variables can be defined inline as well.
const { data } = await confirmDistributionAdmin({ id: ..., ownerUid: ..., expectedRevision: ..., confirmedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await confirmDistributionAdmin(dataConnect, confirmDistributionAdminVars);

console.log(data.distributionRecord_update);

// Or, you can use the `Promise` API.
confirmDistributionAdmin(confirmDistributionAdminVars).then((response) => {
  const data = response.data;
  console.log(data.distributionRecord_update);
});
```

### Using `ConfirmDistributionAdmin`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, confirmDistributionAdminRef, ConfirmDistributionAdminVariables } from '@chicken-village/sql-connect';

// The `ConfirmDistributionAdmin` mutation requires an argument of type `ConfirmDistributionAdminVariables`:
const confirmDistributionAdminVars: ConfirmDistributionAdminVariables = {
  id: ..., 
  ownerUid: ..., 
  expectedRevision: ..., 
  confirmedAt: ..., 
};

// Call the `confirmDistributionAdminRef()` function to get a reference to the mutation.
const ref = confirmDistributionAdminRef(confirmDistributionAdminVars);
// Variables can be defined inline as well.
const ref = confirmDistributionAdminRef({ id: ..., ownerUid: ..., expectedRevision: ..., confirmedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = confirmDistributionAdminRef(dataConnect, confirmDistributionAdminVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.distributionRecord_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.distributionRecord_update);
});
```

## CreateOrganization
You can execute the `CreateOrganization` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sql-connect-generated/index.d.ts](./index.d.ts):
```typescript
createOrganization(vars: CreateOrganizationVariables): MutationPromise<CreateOrganizationData, CreateOrganizationVariables>;

interface CreateOrganizationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrganizationVariables): MutationRef<CreateOrganizationData, CreateOrganizationVariables>;
}
export const createOrganizationRef: CreateOrganizationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createOrganization(dc: DataConnect, vars: CreateOrganizationVariables): MutationPromise<CreateOrganizationData, CreateOrganizationVariables>;

interface CreateOrganizationRef {
  ...
  (dc: DataConnect, vars: CreateOrganizationVariables): MutationRef<CreateOrganizationData, CreateOrganizationVariables>;
}
export const createOrganizationRef: CreateOrganizationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createOrganizationRef:
```typescript
const name = createOrganizationRef.operationName;
console.log(name);
```

### Variables
The `CreateOrganization` mutation requires an argument of type `CreateOrganizationVariables`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateOrganizationVariables {
  name: string;
}
```
### Return Type
Recall that executing the `CreateOrganization` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateOrganizationData`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateOrganizationData {
  organization_insert: Organization_Key;
}
```
### Using `CreateOrganization`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createOrganization, CreateOrganizationVariables } from '@chicken-village/sql-connect';

// The `CreateOrganization` mutation requires an argument of type `CreateOrganizationVariables`:
const createOrganizationVars: CreateOrganizationVariables = {
  name: ..., 
};

// Call the `createOrganization()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createOrganization(createOrganizationVars);
// Variables can be defined inline as well.
const { data } = await createOrganization({ name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createOrganization(dataConnect, createOrganizationVars);

console.log(data.organization_insert);

// Or, you can use the `Promise` API.
createOrganization(createOrganizationVars).then((response) => {
  const data = response.data;
  console.log(data.organization_insert);
});
```

### Using `CreateOrganization`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createOrganizationRef, CreateOrganizationVariables } from '@chicken-village/sql-connect';

// The `CreateOrganization` mutation requires an argument of type `CreateOrganizationVariables`:
const createOrganizationVars: CreateOrganizationVariables = {
  name: ..., 
};

// Call the `createOrganizationRef()` function to get a reference to the mutation.
const ref = createOrganizationRef(createOrganizationVars);
// Variables can be defined inline as well.
const ref = createOrganizationRef({ name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createOrganizationRef(dataConnect, createOrganizationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.organization_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.organization_insert);
});
```

## CreateChickenHouse
You can execute the `CreateChickenHouse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sql-connect-generated/index.d.ts](./index.d.ts):
```typescript
createChickenHouse(vars: CreateChickenHouseVariables): MutationPromise<CreateChickenHouseData, CreateChickenHouseVariables>;

interface CreateChickenHouseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateChickenHouseVariables): MutationRef<CreateChickenHouseData, CreateChickenHouseVariables>;
}
export const createChickenHouseRef: CreateChickenHouseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createChickenHouse(dc: DataConnect, vars: CreateChickenHouseVariables): MutationPromise<CreateChickenHouseData, CreateChickenHouseVariables>;

interface CreateChickenHouseRef {
  ...
  (dc: DataConnect, vars: CreateChickenHouseVariables): MutationRef<CreateChickenHouseData, CreateChickenHouseVariables>;
}
export const createChickenHouseRef: CreateChickenHouseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createChickenHouseRef:
```typescript
const name = createChickenHouseRef.operationName;
console.log(name);
```

### Variables
The `CreateChickenHouse` mutation requires an argument of type `CreateChickenHouseVariables`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateChickenHouseVariables {
  organizationId: UUIDString;
  name: string;
  capacity: number;
  occupancy: number;
  houseType: string;
}
```
### Return Type
Recall that executing the `CreateChickenHouse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateChickenHouseData`, which is defined in [sql-connect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateChickenHouseData {
  chickenHouse_insert: ChickenHouse_Key;
}
```
### Using `CreateChickenHouse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createChickenHouse, CreateChickenHouseVariables } from '@chicken-village/sql-connect';

// The `CreateChickenHouse` mutation requires an argument of type `CreateChickenHouseVariables`:
const createChickenHouseVars: CreateChickenHouseVariables = {
  organizationId: ..., 
  name: ..., 
  capacity: ..., 
  occupancy: ..., 
  houseType: ..., 
};

// Call the `createChickenHouse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createChickenHouse(createChickenHouseVars);
// Variables can be defined inline as well.
const { data } = await createChickenHouse({ organizationId: ..., name: ..., capacity: ..., occupancy: ..., houseType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createChickenHouse(dataConnect, createChickenHouseVars);

console.log(data.chickenHouse_insert);

// Or, you can use the `Promise` API.
createChickenHouse(createChickenHouseVars).then((response) => {
  const data = response.data;
  console.log(data.chickenHouse_insert);
});
```

### Using `CreateChickenHouse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createChickenHouseRef, CreateChickenHouseVariables } from '@chicken-village/sql-connect';

// The `CreateChickenHouse` mutation requires an argument of type `CreateChickenHouseVariables`:
const createChickenHouseVars: CreateChickenHouseVariables = {
  organizationId: ..., 
  name: ..., 
  capacity: ..., 
  occupancy: ..., 
  houseType: ..., 
};

// Call the `createChickenHouseRef()` function to get a reference to the mutation.
const ref = createChickenHouseRef(createChickenHouseVars);
// Variables can be defined inline as well.
const ref = createChickenHouseRef({ organizationId: ..., name: ..., capacity: ..., occupancy: ..., houseType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createChickenHouseRef(dataConnect, createChickenHouseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chickenHouse_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chickenHouse_insert);
});
```

