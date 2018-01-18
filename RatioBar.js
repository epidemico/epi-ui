import React, { PureComponent } from 'react'
import { pluck } from 'underscore'
import d3 from 'd3'

type PropTypes = {
  className: string,
  colors: Array<string>,
  data: Array<Object>,
  margins: Object,
}

export default class RatioBar extends PureComponent<PropTypes> {
  static defaultProps = {
    className: 'ratio-bar',
    colors: ['#b9dfb3', '#dddddd'],
    margins: { top: 30, right: 30, bottom: 30, left: 30 },
  }

  statics = {}

  componentWillMount() {
    const { margins, colors } = this.props

    this.statics.margins = margins
    this.statics.width = 560 - this.statics.margins.left - this.statics.margins.right
    this.statics.height = 350 - this.statics.margins.top - this.statics.margins.bottom

    this.statics.color = d3.scale.ordinal().range(colors)

    this.statics.scales = {
      x: d3.scale.ordinal().rangeRoundBands([0, this.statics.width], 0.1),

      y: d3.scale.linear().rangeRound([this.statics.height, 0]),
    }
  }

  componentDidMount() {
    const { className } = this.props
    d3.selectAll('.infographic-wrapper' + className).attr('height', 50)

    svg = d3
      .select('.infoGraphic_' + className)
      .attr(
        'width',
        this.statics.width - 300 + this.statics.margins.left + this.statics.margins.right
      )
      .attr(
        'height',
        this.statics.height - 235 + this.statics.margins.top + this.statics.margins.bottom
      )

    d3.select('line').style('stroke', 'black')

    d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
  }

  renderVisuals(data) {
    const { className } = this.props

    if (data !== null) {
      var svg = d3.select('.infoGraphic_' + className)

      var tooltip = d3.select('.tooltip')

      this.statics.color.domain(pluck(data, 'field'))

      var bucket, d, i, len, vals, y0, benchmarkLine

      for (i = 0, len = data.length; i < len; i++) {
        d = data[i]
        y0 = 0
        d.values = this.statics.color.domain().map(function(name) {
          var arrayIndex
          arrayIndex = lodash.findIndex(d.records, { field: name })
          return {
            name: name,
            y0: y0,
            y1: (y0 += +d.records[arrayIndex].percentage),
            value: d.records[arrayIndex].percentage,
          }
        })
        d.total = d.values[d.values.length - 1].y1
      }

      this.statics.scales.x.domain(
        data
          .map(function(d) {
            return d.bucket
          })
          .sort()
      )
      this.statics.scales.y.domain([
        0,
        d3.max(data, function(d) {
          return d.total
        }),
      ])

      var component = this

      bucket = svg.selectAll('.bucket').data(data)
      bucket
        .enter()
        .append('g')
        .attr('class', 'bucket')

      bucket.attr('transform', function(d) {
        return 'translate(' + (component.statics.scales.x(d.bucket) + 248) + ', 20)rotate(90)'
      })

      vals = bucket.selectAll('rect').data(function(d) {
        return d.values
      })

      vals
        .enter()
        .append('rect')
        .attr('fill', function(d) {
          return component.statics.color(d.name)
        })
        .attr('class', 'infoGraphic-rect')
        .attr('opacity', 1)

      vals
        .attr('width', this.statics.scales.x.rangeBand() - 380)
        .attr('y', function(d) {
          return component.statics.scales.y(d.y1)
        })
        .attr('height', function(d) {
          return component.statics.scales.y(d.y0) - component.statics.scales.y(d.y1)
        })

      // X values should be dynamic
      benchmarkLine = d3.selectAll('.benchmark-line_' + className).data(data)

      benchmarkLine.enter()

      benchmarkLine
        .attr('x1', function(d) {
          return d.benchmark * 3
        })
        .attr('y1', 20)
        .attr('x2', function(d) {
          return d.benchmark * 3
        })
        .attr('y2', 50)
        .style('stroke-dasharray', '3, 3')
        .style('stroke-width', '2px')
        .style('stroke', '#ffffff')

      return vals
        .exit()
        .transition()
        .delay(2000)
        .remove()
    }
  }

  render() {
    const { data, className } = this.props
    this.renderVisuals(data)
    return (
      <div>
        <svg className={'infographic-wrapper ' + className}>
          <g className={'infoGraphic_' + className} />
        </svg>
      </div>
    )
  }
}
