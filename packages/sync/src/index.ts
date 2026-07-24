export type OutboxStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';

export type EntitySensitivity = 'public_reference' | 'descriptive_private' | 'financial' | 'confirmed_batch';

export interface OutboxOperation<T = unknown> {
  operationId: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  sensitivity: EntitySensitivity;
  baseRevision: number;
  idempotencyKey: string;
  payload: T;
  status: OutboxStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PushResult {
  kind: 'accepted' | 'already_applied' | 'revision_conflict' | 'retryable_error' | 'validation_error';
  serverRevision?: number;
  message?: string;
}

export function startSync<T>(operation: OutboxOperation<T>, now: string): OutboxOperation<T> {
  if (operation.status !== 'pending') throw new Error('Only pending operations can start syncing');
  return { ...operation, status: 'syncing', attempts: operation.attempts + 1, lastError: null, updatedAt: now };
}

export function applyPushResult<T>(operation: OutboxOperation<T>, result: PushResult, now: string): OutboxOperation<T> {
  if (operation.status !== 'syncing') throw new Error('Push results require a syncing operation');
  switch (result.kind) {
    case 'accepted':
    case 'already_applied':
      return { ...operation, status: 'synced', lastError: null, updatedAt: now };
    case 'revision_conflict':
      return { ...operation, status: 'conflict', lastError: result.message ?? 'revision_conflict', updatedAt: now };
    case 'retryable_error':
      return { ...operation, status: 'pending', lastError: result.message ?? 'retryable_error', updatedAt: now };
    case 'validation_error':
      return { ...operation, status: 'failed', lastError: result.message ?? 'validation_error', updatedAt: now };
  }
}

export function mayAutoResolve(operation: OutboxOperation): boolean {
  return operation.sensitivity === 'public_reference';
}

export function assertSafeConflictPolicy(operation: OutboxOperation, strategy: 'server' | 'client' | 'manual'): void {
  if ((operation.sensitivity === 'financial' || operation.sensitivity === 'confirmed_batch') && strategy !== 'manual') {
    throw new Error('Financial and confirmed-batch conflicts require manual resolution');
  }
}

export function makeIdempotencyKey(deviceId: string, operationId: string): string {
  if (!deviceId || !operationId) throw new Error('Idempotency keys require device and operation IDs');
  return `${deviceId}:${operationId}`;
}

