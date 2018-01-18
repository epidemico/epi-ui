// @flow
import React, { Component } from 'react'
import SvgIcon from '/imports/epi-ui/SvgIcon'
import { _, $, moment } from '/imports/fui'

type PropTypes = {
  data: Array<Object>,
}

type StateTypes = {
  dataByOrg: Object,
  dataByDate: Object,
  dataBySource: Object,
}
export default class DataCoverage extends Component<PropTypes, StateTypes> {
  constructor(props: PropTypes) {
    super(props)
    const { data } = props
    this.state = {
      dataByOrg: _.groupBy(data, 'organization'),
      dataByDate: _.groupBy(data, 'date'),
      dataBySource: _.groupBy(data, v => v.source && v.source.name),
    }
  }

  componentDidMount() {
    $('body').on('click', '.is-empty', function() {
      $(this).toggleClass('is-selected')
    })
  }

  _handleEmptyCellCall(category: string, date: string) {
    alert(category + ' ' + date)
  }

  render() {
    const tableRows = []
    _.map(this.state.dataBySource, (values, source) => {
      let total = 0
      const subRows = []
      let date
      tableRows.push(
        <tr className="level1">
          <th>
            <SvgIcon icon="MinusCircle" size={0.6} label={source} />
          </th>
          {_.map(_.groupBy(values, 'date'), value => {
            if (value[0].source.children) {
              subRows.push(
                _.reduce(
                  value[0].source.children,
                  (acc, child) => {
                    if (!acc[child.name]) {
                      acc[child.name] = []
                      acc[child.name].push({ date: value[0].date, count: child.count })
                    } else {
                      acc[child.name].push({ date: value[0].date, count: child.count })
                    }
                    return acc
                  },
                  {}
                )
              )
            }
            if (subRows.length === values.length) {
              _.each(
                subRows.reduce((acc, t) => {
                  _.each(t, (count, name) => {
                    if (!acc[name]) {
                      acc[name] = []
                      acc[name].push({ count: count[0].count, date: count[0].date })
                    } else {
                      acc[name].push({ count: count[0].count, date: count[0].date })
                    }
                  })
                  return acc
                }, {}),
                (counts, subName) => {
                  let subTotal = 0
                  tableRows.push(
                    <tr className="level2">
                      <th className="th-source">
                        <SvgIcon icon="Square" size={0.6} label={subName} />
                      </th>
                      {counts.map(count => {
                        subTotal += count.count
                        if (count.count) {
                          return <td className="is-source-data">{count.count}</td>
                        } else {
                          return (
                            <td
                              onClick={() => this._handleEmptyCellCall(subName, count.date)}
                              className="is-empty"
                            />
                          )
                        }
                      })}
                      <td className="is-total">{subTotal}</td>
                    </tr>
                  )
                }
              )
            }
            total += value[0].source.count
            if (value[0].source.count === 0) {
              return (
                <td
                  onClick={() => this._handleEmptyCellCall(value[0].source, value)}
                  className="is-empty"
                />
              )
            } else {
              return <td>{value[0].source.count}</td>
            }
          })}
          <td className="is-total">{total}</td>
        </tr>
      )
    })
    return (
      <div>
        {_.map(this.state.dataByOrg, (datum, organization) => (
          <div>
            <h2>{organization}</h2>
            <table className="table table-blocks">
              <thead>
                <tr>
                  <th />
                  {_.map(this.state.dataByDate, (values, date) => {
                    return (
                      <th key={date}>
                        <span className="th-timeline">{moment(date).format('MMMM')}</span>
                      </th>
                    )
                  })}
                  <th>
                    <span className="th-timeline">Total</span>
                  </th>
                </tr>
              </thead>
              <tbody>{tableRows.reverse()}</tbody>
            </table>
          </div>
        ))}
      </div>
    )
  }
}
