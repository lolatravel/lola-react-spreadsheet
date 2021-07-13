# lola-react-spreadsheet
This is the repository for the custom spreadsheet component that is used on Lola.com's budget edit screen. It was originally forked from [react-data-grid](https://github.com/lolatravel/react-data-grid) and then heavily customized to the point where it made more sense to be a stand alone project. This package uses [Typescript](https://www.typescriptlang.org/) and [Rollup](https://rollupjs.org/guide/en/) for bundling. As of right now, it is not available as an npm package, but that may change in the future.

## Getting Started
This package uses [Storybook](https://storybook.js.org/) for development, creating a self-contained environment where you can test your changes before implementing them in the main application. It's easy to get started with development in a few steps:
1. `$ git clone https://github.com/lolatravel/lola-react-spreadsheet.git`
2. `$ cd lola-react-spreadsheet`
3. `$ npm i`
4. `$ npm start`

At this point, [localhost:6006](http://localhost:6006/) should open up in your browser and you will be taken to the Storybook instance of the component.

There is currently only one story called "All Features" which demonstrates all of the features of the spreadsheet using mocked data to mimic how it looks/feels for editing budgets. Feel free to add more stories if it would help your development process.

## Basic Usage
```jsx
import DataGrid from 'lola-react-spreadsheet';
import 'lola-react-spreadsheet/dist/react-data-grid.css';

const columns = [
  { key: 'id', name: 'ID' },
  { key: 'title', name: 'Title' }
];

const rows = [
  { id: 0, title: 'Example' },
  { id: 1, title: 'Demo' }
];

function App() {
  return (
    <DataGrid
      columns={columns}
      rows={rows}
    />
  );
}

```

## API
### DataGrid Props
#### `columns` (required)
**type**: arrayOf

| Name | Type | Required | Description |
|:-----|:-----|:---------|:------------|
| name | `string` | `true`  | The name of the column. This will be displayed in the header. |
| key  | `string` | `true`  | A unique key to distinguish each column |
| width | `number | string` | `false`  | Column width. If not specified, will be determined automatically. |
| minWidth | `number | string` | `false`  | The minimum width of a column. |
| maxWidth | `number | string` | `false`  | The maximum width of a column. |
| formatter | [Formatter](#formatter) | `false`  | React component that renders the cell content. |
| editable | `boolean` | `false`  | Whether the cells in this column are editable or not. |
| frozen | `boolean` | `false`  | Whether this column is frozen or not. If true, column stays fixed while scrolling horizontally. |
| frozenAlignment | `string` | `false`  | Which side frozen column should be pinned to. Defaults to `left` |
| editor | [Editor](#editor) | `false`  | Editor component that is rendered when the cell is being edited. |
| formatValue | `function` | `false`  | Formatter function to handle formatting while typing (eg. currency) |
<br/>

#### `enableOptionsCol`
**type**: boolean

Lets the spreadsheet know that there will be a column at the end of the table that will be fixed to the right side. This is useful if you want a column to hold actions that you might want to be visible at all times.

**Usage**:
```jsx
<DataGrid
    enableOptionsCol
    columns={[
        ...
        { key: 'options', name: '', frozenAlignment: 'right', width: 54, frozen: true, editable: false }
    ]}
/>
```
<br />

#### `expandRow`
**type**: function

Used to expand and collapse nested rows. Only called if a row has children. Requires a function that takes the current row as a parameter. Currently only called when clicking on a cell in a column with `key: 'name'`. This should be updated at some point to be more agnostic.

**Usage**:
```jsx
<DataGrid
    expandRow={row => { someHandlerFunc(row.id) }}
/>
```
<br />

#### `headerRowHeight`
**type**: number

The height of the header row in px.

**Usage**:
```jsx
<DataGrid
    headerRowHeight={48}
/>
```
<br />

#### `onFill`
**type**: function

Function called whenever cells are filled. Can be used to create a custom callback.
<br />

#### `onPaste`
**type**: function

Function called whenever a value is pasted into a cell. Can be used to create a custom callback.
<br />

#### `onRowsChange`
**type**: function

Function that is called after any change is made to the spreadsheet.
<br />

#### `rowHeight`
**type**: number

The height of each row in px.

**Usage**:
```jsx
<DataGrid
    rowHeight={60}
/>
```
<br />

#### `rowKeyGetter`
**type**: function

Custom function that is used to return the key of a row.
In most cases, this can simply be: `rowKeyGetter={row => row.id}`
<br />

#### `rows` (required)
**type**: arrayOf

Each Row is an object with keys that correspond to the `key` item of a Column. There are a few other useful properties that can be used for formatting. In addition, any other properties can be added that might be wanted in a callback function.

| Name | Type | Required | Description |
|:-----|:-----|:---------|:------------|
| `id` | `string` | Technically `false`, but recommended.  | Unique id to identify each row |
| `parentId`  | `Column` | `false` unless nested row. | Id of row under which this row is nested. |
| `children` | [rows](#rows) | `false` unless has nested rows. | Array of rows that are nested under this row. |
| `isExpanded` | `boolean` | `false` | Whether or not this row's children are displayed. |
| `[column.key]` | [RowItem](#rowitem) | `false` | Information for displaying cell contents based on the column. |
<br />


### Advanced Column Props
#### `Editor`
**type**: JSX Element

```jsx
editor: props => <Editor { ...props } />
```
| Name | Type | Description |
|:-----|:-----|:------------|
| `rowIdx` | `number` | The row index of the cell that is being edited. |
| `column`  | `Column` | Reference to the current column. |
| `top` | `number` | Top positioning of cell in px. |
| `left` | `number` | Left positioning of cell in px. |
<br/>

#### `Formatter`
**type**: JSX Element

```jsx
formatter: props => <Formatter { ...props } />
```
| Name | Type | Description |
|:-----|:-----|:------------|
| `rowIdx` | `number` | The row index of the cell that is being rendered. |
| `cell`  | `Cell` | Reference to the current cell. |
| `row` | `Row` | Reference to the row which contains this cell. |
| `isCellSelected` | `boolean` | Whether this cell is selected or not. |
<br/>

### Advanced Row Props
#### `RowItem`
**type**: string | object

| Name | Type | Required | Description |
|:-----|:-----|:---------|:------------|
| `value` | `string` | `true` | Value of text inside cell. |
| `disabled`  | `boolean` | `false` | If true, cell cannot be edited |
| `error` | `boolean` | `false` | If true, cell text will be red to indicate something is wrong |
| `alert` | `string` | `false` | If string exists, cell will have a red background and tooltip that displays the alert string. |
| `warning` | `string` | `false` | If string exists, cell will have a yellow background and tooltip that displays the alert string. |
<br/>
