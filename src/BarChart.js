// @flow
import * as React from 'react'
import _ from 'underscore'
import d3 from 'd3'
import Sugar from 'sugar'

import styles from './styles/BarChart.css'

const colors = [
  '#32abe3',
  '#e67e22',
  '#73bf67',
  '#fc5454',
  '#b26fd4',
  '#937443',
  '#eb95da',
  '#8a8989',
  '#66cdcc',
  '#2c3e50',
]

type PropTypes = {
  data: Array<Object>,
  className: string,
  colors: Array<string>,
  margins: Object,
  width: number,
  height: number,
}

type StateTypes = {
  data: Array<Object>,
  keys: Object,
}

export default class BarChart extends React.Component<PropTypes, StateTypes> {
  static defaultProps = {
    colors,
    className: 'bar-chart',
    height: 450,
    width: 450,
    margins: {
      top: 30,
      right: 30,
      bottom: 100,
      left: 60,
    },
  }

  statics = {} // Just an object to store some static things for d3
  svg: Object

  constructor(props: PropTypes) {
    super()
    this.state = {
      data: props.data || [],
      keys: this.getKeysFromData(props.data || []),
    }
  }

  componentDidMount() {
    const { className, margins, width, height, colors } = this.props

    // initialize scales and dimensions this.statics.color = d3.scale.category10()
    this.statics.color = d3.scale.ordinal().range(colors)
    this.statics.margin = margins

    this.statics.outerWidth = width // we should be dynamically getting this
    this.statics.outerHeight = height

    this.statics.dimensions = {
      width: this.statics.outerWidth - this.statics.margin.left - this.statics.margin.right,
      height: this.statics.outerHeight - this.statics.margin.top - this.statics.margin.bottom,
    }

    this.statics.scales = {
      x: d3.scale.ordinal().rangeRoundBands([0, this.statics.dimensions.width], 0.1),
      y: d3.scale.linear().range([this.statics.dimensions.height, 0]),
    }

    this.statics.axis = {
      xAxis: d3.svg
        .axis()
        .scale(this.statics.scales.x)
        .tickFormat(this._shortenString)
        .orient('bottom'),
      yAxis: d3.svg
        .axis()
        .scale(this.statics.scales.y)
        .tickFormat(this._formatNumber)
        .orient('left'),
    }

    d3
      .select('.' + className)
      .append('g')
      .attr('class', className + '-group')
      .append('g')
      .attr('class', 'x axis')

    d3
      .select('.' + className + '-group')
      .append('g')
      .attr('class', 'y axis')

    d3
      .select('.' + className)
      .attr('width', this.statics.outerWidth)
      .attr('height', this.statics.outerHeight)

    this.svg = d3
      .select('.' + className + '-group')
      .attr(
        'transform',
        'translate(' + this.statics.margin.left + ',' + this.statics.margin.top + ')'
      )

    this.svg
      .select('.x.axis')
      .attr('transform', 'translate(' + 0 + ',' + this.statics.dimensions.height + ')')

    this.svg.select('.y.axis').attr('transform', 'translate(' + 0 + ',' + 0 + ')')

    this.renderVisuals()
  }

  componentWillReceiveProps(nextProps: PropTypes) {
    this.setState({
      data: nextProps.data,
      keys: this.getKeysFromData(nextProps.data),
    })
  }

  shouldComponentUpdate(nextProps: PropTypes) {
    return JSON.stringify(this.state.data) !== JSON.stringify(nextProps.data)
  }

  componentDidUpdate() {
    this.renderVisuals()
  }

  // Function to generate keys out of the data
  getKeysFromData(data: Array<Object>) {
    const results = {}
    if (data.length > 0) {
      for (const key in data[0]) {
        if (!isNaN(data[0][key])) {
          results.value = key
        } else if (typeof data[0][key] === 'string') {
          results.label = key
        }
      }
    }
    return results
  }

  _shortenString(string: string) {
    const str = new Sugar.String(string)
    return str.truncate(10)
  }

  _formatNumber(number: number) {
    if (isNaN(number)) return 0
    const sugaredNumber = new Sugar.Number(number)
    return sugaredNumber.abbr(1)
  }

  renderVisuals() {
    const { className } = this.props
    // measure the domain (for x, unique letters) (for y [0,maxFrequency]) now the
    // scales are finished and usable
    this.statics.scales.x.domain(
      this.state.data.map(d => {
        return d[this.state.keys.label]
      })
    )

    let MinOrMax // One number. Can be the min or max depends on sentiment

    if (this.props.sentimentIsOn) {
      MinOrMax = d3.min(
        _.map(this.state.data, d => {
          return d.percentage
        })
      )
    } else {
      MinOrMax = d3.max(
        _.map(this.state.data, d => {
          return d.percentage
        })
      )
    }

    this.statics.scales.y.domain([0, MinOrMax]).nice()

    // another g element, this time to move the origin to the bottom of the svg
    // element someSelection.call(thing) is roughly equivalent to
    // thing(someSelection[i])   for everything in the selection\
    // the end
    // result is g populated with text and lines!
    this.svg
      .select('.x.axis')
      .transition()
      .duration(300)
      .call(this.statics.axis.xAxis)
      .selectAll('text')
      .attr('y', 0)
      .attr('x', -10)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(-40)')
      .style('text-anchor', 'end')

    // same for yAxis but with more transform and a title
    this.svg
      .select('.y.axis')
      .transition()
      .duration(300)
      .call(this.statics.axis.yAxis)

    // THIS IS THE ACTUAL WORK!
    const bars = this.svg.selectAll('.bar').data(this.state.data, d => {
      return d[this.state.keys.label]
    }) // (data) is an array/iterable thing, second argument is an ID generator function

    bars
      .exit()
      .transition()
      .duration(300)
      .attr('y', this.statics.scales.y(0))
      .attr('height', this.statics.dimensions.height - this.statics.scales.y(0))
    // .style('fill-opacity', 1e-6).remove() data that needs DOM = enter() (a
    // set/selection, not an event!)
    bars
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', this.statics.scales.y(0))
      .attr('height', this.statics.dimensions.height - this.statics.scales.y(0))
      .attr('fill', d => {
        return this.statics.color(d[this.state.keys.label])
      })
      .attr('opacity', 0.5)

    // the 'UPDATE' set:
    bars
      .transition()
      .duration(300)
      .attr('x', d => {
        return this.statics.scales.x(d[this.state.keys.label])
      }) // (d) is one item from the data array, x is the scale object from above
      .attr('width', this.statics.scales.x.rangeBand())
      .attr('y', d => {
        return this.statics.scales.y(d[this.state.keys.value])
      })
      .attr('height', d => {
        return this.statics.dimensions.height - this.statics.scales.y(d[this.state.keys.value])
      }) // flip the height, because y's domain is bottom up, but SVG renders top down
    // Add text to bars
    const labels = this.svg.selectAll('text.' + className + '_text').data(this.state.data, d => {
      return d[this.state.keys.label]
    })
    labels.exit().remove()
    labels
      .enter()
      .append('text')
      .attr('class', className + '_text')
      .attr('fill', 'rgba(44, 62, 80,1.0)')
      .attr('text-anchor', 'middle')
      .attr('y', d => {
        return this.statics.scales.y(d[this.state.keys.value])
      })
      .attr('x', d => {
        return (
          this.statics.scales.x(d[this.state.keys.label]) + this.statics.scales.x.rangeBand() / 2
        )
      })
      .text(d => {
        return this._formatNumber(d[this.state.keys.value])
      })

    labels
      .transition()
      .duration(300)
      .attr('fill', 'rgba(44, 62, 80,1.0)')
      .attr('text-anchor', 'middle')
      .attr('y', d => {
        return this.statics.scales.y(d[this.state.keys.value])
      })
      .attr('x', d => {
        return (
          this.statics.scales.x(d[this.state.keys.label]) + this.statics.scales.x.rangeBand() / 2
        )
      })
      .text(d => {
        return this._formatNumber(d[this.state.keys.value])
      })
  }

  render() {
    const { className } = this.props
    return (
      <div>
        <p className="data-sentence">Volume of records by topic</p>
        <svg className={className} />
      </div>
    )
  }
}
