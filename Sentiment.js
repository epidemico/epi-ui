// @flow
import React, { Component } from 'react'
import d3 from 'd3'
import { _ } from '/imports/fui'

type PropTypes = {
  data: Array<Object>,
  handlePerspectiveChange: Function,
  perspective: Array<Object>,
  options: Array<string>,
}

type StateTypes = {
  data: Array<Object>,
}

export default class Sentiment extends Component<PropTypes, StateTypes> {
  state = {
    data: [],
  }

  height: number
  leftGroup: Function
  margin: Object
  rightGroup: Function
  svg: Function
  width: number
  xAxis: Function
  xScale: Function
  yAxis: Function
  yScale: Function

  componentDidMount() {
    ;(this.margin = { top: 20, right: 10, bottom: 30, left: 10 }), (this.width = 800)
    this.height = 300

    this.svg = d3
      .select('.sentiment')
      .attr('width', this.width + this.margin.right + this.margin.left)
      .attr('height', this.height + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    this.xScale = d3.scale
      .linear()
      .domain([-1, 1])
      .range([0, this.width])

    this.yScale = d3.scale.ordinal().rangeRoundBands([0, this.height], 0.1)

    this.xAxis = d3.svg
      .axis()
      .scale(this.xScale)
      .tickValues([-1, 0, 1])
      .tickFormat(d3.format('.0f'))
      .orient('bottom')

    this.yAxis = d3.svg
      .axis()
      .scale(this.yScale)
      .orient('left')

    this.xScale = d3.scale
      .linear()
      .domain([-1, 1])
      .range([0, this.width])

    // labels
    this.svg
      .append('g')
      .attr('class', 'y axis sentiment-y')
      .attr('transform', 'translate(' + this.width / 2.2 + ', 0)') // Hide the path with css g.y.axis.sentiment-y path {display: none}

    this.leftGroup = this.svg
      .append('g')
      .attr('class', 'left')
      .attr('transform', 'translate(' + this.width / 2 + ', 0)')

    this.rightGroup = this.svg
      .append('g')
      .attr('class', 'right')
      .attr('transform', 'translate(0, 0)')

    this.renderVisuals()
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
    // Sort the data by advantage
    const sortedData = _.sortBy(this.state.data, d => {
      return _.reduce(
        d,
        (acc, value, key) => {
          _.each(value, (v, k) => {
            if (v > 0) {
              acc += v
            } else {
              acc -= v
            }
          })
          return acc
        },
        0
      )
    }).reverse()

    const company1 = d => {
      return _.first(
        _.map(d, (v, k) => {
          return v[this.props.perspective[1]]
        })
      )
    }
    const company2 = d => {
      return _.first(
        _.map(d, (v, k) => {
          return v[this.props.perspective[0]]
        })
      )
    }

    const labels = _.map(sortedData, (values, keys) => {
      return _.first(
        _.map(values, (v, k) => {
          return k
        })
      )
    })
    const getLabel = d => {
      return _.first(
        _.map(d, (v, k) => {
          return k
        })
      )
    }

    const getFill = value => {
      if (value > 0) {
        return 'rgba(39, 174, 96, 0.4)'
      } else if (value === 0) {
        return 'rgba(241, 196, 15, 0.4)'
      } else {
        return 'rgba(192, 57, 43, 0.4)'
      }
    }

    // this.svg.select('g.left').transition().duration(1000).attr('transform', 'translate('+this.width/2+','+this.yScale.rangeBand()+')')

    this.yScale.domain(labels)
    this.svg.select('.y.axis').call(this.yAxis)

    const leftMainRects = this.leftGroup.selectAll('rect.main-rect').data(sortedData)

    leftMainRects.exit().remove()
    leftMainRects
      .enter()
      .append('rect')
      .attr('class', 'main-rect')
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .attr('height', this.margin.top)
      .attr('fill', 'rgba(189, 195, 199, 0.5)')
      .attr('width', this.width / 3)

    // Update
    leftMainRects
      .transition()
      .duration(300)
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })

    const leftRects = this.leftGroup.selectAll('rect.rect').data(sortedData)
    leftRects.exit().remove()
    leftRects
      .enter()
      .append('rect')
      .attr('class', 'rect')
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .attr('fill', d => {
        return getFill(company1(d))
      })
      .attr('height', this.margin.top)
      .attr('width', d => {
        return this.xScale(company1(d)) / 3
      })

    //UPDATE
    leftRects
      .transition()
      .duration(300)
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .attr('fill', d => {
        return getFill(company1(d))
      })
      .attr('width', d => {
        return this.xScale(company1(d)) / 3
      })

    // Topic text
    const leftTopicText = this.leftGroup.selectAll('text.topic-text').data(sortedData)
    leftTopicText.exit().remove()
    leftTopicText
      .enter()
      .append('text')
      .attr('class', 'topic-text')
      .text(d => {
        return _.first(Object.keys(d))
      })
      .attr('y', d => {
        return this.yScale(getLabel(d)) + 15
      })
      .style('text-anchor', 'middle')
      .attr('x', -60)

    leftTopicText
      .transition()
      .duration(300)
      .text(d => {
        return _.first(Object.keys(d))
      })
      .attr('y', d => {
        return this.yScale(getLabel(d)) + 15
      })
      .style('text-anchor', 'middle')
      .attr('x', -60)
    // text value

    const leftText = this.leftGroup.selectAll('text.text').data(sortedData)
    leftText.exit().remove()
    leftText
      .enter()
      .append('text')
      .attr('class', 'text')
      .text(d => {
        return company1(d)
      })
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .style('text-anchor', 'middle')
      .attr('x', d => {
        return this.xScale(company1(d)) / 3
      })

    leftText
      .transition()
      .duration(300)
      .text(d => {
        return company1(d)
      })
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .style('text-anchor', 'middle')
      .attr('x', d => {
        return this.xScale(company1(d)) / 3
      })

    const rightMainRects = this.rightGroup.selectAll('rect.main-rect').data(sortedData)

    rightMainRects.exit().remove()
    rightMainRects
      .enter()
      .append('rect')
      .attr('class', 'main-rect')
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .attr('height', this.margin.top)
      .attr('fill', 'rgba(189, 195, 199, 0.5)')
      .attr('width', this.width / 3)

    rightMainRects
      .transition()
      .duration(300)
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })

    const rightRects = this.rightGroup.selectAll('rect.rect').data(sortedData)
    rightRects.exit().remove()
    rightRects
      .enter()
      .append('rect')
      .attr('class', 'rect')
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .attr('fill', d => {
        return getFill(company2(d))
      })
      .attr('height', this.margin.top)
      .attr('width', d => {
        return this.xScale(company2(d)) / 3
      })

    //UPDATE
    rightRects
      .transition()
      .duration(300)
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .attr('fill', d => {
        return getFill(company2(d))
      })
      .attr('width', d => {
        return this.xScale(company2(d)) / 3
      })
    // text value
    // text value
    const rightText = this.rightGroup.selectAll('text.text').data(sortedData)
    rightText.exit().remove()
    rightText
      .enter()
      .append('text')
      .attr('class', 'text')
      .text(d => {
        return company2(d)
      })
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .style('text-anchor', 'middle')
      .attr('x', d => {
        return this.xScale(company2(d)) / 3
      })

    rightText
      .transition()
      .duration(300)
      .text(d => {
        return company2(d)
      })
      .attr('y', d => {
        return this.yScale(getLabel(d))
      })
      .style('text-anchor', 'middle')
      .attr('x', d => {
        return this.xScale(company2(d)) / 3
      })
  }
  render() {
    const { options } = this.props
    const optionsList = options.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))
    return (
      <div className="sentiment-container">
        {this.state.data.length > 0 && (
          <div className="competitive-advantage">
            <div className="arrow1">
              <img src="/img/arrow-up.png" />
              <p>Higher advantage</p>
            </div>
            <div className="arrow2">
              <img src="/img/arrow-down.png" />
              <p>Lower advantage</p>
            </div>
          </div>
        )}
        <h5>Company Sentiment Comparison</h5>
        <div className="scatter-inputs">
          <div className="form-group group1">
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
          <div>
            <p />
          </div>
          <div className="form-group group2">
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
        <svg className="sentiment" />
      </div>
    )
  }
}
