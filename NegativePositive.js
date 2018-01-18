// @flow
import React, { Component } from 'react'
import d3 from 'd3'
import _ from 'underscore'

type PropTypes = {
  data: Array<Object>,
  onHover: Function,
}
type StateTypes = {
  data: Array<Object>,
}

export default class NegativePositive extends Component<PropTypes, StateTypes> {
  state = {
    data: [],
  }

  margin: Object
  width: number
  height: number
  x: Function
  y: Function
  xAxis: Function
  yAxis: Function
  originalSVG: Function
  svg: Function
  externalXAxis: Function
  svg: Function

  componentDidMount() {
    this.margin = { top: 20, right: 30, bottom: 0, left: 100 }
    this.width = 500 - this.margin.left - this.margin.right
    this.height = 500 - this.margin.top - this.margin.bottom

    this.x = d3.scale.linear().range([0, this.width])

    this.y = d3.scale.ordinal().rangeRoundBands([0, this.height], 0.1)

    this.xAxis = d3.svg
      .axis()
      .scale(this.x)
      .orient('bottom')

    this.yAxis = d3.svg
      .axis()
      .scale(this.y)
      .orient('left')
      .tickSize(0)
      .tickPadding(6)

    this.originalSVG = d3
      .select('.positive-negative-chart')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)

    this.svg = this.originalSVG
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    this.externalXAxis = d3
      .select('#xaxis')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', 30)
      .append('g')
      .attr('transform', 'translate(60,0)')
      .attr('transform', 'translate(0,0)')
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + 0 + ')')

    this.svg
      .append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + this.x(0) + ', -6)')

    if (this.state.data) {
      this.renderVisuals()
    }
  }

  componentWillReceiveProps(nextProps: PropTypes) {
    if (JSON.stringify(this.state.data) !== JSON.stringify(nextProps.data)) {
      this.setState({
        data: _.sortBy(nextProps.data, d => -d.value),
      })
    }
  }

  componentDidUpdate() {
    if (this.state.data) {
      this.renderVisuals()
    }
  }

  renderVisuals() {
    const newHeight = this.height + this.state.data.length * 20
    this.originalSVG
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', newHeight + this.margin.top + this.margin.bottom)

    this.y = d3.scale.ordinal().rangeRoundBands([0, newHeight], 0.1)

    const truncate = d => {
      if (d.length > 15) {
        return d.substring(0, 10) + '..'
      }
      return d
    }

    this.yAxis = d3.svg
      .axis()
      .scale(this.y)
      .orient('left')
      .tickSize(0)
      .tickFormat(truncate)
      .tickPadding(6)

    const _positive = d => {
      return d.value > 0
    }
    const _negative = d => {
      return d.value < 0
    }

    if (
      this.state.data.length > 1 &&
      _.some(this.state.data, d => {
        return _positive(d)
      }) &&
      !_.every(this.state.data, d => {
        return _positive(d)
      })
    ) {
      this.x.domain(
        d3.extent(this.state.data, d => {
          return d.value
        })
      )
      // this.x.domain([0, _.max(this.state.data, (d) => { return d.value }).value])
      // [_.min(this.state.data, (d) => { return d.value }).value, 0]
    } else if (
      this.state.data.length > 1 &&
      _.every(this.state.data, d => {
        return _positive(d)
      })
    ) {
      this.x.domain([
        0,
        _.max(this.state.data, d => {
          return d.value
        }).value,
      ])
    } else if (
      this.state.data.length > 1 &&
      _.every(this.state.data, d => {
        return _negative(d)
      })
    ) {
      this.x.domain([
        _.min(this.state.data, d => {
          return d.value
        }).value,
        0,
      ])
    } else if (this.state.data.length === 1) {
      // Find the value
      const value = d3.extent(this.state.data, d => {
        return d.value
      })[0]
      if (value > 0) {
        this.x.domain([0, value])
      } else {
        this.x.domain([value, 0])
      }
    }
    // this.x.domain([-3, 3]).nice()
    this.y.domain(
      this.state.data.map(d => {
        return d.name
      })
    )

    const bars = this.svg.selectAll('.bar').data(this.state.data)

    bars.exit().remove()

    bars
      .enter()
      .append('rect')
      .attr('class', d => {
        return 'bar bar--' + (d.value < 0 ? 'negative' : 'positive')
      })
      .attr('x', d => {
        return this.x(Math.min(0, d.value))
      })
      .attr('y', d => {
        return this.y(d.name)
      })
      .attr('width', d => {
        return Math.abs(this.x(d.value) - this.x(0))
      })
      .attr('height', this.y.rangeBand())
      .on('mouseover', d => {
        this.props.onHover(d)
        this.svg
          .selectAll('text.text')
          .transition()
          .duration(500)
          .style('opacity', 1)
      })
      .on('mouseout', () => {
        this.svg
          .selectAll('text.text')
          .transition()
          .duration(500)
          .style('opacity', 0)
        // setTimeout(() => {
        //   this.props.onHoverOut()
        // }, 1000)
      })

    // UPDATE
    bars
      .transition()
      .duration(300)
      .attr('class', d => {
        return 'bar bar--' + (d.value < 0 ? 'negative' : 'positive')
      })
      .attr('x', d => {
        return this.x(Math.min(0, d.value))
      })
      .attr('y', d => {
        return this.y(d.name)
      })
      .attr('width', d => {
        return Math.abs(this.x(d.value) - this.x(0))
      })
      .attr('height', this.y.rangeBand())

    // Add test next to the bars
    const text = this.svg.selectAll('text.text').data(this.state.data)

    text.exit().remove()

    text
      .enter()
      .append('text')
      .attr('class', 'text')
      .attr('x', d => {
        return Math.abs(this.x(d.value) - this.x(0)) + this.x(Math.min(0, d.value))
      })
      .attr('y', d => {
        return this.y(d.name) + 18
      })
      .text(d => {
        return d.value
      })
      .style('opacity', 0)

    // UPDATE
    text
      .transition()
      .duration(300)
      .attr('x', d => {
        return Math.abs(this.x(d.value) - this.x(0)) + this.x(Math.min(0, d.value))
      })
      .attr('y', d => {
        return this.y(d.name) + 18
      })
      .text(d => {
        return d.value
      })
      .style('opacity', 0)

    this.externalXAxis.call(this.xAxis)
    this.svg
      .select('g.y.axis')
      .attr('transform', 'translate(' + this.x(0) + ', -6)')
      .call(this.yAxis)
  }
  render() {
    return (
      <div id="wrapper-chart">
        <p className="info-text">
          Sentiment Chart <small>(hover for breakdown and scroll to see more.)</small>
        </p>
        <div className="div-chart">
          <svg className="positive-negative-chart" />
        </div>
        <div id="xaxis" />
      </div>
    )
  }
}
