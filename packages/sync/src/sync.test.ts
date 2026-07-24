import { describe, expect, it } from 'vitest';
import { applyPushResult, assertSafeConflictPolicy, makeIdempotencyKey, startSync, type OutboxOperation } from './index';

const operation: OutboxOperation = {
  operationId: 'op-1', organizationId: 'org-1', entityType: 'distribution', entityId: 'dist-1', sensitivity: 'financial',
  baseRevision: 3, idempotencyKey: 'device:op-1', payload: {}, status: 'pending', attempts: 0, lastError: null,
  createdAt: '2026-07-24T00:00:00Z', updatedAt: '2026-07-24T00:00:00Z',
};

describe('outbox state machine', () => {
  it('retries without changing the idempotency key', () => {
    const syncing = startSync(operation, '2026-07-24T00:01:00Z');
    const retried = applyPushResult(syncing, { kind: 'retryable_error' }, '2026-07-24T00:02:00Z');
    expect(retried).toMatchObject({ status: 'pending', attempts: 1, idempotencyKey: 'device:op-1' });
  });

  it('treats duplicate accepted operations as synced', () => {
    expect(applyPushResult(startSync(operation, 'now'), { kind: 'already_applied' }, 'later').status).toBe('synced');
  });

  it('stops financial conflicts for manual resolution', () => {
    expect(() => assertSafeConflictPolicy(operation, 'client')).toThrow();
    expect(() => assertSafeConflictPolicy(operation, 'manual')).not.toThrow();
  });

  it('creates stable idempotency keys', () => {
    expect(makeIdempotencyKey('device-1', 'op-1')).toBe('device-1:op-1');
  });
});

