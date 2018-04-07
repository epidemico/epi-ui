// @flow
import React, { PureComponent } from 'react'
import d3 from 'd3'
import cloud from 'd3-cloud'

type Word = {
  text: string,
  size: number,
}

type PropTypes = {
  data: Array<Word>,
  height?: number,
  width?: number,
}

export default class WordCloud extends PureComponent<PropTypes> {
  // Must keep this synced with PropTypes above manually:
  static flowTypes = `{
  data: Array<{
    text: string,
    size: number,
  }>,
}`

  static defaultProps = {
    data: [],
    width: 640,
    height: 480,
  }

  fontSize: Function
  layout: Function

  componentDidMount() {
    var fill = d3.scale.category20b()
    var w = this.props.width,
      h = this.props.height
    var max
    this.fontSize = d3.scale['sqrt']().range([10, 100])
    this.layout = cloud()
      .timeInterval(Infinity)
      .size([w, h])
      .fontSize(d => {
        return this.fontSize(+d.size)
      })
      .text(function(d) {
        return d.text
      })
      .on('end', draw)
    var svg = d3
      .select('.word-cloud')
      .attr('width', w)
      .attr('height', h)
    var vis = svg.append('g').attr('transform', 'translate(' + [w >> 1, h >> 1].toString() + ')')
    function draw(data, bounds) {
      const scale = bounds
        ? Math.min(
            w / Math.abs(bounds[1].x - w / 2),
            w / Math.abs(bounds[0].x - w / 2),
            h / Math.abs(bounds[1].y - h / 2),
            h / Math.abs(bounds[0].y - h / 2)
          ) / 2
        : 1
      var text = vis.selectAll('text').data(data, function(d) {
        return ((d && d.text) || '').toLowerCase()
      })
      text
        .transition()
        .duration(1000)
        .attr('transform', function(d) {
          return 'translate(' + [d.x, d.y].toString() + ')rotate(' + d.rotate + ')'
        })
        .style('font-size', function(d) {
          return d.size + 'px'
        })
      text
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', function(d) {
          return 'translate(' + [d.x, d.y].toString() + ')rotate(' + d.rotate + ')'
        })
        .style('font-size', function(d) {
          return d.size + 'px'
        })
        .style('opacity', 1e-6)
        .transition()
        .duration(1000)
        .style('opacity', 1)
      text
        .style('font-family', function(d) {
          return d.font
        })
        .style('fill', function(d) {
          return fill(((d && d.text) || '').toLowerCase())
        })
        .text(function(d) {
          return d.text
        })
      text.exit().remove()
      vis.transition().attr('transform', 'translate(' + [w >> 1, h >> 1].toString() + ')scale(' + scale + ')')
    }
    this.renderVisuals()
  }

  componentDidUpdate() {
    this.renderVisuals()
  }

  renderVisuals() {
    const { data } = this.props
    this.layout.font('impact').spiral('archimedean')
    if (data.length) {
      this.fontSize.domain([+data[data.length - 1].size || 1, +data[0].size])
    }
    this.layout.words(data)
    this.layout.start()
  }

  render() {
    return <svg className="word-cloud" />
  }
}
