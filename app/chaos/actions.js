/*
 * action types
 */
export const TICK = 'tick';
export const ADVANCE_SYMBOLS_COMPLETE = 'advance_symbols_complete';

/*
 * other constants
 */

/*
 * action creators
 */
export function tick() {
  return {type: TICK};
}

export function advance_symbols_complete() {
  return {type: ADVANCE_SYMBOLS_COMPLETE};
}
