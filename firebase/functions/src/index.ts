import { initializeApp } from 'firebase-admin/app';
import { confirmDistributionAdmin } from '@chicken-village/sql-connect-admin';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';

initializeApp();
setGlobalOptions({ region: 'asia-east1', maxInstances: 10 });

interface ConfirmDistributionInput {
  distributionId?: unknown;
  expectedRevision?: unknown;
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export const confirmDistribution = onCall<ConfirmDistributionInput>(
  { enforceAppCheck: true, consumeAppCheckToken: true },
  async (request) => {
    if (!request.auth || request.auth.token.firebase?.sign_in_provider === 'anonymous') {
      throw new HttpsError('unauthenticated', '需要已驗證的非匿名帳號。');
    }
    const { distributionId, expectedRevision } = request.data;
    if (!isUuid(distributionId) || !Number.isSafeInteger(expectedRevision) || Number(expectedRevision) < 1) {
      throw new HttpsError('invalid-argument', 'distributionId 或 expectedRevision 無效。');
    }

    try {
      const result = await confirmDistributionAdmin({
        id: distributionId,
        ownerUid: request.auth.uid,
        expectedRevision: Number(expectedRevision),
        confirmedAt: new Date().toISOString(),
      });
      const updated = result.data.distributionRecord_update;
      if (!updated) throw new Error('SQL Connect returned no updated key');
      return { id: updated.id, revision: Number(expectedRevision) + 1, status: 'confirmed' as const };
    } catch (error) {
      console.error('confirmDistribution rejected', { uid: request.auth.uid, distributionId, error });
      throw new HttpsError('aborted', '資料已變更、已確認，或不屬於目前帳號；請同步後重試。');
    }
  },
);

const OFFICIAL_ENDPOINTS = new Set([
  'PoultryTransType_RedFeather',
  'PoultryTransType_BlackFeather',
  'PoultryTransType_BoiledChicken_Eggs',
]);

interface OfficialMarketInput {
  endpoint?: unknown;
  start?: unknown;
  end?: unknown;
}

export const officialMarketProxy = onCall<OfficialMarketInput>(
  { enforceAppCheck: true, consumeAppCheckToken: true, timeoutSeconds: 15 },
  async (request) => {
    const endpoint = typeof request.data.endpoint === 'string' ? request.data.endpoint : '';
    const start = typeof request.data.start === 'string' ? request.data.start : '';
    const end = typeof request.data.end === 'string' ? request.data.end : '';
    if (!OFFICIAL_ENDPOINTS.has(endpoint) || !/^\d{4}\/\d{2}\/\d{2}$/.test(start) || !/^\d{4}\/\d{2}\/\d{2}$/.test(end)) {
      throw new HttpsError('invalid-argument', 'endpoint、start 或 end 無效。');
    }
    const upstream = new URL(`https://data.moa.gov.tw/api/v1/${endpoint}`);
    upstream.searchParams.set('Start_time', start);
    upstream.searchParams.set('End_time', end);
    try {
      const upstreamResponse = await fetch(upstream, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10_000) });
      const body = await upstreamResponse.text();
      if (!upstreamResponse.ok) throw new Error(`MOA returned ${upstreamResponse.status}`);
      return { endpoint, fetchedAt: new Date().toISOString(), payload: JSON.parse(body) as unknown };
    } catch (error) {
      console.error('officialMarketProxy upstream failure', { endpoint, error });
      throw new HttpsError('unavailable', '農業部正式資料來源目前無法連線。');
    }
  },
);
