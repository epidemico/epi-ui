// @flow
import * as React from 'react'
import d3 from 'd3'
import _ from 'underscore'

type PropTypes = {
  data: Object,
  colors: Array<string>,
  handleCategoryChange: Function,
}

export default class GroupedBarchart extends React.PureComponent<PropTypes> {
  static defaultProps = {
    colors: ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'],
  }

  margin: Object
  width: number
  height: number

  x0: Function
  x1: Function
  y0: number
  y: Function
  color: Function
  xAxis: any
  yAxis: any
  svg: any

  componentDidMount() {
    this.margin = { top: 20, right: 100, bottom: 30, left: 40 }
    this.width = 960 - this.margin.left - this.margin.right
    this.height = 500 - this.margin.top - this.margin.bottom

    this.x0 = d3.scale.ordinal().rangeRoundBands([0, this.width], 0.1)

    this.x1 = d3.scale.ordinal()

    this.y = d3.scale.linear().range([this.height, 0])

    this.color = d3.scale.ordinal().range(this.props.colors)

    this.xAxis = d3.svg
      .axis()
      .scale(this.x0)
      .orient('bottom')
      .outerTickSize(0)
    this.yAxis = d3.svg
      .axis()
      .scale(this.y)
      .orient('left')
      .outerTickSize(0)

    this.svg = d3
      .select('.grouped-chart')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    this.svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.y(0) + ')')

    this.svg
      .append('g')
      .attr('class', 'y axis')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Sentiment')
  }

  componentDidUpdate() {
    // A temp solution to change the text of 'All Topics'
    this.svg.selectAll('text').forEach(text => {
      if (text && text.length > 0) {
        if (text[0].__data__ === 'All Topics') {
          text[0].classList.add('special-tick')
        }
      }
    })

    const component = this

    const legends = _.uniq(
      _.reduce(
        this.props.data,
        (acc, value, key) => {
          Object.keys(value).forEach(value => {
            acc.push(value)
          })
          return acc
        },
        []
      )
    )

    const data = _.reduce(
      this.props.data,
      (acc, value, key) => {
        acc.push({
          category: key,
          options: _.map(value, (value, key) => {
            return {
              name: key,
              value: parseFloat(value.sentiment ? value.sentiment.toFixed(2) : value.toFixed(2)),
              category: key,
            }
          }),
        })
        return acc
      },
      []
    )

    const values = _.flatten(
      _.reduce(
        data,
        (acc, datum) => {
          acc.push(
            _.map(datum.options, d => {
              return d.value
            })
          )
          return acc
        },
        []
      )
    )

    const minValue = _.min(values)
    const maxValue = _.max(values)

    // Update the domains
    this.x0.domain(
      data.map(function(d) {
        return d.category
      })
    )
    this.x1.domain(legends).rangeRoundBands([0, this.x0.rangeBand()])
    this.y0 = Math.max(Math.abs(minValue), Math.abs(maxValue))
    this.y.domain([-this.y0, this.y0])

    // Update the axis
    this.svg
      .select('g.x.axis')
      .transition()
      .duration(300)
      .call(this.xAxis)
    this.svg
      .select('g.y.axis')
      .transition()
      .duration(300)
      .call(this.yAxis)

    var category = this.svg.selectAll('g.category').data(data)

    category.exit().remove()

    category
      .enter()
      .append('g')
      .attr('class', 'category')
      .on('mouseover', function() {
        // set opacity of all siblings
        d3
          .selectAll('.category')
          .transition()
          .duration(300)
          .style('opacity', 0.2)
        // then, set the opacity of the current one
        d3
          .select(this)
          .transition()
          .duration(300)
          .style('opacity', 1)
      })
      .on('mouseout', function() {
        d3
          .selectAll('.category')
          .transition()
          .duration(300)
          .style('opacity', 1)
      })
      .on('click', function(d) {
        component.props.handleCategoryChange(d.category)
      })

    // UPDATE
    category
      .transition()
      .duration(300)
      .attr('transform', d => {
        return 'translate(' + this.x0(d.category) + ',0)'
      })

    var bars = category.selectAll('rect').data(function(d) {
      return d.options
    })

    bars.exit().remove()

    // ENTER the new data and set position
    bars
      .enter()
      .append('rect')
      .attr('width', this.x1.rangeBand())
      .attr('x', d => {
        return this.x1(d.name)
      })
      .attr('y', d => {
        return this.y(Math.max(0, d.value))
      })
      .attr('height', d => {
        return Math.abs(this.y(d.value) - this.y(0))
      })
      .style('fill', d => {
        return this.color(d.name)
      })

    // UPDATE all other bars position
    bars
      .transition()
      .duration(300)
      .attr('width', this.x1.rangeBand())
      .attr('x', d => {
        return this.x1(d.name)
      })
      .attr('y', d => {
        return this.y(Math.max(0, d.value))
      })
      .attr('height', d => {
        return Math.abs(this.y(d.value) - this.y(0))
      })
      .style('fill', d => {
        return this.color(d.name)
      })

    var legend = this.svg.selectAll('g.legend').data(legends.slice())

    var group = legend
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        return 'translate(0,' + i * 20 + ')'
      })

    legend
      .transition()
      .duration(300)
      .attr('transform', function(d, i) {
        return 'translate(0,' + i * 20 + ')'
      })

    group
      .append('rect')
      .attr('x', this.width)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', this.color)
    group
      .append('text')
      .attr('x', this.width + 19)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text(function(d) {
        return d
      })
    legend.exit().remove()
  }
  render() {
    return <svg className="grouped-chart" />
  }
}
