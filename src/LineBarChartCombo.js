// @flow
import * as React from 'react'
import _ from 'underscore'
import d3 from 'd3'
import nvd3 from 'nvd3'
import moment from 'moment'

import { colors } from './themes'
import nvStyles from './styles/nvd3.css'

type PropTypes = {
  changePerspective?: Function,
  context?: Object,
  data: Array<Object>,
  height: string,
  initialChart: string,
  lineBarComboActive?: boolean,
  name?: string,
  onBrush?: Function,
  perspective?: Object,
  perspectiveBtns?: boolean,
  positiveNegativeCounts?: Array<Object>,
  showBrush: boolean,
  subPerspective?: Object,
  useInteractiveGuideline: boolean,
  width: string,
  yaxis?: number,
}

type StateTypes = {
  activeChartName: string,
  chart: Object,
  currentChart: any,
  data: string,
  lineChartIsActive: boolean,
  useInteractiveGuideline: false,
  yaxis?: number,
}

export default class LineBarChartCombo extends React.Component<PropTypes, StateTypes> {
  // Must keep this synced with PropTypes above manually:
  static flowTypes = `{
  changePerspective?: Function,
  context?: Object,
  data: Array<Object>,
  height: string,
  initialChart: string,
  lineBarComboActive?: boolean,
  name?: string,
  onBrush?: Function,
  perspective?: Object,
  perspectiveBtns?: boolean,
  positiveNegativeCounts?: Array<Object>,
  showBrush: boolean,
  subPerspective?: Object,
  useInteractiveGuideline: boolean,
  width: string,
  yaxis?: number,
}`

  static defaultProps = {
    initialChart: 'Line Chart',
    height: '500px',
    width: '100%',
    showBrush: true,
  }

  name: string
  toggledLegends = {}
  defaultChart: React.Node
  defaultSmoothChart: React.Node

  constructor(props: PropTypes) {
    super()
    this.name =
      props.name ||
      `chart-${Math.random()
        .toString(16)
        .substr(2)}`

    this.defaultChart = nvd3.models[props.showBrush ? 'lineWithFocusChart' : 'lineChart'](extent => {
      props.onBrush && props.onBrush(extent)
    }).color(colors)
    this.defaultSmoothChart = nvd3.models[props.showBrush ? 'lineWithFocusChart' : 'lineChart'](extent => {
      props.onBrush && props.onBrush(extent)
    })
      .color(colors)
      .interpolate('basis')
    this.state = {
      data: JSON.stringify(props.data),
      lineChartIsActive: true,
      activeChartName: 'Line Chart',
      chart: {
        'Line Chart': this.defaultChart,
        'Smooth Line Chart': this.defaultSmoothChart,
        'Bar Chart': nvd3.models
          .multiBarChart()
          .reduceXTicks(true) //If 'false', every single x-axis tick label will be rendered.
          .rotateLabels(0) //Angle to rotate x-axis labels.
          .showControls(true) //Allow user to switch between 'Grouped' and 'Stacked' mode.
          .groupSpacing(0.1), //Distance between each group of bars.
        'Line Bar Combo': nvd3.models
          .multiChart()
          .margin({ top: 50, right: 80, bottom: 30, left: 80 })
          .color(colors),
      },
      currentChart: this.defaultChart, // default to linechart
    }
  }
  componentDidMount() {
    const chart = this.state.chart[this.state.activeChartName]
    const svgPath = `#${this.name}-line-chart svg`
    let maxInterval = 10
    const findChart = setInterval(() => {
      const domExists = d3.select(svgPath)[0][0]
      if (domExists || maxInterval-- < 0) clearInterval(findChart)
      if (domExists) {
        nvd3.addGraph(() => {
          // A fix to align the ticks
          // chart.xAxis.tickValues((values) => {
          //   return _.map(values[0].values, (v) => {
          //     return new Date(v.x);
          //   })
          // })
          chart.xAxis.rotateLabels(-30)
          // chart.x2Axis.rotateLabels(-30)
          chart.xAxis.tickFormat(d => {
            return d3.time.format('%d-%b-%y')(new Date(d))
          })
          chart.x2Axis.tickFormat(d => {
            return d3.time.format('%d-%b-%y')(new Date(d))
          })
          chart.yAxis
            .tickFormat(d => {
              return parseFloat(d.toFixed(1))
            })
            .showMaxMin(false)
            .axisLabel(this._getCurrentActivePerspective('perspective'))
            .axisLabelDistance(-10)
          chart.y2Axis.tickFormat(d3.format(''))
          chart.yDomain([0, this._getMaxValue(JSON.parse(this.state.data))]) // Always start the y-axis with zero
          // chart.useInteractiveGuideline(true)
          // chart.showVoronoi(true)
          d3
            .select(svgPath)
            .datum(JSON.parse(this.state.data))
            .transition()
            .duration(500)
            .call(chart)
          return chart
        })
        if (this.props.initialChart) {
          this._changeChart({ currentTarget: { value: this.props.initialChart } })
        }
      }
    }, 250)
  }
  componentWillReceiveProps(nextProps: PropTypes) {
    this.setState({
      data: JSON.stringify(nextProps.data),
      yaxis: nextProps.yaxis,
    })
  }
  shouldComponentUpdate(nextProps: PropTypes, nextState: StateTypes) {
    return nextState.data !== this.state.data || this.state.activeChartName !== nextState.activeChartName
  }
  componentDidUpdate() {
    // Update the axises with the right label
    ;(this.state.currentChart.yAxis || this.state.currentChart.yAxis1)
      .tickFormat(d => {
        return parseFloat(d.toFixed(1))
      })
      .showMaxMin(false)
      .axisLabel(this._getCurrentActivePerspective('perspective'))
      .axisLabelDistance(-10)
    if (this.state.currentChart.yAxis2) this.state.currentChart.yAxis2.axisLabel('% of records')
    if (!this.state.yaxis && this.state.currentChart.yDomain && this.state.activeChartName !== 'Line Bar Combo') {
      this.state.currentChart.yDomain([0, this._getMaxValue(JSON.parse(this.state.data))]) // Always start the y-axis with zoro
    } else if (this.state.currentChart.yDomain && this.state.activeChartName !== 'Line Bar Combo') {
      this.state.currentChart.yDomain([-1, 1]) // Sentiment values are always between -1 and 1
    }
    d3
      .select(`#${this.name}-${this.state.activeChartName.toLowerCase().replace(/ /g, '-')} svg`)
      .datum(JSON.parse(this.state.data))
      .transition()
      .duration(500)
      .call(this.state.currentChart)
  }
  _registerLegendToggle(chart: Object) {
    chart.legend.dispatch.legendClick = d => {
      var disabledValue = this.toggledLegends[d.key] === undefined ? false : !this.toggledLegends[d.key]
      if (this.toggledLegends[d.key] !== disabledValue) this.toggledLegends[d.key] = disabledValue
      if (this.state.currentChart.yDomain) {
        this.state.currentChart.yDomain([0, this._getMaxValue(JSON.parse(this.state.data))])
      }
    }
  }
  _getMaxValue(data: Array<Object>) {
    return d3.max(_.filter(data, d => (this.toggledLegends[d.key] === undefined ? true : this.toggledLegends[d.key])), d => {
      return d3.max(d.values, value => {
        return value.y
      })
    })
  }
  _changeChart = (e: SyntheticEvent<HTMLSelectElement> | Object) => {
    const selectedChart = e.currentTarget.value
    const chart = this.state.chart[selectedChart]
    this._registerLegendToggle(chart)
    if (selectedChart === 'Bar Chart') {
      chart.xAxis.tickFormat(d => {
        return d3.time.format('%d-%b-%y')(new Date(d))
      })
      chart.yAxis
        .tickFormat(d3.format(',.1f'))
        .axisLabel(this._getCurrentActivePerspective('perspective'))
        .axisLabelDistance(-10)
    } else if (selectedChart === 'Smooth Line Chart') {
      chart.tooltip.contentGenerator(obj => {
        if (obj.point.y === -1) {
          return ' '
        }
        return `
          <span className='tooltiptext'>
            <p>${moment(obj.point.x).format('lll')} </p>
            <p>${obj.point.y} </p>
          </span>
        `
      })
      chart.xAxis.tickFormat(d => {
        return d3.time.format('%d-%b-%y')(new Date(d))
      })
      chart.xAxis.rotateLabels(-30)
      chart.x2Axis.tickFormat(d => {
        return d3.time.format('%d-%b-%y')(new Date(d))
      })
      chart.yAxis
        .tickFormat(d => {
          return parseFloat(d.toFixed(1))
        })
        .axisLabel(this._getCurrentActivePerspective('perspective'))
        .axisLabelDistance(-10)
      chart.y2Axis.tickFormat(d => {
        return parseFloat(d.toFixed(1))
      })
    } else if (selectedChart === 'Line Chart') {
      chart.tooltip.contentGenerator(obj => {
        if (obj.point.y === -1) {
          return ' '
        }
        return `
          <span className='tooltiptext'>
            <p>${moment(obj.point.x).format('lll')} </p>
            <p>${obj.point.y} </p>
          </span>
        `
      })
      chart.xAxis.tickFormat(d => {
        return d3.time.format('%d-%b-%y')(new Date(d))
      })
      chart.x2Axis.tickFormat(d => {
        return d3.time.format('%d-%b-%y')(new Date(d))
      })
      chart.yAxis
        .tickFormat(d => {
          return parseFloat(d.toFixed(1))
        })
        .axisLabel(this._getCurrentActivePerspective('perspective'))
        .axisLabelDistance(-10)
      chart.y2Axis.tickFormat(d3.format(''))
    } else if (selectedChart === 'Line Bar Combo') {
      // reAlign()
      chart.xAxis.tickFormat(d => {
        return d3.time.format('%d-%b-%y')(new Date(d))
      })
      chart.yAxis2.tickFormat(d => {
        return `${Math.floor(Math.abs(d) * 100)}%`
      })
      const data = JSON.parse(this.state.data)
      const newData = data
        .map(d => {
          d.type = 'line'
          d.yAxis = 1
          return d
        })
        .concat(
          this.props.positiveNegativeCounts
            ? this.props.positiveNegativeCounts.map(d => {
                const obj = Object.assign({}, d)
                obj.other = true
                return obj
              })
            : []
        )
      this.setState({
        activeChartName: selectedChart,
        currentChart: chart,
        data: JSON.stringify(newData),
      })
      return
    }
    this.setState({
      activeChartName: selectedChart,
      currentChart: chart,
      data: (() => {
        if (selectedChart !== 'Line Bar Combo') {
          return JSON.stringify(JSON.parse(this.state.data).filter(d => !d.other))
        } else {
          return this.state.data
        }
      })(),
    })
  }
  _handleChangePerspective(target: string, e: SyntheticEvent<HTMLSelectElement>) {
    const perspective = e.currentTarget.value
    const { context } = this.props
    const NewPerspective = _.mapObject(this.props[target], (value, key) => {
      if (perspective === key) {
        return (value = !value)
      }
    })
    this.props.changePerspective && this.props.changePerspective(NewPerspective, context, target)
  }
  _getCurrentActivePerspective(target: string) {
    let activePerspective = ''
    _.each(this.props[target], (v, k) => {
      if (v) activePerspective = k
    })
    return activePerspective
  }
  render() {
    const { height, width, lineBarComboActive } = this.props
    const perspectiveBtns = _.map(this.props.perspective, (value, perspective) => {
      return (
        <option key={perspective} value={perspective}>
          {perspective}
        </option>
      )
    })
    const subPerspectiveBtns = _.map(this.props.subPerspective, (value, perspective) => {
      return (
        <option key={perspective} value={perspective}>
          {perspective}
        </option>
      )
    })
    return (
      <div>
        <div className="chart-display-options">
          <label>View as:</label>
          <select className="select--condensed" value={this.state.activeChartName} onChange={this._changeChart}>
            {_.chain(this.state.chart)
              .keys()
              .map(chart => {
                if (chart === 'Line Bar Combo' && !lineBarComboActive) {
                  return ''
                }
                return (
                  <option key={chart} value={chart}>
                    {chart}
                  </option>
                )
              })
              .value()}
          </select>
          {this.props.perspectiveBtns && (
            <div className="brushchart-btns">
              <label>Count by:</label>
              <select
                className="select--condensed"
                value={this._getCurrentActivePerspective('perspective')}
                onChange={this._handleChangePerspective.bind(this, 'perspective')}
              >
                {perspectiveBtns}
              </select>
              {/* <label>Group by:</label>
              <select
                className='select--condensed'
                value={this._getCurrentActivePerspective('subPerspective')}
                onChange={this._handleChangePerspective.bind(this, 'subPerspective')}
              >
                <option value="allOff">none</option>
                {subPerspectiveBtns}
              </select> */}
            </div>
          )}
        </div>
        {_.chain(this.state.chart)
          .keys()
          .map(chart => {
            return (
              this.state.activeChartName === chart && (
                <div key={chart} className="chart-wrapper" id={`${this.name}-${chart.toLowerCase().replace(/ /g, '-')}`}>
                  <svg height={height} width={width} style={{ height: height }} />
                </div>
              )
            )
          })
          .value()}
      </div>
    )
  }
}
