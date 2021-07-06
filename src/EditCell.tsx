import React, { useState, useCallback } from 'react';
import clsx from 'clsx';

import EditorContainer from './editors/EditorContainer';
import type { CellRendererProps, SharedEditorProps, Omit, CellType } from './types';

type SharedCellRendererProps<R, SR> = Pick<CellRendererProps<R, SR>,
  | 'rowIdx'
  | 'row'
  | 'column'
>;

interface EditCellProps<R, SR> extends SharedCellRendererProps<R, SR>, Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  editorProps: SharedEditorProps<R>;
  cell?: string | CellType
}

export default function EditCell<R, SR>({
  className,
  column,
  row,
  rowIdx,
  editorProps,
  cell,
  ...props
}: EditCellProps<R, SR>) {
  const [dimensions, setDimensions] = useState<{ left: number; top: number } | null>(null);
  const span = typeof cell === 'object' && typeof cell.span === 'number' ? cell.span : 1;

  const cellRef = useCallback(node => {
    if (node !== null) {
      const { left, top } = node.getBoundingClientRect();
      setDimensions({ left, top });
    }
  }, []);

  const { cellClass } = column;
  className = clsx(
    'rdg-cell',
    {
      'rdg-cell-frozen': column.frozen,
      'rdg-cell-frozen-last': column.isLastFrozenColumn
    },
    'rdg-cell-selected',
    'rdg-cell-editing',
    typeof cellClass === 'function' ? cellClass(row) : cellClass,
    className
  );

  function getCellContent() {
    if (dimensions === null) return;
    const { scrollTop: docTop, scrollLeft: docLeft } = document.scrollingElement ?? document.documentElement;
    const { left, top } = dimensions;
    const gridLeft = left + docLeft;
    const gridTop = top + docTop;

    return (
      <EditorContainer
        {...editorProps}
        rowIdx={rowIdx}
        column={column}
        left={gridLeft}
        top={gridTop}
      />
    );
  }

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1} // aria-colindex is 1-based
      aria-selected
      ref={cellRef}
      className={className}
      style={{
        width: column.width * span,
        left: column.left
      }}
      {...props}
    >
      {getCellContent()}
    </div>
  );
}
