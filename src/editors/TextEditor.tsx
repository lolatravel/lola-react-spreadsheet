import React from 'react';
import type { EditorProps, CellType } from '../types';

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
}

export default function TextEditor<TRow, TSummaryRow = unknown>({
  row,
  column,
  onRowChange,
  onClose
}: EditorProps<TRow, TSummaryRow>) {
  const cell = row[column.key as keyof TRow] as unknown as CellType;
  return typeof cell === 'string' ? (
    <input
      className={column.alignment === 'right' ? 'rdg-text-editor-right' : 'rdg-text-editor'}
      ref={autoFocusAndSelect}
      value={cell}
      onChange={event => onRowChange({ ...row, [column.key]: event.target.value })}
      onBlur={() => onClose(true)}
    />
  ) : (
    <input
      className={column.alignment === 'right' ? 'rdg-text-editor-right' : 'rdg-text-editor'}
      ref={autoFocusAndSelect}
      value={cell.value}
      onChange={event => onRowChange({ ...row, [column.key]: { ...cell, value: event.target.value } })}
      onBlur={() => onClose(true)}
    />
  );
}
