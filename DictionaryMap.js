// @flow
import React, { Component } from 'react'
import update from 'immutability-helper'
import InputTags from '/imports/epi-ui/InputTags'
import SvgIcon from '/imports/epi-ui/SvgIcon'
import { _, $ } from '/imports/fui'

const emptyTag = { id: '', text: '' }

type PropTypes = {
  // Left (dictionary key)
  placeholder: string,
  suggestions: Array<string>,
  minQueryLength: number,
  handleFilterSuggestions: Function,

  // Right (dictionary value)
  rplaceholder: string,
  rsuggestions: Array<string>,
  rminQueryLength: number,
  rhandleFilterSuggestions: Function,

  // DictionaryMap options
  allowEmpty: boolean,
  autofocus: boolean,
  inline: boolean,
  mappings: Array<Object>,
  onChange: Function,
  oneDimensional: boolean,
  rAllowEmpty: boolean,
  resuggestLeft: boolean,
}

type StateTypes = {
  leftEntered: boolean,
  leftValue: Object,
  mappings: Array<Object>,
}

export default class DictionaryMap extends Component<PropTypes, StateTypes> {
  static defaultProps = {
    inline: true,
    mappings: [],
    oneDimensional: false,
    resuggestLeft: false,
  }

  defaultState = {
    leftEntered: false,
    leftValue: emptyTag,
    mappings: [],
  }

  _leftInput: ?React.Component<*>
  _rightInput: ?React.Component<*>

  constructor(props: PropTypes) {
    super(props)
    const { oneDimensional } = props

    this.state = {
      ...this.defaultState,
      mappings: props.mappings
        .filter(_.identity)
        .filter(mapping => (oneDimensional ? mapping.text : mapping[0].text || mapping[1].text)),
    }
  }

  componentWillMount() {
    this.props.onChange(this.props.mappings)
  }

  componentWillReceiveProps(props: PropTypes) {
    const { oneDimensional } = props
    if (JSON.stringify(this.state.mappings) !== JSON.stringify(props.mappings)) {
      this.setState({
        ...this.defaultState,
        mappings: props.mappings
          .filter(_.identity)
          .filter(mapping => (oneDimensional ? mapping.text : mapping[0].text || mapping[1].text)),
      })
    }
  }

  componentWillUpdate(nextProps: PropTypes, nextState: StateTypes) {
    if (JSON.stringify(this.state.mappings) !== JSON.stringify(nextState.mappings)) {
      this.props.onChange(nextState.mappings)
    }
  }

  addMapping(leftOrRight: string, callback: Function, text: string) {
    const { oneDimensional, resuggestLeft } = this.props
    const leftEntered = this.state.leftEntered || leftOrRight === 'l' || oneDimensional
    const flowComplete = (this.state.leftEntered && leftOrRight === 'r') || oneDimensional
    const leftValue = (leftOrRight === 'l' && { text }) || this.state.leftValue
    const rightValue = (leftOrRight === 'r' && { text }) || emptyTag

    const completeAndReset = flowComplete /*&& !resuggestLeft*/ || oneDimensional

    const addedDuplicateItem = oneDimensional
      ? this.state.mappings.find(map => map.text == leftValue.text)
      : this.state.mappings.find(
          map => map[0].text == leftValue.text && map[1].text == rightValue.text
        )

    const addedEmpty = oneDimensional ? !leftValue.text : !leftValue.text && !rightValue.text

    if (
      flowComplete &&
      // Return if the flow is complete AND
      (addedEmpty || // We've added two empty items
        addedDuplicateItem) // We've added a duplicate item
    ) {
      if (resuggestLeft && !addedEmpty) {
        return
      } else {
        return this.goBack(true)
      }
    }

    const pushedMapping = oneDimensional ? leftValue : [leftValue, rightValue]

    this.setState(
      update(this.state, {
        leftEntered: { $set: completeAndReset ? false : leftEntered },
        leftValue: { $set: completeAndReset ? emptyTag : leftValue },
        mappings: flowComplete ? { $push: [pushedMapping] } : { $set: this.state.mappings },
      }),
      () => {
        const input = completeAndReset || oneDimensional ? this._leftInput : this._rightInput
        input && input.refs && input.refs.input && input.refs.input.focus()
      }
    )
  }

  removeMapping(index: number) {
    this.setState(
      update(this.state, {
        mappings: { $splice: [[index, 1]] },
      })
    )
  }

  goBack(nextTabInput: boolean = false) {
    this.setState(
      {
        ...this.state,
        leftEntered: false,
      },
      () => {
        let tabInput = this._leftInput && this._leftInput.refs && this._leftInput.refs.input
        if (nextTabInput) {
          let foundNext = false
          let next = false
          $('input, select, textarea').each((i, el) => {
            if (foundNext) return
            if (next) {
              tabInput = el
              foundNext = true
            }
            next = el === tabInput
          })
        }
        if (tabInput) tabInput.focus()
      }
    )
  }

  render() {
    const { leftEntered } = this.state
    const {
      oneDimensional,
      inline,
      autofocus = false,
      allowEmpty = true,
      rAllowEmpty = true,
    } = this.props

    const propNames = 'placeholder, suggestions, minQueryLength, handleFilterSuggestions'.split(
      ', '
    )
    const lProps = _.pick(this.props, propNames)
    const rProps = _.extend(
      ..._.chain(this.props)
        .pick(propNames.map(p => 'r' + p))
        .map((value, key) => ({ [key.replace(/^r/, '')]: value }))
        .value()
    )

    // Deletes are no-ops as we use goBack and state.
    lProps.handleDelete = () => {}
    if (_.size(rProps)) {
      rProps.handleDelete = () => {}
    }

    const StaticLabel = props => (
      <div className="ReactTags__tagsd">
        <div className="ReactTags__selected">
          <div className="ReactTags__tagInput">
            <input type="text" value={props.text} readOnly disabled />
          </div>
        </div>
      </div>
    )

    return (
      <div className="dictionary-map">
        {this.state.mappings.map((mapping, i) => (
          <div key={i} className="row">
            <div className="dictionary-map-col">
              <StaticLabel {...(oneDimensional ? mapping : mapping[0])} />
              {!oneDimensional && <SvgIcon icon="Arrow" size={0.7} label="resulted in" hideLabel />}
            </div>
            <div className="dictionary-map-col">
              {!oneDimensional && <StaticLabel {...mapping[1]} />}
              <div onClick={this.removeMapping.bind(this, i)}>
                <button className="btn btn-round-xs btn-danger">
                  <SvgIcon icon="Minus" size={0.6} label="Remove" hideLabel />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="row">
          <div className="dictionary-map-col">
            {this.state.leftEntered ? (
              <StaticLabel {...this.state.leftValue} />
            ) : (
              <InputTags
                {...lProps}
                allowEmpty={allowEmpty}
                autocomplete
                autofocus={autofocus}
                handleAddition={this.addMapping.bind(this, 'l', lProps.handleAddition)}
                ref={ref => (this._leftInput = ref)}
              />
            )}
            <SvgIcon icon="Arrow" size={0.7} label="resulted in" hideLabel />
          </div>
          {!oneDimensional && (
            <div className="dictionary-map-col">
              {this.state.leftEntered && (
                <InputTags
                  {...rProps}
                  allowEmpty={rAllowEmpty}
                  autocomplete
                  handleAddition={this.addMapping.bind(this, 'r', rProps.handleAddition)}
                  handleDelete={this.goBack.bind(this)}
                  ref={ref => (this._rightInput = ref)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}
