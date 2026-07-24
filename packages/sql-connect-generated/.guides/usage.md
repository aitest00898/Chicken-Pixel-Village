# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { confirmDistributionAdmin, myOrganizations, myChickenHouses, createOrganization, createChickenHouse, financialRecordsServerOnly, latestMarketRecords, listEquipment } from '@chicken-village/sql-connect';


// Operation ConfirmDistributionAdmin:  For variables, look at type ConfirmDistributionAdminVars in ../index.d.ts
const { data } = await ConfirmDistributionAdmin(dataConnect, confirmDistributionAdminVars);

// Operation MyOrganizations: 
const { data } = await MyOrganizations(dataConnect);

// Operation MyChickenHouses: 
const { data } = await MyChickenHouses(dataConnect);

// Operation CreateOrganization:  For variables, look at type CreateOrganizationVars in ../index.d.ts
const { data } = await CreateOrganization(dataConnect, createOrganizationVars);

// Operation CreateChickenHouse:  For variables, look at type CreateChickenHouseVars in ../index.d.ts
const { data } = await CreateChickenHouse(dataConnect, createChickenHouseVars);

// Operation FinancialRecordsServerOnly: 
const { data } = await FinancialRecordsServerOnly(dataConnect);

// Operation LatestMarketRecords: 
const { data } = await LatestMarketRecords(dataConnect);

// Operation ListEquipment: 
const { data } = await ListEquipment(dataConnect);


```