import React, { useState, useRef, useMemo, useReducer } from 'react';
import DataGrid, { TextEditor } from '../../src';
import type { Column, DataGridHandle, FillEvent, PasteEvent } from '../../src';
import { CellExpanderFormatter } from './components/Formatters';
import { createRows } from './LolaFeaturesMockData';
import { formatCost } from '../../src/utils';

import './AllFeatures.less';

export interface Row {
  id: string;
  name: {value: string; disabled?: boolean};
  parentId?: string;
  '2021-01-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-02-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-03-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-04-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-05-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-06-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-07-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-08-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-09-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-10-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-11-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-12-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2022-01-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  children?: Row[];
  isExpanded?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TSummaryRow {}

interface Action {
  type: 'toggleSubRow' | 'deleteSubRow' | 'updateRows';
  id?: string;
  newRows?: Row[];
}

function rowKeyGetter(row: Row) {
  return row.id;
}

function toggleSubRow(rows: Row[], id: string): Row[] {
  const rowIndex = rows.findIndex(r => r.id === id);
  const row = rows[rowIndex];
  const { children } = row;
  if (!children) return rows;

  const newRows = [...rows];
  newRows[rowIndex] = { ...row, isExpanded: !row.isExpanded };
  if (!row.isExpanded) {
    newRows.splice(rowIndex + 1, 0, ...children);
  } else {
    newRows.splice(rowIndex + 1, children.length);
  }
  return newRows;
}

function reducer(rows: Row[], { type, id, newRows }: Action): Row[] {
  switch (type) {
    case 'toggleSubRow':
      return toggleSubRow(rows, id);
    case 'updateRows':
      return newRows;
    default:
      return rows;
  }
}

export function LolaFeatures() {
  const [rows, dispatch] = useReducer(reducer, createRows());
  const [selectedRows, setSelectedRows] = useState(() => new Set<React.Key>());
  const gridRef = useRef<DataGridHandle>(null);
  const columns: Column<Row>[] = useMemo(() => {
    return [
      {
        key: 'name',
        name: 'Name',
        minWidth: 285,
        maxWidth: 400,
        frozen: true,
        editable: true,
        editor: TextEditor,
        formatter({ row, isCellSelected }) {
          const hasChildren = row.children !== undefined;
          const style = hasChildren ? { color: '#1A60E8' } : undefined;
          const isChild = !!row.parentId;
          const childStyle = { marginLeft: 26 };
          return (
            <>
              {hasChildren && (
                <CellExpanderFormatter
                  isCellSelected={isCellSelected}
                  expanded={row.isExpanded === true}
                  onCellExpand={() => dispatch({ id: row.id, type: 'toggleSubRow' })}
                />
              )}
              <div className="rdg-cell-value">
                <div style={isChild ? childStyle : style}>
                  {isChild ? `- ${row.name.value}` : row.name.value}
                </div>
              </div>
            </>
          );
        }
      },
      { key: '2021-01-01', name: 'Jan 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-02-01', name: 'Feb 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-03-01', name: 'Mar 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-04-01', name: 'Apr 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-05-01', name: 'May 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-06-01', name: 'Jun 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-07-01', name: 'Jul 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-08-01', name: 'Aug 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-09-01', name: 'Sep 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-10-01', name: 'Oct 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-11-01', name: 'Nov 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2021-12-01', name: 'Dec 2021', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: '2022-01-01', name: 'Jan 2022', minWidth: 116, alignment: 'right', editor: TextEditor, formatValue: formatCost, editable: true },
      { key: 'options', name: '', frozenAlignment: 'right', width: 54, frozen: true, editable: false }
    ];
  }, []);

  function handleFill({ columnKey, targetCols, sourceRow, targetRows, across }: FillEvent<Row, TSummaryRow>): Row[] {
    if (across) {
      return targetRows.map(row => {
        let newRow = row;
        targetCols.forEach(col => {
          const cell = row[col.key];
          if (typeof cell === 'string' || !cell.disabled) {
            newRow = { ...newRow, [col.key]: row[columnKey] };
          } else {
            newRow = { ...newRow };
          }
        });
        return newRow;
      });
    }
    return targetRows.map(row => {
      const cell = row[columnKey];
      if (typeof cell === 'string' || !cell.disabled) {
        return { ...row, [columnKey as keyof Row]: sourceRow[columnKey as keyof Row] };
      }

      return { ...row };
    });
  }

  function handlePaste({ sourceColumnKey, sourceRows, targetColumnKey, targetRows }: PasteEvent<Row>): Row[] {
    if (sourceRows.length === 1) {
      return [{ ...targetRows[0], [targetColumnKey]: sourceRows[0][sourceColumnKey as keyof Row] }];
    }

    let checkIndex = 0;

    return targetRows.map((row) => {
      const cell = row[targetColumnKey];
      if (typeof cell === 'string' || !cell.disabled) {
        const newRow = { ...row, [targetColumnKey]: sourceRows[checkIndex][sourceColumnKey as keyof Row] };
        checkIndex += 1;
        return newRow;
      }
      return { ...row };
    });
  }

  function handleExpandRow({ id }) {
    return dispatch({ id, type: 'toggleSubRow' });
  }

  function handleUpdateRows({ newRows }) {
    return dispatch({ type: 'updateRows', newRows });
  }

  return (
    <div className="all-features">
      <DataGrid
        ref={gridRef}
        columns={columns}
        rows={rows}
        rowKeyGetter={rowKeyGetter}
        onRowsChange={handleUpdateRows}
        onFill={handleFill}
        onPaste={handlePaste}
        rowHeight={60}
        headerRowHeight={48}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        expandRow={handleExpandRow}
        enableOptionsCol
      />
    </div>
  );
}

LolaFeatures.storyName = 'Lola Features';
