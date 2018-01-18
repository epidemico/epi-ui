// @flow
import React, { PureComponent } from 'react'

type PropTypes = {
  query: string,
  selectedIndex: number,
  suggestions: Array<string>,
  handleClick: Function,
  handleHover: Function,
  minQueryLength: number,
  shouldRenderSuggestions?: Function,
  classNames: Object,
}

export default class Suggestions extends PureComponent<PropTypes> {
  markIt(input: string, query: string) {
    var escapedRegex = query.trim().replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
    var r = RegExp(escapedRegex, 'gi')
    return {
      __html: input.replace(r, '<mark>$&</mark>'),
    }
  }
  shouldRenderSuggestions(query: string) {
    let { minQueryLength } = this.props
    if (minQueryLength !== 0 && !minQueryLength) minQueryLength = 2
    return query.length > minQueryLength
  }
  render() {
    const {
      classNames,
      handleClick,
      handleHover,
      query,
      selectedIndex,
      shouldRenderSuggestions,
      suggestions: suggs,
    } = this.props

    var suggestions = suggs.map((string, i) => (
      <li
        key={i}
        onClick={handleClick.bind(null, i)}
        onMouseOver={handleHover.bind(null, i)}
        className={i == selectedIndex ? 'active' : ''}
      >
        <span dangerouslySetInnerHTML={this.markIt(string, query)} />
      </li>
    ))

    if (!suggestions.length) {
      return null
    } else if (
      shouldRenderSuggestions
        ? !shouldRenderSuggestions(query)
        : !this.shouldRenderSuggestions(query)
    ) {
      return null
    }
    return (
      <div className={classNames.suggestions}>
        <ul> {suggestions} </ul>
      </div>
    )
  }
}
