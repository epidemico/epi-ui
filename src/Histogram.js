// @flow
import React, { PureComponent } from 'react'
import d3 from 'd3'
import { colors } from './themes'

type PropTypes = {
  bins: number,
  className: string,
  colors: Array<string>,
  data: Array<number>,
  fill: string,
  height: number,
  label: string,
  margins: Object,
  width: number,
}

export default class Histogram extends PureComponent<PropTypes> {
  static defaultProps = {
    className: 'histogram',
    colors,
    fill: '#2980b9',
    label: 'Count',
    height: 300,
    margins: { top: 20, right: 20, bottom: 40, left: 30 },
    width: 500,
  }

  statics = {} //just an object to store some static things for d3
  svg: any

  componentDidMount() {
    const { className, label, margins, width, height, colors } = this.props

    // A formatter for counts.
    this.statics.formatCount = d3.format(',.0f')

    //this.statics.color = d3.scale.category10()
    this.statics.color = d3.scale.ordinal().range(colors)
    this.statics.margin = margins

    this.statics.outerWidth = width // this should be dynamic based on container width
    this.statics.outerHeight = height

    this.statics.dimensions = {
      width: this.statics.outerWidth - this.statics.margin.left - this.statics.margin.right,
      height: this.statics.outerHeight - this.statics.margin.top - this.statics.margin.bottom,
    }

    this.statics.scales = {
      x: d3.scale
        .linear()
        .domain([0, 100])
        .range([0, this.statics.dimensions.width]),
      y: d3.scale.linear().range([this.statics.dimensions.height, 0]),
    }

    this.statics.axis = {
      xAxis: d3.svg
        .axis()
        .scale(this.statics.scales.x)
        .orient('bottom'),
      yAxis: d3.svg
        .axis()
        .scale(this.statics.scales.y)
        .orient('left'),
    }

    this.svg = d3
      .select(`.${className}`)
      .attr(
        'width',
        this.statics.dimensions.width + this.statics.margin.left + this.statics.margin.right
      )
      .attr(
        'height',
        this.statics.dimensions.height + this.statics.margin.top + this.statics.margin.bottom
      )
      .append('g')
      .attr(
        'transform',
        'translate(' + this.statics.margin.left + ',' + this.statics.margin.top + ')'
      )

    this.svg
      .append('g')
      .attr('class', className)
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.statics.dimensions.height + ')')
      .append('text')
      .attr('x', this.statics.dimensions.width - this.statics.margin.right)
      .attr('y', 30)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text(label)

    this.svg
      .append('g')
      .attr('class', 'y axis')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 9)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Frequency')

    this.renderVisuals()
  }

  componentDidUpdate() {
    this.renderVisuals()
  }

  renderVisuals() {
    const { className } = this.props

    // Update axis
    this.svg.select('.x.axis').call(this.statics.axis.xAxis)

    const histogramData = d3.layout.histogram().bins(this.statics.scales.x.ticks(this.props.bins))(
      this.props.data
    )

    this.statics.scales.y.domain([
      0,
      d3.max(histogramData, function(d) {
        return d.y
      }),
    ])
    this.svg
      .select('.y.axis')
      .transition()
      .duration(300)
      .call(this.statics.axis.yAxis)

    const bar = this.svg.selectAll('.bar').data(histogramData)

    bar
      .enter()
      .append('g')
      .attr('class', 'bar')

    bar.exit().remove()

    bar
      .transition()
      .duration(500)
      .attr('transform', d => {
        return 'translate(' + this.statics.scales.x(d.x) + ',' + this.statics.scales.y(d.y) + ')'
      })

    d3.selectAll('rect.rect').remove()

    bar
      .append('rect')
      .attr('class', 'rect')
      .attr('fill', this.props.fill)
      .style('opacity', 0.7)

    bar
      .selectAll('rect.rect')
      .attr('x', 1)
      .attr('width', this.statics.scales.x(histogramData[0].dx) - 1)
      .attr('height', d => {
        return this.statics.dimensions.height - this.statics.scales.y(d.y)
      })

    d3.selectAll('text.text').remove()

    bar
      .append('text')
      .attr('dy', '.75em')
      .attr('y', -12)
      .attr('class', 'text')
      .attr('text-anchor', 'middle')
    bar
      .selectAll('text.text')
      .attr('x', this.statics.scales.x(histogramData[0].dx) / 2)
      .text(d => {
        if (this.statics.formatCount(d.y) !== '0') {
          return this.statics.formatCount(d.y)
        }
      })
  }

  render() {
    const { className, label, data } = this.props
    return (
      <div>
        {data.length === 0 && <div className="no-data-msg">No data found</div>}
        <svg className={className} />
      </div>
    )
  }
}
