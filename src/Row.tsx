import React, { memo, forwardRef } from 'react';
import clsx from 'clsx';

import Cell from './Cell';
import EditCell from './EditCell';
import { checkIfCellDisabled } from './utils';
import type { RowRendererProps, SelectedCellProps, CellType } from './types';

function Row<R, SR = unknown>({
  cellRenderer: CellRenderer = Cell,
  className,
  id,
  rowIdx,
  isRowSelected,
  copiedCellIdx,
  getDraggedOverCellIdx,
  row,
  viewportColumns,
  selectedCellProps,
  selectedPosition,
  isFilling,
  isMultipleRows,
  onRowClick,
  rowClass,
  selectedCellsInfo,
  setDraggedOverRowIdx,
  setDraggedOverColumnIdx,
  hasFirstCopiedCell,
  hasLastCopiedCell,
  top,
  onRowChange,
  selectCell,
  selectRow,
  handleCellMouseDown,
  bottomRowIdx,
  dragHandleProps,
  draggedOverRowIdx,
  draggedOverColumnIdx,
  gridWidth,
  scrollLeft,
  scrolledToEnd,
  expandRow,
  enableOptionsCol,
  optionsCol,
  'aria-rowindex': ariaRowIndex,
  'aria-selected': ariaSelected,
  ...props
}: RowRendererProps<R, SR>, ref: React.Ref<HTMLDivElement>) {
  function handleDragEnter(colIdx: number) {
    if (isFilling && typeof selectedCellsInfo === 'number') {
      if (selectedCellsInfo === selectedPosition.rowIdx) {
        if (colIdx === selectedPosition.idx) {
          setDraggedOverRowIdx?.(rowIdx);
        } else {
          setDraggedOverRowIdx?.(selectedCellsInfo);
        }
      } else {
        setDraggedOverRowIdx?.(selectedCellsInfo);
      }
    } else {
      setDraggedOverRowIdx?.(rowIdx);
    }
    if (isFilling) {
      setDraggedOverColumnIdx?.(colIdx);
    } else {
      setDraggedOverColumnIdx?.(selectedPosition.idx);
    }
  }

  function hasJustFilled() {
    if (draggedOverColumnIdx && draggedOverColumnIdx.length > 1 && !isFilling) {
      return true;
    }

    return false;
  }

  className = clsx(
    'rdg-row',
    `rdg-row-${rowIdx % 2 === 0 ? 'even' : 'odd'}`, {
      'rdg-row-selected': isRowSelected,
      'rdg-group-row-selected': selectedCellProps?.idx === -1
    },
    rowClass?.(row),
    className
  );

  return (
    <div
      role="row"
      aria-rowindex={ariaRowIndex}
      aria-selected={ariaSelected}
      ref={ref}
      className={className}
      style={{ top }}
      {...props}
    >
      {viewportColumns.map(column => {
        const isCellSelected = selectedCellProps?.idx === column.idx;
        const isBottomCell = rowIdx === bottomRowIdx && column.idx === selectedPosition.idx;
        const cell = row[column.key as keyof R] as unknown as CellType;
        const cellCanBeEdited = !checkIfCellDisabled(cell);

        if (selectedCellProps?.mode === 'EDIT' && isCellSelected && cellCanBeEdited) {
          return (
            <EditCell<R, SR>
              key={column.key}
              rowIdx={rowIdx}
              column={column}
              row={row}
              onKeyDown={selectedCellProps.onKeyDown}
              editorProps={selectedCellProps.editorProps}
            />
          );
        }

        return column.key !== 'options' && (
          <CellRenderer
            key={column.key}
            rowIdx={rowIdx}
            column={column}
            row={row}
            cell={cell}
            isCopied={copiedCellIdx === column.idx}
            hasFirstCopiedCell={hasFirstCopiedCell}
            hasLastCopiedCell={hasLastCopiedCell}
            isDraggedOver={getDraggedOverCellIdx(rowIdx, column.idx) === column.idx}
            isCellSelected={isCellSelected}
            isRowSelected={isRowSelected}
            dragHandleProps={isBottomCell && !hasJustFilled() ? dragHandleProps : undefined}
            onFocus={isCellSelected ? (selectedCellProps as SelectedCellProps).onFocus : undefined}
            onKeyDown={isCellSelected ? selectedCellProps!.onKeyDown : undefined}
            onRowClick={onRowClick}
            onRowChange={onRowChange}
            selectCell={selectCell}
            selectRow={selectRow}
            handleCellMouseDown={handleCellMouseDown}
            handleDragEnter={handleDragEnter}
            selectedPosition={selectedPosition}
            draggedOverRowIdx={draggedOverRowIdx}
            draggedOverColumnIdx={draggedOverColumnIdx}
            isFilling={isFilling}
            bottomRowIdx={bottomRowIdx}
            selectedCellsInfo={selectedCellsInfo}
            gridWidth={gridWidth}
            scrollLeft={scrollLeft}
            scrolledToEnd={scrolledToEnd}
            expandRow={expandRow}
          />
        );
      })}
      {enableOptionsCol && optionsCol && (
        <CellRenderer
          key={optionsCol.key}
          rowIdx={rowIdx}
          column={optionsCol}
          row={row}
          isCopied={false}
          isDraggedOver={false}
          isCellSelected={false}
          cell={row[optionsCol.key as keyof R] as unknown as CellType}
          hasFirstCopiedCell={hasFirstCopiedCell}
          hasLastCopiedCell={hasLastCopiedCell}
          isRowSelected={isRowSelected}
          dragHandleProps={undefined}
          onFocus={undefined}
          onKeyDown={undefined}
          onRowClick={onRowClick}
          onRowChange={onRowChange}
          selectCell={selectCell}
          selectRow={selectRow}
          handleCellMouseDown={handleCellMouseDown}
          handleDragEnter={handleDragEnter}
          selectedPosition={selectedPosition}
          draggedOverRowIdx={draggedOverRowIdx}
          draggedOverColumnIdx={draggedOverColumnIdx}
          isFilling={isFilling}
          bottomRowIdx={bottomRowIdx}
          selectedCellsInfo={selectedCellsInfo}
          gridWidth={gridWidth}
          scrollLeft={scrollLeft}
          scrolledToEnd={scrolledToEnd}
          expandRow={expandRow}
        />
      )}
    </div>
  );
}

export default memo(forwardRef(Row)) as <R, SR = unknown>(props: RowRendererProps<R, SR> & React.RefAttributes<HTMLDivElement>) => JSX.Element;
