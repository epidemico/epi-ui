// @flow
import React, { PureComponent } from 'react'
import $ from 'jquery'

type PropTypes = {
  className: string,
  minMax: Array<number>,
  onChange: Function,
  range: Object,
}

export default class Slider extends PureComponent<PropTypes> {
  maxValue: Object
  minValue: Object
  sliderTarget: Object

  _handleAgeRangeChange(range: Object) {
    this.props.onChange(range)
  }

  componentDidMount() {
    const { className } = this.props
    this.sliderTarget = $('.' + className + '_date-range-slider')
    this.minValue = $('#min-value')
    this.maxValue = $('#max-value')

    this.minValue.val([this.props.range.min])
    this.maxValue.val([this.props.range.max])

    this.sliderTarget.noUiSlider(
      {
        connect: true,
        start: [this.props.range.min, this.props.range.max],
        range: {
          min: this.props.minMax[0],
          max: this.props.minMax[1],
        },
        step: 0.01,
      },
      true
    )

    this.sliderTarget.noUiSlider_pips({
      mode: 'values',
      values: [0, 20, 40, 60, 80, 100, 120],
      stepped: true,
    })

    var component = this

    this.sliderTarget.on('change', function(ev, sliderValues) {
      component._handleAgeRangeChange({
        min: parseFloat(sliderValues[0]),
        max: parseFloat(sliderValues[1]),
      })
    })
  }

  componentWillUnmount() {
    this.sliderTarget.off('change')
  }

  render() {
    const { className } = this.props

    if (this.sliderTarget) {
      this.sliderTarget.val([this.props.range.min, this.props.range.max])
      this.minValue.val([this.props.range.min])
      this.maxValue.val([this.props.range.max])
    }

    const min = parseFloat(this.props.range.min.toFixed(2))
    const max = parseFloat(this.props.range.max.toFixed(2))

    return (
      <div className={className + '_' + 'range-container'}>
        <div className={className + '_' + 'range-display-container'}>
          <div className={className + '_' + 'range-display range-display'}>
            <div className={className + '_' + 'range1 range1'}>{min}</div>
            <div className={className + '_' + 'range2 range2'}>{max}</div>
          </div>
        </div>
        <div className={className + '_' + 'slider-container'}>
          <div className="col-xs-12">
            <div className={className + '_' + 'date-range-slider'} />
          </div>
        </div>
      </div>
    )
  }
}
