import type { CellNavigationMode } from '../enums';
import type { CalculatedColumn, Position, CellType } from '../types';

interface IsSelectedCellEditableOpts<R, SR> {
  selectedPosition: Position;
  columns: readonly CalculatedColumn<R, SR>[];
  rows: readonly (R)[];
}

export function isSelectedCellEditable<R, SR>({ selectedPosition, columns, rows }: IsSelectedCellEditableOpts<R, SR>): boolean {
  const column = columns[selectedPosition.idx];
  const row = rows[selectedPosition.rowIdx];
  return column.editor != null
    && (typeof column.editable === 'function' ? column.editable(row) : column.editable) !== false;
}

interface GetNextSelectedCellPositionOpts<R, SR> {
  cellNavigationMode: CellNavigationMode;
  columns: readonly CalculatedColumn<R, SR>[];
  rowsCount: number;
  nextPosition: Position;
  row: R
}

export function getNextSelectedCellPosition<R, SR>({ cellNavigationMode, columns, rowsCount, nextPosition, row }: GetNextSelectedCellPositionOpts<R, SR>): Position {
  const { idx, rowIdx } = nextPosition;
  if (cellNavigationMode !== 'NONE') {
    const columnsCount = columns.length;
    const isAfterLastColumn = idx === columnsCount;
    const isBeforeFirstColumn = idx === -1;

    if (isAfterLastColumn) {
      if (cellNavigationMode === 'CHANGE_ROW') {
        const isLastRow = rowIdx === rowsCount - 1;
        if (!isLastRow) {
          return {
            idx: 0,
            rowIdx: rowIdx + 1
          };
        }
      } else if (cellNavigationMode === 'LOOP_OVER_ROW') {
        return {
          rowIdx,
          idx: 0
        };
      }
    } else if (isBeforeFirstColumn) {
      if (cellNavigationMode === 'CHANGE_ROW') {
        const isFirstRow = rowIdx === 0;
        if (!isFirstRow) {
          return {
            rowIdx: rowIdx - 1,
            idx: columnsCount - 1
          };
        }
      } else if (cellNavigationMode === 'LOOP_OVER_ROW') {
        return {
          rowIdx,
          idx: columnsCount - 1
        };
      }
    }
  }
  const col = columns[idx];
  const nextCell = row[col.key as keyof R] as unknown as CellType;

  if (nextCell?.span === 0) {
    const newRow = Object.entries(row).find(r => r[1]?.span > 1);
    console.log(newRow);
    const newColIdx = columns.findIndex(c => newRow && c.key === newRow[0]);
    return {
      idx: newColIdx,
      rowIdx
    }
  }
  

  return nextPosition;
}

interface CanExitGridOpts<R, SR> {
  cellNavigationMode: CellNavigationMode;
  columns: readonly CalculatedColumn<R, SR>[];
  rowsCount: number;
  selectedPosition: Position;
  shiftKey: boolean;
}

export function canExitGrid<R, SR>({ cellNavigationMode, columns, rowsCount, selectedPosition: { rowIdx, idx }, shiftKey }: CanExitGridOpts<R, SR>): boolean {
  // When the cellNavigationMode is 'none' or 'changeRow', you can exit the grid if you're at the first or last cell of the grid
  // When the cellNavigationMode is 'loopOverRow', there is no logical exit point so you can't exit the grid
  if (cellNavigationMode === 'NONE' || cellNavigationMode === 'CHANGE_ROW') {
    const atLastCellInRow = idx === columns.length - 1;
    const atFirstCellInRow = idx === 0;
    const atLastRow = rowIdx === rowsCount - 1;
    const atFirstRow = rowIdx === 0;

    return shiftKey ? atFirstCellInRow && atFirstRow : atLastCellInRow && atLastRow;
  }

  return false;
}

export function checkIfCellDisabled(cell: undefined | string | CellType): boolean {
  if (!cell) return false;

  if (typeof cell === 'string' || !cell.disabled) {
    return false;
  }

  return true;
}
