// @flow
import React, { Component } from 'react'
import DateRangePicker from 'react-16-daterange-picker'
import { Slider } from '/imports/epi-ui'
import { DATE_FORMAT } from '/imports/constants'
import _ from 'underscore'
import moment from 'moment'

import './lib/stylesheets/datepicker.css'

type Range = {
  start: string,
  end: string,
}

type PropTypes = {
  className: string,
  config: Object,
  data: Array<Object>,
  filterChange: Function,
  query: Object,
}
type StateTypes = {
  query: Object,
  customDateRange: Range,
  customDateRangeIsValid: boolean,
}

export default class SideBar extends Component<PropTypes, StateTypes> {
  constructor(props: PropTypes) {
    super(props)
    this.state = {
      query: props.query,
      customDateRange: props.query.date,
      customDateRangeIsValid: true,
    }
  }

  componentWillReceiveProps(nextProps: PropTypes) {
    this.setState({
      customDateRange: {
        start: moment(nextProps.query.date.start).format('L'),
        end: moment(nextProps.query.date.end).format('L'),
      },
      query: nextProps.query,
    })
  }

  _handleParamsChange(param: string, range: Range, type: string) {
    if (type === 'date') {
      this.state.query.date = { start: range.start, end: range.end }
      this.setState({
        query: this.state.query,
        customDateRange: {
          start: moment(this.state.query.date.start).format('L'),
          end: moment(this.state.query.date.end).format('L'),
        },
      })
      return
    }
    this.state.query[param] = range
    this.setState({ query: this.state.query })
  }

  _getOptions(param: string) {
    return _.uniq(
      this.props.data.map(record => {
        if (record[param] && record[param].length > 0) {
          return record[param]
        }
      })
    )
  }

  _handleCustomRange(date: string, type: string) {
    if (type === 'start') {
      this.state.customDateRange.start = date
      this.state.query.date.start = moment(date)
      this.setState({
        customDateRange: this.state.customDateRange,
        customDateRangeIsValid:
          moment(date).isValid() &&
          moment(this.state.customDateRange.end).diff(moment(this.state.customDateRange.start)) > 0, // Make sure the date is formatted currectly and start is less than end
        query: this.state.query,
      })
    } else if (type === 'end') {
      this.state.customDateRange.end = date
      this.state.query.date.end = moment(date)
      this.setState({
        customDateRange: this.state.customDateRange,
        customDateRangeIsValid:
          moment(date).isValid() &&
          moment(this.state.customDateRange.end).diff(moment(this.state.customDateRange.start)) > 0,
        query: this.state.query,
      })
    }
  }

  _handleRangeChange(range: Range, param: string) {
    this.state.query[param] = range
    this.setState({
      query: this.state.query,
    })
  }

  render() {
    const { config, data, className } = this.props
    const { query } = this.state
    let sideBarOptionsDOM = []
    _.each(config, (value, param) => {
      if (value.type === 'textoption') {
        // Don't show options if there is no data
        sideBarOptionsDOM.push(
          <div key={param} className="form-group">
            <h3>{value.displayName}</h3>
            <select
              className="form-control"
              value={query[param]}
              onChange={e => this._handleParamsChange(param, e.target.value, value.type)}
            >
              <option key={value.displayName} value="All">
                All
              </option>
              {config.fixtures[param].map(op => {
                return (
                  <option key={op} value={op}>
                    {value.format ? value.format(op) : op}
                  </option>
                )
              })}
            </select>
          </div>
        )
      } else if (value.type === 'date') {
        const queryRange = moment.range(query.date.start, query.date.end) // because datepicker needs a moment range
        sideBarOptionsDOM.push(
          <div key={param} className="form-group">
            <div>
              <DateRangePicker
                firstOfWeek={1}
                numberOfCalendars={1}
                selectionType="range"
                value={queryRange}
                onSelect={dateRange => this._handleParamsChange(param, dateRange, value.type)}
              />
            </div>
            <div className="date-picker-control">
              {value.ranges.map(range => {
                return (
                  <button
                    key={range.name}
                    className={
                      range.range.isSame(queryRange) ? 'btn btn-default active' : 'btn btn-default'
                    }
                    onClick={() => this._handleParamsChange(param, range.range, value.type)}
                  >
                    {range.name}
                  </button>
                )
              })}
            </div>
            <div className="custom-daterange">
              <div className="start">
                <div className="form-group form-group-date">
                  <div className="input-group">
                    <div className="input-group-addon">start</div>
                    <input
                      className="form-control"
                      onChange={e => this._handleCustomRange(e.target.value, 'start')}
                      value={this.state.customDateRange.start}
                    />
                  </div>
                </div>
              </div>
              <div className="end">
                <div className="form-group form-group-date">
                  <div className="input-group">
                    <div className="input-group-addon">end</div>
                    <input
                      className="form-control"
                      onChange={e => this._handleCustomRange(e.target.value, 'end')}
                      value={this.state.customDateRange.end}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      } else if (value.type === 'range') {
        sideBarOptionsDOM.push(
          <div key={param} className="range-slider form-group">
            <h3>{value.displayName}</h3>
            <Slider
              className={param}
              minMax={[this.state.query[param].min, this.state.query[param].max]}
              range={this.state.query[param]}
              onChange={range => {
                this._handleRangeChange(range, param)
              }}
            />
          </div>
        )
      }
    })
    return (
      <div>
        <div className={`${className} sidebar collapsed`}>
          <div className={`${className} sidebar-inner`}>
            {sideBarOptionsDOM}
            <button
              className="btn btn-default"
              disabled={!this.state.customDateRangeIsValid}
              onClick={() => this.props.filterChange(this.state.query)}
            >
              Submit
            </button>
            {!this.state.customDateRangeIsValid && (
              <div className={`${className} sidebar-error`}>
                <p>Invalid date selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
