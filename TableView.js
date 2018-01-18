// @flow
import React, { Component } from 'react'
import d3 from 'd3'
import { Table, SvgIcon } from '/imports/epi-ui'
import { $, t } from '/imports/fui'

type PropTypes = {
  actions: Object,
  childrenCalled: Object,
  columnsConfig: Array<Object>,
  data: Array<Object>,
  draggable: boolean,
  exportCSV: boolean,
  exportCSVText?: string,
  fetching: Object,
  filteredColumns: Array<Object>,
  getMoreRecords: Function,
  handleEdit: Function,
  handleExportToCsv: Function,
  keyField: string,
  onColumnDragged: Function,
  onDomainClick: Function,
  onPageChange: Function,
  onToggleColumn: Function,
  pagination: boolean,
  searchPlaceholder: string,
  sizePerPage: number,
  sizePerPageList: Array<number>,
  tableInfo: Function,
  toggleColumns: boolean,
  totalCounts: number,
  totalRecords: number,
  trClassFormat: Function,
}
type StateTypes = {
  data: Array<Object>,
  sizePerPage: number,
}

export default class TableView extends Component<PropTypes, StateTypes> {
  static defaultProps = {
    exportCSVText: `${t('Export')} CSV`,
    getMoreRecords: () => {},
    handleExportToCsv: () => {},
    sizePerPage: 10, // default posts per page
    sizePerPageList: [10, 50, 100, 500], // dropdown list for size per page
    tableInfo: () => {},
  }

  numberOfViewedItems = 0
  page = 1

  constructor(props: PropTypes) {
    super(props)
    this.state = {
      data: (props.data || []).map(term => {
        const obj = Object.assign({}, term)
        if (!obj._id && term) {
          obj._id = term.id
        } // used for key in Table component
        return obj
      }),
      sizePerPage: props.sizePerPage,
    }
  }

  componentDidMount() {
    const { onDomainClick } = this.props
    // FIXME: This is a workaround
    $('.black-list').click(function() {
      const domain = this.getAttribute('data-domain')
      onDomainClick(domain)
    })
  }

  componentWillReceiveProps(nextProps: PropTypes) {
    this.setState({
      data: (nextProps.data || []).map(term => {
        const obj = Object.assign({}, term)
        if (!obj._id && term) {
          obj._id = term.id
        } // used for key in Table component
        return obj
      }),
    })
  }

  componentDidUpdate() {
    this._updateTableInfo()
  }

  _updateTableInfo() {
    const { tableInfo } = this.props
    const { sizePerPage } = this.state
    tableInfo({
      sizePerPage,
      numberOfViewedItems: this.numberOfViewedItems,
      page: this.page,
    })
  }

  _handleToggleColumn(key: string) {
    const { onToggleColumn } = this.props
    onToggleColumn(key)
  }

  render() {
    const {
      childrenCalled,
      trClassFormat,
      sizePerPageList,
      totalCounts,
      getMoreRecords,
      columnsConfig,
      pagination,
      toggleColumns,
      onToggleColumn,
      filteredColumns,
      draggable,
      onColumnDragged,
      keyField,
    } = this.props

    const { sizePerPage } = this.state

    const tableProps = {
      className: 'table-wrapper',
      childrenCalled: childrenCalled,
      data: this.state.data,
      onToggleColumn: onToggleColumn || (() => {}),
      toggleColumns: toggleColumns || false, // Add "toggleColumns" props to show/hide table columns toggle btns
      pagination: pagination || false,
      exportCSV: this.props.exportCSV,
      trClassName: trClassFormat || null, // add disabled-row class to unavailable views
      condensed: false,
      bordered: false,
      striped: false,
      draggable,
      onColumnDragged,
      keyField,
      //expandableRow: expandableRow || false,
      //expandComponent: expandComponent || null,
      search: this.props.search === undefined ? true : this.props.search,
      searchPlaceholder: this.props.searchPlaceholder || 'Search',
      cellEdit: this.props.cellEdit
        ? {
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: (row, cellName, cellValue, done) =>
              this.props.handleEdit(row, cellName, cellValue, done),
          }
        : {},
      options: {
        onSearchChange: this.props.onSearchChange || (() => {}),
        searchDelayTime: this.props.searchDelayTime || 0,
        onExportToCSV: this.props.exportCSV ? this.props.handleExportToCsv.bind(this) : () => {},
        exportCSVText: this.props.exportCSV ? this.props.exportCSVText : `${t('Export')} CSV`,
        page: this.page,
        sizePerPage, // default posts per page
        sizePerPageList, // dropdown list for size per page
        pageStartIndex: 1, // where to start counting the pages
        paginationSize: 6, // the pagination bar size
        prePage: 'Prev', // Previous page button text
        nextPage: 'Next', // Next page button text
        firstPage: 'First', // First page button text
        //onRowClick: onRowClick || false,
        toolBar: props => {
          return (
            <div className="react-bs-custom-toolbar">
              <ul className="btn-list btn-list--inline">
                {toggleColumns && (
                  <li>
                    <div className="hover-menu-wrapper">
                      <button className="btn btn-primary">
                        <SvgIcon
                          icon="Caret"
                          rotate={90}
                          size={0.5}
                          label={t('Show/Hide Columns')}
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
                                    onChange={() => this._handleToggleColumn(column.key)}
                                  />{' '}
                                  {label}
                                </label>
                              </li>
                            )
                          })}
                      </ul>
                    </div>
                  </li>
                )}
                <li> {props.components.exportCSVBtn}</li>
              </ul>
              {props.components.searchField && (
                <div className="form-field">{props.components.searchField}</div>
              )}
            </div>
          )
        },
        sizePerPageDropDown: props => (
          <ul className="btn-list btn-list--inline">
            {props.sizePerPageList.map((n, idx) => {
              const isActive = n === this.state.sizePerPage ? 'btn-primary' : 'btn-gray'
              return (
                <li
                  key={idx}
                  className={`btn ${isActive}`}
                  onClick={() => props.changeSizePerPage(n)}
                >
                  {n}
                </li>
              )
            })}
          </ul>
        ),

        paginationPanel: props => {
          return (
            <div className="pagination-bar">
              <div className="pagination-perpage">
                {props.components.sizePerPageDropdown}
                <span> per page</span>
              </div>
              {/*<div className="pagination-totaltext">{props.components.totalText}</div>*/}
              <div className="pagination-pagelist">{props.components.pageList}</div>
            </div>
          )
        },
        // lastPage: 'Last',     // Last page button text
        paginationShowsTotal: (start, to, total) => `Showing ${start} to ${to} of ${totalCounts}`,
        hideSizePerPage: false, // hide the dropdown for sizePerPage
        onPageChange: (page, pageSize) => {
          this.page = page
          // Go and fetch the next data
          this.numberOfViewedItems = page * pageSize
          if (this.numberOfViewedItems >= this.state.data.length) getMoreRecords()
          this._updateTableInfo()
        },
        onSizePerPageList: size => {
          this.setState({ sizePerPage: size })
          if (this.numberOfViewedItems > this.state.data.length) getMoreRecords()
        },
      },
      columnsConfig: columnsConfig || [],
      filteredColumns: filteredColumns || columnsConfig,
    }
    return <Table {...tableProps} />
  }
}
