// @flow
import React, { Component } from 'react'
import d3 from 'd3'

type PropTypes = {
  className: string,
  data: Array<Object>,
  handlePerspectiveChange: Function,
  handlePointClick: Function,
  height: number,
  keySize: number,
  options: Array<string>,
  padding: number,
  perspective: Array<Object>,
  textOptions: boolean,
  width: number,
}

type StateTypes = {
  data: Array<Object>,
}

export default class ScatterPlot extends Component<PropTypes, StateTypes> {
  static defaultProps = {
    className: 'scatter-plot',
    height: 500,
    keySize: 20, // for chart legends
    padding: 60, // for chart edges
    width: 800,
  }

  state = {
    data: [],
  }

  color: Function
  legendsGroup: Function
  svg: Function
  tooltip: Function
  xAxis: Function
  xScale: Function
  yAxis: Function
  yScale: Function

  componentDidMount() {
    const { className, width, height, padding, keySize } = this.props

    // Create scale functions
    this.xScale = d3.scale
      .linear() // xScale is width of graphic
      .range([this.props.padding, this.props.width - this.props.padding]) // output range

    this.yScale = d3.scale
      .linear() // yScale is height of graphic
      .range([this.props.height - this.props.padding, this.props.padding]) // remember y starts on top going down so we flip

    // Define X axis
    this.xAxis = d3.svg
      .axis()
      .scale(this.xScale)
      .orient('bottom')
      .ticks(5)

    // Define Y axis
    this.yAxis = d3.svg
      .axis()
      .scale(this.yScale)
      .orient('left')
      .ticks(5)

    // Create SVG element
    this.svg = d3
      .select('.' + className) // This is where we put our vis
      .attr('width', this.props.width)
      .attr('height', this.props.height)
    // .attr('fill', 'none')
    // .attr('z-index', 1000000)

    // The gradient
    this.svg
      .append('linearGradient')
      .attr('id', 'scatter-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '32.5%')
      .attr('y1', 0)
      .attr('x2', '67.5%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0', color: '#dcefd9' },
        { offset: '50%', color: '#dcefd9' },
        { offset: '50%', color: '#f9d9d0' },
        { offset: '100%', color: '#f9d9d0' },
      ])
      .enter()
      .append('stop')
      .attr('offset', function(d) {
        return d.offset
      })
      .attr('stop-color', function(d) {
        return d.color
      })

    this.svg
      .append('rect')
      .attr('id', 'gradient-background')
      .attr('x', 60)
      .attr('y', 60)
      .attr('width', this.props.width - this.props.padding - 60)
      .attr('height', 380)

    // The diagonal line
    this.svg
      .append('line') // attach a line
      .style('stroke', 'black')
      .style('stroke-width', '2px')
      .style('stroke-dasharray', '3, 3') // colour the line
      .attr('x1', this.props.width - this.props.padding) // x position of the first end of the line
      .attr('y1', this.props.padding) // y position of the first end of the line
      .attr('x2', this.props.padding) // x position of the second end of the line
      .attr('y2', this.props.height - this.props.padding)

    //  horizontal line
    this.svg
      .append('line') // attach a line
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3, 3') // colour the line
      .attr('x1', this.props.width - this.props.padding) // x position of the first end of the line
      .attr('y1', this.props.height / 2) // y position of the first end of the line
      .attr('x2', this.props.padding) // x position of the second end of the line
      .attr('y2', this.props.height / 2)

    //  vertical line
    this.svg
      .append('line') // attach a line
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3, 3') // colour the line
      .attr('x1', this.props.width / 2) // x position of the first end of the line
      .attr('y1', this.props.padding) // y position of the first end of the line
      .attr('x2', this.props.width / 2) // x position of the second end of the line
      .attr('y2', this.props.height - this.props.padding)

    this.svg
      .append('g')
      .attr('class', 'scatter-legend')
      .attr('width', 100)
      .attr('height', 100)

    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip scatter-tooltip')
      .style('opacity', 0)
    this.color = d3.scale.category10()
    // Create Circles

    // Add to X axis
    this.svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (this.props.height - this.props.padding) + ')')
      .call(this.xAxis)

    // Add to Y axis
    this.svg
      .append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + this.props.padding + ',0)')
      .call(this.yAxis)

    // Add legends
    this.legendsGroup = d3.select('g.scatter-legend')

    this.legendsGroup.attr(
      'transform',
      'translate(' + this.props.padding + ',' + (this.props.height - this.props.padding + 30) + ')'
    )

    // this.keysGroup = this.legendsGroup.selectAll('rect').data(this.state.data);
    // let keys = this.keysGroup.enter().append('rect').attr('width', keySize).attr('height', keySize).attr('rx', 2).attr('ry', 2).attr('fill', function(d, i) {
    //   return color(i);
    // }).attr('stroke', 'black').attr('stroke-width', 1).attr('opacity', 1).attr('transform', function(d, i) {
    //   return 'translate(' + (170 * (i + 0)) + ',0)';
    // });
    //
    // this.keysGroup.exit().remove();
    //
    // this.labelText = this.legendsGroup.selectAll('text').data(this.state.data);
    // this.labelText.enter().append('text');
    //
    // this.labelText.exit().remove();
    //
    // this.labelText.attr('transform', function(d, i) {
    //   return 'translate(' + ((170 * (i + 0)) + (keySize + 7)) + ',' + (keySize / 2 + 5) + ')';
    // }).text(function(d) {
    //   return Object.keys(d)[0];
    // });
    //
    this.svg
      .select('.y.axis')
      .append('text')
      .attr('class', 'label2')
      .attr('fill', '#414241')
      .attr('text-anchor', 'end')
      .attr('x', -this.props.padding)
      .attr('y', 10)
      .attr('dy', '.75em')
      .attr('transform', 'rotate(-90)')

    this.svg
      .select('.x.axis')
      .append('text')
      .attr('class', 'label1')
      .attr('fill', '#414241')
      .attr('text-anchor', 'end')
      .attr('x', this.props.width - 50)
      .attr('y', -10)
  }

  componentWillReceiveProps(nextProps: PropTypes) {
    if (JSON.stringify(nextProps.data) !== JSON.stringify(this.state.data)) {
      this.setState({
        data: nextProps.data,
      })
    }
  }

  componentDidUpdate() {
    this.renderVisuals()
  }

  renderVisuals() {
    const { width, height, padding, keySize } = this.props

    let xScaleMax = d3.max(this.state.data, function(d) {
      for (let key in d) {
        let firstValue = Object.keys(d[key])[0]
        return d[key][firstValue]
      }
    })

    let xScaleMin = d3.min(this.state.data, function(d) {
      for (let key in d) {
        let firstValue = Object.keys(d[key])[0]
        return d[key][firstValue]
      }
    })

    let yScaleMax = d3.max(this.state.data, function(d) {
      for (let key in d) {
        let secondValue = Object.keys(d[key])[1]
        return d[key][secondValue]
      }
    })

    let yScaleMin = d3.min(this.state.data, function(d) {
      for (let key in d) {
        let secondValue = Object.keys(d[key])[1]
        return d[key][secondValue]
      }
    })

    // Update scale domains
    this.xScale.domain([xScaleMin - 0.1, xScaleMax + 0.1])
    this.yScale.domain([yScaleMin - 0.1, yScaleMax + 0.1])
    let component = this

    let circles = this.svg.selectAll('circle').data(this.state.data)

    // Add circle svg
    circles
      .enter()
      .append('circle')
      .attr('opacity', 1)
      .style('stroke', 'black')
      .style('stroke-width', 1)
      .on('mouseover', function(d) {
        d3
          .select(this)
          .transition()
          .duration(100)
          .attr('r', 15)
        component.tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9)

        let firstValue
        let firstKey = ''
        let topic = ''
        for (let key in d) {
          firstValue = Object.keys(d[key])[0]
          firstKey = d[key][firstValue]
        }
        let secondValue
        let secondKey = ''
        for (let key in d) {
          topic = key
          secondValue = Object.keys(d[key])[1]
          secondKey = d[key][secondValue]
        }

        const text = '<div><p>' + topic + '</p><p>' + secondKey + ', ' + firstKey + '</p></div>'
        component.tooltip
          .html(text)
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
      }) // radius
      .on('mouseout', function(d) {
        d3
          .select(this)
          .transition()
          .duration(100)
          .attr('r', 8)
        component.tooltip
          .transition()
          .duration(200)
          .style('opacity', 0)
      })
      .on('click', function(d) {
        component.props.handlePointClick(d)
      })
    // Update with new data
    circles.exit().remove()
    circles
      .transition() // Transition from old to new
      .duration(1000) // Length of animation
      .each('start', function() {
        // Start animation
        d3
          .select(this) // 'this' means the current element
          .attr('fill', 'red') // Change color
          .attr('r', 8)
          .style('stroke', 'black')
          .style('stroke-width', 1) // Change size
      })
      .delay(function(d, i) {
        return i / component.props.data.length * 500 // Dynamic delay (i.e. each item delays a little longer)
      })
      //.ease('linear')  // Transition easing - default 'letiable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
      .attr('cx', function(d) {
        let firstValue
        for (let key in d) {
          firstValue = Object.keys(d[key])[0]
          return component.xScale(d[key][firstValue]) // Circle's
        }
      })
      .attr('cy', function(d) {
        let secondKey
        for (let key in d) {
          secondKey = Object.keys(d[key])[1]
          return component.yScale(d[key][secondKey])
        }
      })
      .each('end', function(d, i) {
        d3
          .select(this) // 'this' means the current element
          .transition()
          .duration(500)
          .attr('opacity', 1)
          .attr('fill', function() {
            return component.color(i)
          })
      })

    d3.select('.label1').text(this.props.perspective[1])

    d3.select('.label2').text(this.props.perspective[0])

    // Add legends
    let legendsGroup = d3.select('g.scatter-legend')
    let keysGroup = legendsGroup.selectAll('rect').data(this.state.data)
    let keys = keysGroup
      .enter()
      .append('rect')
      .attr('width', keySize)
      .attr('height', keySize)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', function(d, i) {
        return component.color(i)
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('opacity', 1)
      .attr('transform', function(d, i) {
        return 'translate(' + 170 * (i + 0) + ',0)'
      })

    keysGroup.exit().remove()

    let labelText = legendsGroup.selectAll('text').data(this.state.data)
    labelText.enter().append('text')

    labelText
      .attr('transform', function(d, i) {
        return 'translate(' + (170 * (i + 0) + (keySize + 1)) + ',' + (keySize / 2 + 5) + ')'
      })
      .text(function(d) {
        return Object.keys(d)[0]
      })

    labelText.exit().remove()

    // Update X Axis
    this.svg
      .select('.x.axis')
      .transition()
      .duration(1000)
      .call(this.xAxis)

    // Update Y Axis
    this.svg
      .select('.y.axis')
      .transition()
      .duration(1000)
      .call(this.yAxis)
  }

  render() {
    const { className, options, textOptions } = this.props
    const optionsList = options.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))

    return (
      <div>
        {textOptions && (
          <div className="scatter-inputs">
            <h5>Company Sentiment Comparison</h5>
            <div className="form-group group1">
              <label>y-axis</label>
              <select
                className="form-control"
                value={this.props.perspective[0]}
                onChange={e => {
                  const newPerspective = [e.target.value, this.props.perspective[1]]
                  this.props.handlePerspectiveChange(newPerspective)
                }}
              >
                <option selected="selected" disabled>
                  Please select
                </option>
                {optionsList}
              </select>
            </div>
            <div className="form-group group2">
              <label>x-axis</label>
              <select
                className="form-control"
                value={this.props.perspective[1]}
                onChange={e => {
                  const newPerspective = [this.props.perspective[0], e.target.value]
                  this.props.handlePerspectiveChange(newPerspective)
                }}
              >
                <option selected="selected" disabled>
                  Please select
                </option>
                {optionsList}
              </select>
            </div>
          </div>
        )}
        <svg className={className} />
      </div>
    )
  }
}
