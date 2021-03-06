/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactElement } from 'react';
import type { SortDirection } from './enums';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface Column<TRow, TSummaryRow = unknown> {
  /** The name of the column. By default it will be displayed in the header cell */
  name: string | ReactElement;
  /** A unique key to distinguish each column */
  key: string;
  /** Column width. If not specified, it will be determined automatically based on grid width and specified widths of other columns */
  width?: number | string;
  /** Minimum column width in px. */
  minWidth?: number;
  /** Maximum column width in px. */
  maxWidth?: number;
  /** Which way text should be aligned in cell. **/
  alignment?: string;
  cellClass?: string | ((row: TRow) => string | undefined);
  headerCellClass?: string;
  /** Formatter to be used to render the cell content */
  formatter?: React.ComponentType<FormatterProps<TRow>>;
  /** Enables cell editing. If set and no editor property specified, then a textinput will be used as the cell editor */
  editable?: boolean | ((row: TRow) => boolean);
  /** Determines whether column is frozen or not */
  frozen?: boolean;
  /** Which side frozen column should be pinned to **/
  frozenAlignment?: string;
  /** Enable resizing of a column */
  resizable?: boolean;
  /** Enable sorting of a column */
  sortable?: boolean;
  /** Sets the column sort order to be descending instead of ascending the first time the column is sorted */
  sortDescendingFirst?: boolean;
  /** Editor to be rendered when cell of column is being edited. If set, then the column is automatically set to be editable */
  editor?: React.ComponentType<EditorProps<TRow, TSummaryRow>>;
  editorOptions?: {
    /** @default false */
    createPortal?: boolean;
    /** @default false */
    editOnClick?: boolean;
    /** Prevent default to cancel editing */
    onCellKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    /** Control the default cell navigation behavior while the editor is open */
    onNavigation?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
    // TODO: Do we need these options
    // editOnDoubleClick?: boolean;
    /** @default false */
    // commitOnScroll?: boolean;
  };
  /** Header renderer for each header cell */
  headerRenderer?: React.ComponentType<HeaderRendererProps<TRow, TSummaryRow>>;
  /** Component to be used to filter the data of the column */
  filterRenderer?: React.ComponentType<FilterRendererProps<TRow, any, TSummaryRow>>;
  formatValue?: (params: FormatCostShape) => string;
}

export interface FormatCostShape {
  value: string | number;
  locale?: string;
  currency?: string;
  padDecimalsWithZeros?: boolean;
  canBeNegative?: boolean;
  defaultToZero?: boolean;
}

export interface CalculatedColumn<TRow, TSummaryRow = unknown> extends Column<TRow, TSummaryRow> {
  idx: number;
  width: number;
  left: number;
  resizable: boolean;
  sortable: boolean;
  isLastFrozenColumn?: boolean;
  formatter: React.ComponentType<FormatterProps<TRow>>;
  alignment?: string;
}

export interface Position {
  idx: number;
  rowIdx: number;
}

export interface CellType {
  value: string;
  disabled?: boolean;
  error?: boolean;
  alert?: string;
  warning?: string;
  span?: number;
}

export interface FormatterProps<TRow = any> {
  rowIdx: number;
  cell: string | CellType;
  row: TRow;
  isCellSelected: boolean;
  isRowSelected: boolean;
  onRowSelectionChange: (checked: boolean, isShiftClick: boolean) => void;
  onRowChange: (row: Readonly<TRow>) => void;
}

export interface GroupFormatterProps<TRow, TSummaryRow = unknown> {
  groupKey: unknown;
  column: CalculatedColumn<TRow, TSummaryRow>;
  childRows: readonly TRow[];
  isExpanded: boolean;
  isCellSelected: boolean;
  isRowSelected: boolean;
  onRowSelectionChange: (checked: boolean) => void;
  toggleGroup: () => void;
}

export interface SharedEditorProps<TRow> {
  row: Readonly<TRow>;
  rowHeight: number;
  editorPortalTarget: Element;
  onRowChange: (row: Readonly<TRow>, commitChanges?: boolean) => void;
  onClose: (commitChanges?: boolean) => void;
}

export interface EditorProps<TRow, TSummaryRow = unknown> extends SharedEditorProps<TRow> {
  rowIdx: number;
  column: Readonly<CalculatedColumn<TRow, TSummaryRow>>;
  top: number;
  left: number;
}

export interface HeaderRendererProps<TRow, TSummaryRow = unknown> {
  column: CalculatedColumn<TRow, TSummaryRow>;
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (columnKey: string, direction: SortDirection) => void;
  allRowsSelected: boolean;
  onAllRowsSelectionChange: (checked: boolean) => void;
}

interface SelectedCellPropsBase {
  idx: number;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface EditCellProps<TRow> extends SelectedCellPropsBase {
  mode: 'EDIT';
  editorProps: SharedEditorProps<TRow>;
  cell?: string | CellType
}

export interface SelectedCellProps extends SelectedCellPropsBase {
  mode: 'SELECT';
  onFocus: () => void;
  dragHandleProps?: Pick<React.HTMLAttributes<HTMLDivElement>, 'onMouseDown' | 'onDoubleClick'>;
}

export interface CellRendererProps<TRow, TSummaryRow = unknown> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  rowIdx: number;
  column: CalculatedColumn<TRow, TSummaryRow>;
  row: TRow & { children?: ReactElement[] };
  cell: string | CellType;
  isCopied: boolean;
  isDraggedOver: boolean;
  isCellSelected: boolean;
  isRowSelected: boolean;
  dragHandleProps?: Pick<React.HTMLAttributes<HTMLDivElement>, 'onMouseDown' | 'onDoubleClick'>;
  onRowChange: (rowIdx: number, newRow: TRow) => void;
  onRowClick?: (rowIdx: number, row: TRow, column: CalculatedColumn<TRow, TSummaryRow>) => void;
  selectCell: (position: Position, enableEditor?: boolean) => void;
  selectRow: (selectRowEvent: SelectRowEvent) => void;
  handleCellMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  selectedPosition: SelectCellState | EditCellState<TRow>;
  handleDragEnter: (colIdx: number) => void;
  draggedOverRowIdx?: number;
  draggedOverColumnIdx?: number[];
  hasFirstCopiedCell: boolean;
  hasLastCopiedCell: boolean;
  isFilling: boolean;
  bottomRowIdx: number;
  selectedCellsInfo: number | undefined;
  gridWidth: number;
  scrollLeft: number;
  scrolledToEnd: boolean;
  expandRow?: (row: TRow) => void;
}

export interface RowRendererProps<TRow, TSummaryRow = unknown> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  viewportColumns: readonly CalculatedColumn<TRow, TSummaryRow>[];
  row: TRow;
  cellRenderer?: React.ComponentType<CellRendererProps<TRow, TSummaryRow>>;
  rowIdx: number;
  copiedCellIdx?: number;
  getDraggedOverCellIdx: (currentRowIdx: number, colIdx: number) => number | undefined;
  isRowSelected: boolean;
  top: number;
  selectedCellProps?: EditCellProps<TRow> | SelectedCellProps;
  onRowChange: (rowIdx: number, row: TRow) => void;
  onRowClick?: (rowIdx: number, row: TRow, column: CalculatedColumn<TRow, TSummaryRow>) => void;
  rowClass?: (row: TRow) => string | undefined;
  setDraggedOverRowIdx?: (overRowIdx: number) => void;
  selectCell: (position: Position, enableEditor?: boolean) => void;
  selectRow: (selectRowEvent: SelectRowEvent) => void;
  selectedPosition: SelectCellState | EditCellState<TRow>;
  isFilling: boolean;
  isMultipleRows: boolean;
  selectedCellsInfo: number | undefined;
  setDraggedOverColumnIdx?: (colIdx: number) => void;
  hasFirstCopiedCell: boolean;
  hasLastCopiedCell: boolean;
  handleCellMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  bottomRowIdx: number;
  dragHandleProps?: Pick<React.HTMLAttributes<HTMLDivElement>, 'onMouseDown' | 'onDoubleClick'>;
  draggedOverRowIdx?: number;
  draggedOverColumnIdx?: number[];
  gridWidth: number;
  scrollLeft: number;
  scrolledToEnd: boolean;
  expandRow?: (row: TRow) => void;
  enableOptionsCol?: boolean;
  optionsCol?: CalculatedColumn<TRow, TSummaryRow>;
}

export interface FilterRendererProps<TRow, TFilterValue = unknown, TSummaryRow = unknown> {
  column: CalculatedColumn<TRow, TSummaryRow>;
  value: TFilterValue;
  onChange: (value: TFilterValue) => void;
}

export type Filters = Record<string, any>;

export interface SelectRowEvent {
  rowIdx: number;
  checked: boolean;
  isShiftClick: boolean;
}

export interface FillEvent<TRow, TSummaryRow> {
  columnKey: string;
  sourceRow: TRow;
  targetRows: TRow[];
  targetCols?: CalculatedColumn<TRow, TSummaryRow>[];
  across?: boolean;
}

export interface PasteEvent<TRow> {
  sourceColumnKey: string;
  sourceRows: TRow[];
  targetColumnKey: string;
  targetRows: TRow[];
}

interface SelectCellState extends Position {
  mode: 'SELECT';
}

interface EditCellState<R> extends Position {
  mode: 'EDIT';
  row: R;
  originalRow: R;
  key: string | null;
}
