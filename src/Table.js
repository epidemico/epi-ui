// @flow
import * as React from 'react'
import update from 'immutability-helper'
import _ from 'underscore'

import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'

import SvgIcon from './SvgIcon'
import TableDraggableColumn from './TableDraggableColumn'

import styles from './styles/Table.css'
import paginationStyles from './styles/pagination.css'
import svgiconStyles from './styles/svg-icon.css'
import formStyles from './styles/forms.css'

type PropTypes = {
  keyField: string,
  columnsConfig: Array<Object>,
  data: Array<Object>,

  className: string,
  draggable: boolean,
  exportCSV: boolean,
  filterable: Array<number>,
  filteredColumns?: Array<Object>,
  hover: boolean,
  onColumnDragged: Function,
  options: Object,
  pagination: boolean,
  perPage: number,
  search: boolean,
  sortable: boolean,
  striped: boolean,
  toggleColumns: boolean,
}

type StateTypes = {
  columnsConfig: Array<Object>,
  filteredColumns?: Array<Object>,
}

class Table extends React.Component<PropTypes, StateTypes> {
  // Must keep this synced with PropTypes above manually:
  static flowTypes = `{
    keyField: string,
    columnsConfig: Array<Object>,
    data: Array<Object>,

    className: string,
    draggable: boolean,
    exportCSV: boolean,
    filterable: Array<number>,
    filteredColumns?: Array<Object>,
    hover: boolean,
    onColumnDragged: Function,
    options: Object,
    pagination: boolean,
    perPage: number,
    search: boolean,
    sortable: boolean,
    striped: boolean,
    toggleColumns: boolean,
  }`

  static defaultProps = {
    className: 'table',
    data: [],
    draggable: true,
    exportCSV: false,
    filterable: [],
    hover: true,
    keyField: '_id',
    options: {
      hideSizePerPage: true, // hide the dropdown for sizePerPage
    },
    pagination: true,
    perPage: 20,
    search: true,
    sortable: true,
    striped: true,
    toggleColumns: true,
  }

  constructor(props) {
    super(props)
    this.prepareState(props, true)
  }

  componentWillReceiveProps(props) {
    this.prepareState(props)
  }

  prepareState(props, setDirectly = false) {
    const { columnsConfig, filteredColumns } = props

    for (let i = 0; i < columnsConfig.length; i++) {
      if (!columnsConfig[i].index) columnsConfig[i].index = i
    }

    if (filteredColumns && filteredColumns.length) {
      for (let i = 0; i < filteredColumns.length; i++) {
        if (!filteredColumns[i].index) filteredColumns[i].index = i
      }
    }

    const state = {
      columnsConfig,
      filteredColumns,
    }

    if (setDirectly) this.state = state
    else this.setState(state)
  }

  moveColumn = (dragIndex, hoverIndex) => {
    const { columnsConfig, filteredColumns } = this.state
    const dragColumn = columnsConfig[dragIndex]

    var reorderColumnsConfig = update(columnsConfig, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragColumn]],
    })
    var reorderFilteredColumns = update(filteredColumns || columnsConfig, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragColumn]],
    })

    reorderColumnsConfig[dragIndex].index = dragIndex
    reorderColumnsConfig[hoverIndex].index = hoverIndex
    reorderFilteredColumns[dragIndex].index = dragIndex
    reorderFilteredColumns[hoverIndex].index = hoverIndex

    this.setState(
      () => ({
        columnsConfig: reorderColumnsConfig,
        filteredColumns: reorderFilteredColumns,
      }),
      () => {
        if (this.props.onColumnDragged)
          this.props.onColumnDragged({ dragColumn, filteredColumns: reorderFilteredColumns })
      }
    )
  }

  toggleColumnVisibility(key) {
    const { filteredColumns, columnsConfig } = this.state
    var updateFilteredColumns = (filteredColumns || columnsConfig).map(row => {
      const obj = Object.assign({}, row)
      if (obj.key === key) {
        obj.active = !obj.active
      }
      return obj
    })
    this.setState(
      () => ({
        filteredColumns: updateFilteredColumns
      })
    )
  }

  createCustomToolBar = props => {
    const { columnsConfig, exportCSV, filteredColumns, search, toggleColumns } = this.props
    return (
      <div className="react-bs-custom-toolbar">
        <ul className="btn-list btn-list--inline">
          { toggleColumns &&
            <li>
              <div className="hover-menu-wrapper">
                <button className="btn btn-primary">
                  <SvgIcon
                    icon="Caret"
                    rotate={90}
                    size={0.5}
                    label='Show/Hide Columns'
                    prependLabel
                  />
                </button>
                <ul className="hover-menu hover-menu-condensed columns-controls">
                  {(filteredColumns || columnsConfig)
                    .filter(row => {
                      return row.toggleable
                    })
                    .map(column => {
                      const label =
                        typeof column.label === 'string'
                          ? column.label
                          : column.displayAs || column.label
                      return (
                        <li key={column.key}>
                          <label>
                            <input
                              type="checkbox"
                              name="column-toggle"
                              checked={column.active}
                              onChange={() => this.toggleColumnVisibility(column.key)}
                            />{' '}
                            {label}
                          </label>
                        </li>
                      )
                    })}
                </ul>
              </div>
            </li>
          }
          {exportCSV &&
            <li>{props.components.exportCSVBtn}</li>
          }
        </ul>
        {search &&
          <div className="form-field">{props.components.searchField}</div>
        }
      </div>
    );
  }

  render() {
    const props = {
      ...this.props,
      options: {
        ...Table.defaultProps.options,
        ...this.props.options,
        toolBar: this.createCustomToolBar,
      },
    }
    const { className, draggable } = props
    const { columnsConfig, filteredColumns } = this.state
    return (
      <div className="table-wrapper">
        <div className="table-fade table-fade--left" />
        <div className="table-fade table-fade--right" />
        <BootstrapTable {..._.omit(props, 'className')}>
          {(filteredColumns || columnsConfig)
            .filter(row => {
              return row.active !== undefined ? row.active : true
            })
            .map(column => {
              const obj = Object.assign({}, column)
              obj.dataField = column.key
              obj.index = column.index
              if (!column.dataFormat && column.unsafe) {
                obj.dataFormat = html => html
              }
              if (draggable)
                return (
                  <TableHeaderColumn {...obj}>
                    <TableDraggableColumn moveColumn={this.moveColumn} {...obj} />
                  </TableHeaderColumn>
                )
              else return <TableHeaderColumn {...obj}>{obj.label}</TableHeaderColumn>
            })}
        </BootstrapTable>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(Table)
