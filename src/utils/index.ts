export * from './domUtils';
export * from './columnUtils';
export * from './keyboardUtils';
export * from './selectedCellUtils';
export * from './inputUtils';

export function assertIsValidKeyGetter<R>(keyGetter: unknown): asserts keyGetter is (row: R) => React.Key {
  if (typeof keyGetter !== 'function') {
    throw new Error('Please specify the rowKeyGetter prop to use selection');
  }
}
