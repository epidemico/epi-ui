// @flow
import React, { PureComponent } from 'react'
import d3 from 'd3'
import { map } from 'underscore'

type PropTypes = {
  data: Array<Object>,
}

export default class DonutChart extends PureComponent<PropTypes> {
  _current: Function
  arc: Function
  arcTween: Function
  color = d3.scale.category20()
  height = 300
  pie = d3.layout.pie().sort(null)
  radius = Math.min(300, 300) / 2
  svg: Function
  tweenDuration = 750
  width = 300

  componentDidMount() {
    this.arc = d3.svg
      .arc()
      .innerRadius(this.radius - 100)
      .outerRadius(this.radius - 50)

    this.arcTween = a => {
      let i = d3.interpolate(this._current, a)
      this._current = i(0)
      return t => {
        return this.arc(i(t))
      }
    }

    this.svg = d3
      .select('.pie-chart')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')
  }

  shouldComponentUpdate(nextProps: PropTypes) {
    return JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data)
  }

  componentWillUpdate(nextProps: PropTypes) {
    const data = this.pie(map(nextProps.data, (value, key) => value))

    const paths = this.svg.selectAll('path').data(data)
    paths
      .exit()
      .transition()
      .ease('elastic')
      .duration(this.tweenDuration)
      .attrTween('d', this.arcTween)
      .remove()
    paths
      .enter()
      .append('path')
      .attr('fill', (d, i) => {
        return this.color(i)
      })
      .attr('d', this.arc)
    // UPDATE paths
    this.svg
      .selectAll('path')
      .transition()
      .ease('elastic')
      .duration(this.tweenDuration)
      .attrTween('d', this.arcTween)
      .attr('fill', (d, i) => {
        return this.color(i)
      })
      .attr('d', this.arc)

    const texts = this.svg.selectAll('text.text').data(data)

    texts.exit().remove()
    texts
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'text')
      .attr('x', d => {
        var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2
        d.cx = Math.cos(a) * (this.radius - 75)
        return (d.x = Math.cos(a) * (this.radius - 20))
      })
      .attr('y', d => {
        var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2
        d.cy = Math.sin(a) * (this.radius - 75)
        return (d.y = Math.sin(a) * (this.radius - 20))
      })
      .text(d => {
        return d.value
      })
      .each(function(d) {
        var bbox = this.getBBox()
        d.sx = d.x - bbox.width / 2 - 2
        d.ox = d.x + bbox.width / 2 + 2
        d.sy = d.oy = d.y + 5
      })

    // UPDATE texts
    this.svg
      .selectAll('text.text')
      .transition()
      .ease('elastic')
      .duration(this.tweenDuration)
      .attr('x', d => {
        var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2
        d.cx = Math.cos(a) * (this.radius - 75)
        return (d.x = Math.cos(a) * (this.radius - 20))
      })
      .attr('y', d => {
        var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2
        d.cy = Math.sin(a) * (this.radius - 75)
        return (d.y = Math.sin(a) * (this.radius - 20))
      })
      .text(d => {
        return d.value
      })
      .each(function(d) {
        var bbox = this.getBBox()
        d.sx = d.x - bbox.width / 2 - 2
        d.ox = d.x + bbox.width / 2 + 2
        d.sy = d.oy = d.y + 5
      })

    // this.svg.append("defs").append("marker")
    //     .attr("id", "circ")
    //     .attr("markerWidth", 6)
    //     .attr("markerHeight", 6)
    //     .attr("refX", 3)
    //     .attr("refY", 3)
    //     .append("circle")
    //     .attr("cx", 3)
    //     .attr("cy", 3)
    //     .attr("r", 3)

    const markers = this.svg.selectAll('path.pointer').data(data)

    markers.exit().remove()
    markers
      .enter()
      .append('path')
      .attr('class', 'pointer')
      .style('fill', 'none')
      .style('stroke', 'black')
      .attr('d', d => {
        if (d.cx > d.ox) {
          return 'M' + d.sx + ',' + d.sy + 'L' + d.ox + ',' + d.oy + ' ' + d.cx + ',' + d.cy
        } else {
          return 'M' + d.ox + ',' + d.oy + 'L' + d.sx + ',' + d.sy + ' ' + d.cx + ',' + d.cy
        }
      })
    // UPDATE markers
    this.svg
      .selectAll('path.pointer')
      .transition()
      .ease('elastic')
      .duration(this.tweenDuration)
      .attr('d', d => {
        if (d.cx > d.ox) {
          return 'M' + d.sx + ',' + d.sy + 'L' + d.ox + ',' + d.oy + ' ' + d.cx + ',' + d.cy
        } else {
          return 'M' + d.ox + ',' + d.oy + 'L' + d.sx + ',' + d.sy + ' ' + d.cx + ',' + d.cy
        }
      })
  }
  render() {
    return <svg className="pie-chart" />
  }
}
