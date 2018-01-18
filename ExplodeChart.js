import React, { Component } from 'react'
import PropTypes from 'prop-types'
import d3 from 'd3'
import * as constants from './constants'
import { _, log } from '/imports/fui'

export default class ExplodeChart extends Component {
  componentDidMount() {
    const { className, width, height, colors, margins } = this.props
    this.statics = {} //just an object to store some static things for d3
    this.statics.outerWidth = width
    this.statics.outerHeight = height
    this.statics.margin = margins
    this.statics.margin2 = { top: 430, right: 10, bottom: 20, left: 40 }

    // initialize scales and dimensions
    this.statics.styles = {
      color: d3.scale.ordinal().range(colors),
    }

    this.statics.duration = 750

    // dimensions for the data elements on the graph - lines and areas, not axis or labels
    this.statics.dimensions = {
      width: this.statics.outerWidth - this.statics.margin.left - this.statics.margin.right,
      height: this.statics.outerHeight - this.statics.margin.top - this.statics.margin.bottom,
      height2: this.statics.outerHeight - this.statics.margin.top - this.statics.margin.bottom,
    }

    // outer dimeinsions of the entire chart including axis, labels and legend
    this.svg = d3
      .select(`.${className}`)
      .attr('width', this.statics.outerWidth)
      .attr('height', this.statics.outerHeight)

    // position the legend
    this.svg
      .append('g')
      .attr('class', 'legend')
      .attr('width', this.statics.dimensions.width)
      .attr('height', 30)
      .attr(
        'transform',
        'translate(' +
          this.statics.margin.left +
          ',' +
          (this.statics.dimensions.height + this.statics.margin.bottom - 10) +
          ')'
      )

    this.statics.scales = {
      x: d3.time.scale().range([0, this.statics.dimensions.width]),
      x2: d3.time.scale().range([0, this.statics.dimensions.width]),
      y: d3.scale.linear().range([this.statics.dimensions.height, 0]),
      y2: d3.scale.linear().range([this.statics.dimensions.height, 0]),
    }

    this.statics.stack = d3.layout.stack()

    // set up each axis - specific styles and positioning are further down
    this.statics.axis = {
      // month/day axis
      xAxis1: d3.svg
        .axis()
        .scale(this.statics.scales.x)
        .orient('bottom'),
      // year axis
      xAxis2: d3.svg
        .axis()
        .scale(this.statics.scales.x)
        .ticks(d3.time.years, 1)
        .outerTickSize(0)
        .tickFormat(d3.time.format('%Y'))
        .orient('bottom'),
      xAxis3: d3.svg
        .axis()
        .scale(this.statics.scales.x)
        .ticks(d3.time.years, 1)
        .outerTickSize(0)
        .tickFormat(d3.time.format('%Y'))
        .orient('bottom'),
      yAxis: d3.svg
        .axis()
        .scale(this.statics.scales.y)
        .ticks(10)
        .tickSize(-this.statics.dimensions.width)
        .orient('left'),
    }

    this.renderVisuals()
  }

  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data
  }

  componentDidUpdate() {
    this.renderVisuals()
  }

  getKeysFromData(data) {
    var results = {}
    var keys = Object.keys(_.groupBy(data, 'key'))
    keys.forEach(key => {
      results[key] = 1
    })
    return results
  }

  _handleChangePerspectice(perspective) {
    const { actions, context } = this.props
    const NewPerspective = _.mapObject(this.props.perspective, (value, key) => {
      if (perspective === key) {
        return (value = !value)
      } else {
        return (value = false)
      }
    })
    this.props.changePerspective(NewPerspective, context)
  }

  renderVisuals() {
    const { className, data } = this.props
    //To avoid losing the context
    var component = this

    function brushed() {
      component.statics.scales.x.domain(
        brush.empty() ? component.statics.scales.x2.domain() : brush.extent()
      )
      focus.select('.area').attr('d', area)
      focus.select('.x.axis').call(component.statics.axis.xAxis)
    }

    var brush = d3.svg
      .brush()
      .x(component.statics.scales.x2)
      .on('brush', brushed)

    // variables for the labels used below
    var xLabel = d3.select('#x-label')
    var yLabel = d3.select('#y-label')

    d3.selectAll('.' + className + '.y.axis text').attr('dx', -5)

    var context = this.svg
      .append('g')
      .attr('class', 'context')
      .attr(
        'transform',
        'translate(' + component.statics.margin2.left + ',' + component.statics.margin2.top + ')'
      )

    var area = d3.svg
      .area()
      .interpolate('basis')
      .x(function(d) {
        // log(d.datetime);
        // log(component.statics.scales.x(d.datetime))
        return component.statics.scales.x(d.datetime)
      })

    var area2 = d3.svg
      .area()
      .interpolate('basis')
      .x(function(d) {
        // log(d.datetime);
        // log(component.statics.scales.x(d.datetime))
        return component.statics.scales.x2(d.datetime)
      })

    var line = d3.svg
      .line()
      .interpolate('basis')
      .x(function(d) {
        return component.statics.scales.x(d.datetime)
      })

    component.statics.stack
      .values(function(d) {
        return d.values
      })
      .x(function(d) {
        return d.datetime
      })
      .y(function(d) {
        return d.records
      })
      .out(function(d, y0, y) {
        return (d.count0 = y0)
      })
      .order('reverse')

    var transitionTo = function(name) {
      if (name === 'stream') {
        streamgraph()
      }
      if (name === 'stack') {
        stackedAreas()
      }
      if (name === 'area') {
        return areas()
      }
    }

    var start = function() {
      if (!data) return
      var dates, g, index, maxDate, minDate, requests
      minDate = d3.min(data, function(d) {
        return d3.min(d.values, function(value) {
          return value.datetime
        })
      })
      maxDate = d3.max(data, function(d) {
        return d3.max(d.values, function(value) {
          return value.datetime
        })
      })
      var recordsCount = d3.range(
        d3.max(data, function(d) {
          return d.maxCount
        })
      )

      var recordsCountMax = d3.max(data, function(d) {
        return d.maxCount
      })

      var recordsCountMin

      data.forEach(function(s) {
        recordsCountMin = d3.min(s.values, function(d) {
          return d.records
        })
      })

      component.statics.scales.x.domain([minDate, maxDate])
      component.statics.scales.y.domain([recordsCountMin, recordsCountMax]).nice()
      if (data.length) {
        dates = data[0].values.map(function(v) {
          var yaxisText = data[0].benchmark_name
          return v.datetime
        })
        index = 0
        dates = dates.filter(function(d) {
          index += 1
          return index % 2 === 0
        })
      }

      component.svg
        .select('.x.axis1')
        .transition()
        .duration(750)
        .attr(
          'transform',
          'translate(' +
            component.statics.margin.left +
            ',' +
            (component.statics.dimensions.height + component.statics.margin.top) +
            ')'
        )
        .call(component.statics.axis.xAxis1)
        .selectAll('.x .tick text') // stack the month and day on top of eachother
        .call(function(t) {
          t.each(function(d) {
            var self = d3.select(this)
            var s = self.text().split(' ')
            self.text(null)
            self
              .append('tspan')
              .attr('x', 0)
              .attr('dy', '.8em')
              .text(s[0])
            self
              .append('tspan')
              .attr('x', 0)
              .attr('dy', '1.2em')
              .text(s[1])
          })
        })

      component.svg
        .select('.x.axis2')
        .transition()
        .duration(750)
        .attr(
          'transform',
          'translate(' +
            component.statics.margin.left +
            ',' +
            (component.statics.dimensions.height + component.statics.margin.top + 35) +
            ')'
        )
        .call(component.statics.axis.xAxis2)

      component.svg
        .select('.y.axis')
        .transition()
        .attr(
          'transform',
          'translate(' + component.statics.margin.left + ',' + component.statics.margin.top + ')'
        )
        .duration(750)
        .call(component.statics.axis.yAxis)

      xLabel
        .selectAll('#x-label-text')
        .attr('text-anchor', 'center')
        .attr('class', 'axis-label')
        .attr('x', component.statics.dimensions.width / 2)
        .attr('y', component.statics.dimensions.height + component.statics.margin.bottom - 10)
        //.text("Admission Date");
        .text('')

      yLabel
        .selectAll('#y-label-text')
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', component.statics.dimensions.width / 2)
        .attr('x', 0 - component.statics.dimensions.height / 2)
        .attr('dy', '1.3em')
        .text('')
      //.text("");
      var context = component.svg.selectAll('.area').data(data)
      var groupContext = context.enter()
      area.y0(component.statics.dimensions.height / 2).y1(component.statics.dimensions.height / 2)
      var group = component.svg.selectAll('.request').data(data)
      group.exit().remove()
      var groupData = group.enter()
      requests = groupData
        .append('g')
        .attr('class', 'request')
        .attr('width', component.statics.dimensions.width)
        .attr('height', component.statics.dimensions.height)
        .attr(
          'transform',
          'translate(' + component.statics.margin.left + ',' + component.statics.margin.top + ')'
        )
      requests
        .append('path')
        .attr('class', 'area')
        .style('fill', function(d) {
          return component.statics.styles.color(d.key)
        })
        .attr('d', function(d) {
          return area(d.values)
        })
      requests
        .append('path')
        .attr('class', 'line')
        .style({
          'stroke-opacity': '1e-6',
          fill: 'none',
          stroke: '#fff',
          'stroke-width': '1px',
        })
      createLegend()
      if (component.props.defaultControl === 'area') {
        return areas()
      } else if (component.props.defaultControl === 'stacked') {
        return stackedAreas()
      }
    }

    var streamgraph = function() {
      var t
      component.statics.stack.offset('wiggle')
      component.statics.stack(data)
      component.statics.scales.y
        .domain([
          0,
          d3.max(
            data[0].values.map(function(d) {
              return d.count0 + d.records
            })
          ),
        ])
        .range([component.statics.dimensions.height, 0])
      line.y(function(d) {
        return component.statics.scales.y(d.count0)
      })
      area
        .y0(function(d) {
          return component.statics.scales.y(d.count0)
        })
        .y1(function(d) {
          return component.statics.scales.y(d.count0 + d.records)
        })
      t = component.svg
        .selectAll('.request')
        .transition()
        .duration(component.statics.duration)
      t
        .select('path.area')
        .style('fill-opacity', 1.0)
        .attr('d', function(d) {
          return area(d.values)
        })
      return t
        .select('path.line')
        .style('stroke-opacity', 1e-6)
        .attr('d', function(d) {
          return line(d.values)
        })
    }

    var stackedAreas = function() {
      var t
      component.statics.stack.offset('zero')
      component.statics.stack(data)
      component.statics.scales.y
        .domain([
          0,
          d3.max(
            data[0].values.map(function(d) {
              return d.count0 + d.records
            })
          ),
        ])
        .range([component.statics.dimensions.height, 0])
      line.y(function(d) {
        return component.statics.scales.y(d.count0)
      })
      area
        .y0(function(d) {
          return component.statics.scales.y(d.count0)
        })
        .y1(function(d) {
          return component.statics.scales.y(d.count0 + d.records)
        })
      t = component.svg
        .selectAll('.request')
        .transition()
        .duration(component.statics.duration)
      t
        .select('path.area')
        .style('fill-opacity', 1.0)
        .attr('d', function(d) {
          return area(d.values)
        })
      return t
        .select('path.line')
        .style('stroke-opacity', 1e-6)
        .attr('d', function(d) {
          return line(d.values)
        })
    }

    var areas = function() {
      var g, t
      component.statics.stack(data)
      g = component.svg.selectAll('.request')
      line.y(function(d) {
        return component.statics.scales.y(d.count0 + d.records)
      })
      g
        .select('path.line')
        .attr('d', function(d) {
          return line(d.values)
        })
        .style('stroke-opacity', 1e-6)
      component.statics.scales.y
        .domain([
          0,
          d3.max(
            data.map(function(d) {
              return d.maxCount
            })
          ),
        ])
        .range([component.statics.dimensions.height, 0])
      area.y0(component.statics.dimensions.height).y1(function(d) {
        return component.statics.scales.y(d.records)
      })
      line.y(function(d) {
        return component.statics.scales.y(d.records)
      })
      t = g.transition().duration(component.statics.duration)
      t
        .select('path.area')
        .style('fill-opacity', 0.5)
        .attr('d', function(d) {
          return area(d.values)
        })
      return t
        .select('path.line')
        .style('stroke-opacity', 1)
        .attr('color', 'black')
        .attr('d', function(d) {
          return line(d.values)
        })
    }

    var createLegend = function() {
      var legends = component.svg.select('g.legend')

      var SortedData = _.sortBy(data, function(datum) {
        return datum.level
      })

      var keysGroup = legends.selectAll('rect').data(SortedData)

      var keySize = 20
      var keys = keysGroup
        .enter()
        .append('rect')
        .attr('width', keySize)
        .attr('height', keySize)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', function(d) {
          return component.statics.styles.color(d.key)
        })
        .attr('opacity', 0.6)
        .attr('transform', function(d, i) {
          return 'translate(' + 70 * (i + 0) + ',0)'
        })

      keysGroup.exit().remove()

      var labelText = legends.selectAll('text').data(SortedData)
      labelText.enter().append('text')

      labelText.exit().remove()

      labelText
        .attr('transform', function(d, i) {
          return 'translate(' + (70 * (i + 0) + (keySize + 7)) + ',' + (keySize / 2 + 5) + ')'
        })
        .text(function(d) {
          return d.key
        })
    }

    var display = function(rawData = []) {
      var filterer, parseTime, filteredData
      var keys = component.getKeysFromData(rawData)
      filterer = keys
      filteredData = rawData.filter(function(d) {
        return filterer[d.key] === 1
      })
      //parseTime = d3.time.format.utc("%x").parse;
      filteredData.forEach(function(s) {
        s.values.forEach(function(d) {
          d.datetime = new Date(d.datetime)
          return (d.records = parseFloat(d.records))
        })
        return (s.maxCount = d3.max(s.values, function(d) {
          return d.records
        }))
      })
      filteredData.sort(function(a, b) {
        return b.maxCount - a.maxCount
      })
      return start()
    }

    display(data)

    var addListerers = function() {
      d3.selectAll('.switch').on('click', function(d) {
        var id
        d3.event.preventDefault()
        id = d3.select(this).attr('id')
        d3.selectAll('.switch').classed({ active: false })
        d3.select(this).attr('className', 'btn btn-primary switch active')
        return transitionTo(id)
      })
    }
    addListerers()
  }

  render() {
    const { data, className, viewBox, control } = this.props

    var controlBtns
    if (control === 'stacked') {
      controlBtns = (
        <button type="button" id="stack" className="btn btn-primary switch">
          Stacked
        </button>
      )
    } else if (control === 'area') {
      controlBtns = (
        <button type="button" id="area" className="btn btn-primary switch">
          Area
        </button>
      )
    } else {
      controlBtns = (
        <div>
          <button type="button" id="stack" className="btn btn-primary switch">
            Stacked
          </button>
          <button type="button" id="area" className="btn btn-primary switch">
            Area
          </button>
        </div>
      )
    }

    const perspectiveBtns = _.map(this.props.perspective, (value, perspective) => {
      return (
        <button
          className={
            this.props.perspective[perspective] ? 'btn btn-default active' : 'btn btn-default'
          }
          onClick={this._handleChangePerspectice.bind(this, perspective)}
        >
          {perspective}
        </button>
      )
    })

    return (
      <div id="main" role="main">
        <div>
          <div className="chart-option-group">
            <div className="perspectiveBtns">{perspectiveBtns}</div>
            {controlBtns}
          </div>
        </div>
        <svg className={className} viewBox={viewBox}>
          <g className="y axis"> </g>
          <svg id="y-label">
            <text id="y-label-text" />
          </svg>
          <g className="x axis axis1"> </g>
          <svg id="x-label">
            <text id="x-label-text" />
          </svg>
          <g className="x axis axis2"> </g>
        </svg>
      </div>
    )
  }
}

ExplodeChart.defaultProps = {
  colors: constants.colors,
  margins: { top: 10, right: 0, bottom: 95, left: 45 },
  width: 1200,
  height: 400,
  viewBox: '0 0 1260 400',
  control: 'both',
  defaultControl: 'area',
  className: 'explode-chart',
}

ExplodeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  className: PropTypes.string,
  colors: PropTypes.array,
  margins: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  viewBox: PropTypes.string,
  control: PropTypes.string,
  defaultControl: PropTypes.string,
}
