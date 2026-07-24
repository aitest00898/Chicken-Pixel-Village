import type {
  AuditEvent,
  DistributionRecord,
  FlockBatch,
  MapPlacement,
  RiskAssessment,
  FosterFarmer,
  Organization,
  OrganizationMembership,
  Shareholder,
  Shareholding,
} from '@chicken-village/domain';
import type { OutboxOperation } from '@chicken-village/sync';

export interface VillageOperations {
  organizations: Organization[];
  memberships: OrganizationMembership[];
  fosterFarmers: FosterFarmer[];
  batches: FlockBatch[];
  shareholders: Shareholder[];
  shareholdings: Shareholding[];
  distributions: DistributionRecord[];
  riskAssessments: RiskAssessment[];
  mapPlacements: MapPlacement[];
  auditEvents: AuditEvent[];
  outbox: OutboxOperation[];
}
