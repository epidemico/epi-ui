// @flow
import * as React from 'react'
import update from 'immutability-helper'
import _ from 'underscore'

import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'

import TableDraggableColumn from './TableDraggableColumn'

import styles from './styles/Table.css'

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
  sortable: boolean,
  striped: boolean,
  toggleColumns: boolean,
  toolbar: React.Node,
}

type StateTypes = {
  columnsConfig: Array<Object>,
  filteredColumns?: Array<Object>,
}

class Table extends React.Component<PropTypes, StateTypes> {
  static defaultProps = {
    className: 'table',
    data: [],
    draggable: true,
    exportCSV: false,
    filterable: [],
    hover: true,
    keyField: '_id',
    options: {},
    pagination: true,
    perPage: 20,
    sortable: true,
    striped: true,
    toolbar: null,
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

  render() {
    const { toolbar, className, draggable } = this.props
    const { columnsConfig, filteredColumns } = this.state
    return (
      <div className={className}>
        {toolbar}
        <div className="table-fade table-fade--left" />
        <div className="table-fade table-fade--right" />
        <BootstrapTable {..._.omit(this.props, 'className')}>
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
