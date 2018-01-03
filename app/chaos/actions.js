/*
 * action types
 */
export const TICK = 'tick';
export const ADVANCE_SYMBOLS_COMPLETE = 'advance_symbols_complete';
export const EXCHANGE_SYMBOLS_COMPLETE = 'exchange_symbols_complete';

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

export function exchange_symbols_complete() {
  return {type: EXCHANGE_SYMBOLS_COMPLETE};
}

