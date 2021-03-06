import React, {
  forwardRef,
  useState,
  useRef,
  useLayoutEffect,
  useImperativeHandle,
  useCallback
} from 'react';
import clsx from 'clsx';
import isEqual from 'lodash/isEqual';

import { useGridDimensions, useViewportColumns, useViewportRows, useLatestFunc } from './hooks';
import HeaderRow from './HeaderRow';
import Row from './Row';
import {
  assertIsValidKeyGetter,
  getColumnScrollPosition,
  onEditorNavigation,
  getNextSelectedCellPosition,
  isSelectedCellEditable,
  canExitGrid,
  isCtrlKeyHeldDown,
  isDefaultCellInput,
  checkIfCellDisabled
} from './utils';

import type {
  CalculatedColumn,
  Column,
  Filters,
  Position,
  RowRendererProps,
  SelectRowEvent,
  SelectedCellProps,
  EditCellProps,
  FillEvent,
  PasteEvent,
  CellType
} from './types';
import type { CellNavigationMode, SortDirection } from './enums';

interface SelectCellState extends Position {
  mode: 'SELECT';
}

interface EditCellState<R> extends Position {
  mode: 'EDIT';
  row: R;
  originalRow: R;
  key: string | null;
}

type DefaultColumnOptions<R, SR> = Pick<Column<R, SR>,
  | 'formatter'
  | 'minWidth'
  | 'resizable'
  | 'sortable'
>;

interface RowsChangeParams<R, SR> {
  newRows: R[];
  updatedTargetRows?: R[];
  targetRows?: R[];
  targetCols?: CalculatedColumn<R, SR>[];
  key?: string | null;
  position?: R;
  type?: 'paste' | 'fill' | 'edit';
}

const body = globalThis.document?.body;

export interface DataGridHandle {
  scrollToColumn: (colIdx: number) => void;
  scrollToRow: (rowIdx: number) => void;
  selectCell: (position: Position, openEditor?: boolean) => void;
}

type SharedDivProps = Pick<React.HTMLAttributes<HTMLDivElement>,
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'className'
  | 'style'
>;

export interface DataGridProps<R, SR = unknown> extends SharedDivProps {
  /**
   * Grid and data Props
   */
  /** An array of objects representing each column on the grid */
  columns: readonly Column<R, SR>[];
  /** A function called for each rendered row that should return a plain key/value pair object */
  rows: readonly R[];
  /**
   * Rows to be pinned at the bottom of the rows view for summary, the vertical scroll bar will not scroll these rows.
   * Bottom horizontal scroll bar can move the row left / right. Or a customized row renderer can be used to disabled the scrolling support.
   */
  summaryRows?: readonly SR[];
  /** The getter should return a unique key for each row */
  rowKeyGetter?: (row: R) => React.Key;
  onRowsChange?: (arg0: RowsChangeParams<R, SR>) => void;

  /**
   * Dimensions props
   */
  /** The height of each row in pixels */
  rowHeight?: number;
  /** The height of the header row in pixels */
  headerRowHeight?: number;
  /** The height of the header filter row in pixels */
  headerFiltersHeight?: number;

  /**
   * Feature props
   */
  /** Set of selected row keys */
  selectedRows?: ReadonlySet<React.Key>;
  /** Function called whenever row selection is changed */
  onSelectedRowsChange?: (selectedRows: Set<React.Key>) => void;
  /** The key of the column which is currently being sorted */
  sortColumn?: string;
  /** The direction to sort the sortColumn*/
  sortDirection?: SortDirection;
  /** Function called whenever grid is sorted*/
  onSort?: (columnKey: string, direction: SortDirection) => void;
  filters?: Filters;
  onFiltersChange?: (filters: Filters) => void;
  defaultColumnOptions?: DefaultColumnOptions<R, SR>;
  onFill?: (event: FillEvent<R, SR>) => R[];
  onPaste?: (event: PasteEvent<R>) => R[];
  expandRow?: (row: R) => void;

  /**
   * Custom renderers
   */
  rowRenderer?: React.ComponentType<RowRendererProps<R, SR>>;
  emptyRowsRenderer?: React.ComponentType;

  /**
   * Event props
   */
  /** Function called whenever a row is clicked */
  onRowClick?: (rowIdx: number, row: R, column: CalculatedColumn<R, SR>) => void;
  /** Called when the grid is scrolled */
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  /** Called when a column is resized */
  onColumnResize?: (idx: number, width: number) => void;
  /** Function called whenever selected cell is changed */
  onSelectedCellChange?: (position: Position) => void;

  /**
   * Toggles and modes
   */
  /** Toggles whether filters row is displayed or not */
  enableFilterRow?: boolean;
  cellNavigationMode?: CellNavigationMode;

  /**
   * Miscellaneous
   */
  /** The node where the editor portal should mount. */
  editorPortalTarget?: Element;
  rowClass?: (row: R) => string | undefined;
  enableOptionsCol?: boolean;
}

/**
 * Main API Component to render a data grid of rows and columns
 *
 * @example
 *
 * <DataGrid columns={columns} rows={rows} />
*/
function DataGrid<R, SR>({
  // Grid and data Props
  columns: rawColumns,
  rows: rawRows,
  summaryRows,
  rowKeyGetter,
  onRowsChange,
  // Dimensions props
  rowHeight = 35,
  headerRowHeight = rowHeight,
  // Feature props
  selectedRows,
  onSelectedRowsChange,
  sortColumn,
  sortDirection,
  onSort,
  expandRow,
  defaultColumnOptions,
  // Custom renderers
  rowRenderer: RowRenderer = Row,
  emptyRowsRenderer: EmptyRowsRenderer,
  // Event props
  onRowClick,
  onScroll,
  onColumnResize,
  onSelectedCellChange,
  onFill,
  onPaste,
  // Toggles and modes
  enableOptionsCol,
  cellNavigationMode = 'NONE',
  // Miscellaneous
  editorPortalTarget = body,
  className,
  style,
  rowClass,
  // ARIA
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy
}: DataGridProps<R, SR>, ref: React.Ref<DataGridHandle>) {
  /**
   * states
   */
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [columnWidths, setColumnWidths] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [selectedPosition, setSelectedPosition] = useState<SelectCellState | EditCellState<R>>({ idx: -1, rowIdx: -1, mode: 'SELECT' });
  const [copiedCells, setCopiedCells] = useState<{ rows: R[]; columnKey: string } | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [isFilling, setFilling] = useState(false);
  const [selectedCellsInfo, setSelectedCells] = useState<number | undefined>(undefined);
  const [draggedOverRowIdx, setOverRowIdx] = useState<number | undefined>(undefined);
  const [draggedOverColumnIdx, setOverColIdx] = useState<number[] | undefined>(undefined);

  /**
   * refs
   */
  const focusSinkRef = useRef<HTMLDivElement>(null);
  const prevSelectedPosition = useRef(selectedPosition);
  const latestDraggedOverRowIdx = useRef(draggedOverRowIdx);
  const lastSelectedRowIdx = useRef(-1);
  const isCellFocusable = useRef(false);
  const firstSelectedColIdx = useRef(-1);
  const latestDraggedOverColIdx = useRef(-1);

  /**
   * The identity of the wrapper function is stable so it won't break memoization
   */
  const selectRowWrapper = useLatestFunc(selectRow);
  const selectCellWrapper = useLatestFunc(selectCell);
  const handleFormatterRowChangeWrapper = useLatestFunc(handleFormatterRowChange);

  /**
   * computed values
   */
  const [gridRef, gridWidth, gridHeight] = useGridDimensions();
  const headerRowsCount = 1;
  const summaryRowsCount = summaryRows?.length ?? 0;
  const totalHeaderHeight = headerRowHeight;
  const clientHeight = gridHeight - totalHeaderHeight - summaryRowsCount * rowHeight;
  const isSelectable = selectedRows !== undefined && onSelectedRowsChange !== undefined;

  const { columns, viewportColumns, totalColumnWidth, lastFrozenColumnIndex, totalFrozenColumnWidth } = useViewportColumns({
    rawColumns,
    columnWidths,
    scrollLeft,
    viewportWidth: gridWidth,
    defaultColumnOptions
  });

  const { rowOverscanStartIdx, rowOverscanEndIdx, rows, rowsCount } = useViewportRows({
    rawRows,
    rowHeight,
    clientHeight,
    scrollTop
  });

  const minColIdx = 0;

  // Cell drag is not supported on a treegrid
  const enableCellDragAndDrop = onFill !== undefined;

  // /**
  //  * effects
  //  */
  useLayoutEffect(() => {
    if (selectedPosition === prevSelectedPosition.current || selectedPosition.mode === 'EDIT' || !isCellWithinBounds(selectedPosition)) return;
    prevSelectedPosition.current = selectedPosition;
    scrollToCell(selectedPosition);

    if (isCellFocusable.current) {
      isCellFocusable.current = false;
      return;
    }
    focusSinkRef.current!.focus({ preventScroll: true });
  });

  useImperativeHandle(ref, () => ({
    scrollToColumn(idx: number) {
      scrollToCell({ idx });
    },
    scrollToRow(rowIdx: number) {
      const { current } = gridRef;
      if (!current) return;
      current.scrollTo({
        top: rowIdx * rowHeight,
        behavior: 'smooth'
      });
    },
    selectCell
  }));

  /**
  * callbacks
  */
  const handleColumnResize = useCallback((column: CalculatedColumn<R, SR>, width: number) => {
    const newColumnWidths = new Map(columnWidths);
    newColumnWidths.set(column.key, width);
    setColumnWidths(newColumnWidths);

    onColumnResize?.(column.idx, width);
  }, [columnWidths, onColumnResize]);

  const setDraggedOverRowIdx = useCallback((rowIdx?: number) => {
    setOverRowIdx(rowIdx);
    latestDraggedOverRowIdx.current = rowIdx;
  }, []);

  const setDraggedOverColumnIdx = useCallback((colIdx?: number) => {
    const selectedCellColIdx = firstSelectedColIdx.current;

    if (draggedOverColumnIdx && !draggedOverColumnIdx.some(i => i === colIdx)) return;

    if (!colIdx && selectedCellColIdx) {
      setOverColIdx([selectedCellColIdx]);
      latestDraggedOverColIdx.current = selectedCellColIdx;
    }

    if (colIdx) {
      const colIdxArray = [];
      for (let i = selectedCellColIdx; i <= colIdx; i++) {
        colIdxArray.push(i);
      }
      latestDraggedOverColIdx.current = colIdx;
      setOverColIdx(colIdxArray);
    }
}, []); // eslint-disable-line

  /**
  * event handlers
  */
  function selectRow({ rowIdx, checked, isShiftClick }: SelectRowEvent) {
    if (!onSelectedRowsChange) return;

    assertIsValidKeyGetter(rowKeyGetter);
    const newSelectedRows = new Set(selectedRows);
    const row = rows[rowIdx];

    const rowKey = rowKeyGetter(row);
    if (checked) {
      newSelectedRows.add(rowKey);
      const previousRowIdx = lastSelectedRowIdx.current;
      lastSelectedRowIdx.current = rowIdx;
      if (isShiftClick && previousRowIdx !== -1 && previousRowIdx !== rowIdx) {
        const step = Math.sign(rowIdx - previousRowIdx);
        for (let i = previousRowIdx + step; i !== rowIdx; i += step) {
          const row = rows[i];
          newSelectedRows.add(rowKeyGetter(row));
        }
      }
    } else {
      newSelectedRows.delete(rowKey);
      lastSelectedRowIdx.current = -1;
    }

    onSelectedRowsChange(newSelectedRows);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const { keyCode } = event;

    if (
      onPaste
      && isCtrlKeyHeldDown(event)
      && isCellWithinBounds(selectedPosition)
      && selectedPosition.idx !== -1
      && selectedPosition.mode === 'SELECT'
    ) {
      // event.key may differ by keyboard input language, so we use event.keyCode instead
      // event.nativeEvent.code cannot be used either as it would break copy/paste for the DVORAK layout
      const cKey = 67;
      const vKey = 86;
      if (keyCode === cKey) {
        handleCopy();
        return;
      }
      if (keyCode === vKey) {
        navigator.clipboard.readText().then(clipText => {
          handlePaste(clipText);
        });
        return;
      }
    }

    switch (event.key) {
      case 'Escape':
        setCopiedCells(null);
        closeEditor();
        return;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Tab':
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        navigate(event);
        break;
      default:
        handleCellInput(event);
        break;
    }
  }

  function handleFocus() {
    isCellFocusable.current = true;
  }

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollLeft } = event.currentTarget;
    setScrollTop(scrollTop);
    setScrollLeft(scrollLeft);
    onScroll?.(event);
  }

  function getRawRowIdx(rowIdx: number) {
    return rowIdx;
  }

  function commitEditorChanges() {
    if (
      columns[selectedPosition.idx]?.editor === undefined
      || selectedPosition.mode === 'SELECT'
      || isEqual(selectedPosition.row, selectedPosition.originalRow)) {
      return;
    }

    const updatedRows = [...rawRows];
    updatedRows[getRawRowIdx(selectedPosition.rowIdx)] = selectedPosition.row;
    onRowsChange?.({ newRows: updatedRows, position: selectedPosition.row, key: columns[selectedPosition.idx].key });
  }

  function handleCopy() {
    const { idx, rowIdx } = selectedPosition;
    if (idx === -1) return;
    const selectedCell = rawRows[rowIdx][columns[idx].key as keyof R] as unknown as CellType;
    if (typeof selectedCell === 'string' || !selectedCell.disabled) {
      const overRowIdx = latestDraggedOverRowIdx.current ?? rowIdx;
      const startRowIndex = rowIdx < overRowIdx ? rowIdx : overRowIdx;
      const endRowIndex = rowIdx < overRowIdx ? overRowIdx + 1 : rowIdx + 1;
      const targetRows = overRowIdx ? rawRows.slice(startRowIndex, endRowIndex) : rawRows.slice(rowIdx, rowIdx + 1);
      setCopiedCells({ rows: targetRows, columnKey: columns[idx].key });

      if (navigator.clipboard) {
        const copiedValues: string[] = [];
        targetRows.forEach(r => {
          const cell = r[columns[idx].key as keyof R] as unknown as CellType;
          if (!cell.disabled) {
            copiedValues.push(cell.value);
          }
        });
        navigator.clipboard.writeText(copiedValues.join('\n'));
      }
    }
  }

  function handlePaste(text: string) {
    const { idx, rowIdx } = selectedPosition;
    if (idx === -1) return;
    const selectedCell = rawRows[rowIdx][columns[idx].key as keyof R] as unknown as CellType;
    const cellCanBePasted = !checkIfCellDisabled(selectedCell);
    if (
      !onPaste
      || !onRowsChange
      || text === ''
      || !isCellEditable(selectedPosition)
      || !cellCanBePasted
    ) {
      return;
    }

    const copiedItems = text.split(/\n/).map(i => i.split(/[\t]/));
    const updatedTargetRows = [];
    const newRows = [...rawRows];
    const startRowIndex = rowIdx;
    const startColIndex = idx;
    const endColIndex = idx + copiedItems[0].length - 1;
    const endRowIndex = rowIdx + copiedItems.length - 1;

    for (let i = 0; i < copiedItems.length; i++) {
      for (let ix = 0; ix < copiedItems[i].length; ix++) {
        const row = newRows[startRowIndex + i];
        const colIdx = startColIndex + ix;
        if (
          row
                && columns[colIdx]
                && !checkIfCellDisabled(row[columns[colIdx].key as keyof R] as unknown as CellType)
                && newRows[startRowIndex + i]
        ) {
          const formatFunction = columns[colIdx].formatValue;
          newRows[startRowIndex + i] = {
            ...row,
            [columns[colIdx].key]: {
              ...row[columns[colIdx].key as keyof R],
              value: formatFunction ? formatFunction({ value: copiedItems[i][ix] }) : copiedItems[i][ix]
            }
          };
        }
      }
      updatedTargetRows.push(newRows[startRowIndex + i]);
    }

    const targetCols = columns.slice(startColIndex, endColIndex + 1);

    onRowsChange({ newRows, updatedTargetRows, targetCols, key: columns[idx].key, type: 'paste' });
    setDraggedOverRowIdx(endRowIndex);
    setDraggedOverColumnIdx(endColIndex);
    setCopiedCells(null);
  }

  function handleCellInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!isCellWithinBounds(selectedPosition)) return;
    const row = rows[selectedPosition.rowIdx];
    const { key } = event;
    const column = columns[selectedPosition.idx];

    if (selectedPosition.mode === 'EDIT') {
      if (key === 'Enter') {
        // Custom editors can listen for the event and stop propagation to prevent commit
        commitEditorChanges();
        closeEditor();
      }
      return;
    }

    column.editorOptions?.onCellKeyDown?.(event);
    if (event.isDefaultPrevented()) return;

    if (isCellEditable(selectedPosition) && isDefaultCellInput(event)) {
      setSelectedPosition(({ idx, rowIdx }) => ({
        idx,
        rowIdx,
        key,
        mode: 'EDIT',
        row: { ...row, [column.key]: { ...row[column.key as keyof R], value: '' } },
        originalRow: row
      }));
    }
  }

  function handleDragEnd() {
    const overRowIdx = latestDraggedOverRowIdx.current;
    const overColIdx = latestDraggedOverColIdx.current;
    const firstColIdx = firstSelectedColIdx.current;
    if (overRowIdx === undefined || overColIdx < 0 || !onFill || !onRowsChange) return;
    const { idx, rowIdx } = selectedPosition;
    const sourceRow = rawRows[rowIdx];
    if (overColIdx !== firstColIdx) {
      const startRowIndex = rowIdx < overRowIdx ? rowIdx : overRowIdx;
      const endRowIndex = rowIdx < overRowIdx ? overRowIdx + 1 : rowIdx + 1;
      const targetRows = rawRows.slice(startRowIndex, startRowIndex === endRowIndex ? endRowIndex + 1 : endRowIndex);
      const targetCols = columns.filter((column, i: number) => i > firstColIdx && i <= overColIdx);
      const updatedTargetRows = onFill({ columnKey: columns[idx].key, targetCols, sourceRow, targetRows, across: true });
      const updatedRows = [...rawRows];
      for (let i = startRowIndex; i < endRowIndex; i++) {
        updatedRows[i] = updatedTargetRows[i - startRowIndex];
      }
      onRowsChange({ newRows: updatedRows, updatedTargetRows, targetCols, targetRows, type: 'fill' });
    } else {
      const startRowIndex = rowIdx < overRowIdx ? rowIdx + 1 : overRowIdx;
      const endRowIndex = rowIdx < overRowIdx ? overRowIdx + 1 : rowIdx;
      const targetRows = rawRows.slice(startRowIndex, endRowIndex);

      const updatedTargetRows = onFill({ columnKey: columns[idx].key, sourceRow, targetRows, across: false });
      const updatedRows = [...rawRows];
      for (let i = startRowIndex; i < endRowIndex; i++) {
        updatedRows[i] = updatedTargetRows[i - startRowIndex];
      }
      onRowsChange({ newRows: updatedRows, updatedTargetRows, targetRows, key: columns[idx].key, type: 'fill' });
    }
    setCopiedCells(null);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.buttons !== 1) return;
    setDragging(true);
    setFilling(true);
    setSelectedCells(draggedOverRowIdx ?? selectedPosition.rowIdx);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseup', onMouseUp);

    function onMouseOver(event: MouseEvent) {
      // Trigger onMouseup in edge cases where we release the mouse button but `mouseup` isn't triggered,
      // for example when releasing the mouse button outside the iframe the grid is rendered in.
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
      if (event.buttons !== 1) onMouseUp();
    }

    function onMouseUp() {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseup', onMouseUp);
      setDragging(false);
      setFilling(false);
      setSelectedCells(undefined);
      handleDragEnd();
    }
  }

  function handleCellMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation();
    if (event.buttons !== 1) return;
    setDragging(true);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseup', onMouseUp);

    function onMouseOver(event: MouseEvent) {
      event.stopPropagation();
      // Trigger onMouseup in edge cases where we release the mouse button but `mouseup` isn't triggered,
      // for example when releasing the mouse button outside the iframe the grid is rendered in.
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
      if (event.buttons !== 1) onMouseUp();
    }

    function onMouseUp() {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseup', onMouseUp);
      setDragging(false);
    }
  }

  function handleDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (!onFill || !onRowsChange) return;

    const { idx, rowIdx } = selectedPosition;
    const sourceRow = rawRows[rowIdx];
    const targetRows = rawRows.slice(rowIdx + 1);

    const updatedTargetRows = onFill({ columnKey: columns[idx].key, sourceRow, targetRows, across: false });
    const updatedRows = [...rawRows];
    for (let i = rowIdx + 1; i < updatedRows.length; i++) {
      updatedRows[i] = updatedTargetRows[i - rowIdx - 1];
    }
    onRowsChange({ newRows: updatedRows });
  }

  function handleFormatterRowChange(rowIdx: number, row: Readonly<R>) {
    const newRows = [...rawRows];
    newRows[rowIdx] = row;
    onRowsChange?.({ newRows });
  }

  function handleEditorRowChange(row: Readonly<R>, commitChanges?: boolean) {
    if (selectedPosition.mode === 'SELECT') return;
    if (commitChanges) {
      const updatedRows = [...rawRows];
      updatedRows[getRawRowIdx(selectedPosition.rowIdx)] = row;
      onRowsChange?.({ newRows: updatedRows });
      closeEditor();
    } else {
      setSelectedPosition(position => ({ ...position, row }));
    }
  }

  function handleOnClose(commitChanges?: boolean) {
    if (commitChanges) {
      commitEditorChanges();
    }
    closeEditor();
  }

  /**
   * utils
   */
  function isCellWithinBounds({ idx, rowIdx }: Position): boolean {
    return rowIdx >= 0 && rowIdx < rows.length && idx >= minColIdx && idx < columns.length;
  }

  function isCellEditable(position: Position): boolean {
    return isCellWithinBounds(position)
      && isSelectedCellEditable<R, SR>({ columns, rows, selectedPosition: position });
  }

  function selectCell(position: Position, enableEditor = false): void {
    if (!isCellWithinBounds(position)) return;
    commitEditorChanges();

    setDraggedOverRowIdx(undefined);
    setOverColIdx(undefined);

    if (enableEditor && isCellEditable(position)) {
      const row = rows[position.rowIdx] as R;
      setSelectedPosition({ ...position, mode: 'EDIT', key: null, row, originalRow: row });
    } else {
      setSelectedPosition({ ...position, mode: 'SELECT' });
      firstSelectedColIdx.current = position.idx;
    }
    onSelectedCellChange?.({ ...position });
  }

  function closeEditor() {
    if (selectedPosition.mode === 'SELECT') return;
    setSelectedPosition(({ idx, rowIdx }) => ({ idx, rowIdx, mode: 'SELECT' }));
  }

  function scrollToCell({ idx, rowIdx }: Partial<Position>): void {
    const { current } = gridRef;
    if (!current) return;

    if (typeof idx === 'number' && idx > lastFrozenColumnIndex) {
      const { clientWidth } = current;
      const { left, width } = columns[idx];
      const isCellAtLeftBoundary = left < scrollLeft + width + totalFrozenColumnWidth;
      const isCellAtRightBoundary = left + width > clientWidth + scrollLeft;
      if (isCellAtLeftBoundary || isCellAtRightBoundary) {
        const newScrollLeft = getColumnScrollPosition(columns, idx, scrollLeft, clientWidth);
        current.scrollLeft = scrollLeft + newScrollLeft;
      }
    }

    if (typeof rowIdx === 'number') {
      if (rowIdx * rowHeight < scrollTop) {
        // at top boundary, scroll to the row's top
        current.scrollTop = rowIdx * rowHeight;
      } else if ((rowIdx + 1) * rowHeight > scrollTop + clientHeight) {
        // at bottom boundary, scroll the next row's top to the bottom of the viewport
        current.scrollTop = (rowIdx + 1) * rowHeight - clientHeight;
      }
    }
  }

  function getNextPosition(key: string, ctrlKey: boolean, shiftKey: boolean): Position {
    const { idx, rowIdx } = selectedPosition;
    const row = rows[rowIdx];
    const isRowSelected = isCellWithinBounds(selectedPosition) && idx === -1;

    const prevCol = columns[idx - 1];
    const nextCol = columns[idx + 1];
    const nextCell = row[nextCol?.key as keyof R] as unknown as CellType;
    const prevCell = row[prevCol?.key as keyof R] as unknown as CellType;

    switch (key) {
      case 'ArrowUp':
        return { idx, rowIdx: rowIdx - 1 };
      case 'ArrowDown':
        return { idx, rowIdx: rowIdx + 1 };
      case 'ArrowLeft':
        return prevCol?.editable && !prevCell?.disabled ? { idx: idx - 1, rowIdx } : { idx, rowIdx };
      case 'ArrowRight':
        return nextCol?.editable && !nextCell?.disabled ? { idx: idx + 1, rowIdx } : { idx, rowIdx };
      case 'Tab':
        if (selectedPosition.idx === -1 && selectedPosition.rowIdx === -1) {
          return shiftKey ? { idx: columns.length - 1, rowIdx: rows.length - 1 } : { idx: 0, rowIdx: 0 };
        }
        return { idx: idx + (shiftKey ? -1 : 1), rowIdx };
      case 'Home':
        // If row is selected then move focus to the first row
        if (isRowSelected) return { idx, rowIdx: 0 };
        return ctrlKey ? { idx: 0, rowIdx: 0 } : { idx: 0, rowIdx };
      case 'End':
        // If row is selected then move focus to the last row.
        if (isRowSelected) return { idx, rowIdx: rows.length - 1 };
        return ctrlKey ? { idx: columns.length - 1, rowIdx: rows.length - 1 } : { idx: columns.length - 1, rowIdx };
      case 'PageUp':
        return { idx, rowIdx: rowIdx - Math.floor(clientHeight / rowHeight) };
      case 'PageDown':
        return { idx, rowIdx: rowIdx + Math.floor(clientHeight / rowHeight) };
      default:
        return selectedPosition;
    }
  }

  function navigate(event: React.KeyboardEvent<HTMLDivElement>) {
    if (selectedPosition.mode === 'EDIT') {
      const onNavigation = columns[selectedPosition.idx].editorOptions?.onNavigation ?? onEditorNavigation;
      if (!onNavigation(event)) return;
    }
    const { key, shiftKey } = event;
    const ctrlKey = isCtrlKeyHeldDown(event);
    let nextPosition = getNextPosition(key, ctrlKey, shiftKey);
    let mode = cellNavigationMode;
    if (key === 'Tab') {
      // If we are in a position to leave the grid, stop editing but stay in that cell
      if (canExitGrid({ shiftKey, cellNavigationMode, columns, rowsCount: rows.length, selectedPosition })) {
        commitEditorChanges();
        // Allow focus to leave the grid so the next control in the tab order can be focused
        return;
      }

      mode = cellNavigationMode === 'NONE'
        ? 'CHANGE_ROW'
        : cellNavigationMode;
    }

    // Do not allow focus to leave
    event.preventDefault();

    nextPosition = getNextSelectedCellPosition<R, SR>({
      columns,
      rowsCount: rows.length,
      cellNavigationMode: mode,
      nextPosition,
      row: rows[nextPosition?.rowIdx]
    });

    selectCell(nextPosition);
  }

  function getDraggedOverCellIdx(currentRowIdx: number, colIdx: number): number | undefined {
    const { rowIdx } = selectedPosition;
    if (draggedOverRowIdx === undefined) return;
    if (draggedOverColumnIdx === undefined) return;
    if (!draggedOverColumnIdx.some(i => i === colIdx)) return;
    if (rowIdx < draggedOverRowIdx && (currentRowIdx < rowIdx || currentRowIdx > draggedOverRowIdx)) return;
    if (rowIdx > draggedOverRowIdx && (currentRowIdx > rowIdx || currentRowIdx < draggedOverRowIdx)) return;

    let isDraggedOver = false;

    if (rowIdx === draggedOverRowIdx && currentRowIdx === rowIdx) {
      isDraggedOver = draggedOverColumnIdx.some(i => i === colIdx);
    } else {
      isDraggedOver = rowIdx <= draggedOverRowIdx
        ? rowIdx <= currentRowIdx && currentRowIdx <= draggedOverRowIdx && draggedOverColumnIdx.some(i => i === colIdx)
        : rowIdx >= currentRowIdx && currentRowIdx >= draggedOverRowIdx && draggedOverColumnIdx.some(i => i === colIdx);
    }

    return isDraggedOver ? colIdx : undefined;
  }

  function getSelectedCellProps(rowIdx: number): SelectedCellProps | EditCellProps<R> | undefined {
    if (selectedPosition.rowIdx !== rowIdx) return;

    if (selectedPosition.mode === 'EDIT') {
      return {
        mode: 'EDIT',
        idx: selectedPosition.idx,
        onKeyDown: handleKeyDown,
        editorProps: {
          editorPortalTarget,
          rowHeight,
          row: selectedPosition.row,
          onRowChange: handleEditorRowChange,
          onClose: handleOnClose
        }
      };
    }

    return {
      mode: 'SELECT',
      idx: selectedPosition.idx,
      onFocus: handleFocus,
      onKeyDown: handleKeyDown,
      dragHandleProps: enableCellDragAndDrop && isCellEditable(selectedPosition)
        ? { onMouseDown: handleMouseDown, onDoubleClick: handleDoubleClick }
        : undefined
    };
  }

  function getCopiedCellIdx(row: R): number | undefined {
    if (copiedCells === null) return undefined;

    if (typeof rowKeyGetter !== 'function') return undefined;

    const key = rowKeyGetter(row);

    if (copiedCells.rows.some(r => rowKeyGetter(r) === key)) {
      return columns.findIndex(c => c.key === copiedCells.columnKey);
    }

    return undefined;
  }

  function hasFirstCopiedCell(row: R): boolean {
    if (copiedCells === null) return false;
    if (typeof rowKeyGetter !== 'function') return false;
    const key = rowKeyGetter(row);
    return rowKeyGetter(copiedCells.rows[0]) === key;
  }

  function hasLastCopiedCell(row: R): boolean {
    if (copiedCells === null) return false;
    if (typeof rowKeyGetter !== 'function') return false;
    const key = rowKeyGetter(row);
    return rowKeyGetter(copiedCells.rows[copiedCells.rows.length - 1]) === key;
  }

  function getViewportRows() {
    const rowElements = [];
    for (let rowIdx = rowOverscanStartIdx; rowIdx <= rowOverscanEndIdx; rowIdx++) {
      const row = rows[rowIdx];
      const top = rowIdx * rowHeight + totalHeaderHeight;
      let key: React.Key = rowIdx;
      let isRowSelected = false;
      if (typeof rowKeyGetter === 'function') {
        key = rowKeyGetter(row);
        isRowSelected = selectedRows?.has(key) ?? false;
      }

      rowElements.push(
        <RowRenderer
          aria-rowindex={headerRowsCount + rowIdx + 1} // aria-rowindex is 1 based
          aria-selected={isSelectable ? isRowSelected : undefined}
          key={key}
          rowIdx={rowIdx}
          row={row}
          viewportColumns={viewportColumns}
          gridWidth={gridWidth}
          isRowSelected={isRowSelected}
          onRowClick={onRowClick}
          rowClass={rowClass}
          top={top}
          copiedCellIdx={copiedCells !== null ? getCopiedCellIdx(row) : undefined}
          hasFirstCopiedCell={copiedCells !== null && hasFirstCopiedCell(row)}
          hasLastCopiedCell={copiedCells !== null && hasLastCopiedCell(row)}
          getDraggedOverCellIdx={getDraggedOverCellIdx}
          setDraggedOverRowIdx={isDragging ? setDraggedOverRowIdx : undefined}
          setDraggedOverColumnIdx={isDragging ? setDraggedOverColumnIdx : undefined}
          selectedCellProps={getSelectedCellProps(rowIdx)}
          onRowChange={handleFormatterRowChangeWrapper}
          selectCell={selectCellWrapper}
          selectRow={selectRowWrapper}
          handleCellMouseDown={handleCellMouseDown}
          selectedPosition={selectedPosition}
          bottomRowIdx={draggedOverRowIdx && draggedOverRowIdx > selectedPosition.rowIdx ? draggedOverRowIdx : selectedPosition.rowIdx}
          dragHandleProps={{
            onMouseDown: handleMouseDown,
            onDoubleClick: handleDoubleClick
          }}
          isFilling={isFilling}
          isMultipleRows={selectedPosition.rowIdx !== draggedOverRowIdx}
          selectedCellsInfo={selectedCellsInfo}
          draggedOverRowIdx={draggedOverRowIdx}
          draggedOverColumnIdx={draggedOverColumnIdx}
          scrollLeft={scrollLeft}
          scrolledToEnd={gridRef.current ? gridRef.current.clientWidth + scrollLeft >= totalColumnWidth : false}
          expandRow={expandRow}
          enableOptionsCol={enableOptionsCol}
          optionsCol={columns[columns.length - 1]}
        />
      );
    }

    return rowElements;
  }

  // Reset the positions if the current values are no longer valid. This can happen if a column or row is removed
  if (selectedPosition.idx >= columns.length || selectedPosition.rowIdx >= rows.length) {
    setSelectedPosition({ idx: -1, rowIdx: -1, mode: 'SELECT' });
    setDraggedOverRowIdx(undefined);
  }

  if (selectedPosition.mode === 'EDIT' && rows[selectedPosition.rowIdx] !== selectedPosition.originalRow) {
    // Discard changes if rows are updated from outside
    closeEditor();
  }

  const scrolledToEnd = gridRef.current ? gridRef.current.clientWidth + scrollLeft >= totalColumnWidth : false;

  return (
    <div
      role={'grid'}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-multiselectable={isSelectable ? true : undefined}
      aria-colcount={columns.length}
      aria-rowcount={headerRowsCount + rowsCount + summaryRowsCount}
      className={clsx('rdg', { 'rdg-viewport-dragging': isDragging }, className)}
      style={{
        ...style,
        '--header-row-height': `${headerRowHeight}px`,
        '--row-width': `${totalColumnWidth}px`,
        '--row-height': `${rowHeight}px`
      } as unknown as React.CSSProperties}
      ref={gridRef}
      onScroll={handleScroll}
    >
      <HeaderRow<R, SR>
        rowKeyGetter={rowKeyGetter}
        rows={rawRows}
        columns={viewportColumns}
        onColumnResize={handleColumnResize}
        allRowsSelected={selectedRows?.size === rawRows.length}
        onSelectedRowsChange={onSelectedRowsChange}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        gridWidth={gridWidth}
        scrollLeft={scrollLeft}
        scrolledToEnd={scrolledToEnd}
        enableOptionsCol={enableOptionsCol}
        optionsCol={columns[columns.length - 1]}
      />
      {rows.length === 0 && EmptyRowsRenderer ? <EmptyRowsRenderer /> : (
        <>
          <div
            ref={focusSinkRef}
            tabIndex={0}
            className="rdg-focus-sink"
            onKeyDown={handleKeyDown}
          />
          <div style={{ height: Math.max(rows.length * rowHeight, clientHeight), position: 'sticky', left: 0 }}>
            {enableOptionsCol && (
              <div
                className="rdg-mock-options"
                style={{
                  boxShadow: scrolledToEnd ? 'none' : '-1px 0px 6px 2px rgba(0, 0, 0, 0.12)',
                  width: scrolledToEnd ? 55 : 54,
                  borderLeft: scrolledToEnd ? '1px solid #edeef0' : 'none'
                }}
              />
            )}
          </div>
          {getViewportRows()}
        </>
      )}
    </div>
  );
}

export default forwardRef(DataGrid) as <R, SR = unknown>(props: DataGridProps<R, SR> & React.RefAttributes<DataGridHandle>) => JSX.Element;
