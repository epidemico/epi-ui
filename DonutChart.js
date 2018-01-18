// @flow
import * as React from 'react'
import d3 from 'd3'
import _ from 'underscore'

type PropTypes = {
  className: string,
  color: Array<string>,
  data: Object,
  label: string,
}

type StateTypes = {
  data: Object,
  label: string,
}

export default class DonutChart extends React.Component<PropTypes, StateTypes> {
  static defaultProps = {
    color: [
      '#e67e22',
      '#32abe3',
      '#ff984d',
      '#73bf67',
      '#fc5454',
      '#b26fd4',
      '#937443',
      '#eb95da',
      '#8a8989',
      '#66cdcc',
    ],
  }

  state = {
    data: {},
    label: '',
  }

  margins = { top: 30, right: 30, bottom: 30, left: 80 }
  width = 550
  height = 500
  tweenDuration = 750
  textOffset = 14
  donut = d3.layout.pie()
  r = Math.min(this.width, this.height) / 3.5
  arc = d3.svg
    .arc()
    .innerRadius(this.r - 70)
    .outerRadius(this.r - 20)

  _current: any
  landuseSvg: any
  landuse_center_group: any
  arcTween = (a: any) => {
    let i = d3.interpolate(this._current, a)
    this._current = i(0)
    return (t: any) => {
      return this.arc(i(t))
    }
  }

  componentDidMount() {
    const { className } = this.props
    this.landuseSvg = d3
      .select('.' + className)
      .attr('width', this.width)
      .attr('height', this.height)

    this.landuseSvg
      .append('svg:g')
      .attr('class', className + '_' + 'arcGrp')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')

    this.landuseSvg
      .append('svg:g')
      .attr('class', className + '_' + 'lblGroup')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')

    // GROUP FOR CENTER TEXT
    this.landuse_center_group = this.landuseSvg
      .append('svg:g')
      .attr('class', className + '_' + 'ctrGroup')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')
    // // CENTER LABEL
    this.landuse_center_group
      .append('svg:text')
      .attr('dy', '.35em')
      .attr('class', className + '_' + 'chartLabel')
      .attr('text-anchor', 'middle')

    this.renderVisuals()
  }

  componentWillReceiveProps(nextProps: PropTypes) {
    if (
      JSON.stringify(this.state.data) !== JSON.stringify(nextProps.data) ||
      this.state.label !== nextProps.label
    ) {
      this.setState({
        data: nextProps.data,
        label: nextProps.label,
      })
    }
  }

  shouldComponentUpdate(nextProps: PropTypes) {
    return (
      JSON.stringify(this.state.data) !== JSON.stringify(nextProps.data) ||
      this.state.label !== nextProps.label
    )
  }

  componentDidUpdate() {
    this.renderVisuals()
  }

  renderVisuals() {
    const { className } = this.props
    // Store the currently-displayed angles in this._current.
    // Then, interpolate from this._current to the new angles.
    let pct = []
    let labels = []
    let buildLabels = () => {
      for (let key in this.state.data) {
        pct.push(this.state.data[key])
        labels.push(key)
      }
      buildVisuals()
    }

    let buildVisuals = () => {
      const landuse_pieLabel = d3.select('.' + className + '_' + 'chartLabel')
      landuse_pieLabel.text(labels.length > 0 ? this.state.label : '')
      // DRAW ARC PATHS
      const landuse_arc_grp = d3.select('.' + className + '_' + 'arcGrp')
      const arcs = landuse_arc_grp.selectAll('path').data(this.donut(pct))
      arcs
        .enter()
        .append('svg:path')
        .attr('stroke', 'white')
        .attr('stroke-width', 0.5)
        .attr('fill', (d, i) => {
          if (!Array.isArray(this.props.color)) {
            return this.props.color[_.invert(this.props.data)[d.data]]
          } else {
            return this.props.color[i]
          }
        })
        .attr('d', this.arc)
        .each(d => {
          this._current = d
        })

      arcs
        .transition()
        .ease('elastic')
        .duration(this.tweenDuration)
        .attrTween('d', this.arcTween)
        .attr('fill', (d, i) => {
          if (!Array.isArray(this.props.color)) {
            return this.props.color[_.invert(this.props.data)[d.data]]
          } else {
            return this.props.color[i]
          }
        })
      arcs
        .exit()
        .transition()
        .ease('elastic')
        .duration(this.tweenDuration)
        .attrTween('d', this.arcTween)
        .remove()

      // DRAW SLICE LABELS
      const landuse_label_group = d3.select('.' + className + '_' + 'lblGroup')
      const sliceLabel = landuse_label_group.selectAll('text').data(this.donut(pct))
      sliceLabel
        .enter()
        .append('svg:text')
        .attr('transform', d => {
          if (d.data < 5) {
            return (
              'translate(' +
              Math.cos((d.startAngle + d.endAngle - Math.PI) / 2) * (this.r + this.textOffset) +
              ',' +
              Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (this.r + this.textOffset) +
              ')rotate(40)'
            )
          } else {
            return (
              'translate(' +
              Math.cos((d.startAngle + d.endAngle - Math.PI) / 2) * (this.r + this.textOffset) +
              ',' +
              Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (this.r + this.textOffset) +
              ')'
            )
          }
        })
        .attr('class', className + '_' + 'label-text')
        .attr('dy', d => {
          if (d.data < 2) {
            return -10
          }
          if (
            d.data < 5 ||
            ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 &&
              (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5)
          ) {
            return 5
          } else {
            return -7
          }
        })
        .attr('text-anchor', d => {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return 'beginning'
          } else {
            return 'end'
          }
        })
        .text((d, i) => {
          return labels[i]
        })

      // Re-locate the label group for more than one item
      if (
        this.state.label &&
        this.state.label.split('+') &&
        this.state.label.split('+').length > 2
      ) {
        d3
          .select('.' + className + '_' + 'ctrGroup')
          .attr('transform', 'translate(' + this.width / 2 + ',' + (this.height / 2 + 200) + ')')
      } else {
        d3
          .select('.' + className + '_' + 'ctrGroup')
          .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')
      }
      sliceLabel
        .transition()
        .ease('elastic')
        .duration(this.tweenDuration)
        .attr('transform', d => {
          if (d.data < 5) {
            return (
              'translate(' +
              Math.cos((d.startAngle + d.endAngle - Math.PI) / 2) * (this.r + this.textOffset) +
              ',' +
              Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (this.r + this.textOffset) +
              ')rotate(40)'
            )
          } else {
            return (
              'translate(' +
              Math.cos((d.startAngle + d.endAngle - Math.PI) / 2) * (this.r + this.textOffset) +
              ',' +
              Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (this.r + this.textOffset) +
              ')'
            )
          }
        })
        .attr('dy', d => {
          if (d.data < 2) {
            return -10
          }
          if (
            d.data < 5 ||
            ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 &&
              (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5)
          ) {
            return 5
          } else {
            return -7
          }
        })
        .attr('text-anchor', d => {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return 'beginning'
          } else {
            return 'end'
          }
        })
        .text((d, i) => {
          return labels[i] + ' (' + pct[i] + '%' + ')'
        })

      sliceLabel.exit().remove()

      let lines = landuse_label_group.selectAll('line').data(this.donut(pct))
      lines
        .enter()
        .append('svg:line')
        .attr('transform', d => {
          return 'translate(' + this.arc.centroid(d) + ')'
        })
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('stroke', 'black')
        .attr('y1', -this.r - 5)
        .attr('y2', -this.r + 18)
        .attr('transform', d => {
          return 'rotate(' + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ')'
        })

      lines
        .transition()
        .ease('elastic')
        .duration(this.tweenDuration)
        .attr('transform', function(d) {
          return 'rotate(' + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ')'
        })

      lines.exit().remove()
    }

    buildLabels()
  }

  render() {
    const { className, data } = this.props
    return (
      <div>
        {_.size(data) === 0 && <div className="no-data-msg">No {className} data found</div>}
        <svg className={className} />
      </div>
    )
  }
}
