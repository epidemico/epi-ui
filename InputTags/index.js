// @flow
import React, { Component } from 'react'
import Tag from './Tag'
import Suggestions from './Suggestions'
import { errlog, toastr } from '/imports/fui'
import { PATH_SEPARATOR } from '/imports/constants'

type TagType = {
  isValid: boolean,
  text: string,
}

type PropTypes = {
  allowDeleteFromEmptyInput: boolean,
  allowEmpty: boolean,
  autocomplete: boolean,
  autofocus: boolean,
  classNames?: Object,
  delimeters: Array<number>,
  disabled: boolean,
  handleAddition: Function, // required
  handleDelete: Function, // required
  handleFilterSuggestions: Function,
  handleInputChange?: Function,
  inline: boolean,
  labelField?: string,
  minQueryLength: number,
  placeholder: string,
  readOnly: boolean,
  removeComponent?: Function,
  shouldRenderSuggestions?: Function,
  suggestions: Array<string>,
  tags: Array<TagType>,
  tagsBelow: boolean,
}

type StateTypes = {
  classNames: Object,
  suggestions: Array<string>,
  query: string,
  selectedIndex: number,
  selectionMode: boolean,
  isFetching: boolean,
}

const Keys = {
  ENTER: 13,
  TAB: 9,
  BACKSPACE: 8,
  UP_ARROW: 38,
  DOWN_ARROW: 40,
  ESCAPE: 27,
}

const defaultClassNames = {
  tags: 'ReactTags__tags',
  tagError: 'tag-error',
  tagInput: 'ReactTags__tagInput',
  inputElement: '',
  selected: 'ReactTags__selected',
  tag: 'ReactTags__tag',
  remove: 'ReactTags__remove',
  suggestions: 'ReactTags__suggestions',
}

export default class InputTags extends Component<PropTypes, StateTypes> {
  static defaultProps = {
    allowEmpty: false,
    allowDeleteFromEmptyInput: true,
    autocomplete: false,
    autofocus: true,
    delimeters: [Keys.ENTER, Keys.TAB],
    disabled: false,
    inline: true,
    minQueryLength: 2,
    placeholder: 'Add new tag',
    readOnly: false,
    suggestions: [],
    tags: [],
    tagsBelow: false,
  }

  state = {
    classNames: {},
    isFetching: false,
    query: '',
    selectedIndex: -1,
    selectionMode: false,
    suggestions: [],
  }

  willUnmount = false

  constructor(props: PropTypes) {
    super(props)
    this.state.suggestions = props.suggestions
    this.state.classNames = Object.assign({}, defaultClassNames, props.classNames)
  }

  componentDidMount() {
    if (this.props.autofocus && !this.props.readOnly) {
      this.refs.input.focus()
    }
  }

  componentWillReceiveProps(props: PropTypes) {
    this.filteredSuggestions(this.state.query, props.suggestions, suggestions => {
      this.setState({
        suggestions,
        classNames: Object.assign({}, defaultClassNames, props.classNames),
      })
    })
  }

  componentWillUnmount() {
    this.willUnmount = true
  }

  filteredSuggestions(query: string, suggestions: Array<string>, cb: Function) {
    const filteredSuggestions = suggestions.filter(function(item) {
      return item.toLowerCase().indexOf(query.toLowerCase()) === 0
    })

    if (this.props.handleFilterSuggestions) {
      const fetchingReturned = setTimeout(() => this.setState(() => ({ isFetching: true })), 500)
      this.props.handleFilterSuggestions(query, filteredSuggestions, data => {
        clearTimeout(fetchingReturned)
        if (this.willUnmount) return
        this.setState(() => ({ isFetching: false }))
        cb(data)
      })
    } else {
      return cb(filteredSuggestions)
    }
  }

  handleDelete(i: number) {
    this.props.handleDelete(i)
    this.setState({ query: '' })
  }

  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const query = e.currentTarget.value.trim()
    if (this.props.handleInputChange) this.props.handleInputChange(query)
    this.filteredSuggestions(query, this.props.suggestions, data => {
      this.setState({
        query,
        suggestions: data,
      })
    })
  }

  handleKeyDown = (e: any) => {
    var { query, selectedIndex, suggestions } = this.state
    const { allowEmpty } = this.props

    // hide suggestions menu on escape
    if (e.keyCode === Keys.ESCAPE) {
      e.preventDefault()
      this.setState({
        selectedIndex: -1,
        selectionMode: false,
        suggestions: [],
      })
    }
    // When one of the terminating keys is pressed, add current query to the tags.
    // If no text is typed in so far, ignore the action - so we don't end up with a terminating
    // character typed in.
    if (this.props.delimeters.indexOf(e.keyCode) !== -1) {
      if (
        allowEmpty ||
        ((e.keyCode !== Keys.TAB || query !== '') && e.hasOwnProperty('preventDefault'))
      ) {
        e.preventDefault()
      }
      if (allowEmpty || query !== '') {
        if (this.state.selectionMode) {
          query = this.state.suggestions[this.state.selectedIndex]
        }
        this.addTag(query, allowEmpty, e.keyCode, e.skipFocus)
      }
    }
    // when backspace key is pressed and query is blank, delete tag
    if (e.keyCode === Keys.BACKSPACE && query == '' && this.props.allowDeleteFromEmptyInput) {
      this.handleDelete(this.props.tags.length - 1)
    }
    // up arrow
    if (e.keyCode === Keys.UP_ARROW) {
      e.preventDefault()
      var selectedIndex = this.state.selectedIndex
      // last item, cycle to the top
      if (selectedIndex <= 0) {
        this.setState({
          selectedIndex: this.state.suggestions.length - 1,
          selectionMode: true,
        })
      } else {
        this.setState({
          selectedIndex: selectedIndex - 1,
          selectionMode: true,
        })
      }
    }
    // down arrow
    if (e.keyCode === Keys.DOWN_ARROW) {
      e.preventDefault()
      this.setState({
        selectedIndex: (this.state.selectedIndex + 1) % suggestions.length,
        selectionMode: true,
      })
    }
  }

  addTag(tag: string, allowEmpty?: boolean, keyCode?: number, skipFocus?: boolean) {
    const add = tag => {
      // call method to add
      this.props.handleAddition(tag)
      // reset the state
      if (this.willUnmount) return
      this.setState({
        query: '',
        selectionMode: false,
        selectedIndex: -1,
      })
      // focus back on the input box
      const { input } = this.refs
      input.value = ''
      if (!skipFocus) {
        input.focus()
      }
    }

    if (this.props.autocomplete) {
      if (allowEmpty && tag == '') {
        return add(tag)
      }
      // Asynchronously add tag
      this.filteredSuggestions(tag, this.props.suggestions, possibleMatches => {
        if (this.props.autocomplete) {
          if (tag && possibleMatches.length && !possibleMatches.includes(tag)) {
            // It's possible that there's an error in the ElasticSearch and/or taxonomy.
            // Try to remedy this by removing the tag's last path.
            const didYouMean = tag.slice(0, tag.lastIndexOf(PATH_SEPARATOR))
            if (possibleMatches.includes(didYouMean)) {
              tag = didYouMean
              errlog(`Remedied ElasticSearch/taxonomy term, path: ${tag}`)
            } else if (keyCode !== Keys.TAB) {
              errlog(`Error with ElasticSearch/taxonomy term, path: ${tag}`)
              toastr.error(
                `Sorry, there was an error adding this tag. Please report this to the development team.<br><b>${tag}</b>`
              )
            }
          }
          if (possibleMatches.includes(tag)) {
            add(tag)
          }
        }
      })
    } else {
      // Synchronously add tag
      add(tag)
    }
  }

  handleSuggestionHover = (i: number) => this.setState({ selectedIndex: i, selectionMode: true })
  handleSuggestionClick = (i: number) => this.addTag(this.state.suggestions[i])

  render() {
    var tagItems = this.props.tags.map((tag, i) => (
      <Tag
        key={i}
        tag={tag}
        isValid={tag.isValid}
        labelField={this.props.labelField}
        onDelete={() => this.handleDelete(i)}
        removeComponent={this.props.removeComponent}
        readOnly={this.props.readOnly}
        classNames={this.state.classNames}
      />
    ))
    // get the suggestions for the given query
    var query = this.state.query.trim(),
      selectedIndex = this.state.selectedIndex,
      suggestions = this.state.suggestions,
      placeholder = this.props.placeholder
    const tagInput = !this.props.readOnly ? (
      <div className={this.state.classNames.tagInput}>
        <input
          ref="input"
          type="text"
          className={
            this.state.classNames.inputElement + (this.state.isFetching ? ' inputtag-loading' : '')
          }
          disabled={this.props.disabled}
          placeholder={placeholder}
          aria-label={placeholder}
          onBlur={() =>
            this.handleKeyDown(
              Object.assign({}, new KeyboardEvent('keyDown'), {
                keyCode: this.props.delimeters[0],
                skipFocus: true,
              })
            )
          }
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
        {query &&
          query.length > this.props.minQueryLength && (
            <Suggestions
              query={query}
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              handleClick={this.handleSuggestionClick}
              handleHover={this.handleSuggestionHover}
              minQueryLength={this.props.minQueryLength}
              shouldRenderSuggestions={this.props.shouldRenderSuggestions}
              classNames={this.state.classNames}
            />
          )}
      </div>
    ) : null
    return (
      <div className={this.state.classNames.tags}>
        <div className={this.state.classNames.selected}>
          {!this.props.tagsBelow && tagItems}
          {this.props.inline && tagInput}
          {this.props.tagsBelow && tagItems}
        </div>
        {!this.props.inline && tagInput}
      </div>
    )
  }
}
