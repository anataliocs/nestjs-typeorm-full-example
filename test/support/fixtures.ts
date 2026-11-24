/** Genesis timestamp, so block dates are deterministic. */
export const GENESIS = new Date('2025-01-01T00:00:00.000Z');
/**
 * anvil derives `finalized` as `head − 2 · slotsInAnEpoch` (clamped at
 * genesis). One slot per epoch makes finality lag the head by two blocks.
 */
export const SLOTS_IN_AN_EPOCH = 1;