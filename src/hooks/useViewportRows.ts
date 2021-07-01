import { useMemo } from 'react';

const RENDER_BACTCH_SIZE = 8;

interface ViewportRowsArgs<R> {
  rawRows: readonly R[];
  rowHeight: number;
  clientHeight: number;
  scrollTop: number;
}

// https://github.com/microsoft/TypeScript/issues/41808
function isReadonlyArray(arr: unknown): arr is readonly unknown[] {
  return Array.isArray(arr);
}

export function useViewportRows<R>({
  rawRows,
  rowHeight,
  clientHeight,
  scrollTop
}: ViewportRowsArgs<R>) {
  const [rowsCount] = useMemo(() => {
    return [rawRows.length];
  }, [rawRows]);

  const [rows] = useMemo(() => {
    return [rawRows];
  }, [rawRows]);

  const overscanThreshold = 4;
  const rowVisibleStartIdx = Math.floor(scrollTop / rowHeight);
  const rowVisibleEndIdx = Math.min(rows.length - 1, Math.floor((scrollTop + clientHeight) / rowHeight));
  const rowOverscanStartIdx = Math.max(0, Math.floor((rowVisibleStartIdx - overscanThreshold) / RENDER_BACTCH_SIZE) * RENDER_BACTCH_SIZE);
  const rowOverscanEndIdx = Math.min(rows.length - 1, Math.ceil((rowVisibleEndIdx + overscanThreshold) / RENDER_BACTCH_SIZE) * RENDER_BACTCH_SIZE);

  return {
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    rows,
    rowsCount
  };
}
