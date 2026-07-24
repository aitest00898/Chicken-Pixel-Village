# Data Model

Core synchronized records include `id`, `organizationId`, `revision`, `createdAt`, `updatedAt`, nullable `deletedAt`, `deviceId`, `operationId` and `syncStatus`.

Separate entities: organizations, organization memberships, chicken houses, foster farmers, flock batches, shareholders, shareholdings, distribution records, distribution entries, risk assessments, risk answers, map placements and audit events.

Financial ratios are integer basis points. TWD is integer. Shareholding keeps ownership, profit and loss ratios distinct. Confirmed records are append-corrected through adjustment or reversal.

