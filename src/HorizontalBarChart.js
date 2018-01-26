// @flow
import React, { PureComponent } from 'react'
import d3 from 'd3'
import { sortBy } from 'underscore'
import { colors } from './themes'

type PropTypes = {
  data: [Object],
  margin: Object,
  colors: Array<string>,
  onBarClick: Function,
}

export default class HorizontalBarChart extends PureComponent<PropTypes> {
  static defaultProps = {
    data: [],
    margin: { top: 20, right: 20, bottom: 30, left: 100 },
    onBarClick: () => {},
    colors,
  }

  svg: any
  chart: Function
  xscale: Function
  yscale: Function
  colorScale: Function
  xAxis: Function
  yAxis: Function
  x_xis: Function
  y_xis: Function

  componentDidMount() {
    const width = 960 - this.props.margin.left - this.props.margin.right
    const height = 500 - this.props.margin.top - this.props.margin.bottom

    this.svg = d3
      .select('.horizontalBarchart')
      .attr('width', width + this.props.margin.left + this.props.margin.right)
      .attr('height', height + this.props.margin.top + this.props.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.props.margin.left + ',' + this.props.margin.top + ')')

    this.xscale = d3.scale.linear().range([0, width])

    this.yscale = d3.scale.ordinal().rangeRoundBands([height, 0], 0.1)

    this.colorScale = d3.scale
      .quantize()
      .domain([0, this.props.data.length])
      .range(this.props.colors)

    this.xAxis = d3.svg
      .axis()
      .orient('bottom')
      .scale(this.xscale)
      .outerTickSize(0)
    // .tickValues(this.tickVals);

    this.yAxis = d3.svg.axis().outerTickSize(0)

    this.yAxis.orient('left').scale(this.yscale)

    this.y_xis = this.svg
      .append('g')
      // .attr('transform', 'translate('+height +',0)')
      .attr('class', 'y axis')

    this.x_xis = this.svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'x axis')

    this.chart = this.svg
      .append('g')
      .attr('transform', 'translate(' + this.props.margin.left + ',0)')
      .attr('id', 'bars')

    setTimeout(this.renderVisuals, 2000) // FIXME: Not sure why visuals only render when the svg is in the current viewport.
  }

  renderVisuals = () => {
    const { data } = this.props

    const sortedDataByVolume = sortBy(data, d => {
      return -d.value
    })
    const component = this

    const maxValue = d3.max(sortedDataByVolume, d => {
      return d.value
    })

    this.xscale.domain([0, maxValue]).nice()

    this.yscale.domain(
      sortedDataByVolume.map(d => {
        return d.name
      })
    )

    this.svg
      .selectAll('g.y.axis')
      .transition()
      .duration(300)
      .call(this.yAxis)

    this.svg
      .selectAll('g.x.axis')
      .transition()
      .duration(300)
      .call(this.xAxis)

    const bar = this.chart.selectAll('g.bar').data(sortedDataByVolume)

    bar.exit().remove()

    bar
      .enter()
      .append('g')
      .attr('class', 'bar')

    bar.selectAll('rect').remove()

    bar
      .append('rect')
      .attr('class', 'rect')
      .attr('height', this.yscale.rangeBand())
      .attr({
        x: -this.props.margin.left,
        y: (d, i) => {
          return this.yscale(d.name)
        },
      })
      .style('fill', 'rgba(52, 152, 219, 0.4)')
      .attr('width', d => {
        return this.xscale(d.value)
      })
      .on('click', function(d) {
        component.props.onBarClick(d)
      })

    bar.selectAll('text').remove()

    bar
      .append('text')
      .attr({
        x: d => {
          return -this.props.margin.left + this.xscale(d.value) + 8
        },
        y: (d, i) => {
          return this.yscale(d.name) + this.yscale.rangeBand() / 2
        },
      })
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .text(d => {
        return d.value
      })
      .style('fill', 'rgba(44, 62, 80, 0.8)')

    bar
      .transition()
      .duration(300)
      .attr({
        x: -this.props.margin.left,
        y: (d, i) => {
          return this.yscale(d.name)
        },
      }) // (d) is one item from the data array, x is the scale object from above
      .attr('width', d => {
        return this.xscale(d.value)
      }) // constant, so no callback function(d) here
      .attr('height', this.yscale.rangeBand())
  }

  render = () => <svg className="horizontalBarchart" />
}
